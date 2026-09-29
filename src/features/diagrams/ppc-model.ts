export type PPCPosition = "inside" | "on" | "outside";

export interface PPCPoint {
  x: number;
  y: number;
}

export function frontierOutput(x: number, capacity = 100): number {
  if (x < 0 || x > capacity || capacity <= 0) return 0;
  return capacity * Math.sqrt(Math.max(0, 1 - (x / capacity) ** 2));
}

export function classifyPPCPoint(point: PPCPoint, capacity = 100, tolerance = 2): PPCPosition {
  if (point.x < 0 || point.y < 0 || point.x > capacity) return "outside";
  const maximumY = frontierOutput(point.x, capacity);
  if (point.y > maximumY + tolerance) return "outside";
  if (Math.abs(point.y - maximumY) <= tolerance) return "on";
  return "inside";
}

export function clampPPCPoint(point: PPCPoint, displayMaximum = 150): PPCPoint {
  return {
    x: Math.min(displayMaximum, Math.max(0, point.x)),
    y: Math.min(displayMaximum, Math.max(0, point.y)),
  };
}

export function movePPCPoint(point: PPCPoint, key: string, step = 2): PPCPoint {
  const delta = key === "ArrowLeft" ? { x: -step, y: 0 }
    : key === "ArrowRight" ? { x: step, y: 0 }
      : key === "ArrowUp" ? { x: 0, y: step }
        : key === "ArrowDown" ? { x: 0, y: -step }
          : { x: 0, y: 0 };
  return clampPPCPoint({ x: point.x + delta.x, y: point.y + delta.y });
}

export function frontierTable(capacity = 100): PPCPoint[] {
  return [0, 0.25, 0.5, 0.75, 1].map((share) => {
    const x = capacity * share;
    return { x, y: frontierOutput(x, capacity) };
  });
}
