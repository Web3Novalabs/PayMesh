export enum VolumeSource {
  PaymentGroup = "PaymentGroup",
  Crowdfunding = "Crowdfunding",
  Both = "Both",
}

export enum FlowDirection {
  Inflow = "Inflow",
  Outflow = "Outflow",
  Both = "Both",
}

export interface VolumeRequest {
  from?: string;
  to?: string;
  token?: string;
  sources?: VolumeSource;
  direction?: FlowDirection;
}

export interface AnalyticsItem {
  token_address: string;
  token_amount: string;
  time: string;
  source: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Central configuration for Analytics
export const ANALYSIS_CONFIG = {
  groupsDirection: FlowDirection.Outflow,
  crowdfundingDirection: FlowDirection.Inflow,
};

export class AdminMetricsService {
  static async getVolume(params: VolumeRequest): Promise<AnalyticsItem[]> {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.token) queryParams.append("token", params.token);
    if (params.sources) queryParams.append("sources", params.sources);
    if (params.direction) queryParams.append("direction", params.direction);

    const url = `${API_URL}/analytics/admin/volume?${queryParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch volume metrics: ${response.statusText}`);
    }
    return response.json();
  }
}
