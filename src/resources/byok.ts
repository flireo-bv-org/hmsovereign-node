import type { HttpClient } from "../client";
import type { BYOKConfig, BYOKConfigParams, BYOKDeleteParams, BYOKKeys, BYOKSetParams } from "../types";

export class BYOK {
  constructor(private readonly client: HttpClient) {}

  /** Get current BYOK configurations (shows which providers have vault secret IDs) */
  async get(): Promise<{ byok_keys: BYOKKeys }> {
    return this.client.request({
      method: "GET",
      path: "/byok",
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

  /**
   * Save provider-specific settings. A key for the provider must already be
   * stored with `set()`. The settings are merged into the ones already stored
   * for that provider, and the result holds the settings of every provider.
   */
  async saveConfig(params: BYOKConfigParams): Promise<{ byok_config: BYOKConfig }> {
    return this.client.request({
      method: "POST",
      path: "/byok/config",
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
