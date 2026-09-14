import type { HttpClient } from "../client";
import type {
  Organization,
  OrganizationCreateParams,
  OrganizationCreated,
  OrganizationGetParams,
  OrganizationRetention,
  OrganizationUpdateParams,
} from "../types";

export class Organizations {
  constructor(private readonly client: HttpClient) {}

  /** Get your organization details. Pass `include_children: true` to get the child organizations too. */
  async get(params?: OrganizationGetParams): Promise<Organization> {
    return this.client.request({
      method: "GET",
      path: "/organizations",
      query:
        params?.include_children === undefined ? undefined : { include_children: params.include_children },
    });
  }

  /**
   * Create a new child organization (whitelabel).
   *
   * The response carries the new organization's API key. It is returned once,
   * here, and cannot be retrieved afterwards.
   */
  async create(params: OrganizationCreateParams): Promise<OrganizationCreated> {
    return this.client.request({
      method: "POST",
      path: "/organizations",
      body: params,
    });
  }

  /**
   * Set how long your organization's calls are kept.
   *
   * Both periods are required: they are validated against each other, and
   * content can never be kept longer than metadata. Shortening a period
   * destroys data — the nightly cleanup erases everything past it, and that
   * cannot be undone.
   */
  async update(params: OrganizationUpdateParams): Promise<OrganizationRetention> {
    return this.client.request({
      method: "PATCH",
      path: "/organizations",
      body: params,
    });
  }
}
