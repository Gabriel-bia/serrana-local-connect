 # Architecture rules

- Keep WhatsApp URL and item-message logic in a browser-safe helper; item contacts explicitly replace saved text, while general contacts preserve it so registered greetings are not lost.
- Reuse ShareButton for product photos: native file sharing carries the product link in text, while direct WhatsApp contact and unsupported devices use a public HTTPS photo link because WhatsApp deep links cannot attach files.

- Store WhatsApp changes synchronize linked product contacts in a database trigger under existing RLS; public product actions resolve the store contact first and administrative saves reload products to avoid stale copied links.

- Administrative search filters the existing database-backed live catalog with shared accent-insensitive matching; reload on administrative entry to include admin-only inactive rows.
- Product activation is persisted independently of featured status; public views exclude inactive products and existing admin RLS retains read/edit access.
- Scope administrative scrolling to the dashboard content wrapper so listings and editors have viewport-bounded vertical scroll without changing public pages.

- Keep public navigation and product ordering in a root-mounted discovery provider; one browser document defines an ordering session and a full reload creates a new seed without SSR randomness.
- Reuse public sharing helpers for stores and providers; always share the canonical published origin, never the preview origin.
- Keep product selection local to each store page and pass optional selection controls through the existing carousel and product card; no catalog writes or authentication changes are required.