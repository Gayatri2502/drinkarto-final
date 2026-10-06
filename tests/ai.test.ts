import { afterEach, describe, it, expect, vi } from "vitest";
const analytics = vi.hoisted(() => ({ tool: vi.fn() }));
vi.mock("../src/lib/analytics", () => ({
  analyticsNames: ["getRetailerCount"],
  analyticsTool: analytics.tool,
}));
import { answerQuestion } from "../src/lib/ai";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("controlled AI loop", () => {
  it("binds tool execution to the trusted organization and disables provider storage", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    vi.stubEnv("OPENAI_ENV_FILE", "");
    analytics.tool.mockResolvedValue({ retailers: 2 });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "completed",
            output: [
              {
                type: "function_call",
                name: "getRetailerCount",
                arguments: '{"days":30}',
                call_id: "call1",
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "completed",
            output: [
              {
                type: "message",
                content: [
                  { type: "output_text", text: "There are 2 retailers." },
                ],
              },
            ],
          }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    const result = await answerQuestion(
      "trusted-tenant",
      "How many retailers?",
    );
    expect(analytics.tool).toHaveBeenCalledWith(
      "trusted-tenant",
      "getRetailerCount",
      { days: 30 },
    );
    expect(result.sources).toEqual(["getRetailerCount"]);
    const first = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(first.store).toBe(false);
    expect(first.tools[0].parameters.additionalProperties).toBe(false);
  });
  it("returns a clear error when the provider rejects access", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    vi.stubEnv("OPENAI_ENV_FILE", "");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 401 })),
    );
    await expect(answerQuestion("tenant", "Stock status")).rejects.toThrow(
      "status 401",
    );
    expect(analytics.tool).not.toHaveBeenCalled();
  });
});
