# Official service categories

Mode: Operate. Preserve ServiceHub's existing form layout and seeker/provider colors.

Both roles choose the same official IDs from `/categories`. The catalog uses plain service names; selected-category help explains examples and boundaries. Laptop repair is Computer & Laptop Repair, while Electrical Wiring & Repairs covers wiring, outlets and circuits. Other Services stays last as the fallback.

Legacy names are aliases for bookmarks and existing filters, never extra public choices. Category associations come from the database. Retired duplicate IDs remain for historical audit references; both kinds of listing move to the surviving category when merging a family. Admin creation, rename and reactivation reject known equivalent concepts.

The category list remains scrollable with native validation and keyboard selection. Longer names and descriptions must fit existing desktop/mobile forms. Custom Admin categories retain their official labels and use generic selection help unless they belong to a known family.

Suggest category uses a bounded server-side AI request. If AI is unavailable or returns unusable results, conservative matching against the active catalog can offer clearly labeled category-list matches. Vague input asks for more detail instead of guessing. Both paths require explicit selection and preserve manual search; Gemini credentials remain server-only. Reliability checks: `.impeccable/review/category-suggestion-reliability.json`.

Catalog definitions and migration behavior: `SERVICEHUB-BACKEND/docs/SERVICE_CATEGORIES.md`. Verification: `.impeccable/review/category-catalog-review.json`.
