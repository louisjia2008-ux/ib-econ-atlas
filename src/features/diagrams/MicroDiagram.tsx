import type { Locale } from "../../types/content";

const diagrams = import.meta.glob<string>("/content/diagrams/*.svg", { eager: true, query: "?url", import: "default" });
const descriptions: Record<string, [string, string, string, string]> = {
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
