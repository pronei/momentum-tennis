/* @ds-bundle: {"format":4,"namespace":"MomentumTennisDesignSystem_0ea6ac","components":[{"name":"DataTable","sourcePath":"components/admin/DataTable.jsx"},{"name":"RatingMeter","sourcePath":"components/admin/RatingMeter.jsx"},{"name":"FrameTicks","sourcePath":"components/brand/FrameTicks.jsx"},{"name":"StrobeArc","sourcePath":"components/brand/StrobeArc.jsx"},{"name":"Wordmark","sourcePath":"components/brand/Wordmark.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"TextField","sourcePath":"components/core/TextField.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Pagination","sourcePath":"components/feedback/Pagination.jsx"},{"name":"StatusChip","sourcePath":"components/feedback/StatusChip.jsx"},{"name":"Tabs","sourcePath":"components/feedback/Tabs.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"DateField","sourcePath":"components/forms/DateField.jsx"},{"name":"FormSection","sourcePath":"components/forms/FormSection.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextArea","sourcePath":"components/forms/TextArea.jsx"},{"name":"TimeField","sourcePath":"components/forms/TimeField.jsx"},{"name":"PhotoFrame","sourcePath":"components/media/PhotoFrame.jsx"},{"name":"ResourceDayView","sourcePath":"components/schedule/ResourceDayView.jsx"},{"name":"SessionForm","sourcePath":"components/schedule/SessionForm.jsx"},{"name":"CampTimeline","sourcePath":"components/site/CampTimeline.jsx"},{"name":"ClassTimeline","sourcePath":"components/site/ClassTimeline.jsx"},{"name":"CourtMeter","sourcePath":"components/site/CourtMeter.jsx"},{"name":"ProgramCard","sourcePath":"components/site/ProgramCard.jsx"},{"name":"SiteNav","sourcePath":"components/site/SiteNav.jsx"}],"sourceHashes":{"components/admin/DataTable.jsx":"e6050cf12046","components/admin/RatingMeter.jsx":"d40bf8367579","components/brand/FrameTicks.jsx":"2ebc9d7d281c","components/brand/StrobeArc.jsx":"2310ddf05709","components/brand/Wordmark.jsx":"40f577696479","components/core/Button.jsx":"aa39ab6b1835","components/core/Eyebrow.jsx":"9755a531438e","components/core/TextField.jsx":"322f2a238c46","components/feedback/Banner.jsx":"45324e583413","components/feedback/Dialog.jsx":"a9f06231d896","components/feedback/EmptyState.jsx":"e6f8a341071f","components/feedback/Pagination.jsx":"1089aad3c150","components/feedback/StatusChip.jsx":"e91f1878339c","components/feedback/Tabs.jsx":"ed37df1473d8","components/feedback/Toast.jsx":"e6ee65eab950","components/forms/Checkbox.jsx":"7541e298a306","components/forms/DateField.jsx":"206c94035320","components/forms/FormSection.jsx":"a073edad0209","components/forms/SegmentedControl.jsx":"6ff95c40d58a","components/forms/Select.jsx":"8ef49787c313","components/forms/TextArea.jsx":"8e4e7ed33778","components/forms/TimeField.jsx":"8c6a3121cd3f","components/media/PhotoFrame.jsx":"ac953a832a95","components/schedule/ResourceDayView.jsx":"3d3fb1be3cc7","components/schedule/SessionForm.jsx":"c11322dc0cca","components/site/CampTimeline.jsx":"2ae772d9b356","components/site/ClassTimeline.jsx":"2c53545e3fa1","components/site/CourtMeter.jsx":"81e146d1ada8","components/site/ProgramCard.jsx":"87ce14303c0b","components/site/SiteNav.jsx":"b1e142ae7710","ui_kits/admin/admin.jsx":"fce9813a5563","ui_kits/admin/adminTabs.jsx":"84c216000c12","ui_kits/combined/portal-combined.jsx":"6238556124c4","ui_kits/combined/sections-combined.jsx":"3d928fa9f22d","ui_kits/portal/portal-flows.jsx":"6ee5ef77f68b","ui_kits/portal/portal-standalone.jsx":"1b5cc630c092","ui_kits/portal/portal.jsx":"efccdccb1502","ui_kits/website/sections.jsx":"97f61e0124d9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MomentumTennisDesignSystem_0ea6ac = window.MomentumTennisDesignSystem_0ea6ac || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/admin/RatingMeter.jsx
try { (() => {
const h = React.createElement;
const RAMP = ['var(--court-100,#DCE6EE)', 'var(--court-200,#A9BDC9)', 'var(--court-300,#7FA3C4)', 'var(--court-400,#3E6C99)', 'var(--court-700,#24466B)'];

/* CourtMeter generalized to N dimensions: one row per dimension — caps label (+ INTERNAL tag),
   segments (climbed cool / current amber / ahead empty), always-visible mono value "3 OF 5",
   optional trend annotation. The text value is the accessibility guarantee — never color alone.
   interactive mode turns segments into 44px-tall input buttons (coach rating entry). */
function RatingMeter({
  dimensions = [],
  max = 5,
  tone = 'light',
  interactive = false,
  onChange,
  style
}) {
  const field = tone === 'field';
  const segRow = (d, di) => {
    const v = Math.max(0, Math.min(max, d.value || 0));
    return h('div', {
      key: di,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, h('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, h('span', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10
      }
    }, h('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-label-sm,.75rem)',
        fontWeight: 700,
        letterSpacing: 'var(--track-label,.107em)',
        textTransform: 'uppercase',
        color: field ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--text-secondary,#46525E)'
      }
    }, d.label), d.internal && h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        letterSpacing: '0.08em',
        padding: '2px 6px',
        border: '1px solid ' + (field ? 'var(--border-on-field,rgba(247,247,247,0.24))' : 'var(--border-hairline,rgba(27,27,27,0.16))'),
        color: field ? 'var(--court-300,#7FA3C4)' : 'var(--court-400,#3E6C99)'
      }
    }, 'INTERNAL')), h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.05em',
        color: field ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--text-secondary,#46525E)'
      }
    }, v + ' OF ' + max, d.trend ? h('span', {
      style: {
        color: field ? 'var(--amber-300,#F2C377)' : 'var(--accent-present-hover,#C77F14)',
        marginLeft: 10
      }
    }, d.trend) : null)), h('div', {
      role: interactive ? 'group' : 'meter',
      'aria-label': d.label + (interactive ? '' : ': ' + v + ' of ' + max),
      'aria-valuemin': interactive ? undefined : 1,
      'aria-valuemax': interactive ? undefined : max,
      'aria-valuenow': interactive ? undefined : v,
      style: {
        display: 'flex',
        gap: 6
      }
    }, Array.from({
      length: max
    }, (_, i) => {
      const n = i + 1;
      const bg = n < v ? RAMP[Math.min(RAMP.length - 1, i)] : n === v ? 'var(--now,#E8A33D)' : 'transparent';
      const border = n > v ? '1px solid ' + (field ? 'var(--border-on-field,rgba(247,247,247,0.24))' : 'var(--border-hairline,rgba(27,27,27,0.16))') : '1px solid transparent';
      if (!interactive) return h('div', {
        key: i,
        style: {
          flex: 1,
          height: 16,
          background: bg,
          border,
          boxSizing: 'border-box',
          transition: 'background var(--dur-base,200ms) var(--ease-out,ease)'
        }
      });
      return h('button', {
        key: i,
        type: 'button',
        'aria-label': d.label + ': set ' + n + ' of ' + max,
        'aria-pressed': n === v,
        onClick: () => onChange && onChange(di, n),
        style: {
          flex: 1,
          height: 44,
          minWidth: 44,
          background: bg,
          border: n > v ? border : '1px solid transparent',
          boxSizing: 'border-box',
          cursor: 'pointer',
          borderRadius: 0,
          padding: 0,
          transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)'
        }
      });
    })), d.note && h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.05em',
        color: field ? 'var(--court-300,#7FA3C4)' : 'var(--text-secondary,#46525E)'
      }
    }, d.note));
  };
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      ...style
    }
  }, dimensions.map(segRow));
}
Object.assign(__ds_scope, { RatingMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/RatingMeter.jsx", error: String((e && e.message) || e) }); }

// components/brand/FrameTicks.jsx
try { (() => {
/* Micro-device derived from the strobe: a row of frames, the active one warm. List marker, divider, loading state. */
function FrameTicks({
  count = 5,
  size = 8,
  gap = 5,
  tone = 'light',
  active = 'last',
  loading = false,
  style
}) {
  const cool = tone === 'field' ? ['#3E6C99', '#5B84AC', '#7FA3C4', '#A9BDC9'] : ['#DCE6EE', '#A9BDC9', '#7FA3C4', '#3E6C99'];
  const activeIdx = active === 'none' ? -1 : active === 'last' ? count - 1 : active;
  if (typeof document !== 'undefined' && !document.getElementById('mt-ticks-kf')) {
    const s = document.createElement('style');
    s.id = 'mt-ticks-kf';
    s.textContent = '@keyframes mt-tick-cycle{0%,25%{background:#E8A33D}30%,100%{background:#A9BDC9}}';
    document.head.appendChild(s);
  }
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      gap,
      alignItems: 'center',
      ...style
    },
    'aria-hidden': !loading,
    role: loading ? 'status' : undefined,
    'aria-label': loading ? 'Loading' : undefined
  }, Array.from({
    length: count
  }, (_, i) => React.createElement('span', {
    key: i,
    style: {
      width: size,
      height: size,
      display: 'inline-block',
      background: i === activeIdx && !loading ? 'var(--now,#E8A33D)' : cool[Math.min(cool.length - 1, Math.floor(i / count * cool.length))],
      animation: loading ? `mt-tick-cycle ${count * 0.32}s ${i * 0.32}s infinite` : undefined
    }
  })));
}
Object.assign(__ds_scope, { FrameTicks });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/FrameTicks.jsx", error: String((e && e.message) || e) }); }

// components/brand/StrobeArc.jsx
try { (() => {
/* The signature: stroboscopic bounce — motion as frozen instants. Ghost frames cool, present frame warm. */
function StrobeArc({
  frames = 8,
  tone = 'light',
  showPath = true,
  annotate = false,
  ballRadius = 7,
  width = '100%',
  height,
  style
}) {
  const W = 640,
    H = 200,
    pad = 16,
    ground = H - 16;
  const bounces = [{
    x0: 0,
    x1: 0.46,
    peak: 0.8
  }, {
    x0: 0.46,
    x1: 0.78,
    peak: 0.44
  }, {
    x0: 0.78,
    x1: 1.001,
    peak: 0.21
  }];
  const yAt = t => {
    const b = bounces.find(b => t >= b.x0 && t < b.x1) || bounces[2];
    const u = (t - b.x0) / (b.x1 - b.x0);
    return ground - 4 * u * (1 - u) * b.peak * (ground - 14);
  };
  const xAt = t => pad + t * (W - 2 * pad);
  const n = Math.max(3, frames);
  const pts = Array.from({
    length: n
  }, (_, i) => {
    const t = i / (n - 1);
    return {
      x: xAt(t),
      y: yAt(t)
    };
  });
  const cool = tone === 'field' ? ['#3E6C99', '#5B84AC', '#7FA3C4', '#A9BDC9', '#DCE6EE'] : ['#DCE6EE', '#A9BDC9', '#7FA3C4', '#3E6C99', '#2B5680'];
  const colorAt = i => i === n - 1 ? 'var(--now,#E8A33D)' : cool[Math.min(cool.length - 1, Math.floor(i / (n - 1) * cool.length))];
  const dense = Array.from({
    length: 81
  }, (_, i) => {
    const t = i / 80;
    return `${xAt(t).toFixed(1)},${yAt(t).toFixed(1)}`;
  }).join(' ');
  const lineCol = tone === 'field' ? 'rgba(247,247,247,0.28)' : 'rgba(27,27,27,0.22)';
  return React.createElement('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width,
    height,
    style: {
      display: 'block',
      ...style
    },
    role: 'img',
    'aria-label': 'Ball trajectory rendered as a stroboscopic sequence: past frames cool blue, the present frame warm amber'
  }, showPath && React.createElement('polyline', {
    points: dense,
    fill: 'none',
    stroke: lineCol,
    strokeWidth: 1,
    strokeDasharray: '1 5'
  }), showPath && React.createElement('line', {
    x1: pad,
    y1: ground + ballRadius + 2,
    x2: W - pad,
    y2: ground + ballRadius + 2,
    stroke: lineCol,
    strokeWidth: 1
  }), pts.map((p, i) => React.createElement('circle', {
    key: i,
    cx: p.x,
    cy: p.y,
    r: i === n - 1 ? ballRadius + 1 : ballRadius,
    fill: colorAt(i)
  })), annotate && pts.map((p, i) => React.createElement('text', {
    key: 't' + i,
    x: p.x,
    y: ground + ballRadius + 16,
    textAnchor: 'middle',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fill: tone === 'field' ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--text-secondary,#46525E)'
  }, i === n - 1 ? 't0' : `t\u2212${n - 1 - i}`)));
}
Object.assign(__ds_scope, { StrobeArc });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/StrobeArc.jsx", error: String((e && e.message) || e) }); }

// components/brand/Wordmark.jsx
try { (() => {
/* Wordmark: MOMENTUM in Chivo Black; the full stop is the ball — two cool ghost frames settle into the warm present. */
function Wordmark({
  variant = 'lockup',
  height = 44,
  onField = false,
  style
}) {
  const ink = onField ? 'var(--line-white,#F7F7F7)' : 'var(--ink,#1B1B1B)';
  const sub = onField ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--ink-secondary,#46525E)';
  const trail = em => React.createElement('span', {
    style: {
      position: 'relative',
      display: 'inline-block',
      width: '0.62em',
      height: '0.72em',
      flex: 'none'
    },
    'aria-hidden': true
  }, height >= 30 && React.createElement('span', {
    style: {
      position: 'absolute',
      left: 0,
      bottom: '0.40em',
      width: '0.13em',
      height: '0.13em',
      borderRadius: '50%',
      background: 'var(--ghost-2,#A9BDC9)'
    }
  }), height >= 30 && React.createElement('span', {
    style: {
      position: 'absolute',
      left: '0.19em',
      bottom: '0.16em',
      width: '0.13em',
      height: '0.13em',
      borderRadius: '50%',
      background: 'var(--ghost-3,#7FA3C4)'
    }
  }), React.createElement('span', {
    style: {
      position: 'absolute',
      left: '0.42em',
      bottom: 0,
      width: '0.15em',
      height: '0.15em',
      borderRadius: '50%',
      background: 'var(--now,#E8A33D)'
    }
  }));
  if (variant === 'mark') {
    return React.createElement('span', {
      style: {
        position: 'relative',
        display: 'inline-block',
        width: height,
        height: height * 0.72,
        ...style
      },
      role: 'img',
      'aria-label': 'Momentum Tennis'
    }, React.createElement('span', {
      style: {
        position: 'absolute',
        left: 0,
        bottom: '56%',
        width: '22%',
        height: '30.5%',
        borderRadius: '50%',
        background: 'var(--ghost-2,#A9BDC9)'
      }
    }), React.createElement('span', {
      style: {
        position: 'absolute',
        left: '31%',
        bottom: '22%',
        width: '22%',
        height: '30.5%',
        borderRadius: '50%',
        background: 'var(--ghost-3,#7FA3C4)'
      }
    }), React.createElement('span', {
      style: {
        position: 'absolute',
        left: '66%',
        bottom: 0,
        width: '24.5%',
        height: '34%',
        borderRadius: '50%',
        background: 'var(--now,#E8A33D)'
      }
    }));
  }
  const word = React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: height,
      lineHeight: 1,
      letterSpacing: '0.01em',
      color: ink,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, variant === 'word' ? 'MOMENTUM\u00A0TENNIS' : 'MOMENTUM', trail());
  if (variant === 'word') return React.createElement('span', {
    style: {
      display: 'inline-block',
      ...style
    }
  }, word);
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: Math.max(3, height * 0.14),
      ...style
    }
  }, word, React.createElement('span', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: Math.max(9, height * 0.252),
      lineHeight: 1,
      color: sub,
      textTransform: 'uppercase'
    },
    'aria-hidden': true
  }, 'TENNIS'.split('').map((c, i) => React.createElement('span', {
    key: i
  }, c))), React.createElement('span', {
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)'
    }
  }, 'Momentum Tennis'));
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-btn-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-btn-styles';
  s.textContent = `
.mt-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:var(--size-action,48px);padding:0 28px;border-radius:var(--radius-action,999px);font-family:var(--font-sans);font-size:var(--size-label,.8125rem);font-weight:700;letter-spacing:var(--track-label,.107em);text-transform:uppercase;text-decoration:none;cursor:pointer;border:1.5px solid transparent;transition:background var(--dur-fast,120ms) var(--ease-out),color var(--dur-fast,120ms) var(--ease-out),border-color var(--dur-fast,120ms) var(--ease-out),transform var(--dur-fast,120ms) var(--ease-out);-webkit-tap-highlight-color:transparent;box-sizing:border-box}
.mt-btn:active{transform:translateY(1px)}
.mt-btn--sm{height:var(--size-action-sm,36px);padding:0 20px;font-size:var(--size-label-sm,.75rem)}
.mt-btn--primary{background:var(--accent-present,#E8A33D);color:var(--ink,#1B1B1B);border-color:var(--accent-present,#E8A33D)}
.mt-btn--primary:hover{background:var(--accent-present-hover,#C77F14);border-color:var(--accent-present-hover,#C77F14)}
.mt-btn--secondary{background:transparent;color:var(--ink,#1B1B1B);border-color:var(--ink,#1B1B1B)}
.mt-btn--secondary:hover{background:var(--ink,#1B1B1B);color:var(--line-white,#F7F7F7)}
.mt-btn--secondary.mt-btn--field{color:var(--line-white,#F7F7F7);border-color:var(--line-white,#F7F7F7)}
.mt-btn--secondary.mt-btn--field:hover{background:var(--line-white,#F7F7F7);color:var(--court-800,#1C3655)}
.mt-btn--ghost{background:transparent;color:var(--ink,#1B1B1B);border-color:transparent;padding:0 8px}
.mt-btn--ghost:hover{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px;text-decoration-color:var(--court-500,#2B5680)}
.mt-btn--ghost.mt-btn--field{color:var(--line-white,#F7F7F7)}
.mt-btn--ghost.mt-btn--field:hover{text-decoration-color:var(--now,#E8A33D)}
.mt-btn--field:focus-visible{outline-color:var(--focus-on-dark,#E8A33D)}
.mt-btn[disabled],.mt-btn--disabled{opacity:.45;pointer-events:none}`;
  document.head.appendChild(s);
}

/* Actions are pills — the path a circle sweeps through time. One radius for actions; everything else square. */
function Button({
  variant = 'primary',
  size = 'md',
  onField = false,
  href,
  onClick,
  disabled = false,
  type = 'button',
  children,
  style
}) {
  ensureStyles();
  const cls = ['mt-btn', `mt-btn--${variant}`, size === 'sm' ? 'mt-btn--sm' : '', onField ? 'mt-btn--field' : '', disabled && href ? 'mt-btn--disabled' : ''].filter(Boolean).join(' ');
  if (href) return React.createElement('a', {
    href,
    className: cls,
    onClick,
    style,
    'aria-disabled': disabled || undefined
  }, children);
  return React.createElement('button', {
    type,
    className: cls,
    onClick,
    disabled,
    style
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
/* The speaking voice: uppercase, 13px, 0.107em. Optionally led by frame ticks. */
function Eyebrow({
  children,
  onField = false,
  ticks = false,
  style
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label,.8125rem)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label,.107em)',
      textTransform: 'uppercase',
      color: onField ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--court-500,#2B5680)',
      ...style
    }
  }, ticks && React.createElement(__ds_scope.FrameTicks, {
    size: 7,
    tone: onField ? 'field' : 'light'
  }), React.createElement('span', null, children));
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/TextField.jsx
try { (() => {
const {
  useRef,
  useState,
  useEffect
} = React;
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-field-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-field-styles';
  s.textContent = `
.mt-field-input{width:100%;box-sizing:border-box;height:48px;padding:0 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;color:var(--ink,#1B1B1B);transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-field-input::placeholder{color:var(--court-300,#7FA3C4)}
.mt-field-input:hover{border-color:var(--court-300,#7FA3C4)}
.mt-field-input:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-field-input.mt-ball{caret-color:transparent}
@keyframes mt-ball-bounce{0%{width:2px;height:18px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,0);animation-timing-function:cubic-bezier(0.2,0,0.4,1)}30%{width:2px;height:16px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,-12px);animation-timing-function:linear}44%{width:7px;height:7px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,-14px);animation-timing-function:cubic-bezier(0.55,0,1,0.7)}70%{width:7px;height:7px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,0);animation-timing-function:ease-out}76%{width:9px;height:6px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,1px);animation-timing-function:cubic-bezier(0.2,0,0.3,1)}90%,100%{width:2px;height:18px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,0)}}`;
  document.head.appendChild(s);
}
const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Text input whose caret is a tennis ball bouncing on the baseline — the blink, replayed as motion. */
function TextField({
  label,
  help,
  error,
  placeholder,
  type = 'text',
  defaultValue,
  value,
  onChange,
  name,
  ballCaret = true,
  disabled = false,
  style,
  inputStyle
}) {
  ensureStyles();
  const ref = useRef(null);
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mtf' + Math.random().toString(36).slice(2, 7);
  const [caret, setCaret] = useState({
    x: 14,
    on: false
  });
  const useBall = ballCaret && !reduced();
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    if (!measure.c) measure.c = document.createElement('canvas');
    const ctx = measure.c.getContext('2d');
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const pos = el.selectionDirection === 'backward' ? el.selectionStart : el.selectionEnd ?? el.value.length;
    const w = ctx.measureText(el.value.slice(0, pos)).width;
    const x = parseFloat(cs.paddingLeft) + w - el.scrollLeft;
    setCaret(c => ({
      ...c,
      x: Math.max(6, Math.min(x, el.clientWidth - 8))
    }));
  };
  useEffect(() => {
    if (caret.on) measure();
  }, [value]);
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label,.8125rem)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label,.107em)',
      textTransform: 'uppercase',
      color: 'var(--text-secondary,#46525E)'
    }
  }, label), React.createElement('span', {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, React.createElement('input', {
    ref,
    type,
    name,
    placeholder,
    defaultValue,
    value,
    onChange,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': help || error ? [help ? ids.current + '-help' : null, error ? ids.current + '-err' : null].filter(Boolean).join(' ') : undefined,
    className: 'mt-field-input' + (useBall ? ' mt-ball' : ''),
    style: error ? {
      borderColor: 'var(--state-error,#A8432D)',
      ...inputStyle
    } : inputStyle,
    onFocus: () => {
      setCaret(c => ({
        ...c,
        on: true
      }));
      requestAnimationFrame(measure);
    },
    onBlur: () => setCaret(c => ({
      ...c,
      on: false
    })),
    onInput: measure,
    onSelect: measure,
    onKeyUp: measure,
    onClick: measure
  }), useBall && caret.on && !disabled && React.createElement('span', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      left: caret.x,
      bottom: 14,
      width: 2,
      height: 18,
      borderRadius: 1,
      background: 'var(--ink,#1B1B1B)',
      pointerEvents: 'none',
      animation: 'mt-ball-bounce 1.3s infinite'
    }
  })), help && React.createElement('span', {
    id: ids.current + '-help',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.04em',
      color: 'var(--text-secondary,#46525E)'
    }
  }, help), error && React.createElement('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.04em',
      color: 'var(--state-error,#A8432D)',
      textTransform: 'uppercase'
    }
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextField.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
const h = React.createElement;

/* Inline square hairline strip with a mono prefix (ERROR: / NOTE:) — form-level and page-level states.
   Errors are dual-channel by construction: the color AND the prefix. */
function Banner({
  tone = 'note',
  children,
  action,
  onField = false,
  style
}) {
  const err = tone === 'error';
  return h('div', {
    role: err ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      padding: '12px 16px',
      background: onField ? 'transparent' : 'var(--white,#fff)',
      border: '1px solid ' + (err ? 'var(--state-error,#A8432D)' : onField ? 'var(--border-on-field,rgba(247,247,247,0.24))' : 'var(--border-hairline,rgba(27,27,27,0.16))'),
      ...style
    }
  }, h('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.6,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: err ? 'var(--state-error,#A8432D)' : onField ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--text-secondary,#46525E)'
    }
  }, h('b', {
    style: {
      fontWeight: 600
    }
  }, err ? 'ERROR: ' : 'NOTE: '), children), action && h('span', {
    style: {
      flex: 'none'
    }
  }, action));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
const {
  useEffect,
  useRef,
  useState
} = React;
const h = React.createElement;
function useMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches);
  useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}

/* Modal: desktop = centered square card on the court-navy 55% backdrop; ≤760px = the bottom-sheet pattern.
   Focus trap, Esc, × close. Confirm: max ONE amber action per dialog; destructive confirms use a
   secondary outlined button with --state-error text + a mono consequence line — amber never confirms deletion. */
function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  consequence,
  width = 520,
  label,
  style
}) {
  const m = useMobile();
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      if (panel.current) {
        const f = panel.current.querySelector('a,button,input,select,textarea,[tabindex]');
        (f || panel.current).focus();
      }
    }, 0);
    const key = e => {
      if (e.key === 'Escape') {
        onClose && onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', key);
      prevFocus && prevFocus.focus && prevFocus.focus();
    };
  }, [open]);
  if (!open) return null;
  const sheet = m;
  return h(React.Fragment, null, h('div', {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(18,37,59,0.55)',
      zIndex: 50
    }
  }), h('div', {
    ref: panel,
    role: 'dialog',
    'aria-modal': true,
    'aria-label': label || title,
    tabIndex: -1,
    style: sheet ? {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 51,
      background: 'var(--white,#fff)',
      borderTop: '2px solid var(--ink,#1B1B1B)',
      maxHeight: '72vh',
      overflowY: 'auto',
      padding: '16px 16px calc(24px + env(safe-area-inset-bottom))',
      outline: 'none',
      ...style
    } : {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      zIndex: 51,
      background: 'var(--white,#fff)',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      width: 'min(' + width + 'px, calc(100vw - 48px))',
      maxHeight: '80vh',
      overflowY: 'auto',
      padding: 24,
      boxSizing: 'border-box',
      outline: 'none',
      ...style
    }
  }, h('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 14
    }
  }, title ? h('h2', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.375rem',
      lineHeight: 1.1,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink,#1B1B1B)'
    }
  }, title) : h('span'), onClose && h('button', {
    onClick: onClose,
    'aria-label': 'Close',
    style: {
      width: 44,
      height: 44,
      margin: '-10px -12px 0 0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '1.25rem',
      color: 'var(--ink,#1B1B1B)'
    }
  }, '\u00D7')), children, consequence && h('div', {
    style: {
      marginTop: 16,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.6,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--state-error,#A8432D)'
    }
  }, consequence), actions && h('div', {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      marginTop: 20
    }
  }, actions)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
const h = React.createElement;

/* The mono-line empty convention codified (NO SESSIONS — COURTS REST ON WED & FRI). */
function EmptyState({
  children,
  ticks = false,
  action,
  style
}) {
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      padding: '40px 24px',
      textAlign: 'center',
      ...style
    }
  }, ticks && h(__ds_scope.FrameTicks, {
    active: 'none'
  }), h('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.7,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary,#46525E)',
      maxWidth: '44ch'
    }
  }, children), action && h('div', null, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Pagination.jsx
try { (() => {
const h = React.createElement;
const pad = n => String(n).padStart(2, '0');

/* Mono 01 / 04 with typographic ghost prev/next. */
function Pagination({
  page = 1,
  pages = 1,
  onChange,
  style
}) {
  const btn = (dir, lab, disabled) => h('button', {
    type: 'button',
    'aria-label': lab,
    disabled,
    onClick: () => onChange && onChange(page + dir),
    style: {
      width: 44,
      height: 44,
      background: 'none',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.9375rem',
      color: 'var(--ink,#1B1B1B)',
      borderRadius: 0
    }
  }, dir < 0 ? '\u2190' : '\u2192');
  return h('nav', {
    'aria-label': 'Pagination',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...style
    }
  }, btn(-1, 'Previous page', page <= 1), h('span', {
    'aria-live': 'polite',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.07em',
      color: 'var(--text-secondary,#46525E)'
    }
  }, pad(page) + ' / ' + pad(pages)), btn(1, 'Next page', page >= pages));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/admin/DataTable.jsx
try { (() => {
const {
  useState,
  useEffect
} = React;
const h = React.createElement;
function useMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches);
  useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-dt-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-dt-styles';
  s.textContent = '.mt-dt-row:hover{background:var(--court-050,#EEF3F7)}.mt-dt-row--click{cursor:pointer}';
  document.head.appendChild(s);
}

/* The admin table: tracked-caps header row, hairline row rules, court-050 hover, mono right-aligned
   numerics, typographic ▲▼ sort, pagination, empty state. ≤760px it collapses to stacked cards. */
function DataTable({
  columns = [],
  rows = [],
  sort,
  onSort,
  page,
  pages,
  onPage,
  empty = 'NO ROWS',
  mobileTitleKey,
  onRowClick,
  style
}) {
  ensureStyles();
  const m = useMobile();
  const cell = (c, r) => c.render ? c.render(r) : r[c.key];
  const head = c => {
    const active = sort && sort.key === c.key;
    const inner = [c.label, c.sortable && h('span', {
      key: 's',
      'aria-hidden': true,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        marginLeft: 6,
        opacity: active ? 1 : .35
      }
    }, active ? sort.dir === 'asc' ? '\u25B2' : '\u25BC' : '\u25B2\u25BC')];
    const st = {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label-sm,.75rem)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label,.107em)',
      textTransform: 'uppercase',
      color: 'var(--text-secondary,#46525E)'
    };
    return c.sortable ? h('button', {
      type: 'button',
      onClick: () => onSort && onSort(c.key, active && sort.dir === 'asc' ? 'desc' : 'asc'),
      style: {
        ...st,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        whiteSpace: 'nowrap'
      }
    }, inner) : h('span', {
      style: st
    }, inner);
  };
  if (m) return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      ...style
    }
  }, rows.length === 0 ? h('div', {
    style: {
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))'
    }
  }, h(__ds_scope.EmptyState, null, empty)) : rows.map((r, i) => h('div', {
    key: i,
    className: onRowClick ? 'mt-dt-row mt-dt-row--click' : undefined,
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    role: onRowClick ? 'button' : undefined,
    tabIndex: onRowClick ? 0 : undefined,
    onKeyDown: onRowClick ? e => {
      if (e.key === 'Enter') onRowClick(r);
    } : undefined,
    style: {
      background: 'var(--white,#fff)',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, h('div', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      fontWeight: 600,
      color: 'var(--ink,#1B1B1B)'
    }
  }, r[mobileTitleKey || columns[0].key]), h('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '4px 16px'
    }
  }, columns.filter(c => c.key !== (mobileTitleKey || columns[0].key)).map(c => h(React.Fragment, {
    key: c.key
  }, h('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary,#46525E)',
      paddingTop: 2
    }
  }, c.label), h('span', {
    style: {
      fontFamily: c.numeric ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: '0.8125rem',
      color: 'var(--ink,#1B1B1B)'
    }
  }, cell(c, r))))))), pages > 1 && h('div', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, h(__ds_scope.Pagination, {
    page,
    pages,
    onChange: onPage
  })));
  return h('div', {
    style
  }, h('table', {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, h('thead', null, h('tr', null, columns.map(c => h('th', {
    key: c.key,
    'aria-sort': sort && sort.key === c.key ? sort.dir === 'asc' ? 'ascending' : 'descending' : undefined,
    style: {
      textAlign: c.numeric ? 'right' : 'left',
      padding: '10px 12px',
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      whiteSpace: 'nowrap'
    }
  }, head(c))))), h('tbody', null, rows.map((r, i) => h('tr', {
    key: i,
    className: 'mt-dt-row' + (onRowClick ? ' mt-dt-row--click' : ''),
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    style: {
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)'
    }
  }, columns.map(c => h('td', {
    key: c.key,
    style: {
      padding: '12px 12px',
      textAlign: c.numeric ? 'right' : 'left',
      fontFamily: c.numeric || c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: c.numeric || c.mono ? '0.8125rem' : 'var(--size-body-sm,.875rem)',
      color: 'var(--ink,#1B1B1B)',
      whiteSpace: 'nowrap'
    }
  }, cell(c, r))))))), rows.length === 0 && h(__ds_scope.EmptyState, null, empty), pages > 1 && h('div', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      paddingTop: 8
    }
  }, h(__ds_scope.Pagination, {
    page,
    pages,
    onChange: onPage
  })));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusChip.jsx
try { (() => {
const h = React.createElement;
const MAP = {
  'ACTIVE': {
    sw: 'var(--now,#E8A33D)'
  },
  'UPCOMING': {
    sw: 'var(--court-300,#7FA3C4)'
  },
  'WAITLISTED': {
    sw: 'var(--court-200,#A9BDC9)'
  },
  'CANCELLED': {
    sw: 'transparent',
    frame: true,
    dim: true
  },
  'PAID': {
    sw: 'var(--court-500,#2B5680)'
  },
  'REFUNDED': {
    sw: 'var(--court-100,#DCE6EE)',
    frame: true
  },
  'SIGNED': {
    sw: 'var(--court-800,#1C3655)'
  },
  'NEEDS RE-CONSENT': {
    sw: 'var(--state-error,#A8432D)'
  },
  'PUBLISHED': {
    sw: 'var(--court-800,#1C3655)'
  },
  'DRAFT': {
    sw: 'transparent',
    frame: true,
    dim: true
  },
  'EXPIRED': {
    sw: 'transparent',
    frame: true,
    dim: true
  }
};

/* The mono-caps status convention codified: leading 8px square swatch + mono text.
   The TEXT carries the meaning (always ink / secondary — AA everywhere); the swatch carries the color.
   Amber appears only in the ACTIVE swatch, never as status text (the old amber ACTIVE text failed AA). */
function StatusChip({
  status = '',
  tone = 'light',
  style
}) {
  const k = String(status).toUpperCase();
  const c = MAP[k] || {
    sw: 'transparent',
    frame: true
  };
  const field = tone === 'field';
  return h('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      lineHeight: 1,
      color: c.dim ? field ? 'var(--court-300,#7FA3C4)' : 'var(--text-secondary,#46525E)' : field ? 'var(--line-white,#F7F7F7)' : 'var(--ink,#1B1B1B)',
      ...style
    }
  }, h('span', {
    'aria-hidden': true,
    style: {
      width: 8,
      height: 8,
      flex: 'none',
      background: c.sw,
      boxSizing: 'border-box',
      border: c.frame ? '1px solid ' + (field ? 'var(--border-on-field,rgba(247,247,247,0.24))' : 'rgba(27,27,27,0.4)') : 'none'
    }
  }), k);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tabs.jsx
try { (() => {
const {
  useState,
  useEffect
} = React;
const h = React.createElement;
function useMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches);
  useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}

/* The portal's tab pair as one component: desktop = underline tab row on a hairline;
   ≤760px = fixed bottom bar with the amber top border marking "now" (or a scrollable top row
   for >5 admin-density tabs via mobileMode="scroll"). */
function Tabs({
  items = [],
  active,
  onChange,
  mobileMode = 'bottom',
  ariaLabel = 'Sections',
  style
}) {
  const m = useMobile();
  const list = items.map(t => typeof t === 'object' ? t : {
    id: t,
    label: t
  });
  if (m && mobileMode === 'bottom') return h('nav', {
    'aria-label': ariaLabel,
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      display: 'flex',
      background: 'rgba(247,247,247,0.96)',
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      ...style
    }
  }, list.map(t => h('button', {
    key: t.id,
    'aria-current': active === t.id ? 'page' : undefined,
    onClick: () => onChange && onChange(t.id),
    style: {
      flex: 1,
      minHeight: 56,
      background: 'none',
      border: 'none',
      borderTop: active === t.id ? '2px solid var(--now,#E8A33D)' : '2px solid transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: active === t.id ? 'var(--ink,#1B1B1B)' : 'var(--ink-secondary,#46525E)',
      fontWeight: active === t.id ? 600 : 400,
      padding: '0 2px'
    }
  }, t.label)));
  return h('nav', {
    'aria-label': ariaLabel,
    style: {
      display: 'flex',
      gap: m ? 20 : 26,
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      ...(m ? {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      } : null),
      ...style
    }
  }, list.map(t => h('button', {
    key: t.id,
    'aria-current': active === t.id ? 'page' : undefined,
    onClick: () => onChange && onChange(t.id),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0 2px 12px',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label,.8125rem)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label,.107em)',
      textTransform: 'uppercase',
      color: active === t.id ? 'var(--ink,#1B1B1B)' : 'var(--ink-secondary,#46525E)',
      borderBottom: active === t.id ? '2px solid var(--ink,#1B1B1B)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const {
  useEffect
} = React;
const h = React.createElement;
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-toast-kf')) return;
  const s = document.createElement('style');
  s.id = 'mt-toast-kf';
  s.textContent = '@keyframes mt-toast-in{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}';
  document.head.appendChild(s);
}

/* Bottom toast: square ink strip, mono message, auto-dismiss. Entry is one short settle;
   the global reduced-motion rule makes it instant. */
function Toast({
  open,
  children,
  onDismiss,
  duration = 4000,
  style
}) {
  ensureStyles();
  useEffect(() => {
    if (!open || !onDismiss || !duration) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [open, duration]);
  if (!open) return null;
  return h('div', {
    role: 'status',
    style: {
      position: 'fixed',
      left: '50%',
      bottom: 24,
      transform: 'translate(-50%,0)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px 18px',
      maxWidth: 'min(560px, calc(100vw - 32px))',
      boxSizing: 'border-box',
      background: 'var(--ink,#1B1B1B)',
      color: 'var(--line-white,#F7F7F7)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      animation: 'mt-toast-in var(--dur-base,200ms) var(--ease-out,ease)',
      ...style
    }
  }, h('span', null, children), onDismiss && h('button', {
    onClick: onDismiss,
    'aria-label': 'Dismiss',
    style: {
      width: 32,
      height: 32,
      margin: '-8px -10px -8px 0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--line-white,#F7F7F7)',
      fontFamily: 'var(--font-mono)',
      fontSize: '1rem'
    }
  }, '\u00D7'));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const {
  useState,
  useRef
} = React;
const h = React.createElement;
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-check-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-check-styles';
  s.textContent = `
.mt-check-input{position:absolute;opacity:0;margin:0;width:100%;height:100%;cursor:pointer}
.mt-check-input:focus-visible+.mt-check-frame{outline:2px solid var(--focus-on-light,#2B5680);outline-offset:2px}
.mt-check-input[disabled]{cursor:default}`;
  document.head.appendChild(s);
}

/* A frame that fills: hairline square, solid ink when checked — the attendance-strip squares are the precedent.
   consent variant: larger frame + body-copy label, for waiver signing. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  consent = false,
  error,
  name,
  style
}) {
  ensureStyles();
  const [own, setOwn] = useState(!!defaultChecked);
  const isOn = checked !== undefined ? checked : own;
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mtc' + Math.random().toString(36).slice(2, 7);
  const size = consent ? 28 : 20;
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, h('label', {
    style: {
      display: 'flex',
      gap: consent ? 14 : 12,
      alignItems: 'flex-start',
      minHeight: 44,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      padding: '2px 0'
    }
  }, h('span', {
    style: {
      position: 'relative',
      flex: 'none',
      width: size,
      height: size,
      marginTop: consent ? 2 : 1
    }
  }, h('input', {
    type: 'checkbox',
    className: 'mt-check-input',
    name,
    checked: checked !== undefined ? checked : undefined,
    defaultChecked: checked === undefined ? defaultChecked : undefined,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? ids.current + '-err' : undefined,
    onChange: e => {
      if (checked === undefined) setOwn(e.target.checked);
      onChange && onChange(e);
    }
  }), h('span', {
    className: 'mt-check-frame',
    'aria-hidden': true,
    style: {
      position: 'absolute',
      inset: 0,
      boxSizing: 'border-box',
      border: '1px solid ' + (error ? 'var(--state-error,#A8432D)' : isOn ? 'var(--ink,#1B1B1B)' : 'rgba(27,27,27,0.4)'),
      background: isOn ? 'var(--ink,#1B1B1B)' : 'var(--white,#fff)',
      transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)'
    }
  })), label && h('span', {
    style: consent ? {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      lineHeight: 1.55,
      color: 'var(--ink,#1B1B1B)'
    } : {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      lineHeight: 1.5,
      color: 'var(--ink,#1B1B1B)',
      alignSelf: 'center'
    }
  }, label)), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/DateField.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
const h = React.createElement;
const LBL = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary,#46525E)'
};
const HELP = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--text-secondary,#46525E)'
};
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};
const INPUT = {
  width: '100%',
  boxSizing: 'border-box',
  height: 48,
  padding: '0 58px 0 14px',
  background: 'var(--white,#fff)',
  border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
  borderRadius: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.9375rem',
  letterSpacing: '0.04em',
  color: 'var(--ink,#1B1B1B)'
};
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const iso = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

/* Date input with mono ISO value (2026-09-12) + a popover month grid (the portal calendar pattern).
   Typing a full ISO date is the primary keyboard path; the grid is arrow-key navigable. */
function DateField({
  label,
  help,
  error,
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  style
}) {
  const [own, setOwn] = useState(defaultValue || '');
  const cur = value !== undefined ? value : own;
  const [open, setOpen] = useState(false);
  const seed = /^\d{4}-\d{2}-\d{2}$/.test(cur) ? new Date(cur + 'T12:00:00') : new Date();
  const [view, setView] = useState({
    y: seed.getFullYear(),
    m: seed.getMonth()
  });
  const wrap = useRef(null),
    grid = useRef(null),
    inp = useRef(null);
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mtd' + Math.random().toString(36).slice(2, 7);
  useEffect(() => {
    if (!open) return;
    const away = e => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const esc = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        inp.current && inp.current.focus();
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const commit = v => {
    if (value === undefined) setOwn(v);
    onChange && onChange(v);
  };
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({
    length: days
  }, (_, i) => i + 1)];
  const navBtn = (dir, lab) => h('button', {
    type: 'button',
    'aria-label': lab,
    onClick: () => setView(v => {
      const m = v.m + dir;
      return {
        y: v.y + Math.floor(m / 12),
        m: (m % 12 + 12) % 12
      };
    }),
    style: {
      width: 40,
      height: 36,
      background: 'none',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--ink,#1B1B1B)',
      borderRadius: 0
    }
  }, dir < 0 ? '\u2190' : '\u2192');
  const onGridKey = e => {
    const d = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7
    }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const btns = [...grid.current.querySelectorAll('button[data-d]')];
    const i = btns.indexOf(document.activeElement);
    (btns[i + d] || btns[i]) && (btns[i + d] || btns[i]).focus();
  };
  return h('div', {
    ref: wrap,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      ...style
    }
  }, label && h('label', {
    htmlFor: ids.current,
    style: LBL
  }, label), h('span', {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, h('input', {
    id: ids.current,
    ref: inp,
    type: 'text',
    name,
    placeholder: 'YYYY-MM-DD',
    maxLength: 10,
    disabled,
    autoComplete: 'off',
    value: cur,
    onChange: e => commit(e.target.value),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': help || error ? [help ? ids.current + '-help' : null, error ? ids.current + '-err' : null].filter(Boolean).join(' ') : undefined,
    style: {
      ...INPUT,
      ...(error ? {
        borderColor: 'var(--state-error,#A8432D)'
      } : null)
    }
  }), h('button', {
    type: 'button',
    'aria-label': 'Choose date',
    'aria-expanded': open,
    disabled,
    onClick: () => setOpen(o => !o),
    style: {
      position: 'absolute',
      right: 1,
      top: 1,
      bottom: 1,
      width: 46,
      background: 'var(--court-050,#EEF3F7)',
      border: 'none',
      borderLeft: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      color: 'var(--ink,#1B1B1B)'
    }
  }, open ? '\u25B4' : '\u25BE')), open && h('div', {
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      zIndex: 30,
      background: 'var(--white,#fff)',
      border: '1px solid var(--ink,#1B1B1B)',
      padding: 12,
      width: 308,
      boxSizing: 'border-box'
    }
  }, h('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, navBtn(-1, 'Previous month'), h('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.07em',
      color: 'var(--ink,#1B1B1B)'
    }
  }, MONTHS[view.m] + ' ' + view.y), navBtn(1, 'Next month')), h('div', {
    ref: grid,
    role: 'grid',
    onKeyDown: onGridKey,
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2
    }
  }, ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => h('span', {
    key: d,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      color: 'var(--text-secondary,#46525E)',
      textAlign: 'center',
      padding: '4px 0'
    }
  }, d)), cells.map((d, i) => {
    if (!d) return h('span', {
      key: 'e' + i
    });
    const v = iso(view.y, view.m, d);
    const sel = v === cur;
    return h('button', {
      key: d,
      type: 'button',
      'data-d': d,
      'aria-label': v,
      'aria-pressed': sel,
      onClick: () => {
        commit(v);
        setOpen(false);
        inp.current && inp.current.focus();
      },
      style: {
        height: 38,
        background: sel ? 'var(--ink,#1B1B1B)' : 'transparent',
        color: sel ? 'var(--line-white,#F7F7F7)' : 'var(--ink,#1B1B1B)',
        border: '1px solid ' + (sel ? 'var(--ink,#1B1B1B)' : 'transparent'),
        cursor: 'pointer',
        borderRadius: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem'
      },
      onMouseEnter: e => {
        if (!sel) e.currentTarget.style.background = 'var(--court-050,#EEF3F7)';
      },
      onMouseLeave: e => {
        if (!sel) e.currentTarget.style.background = 'transparent';
      }
    }, d);
  }))), help && h('span', {
    id: ids.current + '-help',
    style: HELP
  }, help), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { DateField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/DateField.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormSection.jsx
try { (() => {
const h = React.createElement;

/* Groups fields under an eyebrow + hairline rule. The building block of every settings/admin form. */
function FormSection({
  eyebrow,
  ticks = false,
  description,
  children,
  style
}) {
  return h('section', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      ...style
    }
  }, h('div', {
    style: {
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      paddingBottom: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, eyebrow && h(__ds_scope.Eyebrow, {
    ticks
  }, eyebrow), description && h('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      lineHeight: 1.55,
      color: 'var(--text-secondary,#46525E)',
      maxWidth: '52ch'
    }
  }, description)), h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, children));
}
Object.assign(__ds_scope, { FormSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormSection.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
const {
  useState,
  useRef
} = React;
const h = React.createElement;
const LBL = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary,#46525E)'
};
const HELP = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--text-secondary,#46525E)'
};
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};

/* Mutually exclusive choice as a frame row — the ClassTimeline weekend/weekday toggle, generalized.
   Replaces circular radios entirely (circles violate the shape law) and iOS switches (on/off rows are
   two-option SegmentedControls: ON / OFF, VISIBLE TO FAMILY / INTERNAL). */
function SegmentedControl({
  label,
  help,
  error,
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  fullWidth = false,
  compact = false,
  name,
  style
}) {
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const [own, setOwn] = useState(defaultValue !== undefined ? defaultValue : undefined);
  const cur = value !== undefined ? value : own;
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mtsg' + Math.random().toString(36).slice(2, 7);
  const set = v => {
    if (disabled) return;
    if (value === undefined) setOwn(v);
    onChange && onChange(v);
  };
  const onKey = e => {
    const i = opts.findIndex(o => o.value === cur);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      set(opts[(i + 1) % opts.length].value);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      set(opts[(i - 1 + opts.length) % opts.length].value);
    }
  };
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label && h('span', {
    style: LBL,
    id: ids.current + '-lbl'
  }, label), h('div', {
    role: 'radiogroup',
    'aria-labelledby': label ? ids.current + '-lbl' : undefined,
    'aria-describedby': error ? ids.current + '-err' : undefined,
    onKeyDown: onKey,
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      opacity: disabled ? 0.45 : 1
    }
  }, opts.map(o => {
    const on = o.value === cur;
    return h('button', {
      key: o.value,
      type: 'button',
      role: 'radio',
      'aria-checked': on,
      tabIndex: on || cur === undefined && o === opts[0] ? 0 : -1,
      disabled,
      name,
      onClick: () => set(o.value),
      style: {
        height: compact ? 40 : 48,
        padding: '0 16px',
        flex: fullWidth ? 1 : 'none',
        border: on ? '1px solid var(--ink,#1B1B1B)' : '1px solid ' + (error ? 'var(--state-error,#A8432D)' : 'var(--border-hairline,rgba(27,27,27,0.16))'),
        background: on ? 'var(--court-050,#EEF3F7)' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.08em',
        fontWeight: on ? 600 : 400,
        color: 'var(--ink,#1B1B1B)',
        textTransform: 'uppercase',
        transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)'
      }
    }, o.label);
  })), help && h('span', {
    style: HELP
  }, help), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const {
  useState,
  useRef
} = React;
const h = React.createElement;
const LBL = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary,#46525E)'
};
const HELP = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--text-secondary,#46525E)'
};
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-select-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-select-styles';
  s.textContent = `
.mt-select{appearance:none;-webkit-appearance:none;width:100%;box-sizing:border-box;height:48px;padding:0 40px 0 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;color:var(--ink,#1B1B1B);cursor:pointer;transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-select:hover{border-color:var(--court-300,#7FA3C4)}
.mt-select:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-select[disabled]{opacity:.45;cursor:default}`;
  document.head.appendChild(s);
}

/* Styled native select. Square, hairline, mono ▾ affordance matching the nav dropdown. */
function Select({
  label,
  help,
  error,
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder,
  name,
  disabled = false,
  style,
  selectStyle
}) {
  ensureStyles();
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mts' + Math.random().toString(36).slice(2, 7);
  const db = help || error ? [help ? ids.current + '-help' : null, error ? ids.current + '-err' : null].filter(Boolean).join(' ') : undefined;
  return h('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label && h('span', {
    style: LBL
  }, label), h('span', {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, h('select', {
    className: 'mt-select',
    name,
    value,
    defaultValue: value === undefined ? defaultValue ?? (placeholder ? '' : undefined) : undefined,
    onChange,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': db,
    style: error ? {
      borderColor: 'var(--state-error,#A8432D)',
      ...selectStyle
    } : selectStyle
  }, placeholder && h('option', {
    value: '',
    disabled: true
  }, placeholder), options.map((o, i) => {
    const v = typeof o === 'object' ? o : {
      value: o,
      label: o
    };
    return h('option', {
      key: i,
      value: v.value
    }, v.label);
  })), h('span', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      color: disabled ? 'var(--text-secondary,#46525E)' : 'var(--ink,#1B1B1B)',
      pointerEvents: 'none'
    }
  }, '\u25BE')), help && h('span', {
    id: ids.current + '-help',
    style: HELP
  }, help), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextArea.jsx
try { (() => {
const {
  useRef
} = React;
const h = React.createElement;
const LBL = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary,#46525E)'
};
const HELP = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--text-secondary,#46525E)'
};
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-ta-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-ta-styles';
  s.textContent = `
.mt-ta{width:100%;box-sizing:border-box;min-height:96px;padding:12px 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;line-height:1.55;color:var(--ink,#1B1B1B);resize:vertical;transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-ta::placeholder{color:var(--court-300,#7FA3C4)}
.mt-ta:hover{border-color:var(--court-300,#7FA3C4)}
.mt-ta:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-ta[disabled]{opacity:.45}`;
  document.head.appendChild(s);
}

/* Multi-line input with the shared form anatomy. Native caret (the ball caret is inputs-only). */
function TextArea({
  label,
  help,
  error,
  placeholder,
  rows = 4,
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  style,
  inputStyle
}) {
  ensureStyles();
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mta' + Math.random().toString(36).slice(2, 7);
  return h('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label && h('span', {
    style: LBL
  }, label), h('textarea', {
    className: 'mt-ta',
    rows,
    name,
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': help || error ? [help ? ids.current + '-help' : null, error ? ids.current + '-err' : null].filter(Boolean).join(' ') : undefined,
    style: error ? {
      borderColor: 'var(--state-error,#A8432D)',
      ...inputStyle
    } : inputStyle
  }), help && h('span', {
    id: ids.current + '-help',
    style: HELP
  }, help), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { TextArea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextArea.jsx", error: String((e && e.message) || e) }); }

// components/forms/TimeField.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
const h = React.createElement;
const LBL = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary,#46525E)'
};
const HELP = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--text-secondary,#46525E)'
};
const ERR = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  color: 'var(--state-error,#A8432D)',
  textTransform: 'uppercase'
};
const pad = n => String(n).padStart(2, '0');
const toMin = s => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  return m ? +m[1] * 60 + +m[2] : null;
};
const toStr = mi => pad(Math.floor((mi % 1440 + 1440) % 1440 / 60)) + ':' + pad((mi % 1440 + 1440) % 1440 % 60);

/* Time input: mono 24h value (16:00). Arrow keys step ±step minutes; ▾ opens a slot list (court hours). */
function TimeField({
  label,
  help,
  error,
  value,
  defaultValue,
  onChange,
  step = 15,
  listStep = 30,
  from = '07:00',
  to = '21:00',
  disabled = false,
  name,
  style
}) {
  const [own, setOwn] = useState(defaultValue || '');
  const cur = value !== undefined ? value : own;
  const [open, setOpen] = useState(false);
  const wrap = useRef(null),
    inp = useRef(null);
  const ids = useRef(null);
  if (!ids.current) ids.current = 'mtt' + Math.random().toString(36).slice(2, 7);
  useEffect(() => {
    if (!open) return;
    const away = e => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const esc = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        inp.current && inp.current.focus();
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const commit = v => {
    if (value === undefined) setOwn(v);
    onChange && onChange(v);
  };
  const onKey = e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const m = toMin(cur);
    if (m === null) return;
    e.preventDefault();
    commit(toStr(m + (e.key === 'ArrowUp' ? step : -step)));
  };
  const slots = [];
  const a = toMin(from),
    b = toMin(to);
  for (let t = a; t <= b; t += listStep) slots.push(toStr(t));
  return h('div', {
    ref: wrap,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      ...style
    }
  }, label && h('label', {
    htmlFor: ids.current,
    style: LBL
  }, label), h('span', {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, h('input', {
    id: ids.current,
    ref: inp,
    type: 'text',
    name,
    placeholder: 'HH:MM',
    maxLength: 5,
    disabled,
    autoComplete: 'off',
    value: cur,
    onChange: e => commit(e.target.value),
    onKeyDown: onKey,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': help || error ? [help ? ids.current + '-help' : null, error ? ids.current + '-err' : null].filter(Boolean).join(' ') : undefined,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      height: 48,
      padding: '0 58px 0 14px',
      background: 'var(--white,#fff)',
      border: '1px solid ' + (error ? 'var(--state-error,#A8432D)' : 'var(--border-hairline,rgba(27,27,27,0.16))'),
      borderRadius: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.9375rem',
      letterSpacing: '0.04em',
      color: 'var(--ink,#1B1B1B)'
    }
  }), h('button', {
    type: 'button',
    'aria-label': 'Choose time',
    'aria-expanded': open,
    disabled,
    onClick: () => setOpen(o => !o),
    style: {
      position: 'absolute',
      right: 1,
      top: 1,
      bottom: 1,
      width: 46,
      background: 'var(--court-050,#EEF3F7)',
      border: 'none',
      borderLeft: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      color: 'var(--ink,#1B1B1B)'
    }
  }, open ? '\u25B4' : '\u25BE')), open && h('div', {
    role: 'listbox',
    'aria-label': 'Times',
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      zIndex: 30,
      background: 'var(--white,#fff)',
      border: '1px solid var(--ink,#1B1B1B)',
      maxHeight: 216,
      overflowY: 'auto'
    }
  }, slots.map(t => h('button', {
    key: t,
    type: 'button',
    role: 'option',
    'aria-selected': t === cur,
    onClick: () => {
      commit(t);
      setOpen(false);
      inp.current && inp.current.focus();
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: '11px 14px',
      background: t === cur ? 'var(--ink,#1B1B1B)' : 'transparent',
      color: t === cur ? 'var(--line-white,#F7F7F7)' : 'var(--ink,#1B1B1B)',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      borderRadius: 0
    },
    onMouseEnter: e => {
      if (t !== cur) e.currentTarget.style.background = 'var(--court-050,#EEF3F7)';
    },
    onMouseLeave: e => {
      if (t !== cur) e.currentTarget.style.background = 'transparent';
    }
  }, t))), help && h('span', {
    id: ids.current + '-help',
    style: HELP
  }, help), error && h('span', {
    id: ids.current + '-err',
    role: 'alert',
    style: ERR
  }, 'ERROR: ', error));
}
Object.assign(__ds_scope, { TimeField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TimeField.jsx", error: String((e && e.message) || e) }); }

// components/media/PhotoFrame.jsx
try { (() => {
const RATIOS = {
  '3:2': '3 / 2',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '16:9': '16 / 9',
  '3:4': '3 / 4',
  '2:3': '2 / 3'
};

/* Every photograph in the system passes through this frame. Candid archive → analytical object:
   contained (never full-bleed), square-cornered, hairline-framed, mono-annotated. */
function PhotoFrame({
  src,
  alt = '',
  ratio = '3:2',
  focal = '50% 38%',
  treatment = 'plain',
  slices = 5,
  tag,
  caption,
  captionRight,
  frame = true,
  style
}) {
  const stage = {
    position: 'relative',
    aspectRatio: RATIOS[ratio] || ratio,
    overflow: 'hidden',
    background: 'var(--court-050,#EEF3F7)'
  };
  let media;
  if (treatment === 'slice') {
    const n = Math.max(3, slices);
    media = React.createElement('div', {
      style: {
        ...stage,
        display: 'flex'
      },
      role: 'img',
      'aria-label': alt
    }, Array.from({
      length: n
    }, (_, i) => {
      const back = n - 1 - i; // 0 = lead (rightmost, present), grows toward the past
      const wash = back / (n - 1);
      return React.createElement('div', {
        key: i,
        style: {
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          transform: `translateY(${(back * 2.6).toFixed(1)}%)`,
          borderLeft: back === 0 ? '2px solid var(--now,#E8A33D)' : 'none',
          boxSizing: 'border-box'
        }
      }, React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: `${-i * 100}%`,
          width: `${n * 100}%`,
          height: '100%',
          backgroundImage: `url("${src}")`,
          backgroundSize: 'cover',
          backgroundPosition: focal,
          filter: back === 0 ? 'none' : `grayscale(${Math.min(1, wash * 1.15)}) brightness(${1 - wash * 0.12})`
        }
      }), back > 0 && React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'var(--court-500,#2B5680)',
          opacity: 0.14 + wash * 0.38,
          mixBlendMode: 'color'
        }
      }), back > 0 && React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'var(--court-700,#24466B)',
          opacity: wash * 0.22,
          mixBlendMode: 'multiply'
        }
      }));
    }));
  } else {
    media = React.createElement('div', {
      style: stage
    }, React.createElement('img', {
      src,
      alt,
      loading: 'lazy',
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: focal,
        display: 'block',
        filter: treatment === 'wash' ? 'grayscale(1) contrast(1.06) brightness(0.94)' : 'none'
      }
    }), treatment === 'wash' && React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--court-500,#2B5680)',
        mixBlendMode: 'color'
      }
    }), treatment === 'wash' && React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg,rgba(22,51,78,0.06),rgba(22,51,78,0.32))',
        mixBlendMode: 'multiply'
      }
    }));
  }
  return React.createElement('figure', {
    style: {
      margin: 0,
      border: frame ? '1px solid var(--border-hairline,rgba(27,27,27,0.16))' : 'none',
      background: 'var(--surface-card,#fff)',
      ...style
    }
  }, React.createElement('div', {
    style: {
      position: 'relative'
    }
  }, media, tag && React.createElement('span', {
    style: {
      position: 'absolute',
      top: 10,
      left: 10,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: 'var(--court-800,#1C3655)',
      color: 'var(--line-white,#F7F7F7)',
      padding: '4px 9px',
      lineHeight: 1.3
    }
  }, tag)), (caption || captionRight) && React.createElement('figcaption', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      borderTop: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      padding: '9px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.45,
      color: 'var(--text-secondary,#46525E)'
    }
  }, React.createElement('span', null, caption), captionRight && React.createElement('span', {
    style: {
      whiteSpace: 'nowrap'
    }
  }, captionRight)));
}
Object.assign(__ds_scope, { PhotoFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/PhotoFrame.jsx", error: String((e && e.message) || e) }); }

// components/schedule/ResourceDayView.jsx
try { (() => {
const {
  useState,
  useEffect,
  useRef
} = React;
const h = React.createElement;
function useMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches);
  useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}
const TYPE_BG = {
  camp: 'var(--court-050,#EEF3F7)',
  'class': 'var(--court-100,#DCE6EE)',
  team: 'var(--court-200,#A9BDC9)',
  'private': 'var(--court-300,#7FA3C4)'
};
const toMin = s => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  return m ? +m[1] * 60 + +m[2] : null;
};
const MONO = (s, c) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s,
  letterSpacing: '0.05em',
  color: c || 'var(--text-secondary,#46525E)',
  textTransform: 'uppercase'
});

/* The admin day grid: one column per court, hour rows, session blocks colored by type from the
   cool ramp with ink text. Amber is reserved for the current-time line and NOTHING else.
   States: cancelled (dimmed + struck mono label), draft ghost frame (drag-to-create stand-in:
   click an empty slot), and the conflict rejection — a blocked drop with a mono ERROR line.
   The database enforces conflicts; this shows the refusal well. ≤760px: single court + switcher. */
function ResourceDayView({
  date = '2026-09-12',
  location,
  locations = ['DE ANZA', 'MURDOCK'],
  onLocationChange,
  courts = [],
  sessions = [],
  draft,
  nowTime,
  onSessionClick,
  onSlotClick,
  startHour = 7,
  endHour = 21,
  rowH = 44,
  style
}) {
  const m = useMobile();
  const [ownLoc, setOwnLoc] = useState(location || locations[0]);
  const loc = location !== undefined ? location : ownLoc;
  const visCourts = courts.filter(c => !c.location || c.location === loc);
  const [mobCourt, setMobCourt] = useState(null);
  const shown = m ? visCourts.filter(c => c.id === (mobCourt || visCourts[0] && visCourts[0].id)) : visCourts;
  const H = (endHour - startHour) * rowH;
  const y = t => {
    const mi = toMin(t);
    return mi === null ? 0 : (mi - startHour * 60) / 60 * rowH;
  };
  const colRef = useRef(null);
  const block = s => {
    const top = y(s.start),
      hgt = Math.max(20, y(s.end) - y(s.start) - 2);
    return h('button', {
      key: s.id,
      type: 'button',
      onClick: onSessionClick ? () => onSessionClick(s) : undefined,
      'aria-label': (s.cancelled ? 'Cancelled: ' : '') + s.title + ' ' + s.start + '–' + s.end,
      style: {
        position: 'absolute',
        left: 3,
        right: 3,
        top,
        height: hgt,
        textAlign: 'left',
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: s.cancelled ? 'transparent' : TYPE_BG[s.type] || TYPE_BG['class'],
        border: '1px solid ' + (s.cancelled ? 'var(--border-hairline,rgba(27,27,27,0.16))' : 'rgba(27,27,27,0.22)'),
        opacity: s.cancelled ? 0.6 : 1,
        cursor: onSessionClick ? 'pointer' : 'default',
        borderRadius: 0,
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, h('span', {
      style: {
        ...MONO('0.625rem', s.cancelled ? 'var(--text-secondary,#46525E)' : 'var(--ink,#1B1B1B)'),
        textDecoration: s.cancelled ? 'line-through' : 'none'
      }
    }, s.start + '\u2013' + s.end + (s.cancelled ? ' \u00B7 CANCELLED' : '')), h('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: s.cancelled ? 'var(--text-secondary,#46525E)' : 'var(--ink,#1B1B1B)',
        textDecoration: s.cancelled ? 'line-through' : 'none',
        lineHeight: 1.2
      }
    }, s.title), s.coach && hgt > 52 && h('span', {
      style: MONO('0.625rem')
    }, s.coach));
  };
  const ghost = d => {
    const top = y(d.start),
      hgt = Math.max(20, y(d.end) - y(d.start) - 2);
    return h('div', {
      style: {
        position: 'absolute',
        left: 3,
        right: 3,
        top,
        height: hgt,
        boxSizing: 'border-box',
        border: '1px solid ' + (d.conflict ? 'var(--state-error,#A8432D)' : 'var(--ink,#1B1B1B)'),
        background: 'transparent',
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 2
      }
    }, h('span', {
      style: MONO('0.625rem', 'var(--ink,#1B1B1B)')
    }, 'NEW \u00B7 ' + d.start + '\u2013' + d.end), d.conflict && h('span', {
      role: 'alert',
      style: {
        ...MONO('0.625rem', 'var(--state-error,#A8432D)'),
        lineHeight: 1.4
      }
    }, 'ERROR: ' + d.conflict));
  };
  const slotClick = courtId => e => {
    if (!onSlotClick || e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mins = startHour * 60 + Math.floor((e.clientY - r.top) / rowH * 60 / 30) * 30;
    onSlotClick(courtId, String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'));
  };
  return h('div', {
    style
  }, h('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, h('span', {
    style: MONO('0.8125rem', 'var(--ink,#1B1B1B)')
  }, date), h('div', {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, m && visCourts.length > 1 && h(__ds_scope.Select, {
    options: visCourts.map(c => ({
      value: c.id,
      label: c.label
    })),
    value: mobCourt || visCourts[0].id,
    onChange: e => setMobCourt(e.target.value),
    style: {
      width: 170
    }
  }), h(__ds_scope.SegmentedControl, {
    compact: true,
    options: locations,
    value: loc,
    onChange: v => {
      setOwnLoc(v);
      setMobCourt(null);
      onLocationChange && onLocationChange(v);
    }
  }))), h('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '56px repeat(' + shown.length + ',1fr)',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      background: 'var(--white,#fff)'
    }
  }, h('div', null), shown.map(c => h('div', {
    key: c.id,
    style: {
      ...MONO('0.6875rem', 'var(--ink,#1B1B1B)'),
      textAlign: 'center',
      padding: '10px 4px',
      borderLeft: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))'
    }
  }, c.label)), h('div', {
    style: {
      position: 'relative',
      height: H
    }
  }, Array.from({
    length: endHour - startHour
  }, (_, i) => h('div', {
    key: i,
    style: {
      position: 'absolute',
      top: i * rowH,
      right: 6,
      transform: 'translateY(-6px)',
      ...MONO('0.625rem')
    }
  }, i > 0 ? String(startHour + i).padStart(2, '0') + ':00' : ''))), shown.map(c => h('div', {
    key: c.id,
    ref: colRef,
    onClick: slotClick(c.id),
    style: {
      position: 'relative',
      height: H,
      borderLeft: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      cursor: onSlotClick ? 'copy' : 'default',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent ' + (rowH - 1) + 'px, var(--border-hairline,rgba(27,27,27,0.16)) ' + (rowH - 1) + 'px, var(--border-hairline,rgba(27,27,27,0.16)) ' + rowH + 'px)'
    }
  }, sessions.filter(s => s.court === c.id && (!s.location || s.location === loc)).map(block), draft && draft.court === c.id && ghost(draft), nowTime && toMin(nowTime) >= startHour * 60 && toMin(nowTime) <= endHour * 60 && h('div', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: y(nowTime),
      height: 2,
      background: 'var(--now,#E8A33D)',
      zIndex: 3
    }
  }, c === shown[shown.length - 1] && h('span', {
    style: {
      position: 'absolute',
      right: 2,
      top: -14,
      ...MONO('0.5625rem', 'var(--accent-present-hover,#C77F14)')
    }
  }, 'NOW ' + nowTime))))), h('div', {
    style: {
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      marginTop: 10
    }
  }, Object.entries({
    camp: 'CAMP',
    'class': 'CLASS',
    team: 'TEAM',
    'private': 'PRIVATE'
  }).map(([k, v]) => h('span', {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...MONO('0.625rem')
    }
  }, h('span', {
    style: {
      width: 8,
      height: 8,
      background: TYPE_BG[k],
      border: '1px solid rgba(27,27,27,0.22)'
    }
  }), v)), h('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...MONO('0.625rem')
    }
  }, h('span', {
    style: {
      width: 8,
      height: 2,
      background: 'var(--now,#E8A33D)'
    }
  }), 'NOW')));
}
Object.assign(__ds_scope, { ResourceDayView });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/schedule/ResourceDayView.jsx", error: String((e && e.message) || e) }); }

// components/schedule/SessionForm.jsx
try { (() => {
const {
  useState
} = React;
const h = React.createElement;

/* Create/edit a session with the Group-1 controls. The conflict prop renders the inline
   rejection state — the database refuses double-booking; this form shows the refusal. */
function SessionForm({
  value = {},
  courts = [],
  coaches = [],
  conflict,
  onSubmit,
  onCancel,
  submitLabel = 'Save session',
  style
}) {
  const [v, setV] = useState({
    type: 'class',
    court: courts[0] && courts[0].id,
    coach: coaches[0],
    date: '2026-09-12',
    start: '16:00',
    end: '17:30',
    notes: '',
    ...value
  });
  const set = k => val => setV(s => ({
    ...s,
    [k]: val && val.target ? val.target.value : val
  }));
  return h('form', {
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(v);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }
  }, h(__ds_scope.SegmentedControl, {
    label: 'Type',
    fullWidth: true,
    options: [{
      value: 'class',
      label: 'Class'
    }, {
      value: 'camp',
      label: 'Camp'
    }, {
      value: 'team',
      label: 'Team'
    }, {
      value: 'private',
      label: 'Private'
    }],
    value: v.type,
    onChange: set('type')
  }), h('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
      gap: 16
    }
  }, h(__ds_scope.Select, {
    label: 'Court',
    options: courts.map(c => ({
      value: c.id,
      label: c.label
    })),
    value: v.court,
    onChange: set('court')
  }), h(__ds_scope.Select, {
    label: 'Coach',
    options: coaches,
    value: v.coach,
    onChange: set('coach')
  })), h('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 16
    }
  }, h(__ds_scope.DateField, {
    label: 'Date',
    value: v.date,
    onChange: set('date')
  }), h(__ds_scope.TimeField, {
    label: 'Start',
    value: v.start,
    onChange: set('start')
  }), h(__ds_scope.TimeField, {
    label: 'End',
    value: v.end,
    onChange: set('end'),
    error: conflict ? undefined : v.end <= v.start ? 'end must be after start' : undefined
  })), h(__ds_scope.TextArea, {
    label: 'Notes',
    rows: 2,
    value: v.notes,
    onChange: set('notes'),
    placeholder: 'Optional'
  }), conflict && h(__ds_scope.Banner, {
    tone: 'error'
  }, conflict), h('div', {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, onCancel && h(__ds_scope.Button, {
    variant: 'ghost',
    onClick: onCancel
  }, 'Cancel'), h(__ds_scope.Button, {
    type: 'submit',
    disabled: !!conflict
  }, submitLabel)));
}
Object.assign(__ds_scope, { SessionForm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/schedule/SessionForm.jsx", error: String((e && e.message) || e) }); }

// components/site/CampTimeline.jsx
try { (() => {
const {
  useState
} = React;
const DEFAULT_ITEMS = [{
  time: '09:00',
  title: 'On-court training & technique',
  desc: 'Footwork, grip, swing shape — small groups by ball level.',
  phase: 'On court'
}, {
  time: '09:45',
  title: 'Rallies & games',
  phase: 'On court'
}, {
  time: '10:45',
  title: 'Match play & strategy',
  desc: 'USTA team-tennis formats, point construction, scoring.',
  phase: 'On court'
}, {
  time: '13:00',
  title: 'Chess & mental development',
  phase: 'Mind'
}, {
  time: '14:30',
  title: 'Music production, photography, art & crafts',
  desc: 'Creative studios at De Anza College, to 17:00.',
  phase: 'Studio'
}];
const CHIP_RAMP = ['#DCE6EE', '#A9BDC9', '#7FA3C4', '#3E6C99', '#2B5680', '#24466B', '#1C3655'];

/* The camp day as a strobe sequence: frames deepen as the day advances; the frame under your cursor is "now". */
function CampTimeline({
  items = DEFAULT_ITEMS,
  style
}) {
  const [now, setNow] = useState(-1);
  const n = items.length;
  return React.createElement('ol', {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      position: 'relative',
      ...style
    }
  }, items.map((it, i) => {
    const chipBg = CHIP_RAMP[Math.min(CHIP_RAMP.length - 1, Math.round(i / (n - 1) * (CHIP_RAMP.length - 1)))];
    const lightChip = i / (n - 1) < 0.45;
    const active = now === i;
    return React.createElement('li', {
      key: i,
      tabIndex: 0,
      onMouseEnter: () => setNow(i),
      onMouseLeave: () => setNow(-1),
      onFocus: () => setNow(i),
      onBlur: () => setNow(-1),
      style: {
        display: 'grid',
        gridTemplateColumns: '56px 40px 1fr',
        gap: '0 18px',
        alignItems: 'start',
        position: 'relative',
        padding: '14px 8px',
        cursor: 'default',
        outlineOffset: 2,
        background: active ? 'var(--surface-tint,#EEF3F7)' : 'transparent',
        transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)'
      }
    }, i < n - 1 && React.createElement('span', {
      'aria-hidden': true,
      style: {
        position: 'absolute',
        left: 56 + 18 + 19,
        top: 54,
        bottom: -14,
        width: 1,
        background: 'var(--border-hairline,rgba(27,27,27,0.16))'
      }
    }), React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary,#46525E)',
        paddingTop: 11
      }
    }, it.time), React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: 40,
        height: 40,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        background: active ? 'var(--now,#E8A33D)' : chipBg,
        color: active ? 'var(--ink,#1B1B1B)' : lightChip ? 'var(--court-800,#1C3655)' : 'var(--line-white,#F7F7F7)',
        transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)',
        position: 'relative',
        zIndex: 1
      }
    }, String(i + 1).padStart(2, '0')), React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        paddingTop: 8
      }
    }, React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        alignItems: 'baseline'
      }
    }, React.createElement('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body,1rem)',
        fontWeight: 600,
        color: 'var(--ink,#1B1B1B)'
      }
    }, it.title), it.phase && React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.107em',
        textTransform: 'uppercase',
        color: active ? 'var(--accent-present-hover,#C77F14)' : 'var(--court-400,#3E6C99)',
        whiteSpace: 'nowrap',
        transition: 'color var(--dur-fast,120ms) var(--ease-out,ease)'
      }
    }, it.phase)), it.desc && React.createElement('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body-sm,.875rem)',
        lineHeight: 1.5,
        color: 'var(--text-secondary,#46525E)',
        maxWidth: '52ch'
      }
    }, it.desc)));
  }));
}
Object.assign(__ds_scope, { CampTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/site/CampTimeline.jsx", error: String((e && e.message) || e) }); }

// components/site/ClassTimeline.jsx
try { (() => {
const {
  useState
} = React;
const DEFAULT_BLOCKS = [{
  title: 'Technical skill training',
  desc: 'Footwork, grip, swing shape — one element isolated and repeated until you can see it.'
}, {
  title: 'Dynamic drills & skill application',
  desc: 'The same technique under movement and pressure: live feeds, patterns, decision speed.'
}, {
  title: 'Gameplay & strategy',
  desc: 'Point construction, scoring, match habits — the skill applied where it counts.'
}];
const CHIPS = ['#A9BDC9', '#3E6C99', '#1C3655'];

/* One class, play by play: three equal blocks. Weekends run 2h (40-min blocks), weekdays 1.5h (30-min).
   Wall-clock start times are set by the academy (admin console) — the timeline shows offsets, not clock times. */
function ClassTimeline({
  variant = 'weekend',
  showToggle = true,
  blocks = DEFAULT_BLOCKS,
  style
}) {
  const [v, setV] = useState(variant);
  const [now, setNow] = useState(-1);
  const per = v === 'weekend' ? 40 : 30;
  const off = i => {
    const t = i * per;
    return 'T+' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };
  const segBtn = (key, label) => React.createElement('button', {
    key,
    onClick: () => setV(key),
    'aria-pressed': v === key,
    style: {
      height: 40,
      padding: '0 16px',
      border: v === key ? '1px solid var(--ink,#1B1B1B)' : '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      background: v === key ? 'var(--court-050,#EEF3F7)' : 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      fontWeight: v === key ? 600 : 400,
      color: 'var(--ink,#1B1B1B)',
      textTransform: 'uppercase',
      borderRadius: 0
    }
  }, label);
  return React.createElement('div', {
    style
  }, showToggle && React.createElement('div', {
    role: 'group',
    'aria-label': 'Class length',
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, segBtn('weekend', 'Weekend · 2h'), segBtn('weekday', 'Weekday · 1.5h')), React.createElement('ol', {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }, blocks.map((b, i) => {
    const active = now === i;
    return React.createElement('li', {
      key: i,
      tabIndex: 0,
      onMouseEnter: () => setNow(i),
      onMouseLeave: () => setNow(-1),
      onFocus: () => setNow(i),
      onBlur: () => setNow(-1),
      style: {
        display: 'grid',
        gridTemplateColumns: '58px 40px 1fr',
        gap: '0 16px',
        alignItems: 'start',
        position: 'relative',
        padding: '14px 8px',
        background: active ? 'var(--surface-tint,#EEF3F7)' : 'transparent',
        transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)',
        outlineOffset: 2
      }
    }, i < blocks.length - 1 && React.createElement('span', {
      'aria-hidden': true,
      style: {
        position: 'absolute',
        left: 58 + 16 + 19,
        top: 54,
        bottom: -14,
        width: 1,
        background: 'var(--border-hairline,rgba(27,27,27,0.16))'
      }
    }), React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary,#46525E)',
        paddingTop: 11
      }
    }, off(i)), React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: 40,
        height: 40,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        background: active ? 'var(--now,#E8A33D)' : CHIPS[i] || CHIPS[2],
        color: active ? 'var(--ink,#1B1B1B)' : i === 0 ? 'var(--court-800,#1C3655)' : 'var(--line-white,#F7F7F7)',
        transition: 'background var(--dur-fast,120ms) var(--ease-out,ease)',
        position: 'relative',
        zIndex: 1
      }
    }, String(i + 1).padStart(2, '0')), React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        paddingTop: 8
      }
    }, React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        alignItems: 'baseline'
      }
    }, React.createElement('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body,1rem)',
        fontWeight: 600,
        color: 'var(--ink,#1B1B1B)'
      }
    }, b.title), React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.107em',
        textTransform: 'uppercase',
        color: active ? 'var(--accent-present-hover,#C77F14)' : 'var(--court-400,#3E6C99)',
        whiteSpace: 'nowrap'
      }
    }, per + ' MIN')), b.desc && React.createElement('span', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body-sm,.875rem)',
        lineHeight: 1.5,
        color: 'var(--text-secondary,#46525E)',
        maxWidth: '52ch'
      }
    }, b.desc)));
  })), React.createElement('div', {
    style: {
      borderTop: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      marginTop: 4,
      paddingTop: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.07em',
      color: 'var(--text-secondary,#46525E)',
      textTransform: 'uppercase'
    }
  }, '3 blocks · ' + per + ' min each · ' + (v === 'weekend' ? '2h — weekends' : '1.5h — weekdays') + ' · times set by the academy'));
}
Object.assign(__ds_scope, { ClassTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/site/ClassTimeline.jsx", error: String((e && e.message) || e) }); }

// components/site/CourtMeter.jsx
try { (() => {
const RAMP = ['#DCE6EE', '#A9BDC9', '#7FA3C4', '#3E6C99', '#24466B'];

/* The loyalty / progression meter: five courts ordered by difficulty. Courts climbed are cool
   (the past), the court the player stands on today is amber (now), courts ahead are empty frames. */
function CourtMeter({
  court = 3,
  max = 5,
  label = 'Court level',
  caption,
  tone = 'light',
  showLabels = true,
  style
}) {
  const onField = tone === 'field';
  const cur = Math.max(1, Math.min(max, court));
  return React.createElement('div', {
    role: 'meter',
    'aria-valuemin': 1,
    'aria-valuemax': max,
    'aria-valuenow': cur,
    'aria-label': `${label}: court ${cur} of ${max}`,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 16
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label-sm,.75rem)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label,.107em)',
      textTransform: 'uppercase',
      color: onField ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--text-secondary,#46525E)'
    }
  }, label), caption && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: onField ? 'var(--text-on-field-dim,#A9BDC9)' : 'var(--court-500,#2B5680)'
    }
  }, caption)), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 6
    }
  }, Array.from({
    length: max
  }, (_, i) => {
    const n = i + 1;
    const bg = n < cur ? RAMP[Math.min(RAMP.length - 1, i)] : n === cur ? 'var(--now,#E8A33D)' : 'transparent';
    return React.createElement('div', {
      key: i,
      style: {
        flex: 1,
        height: 16,
        background: bg,
        border: n > cur ? '1px solid var(--border-hairline,rgba(27,27,27,0.16))' : '1px solid transparent',
        boxSizing: 'border-box',
        transition: 'background var(--dur-base,200ms) var(--ease-out,ease)'
      }
    });
  })), showLabels && React.createElement('div', {
    style: {
      display: 'flex',
      gap: 6
    }
  }, Array.from({
    length: max
  }, (_, i) => React.createElement('span', {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      letterSpacing: '0.08em',
      color: i + 1 === cur ? onField ? 'var(--amber-300,#F2C377)' : 'var(--accent-present-hover,#C77F14)' : onField ? 'var(--court-300,#7FA3C4)' : 'var(--text-secondary,#46525E)',
      fontWeight: i + 1 === cur ? 600 : 400
    }
  }, 'C' + (i + 1)))));
}
Object.assign(__ds_scope, { CourtMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/site/CourtMeter.jsx", error: String((e && e.message) || e) }); }

// components/site/ProgramCard.jsx
try { (() => {
/* Program card — repeats across junior / camps / adult pages. Location, level, schedule, CTA. */
function ProgramCard({
  eyebrow,
  title,
  level,
  location,
  schedule = [],
  note,
  photo,
  photoRatio = '3:2',
  photoFocal,
  photoTreatment = 'wash',
  photoAlt = '',
  ctaLabel = 'View schedule',
  ctaHref = '#',
  primaryCta = false,
  style
}) {
  return React.createElement('article', {
    style: {
      background: 'var(--surface-card,#fff)',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, photo && React.createElement(__ds_scope.PhotoFrame, {
    src: photo,
    alt: photoAlt,
    ratio: photoRatio,
    focal: photoFocal,
    treatment: photoTreatment,
    frame: false,
    style: {
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))'
    }
  }), React.createElement('div', {
    style: {
      padding: '24px 24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      flex: 1
    }
  }, React.createElement(__ds_scope.Eyebrow, {
    ticks: true
  }, eyebrow), React.createElement('h3', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--size-h3,1.75rem)',
      lineHeight: 1.05,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink,#1B1B1B)'
    }
  }, title), (level || location) && React.createElement('div', {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px 20px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: 'var(--text-secondary,#46525E)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, level && React.createElement('span', null, 'LEVEL — ', level), location && React.createElement('span', null, 'AT — ', location)), schedule.length > 0 && React.createElement('div', {
    style: {
      borderTop: '1px solid var(--border-hairline,rgba(27,27,27,0.16))'
    }
  }, schedule.map((row, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 16,
      padding: '10px 0',
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      fontWeight: 600,
      color: 'var(--ink,#1B1B1B)'
    }
  }, row.days), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--court-500,#2B5680)',
      whiteSpace: 'nowrap'
    }
  }, row.time), row.detail && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '0.8125rem',
      color: 'var(--text-secondary,#46525E)',
      marginLeft: 'auto'
    }
  }, row.detail)))), note && React.createElement('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm,.875rem)',
      lineHeight: 1.55,
      color: 'var(--text-secondary,#46525E)'
    }
  }, note), React.createElement('div', {
    style: {
      marginTop: 'auto',
      paddingTop: 8
    }
  }, React.createElement(__ds_scope.Button, {
    variant: primaryCta ? 'primary' : 'secondary',
    size: 'sm',
    href: ctaHref
  }, ctaLabel))));
}
Object.assign(__ds_scope, { ProgramCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/site/ProgramCard.jsx", error: String((e && e.message) || e) }); }

// components/site/SiteNav.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
const DEFAULT_LINKS = {
  home: '#top',
  juniors: '#programs',
  camps: '#camp-day',
  adults: '#programs',
  jtt: '#jtt',
  calendar: '#calendar',
  store: '#store',
  login: '#login',
  book: '#book'
};
const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function ensureNavStyles() {
  if (typeof document === 'undefined' || document.getElementById('mt-nav-styles')) return;
  const s = document.createElement('style');
  s.id = 'mt-nav-styles';
  s.textContent = '@keyframes mt-sheet-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(s);
}
function useIsMobile(bp) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(`(max-width:${bp}px)`).matches);
  useEffect(() => {
    const q = window.matchMedia(`(max-width:${bp}px)`);
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, [bp]);
  return m;
}
const labelStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label,.8125rem)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label,.107em)',
  textTransform: 'uppercase'
};

/* The site header: concise and hierarchical. Desktop: Programs dropdown + Calendar/Store tabs.
   Mobile (≤breakpoint): logo + Book pill + tri-color hamburger (past-cool → now-warm bars)
   opening a full-screen court-navy sheet. */
function SiteNav({
  active = 'home',
  loggedIn = false,
  links = {},
  breakpoint = 760,
  campNote = 'JUN – JUL',
  style
}) {
  ensureNavStyles();
  const L = {
    ...DEFAULT_LINKS,
    ...links
  };
  const isMobile = useIsMobile(breakpoint);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const ddRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    const esc = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = e => {
      if (e.key === 'Escape') setSheet(false);
    };
    document.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', esc);
    };
  }, [sheet]);
  if (isMobile) {
    const barBase = {
      height: 2,
      borderRadius: 1,
      transition: 'transform 0.22s ease, background 0.22s ease, opacity 0.22s ease'
    };
    const sheetLink = (href, children) => React.createElement('a', {
      href,
      onClick: () => setSheet(false),
      style: {
        display: 'block',
        padding: '12px 0',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: '1.75rem',
        lineHeight: 1.05,
        letterSpacing: '0.01em',
        textTransform: 'uppercase',
        color: 'var(--line-white,#F7F7F7)',
        textDecoration: 'none'
      }
    }, children);
    const smallLink = (href, children) => React.createElement('a', {
      href,
      onClick: () => setSheet(false),
      style: {
        ...labelStyle,
        display: 'block',
        padding: '12px 0',
        color: 'var(--line-white,#F7F7F7)',
        textDecoration: 'none'
      }
    }, children);
    const grp = t => React.createElement('div', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--court-300,#7FA3C4)',
        margin: '16px 0 2px'
      }
    }, t);
    const divider = React.createElement('div', {
      style: {
        height: 1,
        background: 'rgba(247,247,247,0.22)',
        margin: '12px 0'
      }
    });
    return React.createElement('header', {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(247,247,247,0.94)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
        ...style
      }
    }, React.createElement('div', {
      style: {
        padding: '0 8px 0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64
      }
    }, React.createElement('a', {
      href: L.home,
      'aria-label': 'Momentum Tennis home',
      style: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, React.createElement('img', {
      src: L.logoSrc || '../../assets/logo-mark.svg',
      alt: '',
      style: {
        height: 36,
        display: 'block'
      }
    }), React.createElement(__ds_scope.Wordmark, {
      variant: 'word',
      height: 16
    })), React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, React.createElement(__ds_scope.Button, {
      variant: 'secondary',
      size: 'sm',
      href: L.book
    }, 'Book a trial'), React.createElement('button', {
      onClick: () => setSheet(s => !s),
      'aria-label': sheet ? 'Close menu' : 'Open menu',
      'aria-expanded': sheet,
      style: {
        width: 44,
        height: 44,
        display: 'grid',
        placeItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 60,
        padding: 0
      }
    }, React.createElement('span', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        width: 22
      }
    }, React.createElement('span', {
      style: {
        ...barBase,
        background: sheet ? 'var(--line-white,#F7F7F7)' : 'var(--court-300,#7FA3C4)',
        transform: sheet ? 'translateY(7px) rotate(45deg)' : 'none'
      }
    }), React.createElement('span', {
      style: {
        ...barBase,
        background: 'var(--court-500,#2B5680)',
        opacity: sheet ? 0 : 1
      }
    }), React.createElement('span', {
      style: {
        ...barBase,
        background: sheet ? 'var(--line-white,#F7F7F7)' : 'var(--now,#E8A33D)',
        transform: sheet ? 'translateY(-7px) rotate(-45deg)' : 'none'
      }
    }))))), sheet && React.createElement('div', {
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Site menu',
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--court-800,#1C3655)',
        padding: '88px 24px 28px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        animation: reduced() ? 'none' : 'mt-sheet-in 0.24s ease-out'
      }
    }, grp('Programs'), sheetLink(L.juniors, 'Classes'), sheetLink(L.jtt, 'Team tennis'), sheetLink(L.adults, 'Private lessons'), smallLink(L.camps, 'Summer camps — ' + campNote), divider, sheetLink(L.calendar, 'Calendar'), sheetLink(L.store, 'Store'), divider, smallLink(L.login, loggedIn ? 'Account' : 'Log in'), React.createElement('div', {
      style: {
        marginTop: 'auto',
        paddingTop: 24
      }
    }, React.createElement(__ds_scope.Button, {
      href: L.book
    }, 'Book a free trial class'))));
  }
  const tab = (key, href, children) => React.createElement('a', {
    href,
    style: {
      ...labelStyle,
      color: 'var(--ink,#1B1B1B)',
      textDecoration: 'none',
      padding: '25px 2px 23px',
      borderBottom: active === key ? '2px solid var(--ink,#1B1B1B)' : '2px solid transparent'
    }
  }, children);
  const item = (href, children) => React.createElement('a', {
    href,
    role: 'menuitem',
    onClick: () => setOpen(false),
    style: {
      display: 'block',
      padding: '11px 16px',
      ...labelStyle,
      color: 'var(--ink,#1B1B1B)',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--court-050,#EEF3F7)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, children);
  return React.createElement('header', {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(247,247,247,0.94)',
      backdropFilter: 'blur(6px)',
      borderBottom: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      ...style
    }
  }, React.createElement('div', {
    style: {
      maxWidth: 'var(--container,1200px)',
      margin: '0 auto',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 72
    }
  }, React.createElement('a', {
    href: L.home,
    'aria-label': 'Momentum Tennis home',
    style: {
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('img', {
    src: L.logoSrc || '../../assets/logo-mark.svg',
    alt: '',
    style: {
      height: 42,
      display: 'block'
    }
  }), React.createElement(__ds_scope.Wordmark, {
    variant: 'word',
    height: 19
  })), React.createElement('nav', {
    'aria-label': 'Primary',
    style: {
      display: 'flex',
      gap: 28,
      alignItems: 'center',
      alignSelf: 'stretch'
    }
  }, React.createElement('span', {
    ref: ddRef,
    style: {
      position: 'relative',
      display: 'flex',
      alignSelf: 'stretch',
      alignItems: 'center'
    }
  }, React.createElement('button', {
    onClick: () => setOpen(o => !o),
    'aria-haspopup': 'true',
    'aria-expanded': open,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '25px 2px 23px',
      alignSelf: 'stretch',
      ...labelStyle,
      color: 'var(--ink,#1B1B1B)',
      borderBottom: active === 'programs' ? '2px solid var(--ink,#1B1B1B)' : '2px solid transparent'
    }
  }, 'Programs ', React.createElement('span', {
    'aria-hidden': true,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      verticalAlign: '2px'
    }
  }, open ? '\u25B4' : '\u25BE')), open && React.createElement('div', {
    role: 'menu',
    style: {
      position: 'absolute',
      top: '100%',
      left: -16,
      minWidth: 230,
      background: 'var(--white,#fff)',
      border: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      padding: '6px 0'
    }
  }, item(L.juniors, 'Classes'), item(L.jtt, 'Team tennis'), item(L.adults, 'Private lessons'), React.createElement('div', {
    style: {
      borderTop: '1px solid var(--border-hairline,rgba(27,27,27,0.16))',
      margin: '6px 0'
    }
  }), item(L.camps, ['Summer camps  ', React.createElement('span', {
    key: 'n',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.625rem',
      letterSpacing: '0.05em',
      color: 'var(--court-400,#3E6C99)'
    }
  }, campNote)]))), tab('calendar', L.calendar, 'Calendar'), tab('store', L.store, 'Store')), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, React.createElement('a', {
    href: L.login,
    style: {
      ...labelStyle,
      color: active === 'account' ? 'var(--ink,#1B1B1B)' : 'var(--ink-secondary,#46525E)',
      textDecoration: active === 'account' ? 'underline' : 'none',
      textUnderlineOffset: 6
    }
  }, loggedIn ? 'Account' : 'Log in'), React.createElement(__ds_scope.Button, {
    variant: 'secondary',
    size: 'sm',
    href: L.book
  }, 'Book a trial'))));
}
Object.assign(__ds_scope, { SiteNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/site/SiteNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/admin.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  Wordmark,
  Eyebrow,
  Button,
  Tabs,
  DataTable,
  StatusChip,
  Dialog,
  Banner,
  ResourceDayView,
  SessionForm,
  EmptyState
} = NS;
const mono = (s = 13, c) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: c || 'var(--text-secondary)'
});
const lbl = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const card = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};
const container = {
  maxWidth: 'var(--container)',
  margin: '0 auto'
};
function useMobile() {
  const [m, setM] = React.useState(() => window.matchMedia('(max-width:760px)').matches);
  React.useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}

// —— SAMPLE DATA (prototype only) ——
const COURTS = [{
  id: 'c1',
  label: 'COURT 1',
  location: 'DE ANZA'
}, {
  id: 'c2',
  label: 'COURT 2',
  location: 'DE ANZA'
}, {
  id: 'c3',
  label: 'COURT 3',
  location: 'DE ANZA'
}, {
  id: 'c4',
  label: 'COURT 4',
  location: 'DE ANZA'
}, {
  id: 'm1',
  label: 'COURT 1',
  location: 'MURDOCK'
}, {
  id: 'm2',
  label: 'COURT 2',
  location: 'MURDOCK'
}];
const COACHES = ['Artur Westergren', 'Vishal', 'Elsio'];
const SESSIONS = [{
  id: 1,
  court: 'c1',
  location: 'DE ANZA',
  start: '09:00',
  end: '11:00',
  type: 'class',
  title: 'Junior classes — all levels',
  coach: 'VISHAL'
}, {
  id: 2,
  court: 'c2',
  location: 'DE ANZA',
  start: '09:00',
  end: '11:00',
  type: 'class',
  title: 'Yellow ball int.+',
  coach: 'ELSIO'
}, {
  id: 3,
  court: 'c3',
  location: 'DE ANZA',
  start: '09:00',
  end: '10:30',
  type: 'private',
  title: 'Private — M. Chen',
  coach: 'ARTUR'
}, {
  id: 4,
  court: 'c1',
  location: 'DE ANZA',
  start: '11:00',
  end: '13:00',
  type: 'class',
  title: 'Adult clinic',
  coach: 'ARTUR'
}, {
  id: 5,
  court: 'c2',
  location: 'DE ANZA',
  start: '11:30',
  end: '13:00',
  type: 'team',
  title: 'JTT practice',
  coach: 'ELSIO'
}, {
  id: 6,
  court: 'c4',
  location: 'DE ANZA',
  start: '10:00',
  end: '12:00',
  type: 'class',
  title: 'Orange ball',
  coach: 'VISHAL',
  cancelled: true
}, {
  id: 7,
  court: 'c3',
  location: 'DE ANZA',
  start: '14:00',
  end: '15:00',
  type: 'private',
  title: 'Private — D. Park',
  coach: 'ARTUR'
}, {
  id: 8,
  court: 'm1',
  location: 'MURDOCK',
  start: '16:00',
  end: '17:00',
  type: 'class',
  title: 'Orange ball',
  coach: 'VISHAL'
}, {
  id: 9,
  court: 'm1',
  location: 'MURDOCK',
  start: '17:00',
  end: '18:30',
  type: 'class',
  title: 'Green ball',
  coach: 'VISHAL'
}, {
  id: 10,
  court: 'm2',
  location: 'MURDOCK',
  start: '17:00',
  end: '18:30',
  type: 'private',
  title: 'Private — R. Iyer',
  coach: 'ARTUR'
}];
const overlaps = (a, b) => a.court === b.court && a.start < b.end && b.start < a.end;
const ORDERS = [{
  order: 'M-1042',
  date: '2026-08-21',
  guardian: 'Priya R.',
  items: 'Junior classes · 8 pack',
  total: '$360.00',
  status: 'PAID',
  ledger: ['8 CREDITS ISSUED · MAYA R. · EXPIRES 2027-03-01', 'STRIPE REF PI_3NXK2QLKDZ9DQ2'],
  email: 'priya@example.com'
}, {
  order: 'M-1041',
  date: '2026-08-20',
  guardian: 'Wei Z.',
  items: 'Adult clinic · 4 pack',
  total: '$220.00',
  status: 'PAID',
  ledger: ['4 CREDITS ISSUED · WEI Z. · EXPIRES 2027-02-20', 'STRIPE REF PI_3NXH8ALKDZ1MB7'],
  email: 'wei@example.com'
}, {
  order: 'M-1040',
  date: '2026-08-19',
  guardian: 'Sofia M.',
  items: 'Summer camp · half week',
  total: '$315.00',
  status: 'PAID',
  ledger: ['CAMP WEEK 10 · HALF DAY · LEO M.', 'STRIPE REF PI_3NXF2WLKDZ4KT1'],
  email: 'sofia@example.com'
}, {
  order: 'M-1039',
  date: '2026-08-18',
  guardian: 'Dana K.',
  items: 'Summer camp · full week',
  total: '$495.00',
  status: 'REFUNDED',
  ledger: ['CAMP WEEK 9 · FULL DAY · SAM K.', 'REFUNDED 2026-08-20 · $495.00 · 0 CREDITS REVOKED', 'STRIPE REF PI_3NXD9KLKDZ7PW4'],
  email: 'dana@example.com'
}, {
  order: 'M-1038',
  date: '2026-08-17',
  guardian: 'Amir S.',
  items: 'Junior classes · 8 pack',
  total: '$360.00',
  status: 'PAID',
  ledger: ['8 CREDITS ISSUED · ZARA S. · EXPIRES 2027-02-17', 'STRIPE REF PI_3NXB4RLKDZ2QX8'],
  email: 'amir@example.com'
}];
function ScheduleTab() {
  const m = useMobile();
  const [loc, setLoc] = React.useState('DE ANZA');
  const [draft, setDraft] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const plus90 = t => {
    const [hh, mm] = t.split(':').map(Number);
    const x = hh * 60 + mm + 90;
    return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
  };
  const slotClick = (court, start) => {
    const d = {
      court,
      start,
      end: plus90(start)
    };
    const hit = SESSIONS.find(s => !s.cancelled && s.location === loc && overlaps(d, {
      ...d,
      court: s.court === court ? court : 'x'
    }) && s.court === court && s.start < d.end && d.start < s.end);
    setDraft(hit ? {
      ...d,
      conflict: COURTS.find(c => c.id === court).label + ' BOOKED ' + hit.start + '\u2013' + hit.end + ' \u2014 PICK ANOTHER SLOT'
    } : d);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Banner, null, "Click an empty slot to place a session \u2014 the ghost frame; drops onto a booked slot show the database's refusal. Drag arrives in production."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: m ? '14px 12px' : card.padding
    }
  }, /*#__PURE__*/React.createElement(ResourceDayView, {
    date: "2026-09-12 \xB7 SATURDAY",
    location: loc,
    onLocationChange: v => {
      setLoc(v);
      setDraft(null);
    },
    courts: COURTS,
    sessions: SESSIONS,
    draft: draft,
    nowTime: "10:40",
    onSessionClick: s => setEditing(s),
    onSlotClick: slotClick
  })), draft && !draft.conflict && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => setDraft(null)
  }, "Discard"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: () => setEditing({
      court: draft.court,
      start: draft.start,
      end: draft.end,
      type: 'class'
    })
  }, "Detail & save")), /*#__PURE__*/React.createElement(Dialog, {
    open: !!editing,
    onClose: () => setEditing(null),
    title: editing && editing.id ? 'Edit session' : 'New session'
  }, editing && /*#__PURE__*/React.createElement(SessionForm, {
    value: {
      type: editing.type,
      court: editing.court,
      coach: COACHES[0],
      date: '2026-09-12',
      start: editing.start,
      end: editing.end,
      notes: ''
    },
    courts: COURTS.filter(c => c.location === loc),
    coaches: COACHES,
    onSubmit: () => {
      setEditing(null);
      setDraft(null);
    },
    onCancel: () => setEditing(null)
  })));
}
function ProgramsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 900
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 8
    }
  }, "Programs"), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'name',
      label: 'Program'
    }, {
      key: 'loc',
      label: 'Locations'
    }, {
      key: 'cadence',
      label: 'Cadence',
      mono: true
    }, {
      key: 'status',
      label: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusChip, {
        status: r.status
      })
    }],
    rows: [{
      name: 'Classes',
      loc: 'De Anza · Murdock',
      cadence: 'SAT+SUN 2H · MON/TUE/THU 1.5H',
      status: 'ACTIVE'
    }, {
      name: 'Team tennis (USTA JTT)',
      loc: 'Bay Area league',
      cadence: 'FALL + SPRING',
      status: 'ACTIVE'
    }, {
      name: 'Private lessons',
      loc: 'De Anza · Murdock',
      cadence: 'BY APPOINTMENT',
      status: 'ACTIVE'
    }, {
      name: 'Summer camps',
      loc: 'De Anza',
      cadence: 'JUN W2 \u2013 JUL END',
      status: 'UPCOMING'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 8
    }
  }, "Seasonal events"), [['Summer camps 2027', '2027-06-07 \u2192 2027-07-30', 'RETURNS 2027'], ['Summer camps 2026', '2026-06-08 \u2192 2026-07-31', 'ENDED']].map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      padding: '10px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, e[0]), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, e[1], " \xB7 ", e[2]))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(11),
      marginTop: 12,
      marginBottom: 0
    }
  }, "THE HOMEPAGE CAMP BANNER AND NAV NOTE DERIVE FROM THESE WINDOWS \u2014 SEE PRODUCT.MD \xA712.")));
}
function PurchasesTab() {
  const m = useMobile();
  const [sort, setSort] = React.useState({
    key: 'date',
    dir: 'desc'
  });
  const [sel, setSel] = React.useState(null);
  const [confirmRefund, setConfirmRefund] = React.useState(false);
  const dir = sort.dir === 'asc' ? 1 : -1;
  const rows = [...ORDERS].sort((a, b) => a[sort.key] < b[sort.key] ? -dir : dir);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "AUG 2026 \xB7 5 ORDERS \xB7 $1,750.00 GROSS \xB7 $495.00 REFUNDED"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "STRIPE \xB7 SAMPLE DATA")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: m ? 0 : '8px 16px 12px',
      border: m ? 'none' : card.border,
      background: m ? 'transparent' : card.background
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'order',
      label: 'Order',
      mono: true,
      sortable: true
    }, {
      key: 'date',
      label: 'Date',
      mono: true,
      sortable: true
    }, {
      key: 'guardian',
      label: 'Guardian'
    }, {
      key: 'items',
      label: 'Items'
    }, {
      key: 'total',
      label: 'Total',
      numeric: true,
      sortable: true
    }, {
      key: 'status',
      label: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusChip, {
        status: r.status
      })
    }],
    rows: rows,
    sort: sort,
    onSort: (key, d) => setSort({
      key,
      dir: d
    }),
    page: 1,
    pages: 1,
    onRowClick: r => {
      setSel(r);
      setConfirmRefund(false);
    },
    empty: "NO ORDERS THIS PERIOD"
  })), /*#__PURE__*/React.createElement(Dialog, {
    open: !!sel,
    onClose: () => setSel(null),
    title: sel ? 'Order ' + sel.order : '',
    consequence: confirmRefund ? 'REFUNDING RETURNS ' + (sel ? sel.total : '') + ' AND REVOKES UNUSED CREDITS — THIS CANNOT BE UNDONE' : undefined,
    actions: sel && sel.status === 'PAID' ? confirmRefund ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setConfirmRefund(false)
    }, "Keep order"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      style: {
        color: 'var(--state-error)',
        borderColor: 'var(--state-error)'
      },
      onClick: () => setSel(null)
    }, "Refund ", sel.total)) : /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => setConfirmRefund(true)
    }, "Refund order") : null
  }, sel && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, sel.items), /*#__PURE__*/React.createElement("span", {
    style: mono(13, 'var(--ink)')
  }, sel.total)), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, sel.guardian.toUpperCase(), " \xB7 ", sel.email.toUpperCase(), " \xB7 ", sel.date), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: 'var(--hairline)',
      paddingTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lbl
  }, "Ledger"), sel.ledger.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: mono(12)
  }, l))))));
}
function AdminApp() {
  const m = useMobile();
  const P = window.MTAdminParts || {};
  const TAB_ITEMS = [{
    id: 'schedule',
    label: 'Schedule'
  }, {
    id: 'programs',
    label: 'Programs'
  }, {
    id: 'purchases',
    label: 'Purchases'
  }, {
    id: 'players',
    label: 'Players'
  }, {
    id: 'waivers',
    label: 'Waivers'
  }, {
    id: 'ratings',
    label: 'Ratings'
  }, {
    id: 'settings',
    label: 'Settings'
  }];
  const initial = TAB_ITEMS.findIndex(t => t.id === (location.hash || '').replace('#', ''));
  const [tab, setTab] = React.useState(initial >= 0 ? TAB_ITEMS[initial].id : 'schedule');
  const go = id => {
    setTab(id);
    location.hash = id;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(247,247,247,0.94)',
      backdropFilter: 'blur(6px)',
      borderBottom: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '0 16px' : '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "../website/index.html",
    "aria-label": "Momentum Tennis home",
    style: {
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    alt: "",
    style: {
      height: 36,
      display: 'block'
    }
  }), Wordmark && /*#__PURE__*/React.createElement(Wordmark, {
    variant: "word",
    height: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "ADMIN \xB7 ARTUR W. \xB7 SAMPLE DATA"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '24px 16px 12px' : '36px 32px 24px'
    },
    "data-screen-label": "Admin header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, Eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Admin console"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--size-h2)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Momentum Tennis")), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "SAT 2026-09-12 \xB7 DE ANZA + MURDOCK")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, Tabs && /*#__PURE__*/React.createElement(Tabs, {
    items: TAB_ITEMS,
    active: tab,
    onChange: go,
    mobileMode: "scroll",
    ariaLabel: "Admin sections"
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      ...container,
      padding: m ? '0 16px 96px' : '0 32px 96px'
    },
    "data-screen-label": tab
  }, tab === 'schedule' && /*#__PURE__*/React.createElement(ScheduleTab, null), tab === 'programs' && /*#__PURE__*/React.createElement(ProgramsTab, null), tab === 'purchases' && /*#__PURE__*/React.createElement(PurchasesTab, null), tab === 'players' && P.PlayersTab && /*#__PURE__*/React.createElement(P.PlayersTab, null), tab === 'waivers' && P.WaiversAdminTab && /*#__PURE__*/React.createElement(P.WaiversAdminTab, null), tab === 'ratings' && P.RatingsTab && /*#__PURE__*/React.createElement(P.RatingsTab, null), tab === 'settings' && P.SettingsTab && /*#__PURE__*/React.createElement(P.SettingsTab, null)));
}
Object.assign(window, {
  MTAdmin: {
    AdminApp
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/admin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/adminTabs.jsx
try { (() => {
const NS2 = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  Button: BtnA,
  Tabs: TabsA,
  DataTable: DT,
  StatusChip: Chip,
  Dialog: Dlg,
  Banner: Bnr,
  RatingMeter: RM,
  TextField: TF,
  TextArea: TA,
  SegmentedControl: Seg,
  DateField: DF,
  FormSection: FS,
  Select: Sel,
  Toast: Tst,
  EmptyState: ES
} = NS2;
const monoA = (s = 13, c) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: c || 'var(--text-secondary)'
});
const lblA = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const cardA = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};
const PLAYERS_ROWS = [{
  player: 'Maya R.',
  guardian: 'Priya R.',
  born: '2014 · MINOR',
  group: 'Green',
  waiver: 'SIGNED',
  credits: '8'
}, {
  player: 'Dev R.',
  guardian: 'Priya R.',
  born: '2016 · MINOR',
  group: 'Orange',
  waiver: 'NEEDS RE-CONSENT',
  credits: '2'
}, {
  player: 'Zara S.',
  guardian: 'Amir S.',
  born: '2013 · MINOR',
  group: 'Green',
  waiver: 'SIGNED',
  credits: '6'
}, {
  player: 'Leo M.',
  guardian: 'Sofia M.',
  born: '2015 · MINOR',
  group: 'Orange',
  waiver: 'SIGNED',
  credits: '3'
}, {
  player: 'Wei Z.',
  guardian: '— (self)',
  born: '1988',
  group: 'Adult clinic',
  waiver: 'SIGNED',
  credits: '4'
}];
function PlayersTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: monoA(12)
  }, "5 PLAYERS \xB7 4 MINORS \xB7 GUARDIANSHIP LINKS SHOWN \xB7 MINOR = DERIVED FROM BIRTH YEAR, NEVER STORED AS A FLAG"), /*#__PURE__*/React.createElement(DT, {
    columns: [{
      key: 'player',
      label: 'Player'
    }, {
      key: 'guardian',
      label: 'Guardian'
    }, {
      key: 'born',
      label: 'Born',
      mono: true
    }, {
      key: 'group',
      label: 'Group'
    }, {
      key: 'waiver',
      label: 'Waiver',
      render: r => /*#__PURE__*/React.createElement(Chip, {
        status: r.waiver
      })
    }, {
      key: 'credits',
      label: 'Credits',
      numeric: true
    }],
    rows: PLAYERS_ROWS,
    empty: "NO PLAYERS"
  }));
}
function WaiversAdminTab() {
  const [publish, setPublish] = React.useState(false);
  const DOCS = [{
    doc: 'Liability waiver',
    ver: 'V3',
    status: 'PUBLISHED',
    meta: 'PUBLISHED 2026-06-01 · 41 SIGNERS · 1 PENDING'
  }, {
    doc: 'Media release',
    ver: 'V2',
    status: 'PUBLISHED',
    meta: 'PUBLISHED 2025-09-14 · 38 SIGNERS'
  }, {
    doc: 'Liability waiver',
    ver: 'V4',
    status: 'DRAFT',
    meta: 'EDITED 2026-08-25 · UNPUBLISHED'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cardA
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lblA,
      marginBottom: 8
    }
  }, "Documents"), DOCS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '12px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, d.doc, " \u2014 ", d.ver), /*#__PURE__*/React.createElement("span", {
    style: monoA(11)
  }, d.meta)), /*#__PURE__*/React.createElement(Chip, {
    status: d.status
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...monoA(11),
      marginTop: 12,
      marginBottom: 0
    }
  }, "PUBLISHED VERSIONS ARE FROZEN \u2014 EDITS ALWAYS CREATE A NEW DRAFT.")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardA,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lblA
  }, "Version editor \u2014 draft"), /*#__PURE__*/React.createElement("span", {
    style: monoA(11)
  }, "LIABILITY WAIVER \xB7 V4 \xB7 DRAFT")), /*#__PURE__*/React.createElement(TA, {
    rows: 6,
    defaultValue: '[FROM LEGAL — PLACEHOLDER. THE DESIGN SYSTEM WRITES NO WAIVER LANGUAGE.]\n\nSection 1 — Assumption of risk…\nSection 2 — Media…',
    help: "ALL DOCUMENT COPY COMES FROM LEGAL"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(BtnA, {
    variant: "ghost",
    size: "sm"
  }, "Save draft"), /*#__PURE__*/React.createElement(BtnA, {
    variant: "secondary",
    size: "sm",
    onClick: () => setPublish(true)
  }, "Publish V4"))), /*#__PURE__*/React.createElement(Dlg, {
    open: publish,
    onClose: () => setPublish(false),
    title: "Publish V4",
    consequence: "PUBLISHING V4 REQUIRES RE-CONSENT FROM 41 SIGNERS AND FREEZES THE VERSION PERMANENTLY",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BtnA, {
      variant: "ghost",
      onClick: () => setPublish(false)
    }, "Keep as draft"), /*#__PURE__*/React.createElement(BtnA, {
      variant: "secondary",
      style: {
        color: 'var(--state-error)',
        borderColor: 'var(--state-error)'
      },
      onClick: () => setPublish(false)
    }, "Publish V4"))
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      lineHeight: 1.55,
      color: 'var(--ink)'
    }
  }, "Every family with a V3 signature is emailed a re-consent request. Booking pauses for players whose guardians have not re-signed.")));
}
const DIMS_DEFAULT = [{
  label: 'Technique',
  vis: 'family'
}, {
  label: 'Footwork',
  vis: 'family'
}, {
  label: 'Consistency',
  vis: 'family'
}, {
  label: 'Match play',
  vis: 'family'
}, {
  label: 'Attitude',
  vis: 'internal'
}];
function RatingsTab() {
  const [dims, setDims] = React.useState(DIMS_DEFAULT);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cardA
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lblA,
      marginBottom: 8
    }
  }, "Dimensions"), dims.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '12px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, d.label), /*#__PURE__*/React.createElement(Seg, {
    compact: true,
    options: [{
      value: 'family',
      label: 'Visible to family'
    }, {
      value: 'internal',
      label: 'Internal'
    }],
    value: d.vis,
    onChange: v => setDims(ds => ds.map((x, j) => j === i ? {
      ...x,
      vis: v
    } : x))
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...monoA(11),
      marginTop: 12,
      marginBottom: 0
    }
  }, "INTERNAL DIMENSIONS NEVER RENDER IN FAMILY-FACING VIEWS.")), /*#__PURE__*/React.createElement("div", {
    style: cardA
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lblA,
      marginBottom: 12
    }
  }, "Family-facing preview \u2014 Maya R."), /*#__PURE__*/React.createElement(RM, {
    dimensions: [{
      label: 'Technique',
      value: 3,
      trend: '+1 · JUL 28'
    }, {
      label: 'Footwork',
      value: 2,
      note: '2 OF 5 · SINCE JUN 14'
    }, {
      label: 'Consistency',
      value: 3
    }, {
      label: 'Match play',
      value: 2
    }]
  })));
}
function SettingsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(FS, {
    eyebrow: "Class times",
    description: "The three-block structure is fixed; the academy sets wall-clock starts each season. Weekend 2h = 3\xD740 min, weekday 1.5h = 3\xD730 min."
  }, [['SAT & SUN', '09:00 · 11:00', 'DE ANZA', '2H'], ['MON · TUE · THU', '16:00 · 17:00 · 18:30', 'MURDOCK', '1.5H']].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      padding: '10px 0',
      borderBottom: 'var(--hairline)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: monoA(12, 'var(--ink)')
  }, r[0]), /*#__PURE__*/React.createElement("span", {
    style: monoA(12)
  }, r[1], " \xB7 ", r[2], " \xB7 ", r[3]))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(BtnA, {
    variant: "secondary",
    size: "sm"
  }, "Edit season times"))), /*#__PURE__*/React.createElement(FS, {
    eyebrow: "Seasonal events",
    description: "Camps run only in summer \u2014 2nd week of June to end of July. The site derives ENROLLING NOW / RETURNS from these dates."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(DF, {
    label: "Camp start",
    defaultValue: "2027-06-07"
  }), /*#__PURE__*/React.createElement(DF, {
    label: "Camp end",
    defaultValue: "2027-07-30"
  })), /*#__PURE__*/React.createElement(TF, {
    label: "Banner blurb",
    defaultValue: "Tennis mornings, studio afternoons \u2014 chess, music production, photography, art."
  })), /*#__PURE__*/React.createElement(FS, {
    eyebrow: "Performance stats",
    description: "The homepage 'Sneak peek at our performance' numbers \u2014 one editable record."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(TF, {
    label: "Dual match wins",
    defaultValue: "155",
    inputStyle: {
      fontFamily: 'var(--font-mono)'
    }
  }), /*#__PURE__*/React.createElement(TF, {
    label: "League titles",
    defaultValue: "12",
    inputStyle: {
      fontFamily: 'var(--font-mono)'
    }
  }), /*#__PURE__*/React.createElement(TF, {
    label: "Winning %",
    defaultValue: "69.5",
    inputStyle: {
      fontFamily: 'var(--font-mono)'
    }
  }), /*#__PURE__*/React.createElement(TF, {
    label: "Range stamp",
    defaultValue: "FALL 2022 \u2013 SPRING 2026",
    inputStyle: {
      fontFamily: 'var(--font-mono)'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(BtnA, {
    variant: "secondary",
    size: "sm"
  }, "Save stats"))));
}

// —— Coach day sheet (mobile-first) ——
const ROSTER = ['Maya R.', 'Zara S.', 'Kiran T.', 'Leo M.', 'Anya P.', 'Rohan D.', 'Emma L.', 'Dev R.'];
function CoachSheet() {
  const [marked, setMarked] = React.useState({});
  const [toast, setToast] = React.useState(false);
  const [dims, setDims] = React.useState([{
    label: 'Technique',
    value: 3,
    note: 'LAST: 2 OF 5 · JUN 14'
  }, {
    label: 'Footwork',
    value: 2,
    note: 'LAST: 2 OF 5 · JUN 14'
  }, {
    label: 'Attitude',
    value: 0,
    internal: true,
    note: 'LAST: 4 OF 5 · JUL 02'
  }]);
  const [who, setWho] = React.useState('Maya R.');
  const [vis, setVis] = React.useState('family');
  const n = Object.values(marked).filter(Boolean).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      minHeight: '100vh',
      padding: '20px 16px 120px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: monoA(12)
  }, "THU \xB7 17:00\u201318:30 \xB7 GREEN BALL \xB7 MURDOCK \xB7 SAMPLE DATA"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.75rem',
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Coach sheet")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardA,
      padding: '8px 16px',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lblA
  }, "Attendance"), /*#__PURE__*/React.createElement("span", {
    style: monoA(12, 'var(--ink)')
  }, n, " / ", ROSTER.length, " MARKED")), ROSTER.map(p => {
    const on = !!marked[p];
    return /*#__PURE__*/React.createElement("button", {
      key: p,
      onClick: () => setMarked(m => ({
        ...m,
        [p]: !m[p]
      })),
      "aria-pressed": on,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 56,
        padding: '0 2px',
        background: 'none',
        border: 'none',
        borderBottom: 'var(--hairline)',
        cursor: 'pointer',
        borderRadius: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body)',
        fontWeight: 600,
        color: 'var(--ink)'
      }
    }, p), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: 28,
        height: 28,
        boxSizing: 'border-box',
        border: '1px solid ' + (on ? 'transparent' : 'rgba(27,27,27,0.4)'),
        background: on ? 'var(--court-400)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 0 8px',
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(BtnA, {
    variant: "secondary",
    size: "sm",
    onClick: () => setToast(true)
  }, "Save attendance"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardA,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lblA
  }, "Rate player"), Sel && /*#__PURE__*/React.createElement(Sel, {
    label: "Player",
    options: ROSTER,
    value: who,
    onChange: e => setWho(e.target.value)
  }), /*#__PURE__*/React.createElement(RM, {
    interactive: true,
    dimensions: dims,
    onChange: (di, v) => setDims(ds => ds.map((d, i) => i === di ? {
      ...d,
      value: v
    } : d))
  }), Seg && /*#__PURE__*/React.createElement(Seg, {
    label: "Visibility",
    fullWidth: true,
    options: [{
      value: 'family',
      label: 'Visible to family'
    }, {
      value: 'internal',
      label: 'Internal'
    }],
    value: vis,
    onChange: setVis
  }), TA && /*#__PURE__*/React.createElement(TA, {
    label: "Note",
    rows: 2,
    placeholder: "One observation from today"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(BtnA, {
    onClick: () => setToast(true)
  }, "Save rating"))), Tst && /*#__PURE__*/React.createElement(Tst, {
    open: toast,
    onDismiss: () => setToast(false)
  }, "Saved \xB7 ", n, " / ", ROSTER.length));
}
Object.assign(window, {
  MTAdminParts: {
    PlayersTab,
    WaiversAdminTab,
    RatingsTab,
    SettingsTab,
    CoachSheet
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/adminTabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/combined/portal-combined.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  SiteNav,
  Wordmark,
  FrameTicks,
  Button,
  Eyebrow,
  CourtMeter,
  TextField
} = NS;
const mono = (s = 13) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  color: 'var(--text-secondary)'
});
const lbl = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const h3 = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 900,
  fontSize: 'var(--size-h3)',
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  textTransform: 'uppercase',
  color: 'var(--ink)'
};
const card = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};
const container = {
  maxWidth: 'var(--container)',
  margin: '0 auto',
  padding: '0 32px'
};
const TABS = ['Stats', 'Calendar', 'Bookings', 'Store', 'Profile'];

// —— sample data (prototype only) ——
const SHOTS = [{
  k: 'Forehand',
  n: 142,
  peak: 0.86
}, {
  k: 'Backhand',
  n: 98,
  peak: 0.71
}, {
  k: 'Serve',
  n: 36,
  peak: 0.93
}, {
  k: 'Volley',
  n: 22,
  peak: 0.54
}];
const LEADERS = [['1', 'K. T.', 1240], ['2', 'M. R.', 1185], ['3', 'A. S.', 1120], ['4', 'J. L.', 1050], ['5', 'D. P.', 980]];
const ATTEND = [1, 1, 1, 0, 1, 1, 1, 1, 0, 1];
const PAYMENTS = [{
  item: 'Summer camp — Week 6 (full day)',
  amt: '$495',
  status: 'PAID · JUL 10'
}, {
  item: 'Junior classes — 8-session pack',
  amt: '$360',
  status: 'PAID · JUN 02'
}];
const BOOKINGS = [{
  title: 'Junior classes & teams',
  detail: 'Green ball · Murdock Park',
  sched: 'Mon · Tue · Thu 17:00–18:30',
  left: '5 of 8 sessions left',
  status: 'ACTIVE'
}, {
  title: 'Summer camp — Week 10',
  detail: '12U · De Anza College',
  sched: 'Aug 11–15 · 09:00–17:00',
  left: 'Full day',
  status: 'UPCOMING'
}];
const PACKAGES = [{
  name: 'Junior classes · 8 pack',
  price: '$360',
  member: '$324',
  detail: 'Any ball level · Murdock or De Anza'
}, {
  name: 'Summer camp · full week',
  price: '$495',
  member: '$445',
  detail: '09:00–17:00 · tennis + studios'
}, {
  name: 'Summer camp · half week',
  price: '$315',
  member: '$283',
  detail: '09:00–13:00 · tennis mornings'
}, {
  name: 'Adult clinic · 4 pack',
  price: '$220',
  member: '$198',
  detail: 'Weekend mornings · De Anza'
}];
const daySlots = d => {
  const dow = new Date(2026, 7, d).getDay();
  if (dow === 0 || dow === 6) return [{
    t: '09:00–11:00',
    p: 'Junior classes — all ball levels',
    loc: 'DE ANZA',
    spots: d % 3 + 1
  }, {
    t: '11:00–13:00',
    p: 'Yellow ball int. & advanced',
    loc: 'DE ANZA',
    spots: d % 2
  }, {
    t: '09:00–11:00',
    p: 'Adult clinic',
    loc: 'DE ANZA',
    spots: 2
  }];
  if (dow === 1 || dow === 2 || dow === 4) return [{
    t: '16:00–17:00',
    p: 'Orange ball',
    loc: 'MURDOCK',
    spots: d % 4
  }, {
    t: '17:00–18:30',
    p: 'Green ball',
    loc: 'MURDOCK',
    spots: (d + 1) % 3
  }, {
    t: '18:30–20:00',
    p: 'Yellow ball',
    loc: 'MURDOCK',
    spots: 2
  }];
  return [];
};
function StatsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "Session \u2014 Aug 6"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "GRIP SENSOR \xB7 IMU + PRESSURE \xB7 SYNCED 09:42")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16,
      borderTop: 'var(--hairline)',
      paddingTop: 16
    }
  }, SHOTS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2.25rem',
      lineHeight: 1,
      color: 'var(--ink)'
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginTop: 6
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--court-050)',
      marginTop: 10,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '0 auto 0 0',
      width: s.peak * 100 + '%',
      background: 'var(--court-400)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 4
    }
  }, "PEAK GRIP ", Math.round(s.peak * 100), "%")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "298 SHOTS CLASSIFIED \xB7 RALLY AVG 6.2 \xB7 LONGEST RALLY 19 \xB7 SWING SPEED P95 61 MPH")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 12
    }
  }, "Attendance \u2014 last 10 sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, ATTEND.map((a, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 18,
      height: 18,
      background: a ? 'var(--court-400)' : 'transparent',
      border: a ? '1px solid transparent' : 'var(--hairline)',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      marginLeft: 12
    }
  }, "8 / 10 \xB7 80%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, CourtMeter && /*#__PURE__*/React.createElement(CourtMeter, {
    court: 3,
    caption: "MOVED UP \xB7 JUL 28",
    label: "Court placement"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 14,
      marginBottom: 0
    }
  }, "COURTS ORDERED BY DIFFICULTY 1\u20135. COACHES MOVE PLAYERS BETWEEN COURTS DURING THE SEASON \u2014 THE METER FOLLOWS.")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Leaderboard \u2014 Green group"), LEADERS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r[0],
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[0].padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: r[1] === 'M. R.' ? 600 : 400,
      color: 'var(--ink)'
    }
  }, r[1], r[1] === 'M. R.' && ' — Maya'), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[2], " PTS")))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Payments"), PAYMENTS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, p.item), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      whiteSpace: 'nowrap'
    }
  }, p.amt, " \xB7 ", p.status))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(12),
      marginTop: 10
    }
  }, "NEXT: FALL JUNIORS PACKAGE \u2014 DUE SEP 1"))));
}
function CalendarTab() {
  const [sel, setSel] = React.useState(8);
  const first = new Date(2026, 7, 1).getDay(); // 6 = Sat
  const cells = [...Array(first).fill(null), ...Array.from({
    length: 31
  }, (_, i) => i + 1)];
  const slots = daySlots(sel);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "August 2026"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "DE ANZA + MURDOCK")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 4
    }
  }, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      ...mono(10.5),
      textAlign: 'center',
      padding: '4px 0'
    }
  }, d)), cells.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: 'e' + i
    });
    const n = daySlots(d).length;
    const open = daySlots(d).reduce((a, s) => a + s.spots, 0);
    const active = sel === d;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => setSel(d),
      style: {
        aspectRatio: '1/0.82',
        border: active ? '1px solid var(--ink)' : 'var(--hairline)',
        background: n ? active ? 'var(--court-050)' : 'var(--white)' : 'var(--surface-page)',
        cursor: n ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6px 7px',
        borderRadius: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: n ? 'var(--ink)' : 'var(--text-secondary)',
        textAlign: 'left'
      }
    }, d), n > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3
      }
    }, Array.from({
      length: n
    }, (_, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      style: {
        width: 6,
        height: 6,
        background: open ? 'var(--court-400)' : 'var(--court-200)'
      }
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 10
    }
  }, "\u25A0 = A SESSION RUNS THAT DAY \xB7 CLICK A DAY FOR SLOTS")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      ...h3,
      fontSize: '1.375rem'
    }
  }, "Aug ", sel), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, new Date(2026, 7, sel).toLocaleDateString('en-US', {
    weekday: 'long'
  }).toUpperCase())), slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: '12px 0 0'
    }
  }, "NO SESSIONS \u2014 COURTS REST ON WED & FRI."), slots.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '14px 0',
      borderTop: i ? 'var(--hairline)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--court-500)'
    }
  }, s.t), /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, s.p), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.spots > 0 ? s.spots + ' SPOTS OPEN' : 'WAITLIST'), Button && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#book"
  }, s.spots > 0 ? 'Book' : 'Join waitlist'))))));
}
function BookingsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 760
    }
  }, BOOKINGS.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...card,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '4px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, b.title), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(11),
      textAlign: 'right',
      color: b.status === 'ACTIVE' ? 'var(--accent-present-hover)' : 'var(--text-secondary)'
    }
  }, b.status), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, b.detail.toUpperCase(), " \xB7 ", b.sched.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      textAlign: 'right'
    }
  }, b.left.toUpperCase()))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: 0
    }
  }, "RESCHEDULES FOLLOW THE CANCELATION POLICY \u2014 24H NOTICE."));
}
function StoreTab() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, PACKAGES.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, p.detail.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.75rem',
      color: 'var(--ink)'
    }
  }, p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(11),
      color: 'var(--court-500)'
    }
  }, "MEMBER ", p.member)), Button && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#checkout"
  }, "Add to cart")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "MEMBER PRICING SHOWS WHEN A PARENT IS LOGGED IN \xB7 CHECKOUT + PAYMENT GATEWAY: SEE PRODUCT.MD"));
}
function ProfileTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      maxWidth: 860,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Parent \u2014 account owner"), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Name",
    defaultValue: "Priya R."
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Email",
    type: "email",
    defaultValue: "priya@example.com"
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Phone",
    type: "tel",
    defaultValue: "669-264-0000"
  }), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Save changes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Linked player"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, "Maya R. \u2014 Green group"), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "CHILD LOGIN: ENABLED \xB7 SHARES THIS ACCOUNT"), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "SEES: STATS \xB7 LEADERBOARD \xB7 CALENDAR", /*#__PURE__*/React.createElement("br", null), "HIDDEN: PAYMENTS \xB7 STORE CHECKOUT"), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Manage child access"))));
}
function Portal() {
  const initial = TABS.map(t => t.toLowerCase()).indexOf((location.hash || '').replace('#', ''));
  const [tab, setTab] = React.useState(initial >= 0 ? initial : 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      minHeight: '100vh'
    }
  }, SiteNav && /*#__PURE__*/React.createElement(SiteNav, {
    active: tab === 1 ? 'calendar' : tab === 3 ? 'store' : 'account',
    loggedIn: true,
    links: {
      home: '#',
      juniors: '#programs',
      camps: '#camp-day',
      adults: '#programs',
      jtt: '#proof',
      calendar: '#calendar',
      store: '#store',
      login: '#profile',
      book: '#book',
      logoSrc: window.__resources.logoMark
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: '40px 32px 32px'
    },
    "data-screen-label": "Portal header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, Eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Player portal"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--size-h2)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Maya R.")), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "PROTOTYPE \xB7 SAMPLE DATA \xB7 GREEN GROUP \xB7 MURDOCK PARK")), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Portal sections",
    style: {
      display: 'flex',
      gap: 26,
      marginTop: 28,
      borderBottom: 'var(--hairline)'
    }
  }, TABS.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => {
      setTab(i);
      location.hash = t.toLowerCase();
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0 2px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label)',
      textTransform: 'uppercase',
      color: tab === i ? 'var(--ink)' : 'var(--ink-secondary)',
      borderBottom: tab === i ? '2px solid var(--ink)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t)))), /*#__PURE__*/React.createElement("main", {
    style: {
      ...container,
      paddingBottom: 96
    },
    "data-screen-label": TABS[tab]
  }, tab === 0 && /*#__PURE__*/React.createElement(StatsTab, null), tab === 1 && /*#__PURE__*/React.createElement(CalendarTab, null), tab === 2 && /*#__PURE__*/React.createElement(BookingsTab, null), tab === 3 && /*#__PURE__*/React.createElement(StoreTab, null), tab === 4 && /*#__PURE__*/React.createElement(ProfileTab, null)));
}
Object.assign(window, {
  MTPortal: {
    Portal
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/combined/portal-combined.jsx", error: String((e && e.message) || e) }); }

// ui_kits/combined/sections-combined.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  Wordmark,
  StrobeArc,
  FrameTicks,
  Button,
  Eyebrow,
  PhotoFrame,
  ProgramCard,
  CampTimeline
} = NS;
const P = '../../assets/photos/';
const container = {
  maxWidth: 'var(--container,1200px)',
  margin: '0 auto',
  padding: '0 32px'
};
const h2Style = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 900,
  fontSize: 'var(--size-h2)',
  lineHeight: 1.04,
  letterSpacing: '0.012em',
  textTransform: 'uppercase'
};
function Header() {
  if (NS.SiteNav) return /*#__PURE__*/React.createElement(NS.SiteNav, {
    active: "home",
    links: {
      calendar: '#calendar',
      store: '#store',
      login: '#stats',
      juniors: '#programs',
      camps: '#camp-day',
      adults: '#programs',
      jtt: '#proof',
      book: '#book',
      logoSrc: window.__resources.logoMark
    }
  });
  const link = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--size-label)',
    fontWeight: 700,
    letterSpacing: 'var(--track-label)',
    textTransform: 'uppercase',
    color: 'var(--ink)',
    textDecoration: 'none',
    padding: '6px 2px'
  };
  return /*#__PURE__*/React.createElement("header", {
    "data-screen-label": "Header",
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(247,247,247,0.94)',
      backdropFilter: 'blur(6px)',
      borderBottom: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 72
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    style: {
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    },
    "aria-label": "Momentum Tennis home"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.logoMark,
    alt: "",
    style: {
      height: 42,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement(Wordmark, {
    variant: "word",
    height: 19
  })), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: {
      display: 'flex',
      gap: 28,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#programs"
  }, "Programs"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#camp-day"
  }, "Camps"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#proof"
  }, "Coaches"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)'
    }
  }, "669-264-6756"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#book"
  }, "Book a trial"))));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    "data-screen-label": "Hero",
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: 56,
      alignItems: 'center',
      padding: '88px 32px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Cupertino \xB7 De Anza College & Murdock Park"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'clamp(3rem,4.6vw,4.5rem)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Learn to see", /*#__PURE__*/React.createElement("br", null), "your own motion."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-lg)',
      lineHeight: 1.55,
      color: 'var(--text-secondary)',
      maxWidth: '46ch'
    }
  }, "Tennis training for juniors and adults, one frame at a time \u2014 small groups, match play every week, and coaching centered on your comprehension."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#book"
  }, "Book a free trial class"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    href: "#programs"
  }, "Explore programs")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.06em',
      color: 'var(--text-secondary)',
      borderTop: 'var(--hairline)',
      paddingTop: 16
    }
  }, "PTR-CERTIFIED COACHES \xB7 USTA JUNIOR TEAM TENNIS \xB7 SUMMER CAMPS AT DE ANZA COLLEGE")), /*#__PURE__*/React.createElement(PhotoFrame, {
    src: window.__resources.photoNetRally,
    alt: "Juniors rallying at the net on a blue hard court",
    ratio: "4:3",
    treatment: "slice",
    focal: "50% 45%",
    tag: "MURDOCK PARK",
    caption: "Rallies & games \u2014 green ball",
    captionRight: "THU 17:00 \xB7 t0 \u2192"
  })));
}
function Programs() {
  return /*#__PURE__*/React.createElement("section", {
    id: "programs",
    "data-screen-label": "Programs",
    style: {
      background: 'var(--surface-card)',
      borderTop: 'var(--hairline)',
      padding: '88px 0 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: container
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Programs"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--ink)'
    }
  }, "Juniors. Camps. Adults.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "Juniors",
    title: "Classes & team tennis",
    level: "Orange \u2192 Yellow ball",
    location: "De Anza \xB7 Murdock Park",
    photo: window.__resources.photoRacquets,
    photoAlt: "Junior players raising racquets",
    photoFocal: "50% 42%",
    schedule: [{
      days: 'Sat & Sun',
      time: '09:00–13:00',
      detail: 'De Anza'
    }, {
      days: 'Mon · Tue · Thu',
      time: '16:00–20:00',
      detail: 'Murdock'
    }],
    note: "Groups by ball level. USTA Junior Team Tennis \u2014 multiple Momentum teams with a public match schedule against Bay Area clubs.",
    ctaLabel: "Junior schedule",
    ctaHref: "#junior"
  }), /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "Summer",
    title: "Camps at De Anza",
    level: "10U \xB7 12U \xB7 14U \xB7 16U",
    location: "De Anza College",
    photo: window.__resources.photoTeamWide,
    photoAlt: "Camp group on court",
    photoFocal: "50% 55%",
    schedule: [{
      days: 'Mon – Fri',
      time: '09:00–17:00',
      detail: 'Full day'
    }, {
      days: 'Mon – Fri',
      time: '09:00–13:00',
      detail: 'Half day'
    }, {
      days: '10 weeks',
      time: 'Jun 9 – Aug 15'
    }],
    note: "Tennis all morning. Afternoons: chess, then music production, photography, art \u2014 in De Anza studios.",
    ctaLabel: "See the camp day",
    ctaHref: "#camp-day"
  }), /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "Adults",
    title: "Adult programs",
    level: "Beginner \u2192 competitive",
    location: "De Anza College",
    photo: window.__resources.photoCourtWalk,
    photoAlt: "Players walking the court",
    photoFocal: "50% 50%",
    schedule: [{
      days: 'Sat & Sun',
      time: 'Mornings'
    }],
    note: "Clinics and private coaching, personalized to your learning style. Schedule set each season.",
    ctaLabel: "Ask about clinics",
    ctaHref: "#book"
  }))));
}
function CampDay() {
  return /*#__PURE__*/React.createElement("section", {
    id: "camp-day",
    "data-screen-label": "Camp day",
    className: "on-field",
    style: {
      background: 'var(--surface-field)',
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'grid',
      gridTemplateColumns: '0.9fr 1.1fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    onField: true
  }, "A camp day"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--line-white)'
    }
  }, "Mornings on court. Afternoons in the studio."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body)',
      lineHeight: 1.6,
      color: 'var(--text-on-field-dim)',
      maxWidth: '44ch'
    }
  }, "The same discipline, five mediums. Players train technique and match play through the morning, then carry the habit of careful observation into chess, music production, photography and art."), /*#__PURE__*/React.createElement(StrobeArc, {
    tone: "field",
    annotate: true,
    frames: 8,
    height: 150
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--hairline)',
      padding: '20px 24px'
    }
  }, /*#__PURE__*/React.createElement(CampTimeline, null))));
}
function Proof() {
  const name = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'var(--size-body)',
    color: 'var(--ink)'
  };
  const cred = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em'
  };
  const row = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '12px 0',
    borderBottom: 'var(--hairline)'
  };
  const colH = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--size-label)',
    fontWeight: 700,
    letterSpacing: 'var(--track-label)',
    textTransform: 'uppercase',
    color: 'var(--court-500)',
    margin: 0
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "proof",
    "data-screen-label": "Proof",
    style: {
      background: 'var(--surface-page)',
      borderTop: 'var(--hairline)',
      padding: '88px 0 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: container
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Proof"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--ink)'
    }
  }, "Credentials on court,", /*#__PURE__*/React.createElement("br", null), "results in matches.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1.2fr',
      gap: 48,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: colH
  }, "Coaches"), /*#__PURE__*/React.createElement("div", {
    style: row
  }, /*#__PURE__*/React.createElement("span", {
    style: name
  }, "Artur Westergren"), /*#__PURE__*/React.createElement("span", {
    style: cred
  }, "HEAD COACH \xB7 PTR \xB7 EX-NORCAL TENNIS ACADEMY")), /*#__PURE__*/React.createElement("div", {
    style: row
  }, /*#__PURE__*/React.createElement("span", {
    style: name
  }, "Vishal"), /*#__PURE__*/React.createElement("span", {
    style: cred
  }, "PTR")), /*#__PURE__*/React.createElement("div", {
    style: row
  }, /*#__PURE__*/React.createElement("span", {
    style: name
  }, "Elsio"), /*#__PURE__*/React.createElement("span", {
    style: cred
  }, "USTA HIGH PERFORMANCE"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: colH
  }, "Team tennis"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 0 16px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      lineHeight: 1.6,
      color: 'var(--text-secondary)'
    }
  }, "Multiple Momentum teams play USTA Junior Team Tennis with a public match schedule against some twenty Bay Area clubs. Competing is part of the curriculum, not a graduation from it."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#jtt"
  }, "JTT match schedule")), /*#__PURE__*/React.createElement(PhotoFrame, {
    src: window.__resources.photoChamps,
    alt: "Momentum teams at a USTA Junior Team Tennis championship",
    ratio: "3:2",
    focal: "50% 55%",
    tag: "USTA JTT CHAMPIONSHIP",
    caption: "Momentum teams, sectional championship",
    captionRight: "BAY AREA"
  }))));
}
function Quote() {
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Quote",
    style: {
      background: 'var(--surface-tint)',
      borderTop: 'var(--hairline)',
      padding: '80px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      maxWidth: 900
    }
  }, /*#__PURE__*/React.createElement(FrameTicks, null), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: '20px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'clamp(1.75rem,3vw,2.5rem)',
      lineHeight: 1.12,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "\"If our students aren't improving \u2014 we aren't growing as coaches.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      color: 'var(--text-secondary)'
    }
  }, "ARTUR WESTERGREN \xB7 HEAD COACH")));
}
function CTABand() {
  return /*#__PURE__*/React.createElement("section", {
    id: "book",
    "data-screen-label": "Book",
    className: "on-field",
    style: {
      background: 'var(--surface-field-deep)',
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.logoMarkField,
    alt: "",
    style: {
      height: 84,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      fontSize: 'clamp(2.25rem,3.6vw,3.25rem)',
      color: 'var(--line-white)'
    }
  }, "Book a free trial class."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body)',
      lineHeight: 1.6,
      color: 'var(--text-on-field-dim)',
      maxWidth: '44ch'
    }
  }, "One session on court with a PTR-certified coach. See where your game is now \u2014 and what the next frame looks like."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#book"
  }, "Book a free trial class"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--text-on-field-dim)'
    }
  }, "CALL OR WHATSAPP \xB7 669-264-6756"))));
}
function Footer() {
  const link = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--size-label-sm)',
    fontWeight: 700,
    letterSpacing: 'var(--track-label)',
    textTransform: 'uppercase',
    color: 'var(--ink)',
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("footer", {
    "data-screen-label": "Footer",
    style: {
      background: 'var(--surface-page)',
      borderTop: 'var(--hairline)',
      padding: '48px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.logoFull,
    alt: "Momentum Tennis",
    style: {
      height: 76,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Footer",
    style: {
      display: 'flex',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#programs"
  }, "Classes"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#camp-day"
  }, "Camps"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#jtt"
  }, "JTT schedule"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#proof"
  }, "Staff"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#book"
  }, "Contact")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
      textAlign: 'right'
    }
  }, "DE ANZA COLLEGE \xB7 21250 STEVENS CREEK BLVD, CUPERTINO, CA", /*#__PURE__*/React.createElement("br", null), "MURDOCK PARK \xB7 CUPERTINO, CA", /*#__PURE__*/React.createElement("br", null), "\xA9 2026 MOMENTUM TENNIS LLC")));
}
function HomePage() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Programs, null), /*#__PURE__*/React.createElement(CampDay, null), /*#__PURE__*/React.createElement(Proof, null), /*#__PURE__*/React.createElement(Quote, null), /*#__PURE__*/React.createElement(CTABand, null), /*#__PURE__*/React.createElement(Footer, null));
}
Object.assign(window, {
  MTSections: {
    Header,
    Hero,
    Programs,
    CampDay,
    Proof,
    Quote,
    CTABand,
    Footer,
    HomePage
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/combined/sections-combined.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/portal-flows.jsx
try { (() => {
const NSF = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  Button: FBtn,
  TextField: FTF,
  Checkbox: FChk,
  Select: FSel,
  Banner: FBnr,
  StatusChip: FChip,
  FrameTicks: FTicks,
  EmptyState: FES
} = NSF;
const fmono = (s = 13, c) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: c || 'var(--text-secondary)'
});
const flbl = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const fcard = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};

// —— SAMPLE DATA: one account, two players (multi-player household) ——
const PLAYERS = [{
  id: 'maya',
  name: 'Maya R.',
  group: 'Green group · Murdock Park',
  credits: 8,
  creditsExpire: '2027-03-01',
  court: 3,
  gate: null
}, {
  id: 'dev',
  name: 'Dev R.',
  group: 'Orange group · Murdock Park',
  credits: 2,
  creditsExpire: '2026-11-15',
  court: 2,
  gate: {
    doc: 'Liability waiver',
    version: 'V3',
    published: '2026-06-01'
  }
}];
const WAIVER_DOCS = [{
  id: 'liability',
  title: 'Liability waiver',
  version: 'V3',
  published: '2026-06-01'
}, {
  id: 'media',
  title: 'Media release',
  version: 'V2',
  published: '2025-09-14'
}];
function PlayerSwitcher({
  players,
  current,
  onChange
}) {
  return React.createElement('div', {
    role: 'group',
    'aria-label': 'Player',
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, players.map(p => React.createElement('button', {
    key: p.id,
    'aria-pressed': p.id === current,
    onClick: () => onChange(p.id),
    style: {
      minHeight: 44,
      padding: '0 14px',
      background: p.id === current ? 'var(--court-050)' : 'none',
      cursor: 'pointer',
      borderRadius: 0,
      border: p.id === current ? '1px solid var(--ink)' : '1px solid var(--border-hairline)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--ink)',
      fontWeight: p.id === current ? 600 : 400
    }
  }, p.name)));
}
function CreditsCard({
  player,
  onStore
}) {
  const low = player.credits <= 2;
  return /*#__PURE__*/React.createElement("div", {
    style: fcard
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: flbl
  }, "Credits \u2014 ", player.name), /*#__PURE__*/React.createElement("span", {
    style: fmono(11)
  }, "EXPIRES ", player.creditsExpire)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2.75rem',
      lineHeight: 1,
      color: 'var(--ink)'
    }
  }, player.credits), /*#__PURE__*/React.createElement("span", {
    style: fmono(12)
  }, "CLASS CREDITS LEFT")), low && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      borderTop: 'var(--hairline)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "alert",
    style: fmono(11, 'var(--state-error)')
  }, "LOW BALANCE \u2014 ", player.credits, " LEFT COVERS ", player.credits, " MORE ", player.credits === 1 ? 'CLASS' : 'CLASSES'), FBtn && /*#__PURE__*/React.createElement(FBtn, {
    variant: "ghost",
    size: "sm",
    onClick: onStore
  }, "Buy a pack \u2192")));
}
function ReconsentBanner({
  player,
  onGo
}) {
  if (!player.gate) return null;
  return /*#__PURE__*/React.createElement(FBnr, {
    tone: "error",
    action: FBtn ? /*#__PURE__*/React.createElement(FBtn, {
      variant: "secondary",
      size: "sm",
      onClick: onGo
    }, "Review & sign") : null
  }, player.name, " needs re-consent \u2014 ", player.gate.doc, " ", player.gate.version, ". Booking is paused until a guardian re-signs.");
}
function WaiversTab({
  player,
  signed,
  onSign,
  guardian = 'Priya R.'
}) {
  const [view, setView] = React.useState('list'); // list | sign | receipt
  const [doc, setDoc] = React.useState(WAIVER_DOCS[0]);
  const [name, setName] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  const gate = player.gate && !signed[player.id + ':' + player.gate.doc];
  const status = d => {
    if (player.gate && d.title === player.gate.doc && !signed[player.id + ':' + d.title]) return {
      chip: 'NEEDS RE-CONSENT',
      meta: 'YOUR SIGNATURE IS FOR V2 · ' + d.version + ' PUBLISHED ' + d.published
    };
    return {
      chip: 'SIGNED',
      meta: 'SIGNED · ' + d.version + ' · JUN 01 · BY ' + guardian.toUpperCase()
    };
  };
  if (view === 'sign') return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FBtn, {
    variant: "ghost",
    size: "sm",
    onClick: () => setView('list')
  }, "\u2190 All waivers")), /*#__PURE__*/React.createElement("div", {
    style: fmono(12, 'var(--ink)')
  }, doc.title.toUpperCase(), " \xB7 ", doc.version, " \xB7 PUBLISHED ", doc.published), /*#__PURE__*/React.createElement("div", {
    style: {
      border: 'var(--hairline)',
      background: 'var(--white)',
      height: 240,
      overflowY: 'auto',
      padding: '16px 20px'
    },
    tabIndex: 0,
    "aria-label": "Waiver document"
  }, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      margin: '0 0 14px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      lineHeight: 1.6,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: fmono(10.5)
  }, "[FROM LEGAL \u2014 PLACEHOLDER SECTION ", i, "] "), "The design system writes no waiver language. Final copy is supplied and versioned by counsel; this frame shows the mechanism only."))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...fmono(12, 'var(--ink)'),
      border: 'var(--hairline)',
      background: 'var(--court-050)',
      padding: '10px 14px'
    }
  }, "SIGNING AS PARENT/GUARDIAN FOR ", player.name.toUpperCase(), " \u2014 SET BY YOUR ACCOUNT, NOT EDITABLE"), FTF && /*#__PURE__*/React.createElement(FTF, {
    label: "Type your full legal name",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: guardian,
    inputStyle: {
      fontFamily: 'var(--font-mono)'
    },
    help: "YOUR TYPED NAME IS THE SIGNATURE OF RECORD"
  }), FChk && /*#__PURE__*/React.createElement(FChk, {
    consent: true,
    label: 'I have read ' + doc.title + ' ' + doc.version + ' and agree on behalf of ' + player.name + '.',
    checked: agree,
    onChange: e => setAgree(e.target.checked)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, FBtn && /*#__PURE__*/React.createElement(FBtn, {
    disabled: name.trim().length < 3 || !agree,
    onClick: () => {
      onSign(player.id + ':' + doc.title);
      setView('receipt');
    }
  }, "Sign waiver"), /*#__PURE__*/React.createElement("span", {
    style: fmono(11)
  }, "2026-08-28 \xB7 RECORDED WITH TIMESTAMP + VERSION")));
  if (view === 'receipt') return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-start'
    }
  }, FTicks && /*#__PURE__*/React.createElement(FTicks, null), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.375rem',
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Signed."), /*#__PURE__*/React.createElement("div", {
    style: fmono(12, 'var(--ink)')
  }, "SIGNED \xB7 ", doc.version, " \xB7 2026-08-28 \xB7 ", (name || guardian).toUpperCase(), " \xB7 GUARDIAN OF ", player.name.toUpperCase()), FBnr && /*#__PURE__*/React.createElement(FBnr, null, "A copy was emailed to priya@example.com. Booking for ", player.name, " resumes immediately."), /*#__PURE__*/React.createElement(FBtn, {
    variant: "ghost",
    size: "sm",
    onClick: () => {
      setView('list');
      setName('');
      setAgree(false);
    }
  }, "\u2190 All waivers"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, gate && /*#__PURE__*/React.createElement(ReconsentBanner, {
    player: player,
    onGo: () => {
      setDoc(WAIVER_DOCS[0]);
      setView('sign');
    }
  }), WAIVER_DOCS.map(d => {
    const s = status(d);
    return /*#__PURE__*/React.createElement("div", {
      key: d.id,
      style: {
        ...fcard,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body)',
        fontWeight: 600,
        color: 'var(--ink)'
      }
    }, d.title, " \u2014 ", player.name), /*#__PURE__*/React.createElement("span", {
      style: fmono(11)
    }, s.meta)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        alignItems: 'center'
      }
    }, FChip && /*#__PURE__*/React.createElement(FChip, {
      status: s.chip
    }), FBtn && (s.chip === 'NEEDS RE-CONSENT' ? /*#__PURE__*/React.createElement(FBtn, {
      variant: "secondary",
      size: "sm",
      onClick: () => {
        setDoc(d);
        setView('sign');
      }
    }, "Review & sign") : /*#__PURE__*/React.createElement(FBtn, {
      variant: "ghost",
      size: "sm",
      onClick: () => {
        setDoc(d);
        setView('sign');
      }
    }, "View"))));
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      ...fmono(11),
      margin: 0
    }
  }, "PUBLISHED VERSIONS ARE FROZEN. A NEW VERSION FROM THE ACADEMY PAUSES BOOKING UNTIL A GUARDIAN RE-SIGNS."));
}
const PACKAGES_F = [{
  id: 'jr8',
  name: 'Junior classes · 8 pack',
  price: 360,
  member: 324,
  detail: 'Any ball level · Murdock or De Anza',
  credits: 8
}, {
  id: 'campfw',
  name: 'Summer camp · full week',
  price: 495,
  member: 445,
  detail: '09:00–17:00 · tennis + studios',
  credits: 0
}, {
  id: 'camphw',
  name: 'Summer camp · half week',
  price: 315,
  member: 283,
  detail: '09:00–13:00 · tennis mornings',
  credits: 0
}, {
  id: 'ad4',
  name: 'Adult clinic · 4 pack',
  price: 220,
  member: 198,
  detail: 'Weekend mornings · De Anza',
  credits: 4
}];
const usd = n => '$' + n.toFixed(2);
function StoreFlow({
  players,
  isMobile,
  defaultPlayer
}) {
  const [cart, setCart] = React.useState([]);
  const [state, setState] = React.useState('shop'); // shop | paid
  const total = cart.reduce((a, c) => a + PACKAGES_F.find(p => p.id === c.pkg).member, 0);
  const unassigned = cart.some(c => !c.player);
  if (state === 'paid') return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-start'
    }
  }, FTicks && /*#__PURE__*/React.createElement(FTicks, null), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.375rem',
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Paid."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: fmono(12, 'var(--ink)')
  }, "PAID \xB7 ", usd(total), " \xB7 ORDER M-1043 \xB7 2026-08-28"), cart.map((c, i) => {
    const p = PACKAGES_F.find(x => x.id === c.pkg);
    const pl = players.find(x => x.id === c.player);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: fmono(12)
    }, p.credits ? p.credits + ' CREDITS ISSUED · ' + pl.name.toUpperCase() + ' · EXPIRES 2027-03-01' : p.name.toUpperCase() + ' · ' + pl.name.toUpperCase());
  }), /*#__PURE__*/React.createElement("span", {
    style: fmono(12)
  }, "STRIPE CHECKOUT REF CS_A1B2C3D4 \xB7 RECEIPT EMAILED")), FBtn && /*#__PURE__*/React.createElement(FBtn, {
    variant: "ghost",
    size: "sm",
    onClick: () => {
      setCart([]);
      setState('shop');
    }
  }, "\u2190 Back to store"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile || !cart.length ? '1fr' : '2fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(' + (cart.length ? 2 : 4) + ',1fr)',
      gap: isMobile ? 12 : 16
    }
  }, PACKAGES_F.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      ...fcard,
      padding: isMobile ? '16px 16px' : fcard.padding,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: fmono(12)
  }, p.detail.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.75rem',
      color: 'var(--ink)'
    }
  }, usd(p.price)), /*#__PURE__*/React.createElement("span", {
    style: fmono(11, 'var(--court-500)')
  }, "MEMBER ", usd(p.member), " \u2014 APPLIED AT CHECKOUT")), FBtn && /*#__PURE__*/React.createElement(FBtn, {
    variant: "secondary",
    size: "sm",
    onClick: () => setCart(c => [...c, {
      pkg: p.id,
      player: defaultPlayer
    }])
  }, "Add to cart")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...fmono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "PUBLIC PRICES SHOWN TO SIGNED-OUT VISITORS \xB7 MEMBER PRICES REQUIRE A GUARDIAN LOGIN")), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...fcard,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: flbl
  }, "Cart \u2014 ", cart.length, " ", cart.length === 1 ? 'item' : 'items'), cart.map((c, i) => {
    const p = PACKAGES_F.find(x => x.id === c.pkg);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        borderBottom: 'var(--hairline)',
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body-sm)',
        fontWeight: 600,
        color: 'var(--ink)'
      }
    }, p.name), /*#__PURE__*/React.createElement("button", {
      onClick: () => setCart(cs => cs.filter((_, j) => j !== i)),
      "aria-label": 'Remove ' + p.name,
      style: {
        width: 32,
        height: 32,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: '1rem',
        color: 'var(--ink)'
      }
    }, "\xD7")), FSel && /*#__PURE__*/React.createElement(FSel, {
      label: "For player",
      options: players.map(pl => ({
        value: pl.id,
        label: pl.name
      })),
      value: c.player || '',
      placeholder: "Assign a player",
      onChange: e => setCart(cs => cs.map((x, j) => j === i ? {
        ...x,
        player: e.target.value
      } : x)),
      error: c.player ? undefined : 'credits belong to a named player'
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: fmono(11)
    }, usd(p.price), " PUBLIC"), /*#__PURE__*/React.createElement("span", {
      style: fmono(12, 'var(--ink)')
    }, usd(p.member), " MEMBER")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: flbl
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    style: fmono(14, 'var(--ink)')
  }, usd(total))), /*#__PURE__*/React.createElement("span", {
    style: fmono(10.5)
  }, "CREDITS BELONG TO THE NAMED PLAYER \u2014 THEY ARE NOT TRANSFERABLE BETWEEN SIBLINGS."), FBtn && /*#__PURE__*/React.createElement(FBtn, {
    disabled: unassigned,
    onClick: () => setState('paid')
  }, "Continue to payment"), /*#__PURE__*/React.createElement("span", {
    style: fmono(10.5)
  }, "STRIPE-HOSTED CHECKOUT FOLLOWS \xB7 CARD DETAILS NEVER TOUCH THIS SITE")));
}
Object.assign(window, {
  MTPortalFlows: {
    PLAYERS,
    PlayerSwitcher,
    CreditsCard,
    ReconsentBanner,
    WaiversTab,
    StoreFlow
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/portal-flows.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/portal-standalone.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  SiteNav,
  Wordmark,
  FrameTicks,
  Button,
  Eyebrow,
  CourtMeter,
  TextField
} = NS;
const mono = (s = 13) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  color: 'var(--text-secondary)'
});
const lbl = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const h3 = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 900,
  fontSize: 'var(--size-h3)',
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  textTransform: 'uppercase',
  color: 'var(--ink)'
};
const card = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};
const container = {
  maxWidth: 'var(--container)',
  margin: '0 auto',
  padding: '0 32px'
};
const TABS = ['Stats', 'Calendar', 'Bookings', 'Store', 'Profile'];

// —— sample data (prototype only) ——
const SHOTS = [{
  k: 'Forehand',
  n: 142,
  peak: 0.86
}, {
  k: 'Backhand',
  n: 98,
  peak: 0.71
}, {
  k: 'Serve',
  n: 36,
  peak: 0.93
}, {
  k: 'Volley',
  n: 22,
  peak: 0.54
}];
const LEADERS = [['1', 'K. T.', 1240], ['2', 'M. R.', 1185], ['3', 'A. S.', 1120], ['4', 'J. L.', 1050], ['5', 'D. P.', 980]];
const ATTEND = [1, 1, 1, 0, 1, 1, 1, 1, 0, 1];
const PAYMENTS = [{
  item: 'Summer camp — Week 6 (full day)',
  amt: '$495',
  status: 'PAID · JUL 10'
}, {
  item: 'Junior classes — 8-session pack',
  amt: '$360',
  status: 'PAID · JUN 02'
}];
const BOOKINGS = [{
  title: 'Junior classes & teams',
  detail: 'Green ball · Murdock Park',
  sched: 'Mon · Tue · Thu 17:00–18:30',
  left: '5 of 8 sessions left',
  status: 'ACTIVE'
}, {
  title: 'Summer camp — Week 10',
  detail: '12U · De Anza College',
  sched: 'Aug 11–15 · 09:00–17:00',
  left: 'Full day',
  status: 'UPCOMING'
}];
const PACKAGES = [{
  name: 'Junior classes · 8 pack',
  price: '$360',
  member: '$324',
  detail: 'Any ball level · Murdock or De Anza'
}, {
  name: 'Summer camp · full week',
  price: '$495',
  member: '$445',
  detail: '09:00–17:00 · tennis + studios'
}, {
  name: 'Summer camp · half week',
  price: '$315',
  member: '$283',
  detail: '09:00–13:00 · tennis mornings'
}, {
  name: 'Adult clinic · 4 pack',
  price: '$220',
  member: '$198',
  detail: 'Weekend mornings · De Anza'
}];
const daySlots = d => {
  const dow = new Date(2026, 7, d).getDay();
  if (dow === 0 || dow === 6) return [{
    t: '09:00–11:00',
    p: 'Junior classes — all ball levels',
    loc: 'DE ANZA',
    spots: d % 3 + 1
  }, {
    t: '11:00–13:00',
    p: 'Yellow ball int. & advanced',
    loc: 'DE ANZA',
    spots: d % 2
  }, {
    t: '09:00–11:00',
    p: 'Adult clinic',
    loc: 'DE ANZA',
    spots: 2
  }];
  if (dow === 1 || dow === 2 || dow === 4) return [{
    t: '16:00–17:00',
    p: 'Orange ball',
    loc: 'MURDOCK',
    spots: d % 4
  }, {
    t: '17:00–18:30',
    p: 'Green ball',
    loc: 'MURDOCK',
    spots: (d + 1) % 3
  }, {
    t: '18:30–20:00',
    p: 'Yellow ball',
    loc: 'MURDOCK',
    spots: 2
  }];
  return [];
};
function StatsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "Session \u2014 Aug 6"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "GRIP SENSOR \xB7 IMU + PRESSURE \xB7 SYNCED 09:42")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16,
      borderTop: 'var(--hairline)',
      paddingTop: 16
    }
  }, SHOTS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2.25rem',
      lineHeight: 1,
      color: 'var(--ink)'
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginTop: 6
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--court-050)',
      marginTop: 10,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '0 auto 0 0',
      width: s.peak * 100 + '%',
      background: 'var(--court-400)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 4
    }
  }, "PEAK GRIP ", Math.round(s.peak * 100), "%")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "298 SHOTS CLASSIFIED \xB7 RALLY AVG 6.2 \xB7 LONGEST RALLY 19 \xB7 SWING SPEED P95 61 MPH")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 12
    }
  }, "Attendance \u2014 last 10 sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, ATTEND.map((a, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 18,
      height: 18,
      background: a ? 'var(--court-400)' : 'transparent',
      border: a ? '1px solid transparent' : 'var(--hairline)',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      marginLeft: 12
    }
  }, "8 / 10 \xB7 80%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, CourtMeter && /*#__PURE__*/React.createElement(CourtMeter, {
    court: 3,
    caption: "MOVED UP \xB7 JUL 28",
    label: "Court placement"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 14,
      marginBottom: 0
    }
  }, "COURTS ORDERED BY DIFFICULTY 1\u20135. COACHES MOVE PLAYERS BETWEEN COURTS DURING THE SEASON \u2014 THE METER FOLLOWS.")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Leaderboard \u2014 Green group"), LEADERS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r[0],
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[0].padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: r[1] === 'M. R.' ? 600 : 400,
      color: 'var(--ink)'
    }
  }, r[1], r[1] === 'M. R.' && ' — Maya'), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[2], " PTS")))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Payments"), PAYMENTS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, p.item), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      whiteSpace: 'nowrap'
    }
  }, p.amt, " \xB7 ", p.status))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(12),
      marginTop: 10
    }
  }, "NEXT: FALL JUNIORS PACKAGE \u2014 DUE SEP 1"))));
}
function CalendarTab() {
  const [sel, setSel] = React.useState(8);
  const first = new Date(2026, 7, 1).getDay(); // 6 = Sat
  const cells = [...Array(first).fill(null), ...Array.from({
    length: 31
  }, (_, i) => i + 1)];
  const slots = daySlots(sel);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "August 2026"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "DE ANZA + MURDOCK")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 4
    }
  }, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      ...mono(10.5),
      textAlign: 'center',
      padding: '4px 0'
    }
  }, d)), cells.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: 'e' + i
    });
    const n = daySlots(d).length;
    const open = daySlots(d).reduce((a, s) => a + s.spots, 0);
    const active = sel === d;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => setSel(d),
      style: {
        aspectRatio: '1/0.82',
        border: active ? '1px solid var(--ink)' : 'var(--hairline)',
        background: n ? active ? 'var(--court-050)' : 'var(--white)' : 'var(--surface-page)',
        cursor: n ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6px 7px',
        borderRadius: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: n ? 'var(--ink)' : 'var(--text-secondary)',
        textAlign: 'left'
      }
    }, d), n > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3
      }
    }, Array.from({
      length: n
    }, (_, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      style: {
        width: 6,
        height: 6,
        background: open ? 'var(--court-400)' : 'var(--court-200)'
      }
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 10
    }
  }, "\u25A0 = A SESSION RUNS THAT DAY \xB7 CLICK A DAY FOR SLOTS")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      ...h3,
      fontSize: '1.375rem'
    }
  }, "Aug ", sel), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, new Date(2026, 7, sel).toLocaleDateString('en-US', {
    weekday: 'long'
  }).toUpperCase())), slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: '12px 0 0'
    }
  }, "NO SESSIONS \u2014 COURTS REST ON WED & FRI."), slots.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '14px 0',
      borderTop: i ? 'var(--hairline)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--court-500)'
    }
  }, s.t), /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, s.p), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.spots > 0 ? s.spots + ' SPOTS OPEN' : 'WAITLIST'), Button && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#book"
  }, s.spots > 0 ? 'Book' : 'Join waitlist'))))));
}
function BookingsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 760
    }
  }, BOOKINGS.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...card,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '4px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, b.title), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(11),
      textAlign: 'right',
      color: b.status === 'ACTIVE' ? 'var(--accent-present-hover)' : 'var(--text-secondary)'
    }
  }, b.status), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, b.detail.toUpperCase(), " \xB7 ", b.sched.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      textAlign: 'right'
    }
  }, b.left.toUpperCase()))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: 0
    }
  }, "RESCHEDULES FOLLOW THE CANCELATION POLICY \u2014 24H NOTICE."));
}
function StoreTab() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, PACKAGES.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, p.detail.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.75rem',
      color: 'var(--ink)'
    }
  }, p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(11),
      color: 'var(--court-500)'
    }
  }, "MEMBER ", p.member)), Button && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#checkout"
  }, "Add to cart")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "MEMBER PRICING SHOWS WHEN A PARENT IS LOGGED IN \xB7 CHECKOUT + PAYMENT GATEWAY: SEE PRODUCT.MD"));
}
function ProfileTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      maxWidth: 860,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Parent \u2014 account owner"), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Name",
    defaultValue: "Priya R."
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Email",
    type: "email",
    defaultValue: "priya@example.com"
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Phone",
    type: "tel",
    defaultValue: "669-264-0000"
  }), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Save changes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Linked player"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, "Maya R. \u2014 Green group"), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "CHILD LOGIN: ENABLED \xB7 SHARES THIS ACCOUNT"), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "SEES: STATS \xB7 LEADERBOARD \xB7 CALENDAR", /*#__PURE__*/React.createElement("br", null), "HIDDEN: PAYMENTS \xB7 STORE CHECKOUT"), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Manage child access"))));
}
function Portal() {
  const initial = TABS.map(t => t.toLowerCase()).indexOf((location.hash || '').replace('#', ''));
  const [tab, setTab] = React.useState(initial >= 0 ? initial : 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      minHeight: '100vh'
    }
  }, SiteNav && /*#__PURE__*/React.createElement(SiteNav, {
    active: tab === 1 ? 'calendar' : tab === 3 ? 'store' : 'account',
    loggedIn: true,
    links: {
      home: '#',
      juniors: '#',
      camps: '#',
      adults: '#',
      jtt: '#',
      calendar: '#calendar',
      store: '#store',
      login: '#profile',
      book: '#',
      logoSrc: window.__resources.logoMark
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: '40px 32px 32px'
    },
    "data-screen-label": "Portal header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, Eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Player portal"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--size-h2)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Maya R.")), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "PROTOTYPE \xB7 SAMPLE DATA \xB7 GREEN GROUP \xB7 MURDOCK PARK")), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Portal sections",
    style: {
      display: 'flex',
      gap: 26,
      marginTop: 28,
      borderBottom: 'var(--hairline)'
    }
  }, TABS.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => {
      setTab(i);
      location.hash = t.toLowerCase();
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0 2px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label)',
      textTransform: 'uppercase',
      color: tab === i ? 'var(--ink)' : 'var(--ink-secondary)',
      borderBottom: tab === i ? '2px solid var(--ink)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t)))), /*#__PURE__*/React.createElement("main", {
    style: {
      ...container,
      paddingBottom: 96
    },
    "data-screen-label": TABS[tab]
  }, tab === 0 && /*#__PURE__*/React.createElement(StatsTab, null), tab === 1 && /*#__PURE__*/React.createElement(CalendarTab, null), tab === 2 && /*#__PURE__*/React.createElement(BookingsTab, null), tab === 3 && /*#__PURE__*/React.createElement(StoreTab, null), tab === 4 && /*#__PURE__*/React.createElement(ProfileTab, null)));
}
Object.assign(window, {
  MTPortal: {
    Portal
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/portal-standalone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/portal.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  SiteNav,
  Wordmark,
  FrameTicks,
  Button,
  Eyebrow,
  CourtMeter,
  TextField,
  Tabs,
  StatusChip
} = NS;
const FLOWS = window.MTPortalFlows || {};
const mono = (s = 13) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: s / 16 + 'rem',
  lineHeight: 1.5,
  color: 'var(--text-secondary)'
});
const lbl = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--size-label-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--track-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)'
};
const h3 = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 900,
  fontSize: 'var(--size-h3)',
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  textTransform: 'uppercase',
  color: 'var(--ink)'
};
const card = {
  background: 'var(--surface-card)',
  border: 'var(--hairline)',
  padding: '20px 24px'
};
const container = {
  maxWidth: 'var(--container)',
  margin: '0 auto'
};
const TABS = [{
  id: 'stats',
  label: 'Stats'
}, {
  id: 'calendar',
  label: 'Calendar'
}, {
  id: 'bookings',
  label: 'Bookings'
}, {
  id: 'store',
  label: 'Store'
}, {
  id: 'waivers',
  label: 'Waivers'
}, {
  id: 'profile',
  label: 'Profile'
}];
function useMobile() {
  const [m, setM] = React.useState(() => window.matchMedia('(max-width:760px)').matches);
  React.useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}

// —— sample data (prototype only) ——
const SHOTS = [{
  k: 'Forehand',
  n: 142,
  peak: 0.86
}, {
  k: 'Backhand',
  n: 98,
  peak: 0.71
}, {
  k: 'Serve',
  n: 36,
  peak: 0.93
}, {
  k: 'Volley',
  n: 22,
  peak: 0.54
}];
const LEADERS = [['1', 'K. T.', 1240], ['2', 'M. R.', 1185], ['3', 'A. S.', 1120], ['4', 'J. L.', 1050], ['5', 'D. P.', 980]];
const ATTEND = [1, 1, 1, 0, 1, 1, 1, 1, 0, 1];
const PAYMENTS = [{
  item: 'Summer camp — Week 6 (full day)',
  amt: '$495',
  status: 'PAID · JUL 10'
}, {
  item: 'Junior classes — 8-session pack',
  amt: '$360',
  status: 'PAID · JUN 02'
}];
const MOVED_AT = new Date(2026, 6, 28);
const BOOKINGS = [{
  title: 'Junior classes & teams',
  detail: 'Green ball · Murdock Park',
  sched: 'Mon · Tue · Thu 17:00–18:30',
  left: '5 of 8 sessions left',
  status: 'ACTIVE'
}, {
  title: 'Summer camp — Week 10',
  detail: '12U · De Anza College',
  sched: 'Aug 11–15 · 09:00–17:00',
  left: 'Full day',
  status: 'UPCOMING'
}];
const daySlots = d => {
  const dow = new Date(2026, 7, d).getDay();
  if (dow === 0 || dow === 6) return [{
    t: '09:00–11:00',
    p: 'Junior classes — all ball levels',
    loc: 'DE ANZA',
    spots: d % 3 + 1
  }, {
    t: '11:00–13:00',
    p: 'Yellow ball int. & advanced',
    loc: 'DE ANZA',
    spots: d % 2
  }, {
    t: '09:00–11:00',
    p: 'Adult clinic',
    loc: 'DE ANZA',
    spots: 2
  }];
  if (dow === 1 || dow === 2 || dow === 4) return [{
    t: '16:00–17:00',
    p: 'Orange ball',
    loc: 'MURDOCK',
    spots: d % 4
  }, {
    t: '17:00–18:30',
    p: 'Green ball',
    loc: 'MURDOCK',
    spots: (d + 1) % 3
  }, {
    t: '18:30–20:00',
    p: 'Yellow ball',
    loc: 'MURDOCK',
    spots: 2
  }];
  return [];
};
function StatsTab({
  isMobile,
  player,
  onStore
}) {
  const recentMove = (Date.now() - MOVED_AT.getTime()) / 864e5 < 30;
  const CreditsCard = FLOWS.CreditsCard;
  const sessionCard = /*#__PURE__*/React.createElement("div", {
    key: "session",
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 16,
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "Session \u2014 Aug 6"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "GRIP SENSOR \xB7 IMU + PRESSURE \xB7 SYNCED 09:42")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
      gap: 16,
      borderTop: 'var(--hairline)',
      paddingTop: 16
    }
  }, SHOTS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2.25rem',
      lineHeight: 1,
      color: 'var(--ink)'
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginTop: 6
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--court-050)',
      marginTop: 10,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '0 auto 0 0',
      width: s.peak * 100 + '%',
      background: 'var(--court-400)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 4
    }
  }, "PEAK GRIP ", Math.round(s.peak * 100), "%")))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 16,
      marginBottom: 0
    }
  }, "298 SHOTS CLASSIFIED \xB7 RALLY AVG 6.2 \xB7 LONGEST RALLY 19 \xB7 SWING SPEED P95 61 MPH"));
  const attendanceCard = /*#__PURE__*/React.createElement("div", {
    key: "attend",
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 12
    }
  }, "Attendance \u2014 last 10 sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, ATTEND.map((a, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 18,
      height: 18,
      background: a ? 'var(--court-400)' : 'transparent',
      border: a ? '1px solid transparent' : 'var(--hairline)',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      marginLeft: 12
    }
  }, "8 / 10 \xB7 80%")));
  const meterCard = /*#__PURE__*/React.createElement("div", {
    key: "meter",
    style: card
  }, CourtMeter && /*#__PURE__*/React.createElement(CourtMeter, {
    court: player.court,
    caption: "MOVED UP \xB7 JUL 28",
    label: "Court placement"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      marginTop: 14,
      marginBottom: 0
    }
  }, "COURTS ORDERED BY DIFFICULTY 1\u20135. COACHES MOVE PLAYERS BETWEEN COURTS DURING THE SEASON \u2014 THE METER FOLLOWS."), isMobile && recentMove && /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 10,
      color: 'var(--accent-present-hover)'
    }
  }, "PLACEMENT CHANGED \u2014 PINNED TO TOP"));
  const creditsCard = CreditsCard ? /*#__PURE__*/React.createElement(CreditsCard, {
    key: "credits",
    player: player,
    onStore: onStore
  }) : null;
  const leaderCard = /*#__PURE__*/React.createElement("div", {
    key: "leaders",
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Leaderboard \u2014 Green group"), LEADERS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r[0],
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[0].padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: r[1] === 'M. R.' ? 600 : 400,
      color: 'var(--ink)'
    }
  }, r[1], r[1] === 'M. R.' && ' — Maya'), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, r[2], " PTS"))));
  const payCard = /*#__PURE__*/React.createElement("div", {
    key: "pay",
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...lbl,
      marginBottom: 10
    }
  }, "Payments"), PAYMENTS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 0',
      borderBottom: 'var(--hairline)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, p.item), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      whiteSpace: 'nowrap'
    }
  }, p.amt, " \xB7 ", p.status))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(12),
      marginTop: 10
    }
  }, "NEXT: FALL JUNIORS PACKAGE \u2014 DUE SEP 1"));
  if (isMobile) return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, recentMove ? [meterCard, sessionCard, creditsCard, attendanceCard, leaderCard, payCard] : [sessionCard, creditsCard, attendanceCard, meterCard, leaderCard, payCard]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, sessionCard, attendanceCard), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, creditsCard, meterCard, leaderCard, payCard));
}
function DayDetail({
  sel,
  gated
}) {
  const slots = daySlots(sel);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      ...h3,
      fontSize: '1.375rem'
    }
  }, "Aug ", sel), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, new Date(2026, 7, sel).toLocaleDateString('en-US', {
    weekday: 'long'
  }).toUpperCase())), slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: '12px 0 0'
    }
  }, "NO SESSIONS \u2014 COURTS REST ON WED & FRI."), slots.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '14px 0',
      borderTop: i ? 'var(--hairline)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--court-500)'
    }
  }, s.t), /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body-sm)',
      color: 'var(--ink)'
    }
  }, s.p), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, s.spots > 0 ? s.spots + ' SPOTS OPEN' : 'WAITLIST'), gated ? /*#__PURE__*/React.createElement("span", {
    role: "alert",
    style: {
      ...mono(11),
      color: 'var(--state-error)'
    }
  }, "BOOKING PAUSED \u2014 RE-CONSENT REQUIRED") : Button && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#book"
  }, s.spots > 0 ? 'Book' : 'Join waitlist')))));
}
function CalendarTab({
  isMobile,
  gated,
  onFix,
  player
}) {
  const [sel, setSel] = React.useState(8);
  const [sheet, setSheet] = React.useState(false);
  const ReconsentBanner = FLOWS.ReconsentBanner;
  const first = new Date(2026, 7, 1).getDay();
  const cells = [...Array(first).fill(null), ...Array.from({
    length: 31
  }, (_, i) => i + 1)];
  const grid = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: isMobile ? 3 : 4
    }
  }, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      ...mono(10.5),
      textAlign: 'center',
      padding: '4px 0'
    }
  }, d)), cells.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: 'e' + i
    });
    const n = daySlots(d).length;
    const open = daySlots(d).reduce((a, s) => a + s.spots, 0);
    const active = sel === d;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => {
        setSel(d);
        if (isMobile) setSheet(true);
      },
      style: {
        minHeight: isMobile ? 48 : undefined,
        aspectRatio: isMobile ? undefined : '1/0.82',
        border: active ? '1px solid var(--ink)' : 'var(--hairline)',
        background: n ? active ? 'var(--court-050)' : 'var(--white)' : 'var(--surface-page)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6px 7px',
        borderRadius: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: n ? 'var(--ink)' : 'var(--text-secondary)',
        textAlign: 'left'
      }
    }, d), n > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3
      }
    }, Array.from({
      length: n
    }, (_, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      style: {
        width: 6,
        height: 6,
        background: open ? 'var(--court-400)' : 'var(--court-200)'
      }
    }))));
  }));
  const header = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14,
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: h3
  }, "August 2026"), /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "DE ANZA + MURDOCK"));
  const legend = /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(11),
      marginTop: 10
    }
  }, "\u25A0 = A SESSION RUNS THAT DAY \xB7 TAP A DAY FOR SLOTS");
  const gateBanner = gated && ReconsentBanner ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ReconsentBanner, {
    player: player,
    onGo: onFix
  })) : null;
  if (isMobile) return /*#__PURE__*/React.createElement("div", null, gateBanner, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100vw',
      margin: '0 calc(50% - 50vw)',
      boxSizing: 'border-box',
      background: 'var(--white)',
      borderTop: 'var(--hairline)',
      borderBottom: 'var(--hairline)',
      padding: '20px 12px 24px'
    }
  }, header, grid, legend, sheet && /*#__PURE__*/React.createElement("div", {
    onClick: () => setSheet(false),
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(18,37,59,0.55)',
      zIndex: 40
    }
  }), sheet && /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": 'Sessions on August ' + sel,
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 41,
      background: 'var(--white)',
      borderTop: '2px solid var(--ink)',
      maxHeight: '72vh',
      overflowY: 'auto',
      padding: '16px 16px calc(24px + env(safe-area-inset-bottom))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSheet(false),
    "aria-label": "Close day detail",
    style: {
      width: 44,
      height: 44,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: '1.25rem',
      color: 'var(--ink)'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement(DayDetail, {
    sel: sel,
    gated: gated
  }))));
  return /*#__PURE__*/React.createElement("div", null, gateBanner, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, header, grid, legend), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(DayDetail, {
    sel: sel,
    gated: gated
  }))));
}
function BookingsTab({
  gated,
  onFix,
  player
}) {
  const ReconsentBanner = FLOWS.ReconsentBanner;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 760
    }
  }, gated && ReconsentBanner && /*#__PURE__*/React.createElement(ReconsentBanner, {
    player: player,
    onGo: onFix
  }), BOOKINGS.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...card,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '6px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, b.title), /*#__PURE__*/React.createElement("span", {
    style: {
      justifySelf: 'end'
    }
  }, StatusChip ? /*#__PURE__*/React.createElement(StatusChip, {
    status: b.status
  }) : /*#__PURE__*/React.createElement("span", {
    style: mono(11)
  }, b.status)), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, b.detail.toUpperCase(), " \xB7 ", b.sched.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(12),
      textAlign: 'right'
    }
  }, b.left.toUpperCase()))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono(12),
      margin: 0
    }
  }, "RESCHEDULES FOLLOW THE CANCELATION POLICY \u2014 24H NOTICE."));
}
function ProfileTab({
  isMobile,
  players
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 16 : 24,
      maxWidth: 860,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Parent \u2014 account owner"), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Name",
    defaultValue: "Priya R."
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Email",
    type: "email",
    defaultValue: "priya@example.com"
  }), TextField && /*#__PURE__*/React.createElement(TextField, {
    label: "Phone",
    type: "tel",
    defaultValue: "669-264-0000"
  }), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Save changes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "Linked players"), players.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      borderBottom: 'var(--hairline)',
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--size-body)',
      color: 'var(--ink)'
    }
  }, p.name, " \u2014 ", p.group.split(' · ')[0]), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "CHILD LOGIN: ENABLED \xB7 SHARES THIS ACCOUNT"))), /*#__PURE__*/React.createElement("div", {
    style: mono(12)
  }, "CHILD SEES: STATS \xB7 LEADERBOARD \xB7 CALENDAR", /*#__PURE__*/React.createElement("br", null), "HIDDEN: PAYMENTS \xB7 STORE CHECKOUT \xB7 WAIVERS"), Button && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Manage child access"))));
}
function Portal() {
  const isMobile = useMobile();
  const players = FLOWS.PLAYERS || [{
    id: 'maya',
    name: 'Maya R.',
    group: 'Green group',
    credits: 8,
    creditsExpire: '2027-03-01',
    court: 3,
    gate: null
  }];
  const initial = TABS.findIndex(t => t.id === (location.hash || '').replace('#', ''));
  const [tab, setTab] = React.useState(initial >= 0 ? TABS[initial].id : 'stats');
  const [pid, setPid] = React.useState(players[0].id);
  const [signed, setSigned] = React.useState({});
  const player = players.find(p => p.id === pid);
  const gated = !!(player.gate && !signed[player.id + ':' + player.gate.doc]);
  const go = id => {
    setTab(id);
    location.hash = id;
  };
  const {
    PlayerSwitcher,
    WaiversTab,
    StoreFlow
  } = FLOWS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      minHeight: '100vh'
    }
  }, SiteNav && /*#__PURE__*/React.createElement(SiteNav, {
    active: tab === 'calendar' ? 'calendar' : tab === 'store' ? 'store' : 'account',
    loggedIn: true,
    links: {
      home: '../website/index.html',
      juniors: '../website/index.html#programs',
      camps: '../website/index.html#camps',
      adults: '../website/index.html#programs',
      jtt: '../website/index.html#programs',
      calendar: '#calendar',
      store: '#store',
      login: '#profile',
      book: '../website/index.html#book',
      logoSrc: '../../assets/logo-mark.svg'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: isMobile ? '28px 16px 18px' : '40px 32px 32px'
    },
    "data-screen-label": "Portal header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: isMobile ? 12 : 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, Eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Player portal"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--size-h2)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, player.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      alignItems: isMobile ? 'flex-start' : 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono(12)
  }, "PROTOTYPE \xB7 SAMPLE DATA \xB7 ", player.group.toUpperCase()), PlayerSwitcher && players.length > 1 && /*#__PURE__*/React.createElement(PlayerSwitcher, {
    players: players,
    current: pid,
    onChange: setPid
  }))), !isMobile && Tabs && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: TABS,
    active: tab,
    onChange: go,
    ariaLabel: "Portal sections"
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      ...container,
      padding: isMobile ? '0 16px 140px' : '0 32px 96px'
    },
    "data-screen-label": tab
  }, tab === 'stats' && /*#__PURE__*/React.createElement(StatsTab, {
    isMobile: isMobile,
    player: player,
    onStore: () => go('store')
  }), tab === 'calendar' && /*#__PURE__*/React.createElement(CalendarTab, {
    isMobile: isMobile,
    gated: gated,
    player: player,
    onFix: () => go('waivers')
  }), tab === 'bookings' && /*#__PURE__*/React.createElement(BookingsTab, {
    gated: gated,
    player: player,
    onFix: () => go('waivers')
  }), tab === 'store' && StoreFlow && /*#__PURE__*/React.createElement(StoreFlow, {
    players: players,
    isMobile: isMobile,
    defaultPlayer: pid
  }), tab === 'waivers' && WaiversTab && /*#__PURE__*/React.createElement(WaiversTab, {
    player: player,
    signed: signed,
    onSign: k => setSigned(s => ({
      ...s,
      [k]: true
    }))
  }), tab === 'profile' && /*#__PURE__*/React.createElement(ProfileTab, {
    isMobile: isMobile,
    players: players
  })), isMobile && Tabs && /*#__PURE__*/React.createElement(Tabs, {
    items: TABS,
    active: tab,
    onChange: go,
    mobileMode: "bottom",
    ariaLabel: "Portal sections"
  }));
}
Object.assign(window, {
  MTPortal: {
    Portal
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/portal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/sections.jsx
try { (() => {
const NS = window.MomentumTennisDesignSystem_0ea6ac || {};
const {
  Wordmark,
  StrobeArc,
  FrameTicks,
  Button,
  Eyebrow,
  PhotoFrame,
  ProgramCard,
  ClassTimeline
} = NS;
const P = '../../assets/photos/';
const container = {
  maxWidth: 'var(--container,1200px)',
  margin: '0 auto',
  padding: '0 32px'
};
function useMobile() {
  const [m, setM] = React.useState(() => window.matchMedia('(max-width:760px)').matches);
  React.useEffect(() => {
    const q = window.matchMedia('(max-width:760px)');
    const f = e => setM(e.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return m;
}
const h2Style = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 900,
  fontSize: 'var(--size-h2)',
  lineHeight: 1.04,
  letterSpacing: '0.012em',
  textTransform: 'uppercase'
};

// —— ADMIN-SET CONTENT (see PRODUCT.md §12 — in production these come from the admin console) ——
const SEASON_EVENTS = [{
  id: 'camp-2026',
  label: 'Summer camps at De Anza',
  start: '2026-06-08',
  end: '2026-07-31',
  blurb: 'Tennis mornings, studio afternoons — chess, music production, photography, art.'
}, {
  id: 'camp-2027',
  label: 'Summer camps at De Anza',
  start: '2027-06-07',
  end: '2027-07-30',
  blurb: 'Tennis mornings, studio afternoons — chess, music production, photography, art.'
}];
const SITE_STATS = {
  range: 'FALL 2022 – SPRING 2026',
  dualWins: '155',
  leagues: '12',
  top3: '29',
  winPct: 69.5,
  seasons: '39',
  ratio: '2.28:1'
};
const fmtD = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric'
}).toUpperCase();
function campWindow() {
  const now = new Date();
  const evs = SEASON_EVENTS.map(e => ({
    ...e,
    s: new Date(e.start + 'T00:00:00'),
    t: new Date(e.end + 'T23:59:59')
  }));
  const cur = evs.find(e => now >= e.s && now <= e.t);
  if (cur) return {
    ...cur,
    status: 'ENROLLING NOW',
    window: fmtD(cur.start) + ' – ' + fmtD(cur.end)
  };
  const next = evs.filter(e => e.s > now).sort((a, b) => a.s - b.s)[0];
  if (next) return {
    ...next,
    status: 'RETURNS ' + next.s.getFullYear(),
    window: fmtD(next.start) + ' – ' + fmtD(next.end) + ', ' + next.s.getFullYear()
  };
  const last = evs[evs.length - 1];
  return {
    ...last,
    status: 'DATES COMING',
    window: 'ANNOUNCED EACH SPRING'
  };
}
function Header() {
  const camp = campWindow();
  if (NS.SiteNav) return /*#__PURE__*/React.createElement(NS.SiteNav, {
    active: "home",
    campNote: camp.status === 'ENROLLING NOW' ? 'ENROLLING NOW' : camp.window,
    links: {
      calendar: '../portal/index.html#calendar',
      store: '../portal/index.html#store',
      login: '../portal/index.html',
      juniors: '#programs',
      camps: '#camps',
      adults: '#programs',
      jtt: '#programs',
      book: '#book',
      logoSrc: '../../assets/logo-mark.svg'
    }
  });
  return null;
}
function Hero() {
  const m = useMobile();
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    "data-screen-label": "Hero",
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'grid',
      gridTemplateColumns: m ? '1fr' : '1.05fr 0.95fr',
      gap: m ? 36 : 56,
      alignItems: 'center',
      padding: m ? '48px 16px 40px' : '88px 32px 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Cupertino \xB7 De Anza College & Murdock Park"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'clamp(2.375rem,4.6vw,4.5rem)',
      lineHeight: 1.02,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "Learn to see", /*#__PURE__*/React.createElement("br", null), "your own motion."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-lg)',
      lineHeight: 1.55,
      color: 'var(--text-secondary)',
      maxWidth: '46ch'
    }
  }, "Tennis training for juniors and adults, one frame at a time \u2014 small groups, match play every week, and coaching centered on your comprehension."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#book"
  }, "Book a free trial class"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    href: "#programs"
  }, "Explore programs")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.06em',
      color: 'var(--text-secondary)',
      borderTop: 'var(--hairline)',
      paddingTop: 16
    }
  }, "PTR-CERTIFIED COACHES \xB7 USTA JUNIOR TEAM TENNIS \xB7 SUMMER CAMPS AT DE ANZA COLLEGE")), /*#__PURE__*/React.createElement(PhotoFrame, {
    src: P + 'net-rally-l.jpg',
    alt: "Juniors rallying at the net on a blue hard court",
    ratio: "4:3",
    treatment: "slice",
    focal: "50% 45%",
    tag: "MURDOCK PARK",
    caption: "Rallies & games \u2014 green ball",
    captionRight: "THU \xB7 t0 \u2192"
  })));
}

// ADMIN: film asset slot — placeholder until the real slow-mo loop is supplied
function Film() {
  const m = useMobile();
  const ann = {
    position: 'absolute',
    fontFamily: 'var(--font-mono)',
    fontSize: m ? '0.5625rem' : '0.6875rem',
    letterSpacing: '0.07em',
    color: 'var(--court-300)',
    textTransform: 'uppercase'
  };
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Film",
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '0 16px 56px' : '0 32px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '16/9',
      background: 'var(--court-900)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...ann,
      top: 14,
      left: 16
    }
  }, "PLACEHOLDER \u2014 CINEMATIC SLOW-MO FILM"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...ann,
      top: 14,
      right: 16,
      textAlign: 'right'
    }
  }, "16:9 \xB7 0:40 LOOP \xB7 MUTED"), !m && /*#__PURE__*/React.createElement("span", {
    style: {
      ...ann,
      bottom: 14,
      left: 16
    }
  }, "SHOT LIST: SERVE FOLLOW-THROUGH \xB7 BALL AT CONTACT \xB7 SPLIT-STEP \xB7 120 FPS"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...ann,
      bottom: 14,
      right: 16
    }
  }, "t0 \u2192"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      height: 48,
      padding: '0 28px',
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 999,
      border: '1px solid var(--line-white)',
      color: 'var(--line-white)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label)',
      textTransform: 'uppercase'
    }
  }, "Play the film"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.07em',
      color: 'var(--court-200)',
      textAlign: 'center',
      padding: '0 16px'
    }
  }, "YOUR SWING AT 120 FPS \u2014 FOOTAGE IN PRODUCTION"))));
}
function Programs() {
  const m = useMobile();
  const camp = campWindow(); // ADMIN: seasonal event drives this banner
  return /*#__PURE__*/React.createElement("section", {
    id: "programs",
    "data-screen-label": "Programs",
    style: {
      background: 'var(--surface-card)',
      borderTop: 'var(--hairline)',
      padding: m ? '56px 0 64px' : '88px 0 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '0 16px' : container.padding
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Programs"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--ink)'
    }
  }, "Classes. Team tennis.", /*#__PURE__*/React.createElement("br", null), "Private lessons.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: m ? '1fr' : 'repeat(3,1fr)',
      gap: 24,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "Weekly",
    title: "Classes",
    level: "Orange \u2192 Yellow ball",
    location: "De Anza \xB7 Murdock Park",
    photo: P + 'racquets-up-l.jpg',
    photoAlt: "Junior players raising racquets",
    photoFocal: "50% 42%",
    schedule: [{
      days: 'Sat & Sun',
      time: '2h classes',
      detail: 'De Anza'
    }, {
      days: 'Mon · Tue · Thu',
      time: '1.5h classes',
      detail: 'Murdock'
    }],
    note: "Groups by ball level, juniors and adults. Every class runs the same three blocks \u2014 times are set by the academy each season.",
    ctaLabel: "See class times",
    ctaHref: "../portal/index.html#calendar"
  }), /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "USTA JTT",
    title: "Team tennis",
    level: "Multiple Momentum teams",
    location: "Bay Area league",
    photo: P + 'champs-banner-l.jpg',
    photoAlt: "Momentum teams at a USTA Junior Team Tennis championship",
    photoFocal: "50% 55%",
    schedule: [{
      days: 'Fall & spring',
      time: 'League season'
    }, {
      days: 'Matches',
      time: 'Public schedule',
      detail: 'Bay Area'
    }],
    note: "USTA Junior Team Tennis against some twenty Bay Area clubs. Competing is part of the curriculum, not a graduation from it.",
    ctaLabel: "JTT match schedule",
    ctaHref: "#performance"
  }), /*#__PURE__*/React.createElement(ProgramCard, {
    eyebrow: "1-on-1",
    title: "Private lessons",
    level: "All levels",
    location: "De Anza \xB7 Murdock Park",
    photo: P + 'court-walk-l.jpg',
    photoAlt: "Players walking the court",
    photoFocal: "50% 50%",
    schedule: [{
      days: 'By appointment',
      time: '60 / 90 min'
    }],
    note: "One court, one player, one plan \u2014 most lessons taught by head coach Artur Westergren himself.",
    ctaLabel: "Ask about availability",
    ctaHref: "#book"
  })), /*#__PURE__*/React.createElement("div", {
    id: "camps",
    className: "on-field",
    style: {
      marginTop: 24,
      background: 'var(--surface-field)',
      padding: m ? '20px' : '22px 28px',
      display: 'flex',
      gap: m ? 14 : 28,
      alignItems: m ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: '1 1 320px',
      minWidth: 260
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label-sm)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label)',
      textTransform: 'uppercase',
      color: 'var(--court-300)'
    }
  }, "Seasonal \u2014 ", camp.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      lineHeight: 1.5,
      color: 'var(--text-on-field-dim)'
    }
  }, camp.blurb)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: m ? 'flex-start' : 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--line-white)'
    }
  }, camp.window), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      color: 'var(--court-300)'
    }
  }, camp.status, " \xB7 2ND WEEK OF JUNE \u2013 END OF JULY")))));
}
function ClassSection() {
  const m = useMobile();
  return /*#__PURE__*/React.createElement("section", {
    id: "class",
    "data-screen-label": "Inside a class",
    className: "on-field",
    style: {
      background: 'var(--surface-field)',
      padding: m ? '56px 0' : '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '0 16px' : container.padding,
      display: 'grid',
      gridTemplateColumns: m ? '1fr' : '0.9fr 1.1fr',
      gap: m ? 32 : 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    onField: true
  }, "Inside a class"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--line-white)'
    }
  }, "Play by play of your time on court."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body)',
      lineHeight: 1.6,
      color: 'var(--text-on-field-dim)',
      maxWidth: '44ch'
    }
  }, "Every class runs the same three blocks \u2014 technique, applied drills, live play. The structure never changes; the work inside it does, layer by layer, across a four-year physical progression."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.06em',
      color: 'var(--text-on-field-dim)'
    }
  }, "WEEKENDS 2H (40-MIN BLOCKS) \xB7 WEEKDAYS 1.5H (30-MIN BLOCKS) \xB7 TIMES SET BY THE ACADEMY EACH SEASON"), /*#__PURE__*/React.createElement(StrobeArc, {
    tone: "field",
    annotate: true,
    frames: 8,
    height: 150
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--hairline)',
      padding: '20px 24px'
    }
  }, ClassTimeline ? /*#__PURE__*/React.createElement(ClassTimeline, null) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      padding: '24px 0'
    }
  }, "CLASS TIMELINE \u2014 BUNDLE COMPILING, RELOAD IN A MOMENT."))));
}

// ADMIN: SITE_STATS record drives every number here
function Performance() {
  const m = useMobile();
  const S = SITE_STATS;
  const NUMC = {
    field: 'var(--line-white)',
    blue: 'var(--line-white)',
    white: 'var(--ink)'
  };
  const CAPC = {
    field: 'var(--court-300)',
    blue: 'var(--court-050)',
    white: 'var(--court-500)'
  };
  const STAMPC = {
    field: 'var(--court-200)',
    blue: 'var(--court-050)',
    white: 'var(--text-secondary)'
  };
  const RULEC = {
    field: 'rgba(247,247,247,0.25)',
    blue: 'rgba(247,247,247,0.35)',
    white: 'var(--border-hairline)'
  };
  const BG = {
    field: 'var(--court-800)',
    blue: 'var(--court-500)',
    white: 'var(--white)'
  };
  const num = (v, t) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'clamp(2.75rem,4.2vw,3.75rem)',
      lineHeight: 0.95,
      color: NUMC[t]
    }
  }, v);
  const cap = (v, t) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-label)',
      fontWeight: 700,
      letterSpacing: 'var(--track-label)',
      textTransform: 'uppercase',
      color: CAPC[t],
      lineHeight: 1.5
    }
  }, v);
  const stamp = t => /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      borderTop: '1px solid ' + RULEC[t],
      paddingTop: 10,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      color: STAMPC[t]
    }
  }, S.range);
  const Card = ({
    tone = 'white',
    children,
    style
  }) => /*#__PURE__*/React.createElement("div", {
    className: tone !== 'white' ? 'on-field' : undefined,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '24px 24px 16px',
      minHeight: m ? 170 : 200,
      background: BG[tone],
      border: tone === 'white' ? 'var(--hairline)' : '1px solid transparent',
      boxSizing: 'border-box',
      ...style
    }
  }, children);
  return /*#__PURE__*/React.createElement("section", {
    id: "performance",
    "data-screen-label": "Performance",
    style: {
      background: 'var(--surface-page)',
      borderTop: 'var(--hairline)',
      padding: m ? '56px 0 64px' : '88px 0 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      padding: m ? '0 16px' : container.padding
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    ticks: true
  }, "Results"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      color: 'var(--ink)'
    }
  }, "Sneak peek", /*#__PURE__*/React.createElement("br", null), "at our performance.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: m ? '1fr' : 'repeat(3,1fr)',
      gap: m ? 12 : 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "field"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark-field.svg",
    alt: "",
    style: {
      height: 36,
      alignSelf: 'flex-start'
    }
  }), num(S.dualWins, 'field'), cap('Dual match wins', 'field'), stamp('field')), /*#__PURE__*/React.createElement(Card, {
    tone: "blue"
  }, num(S.leagues, 'blue'), cap('League championships', 'blue'), stamp('blue')), /*#__PURE__*/React.createElement(Card, null, num(S.top3, 'white'), cap('Top 3 finishes', 'white'), stamp('white'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: m ? '1fr' : '1fr 2fr',
      gap: m ? 12 : 20,
      marginTop: m ? 12 : 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      padding: 24,
      background: 'var(--white)',
      border: 'var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "img",
    "aria-label": S.winPct + ' percent overall winning percentage',
    style: {
      width: m ? 116 : 132,
      height: m ? 116 : 132,
      borderRadius: '50%',
      background: 'conic-gradient(var(--court-500) 0 ' + S.winPct + '%, var(--court-100) ' + S.winPct + '% 100%)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: m ? 84 : 96,
      height: m ? 84 : 96,
      borderRadius: '50%',
      background: 'var(--white)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.625rem',
      color: 'var(--ink)'
    }
  }, S.winPct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      alignSelf: 'stretch',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, cap('Overall winning percentage', 'white')), stamp('white'))), /*#__PURE__*/React.createElement(Card, {
    tone: "field",
    style: {
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      borderRight: '1px solid rgba(247,247,247,0.25)',
      paddingRight: 24
    }
  }, num(S.seasons, 'field'), cap('Unique team seasons', 'field')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, num(S.ratio, 'field'), cap('Win / loss ratio', 'field'))), stamp('field'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: m ? 28 : 40,
      borderTop: 'var(--hairline)',
      paddingTop: 18,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.04em',
      lineHeight: 1.7,
      color: 'var(--text-secondary)'
    }
  }, "COACHES \u2014 ARTUR WESTERGREN (HEAD COACH \xB7 PTR \xB7 EX-NORCAL TENNIS ACADEMY) \xB7 VISHAL (PTR) \xB7 ELSIO (USTA HIGH PERFORMANCE)"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    href: "#programs"
  }, "JTT match schedule"))));
}
function Quote() {
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Quote",
    style: {
      background: 'var(--surface-tint)',
      borderTop: 'var(--hairline)',
      padding: '80px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      maxWidth: 900
    }
  }, /*#__PURE__*/React.createElement(FrameTicks, null), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: '20px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'clamp(1.75rem,3vw,2.5rem)',
      lineHeight: 1.12,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, "\"If our students aren't improving \u2014 we aren't growing as coaches.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      color: 'var(--text-secondary)'
    }
  }, "ARTUR WESTERGREN \xB7 HEAD COACH")));
}
function CTABand() {
  return /*#__PURE__*/React.createElement("section", {
    id: "book",
    "data-screen-label": "Book",
    className: "on-field",
    style: {
      background: 'var(--surface-field-deep)',
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark-field.svg",
    alt: "",
    style: {
      height: 84,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2Style,
      fontSize: 'clamp(2.25rem,3.6vw,3.25rem)',
      color: 'var(--line-white)'
    }
  }, "Book a free trial class."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body)',
      lineHeight: 1.6,
      color: 'var(--text-on-field-dim)',
      maxWidth: '44ch'
    }
  }, "One session on court with a PTR-certified coach. See where your game is now \u2014 and what the next frame looks like."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#book"
  }, "Book a free trial class"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--text-on-field-dim)'
    }
  }, "CALL OR WHATSAPP \xB7 669-264-6756"))));
}
function Footer() {
  const link = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--size-label-sm)',
    fontWeight: 700,
    letterSpacing: 'var(--track-label)',
    textTransform: 'uppercase',
    color: 'var(--ink)',
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("footer", {
    "data-screen-label": "Footer",
    style: {
      background: 'var(--surface-page)',
      borderTop: 'var(--hairline)',
      padding: '48px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...container,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.svg",
    alt: "Momentum Tennis",
    style: {
      height: 76,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Footer",
    style: {
      display: 'flex',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#programs"
  }, "Classes"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#programs"
  }, "Team tennis"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#camps"
  }, "Camps"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#performance"
  }, "Performance"), /*#__PURE__*/React.createElement("a", {
    style: link,
    href: "#book"
  }, "Contact")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
      textAlign: 'right'
    }
  }, "DE ANZA COLLEGE \xB7 21250 STEVENS CREEK BLVD, CUPERTINO, CA", /*#__PURE__*/React.createElement("br", null), "MURDOCK PARK \xB7 CUPERTINO, CA", /*#__PURE__*/React.createElement("br", null), "\xA9 2026 MOMENTUM TENNIS LLC")));
}
function HomePage() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Film, null), /*#__PURE__*/React.createElement(Programs, null), /*#__PURE__*/React.createElement(ClassSection, null), /*#__PURE__*/React.createElement(Performance, null), /*#__PURE__*/React.createElement(Quote, null), /*#__PURE__*/React.createElement(CTABand, null), /*#__PURE__*/React.createElement(Footer, null));
}
Object.assign(window, {
  MTSections: {
    Header,
    Hero,
    Film,
    Programs,
    ClassSection,
    Performance,
    Quote,
    CTABand,
    Footer,
    HomePage
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.RatingMeter = __ds_scope.RatingMeter;

__ds_ns.FrameTicks = __ds_scope.FrameTicks;

__ds_ns.StrobeArc = __ds_scope.StrobeArc;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.DateField = __ds_scope.DateField;

__ds_ns.FormSection = __ds_scope.FormSection;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextArea = __ds_scope.TextArea;

__ds_ns.TimeField = __ds_scope.TimeField;

__ds_ns.PhotoFrame = __ds_scope.PhotoFrame;

__ds_ns.ResourceDayView = __ds_scope.ResourceDayView;

__ds_ns.SessionForm = __ds_scope.SessionForm;

__ds_ns.CampTimeline = __ds_scope.CampTimeline;

__ds_ns.ClassTimeline = __ds_scope.ClassTimeline;

__ds_ns.CourtMeter = __ds_scope.CourtMeter;

__ds_ns.ProgramCard = __ds_scope.ProgramCard;

__ds_ns.SiteNav = __ds_scope.SiteNav;

})();
