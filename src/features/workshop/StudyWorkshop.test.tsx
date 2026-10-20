import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import type { StudyWorkshop as WorkshopContent } from "../../types/content";
import { StudyWorkshop } from "./StudyWorkshop";

const point = knowledgePoints.find(p => p.meta.id === "u4-07-tariff");
const content = point?.workshop as WorkshopContent;
const props = { pointId: "u4-07-tariff", content, locale: "en" as const, showHl: true };
afterEach(() => { cleanup(); localStorage.clear(); });

describe("tariff workshop", () => {
  it("keeps drafts across language changes and reloads, and clears old review after editing", () => {
    const view = render(<StudyWorkshop {...props} />);
    const answer = screen.getByRole("textbox", { name: "Your exam answer" });
    fireEvent.change(answer, { target: { value: "A tariff raises price from Pw to Pw+t." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit and compare answers" }));
    expect(screen.getByText(/The answer is revealed, not marked/)).toBeTruthy();
    const model = screen.getByText("Model answer and reasoning").closest("details");
    expect(model?.open).toBe(true);
    const assumption = screen.getByRole("group", { name: "Concept and assumptions" });
    fireEvent.click(within(assumption).getByRole("button", { name: "Needs revision" }));
    expect(screen.getByText("Explain why Pw stays fixed and domestic price reaches Pw+t.")).toBeTruthy();
    view.rerender(<StudyWorkshop {...props} locale="zh-CN" />);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "你的考试答案" }).value).toContain("Pw+t");
    view.unmount();
    render(<StudyWorkshop {...props} />);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Your exam answer" }).value).toContain("Pw+t");
    expect(screen.getByText("Explain why Pw stays fixed and domestic price reaches Pw+t.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Revise and answer again" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your exam answer" }), { target: { value: "Revised explanation" } });
    expect(screen.queryByText("Explain why Pw stays fixed and domestic price reaches Pw+t.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Submit and compare answers" }));
    expect(screen.getAllByText(/Checked 0\//).length).toBeGreaterThan(0);
  });

  it("supports keyboard drawing, welfare areas, labels, undo and clearing without changing the route", () => {
    render(<StudyWorkshop {...props} />);
    const canvas = screen.getByRole("application", { name: "Tariff drawing canvas" });
    fireEvent.keyDown(canvas, { key: "Enter" });
    fireEvent.keyDown(canvas, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(screen.getByText(/1 elements; 0 pending/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Welfare area" }));
    fireEvent.keyDown(canvas, { key: "Enter" });
    fireEvent.keyDown(canvas, { key: "ArrowUp", shiftKey: true });
    fireEvent.keyDown(canvas, { key: "Enter" });
    fireEvent.keyDown(canvas, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(canvas, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Finish area" }));
    expect(screen.getByText(/2 elements; 0 pending/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Label" }));
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(screen.getByText(/3 elements; 0 pending/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear canvas" }));
    expect(screen.getByText(/0 elements; 0 pending/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByText(/3 elements; 0 pending/)).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem("atlas-workshop-v1:u4-07-tariff") as string);
    expect(saved.shapes).toHaveLength(3);
  });

  it("hides HL tasks for SL without losing an existing HL draft", () => {
    const view = render(<StudyWorkshop {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "HL calculation and interpretation" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your exam answer" }), { target: { value: "Revenue = 2 × (90 − 50) = 80." } });
    view.rerender(<StudyWorkshop {...props} showHl={false} />);
    expect(screen.queryByRole("button", { name: "HL calculation and interpretation" })).toBeNull();
    expect(screen.getByRole("button", { name: "10-mark explanation" }).getAttribute("aria-pressed")).toBe("true");
    view.rerender(<StudyWorkshop {...props} />);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Your exam answer" }).value).toContain("80");
  });

  it("ignores damaged drafts rather than breaking the article", () => {
    localStorage.setItem("atlas-workshop-v1:u4-07-tariff", JSON.stringify({ version: 1, shapes: [null] }));
    render(<StudyWorkshop {...props} />);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Your exam answer" }).value).toBe("");
    expect(screen.getByText(/0 elements; 0 pending/)).toBeTruthy();
  });
});
