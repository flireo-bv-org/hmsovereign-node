import type { HttpClient } from "../client";
import type { ToolTemplate, ToolTemplateCreateParams, ToolTemplateUpdateParams } from "../types";

export class ToolTemplates {
  constructor(private readonly client: HttpClient) {}

  /** List all tool templates */
  async list(): Promise<ToolTemplate[]> {
    const res = await this.client.request<{ tool_templates: ToolTemplate[] }>({
      method: "GET",
      path: "/tool-templates",
    });
    return res.tool_templates;
  }

  /** Get a specific tool template */
  async get(id: string): Promise<ToolTemplate> {
    const res = await this.client.request<{ tool_template: ToolTemplate }>({
      method: "GET",
      path: `/tool-templates/${id}`,
    });
    return res.tool_template;
  }

  /** Create a tool template */
  async create(params: ToolTemplateCreateParams): Promise<ToolTemplate> {
    const res = await this.client.request<{ tool_template: ToolTemplate }>({
      method: "POST",
      path: "/tool-templates",
      body: params,
    });
    return res.tool_template;
  }

  /** Update a tool template */
  async update(id: string, params: ToolTemplateUpdateParams): Promise<ToolTemplate> {
    const res = await this.client.request<{ tool_template: ToolTemplate }>({
      method: "PATCH",
      path: `/tool-templates/${id}`,
      body: params,
    });
    return res.tool_template;
  }

  /** Delete a tool template */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/tool-templates/${id}`,
    });
  }
}
