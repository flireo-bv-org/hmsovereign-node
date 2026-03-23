import type { HttpClient } from "../client";
import type {
  Campaign,
  CampaignCreateParams,
  CampaignUpdateParams,
  CampaignLead,
  CampaignLeadCreateParams,
  Pagination,
} from "../types";

export class Campaigns {
  constructor(private readonly client: HttpClient) {}

  /** List all campaigns */
  async list(): Promise<Campaign[]> {
    const res = await this.client.request<{ campaigns: Campaign[] }>({
      method: "GET",
      path: "/campaigns",
    });
    return res.campaigns;
  }

  /** Get a specific campaign */
  async get(id: string): Promise<Campaign> {
    const res = await this.client.request<{ campaign: Campaign }>({
      method: "GET",
      path: `/campaigns/${id}`,
    });
    return res.campaign;
  }

  /** Create a campaign */
  async create(params: CampaignCreateParams): Promise<Campaign> {
    const res = await this.client.request<{ campaign: Campaign }>({
      method: "POST",
      path: "/campaigns",
      body: params,
    });
    return res.campaign;
  }

  /** Update a campaign */
  async update(id: string, params: CampaignUpdateParams): Promise<Campaign> {
    const res = await this.client.request<{ campaign: Campaign }>({
      method: "PATCH",
      path: `/campaigns/${id}`,
      body: params,
    });
    return res.campaign;
  }

  /** Delete a campaign */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/campaigns/${id}`,
    });
  }

  /** List leads for a campaign */
  async listLeads(
    campaignId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<{ leads: CampaignLead[]; pagination: Pagination }> {
    return this.client.request({
      method: "GET",
      path: `/campaigns/${campaignId}/leads`,
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /** Add a lead to a campaign */
  async addLead(campaignId: string, params: CampaignLeadCreateParams): Promise<CampaignLead> {
    const res = await this.client.request<{ lead: CampaignLead }>({
      method: "POST",
      path: `/campaigns/${campaignId}/leads`,
      body: params,
    });
    return res.lead;
  }

  /** Remove a lead from a campaign */
  async removeLead(campaignId: string, leadId: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/campaigns/${campaignId}/leads/${leadId}`,
    });
  }
}
