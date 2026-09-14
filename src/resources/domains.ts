import type { HttpClient } from "../client";
import type { Domain, DomainCreateParams, ResendDomainList, ResendDomainSyncParams } from "../types";

/**
 * Your organization's custom sending domain. Managing a domain requires your
 * own Resend API key, stored with `byok.set()`.
 */
export class Domains {
  constructor(private readonly client: HttpClient) {}

  /** Get your configured domain, or `null` when none is configured */
  async get(): Promise<Domain | null> {
    const res = await this.client.request<{ domain: Domain | null }>({
      method: "GET",
      path: "/domains",
    });
    return res.domain;
  }

  /** Add a custom domain. The result lists the DNS records to configure. */
  async create(params: DomainCreateParams): Promise<Domain> {
    const res = await this.client.request<{ domain: Domain }>({
      method: "POST",
      path: "/domains",
      body: params,
    });
    return res.domain;
  }

  /** Delete your domain */
  async delete(): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: "/domains",
    });
  }

  /** List the domains in your Resend account, and which one is selected */
  async listResendDomains(): Promise<ResendDomainList> {
    return this.client.request({
      method: "GET",
      path: "/domains/sync",
    });
  }

  /** Select a domain from your Resend account and copy its details */
  async syncResendDomain(params: ResendDomainSyncParams): Promise<Domain> {
    const res = await this.client.request<{ domain: Domain; message?: string }>({
      method: "POST",
      path: "/domains/sync",
      body: params,
    });
    return res.domain;
  }

  /** Start DNS verification and return the updated domain */
  async verify(): Promise<Domain> {
    const res = await this.client.request<{ domain: Domain }>({
      method: "POST",
      path: "/domains/verify",
    });
    return res.domain;
  }

  /** Fetch the latest verification status and return the updated domain */
  async refresh(): Promise<Domain> {
    const res = await this.client.request<{ domain: Domain }>({
      method: "POST",
      path: "/domains/refresh",
    });
    return res.domain;
  }
}
