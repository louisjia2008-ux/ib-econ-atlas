import fs from "node:fs";
import { expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";

it("reconciles the published tariff example from its stated premises", () => {
  const text = knowledgePoints.find(point => point.meta.id === "u4-07-tariff")?.content.en.hlExtension ?? "";
  const read = (pattern: RegExp) => { const match = text.match(pattern); expect(match).not.toBeNull(); return Number(match?.[1]); };
  const t = read(/\bt=(\d+)/);
  const qs0 = read(/Qs0=(\d+)/), qs1 = read(/Qs1=(\d+)/);
  const qd0 = read(/Qd0=(\d+)/), qd1 = read(/Qd1=(\d+)/);
  const before = qd0 - qs0, after = qd1 - qs1;
  const revenue = t * after;
  const productionLoss = .5 * t * (qs1 - qs0), consumptionLoss = .5 * t * (qd0 - qd1);
  const producerGain = .5 * (qs0 + qs1) * t;
  const consumerLoss = .5 * (qd0 + qd1) * t;
  const net = producerGain + revenue - consumerLoss;
  expect(net).toBe(-productionLoss - consumptionLoss);
  expect(text).toContain(`Imports fall from ${before} to ${after}`);
  expect(text).toContain(`revenue c=${t}×${after}=${revenue}`);
  expect(text).toContain(`Production loss b=½×${t}×(${qs1}−${qs0})=${productionLoss}`);
  expect(text).toContain(`consumption loss d=½×${t}×(${qd0}−${qd1})=${consumptionLoss}`);
  expect(text).toContain(`net welfare change −${-net}`);
  expect(text).toContain(`surplus rises by a=½×(${qs0}+${qs1})×${t}=${producerGain}`);
  expect(text).toContain(`surplus falls by ½×(${qd0}+${qd1})×${t}=${consumerLoss}`);
});

it("places quantity projections on the correct supply and demand intersections", () => {
  const svg = fs.readFileSync("content/diagrams/global-tariff.svg", "utf8");
  const line = (colour: string) => {
    const found = svg.match(new RegExp(`d="M(\\d+) (\\d+)L(\\d+) (\\d+)" stroke="${colour}"`));
    expect(found).not.toBeNull();
    const [, x0, y0, x1, y1] = (found ?? []).map(Number);
    return (x: number) => Number(y0) + (x - Number(x0)) * (Number(y1) - Number(y0)) / (Number(x1) - Number(x0));
  };
  const supply = line("#148064"), demand = line("#2454d8");
  const points = [...svg.matchAll(/d="M(\d+) (\d+)V410"/g)].map(match => ({ x: Number(match[1]), y: Number(match[2]) }));
  expect(points).toHaveLength(4);
  points.forEach((point, index) => expect((index < 2 ? supply : demand)(point.x)).toBe(point.y));
});
