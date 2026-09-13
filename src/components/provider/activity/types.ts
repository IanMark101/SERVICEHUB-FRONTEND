export type ProviderActivityTab =
  | "all"
  | "in_progress"
  | "waiting"
  | "pending_offers"
  | "awaiting_approval"
  | "disputed"
  | "completed"
  | "canceled";

export type ProviderActivitySort = "newest" | "oldest" | "price_desc" | "price_asc";
