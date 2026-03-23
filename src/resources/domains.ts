import type { HttpClient } from "../client";
import type { Domain, DomainCreateParams } from "../types";

export class Domains {
  constructor(private readonly client: HttpClient) {}

  /** Get your configured domain */
  async get(): Promise<Domain> {
    return this.client.request({
      method: "GET",
      path: "/domains",
    });
  }

  /** Add a custom domain */
  async create(params: DomainCreateParams): Promise<Domain> {
    return this.client.request({
      method: "POST",
      path: "/domains",
      body: params,
    });
  }

  /** Delete your domain */
  async delete(): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: "/domains",
    });
  }

  /** List available Resend domains for syncing */
  async listResendDomains(): Promise<Record<string, unknown>[]> {
    return this.client.request({
      method: "GET",
      path: "/domains/sync",
    });
  }

  /** Select and sync a Resend domain */
  async syncResendDomain(params: { domain_id: string }): Promise<{ success: boolean }> {
    return this.client.request({
      method: "POST",
      path: "/domains/sync",
      body: params,
    });
  }

  /** Verify domain DNS records */
  async verify(): Promise<{ verified: boolean }> {
    return this.client.request({
      method: "POST",
      path: "/domains/verify",
    });
  }

  /** Refresh domain status */
  async refresh(): Promise<Domain> {
    return this.client.request({
      method: "POST",
      path: "/domains/refresh",
    });
  }
}
