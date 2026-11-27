import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { visibleBanners } from "./banners";

const b = (id: string, extra: object = {}) => ({ id, title: id, subtitle: "", image: "https://x/i.jpg", ...extra });
const now = new Date("2026-06-15T12:00:00Z").getTime();

describe("visibleBanners", () => {
  it("hides inactive banners", () => {
    assert.deepEqual(visibleBanners([b("a", { active: false }), b("b")], now).map((x) => x.id), ["b"]);
  });
  it("hides banners before start and after end", () => {
    const list = [b("future", { startsAt: "2026-07-01T00:00:00Z" }), b("past", { endsAt: "2026-06-01T00:00:00Z" }), b("ok", { startsAt: "2026-06-01T00:00:00Z", endsAt: "2026-07-01T00:00:00Z" })];
    assert.deepEqual(visibleBanners(list, now).map((x) => x.id), ["ok"]);
  });
  it("orders by position", () => {
    assert.deepEqual(visibleBanners([b("c", { position: 3 }), b("a", { position: 1 })], now).map((x) => x.id), ["a", "c"]);
  });
});
