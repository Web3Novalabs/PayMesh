import {
  PaymentsTotalsResponse,
  PayoutTimelineResponse,
  GroupPayoutTimelineResponse,
  CrowdfundingPayoutTimelineResponse,
} from "../types/adminMetrics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class AdminMetricsService {
  /**
   * Fetch aggregated transfer metrics (public)
   */
  static async getTransferMetrics(): Promise<PaymentsTotalsResponse> {
    const response = await fetch(
      `${API_URL}/admin/group_admin/transfer_metrics`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch transfer metrics: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Fetch combined payout timeline (groups + crowdfunding)
   */
  static async getPayoutTimeline(): Promise<PayoutTimelineResponse> {
    const response = await fetch(
      `${API_URL}/admin/group_admin/payout_timeline`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch payout timeline: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Fetch group-specific payout timeline
   */
  static async getGroupPayoutTimeline(): Promise<GroupPayoutTimelineResponse> {
    const response = await fetch(
      `${API_URL}/admin/group_admin/group_payout_timeline`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch group payout timeline: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Fetch crowdfunding-specific payout timeline (withdrawals)
   */
  static async getCrowdfundingPayoutTimeline(): Promise<CrowdfundingPayoutTimelineResponse> {
    const response = await fetch(
      `${API_URL}/admin/group_admin/crowdfunding_payout_timeline`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch crowdfunding payout timeline: ${response.statusText}`
      );
    }
    return response.json();
  }
}
