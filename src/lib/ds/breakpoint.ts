/**
 * The system's one breakpoint (design-system/readme.md "Mobile"). CSS custom properties can't
 * drive media queries, so this is the single named constant; component styles repeat the literal
 * `760px` in their @media rules and nowhere else.
 */
export const BREAKPOINT = 760;
export const MOBILE_QUERY = `(max-width: ${BREAKPOINT}px)`;
