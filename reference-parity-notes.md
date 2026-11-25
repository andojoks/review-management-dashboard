# Raveno parity notes

Reference demo: https://demo.codeandchill.store/raveno/#/overview
Reference JS: https://demo.codeandchill.store/raveno/assets/index-BU2gqGJs.js
Reference CSS: https://demo.codeandchill.store/raveno/assets/index-CNzd81kG.css
Reference overview CSS: https://demo.codeandchill.store/raveno/assets/overview-DgXLR4Mn.css

Observed from the live reference on 2026-11-25:
- Uses Urbanist from Google Fonts and inline SVG icon paths, not lucide/react-icons.
- CSS variables include --ease: cubic-bezier(.22, 1, .36, 1), --side-w: 248px, --side-rail: 84px, --r-lg: 18px, --r-md: 12px, --r-sm: 9px, --r-xl: 22px.
- Desktop has a fixed sidebar and sticky top bar; mobile hides the sidebar and uses a sheet-style menu.
- Reference bundle contains view-transition root rules, a `.magnetic` interaction class, `.snav__pill` active-pill behavior, reduced-motion handling, and breakpoints at 1279, 1100, 999, 860, 760, 640, 500, and 380px.
- Exact live reference state changes over time (counts/data are not static); layout and interaction behavior are the parity target.
- Reference interactions include sidebar collapse/rail, active navigation pill movement, dark-mode toggle, search/finder overlay, account menu, notification panel, New menu, keyboard shortcuts, hover magnetic buttons, and route/page transitions.
