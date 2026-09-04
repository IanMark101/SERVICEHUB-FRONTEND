import type { JobEngagement } from "../../../types";
import type { ProviderActivitySort, ProviderActivityTab } from "./types";

type ProviderActivityItem =
  | { type: "bid"; data: any }
  | { type: "engagement"; data: JobEngagement };

interface FilterProviderActivityItemsParams {
  activeTab: ProviderActivityTab;
  engagements: JobEngagement[];
  pendingBids: any[];
  jobRequests: any[];
  services: any[];
  searchQuery: string;
  sortBy: ProviderActivitySort;
}

export function countProviderActivityTab(
  tab: ProviderActivityTab,
  engagements: JobEngagement[],
  pendingBids: any[],
): number {
  switch (tab) {
    case "in_progress":
      return engagements.filter((item) => item.status === "in_progress").length;
    case "waiting":
      return engagements.filter(
        (item) => item.status === "queued" || item.status === "pending_provider",
      ).length;
    case "pending_offers":
      return pendingBids.length;
    case "awaiting_approval":
      return engagements.filter((item) => item.status === "awaiting_seeker_approval").length;
    case "disputed":
      return engagements.filter((item) => item.status === "disputed").length;
    case "completed":
      return engagements.filter((item) => item.status === "completed").length;
    case "canceled":
      return engagements.filter((item) => item.status === "canceled").length;
    default:
      return engagements.filter((item) => item.status !== "canceled").length + pendingBids.length;
  }
}

export function filterProviderActivityItems({
  activeTab,
  engagements,
  pendingBids,
  jobRequests,
  services,
  searchQuery,
  sortBy,
}: FilterProviderActivityItemsParams): ProviderActivityItem[] {
  const isSearchEmpty = searchQuery.trim() === "";
  const normalizedSearch = searchQuery.toLowerCase();
  const items: ProviderActivityItem[] = [];

  const requestForBid = (requestId: string) =>
    jobRequests.find((request) => request.id === requestId);

  const categoryForEngagement = (engagement: JobEngagement) => {
    if (engagement.serviceId) {
      const service = services.find((item) => item.id === engagement.serviceId);
      if (service) return service.category;
    }

    return (
      jobRequests.find(
        (request) =>
          request.seekerId === engagement.seekerId &&
          request.title === engagement.title,
      )?.category || "General"
    );
  };

  if (activeTab === "all" || activeTab === "pending_offers") {
    pendingBids.forEach((bid) => {
      const request = requestForBid(bid.requestId);
      const searchable = [
        request?.title || bid.requestTitle || "",
        request?.seekerName || bid.seekerName || "",
        request?.category || bid.category || "",
      ];

      if (isSearchEmpty || searchable.some((value) => value.toLowerCase().includes(normalizedSearch))) {
        items.push({ type: "bid", data: bid });
      }
    });
  }

  engagements.forEach((engagement) => {
    if (engagement.status === "canceled" && activeTab !== "canceled") return;
    if (
      engagement.status === "completed" &&
      activeTab !== "all" &&
      activeTab !== "completed"
    ) return;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_progress" && engagement.status === "in_progress") ||
      (activeTab === "waiting" &&
        (engagement.status === "queued" || engagement.status === "pending_provider")) ||
      (activeTab === "awaiting_approval" &&
        engagement.status === "awaiting_seeker_approval") ||
      (activeTab === "disputed" && engagement.status === "disputed") ||
      (activeTab === "completed" && engagement.status === "completed") ||
      (activeTab === "canceled" && engagement.status === "canceled");

    if (!matchesTab) return;

    const searchable = [
      engagement.title,
      engagement.seekerName,
      categoryForEngagement(engagement),
    ];

    if (isSearchEmpty || searchable.some((value) => value.toLowerCase().includes(normalizedSearch))) {
      items.push({ type: "engagement", data: engagement });
    }
  });

  return [...items].sort((left, right) => {
    const leftDate = new Date(left.data.createdAt).getTime();
    const rightDate = new Date(right.data.createdAt).getTime();
    const leftPrice = Number(left.data.price);
    const rightPrice = Number(right.data.price);

    if (sortBy === "newest") return rightDate - leftDate;
    if (sortBy === "oldest") return leftDate - rightDate;
    if (sortBy === "price_desc") return rightPrice - leftPrice;
    if (sortBy === "price_asc") return leftPrice - rightPrice;
    return 0;
  });
}
