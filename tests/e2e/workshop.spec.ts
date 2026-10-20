import fs from "node:fs/promises";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const route = "/ib-econ-atlas/#/study/u4-07-tariff";
async function capture(page: Page, info: TestInfo, name: string) {
  const dir = "output/playwright/tariff-improvements-2026-10-20";
  await fs.mkdir(dir, { recursive: true });
  if (await page.locator(".pwa-toast").isVisible()) await page.locator(".pwa-toast button").last().click();
  await page.screenshot({ path: `${dir}/${info.project.name}-${name}.png`, fullPage: false });
}
async function fit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth + 1));
}

test("a knowledge-point entry starts its own level-filtered practice instead of global review", async ({ page }, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "开始 4 道练习", exact: true }).click();
  await expect(page).toHaveURL(/#\/review\?point=u4-07-tariff$/);
  await expect(page.getByText("1 / 4", { exact: true })).toBeVisible();
  await expect(page.locator("button.current")).toHaveText("关税与小国福利");
  await expect(page.locator(".question-meta")).toContainText("关税与小国福利");
  await capture(page, info, "point-practice");
  await page.getByRole("button", { name: "返回知识点", exact: true }).click();
  await expect(page.getByRole("heading", { name: "关税与小国福利", exact: true })).toBeVisible();
  if (await page.getByRole("button", { name: "目录", exact: true }).isVisible()) await page.getByRole("button", { name: "目录", exact: true }).click();
  await page.getByRole("button", { name: "SL", exact: true }).click();
  await page.getByRole("button", { name: "选择范围: 什么是经济学？", exact: true }).click();
  const closeDirectory = page.getByRole("complementary", { name: "学习路径", exact: true }).getByRole("button", { name: "关闭目录", exact: true });
  if (await closeDirectory.isVisible()) await closeDirectory.click();
  await expect(page.getByRole("button", { name: "HL 计算与解释", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "开始 3 道练习", exact: true }).click();
  await expect(page.getByText("1 / 3", { exact: true })).toBeVisible();
  await expect(page.locator(".question-meta")).toContainText("关税与小国福利");
  await fit(page);
  await page.goto("/ib-econ-atlas/#/review?point=missing");
  await expect(page.getByRole("alert")).toContainText("该知识点不存在");
  await expect(page.getByRole("button", { name: "生成复习题组", exact: true })).toBeDisabled();
});

test("false keyword-complete answers wait for review and save an explicitly incorrect result", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Shared scoring and persistence path.");
  await page.goto("/ib-econ-atlas/#/review?point=u4-14-protection-evaluation");
  await page.getByRole("button", { name: "← 退出", exact: true }).click();
  await page.getByRole("button", { name: "简答题", exact: true }).click();
  await page.getByRole("button", { name: "生成复习题组", exact: true }).click();
  await page.getByRole("textbox").fill("贸易保护必定提高效率和公平，不需要比较任何替代方案。");
  await page.getByRole("button", { name: "提交答案", exact: true }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "正确", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "熟练", exact: true })).toBeDisabled();
  await capture(page, info, "pending-answer");
  for (const checkbox of await page.locator(".answer-review-checks input").all()) await checkbox.check();
  await expect(page.getByRole("button", { name: "熟练", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "错误", exact: true }).click();
  await page.getByRole("button", { name: "熟练", exact: true }).click();
  await expect(page.getByRole("heading", { name: "本轮完成", exact: true })).toBeVisible();
  await expect(page.getByText(/正确 0，部分正确 0，错误 1/)).toBeVisible();
  await page.reload();
  await page.goto("/ib-econ-atlas/#/progress");
  await expect(page.locator(".stat-grid article").filter({ hasText: "学习中" }).getByRole("strong")).toHaveText("1");
});

test("the tariff workshop supports drawing, model comparison, bilingual feedback and draft recovery", async ({ page }, info) => {
  await page.goto(route);
  const figure = page.locator(".knowledge-article > .micro-diagram");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure.getByRole("img")).toHaveJSProperty("complete", true);
  await fs.mkdir("output/playwright/tariff-improvements-2026-10-20", { recursive: true });
  await figure.screenshot({ path: `output/playwright/tariff-improvements-2026-10-20/${info.project.name}-tariff-welfare.png` });
  await page.getByRole("button", { name: "进入关税学习工坊：画图、考试题与反馈 ↓", exact: true }).click();
  await expect(page).toHaveURL(/#\/study\/u4-07-tariff$/);
  const canvas = page.getByRole("application", { name: "关税作图画布" });
  await canvas.scrollIntoViewIfNeeded();
  await canvas.focus();
  await canvas.press("Enter");
  await canvas.press("Shift+ArrowRight");
  await canvas.press("Enter");
  await expect(page.getByText(/已画 1 个元素；待放点 0/)).toBeVisible();
  await page.getByRole("button", { name: "福利区域", exact: true }).click();
  await canvas.focus();
  await canvas.press("Enter");
  await canvas.press("Shift+ArrowUp");
  await canvas.press("Enter");
  await canvas.press("Shift+ArrowRight");
  await canvas.press("Enter");
  await page.getByRole("button", { name: "完成区域", exact: true }).click();
  await expect(page.getByText(/已画 2 个元素；待放点 0/)).toBeVisible();
  await page.getByRole("button", { name: "清空画布", exact: true }).click();
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(page.getByText(/已画 2 个元素；待放点 0/)).toBeVisible();
  await page.getByRole("button", { name: "标注", exact: true }).click();
  await canvas.scrollIntoViewIfNeeded();
  const surface = await page.locator(".drawing-scroll").boundingBox();
  if (!surface) throw new Error("Drawing surface is missing");
  if (info.project.name === "mobile") await page.touchscreen.tap(surface.x + 50, surface.y + 50);
  else await page.mouse.click(surface.x + 50, surface.y + 50);
  await expect(page.getByText(/已画 3 个元素；待放点 0/)).toBeVisible();
  await page.getByRole("button", { name: "对照参考图", exact: true }).click();
  await expect(page.locator(".tariff-reference-scroll img")).toBeVisible();
  await expect(page.locator(".tariff-reference-scroll img")).toHaveJSProperty("complete", true);
  await page.getByRole("button", { name: "1. 独立画图", exact: true }).click();
  await expect.poll(async () => Math.round((await page.locator("#tariff-drawing").boundingBox())?.y ?? 0)).toBeGreaterThanOrEqual(95);
  await expect.poll(async () => Math.round((await page.locator("#tariff-drawing").boundingBox())?.y ?? 1000)).toBeLessThanOrEqual(160);
  await capture(page, info, "drawing");
  await fit(page);
  const exam = page.getByRole("textbox", { name: "你的考试答案", exact: true });
  await exam.fill("单位关税提高国内价，企业沿 S 增产，消费者沿 D 减少购买。我的图需要补充消费者剩余变化。");
  await page.getByRole("button", { name: "提交并对照答案", exact: true }).click();
  await expect(page.getByText(/答案已展开，尚未评分/)).toBeVisible();
  const criteria = page.getByRole("group", { name: "利益相关者与因果", exact: true });
  await criteria.getByRole("button", { name: "需修改", exact: true }).click();
  await expect(page.getByText(/写出“价格改变→行为改变→剩余变化”的链条/)).toBeVisible();
  await page.getByText(/写出“价格改变→行为改变→剩余变化”的链条/).scrollIntoViewIfNeeded();
  await capture(page, info, "zh-exam-feedback");
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your exam answer", exact: true })).toHaveValue(/消费者剩余/);
  await expect(page.getByText("Connect price, behaviour and surplus; distinguish transfers from efficiency losses.")).toBeVisible();
  await page.getByText("Connect price, behaviour and surplus; distinguish transfers from efficiency losses.").scrollIntoViewIfNeeded();
  await capture(page, info, "exam-feedback");
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your exam answer", exact: true })).toHaveValue(/消费者剩余/);
  await expect(page.getByText("Connect price, behaviour and surplus; distinguish transfers from efficiency losses.")).toBeAttached();
  await page.getByRole("button", { name: "Revise and answer again", exact: true }).click();
  await page.getByRole("textbox", { name: "Your exam answer", exact: true }).fill("Revised answer with the missing consumer surplus analysis.");
  await page.getByRole("button", { name: "Submit and compare answers", exact: true }).click();
  await expect(page.getByRole("group", { name: "Stakeholders and causation", exact: true }).getByRole("button", { name: "Needs revision", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "15-mark evaluation", exact: true }).click();
  await page.getByRole("textbox", { name: "Your exam answer", exact: true }).fill("Steel output is not the same indicator as employment. Consider downstream costs and retraining.");
  await page.getByRole("button", { name: "Submit and compare answers", exact: true }).click();
  await page.getByText("Weak answer and diagnosis", { exact: true }).click();
  await expect(page.getByText(/It conflates output with employment/)).toBeVisible();
  await page.getByRole("group", { name: "Evidence and scope", exact: true }).getByRole("button", { name: "Needs revision", exact: true }).click();
  await expect(page.getByText("Use evidence to support the argument within the report’s scope.")).toBeVisible();
  await page.getByRole("button", { name: "HL calculation and interpretation", exact: true }).click();
  await page.getByRole("textbox", { name: "Your exam answer", exact: true }).fill("Imports: 80 to 40; revenue 80; losses 20+20=40; welfare -40.");
  await page.getByRole("button", { name: "Submit and compare answers", exact: true }).click();
  await expect(page.locator("#tariff-exam").getByText(/−200\+80\+80=−40/)).toBeVisible();
  await fit(page);
});

test("cached workshop and drawing drafts work after an offline reload", async ({ page, context }, info) => {
  test.skip(info.project.name !== "desktop", "One fresh context checks cache installation and offline writes.");
  await page.goto(route);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.getByRole("textbox", { name: "你的考试答案", exact: true }).fill("离线前的关税答案草稿。");
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.getByRole("textbox", { name: "你的考试答案", exact: true })).toHaveValue("离线前的关税答案草稿。");
    const canvas = page.getByRole("application", { name: "关税作图画布" });
    await canvas.focus(); await canvas.press("Enter"); await canvas.press("ArrowRight"); await canvas.press("Enter");
    await page.getByRole("button", { name: "提交并对照答案", exact: true }).click();
    await page.reload();
    await expect(page.getByText(/已画 1 个元素/)).toBeAttached();
    await expect(page.getByText(/答案已展开，尚未评分/)).toBeAttached();
  } finally { await context.setOffline(false); }
});
