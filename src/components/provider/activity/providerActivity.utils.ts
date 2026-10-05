import type { Bid, JobEngagement, JobRequest, ServiceListing } from "../../../types";
import type { ProviderActivitySort, ProviderActivityTab } from "./types";
import { isOfferAwaitingDecision, isOfferClosed } from '../../../lib/offerStatus';

export type ProviderActivityItemData =
  | { type: "bid"; data: Bid }
  | { type: "engagement"; data: JobEngagement };

interface FilterProviderActivityItemsParams {
  activeTab: ProviderActivityTab;
  engagements: JobEngagement[];
  pendingBids: Bid[];
  jobRequests: JobRequest[];
  services: ServiceListing[];
  searchQuery: string;
  sortBy: ProviderActivitySort;
}

export function countProviderActivityTab(
  tab: ProviderActivityTab,
  engagements: JobEngagement[],
  pendingBids: Bid[],
): number {
  switch (tab) {
    case "in_progress":
      return engagements.filter((item) => item.status === "in_progress" && !!item.started).length;
    case "waiting":
      return engagements.filter(
        (item) => item.status === "queued" || item.status === "pending_provider" || (item.status === "in_progress" && !item.started),
      ).length;
    case "pending_offers":
      return pendingBids.filter(isOfferAwaitingDecision).length;
    case "awaiting_approval":
      return engagements.filter((item) => item.status === "awaiting_seeker_approval").length;
    case "disputed":
      return engagements.filter((item) => item.status === "disputed").length;
    case "completed":
      return engagements.filter((item) => item.status === "completed").length;
    case "canceled":
      return engagements.filter((item) => item.status === "canceled").length + pendingBids.filter(isOfferClosed).length;
    default:
      return engagements.length + pendingBids.length;
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
}: FilterProviderActivityItemsParams): ProviderActivityItemData[] {
  const isSearchEmpty = searchQuery.trim() === "";
  const normalizedSearch = searchQuery.toLowerCase();
  const items: ProviderActivityItemData[] = [];

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

  if (activeTab === "all" || activeTab === "pending_offers" || activeTab === 'canceled') {
    pendingBids.forEach((bid) => {
      if (activeTab === 'pending_offers' && !isOfferAwaitingDecision(bid)) return;
      if (activeTab === 'canceled' && !isOfferClosed(bid)) return;
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
    if (engagement.status === "canceled" && activeTab !== "canceled" && activeTab !== "all") return;
    if (
      engagement.status === "completed" &&
      activeTab !== "all" &&
      activeTab !== "completed"
    ) return;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_progress" && engagement.status === "in_progress" && !!engagement.started) ||
      (activeTab === "waiting" &&
        (engagement.status === "queued" || engagement.status === "pending_provider" || (engagement.status === "in_progress" && !engagement.started))) ||
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
