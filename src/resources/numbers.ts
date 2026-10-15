import type { HttpClient } from "../client";
import { encodePathParam } from "../client";
import type {
  NumberWhatsapp,
  NumberWhatsappUpdateParams,
  PhoneNumber,
  PhoneNumberCreateParams,
  PhoneNumberUpdateParams,
} from "../types";

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
      path: `/numbers/${encodePathParam(id)}`,
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
      path: `/numbers/${encodePathParam(id)}`,
      body: params,
    });
    return res.number;
  }

  /** Delete a phone number */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/numbers/${encodePathParam(id)}`,
    });
  }

  /** Get the WhatsApp calling status of a number. The SIP password is never returned. */
  async getWhatsapp(id: string): Promise<NumberWhatsapp> {
    return this.client.request<NumberWhatsapp>({
      method: "GET",
      path: `/numbers/${encodePathParam(id)}/whatsapp`,
    });
  }

  /**
   * Turn on WhatsApp calling with the SIP password Meta generated for the number, or
   * replace the stored password. Applied in the background: the result has status
   * `pending`, and `getWhatsapp()` shows `active` once it is done, usually within a minute.
   */
  async updateWhatsapp(id: string, params: NumberWhatsappUpdateParams): Promise<NumberWhatsapp> {
    return this.client.request<NumberWhatsapp>({
      method: "PUT",
      path: `/numbers/${encodePathParam(id)}/whatsapp`,
      body: params,
    });
  }

  /**
   * Turn off WhatsApp calling and remove the stored SIP password. Applied in the
   * background: the result has status `disabling`. Phone calls are not affected.
   */
  async deleteWhatsapp(id: string): Promise<NumberWhatsapp> {
    return this.client.request<NumberWhatsapp>({
      method: "DELETE",
      path: `/numbers/${encodePathParam(id)}/whatsapp`,
    });
  }
}
