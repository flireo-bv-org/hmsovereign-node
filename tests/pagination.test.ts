import { describe, it, expect } from "vitest";
import { Page, AutoPaginator } from "../src/pagination";

describe("Page", () => {
  it("hasMore is true when more items exist", () => {
    const page = new Page([1, 2, 3], { total: 10, limit: 3, offset: 0 });
    expect(page.hasMore).toBe(true);
    expect(page.nextOffset).toBe(3);
  });

  it("hasMore is false on last page", () => {
    const page = new Page([7, 8, 9, 10], { total: 10, limit: 5, offset: 6 });
    expect(page.hasMore).toBe(false);
  });

  it("hasMore is false when data is empty", () => {
    const page = new Page([], { total: 0, limit: 100, offset: 0 });
    expect(page.hasMore).toBe(false);
  });
});

describe("AutoPaginator", () => {
  it("iterates through multiple pages", async () => {
    const pages = [
      { data: [1, 2, 3], pagination: { total: 7, limit: 3, offset: 0 } },
      { data: [4, 5, 6], pagination: { total: 7, limit: 3, offset: 3 } },
      { data: [7], pagination: { total: 7, limit: 3, offset: 6 } },
    ];
    let callIndex = 0;

    const paginator = new AutoPaginator(async () => {
      return pages[callIndex++];
    }, 3);

    const items: number[] = [];
    for await (const item of paginator) {
      items.push(item);
    }

    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(callIndex).toBe(3);
  });

  it("toArray() collects all items", async () => {
    const paginator = new AutoPaginator(async () => {
      return { data: [1, 2, 3], pagination: { total: 3, limit: 100, offset: 0 } };
    });

    const items = await paginator.toArray();
    expect(items).toEqual([1, 2, 3]);
  });

  it("handles empty results", async () => {
    const paginator = new AutoPaginator(async () => {
      return { data: [], pagination: { total: 0, limit: 100, offset: 0 } };
    });

    const items = await paginator.toArray();
    expect(items).toEqual([]);
  });
});
