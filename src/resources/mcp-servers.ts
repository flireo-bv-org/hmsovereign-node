import type { HttpClient } from "../client";
import { encodePathParam } from "../client";
import type {
  McpServer,
  McpServerCreateParams,
  McpServerTestParams,
  McpServerTestResult,
  McpServerUpdateParams,
} from "../types";

/**
 * MCP servers whose tools your assistants can use during a call. Attach a server to an
 * assistant with a tool of type `mcp` in `llm_config.tools`.
 *
 * Header values are write-only: they are stored encrypted and never returned.
 * `header_names` shows which headers are set.
 */
export class McpServers {
  constructor(private readonly client: HttpClient) {}

  /** List the MCP servers of your organization */
  async list(): Promise<McpServer[]> {
    const res = await this.client.request<{ mcp_servers: McpServer[] }>({
      method: "GET",
      path: "/mcp-servers",
    });
    return res.mcp_servers;
  }

  /** Get an MCP server */
  async get(id: string): Promise<McpServer> {
    const res = await this.client.request<{ mcp_server: McpServer }>({
      method: "GET",
      path: `/mcp-servers/${encodePathParam(id)}`,
    });
    return res.mcp_server;
  }

  /** Add an MCP server, with the headers it expects */
  async create(params: McpServerCreateParams): Promise<McpServer> {
    const res = await this.client.request<{ mcp_server: McpServer }>({
      method: "POST",
      path: "/mcp-servers",
      body: params,
    });
    return res.mcp_server;
  }

  /**
   * Update an MCP server. `headers` replaces all stored headers; `{}` removes them.
   * When `url` points to a different host than before, send `headers` in the same call.
   */
  async update(id: string, params: McpServerUpdateParams): Promise<McpServer> {
    const res = await this.client.request<{ mcp_server: McpServer }>({
      method: "PATCH",
      path: `/mcp-servers/${encodePathParam(id)}`,
      body: params,
    });
    return res.mcp_server;
  }

  /** Delete an MCP server. Refused with a 409 while an assistant still uses it. */
  async delete(id: string): Promise<void> {
    await this.client.request<{ success: boolean }>({
      method: "DELETE",
      path: `/mcp-servers/${encodePathParam(id)}`,
    });
  }

  /**
   * Connect to the server from the platform and list its tools. `headers` are used for
   * this test only and are not stored. A server that cannot be reached returns
   * `ok: false` with the reason, not an error.
   */
  async test(id: string, params?: McpServerTestParams): Promise<McpServerTestResult> {
    return this.client.request<McpServerTestResult>({
      method: "POST",
      path: `/mcp-servers/${encodePathParam(id)}/test`,
      body: params,
    });
  }
}
