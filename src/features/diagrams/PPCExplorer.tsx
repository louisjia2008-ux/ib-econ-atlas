import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowUpRight, RotateCcw, Table2 } from "lucide-react";
import staticPpcUrl from "../../../content/diagrams/ppc-core.svg";
import type { Locale } from "../../types/content";
import { classifyPPCPoint, clampPPCPoint, frontierOutput, frontierTable, movePPCPoint, type PPCPoint } from "./ppc-model";

const plot = { left: 70, right: 600, top: 28, bottom: 340, maximum: 150 };

const copy = {
  "zh-CN": {
    title: "互动 PPC 实验台",
    intro: "拖动橙色点、使用方向键或滑块，观察组合位于曲线内、曲线上还是曲线外。",
    goodX: "横轴产品 A",
    goodY: "纵轴产品 B",
    inside: "曲线内：资源未充分利用或生产低效",
    on: "曲线上：当前资源与技术下具有生产效率",
    outside: "曲线外：当前资源与技术下不可达",
    growth: "模拟资源 / 技术增长",
    reset: "重置",
    snap: "移到曲线上",
    static: "查看静态 SVG 与数据表",
    capacity: "生产能力指数",
    tableCaption: "当前 PPC 上的代表性最大产出组合",
  },
  en: {
    title: "Interactive PPC lab",
    intro: "Drag the orange point, use the arrow keys, or move the sliders to test whether a combination lies inside, on, or outside the frontier.",
    goodX: "Good A on the horizontal axis",
    goodY: "Good B on the vertical axis",
    inside: "Inside: resources are underused or production is inefficient",
    on: "On the curve: productively efficient with current resources and technology",
    outside: "Outside: unattainable with current resources and technology",
    growth: "Simulate resource / technology growth",
    reset: "Reset",
    snap: "Move onto frontier",
    static: "View static SVG and data table",
    capacity: "Productive-capacity index",
    tableCaption: "Representative maximum combinations on the current PPC",
  },
} as const;

function toSvg(point: PPCPoint): PPCPoint {
  return {
    x: plot.left + (point.x / plot.maximum) * (plot.right - plot.left),
    y: plot.bottom - (point.y / plot.maximum) * (plot.bottom - plot.top),
  };
}

function toModel(clientX: number, clientY: number, svg: SVGSVGElement): PPCPoint {
  const bounds = svg.getBoundingClientRect();
  const xSvg = ((clientX - bounds.left) / bounds.width) * 640;
  const ySvg = ((clientY - bounds.top) / bounds.height) * 390;
  return clampPPCPoint({
    x: ((xSvg - plot.left) / (plot.right - plot.left)) * plot.maximum,
    y: ((plot.bottom - ySvg) / (plot.bottom - plot.top)) * plot.maximum,
  });
}

export function PPCExplorer({ locale }: { locale: Locale }) {
  const labels = copy[locale];
  const titleId = useId();
  const descriptionId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [capacity, setCapacity] = useState(100);
  const [point, setPoint] = useState<PPCPoint>({ x: 60, y: 80 });
  const position = classifyPPCPoint(point, capacity);
  const positionText = labels[position];
  const curve = useMemo(() => {
    const points = Array.from({ length: 51 }, (_, index) => {
      const x = (capacity * index) / 50;
      return toSvg({ x, y: frontierOutput(x, capacity) });
    });
    return points.map((value, index) => `${index === 0 ? "M" : "L"}${value.x.toFixed(1)},${value.y.toFixed(1)}`).join(" ");
  }, [capacity]);
  const svgPoint = toSvg(point);

  const moveFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || event.buttons === 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPoint(toModel(event.clientX, event.clientY, svgRef.current));
  };
  const handleKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!event.key.startsWith("Arrow") && event.key !== "Home") return;
    event.preventDefault();
    setPoint(event.key === "Home" ? { x: 60, y: 80 } : (current) => movePPCPoint(current, event.key));
  };

  const table = frontierTable(capacity);
  return (
    <section className="ppc-explorer" aria-labelledby={titleId}>
      <div className="ppc-heading">
        <div><span>INTERACTIVE MODEL</span><h2 id={titleId}>{labels.title}</h2><p id={descriptionId}>{labels.intro}</p></div>
        <span className={`ppc-position ${position}`}>{positionText}</span>
      </div>
      <div className="ppc-stage">
        <svg ref={svgRef} viewBox="0 0 640 390" role="application" tabIndex={0} aria-labelledby={`${titleId} ${descriptionId}`} onPointerDown={moveFromPointer} onPointerMove={moveFromPointer} onKeyDown={handleKey}>
          <defs>
            <linearGradient id="ppc-area" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eaf2ff" /><stop offset="1" stopColor="#f8faff" /></linearGradient>
          </defs>
          {[0, 30, 60, 90, 120, 150].map((tick) => {
            const x = toSvg({ x: tick, y: 0 }).x;
            const y = toSvg({ x: 0, y: tick }).y;
            return <g key={tick}><line x1={x} y1={plot.top} x2={x} y2={plot.bottom} className="grid-line" /><line x1={plot.left} y1={y} x2={plot.right} y2={y} className="grid-line" /><text x={x} y={plot.bottom + 20} textAnchor="middle">{tick}</text><text x={plot.left - 14} y={y + 4} textAnchor="end">{tick}</text></g>;
          })}
          <path d={`${curve} L${plot.left},${plot.bottom} Z`} fill="url(#ppc-area)" opacity="0.7" />
          <line x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} className="axis-line" />
          <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} className="axis-line" />
          <path d={curve} className="frontier-line" />
          <text x={plot.right - 16} y={plot.bottom - 14} className="curve-label">PPC · {capacity}</text>
          <text x={(plot.left + plot.right) / 2} y="382" textAnchor="middle" className="axis-label">{labels.goodX}</text>
          <text x="17" y={(plot.top + plot.bottom) / 2} textAnchor="middle" transform={`rotate(-90 17 ${(plot.top + plot.bottom) / 2})`} className="axis-label">{labels.goodY}</text>
          <circle cx={svgPoint.x} cy={svgPoint.y} r="16" className={`choice-halo ${position}`} />
          <circle cx={svgPoint.x} cy={svgPoint.y} r="8" className="choice-point" />
        </svg>
        <div className="ppc-controls">
          <label><span>{labels.goodX}</span><output>{Math.round(point.x)}</output><input type="range" min="0" max="150" value={point.x} onChange={(event) => setPoint((current) => ({ ...current, x: Number(event.target.value) }))} /></label>
          <label><span>{labels.goodY}</span><output>{Math.round(point.y)}</output><input type="range" min="0" max="150" value={point.y} onChange={(event) => setPoint((current) => ({ ...current, y: Number(event.target.value) }))} /></label>
          <div className="capacity-readout"><span>{labels.capacity}</span><strong>{capacity}</strong></div>
          <button type="button" onClick={() => setPoint((current) => ({ ...current, y: frontierOutput(Math.min(current.x, capacity), capacity), x: Math.min(current.x, capacity) }))}>{labels.snap}</button>
          <button type="button" onClick={() => setCapacity((value) => Math.min(140, value + 20))}><ArrowUpRight size={16} /> {labels.growth}</button>
          <button type="button" onClick={() => { setCapacity(100); setPoint({ x: 60, y: 80 }); }}><RotateCcw size={16} /> {labels.reset}</button>
        </div>
      </div>
      <details className="ppc-alternative">
        <summary><Table2 size={16} /> {labels.static}</summary>
        <div className="ppc-alternative-grid">
          <img src={staticPpcUrl} alt={locale === "zh-CN" ? "PPC 静态图：曲线内、曲线上与曲线外的点" : "Static PPC showing points inside, on, and outside the frontier"} />
          <table>
            <caption>{labels.tableCaption}</caption>
            <thead><tr><th>{labels.goodX}</th><th>{labels.goodY}</th></tr></thead>
            <tbody>{table.map((row) => <tr key={row.x}><td>{Math.round(row.x)}</td><td>{Math.round(row.y)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
