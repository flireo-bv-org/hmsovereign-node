import type { HttpClient } from "../client";
import type { Organization, OrganizationCreateParams } from "../types";

export class Organizations {
  constructor(private readonly client: HttpClient) {}

  /** Get your organization details */
  async get(): Promise<Organization> {
    return this.client.request({
      method: "GET",
      path: "/organizations",
    });
  }

  /** Create a new child organization (whitelabel) */
  async create(params: OrganizationCreateParams): Promise<Organization> {
    return this.client.request({
      method: "POST",
      path: "/organizations",
      body: params,
    });
  }
}
