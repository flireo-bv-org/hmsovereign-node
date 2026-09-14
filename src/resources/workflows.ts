import type { HttpClient } from "../client";
import { encodePathParam } from "../client";
import type { Workflow, WorkflowCreateParams, WorkflowSummary, WorkflowUpdateParams } from "../types";

export class Workflows {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all workflows in your organization.
   *
   * The list view summarizes each graph (entry node, node and edge counts);
   * use `get()` for the full definition.
   */
  async list(): Promise<WorkflowSummary[]> {
    const res = await this.client.request<{ workflows: WorkflowSummary[] }>({
      method: "GET",
      path: "/workflows",
    });
    return res.workflows;
  }

  /** Get a specific workflow with its full definition */
  async get(id: string): Promise<Workflow> {
    const res = await this.client.request<{ workflow: Workflow }>({
      method: "GET",
      path: `/workflows/${encodePathParam(id)}`,
    });
    return res.workflow;
  }

  /**
   * Create a workflow. The definition is validated on write: an invalid one is
   * rejected with a 400 carrying a `details` array of developer-readable errors.
   * Attach it to a phone number with `numbers.update(id, { workflow_id })`.
   */
  async create(params: WorkflowCreateParams): Promise<Workflow> {
    const res = await this.client.request<{ workflow: Workflow }>({
      method: "POST",
      path: "/workflows",
      body: params,
    });
    return res.workflow;
  }

  /**
   * Update a workflow. A new definition replaces the old one entirely. Changes
   * apply to the next call; calls in progress finish on the definition they
   * started with.
   */
  async update(id: string, params: WorkflowUpdateParams): Promise<Workflow> {
    const res = await this.client.request<{ workflow: Workflow }>({
      method: "PATCH",
      path: `/workflows/${encodePathParam(id)}`,
      body: params,
    });
    return res.workflow;
  }

  /**
   * Delete a workflow.
   *
   * Throws an `ApiRequestError` with status 409 while phone numbers still run
   * this workflow. Detach them first with
   * `numbers.update(numberId, { workflow_id: null })`.
   */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/workflows/${encodePathParam(id)}`,
    });
  }
}
