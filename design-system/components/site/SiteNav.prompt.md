SiteNav — the one header for every page, public or logged-in. Desktop: Programs dropdown + Calendar/Store tabs + Log in/Account + Book pill. Below 760px it collapses to logo + Book pill + a tri-color hamburger (court-300 / court-500 / amber bars — the strobe read) that opens a full-screen court-navy sheet; the Book CTA never disappears.

```jsx
<SiteNav active="home" links={{calendar:'/portal#calendar', logoSrc:'../assets/logo-mark.svg'}} />
<SiteNav active="account" loggedIn breakpoint={820} />
```

Pass `links.logoSrc` with the correct relative path to `assets/logo-mark.svg` from your page. Keep the hierarchy to exactly Programs / Calendar / Store — never add tabs.
