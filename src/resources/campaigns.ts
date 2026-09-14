import type { HttpClient } from "../client";
import { encodePathParam } from "../client";
import type {
  Campaign,
  CampaignCreateParams,
  CampaignUpdateParams,
  CampaignLead,
  CampaignLeadCreateParams,
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
      path: `/campaigns/${encodePathParam(id)}`,
    });
    return res.campaign;
  }

  /** Create a campaign. It starts as a draft; set its status to `scheduled` to start calling. */
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
      path: `/campaigns/${encodePathParam(id)}`,
      body: params,
    });
    return res.campaign;
  }

  /** Delete a campaign */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/campaigns/${encodePathParam(id)}`,
    });
  }

  /** List all leads of a campaign, oldest first */
  async listLeads(campaignId: string): Promise<CampaignLead[]> {
    const res = await this.client.request<{ leads: CampaignLead[] }>({
      method: "GET",
      path: `/campaigns/${encodePathParam(campaignId)}/leads`,
    });
    return res.leads;
  }

  /** Add a lead to a campaign */
  async addLead(campaignId: string, params: CampaignLeadCreateParams): Promise<CampaignLead> {
    const res = await this.client.request<{ lead: CampaignLead }>({
      method: "POST",
      path: `/campaigns/${encodePathParam(campaignId)}/leads`,
      body: params,
    });
    return res.lead;
  }

  /** Remove a lead from a campaign. A lead that is being called cannot be removed. */
  async removeLead(campaignId: string, leadId: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/campaigns/${encodePathParam(campaignId)}/leads/${encodePathParam(leadId)}`,
    });
  }
}
