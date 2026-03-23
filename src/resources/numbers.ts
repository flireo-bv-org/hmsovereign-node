import type { HttpClient } from "../client";
import type { PhoneNumber, PhoneNumberCreateParams, PhoneNumberUpdateParams } from "../types";

export class Numbers {
  constructor(private readonly client: HttpClient) {}

  /** List all phone numbers */
  async list(): Promise<PhoneNumber[]> {
    const res = await this.client.request<{ numbers: PhoneNumber[] }>({
      method: "GET",
      path: "/numbers",
    });
    return res.numbers;
  }

  /** Get a specific phone number by ID */
  async get(id: string): Promise<PhoneNumber> {
    const res = await this.client.request<{ number: PhoneNumber }>({
      method: "GET",
      path: `/numbers/${id}`,
    });
    return res.number;
  }

  /** Register a phone number */
  async create(params: PhoneNumberCreateParams): Promise<PhoneNumber> {
    const res = await this.client.request<{ number: PhoneNumber }>({
      method: "POST",
      path: "/numbers",
      body: params,
    });
    return res.number;
  }

  /** Update a phone number */
  async update(id: string, params: PhoneNumberUpdateParams): Promise<PhoneNumber> {
    const res = await this.client.request<{ number: PhoneNumber }>({
      method: "PATCH",
      path: `/numbers/${id}`,
      body: params,
    });
    return res.number;
  }

  /** Delete a phone number */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/numbers/${id}`,
    });
  }
}
