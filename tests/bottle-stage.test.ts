import { describe, it, expect } from "vitest";
import { bottlePose } from "../src/lib/bottle-stage";
describe("upright bottle stage", () => {
  it("keeps the selected photograph full size and facing the reader", () => {
    const pose = bottlePose(0, 1000);
    expect(pose.opacity).toBe(1);
    expect(pose.zIndex).toBeGreaterThan(bottlePose(1, 1000).zIndex);
    expect(pose.transform).toContain("scale(1)");
    expect(pose.transform).toContain("rotateY(0deg)");
  });
  it("uses depth while keeping every bottle upright throughout a gesture", () => {
    for (let offset = -6; offset <= 6; offset += 0.125) {
      const pose = bottlePose(offset, 390);
      expect(pose.transform).not.toMatch(/rotate[ZX]/);
      expect(pose.transform).not.toContain("NaN");
      expect(pose.opacity).toBeGreaterThanOrEqual(0);
      expect(pose.opacity).toBeLessThanOrEqual(1);
    }
  });
  it("reduces neighbour emphasis without treating it as the selected bottle", () => {
    expect(bottlePose(0.5, 390).opacity).toBeGreaterThan(
      bottlePose(2, 390).opacity,
    );
    expect(bottlePose(-1, 390).transform).not.toBe(
      bottlePose(1, 390).transform,
    );
    expect(bottlePose(3, 390).opacity).toBe(0);
  });
});
