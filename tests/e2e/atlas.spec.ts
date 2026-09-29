import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const studyRoute = "/ib-econ-atlas/#/study/u1-04-scarcity";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.document, metrics.body)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test("study workspace adapts at the release viewports", async ({ page }, testInfo) => {
  await page.goto(studyRoute);
  await expect(page.getByRole("heading", { level: 1, name: "稀缺性" })).toBeVisible();
  await expect(page.getByText("Scarcity", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const directory = page.getByRole("complementary", { name: "学习路径" });
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  if (testInfo.project.name === "desktop") {
    await expect(directory).toBeVisible();
    await expect(page.getByRole("complementary", { name: "学习状态" })).toBeVisible();
    await expect(mobileNav).toBeHidden();
  } else {
    await expect(directory).toBeHidden();
    await expect(mobileNav).toBeVisible();
    await page.getByRole("button", { name: "目录" }).click();
    await expect(directory).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(directory).toBeHidden();
  }
});

test("language switch preserves the knowledge route and reading position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop run covers shared locale state.");
  await page.goto(studyRoute);
  await page.locator("#definition-title").scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Scarcity" })).toBeVisible();
  await expect(page).toHaveURL(/#\/study\/u1-04-scarcity$/);
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
});

test("bilingual fuzzy search, directory modes, and session scope compose", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The navigation rail is exercised at desktop width.");
  await page.goto(studyRoute);
  await page.getByRole("tab", { name: "教材目录" }).click();
  await expect(page.locator(".tree-section-button").filter({ hasText: "Chapter 1 · 经济学基础" })).toBeVisible();
  await page.getByRole("tab", { name: "考纲目录" }).click();

  const search = page.getByRole("searchbox", { name: "搜索概念、术语或考纲代码" });
  await search.fill("scarcty");
  await expect(page).toHaveURL(/#\/search$/);
  await expect(page.getByRole("button", { name: /1\.1 · CORE .*稀缺性/ }).first()).toBeVisible();

  await page.goto(studyRoute);
  await page.getByRole("button", { name: "选择范围: 经济学的本质" }).click();
  await expect(page.getByText("15 / 43", { exact: true })).toBeVisible();
  await page.goto("/ib-econ-atlas/#/progress");
  await expect(page.getByText("当前仅统计考试范围内的 15 个知识点。")).toBeVisible();
  await page.goto(studyRoute);
  await search.fill("循环经济");
  await expect(page.getByText("当前筛选和考试范围没有匹配项。")).toBeVisible();
  await page.getByRole("button", { name: "清除考试范围" }).click();
  await expect(page.getByRole("button", { name: /相互依存与循环经济/ })).toBeVisible();
});

test("short-answer review exposes scoring, override, and persisted progress", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser run covers the shared review engine.");
  await page.goto("/ib-econ-atlas/#/review");
  await page.getByRole("button", { name: "简答题" }).click();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组" }).click();
  const answer = page.getByRole("textbox");
  await expect(answer).toBeVisible();
  await answer.fill("这是一个不完整但可人工复核的答案。");
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("关键词覆盖率")).toBeVisible();
  await page.getByRole("button", { name: "部分正确" }).click();
  await page.getByRole("button", { name: "一般" }).click();
  await expect(page.getByText("2 / 5", { exact: true })).toBeVisible();

  await page.goto("/ib-econ-atlas/#/progress");
  const learningCard = page.locator(".stat-grid article").filter({ hasText: "学习中" });
  await expect(learningCard.getByRole("strong")).toHaveText("1");
});

test("PPC supports keyboard movement, growth, and non-interactive alternatives", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop run covers the shared model.");
  await page.goto("/ib-econ-atlas/#/study/u1-25-ppc-construction");
  const chart = page.getByRole("application", { name: /互动 PPC 实验台/ });
  await expect(chart).toBeVisible();
  const point = chart.locator("circle.choice-point");
  const before = await point.getAttribute("cx");
  await chart.focus();
  await chart.press("ArrowRight");
  await expect(point).not.toHaveAttribute("cx", before ?? "");
  await page.getByRole("button", { name: /模拟资源 \/ 技术增长/ }).click();
  await expect(page.locator(".capacity-readout strong")).toHaveText("120");
  const controlIcon = page.locator(".ppc-controls button svg").first();
  const controlIconBox = await controlIcon.boundingBox();
  expect(controlIconBox?.height).toBeLessThanOrEqual(24);
  await page.getByText("查看静态 SVG 与数据表").click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByAltText(/PPC 静态图/)).toBeVisible();
});

test("settings export omits exam scope and local AI credentials", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop download covers shared backup behavior.");
  await page.goto("/ib-econ-atlas/#/settings");
  await expect(page.getByText(/首版默认未配置/)).toBeVisible();
  await page.getByRole("checkbox", { name: "在此设备启用 AI" }).check();
  await page.getByRole("textbox", { name: "Worker endpoint" }).fill("https://example.invalid");
  await page.getByLabel("Owner access token").fill("local-test-token-never-export");
  await page.getByRole("button", { name: "保存本机配置" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^ib-econ-atlas-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const filePath = await download.path();
  expect(filePath).not.toBeNull();
  const backupText = await fs.readFile(filePath as string, "utf8");
  expect(backupText).not.toContain("local-test-token-never-export");
  expect(backupText).not.toContain("https://example.invalid");
  expect(backupText).not.toContain("scopeIds");
});

test("installed PWA reloads, searches, and reads while offline", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One Chromium context covers the shared service worker.");
  await page.goto(studyRoute);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "稀缺性" })).toBeVisible();
    await expect(page.getByText("当前离线", { exact: true })).toBeVisible();
    await page.getByRole("searchbox", { name: "搜索概念、术语或考纲代码" }).fill("opportunity cost");
    await expect(page.getByRole("button", { name: /机会成本/ }).first()).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("200 percent root text scaling keeps the mobile page inside the viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "The narrowest viewport is the limiting zoom case.");
  await page.goto(studyRoute);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page.getByRole("heading", { level: 1, name: "稀缺性" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
