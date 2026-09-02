/** The site header. Desktop: Programs dropdown (Junior classes & teams / Summer camps / Adult programs / JTT schedule), first-class Calendar and Store tabs, account entry (Log in ↔ Account) beside the one Book-a-trial action. Mobile (≤breakpoint, default 760px): logo + Book pill + tri-color hamburger — bars top→bottom court-300 / court-500 / amber (past cool → now warm) — opening a full-screen court-navy sheet with the same hierarchy and the Book CTA pinned last. Sticky, blurred line-white. */
export interface SiteNavProps {
  /** Which tab is current: 'home' | 'programs' | 'calendar' | 'store' | 'account' */
  active?: 'home' | 'programs' | 'calendar' | 'store' | 'account';
  /** Shows "Account" instead of "Log in" */
  loggedIn?: boolean;
  /** Override hrefs: home, juniors, camps, adults, jtt, calendar, store, login, book, logoSrc */
  links?: Record<string, string>;
  /** Mobile collapse threshold in px (default 760) */
  breakpoint?: number;
  style?: React.CSSProperties;
}
