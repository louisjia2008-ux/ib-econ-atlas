import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { getPreferences, resetDatabaseForTests, savePreferences } from "./features/progress/db";
import { saveScope } from "./features/navigation/scope";

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({ needRefresh: [false, vi.fn()], offlineReady: [false, vi.fn()], updateServiceWorker: vi.fn() }),
}));
vi.mock("./generated/content", async () => {
  const { makeKnowledgePoint } = await import("./test/knowledgePoint");
  return { knowledgePoints: [makeKnowledgePoint("core", "core"), makeKnowledgePoint("hl", "hl"), makeKnowledgePoint("extension", "extension")] };
});

function renderApp(route = "/review") {
  return render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
}

beforeEach(async () => {
  await resetDatabaseForTests();
  sessionStorage.clear();
});
afterEach(cleanup);

it.each(["en", "zh-CN"] as const)("sets the document language from a restored %s preference", async (locale) => {
  document.documentElement.lang = locale === "en" ? "zh-CN" : "en";
  await savePreferences({ locale, levelFilter: "sl", aiEnabled: false });
  renderApp();
  await screen.findByRole("heading", { name: locale === "en" ? "Start a review" : "开始一次复习" });
  await waitFor(() => expect(document.documentElement.lang).toBe(locale));
  expect(screen.getByRole("button", { name: "SL" }).className).toBe("selected");
});

it("updates document language when toggled and restores it after a fresh mount", async () => {
  await savePreferences({ locale: "en", levelFilter: "all", aiEnabled: false });
  const first = renderApp();
  fireEvent.click(await screen.findByRole("button", { name: "切换到中文" }));
  await waitFor(() => expect(document.documentElement.lang).toBe("zh-CN"));
  await waitFor(async () => expect((await getPreferences()).locale).toBe("zh-CN"));
  first.unmount();
  document.documentElement.lang = "en";
  renderApp();
  await waitFor(() => expect(document.documentElement.lang).toBe("zh-CN"));
  expect(screen.getByRole("heading", { name: "开始一次复习" })).toBeTruthy();
});

it("passes the global level to progress and resets a running review when the level changes", async () => {
  await savePreferences({ locale: "en", levelFilter: "all", aiEnabled: false });
  saveScope(new Set(["extension"]));
  renderApp();
  fireEvent.click(await screen.findByRole("button", { name: "Flashcards" }));
  fireEvent.click(screen.getByRole("button", { name: "Build review session" }));
  await screen.findByRole("heading", { name: "Question for extension" });
  fireEvent.click(screen.getByRole("button", { name: "SL" }));
  expect(screen.queryByRole("heading", { name: "Question for extension" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Start a review" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Build review session" }));
  expect((await screen.findByRole("alert")).textContent).toContain("No items match");
  fireEvent.click(screen.getByRole("button", { name: "Progress" }));
  expect(screen.getByRole("heading", { name: "Learning progress" })).toBeTruthy();
  expect([...document.querySelectorAll(".stat-grid strong")].map((element) => element.textContent)).toEqual(["0", "0", "0", "0"]);
  fireEvent.click(screen.getByRole("button", { name: "All + extension" }));
  expect([...document.querySelectorAll(".stat-grid strong")].map((element) => element.textContent)).toEqual(["1", "0", "0", "0"]);
});
