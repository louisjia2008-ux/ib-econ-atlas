import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const studyRoute = "/ib-econ-atlas/#/study/u1-04-scarcity";

test("Unit 4 tariff diagrams and language switch fit every release viewport", async ({ page }) => {
  await page.goto("/ib-econ-atlas/#/study/u4-07-tariff");
  await expect(page.getByRole("heading", { level: 1, name: "关税与小国福利" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Unit 4");
  await expect(page.locator(".micro-diagram table")).toContainText("Qd1−Qs1");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tariffs and small-country welfare" })).toBeVisible();
  await expect(page.locator(".micro-diagram table")).toContainText("Post-tariff imports");
  await expectNoHorizontalOverflow(page);
});

test("Unit 4 first visit, cross-language search and progress persist offline", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One context verifies Unit 4 precache and persistence.");
  await page.goto(studyRoute);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  try {
    await page.goto("/ib-econ-atlas/#/study/u4-33-j-curve");
    await expect(page.getByRole("heading", { level: 1, name: "J 曲线与调整时滞" })).toBeVisible();
    await expect(page.locator(".micro-diagram img")).toBeVisible();
    expect(await page.locator(".micro-diagram img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Switch to English" }).click();
    await page.getByRole("searchbox").fill("比较优势");
    await page.getByRole("button", { name: /Comparative advantage and the trading interval/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Comparative advantage and the trading interval" })).toBeVisible();
    await page.getByRole("button", { name: "Select scope: Benefits of international trade", exact: true }).click();
    await page.goto("/ib-econ-atlas/#/review");
    await page.getByRole("button", { name: "Flashcards", exact: true }).click();
    await page.getByRole("button", { name: "Build review session" }).click();
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Okay", exact: true }).click();
    await expect(page.getByText("2 / 6", { exact: true })).toBeVisible();
    await page.goto("/ib-econ-atlas/#/progress");
    await expect(page.locator(".stat-grid article").filter({ hasText: "Learning" }).getByRole("strong")).toHaveText("1");
    await page.reload();
    await expect(page.locator(".stat-grid article").filter({ hasText: "Learning" }).getByRole("strong")).toHaveText("1");
  } finally { await context.setOffline(false); }
});

test("SL excludes advanced calculations without hiding shared trade theory", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Shared curriculum-level controls.");
  await page.goto("/ib-econ-atlas/#/study/u4-07-tariff");
  await expect(page.getByRole("heading", { name: "HL 深入与计算", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "关税与小国福利" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HL 深入与计算", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "开始 3 道练习", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "选择范围: 贸易保护的类型", exact: true }).click();
  await page.goto("/ib-econ-atlas/#/review");
  await page.getByRole("button", { name: "选择题", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组", exact: true }).click();
  await expect(page.getByText("1 / 5", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText(/单位关税 3|单位补贴 4|出口补贴 2/);
});

test("Unit 3 bilingual macro diagrams fit every release viewport", async ({ page }) => {
  await page.goto("/ib-econ-atlas/#/study/u3-19-macro-shocks");
  await expect(page.getByRole("heading", { level: 1, name: "需求冲击、供给冲击与滞胀" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Unit 3");
  await expect(page.locator(".micro-diagram table")).toContainText("Y1<Y0");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Demand shocks, supply shocks and stagflation" })).toBeVisible();
  await expect(page.locator(".micro-diagram table")).toContainText("With AD unchanged");
  await expectNoHorizontalOverflow(page);
});

test("Unit 3 directory, HL filter and scoped practice compose", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Shared desktop directory state.");
  await page.goto("/ib-econ-atlas/#/study/u3-49-multiplier");
  await expect(page.getByText("Unit 3 · 宏观经济学", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "教材目录" }).click();
  await expect(page.locator(".tree-section-button").filter({ hasText: "Chapter 13 · 宏观经济政策" })).toBeVisible();
  await page.getByRole("tab", { name: "考纲目录" }).click();
  await page.getByRole("button", { name: "选择范围: 财政政策", exact: true }).click();
  await expect(page.getByText("7 / 227", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await expect(page.getByRole("button", { name: "凯恩斯乘数", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "全部 + 扩展", exact: true }).click();
  await page.goto("/ib-econ-atlas/#/review");
  await page.getByRole("button", { name: "选择题", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组" }).click();
  await expect(page.getByRole("button", { name: "提交答案" })).toBeVisible();
});

test("Unit 3 first visit, bilingual diagrams, search and review work offline", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Shared service-worker precache.");
  await page.goto(studyRoute);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  try {
    await page.goto("/ib-econ-atlas/#/study/u3-19-macro-shocks");
    await expect(page.getByRole("heading", { level: 1, name: "需求冲击、供给冲击与滞胀" })).toBeVisible();
    expect(await page.locator(".micro-diagram img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Switch to English" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Demand shocks, supply shocks and stagflation" })).toBeVisible();
    await page.getByRole("searchbox").fill("凯恩斯乘数");
    await page.getByRole("button", { name: /Keynesian multiplier/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "The Keynesian multiplier" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "The Keynesian multiplier" })).toBeVisible();
    await page.getByRole("button", { name: "Select scope: Fiscal policy", exact: true }).click();
    await page.goto("/ib-econ-atlas/#/review");
    await page.getByRole("button", { name: "Flashcards", exact: true }).click();
    await page.getByRole("button", { name: "Build review session" }).click();
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Okay", exact: true }).click();
    await expect(page.getByText("2 / 7", { exact: true })).toBeVisible();
    await page.goto("/ib-econ-atlas/#/progress");
    await expect(page.locator(".stat-grid article").filter({ hasText: "Learning" }).getByRole("strong")).toHaveText("1");
    await page.reload();
    await expect(page.locator(".stat-grid article").filter({ hasText: "Learning" }).getByRole("strong")).toHaveText("1");
  } finally { await context.setOffline(false); }
});

test("Unit 2 bilingual study and diagrams adapt at every release width", async ({ page }) => {
  await page.goto("/ib-econ-atlas/#/study/u2-34-negative-production");
  await expect(page.getByRole("heading", { level: 1, name: "负生产外部性" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Unit 2");
  await expect(page.getByAltText(/MSC>MPC/)).toBeVisible();
  await expect(page.locator(".micro-diagram table")).toContainText("Qm");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Negative production externalities" })).toBeVisible();
  await expect(page.locator(".micro-diagram table")).toContainText("Private output");
  await expectNoHorizontalOverflow(page);
});

test("Unit 2 directory, scope, HL filter and review compose", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Shared desktop navigation and review state.");
  await page.goto("/ib-econ-atlas/#/study/u2-01-demand");
  await expect(page.getByText("Unit 2 · 微观经济学", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "教材目录" }).click();
  await expect(page.locator(".tree-section-button").filter({ hasText: "Chapter 2 · 竞争市场" })).toBeVisible();
  await page.getByRole("tab", { name: "考纲目录" }).click();
  await page.getByRole("button", { name: "选择范围: 需求", exact: true }).click();
  await expect(page.getByText("5 / 227", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await expect(page.getByRole("button", { name: "边际效用与消费者选择", exact: true })).toHaveCount(0);
  await page.goto("/ib-econ-atlas/#/review");
  await page.getByRole("button", { name: "闪卡", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组" }).click();
  await expect(page.getByRole("button", { name: "显示答案" })).toBeVisible();
  await page.getByRole("button", { name: "显示答案" }).click();
  await expect(page.locator("main")).toContainText(/需求/);
});

test("Unit 2 is cached before first visit and opens offline with its diagrams", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One context verifies the shared precache.");
  await page.goto(studyRoute);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  try {
    await page.goto("/ib-econ-atlas/#/study/u2-34-negative-production");
    await expect(page.getByRole("heading", { level: 1, name: "负生产外部性" })).toBeVisible();
    await expect(page.getByAltText(/MSC>MPC/)).toBeVisible();
    expect(await page.locator(".micro-diagram img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("searchbox").fill("adverse selection");
    await expect(page.getByRole("button", { name: /逆向选择/ }).first()).toBeVisible();
    await page.getByRole("button", { name: /逆向选择/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "信息不对称与逆向选择" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "信息不对称与逆向选择" })).toBeVisible();
  } finally { await context.setOffline(false); }
});

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
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.locator("#definition-title").scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Scarcity" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/#\/study\/u1-04-scarcity$/);
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThanOrEqual(2);

  // Wait for IndexedDB persistence rather than relying on an arbitrary reload delay.
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ib-econ-atlas");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<string | undefined>((resolve, reject) => {
        const request = database.transaction("settings").objectStore("settings").get("preferences");
        request.onsuccess = () => resolve(request.result?.value.locale);
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  })).toBe("en");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Scarcity" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "稀缺性" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("the global level filter applies to progress and resets an active review", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop run covers shared level state.");
  await page.goto("/ib-econ-atlas/#/progress");
  const newCount = page.locator(".stat-grid article").filter({ hasText: "未学" }).getByRole("strong");
  await expect(newCount).toHaveText("227");
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await expect(newCount).toHaveText("178");
  await page.getByRole("button", { name: "HL", exact: true }).click();
  await expect(newCount).toHaveText("226");
  await page.goto("/ib-econ-atlas/#/review");
  await page.getByRole("button", { name: "闪卡", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组" }).click();
  await expect(page.getByRole("button", { name: "显示答案" })).toBeVisible();
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await expect(page.getByRole("heading", { name: "开始一次复习" })).toBeVisible();
  await expect(page.getByRole("button", { name: "显示答案" })).toHaveCount(0);
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
  await page.getByRole("button", { name: "选择范围: 什么是经济学？" }).click();
  await expect(page.getByText("29 / 227", { exact: true })).toBeVisible();
  await page.goto("/ib-econ-atlas/#/progress");
  await expect(page.getByText("当前仅统计考试范围内的 29 个知识点。")).toBeVisible();
  await page.goto(studyRoute);
  await search.fill("循环经济");
  await expect(page.getByRole("button", { name: /相互依存与循环经济/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Clear scope", exact: true }).click();
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
  for (const checkbox of await page.locator(".answer-review-checks input").all()) await checkbox.check();
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
