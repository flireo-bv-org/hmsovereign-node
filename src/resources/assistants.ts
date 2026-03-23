import type { HttpClient } from "../client";
import type { Assistant, AssistantCreateParams, AssistantUpdateParams } from "../types";

export class Assistants {
  constructor(private readonly client: HttpClient) {}

  /** List all assistants in your organization */
  async list(): Promise<Assistant[]> {
    const res = await this.client.request<{ assistants: Assistant[] }>({
      method: "GET",
      path: "/assistants",
    });
    return res.assistants;
  }

  /** Get a specific assistant by ID */
  async get(id: string): Promise<Assistant> {
    const res = await this.client.request<{ assistant: Assistant }>({
      method: "GET",
      path: `/assistants/${id}`,
    });
    return res.assistant;
  }

  /** Create a new assistant. Only `name` is required. */
  async create(params: AssistantCreateParams): Promise<Assistant> {
    const res = await this.client.request<{ assistant: Assistant }>({
      method: "POST",
      path: "/assistants",
      body: params,
    });
    return res.assistant;
  }

  /** Update an assistant. Only provided fields will be changed. */
  async update(id: string, params: AssistantUpdateParams): Promise<Assistant> {
    const res = await this.client.request<{ assistant: Assistant }>({
      method: "PATCH",
      path: `/assistants/${id}`,
      body: params,
    });
    return res.assistant;
  }

  /** Delete an assistant */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/assistants/${id}`,
    });
  }
}
