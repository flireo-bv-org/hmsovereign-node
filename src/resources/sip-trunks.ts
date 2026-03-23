import type { HttpClient } from "../client";
import type { SipTrunk, SipTrunkCreateParams } from "../types";

export class SipTrunks {
  constructor(private readonly client: HttpClient) {}

  /** List all SIP trunks */
  async list(): Promise<SipTrunk[]> {
    const res = await this.client.request<{ trunks: SipTrunk[] }>({
      method: "GET",
      path: "/sip-trunks",
    });
    return res.trunks;
  }

  /** Get a specific SIP trunk */
  async get(id: string): Promise<SipTrunk> {
    const res = await this.client.request<{ trunk: SipTrunk }>({
      method: "GET",
      path: `/sip-trunks/${id}`,
    });
    return res.trunk;
  }

  /** Create a SIP trunk */
  async create(params: SipTrunkCreateParams): Promise<SipTrunk> {
    const res = await this.client.request<{ trunk: SipTrunk }>({
      method: "POST",
      path: "/sip-trunks",
      body: params,
    });
    return res.trunk;
  }

  /** Delete a SIP trunk */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/sip-trunks/${id}`,
    });
  }
}
