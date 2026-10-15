import type { Locale } from "../../types/content";

const diagrams = import.meta.glob<string>("/content/diagrams/*.svg", { eager: true, query: "?url", import: "default" });
const descriptions: Record<string, [string, string, string, string]> = {
  "macro-ad-as": ["总需求与短期总供给均衡", "AD and short-run AS equilibrium", "横轴是实际 GDP，纵轴是物价水平。AD 与 SRAS 交于 Ye、Pe；没有画 LRAS，不能据此判断产出缺口。", "The axes show real GDP and the price level. AD and SRAS intersect at Ye and Pe. LRAS is not shown, so the output gap cannot be inferred."],
  "macro-ad-expansion": ["总需求扩张", "Aggregate demand expansion", "SRAS 不变时 AD0 右移至 AD1，Y1>Y0、P1>P0。图为向上倾斜 SRAS 的短期模型；产出和物价的相对反应取决于闲置产能。", "With SRAS unchanged, AD0 shifts right to AD1: Y1>Y0 and P1>P0. This short-run model uses upward-sloping SRAS; relative output and price responses depend on spare capacity."],
  "macro-supply-shock": ["不利供给冲击", "Adverse supply shock", "AD 不变，SRAS0 左移至 SRAS1：Y1<Y0、P1>P0。一次物价水平上升不等于通胀率永久提高；图不表示长期均衡。", "With AD unchanged, SRAS0 shifts left to SRAS1: Y1<Y0 and P1>P0. A one-off price-level increase is not permanently higher inflation; this is not a long-run equilibrium diagram."],
  "macro-lras": ["潜在产出增长", "Potential output growth", "新古典模型中 LRAS0 右移至 LRAS1，Yf1>Yf0。未画 AD 或 SRAS，因此不能仅凭此图推断实际产出、就业或物价变化。", "In the neoclassical model, LRAS0 shifts right to LRAS1 and Yf1>Yf0. AD and SRAS are absent, so actual output, employment and price changes cannot be inferred from this alone."],
  "macro-keynesian": ["凯恩斯主义总供给", "Keynesian aggregate supply", "低产出区有大量闲置资源，AS 较平；接近 Yf 时瓶颈增强，曲线变陡并在产能处垂直。它与新古典 LRAS 属于不同假设模型。", "AS is flatter at low output with idle resources, steepens as bottlenecks develop and becomes vertical at capacity Yf. This uses different assumptions from neoclassical LRAS."],
  "macro-cycle": ["经济周期与趋势", "Business cycle and trend", "实际 GDP 围绕上升趋势波动，横轴是时间。增速下降不必然是产出下降；趋势为示意，不是对潜在产出的精确估计。", "Real GDP fluctuates around a rising trend over time. Slower growth is not necessarily falling output; the illustrative trend is not a precise estimate of potential output."],
  "macro-phillips": ["菲利普斯曲线", "Phillips curves", "横轴为失业率，纵轴为通胀率。给定预期下 SRPC 向下倾斜，LRPC 在自然失业率 Un 处垂直；预期和供给冲击可移动 SRPC。", "The axes show unemployment and inflation rates. SRPC slopes down for given expectations; LRPC is vertical at natural unemployment Un. Expectations and supply shocks can shift SRPC."],
  "macro-lorenz": ["洛伦兹曲线与平等线", "Lorenz curve and equality line", "人口按收入从低到高排列；两轴均为累计百分比。曲线越偏离平等线，分配越不均；Gini 为两线间面积除以平等线下三角形面积。图无数值刻度，不能读取具体 Gini。", "Population is ranked from lowest to highest income; both axes are cumulative percentages. A greater departure from equality indicates more inequality. Gini is the area between the lines divided by the triangle under equality. No numerical Gini can be read from this unscaled schematic."],
  "demand-supply": ["竞争市场均衡", "Competitive market equilibrium", "D 表示边际利益，S 表示边际成本；交点确定 Pe 与 Qe。曲线移动改变均衡，价格变化沿曲线移动。", "D represents marginal benefit and S marginal cost. Their intersection gives Pe and Qe. Shifts change equilibrium; price changes produce movements along curves."],
  "tax-wedge": ["单位税楔子", "Specific tax wedge", "Qt 低于 Q0；买方支付 Pb，卖方净收 Ps。Pb−Ps 为单位税，税收为 (Pb−Ps)×Qt。", "Qt is below Q0. Buyers pay Pb and sellers receive Ps. Pb−Ps is the tax per unit; revenue is (Pb−Ps)×Qt."],
  "subsidy-wedge": ["单位补贴楔子", "Per-unit subsidy wedge", "Qsub 高于 Q0；卖方收入 Ps 高于买方价格 Pb。财政成本为 (Ps−Pb)×Qsub。", "Qsub exceeds Q0. Seller receipts Ps exceed buyer payment Pb. Fiscal cost is (Ps−Pb)×Qsub."],
  "price-ceiling": ["有约束力的最高限价", "Binding price ceiling", "Pc 低于均衡价，Qs<Qd。短缺=Qd−Qs；合法交易受较小的供给量限制。", "Pc is below equilibrium, with Qs<Qd. Shortage is Qd−Qs; legal trades are constrained by the lower quantity supplied."],
  "price-floor": ["有约束力的最低限价", "Binding price floor", "Pf 高于均衡价，Qs>Qd。过剩=Qs−Qd；没有政府购买时交易受需求量限制。", "Pf is above equilibrium, with Qs>Qd. Surplus is Qs−Qd; without government purchases, trades are limited by demand."],
  "negative-production": ["负生产外部性模型", "Negative production externality model", "MSC>MPC，MSB=MPB。私人数量 Qm 大于社会最优 Q*；两者之间 MSC>MSB。", "MSC>MPC and MSB=MPB. Private output Qm exceeds optimal Q*; between them MSC exceeds MSB."],
  "positive-production": ["正生产外部性模型", "Positive production externality model", "MSC<MPC，MSB=MPB。Qm<Q*，未生产单位的社会收益超过社会成本。", "MSC<MPC and MSB=MPB. Qm<Q*; unproduced units have social benefit above social cost."],
  "negative-consumption": ["负消费外部性模型", "Negative consumption externality model", "MSB<MPB，MSC=MPC。Qm>Q*，私人选择忽略第三方消费成本。", "MSB<MPB and MSC=MPC. Qm>Q* because private choices omit consumption costs to others."],
  "positive-consumption": ["正消费外部性模型", "Positive consumption externality model", "MSB>MPB，MSC=MPC。Qm<Q*，私人选择遗漏第三方消费收益。", "MSB>MPB and MSC=MPC. Qm<Q* because private choices omit consumption benefits to others."],
  "monopoly": ["垄断企业的数量与价格", "Monopoly output and price", "在 MR=MC 确定 Qm，再从 D/AR 读取 Pm。图未画 ATC，因此不能据此计算利润。", "Choose Qm at MR=MC and read Pm from D/AR. ATC is not shown, so this diagram does not establish profit."],
  "perfect-competition": ["完全竞争企业的边际决策", "Competitive firm's marginal decision", "企业接受 P=AR=MR，在上升 MC 与 P 相交处选 Qf。ATC/AVC 未画，须另行判断利润与停产。", "The firm takes P=AR=MR and chooses Qf where rising MC meets P. ATC/AVC are not shown; profit and shutdown require separate comparisons."],
  "goods-matrix": ["物品分类表", "Classification of goods", "私人品：竞争且可排他；共同资源：竞争且难排他；俱乐部物品：非竞争但可排他；纯公共物品：非竞争且非排他。拥堵可改变分类。", "Private goods are rival/excludable; common resources rival/non-excludable; club goods non-rival/excludable; pure public goods non-rival/non-excludable. Congestion can change classification."],
};

export function MicroDiagram({ id, locale }: { id: string; locale: Locale }) {
  const description = descriptions[id];
  const src = diagrams[`/content/diagrams/${id}.svg`];
  if (!description || !src) return null;
  const index = locale === "zh-CN" ? 0 : 1;
  return <figure className="micro-diagram">
    <figcaption>{description[index]}</figcaption>
    <img src={src} alt={description[index + 2]} loading="lazy" />
    <table><caption>{locale === "zh-CN" ? "图示的文字替代" : "Text alternative to the diagram"}</caption>
      <tbody><tr><th scope="row">{locale === "zh-CN" ? "关系与含义" : "Relationships and meaning"}</th><td>{description[index + 2]}</td></tr></tbody>
    </table>
    <p>{locale === "zh-CN" ? "原创示意图，不按比例。应用时保持各模型的假设与曲线含义一致。" : "Original schematic, not to scale. Keep assumptions and curve meanings consistent when applying the model."}</p>
  </figure>;
}
