import type { HttpClient } from "../client";
import type {
  AnalysisTemplate,
  AnalysisTemplateCreateParams,
  AnalysisTemplateUpdateParams,
} from "../types";

export class AnalysisTemplates {
  constructor(private readonly client: HttpClient) {}

  /** List all analysis templates */
  async list(): Promise<AnalysisTemplate[]> {
    const res = await this.client.request<{ analysis_templates: AnalysisTemplate[] }>({
      method: "GET",
      path: "/analysis-templates",
    });
    return res.analysis_templates;
  }

  /** Get a specific analysis template */
  async get(id: string): Promise<AnalysisTemplate> {
    const res = await this.client.request<{ analysis_template: AnalysisTemplate }>({
      method: "GET",
      path: `/analysis-templates/${id}`,
    });
    return res.analysis_template;
  }

  /** Create an analysis template */
  async create(params: AnalysisTemplateCreateParams): Promise<AnalysisTemplate> {
    const res = await this.client.request<{ analysis_template: AnalysisTemplate }>({
      method: "POST",
      path: "/analysis-templates",
      body: params,
    });
    return res.analysis_template;
  }

  /** Update an analysis template */
  async update(id: string, params: AnalysisTemplateUpdateParams): Promise<AnalysisTemplate> {
    const res = await this.client.request<{ analysis_template: AnalysisTemplate }>({
      method: "PATCH",
      path: `/analysis-templates/${id}`,
      body: params,
    });
    return res.analysis_template;
  }

  /** Delete an analysis template */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/analysis-templates/${id}`,
    });
  }
}
