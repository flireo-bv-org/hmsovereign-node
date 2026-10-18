import type { HttpClient } from "../client";
import { encodePathParam } from "../client";
import type {
  ArenaCase,
  ArenaCaseListParams,
  ArenaCaseSaveParams,
  ArenaCatalog,
  ArenaRun,
  ArenaRunStartParams,
  ArenaSchedule,
  ArenaScheduleSaveParams,
  ArenaSuite,
  ArenaSuiteCreateParams,
  ArenaTrend,
  ArenaTrendParams,
} from "../types";

/** Arena: test calls that really call your assistant over the phone line. */
export class Arena {
  constructor(private readonly client: HttpClient) {}

  /** Personas, audio profiles, timeline events, channels, criterion kinds and metrics */
  async getCatalog(): Promise<ArenaCatalog> {
    const res = await this.client.request<{ arena_catalog: ArenaCatalog }>({ method: "GET", path: "/arena/catalog" });
    return res.arena_catalog;
  }

  /** List test suites */
  async listSuites(): Promise<ArenaSuite[]> {
    const res = await this.client.request<{ arena_suites: ArenaSuite[] }>({ method: "GET", path: "/arena/suites" });
    return res.arena_suites;
  }

  /** Create a test suite */
  async createSuite(params: ArenaSuiteCreateParams): Promise<ArenaSuite> {
    const res = await this.client.request<{ arena_suite: ArenaSuite }>({ method: "POST", path: "/arena/suites", body: params });
    return res.arena_suite;
  }

  /** Get a test suite with its current test cases */
  async getSuite(suiteId: string): Promise<ArenaSuite> {
    const res = await this.client.request<{ arena_suite: ArenaSuite }>({
      method: "GET",
      path: `/arena/suites/${encodePathParam(suiteId)}`,
    });
    return res.arena_suite;
  }

  /** Delete a test suite with its cases and runs */
  async deleteSuite(suiteId: string): Promise<void> {
    await this.client.request<{ success: boolean }>({ method: "DELETE", path: `/arena/suites/${encodePathParam(suiteId)}` });
  }

  /** List the test cases of a suite */
  async listCases(suiteId: string, params?: ArenaCaseListParams): Promise<ArenaCase[]> {
    const res = await this.client.request<{ arena_cases: ArenaCase[] }>({
      method: "GET",
      path: `/arena/suites/${encodePathParam(suiteId)}/cases`,
      query: typeof params === "object" && params?.include_retired ? { include_retired: true } : undefined,
    });
    return res.arena_cases;
  }

  /** Save a test case. Saving with an existing key creates a new version, unless the definition is unchanged. */
  async saveCase(suiteId: string, params: ArenaCaseSaveParams): Promise<ArenaCase> {
    const res = await this.client.request<{ arena_case: ArenaCase }>({
      method: "POST",
      path: `/arena/suites/${encodePathParam(suiteId)}/cases`,
      body: params,
    });
    return res.arena_case;
  }

  /** Get one version of a test case */
  async getCase(caseId: string): Promise<ArenaCase> {
    const res = await this.client.request<{ arena_case: ArenaCase }>({ method: "GET", path: `/arena/cases/${encodePathParam(caseId)}` });
    return res.arena_case;
  }

  /** Activate or retire a test case */
  async updateCaseStatus(caseId: string, status: "active" | "retired"): Promise<ArenaCase> {
    const res = await this.client.request<{ arena_case: ArenaCase }>({
      method: "PATCH",
      path: `/arena/cases/${encodePathParam(caseId)}`,
      body: { status },
    });
    return res.arena_case;
  }

  /** List the runs of a suite, newest first */
  async listRuns(suiteId: string): Promise<ArenaRun[]> {
    const res = await this.client.request<{ arena_runs: ArenaRun[] }>({
      method: "GET",
      path: `/arena/suites/${encodePathParam(suiteId)}/runs`,
    });
    return res.arena_runs;
  }

  /** Start a run. Test calls are real calls and are billed as such, on both legs. */
  async startRun(suiteId: string, params: ArenaRunStartParams = {}): Promise<ArenaRun> {
    const res = await this.client.request<{ arena_run: ArenaRun }>({
      method: "POST",
      path: `/arena/suites/${encodePathParam(suiteId)}/runs`,
      body: params,
    });
    return res.arena_run;
  }

  /** Get a run with its attempts, verdicts and metrics */
  async getRun(runId: string): Promise<ArenaRun> {
    const res = await this.client.request<{ arena_run: ArenaRun }>({ method: "GET", path: `/arena/runs/${encodePathParam(runId)}` });
    return res.arena_run;
  }

  /** The routine of a suite, or null when it has none */
  async getSchedule(suiteId: string): Promise<ArenaSchedule | null> {
    const res = await this.client.request<{ arena_schedule: ArenaSchedule | null }>({
      method: "GET",
      path: `/arena/suites/${encodePathParam(suiteId)}/schedule`,
    });
    return res.arena_schedule;
  }

  /**
   * Create or update the routine of a suite. Off until you enable it; at its monthly budget
   * it pauses. Saving it enabled again resumes it.
   */
  async saveSchedule(suiteId: string, params: ArenaScheduleSaveParams): Promise<ArenaSchedule> {
    const res = await this.client.request<{ arena_schedule: ArenaSchedule }>({
      method: "PUT",
      path: `/arena/suites/${encodePathParam(suiteId)}/schedule`,
      body: params,
    });
    return res.arena_schedule;
  }

  /** Remove the routine of a suite. Its runs and results stay. */
  async deleteSchedule(suiteId: string): Promise<void> {
    await this.client.request<{ success: boolean }>({ method: "DELETE", path: `/arena/suites/${encodePathParam(suiteId)}/schedule` });
  }

  /** Pass rates per case and criterion over the latest runs, with open regressions */
  async getTrend(suiteId: string, params?: ArenaTrendParams): Promise<ArenaTrend> {
    const res = await this.client.request<{ arena_trend: ArenaTrend }>({
      method: "GET",
      path: `/arena/suites/${encodePathParam(suiteId)}/trend`,
      query: params?.limit !== undefined ? { limit: params.limit } : undefined,
    });
    return res.arena_trend;
  }

  /** Cancel a run. Returns the number of attempts that were still queued. */
  async cancelRun(runId: string): Promise<number> {
    const res = await this.client.request<{ cancelled_attempts: number }>({
      method: "POST",
      path: `/arena/runs/${encodePathParam(runId)}/cancel`,
    });
    return res.cancelled_attempts;
  }
}
