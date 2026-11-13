 # Architecture rules

- Administrative search filters the existing database-backed live catalog with shared accent-insensitive matching; reload on administrative entry to include admin-only inactive rows.
- Product activation is persisted independently of featured status; public views exclude inactive products and existing admin RLS retains read/edit access.

- Keep public navigation and product ordering in a root-mounted discovery provider; one browser document defines an ordering session and a full reload creates a new seed without SSR randomness.
- Reuse public sharing helpers for stores and providers; always share the canonical published origin, never the preview origin.
- Keep product selection local to each store page and pass optional selection controls through the existing carousel and product card; no catalog writes or authentication changes are required.