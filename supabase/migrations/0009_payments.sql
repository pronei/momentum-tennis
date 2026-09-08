-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0009: payments (phase 5)
--
-- 0001 carries the SHAPE of money — products, orders, order_items, stripe_events,
-- the append-only credit_ledger and issue_credits as the one issuance path — but
-- no way to move an order through its life. This migration adds that, and nothing
-- else:
--
--   • the catalogue Artur specified (two class packs), as reference data with
--     fixed ids, so every environment shares them and /admin/products edits them;
--   • create_order — a guardian's intent, priced by the DATABASE from the
--     catalogue, never from the form;
--   • settle_order — money confirmed → credits, exactly once: keyed on the order
--     item, so a replayed webhook or a second settlement cannot issue twice;
--   • cancel_order — an abandoned or failed checkout; nothing was issued, so
--     nothing reverses;
--   • refund_order — money went back (Stripe said so) → the credits come back
--     too, as refund rows, and only for a pack nobody has drawn on.
--
-- The family-facing function checks its caller; the settlement functions accept
-- only the service role (no user) or an admin. Append-only: never edit this file
-- once applied — add 0010.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────── catalogue ─────────────────────────
-- Stripe price ids stay null: they differ per Stripe account and are entered in the console.
insert into products (id, kind, name, description, price_public_cents, currency,
                      credit_kind, credit_quantity, credit_validity_days, forgiven_skips)
values
  ('00000000-0000-4000-8000-000000000501', 'class_pack', 'Weekday classes',
   '10 class credits, Monday to Friday. Valid 12 weeks from purchase; one skipped week forgiven.',
   50000, 'usd', 'class_weekday', 10, 84, 1),
  ('00000000-0000-4000-8000-000000000502', 'class_pack', 'Weekend classes',
   '10 class credits, Saturday and Sunday. Valid 12 weeks from purchase; one skipped week forgiven.',
   70000, 'usd', 'class_weekend', 10, 84, 1)
on conflict (id) do nothing;

-- ───────────────────────────── create_order ──────────────────────
create function public.create_order(p_product uuid, p_player uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_p products%rowtype; v_price int; v_order uuid;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  -- the beneficiary is a named player the caller guards AND may see money for: a minor's own
  -- restricted login guards itself, but can_view_financials says no (G)
  if not guards(p_player) or not can_view_financials(p_player) then
    raise exception 'not_authorized';
  end if;
  select * into v_p from products where id = p_product;
  if not found then raise exception 'unknown_product'; end if;
  if not v_p.active then raise exception 'product_inactive'; end if;
  if v_p.kind not in ('class_pack', 'lesson_pack') then raise exception 'unsupported_product'; end if;
  -- a signed-in guardian is a member; the member price applies whenever the catalogue has one
  v_price := coalesce(v_p.price_member_cents, v_p.price_public_cents);
  insert into orders (account_id, amount_total_cents, currency)
    values (v_account, v_price, v_p.currency) returning id into v_order;
  insert into order_items (order_id, product_id, player_id, quantity, unit_amount_cents)
    values (v_order, p_product, p_player, 1, v_price);
  return v_order;
end $$;

-- ───────────────────────────── settle_order ──────────────────────
create function public.settle_order(p_order uuid, p_payment_intent text default null,
                                    p_checkout_session text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype; v_i record; v_issued int := 0;
begin
  if auth.uid() is not null and not is_admin() then raise exception 'admin_only'; end if;
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  if v_o.status = 'cancelled' then raise exception 'order_not_pending'; end if;
  if v_o.status = 'pending' then
    update orders
       set status = 'paid', paid_at = now(),
           stripe_payment_intent_id   = coalesce(p_payment_intent, stripe_payment_intent_id),
           stripe_checkout_session_id = coalesce(p_checkout_session, stripe_checkout_session_id)
     where id = p_order;
  end if;
  -- keyed on the ORDER ITEM: a replayed event, a second settle, or a run that died half-way
  -- issues nothing twice — issue_credits returns null when the key already exists
  for v_i in
    select oi.id, oi.player_id, oi.product_id, oi.quantity, p.credit_kind, p.credit_quantity
      from order_items oi join products p on p.id = oi.product_id
     where oi.order_id = p_order and p.kind in ('class_pack', 'lesson_pack')
  loop
    if issue_credits(v_i.player_id, v_i.credit_kind, v_i.credit_quantity * v_i.quantity,
                     'purchase:order_item:' || v_i.id, v_i.product_id, v_i.id,
                     p_payment_intent, null) is not null then
      v_issued := v_issued + 1;
    end if;
  end loop;
  return jsonb_build_object('status', 'paid', 'issued', v_issued);
end $$;

-- ───────────────────────────── cancel_order ──────────────────────
create function public.cancel_order(p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype;
begin
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  -- the buyer may abandon their own checkout; an admin or the service role may expire anyone's
  if auth.uid() is not null and v_o.account_id <> auth.uid() and not is_admin() then
    raise exception 'not_authorized';
  end if;
  if v_o.status = 'cancelled' then return; end if;
  if v_o.status <> 'pending' then raise exception 'order_not_pending'; end if;
  update orders set status = 'cancelled' where id = p_order;
end $$;

-- ───────────────────────────── refund_order ──────────────────────
-- Policy (phase 5, until Artur states a rule): a pack refunds in full only while nobody has
-- drawn on it. A pack with a consumed or expired credit is a manual matter — an adjust row
-- and a dashboard refund — never a computed guess here.
create function public.refund_order(p_order uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype; v_lot record; v_reversed int := 0;
begin
  if auth.uid() is not null and not is_admin() then raise exception 'admin_only'; end if;
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  if v_o.status = 'refunded' then return jsonb_build_object('status', 'refunded', 'reversed', 0); end if;
  if v_o.status <> 'paid' then raise exception 'order_not_paid'; end if;
  for v_lot in
    select r.lot_id, r.player_id, r.credit_kind, r.issued, r.remaining
      from v_lot_remaining r
      join credit_ledger l on l.id = r.lot_id
     where l.order_item_id in (select id from order_items where order_id = p_order)
  loop
    if v_lot.remaining <> v_lot.issued then raise exception 'credits_already_used'; end if;
    insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id,
                               idempotency_key, reason, created_by)
    values (v_lot.player_id, 'refund', -v_lot.remaining, v_lot.credit_kind, v_lot.lot_id,
            'refund:lot:' || v_lot.lot_id, coalesce(p_reason, 'order refunded'), auth.uid())
    on conflict (idempotency_key) do nothing;
    v_reversed := v_reversed + 1;
  end loop;
  update orders set status = 'refunded' where id = p_order;
  return jsonb_build_object('status', 'refunded', 'reversed', v_reversed);
end $$;

-- ───────────────────────────── grants ────────────────────────────
-- 0001's blanket revoke covered only the functions that existed then; a new function is
-- created with EXECUTE for PUBLIC, so each one is revoked and granted here explicitly.
revoke execute on function public.create_order(uuid, uuid)          from public, anon;
grant  execute on function public.create_order(uuid, uuid)          to authenticated;
revoke execute on function public.settle_order(uuid, text, text)    from public, anon;
grant  execute on function public.settle_order(uuid, text, text)    to authenticated, service_role;
revoke execute on function public.cancel_order(uuid)                from public, anon;
grant  execute on function public.cancel_order(uuid)                to authenticated, service_role;
revoke execute on function public.refund_order(uuid, text)          from public, anon;
grant  execute on function public.refund_order(uuid, text)          to authenticated, service_role;
