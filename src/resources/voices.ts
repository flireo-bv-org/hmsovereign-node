import type { HttpClient } from "../client";
import type { Voice } from "../types";

export class Voices {
  constructor(private readonly client: HttpClient) {}

  /** List all available voices */
  async list(): Promise<Voice[]> {
    const res = await this.client.request<{ voices: Voice[] }>({
      method: "GET",
      path: "/voices",
    });
    return res.voices;
  }
}
