import type { HttpClient } from "../client";
import type { BYOKKeys, BYOKSetParams, BYOKDeleteParams } from "../types";

export class BYOK {
  constructor(private readonly client: HttpClient) {}

  /** Get current BYOK configurations (shows which providers have vault secret IDs) */
  async get(): Promise<{ byok_keys: BYOKKeys }> {
    return this.client.request({
      method: "GET",
      path: "/byok",
    });
  }

  /** Get detailed provider configurations */
  async getConfig(): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "GET",
      path: "/byok/config",
    });
  }

  /** Add or update a BYOK provider API key */
  async set(params: BYOKSetParams): Promise<{ success: boolean; byok_keys: BYOKKeys }> {
    return this.client.request({
      method: "POST",
      path: "/byok",
      body: params,
    });
  }

  /** Remove a BYOK provider key (reverts to platform defaults) */
  async delete(params: BYOKDeleteParams): Promise<{ success: boolean; byok_keys: BYOKKeys }> {
    return this.client.request({
      method: "DELETE",
      path: "/byok",
      body: params,
    });
  }
}
