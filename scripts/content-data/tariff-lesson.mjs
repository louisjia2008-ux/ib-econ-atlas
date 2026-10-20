// Original bilingual teaching material. Exam tasks are Atlas practice, not IB papers.
const pair = (zh, en) => ({ 'zh-CN': zh, en });
const source = 'https://www.usitc.gov/press_room/news_release/2023/er0315_63679.htm';
const caseText = pair(
 '美国 USITC 2023 年报告估计：2018–2021 年，232 条款关税使受影响钢材进口减少 24%，美国钢材价格提高 2.4%，产量提高 1.9%；使用钢铝的下游行业产量平均减少 0.6%。这是历史模型估计，不能从产量直接推断就业，也不能据此计算美国整体净福利；美国也不是本页小国模型的直接验证。',
 'A 2023 USITC report estimated that, during 2018–2021, section 232 tariffs reduced affected steel imports by 24%, raised US steel prices by 2.4% and raised output by 1.9%. Downstream output fell by 0.6% on average. These historical estimates do not establish employment or economy-wide net welfare, and the US is not a direct test of the small-country model.'
);
const assumption = pair(
 '假定本国是世界价格接受者；商品同质、市场竞争，世界供给在 Pw 处完全有弹性，无运输成本、外部性或报复；关税后仍有正进口。这里只看本国该市场的静态总剩余。',
 'Assume a price-taking small economy, homogeneous goods and competitive markets, perfectly elastic world supply at Pw, no transport costs, externalities or retaliation, and positive imports after the tariff. Welfare here means static domestic surplus in this market.'
);
const zhBody = `### 先界定模型与税种

单位关税是对每单位进口品征收固定金额 t；从价关税则按进口价值的一定比例征税。本页图示使用单位关税。小国不能压低世界出口价格；在仍有进口且完全传导的假设下，进口的含税成本是 Pw+t，本国同质商品的市场价也升至这一水平。这里的“小国”指不能影响世界价格，不是国土面积小。

### 按价格变化推导数量，而不是移动国内供需曲线

自由贸易时，消费者按世界价 Pw 购买，国内企业在这一价格供给 Qs0，消费者需求为 Qd0，差额 Qd0−Qs0 从国外进口。征税后国内价提高到 Pw+t，企业沿原有 S 曲线增加供给到 Qs1，消费者沿原有 D 曲线减少购买到 Qd1。国内偏好和生产条件没有改变，因此不应把这一步画成国内 D 或 S 移动。进口从 Qd0−Qs0 减为 Qd1−Qs1。

### 谁得到什么，谁承担什么？

消费者为较少的购买量支付较高价格，消费者剩余减少 a+b+c+d。国内生产者因价格提高、产量增加而获得剩余 a；政府只对税后仍然进口的商品征税，获得矩形 c。a 与 c 是本国内部的转移；把消费者损失与生产者、政府收益相加后，剩下 b+d 的净损失。

生产扭曲 b：一部分本可按 Pw 进口的商品，现在由边际成本高于 Pw 的国内企业生产，额外消耗真实资源。消费扭曲 d：一部分消费者对商品的支付意愿高于 Pw，却低于含税价，原本互利的消费不再发生。两个三角形因此不是交给政府的税款。

### 从图示走向有条件的评价

受保护行业可能扩大生产，但使用进口投入的下游企业会承受更高成本，出口行业也可能受报复影响。短期保住的岗位、长期竞争力、政府税收和社会净福利是不同的判断对象。不能从生产者获益直接推出“整个国家获益”，也不能把本页的小国无外部性结论无条件套用到所有现实政策。

如存在学习外部性或供应安全目标，应先说明具体市场失灵或政策目标，再比较有时限的保护、培训、生产支持和社会保障。大国可能影响世界价格，但贸易条件收益、报复和执行问题需要单独论证。最后应给出取决于行业、时限和替代措施的判断。`;
const enBody = `### Define the model and the tax

A specific tariff charges a fixed amount t per unit imported; an ad valorem tariff charges a percentage of import value. This diagram uses a specific tariff. A small economy cannot reduce the world export price. With continued imports and full pass-through, the landed cost and competitive domestic price become Pw+t. “Small” concerns price-setting power, not geographic size.

### Follow price changes along domestic curves

Under free trade, domestic producers supply Qs0 at Pw while consumers demand Qd0; imports fill Qd0−Qs0. After the tariff, the higher price encourages production along the unchanged S curve to Qs1 and reduces consumption along the unchanged D curve to Qd1. Preferences and domestic production conditions have not changed, so this is not a shift of domestic D or S. Imports contract to Qd1−Qs1.

### Trace stakeholders and surplus

Consumers pay more and buy less, losing surplus a+b+c+d. Domestic producers gain a as price and output rise. Government taxes only the imports that remain, receiving rectangle c. Areas a and c are domestic transfers. Adding consumer, producer and government changes leaves a net loss b+d.

Production distortion b arises when domestic units with marginal cost above Pw replace cheaper imports, using extra real resources. Consumption distortion d arises when willingness to pay exceeds Pw but is below the tariff-inclusive price, preventing otherwise beneficial consumption. Neither triangle is money collected by government.

### Turn explanation into conditional evaluation

Protected producers may expand, but downstream firms using the product face higher costs and exporters may face retaliation. Protected jobs, long-run competitiveness, revenue and national welfare are different objectives. Producer gains alone cannot establish national gains; the model's conditional conclusion cannot simply be imposed on every real policy.

If learning spillovers or supply security matter, identify the externality or objective and compare time-limited protection with training, targeted support and social insurance. A large economy may influence world prices, but terms-of-trade gains, retaliation and enforcement need separate analysis. Reach a judgement that depends on the industry, duration and available alternatives.`;
const hl = pair(
 '原创线性情境：Pw=10，t=2；自由贸易 Qs0=30、Qd0=110，税后 Qs1=50、Qd1=90。进口由 80 降为 40；政府税收 c=2×40=80。生产扭曲 b=½×2×(50−30)=20；消费扭曲 d=½×2×(110−90)=20；净福利变化 −40。生产者剩余增量 a=½×(30+50)×2=80；消费者剩余减少 ½×(110+90)×2=200；−200+80+80=−40。数量以单位、价格以货币/单位计，剩余以货币计。三角形与梯形算法依赖线性曲线；税收和转移不能重复相加。',
 'Original linear example: Pw=10 and t=2. Free-trade Qs0=30 and Qd0=110; post-tariff Qs1=50 and Qd1=90. Imports fall from 80 to 40; revenue c=2×40=80. Production loss b=½×2×(50−30)=20 and consumption loss d=½×2×(110−90)=20, giving net welfare change −40. Producer surplus rises by a=½×(30+50)×2=80. Consumer surplus falls by ½×(110+90)×2=200; −200+80+80=−40. Quantities are units, prices currency per unit and surplus currency. Triangle and trapezium calculations assume linear curves; avoid double-counting transfers.'
);
const criterion = (id, title, guidance, feedback) => ({ id, title: pair(...title), guidance: pair(...guidance), feedback: pair(...feedback) });
const diagramCriteria = [
 criterion('axes', ['坐标轴与曲线','Axes and curves'], ['纵轴是价格，横轴是本国产量；D 向下、S 向上，并准确标注。','Price is vertical and domestic quantity horizontal; label downward D and upward S.'], ['检查是否把微观价格写成物价水平；国内供需曲线在征税前后保持不变。','Check for confusion with the macro price level; domestic D and S remain unchanged.']),
 criterion('prices', ['两条价格线','Two price lines'], ['Pw 与 Pw+t 水平，Pw+t 高于 Pw，且低于自给均衡价，税后仍有进口。','Both prices are horizontal, Pw+t above Pw and below autarky, retaining imports.'], ['若税后价超过自给价，就不能继续使用本例“仍有进口”的数量与税收。','A price above autarky invalidates this continued-import example.']),
 criterion('quantities', ['四个数量与进口差额','Four quantities and import gaps'], ['从曲线交点投影出 Qs0<Qs1<Qd1<Qd0，分别写出税前、税后进口。','Project intersections onto Qs0<Qs1<Qd1<Qd0 and identify both import gaps.'], ['把税后进口写成 Qd1−Qs1；不要用国内总需求代替进口。','Use Qd1−Qs1 for post-tariff imports, not total domestic demand.']),
 criterion('welfare', ['福利区域及解释','Welfare areas and interpretation'], ['标出政府税收 c、生产扭曲 b 与消费扭曲 d，并解释它们代表什么。','Identify revenue c, production loss b and consumption loss d, and explain each.'], ['c 是税后进口宽度乘税高的矩形；b+d 是净损失，不是税收。','Rectangle c uses post-tariff imports; b+d is lost welfare rather than revenue.'])
];
const explainCriteria = [
 criterion('model',['概念与条件','Concept and assumptions'],['定义单位关税，明确小国、仍有进口等条件。','Define a specific tariff and state price-taking and continued-import assumptions.'],['先解释为什么世界价不变、国内价升至 Pw+t，不能只背结论。','Explain why Pw stays fixed and domestic price reaches Pw+t.']),
 criterion('diagram',['图文对应','Diagram integration'],['用自己的图解释两个价格、四个数量和缩小的进口差额。','Use your diagram to explain prices, quantities and the smaller import gap.'],['在文字中引用图上标记，说明沿 D/S 移动，避免图文互相矛盾。','Refer to labels and movements along D/S, keeping diagram and prose consistent.']),
 criterion('stakeholders',['利益相关者与因果','Stakeholders and causation'],['解释消费者损失、生产者收益、政府税收和净福利变化。','Explain consumer loss, producer gain, revenue and net welfare.'],['写出“价格改变→行为改变→剩余变化”的链条；收入转移与效率损失要区分。','Connect price, behaviour and surplus; distinguish transfers from efficiency losses.'])
];
const evaluateCriteria = [
 criterion('application',['现实证据及范围','Evidence and scope'],['准确使用美国钢材案例，交代时期和来源，避免用产量数据直接证明就业增长。','Apply the dated US steel evidence without treating output as measured employment.'],['案例必须支持论点；报告没有估计整体净福利或长期安全收益。','Use evidence to support the argument within the report’s scope.']),
 criterion('balance',['分析相互冲突的影响','Analyse competing effects'],['比较受保护企业、消费者、下游企业和可能受报复的出口商。','Compare protected firms, consumers, downstream users and potentially affected exporters.'],['不能只列“优缺点”；解释成本如何传导，以及不同群体为何结果不同。','Explain transmission and distribution rather than listing advantages and disadvantages.']),
 criterion('conditions',['条件与替代方案','Conditions and alternatives'],['讨论弹性、时间、外部性或安全目标，并比较培训等替代措施。','Discuss elasticities, time or security/externality objectives, and compare alternatives such as training.'],['把“取决于”展开：什么条件会改变你的结论，替代方案如何针对问题？','Explain which conditions change the judgement and how an alternative targets the problem.']),
 criterion('judgement',['有依据的结论','Supported judgement'],['明确什么情况下保护就业的收益可能值得成本，并承认数据限制。','Judge when employment protection could justify its costs, acknowledging evidence limits.'],['结论应权衡目标与代价；避免“关税永远好／永远坏”的无条件判断。','Weigh the objective against costs and avoid unconditional claims.'])
];
export const tariffWorkshop = {
 title: pair('关税学习工坊','Tariff learning workshop'),
 introduction: pair('先画图，再练解释与评价。所有题目和参考答案均为 Atlas 原创；分值仅说明练习规模，自评清单不是 IB 官方评分，也没有自动语义阅卷。','Draw first, then practise explanation and evaluation. These are original Atlas tasks and model answers. Marks indicate task size; the checklist is not official IB marking or automated semantic assessment.'),
 assumptions: assumption,
 diagram: { prompt: pair('不看参考图，画出小国单位关税：标出 D、S、Pw、Pw+t、四个数量、税收及两个净损失区域。可在画布或纸上完成。','Without the reference, draw a small-country specific tariff: label D, S, prices, four quantities, revenue and the two deadweight losses. Use the canvas or paper.'), criteria: diagramCriteria },
 tasks: [
  { id: 'explain', marks: 10, minutes: 18, level: 'core', title: pair('10 分解释题','10-mark explanation'), prompt: pair('借助图示，解释小国对进口商品征收单位关税如何影响消费者、国内生产者及政府。说明你的假设。','Using a diagram, explain how a specific import tariff affects consumers, domestic producers and government in a small economy. State your assumptions.'), criteria: explainCriteria,
   modelAnswer: pair('单位关税是对每单位进口商品征收固定金额的税。假设本国是价格接受者、商品同质、市场竞争，且征税后仍有进口，世界价 Pw 不变，国内价由 Pw 升到 Pw+t。\n\n在图中画出向下 D、向上 S 和两条水平价格线。国内企业因价格提高沿 S 将供给从 Qs0 增至 Qs1；消费者沿 D 把需求从 Qd0 减至 Qd1。因此进口从 Qd0−Qs0 缩小到 Qd1−Qs1。这是国内曲线上的移动，不是偏好或技术改变导致的曲线移动。\n\n消费者支付更高价格且消费减少，剩余减少 a+b+c+d。生产者因价格、产量上升获得 a；政府只对税后进口征税，取得 c=t×(Qd1−Qs1)。把三者变化相加，a 与 c 是国内转移，留下 b+d 的净损失。b 表示用较高成本本国产出替代较低成本进口，d 表示原本收益高于 Pw 的消费不再发生。\n\n此结论限于无外部性等假设下的该市场静态国内福利；若要判断供应安全或长期就业，还需进一步证据。',
   'A specific tariff is a fixed tax per imported unit. Assume a price-taking economy, homogeneous goods, competitive markets and continued imports. Pw remains fixed, while domestic price rises to Pw+t.\n\nDraw downward D, upward S and the two horizontal price lines. The higher price raises domestic supply from Qs0 to Qs1 along S and reduces consumption from Qd0 to Qd1 along D. Imports therefore fall from Qd0−Qs0 to Qd1−Qs1. These are movements along unchanged domestic curves.\n\nConsumers pay more and purchase less, losing surplus a+b+c+d. Producers gain a through the higher price and output. Government collects c=t×(Qd1−Qs1) on the imports that remain. Adding these changes cancels domestic transfers a and c, leaving losses b+d. Area b is the extra resource cost of replacing imports with higher-cost domestic output; d is the lost benefit of consumption valued above Pw but below the new price.\n\nThis is a static domestic-welfare conclusion under the stated assumptions. Supply-security benefits or long-run employment effects require additional evidence.'),
   weakAnswer: pair('关税使进口减少，政府有税收，所以所有人都会受益。','Tariffs reduce imports and raise revenue, so everyone benefits.'), diagnosis: pair('遗漏价格如何影响数量，没有图文对应，把政府转移收入误当成所有人的净收益；补上消费者损失以及 b+d 的含义。','It omits the price-to-quantity mechanism and diagram integration, and mistakes revenue for a gain to everyone. Explain consumer losses and b+d.') },
  { id: 'evaluate', marks: 15, minutes: 27, level: 'core', title: pair('15 分评价题','15-mark evaluation'), prompt: pair('运用一个真实世界案例，评价关税在保护国内就业方面的有效性。','Using a real-world example, evaluate the effectiveness of tariffs in protecting domestic employment.'), criteria: evaluateCriteria,
   modelAnswer: pair('关税提高进口的国内成本，使部分消费者转向本国产品，因此可支持受保护行业的产量与劳动需求。小国模型中，Pw+t 下 Qs1 高于 Qs0，这说明保护可能发挥作用的机制，但图示本身没有测量就业。\n\n美国 USITC 2023 年报告对 2018–2021 年的估计显示，232 条款关税使受影响钢材进口下降 24%、美国钢材价格上升 2.4%、产量上升 1.9%。这些证据支持“进口受抑制、本国产出增加”的分析。但产量增长可能来自更多工时、自动化或闲置设备利用，不能把 1.9% 直接写成就业增长率。美国具有影响世界市场的能力，也不能被视作小国模型的严格实例。\n\n更高钢材价格会提高使用钢材的企业成本，削弱其竞争力，可能抵消部分受保护岗位的收益。报告估计使用钢铝的下游行业产量平均下降 0.6%，提醒我们把保护行业和下游行业一起评价。消费者也承担较高价格；若贸易伙伴报复，其他出口行业可能受损。这些效果需要独立分析，不能把行业产量变化或税收直接称为全国净福利变化。\n\n短期内，劳动力难以转移、地区高度依赖钢铁业时，暂时保护可能减轻调整冲击；但长期保护若削弱竞争、维持低效企业，成本可能持续增加。若目标是学习外部性或战略供应，应提供具体证据、明确期限与退出条件，并比较培训、工资保险或针对性的产业支持。培训可能更直接针对技能错配，但见效较慢，也需要资金。\n\n因此，关税可能在特定行业短期支持就业，却不能由此认定它是保护总体就业的最佳工具。政策是否值得采取，取决于行业联系、调整速度、长期能力、报复风险和替代措施。所用报告不评估长期安全收益或全经济净效果；在证据有限时，我更支持目标明确、有期限并配合转岗支持的措施，而非无限期全面保护。',
   'Tariffs raise the domestic cost of imports and can redirect spending towards local producers, supporting output and labour demand in a protected industry. In the small-country diagram, domestic supply rises from Qs0 to Qs1 at Pw+t. This explains a possible mechanism, but the diagram does not measure jobs.\n\nThe 2023 USITC report estimated effects during 2018–2021: section 232 tariffs reduced affected steel imports by 24%, raised US steel prices by 2.4% and raised output by 1.9%. This supports the mechanism of restricted imports and greater domestic output. However, output may rise through hours, automation or spare-capacity use; 1.9% is not an employment-growth estimate. Nor should the US be treated as a strict price-taking small economy.\n\nHigher steel prices increase downstream costs and may offset some employment gains in protected production. The report estimated a 0.6% average output decline in downstream steel- and aluminium-using industries. Consumers face higher prices, while retaliation could hurt other exporters. These effects require analysis across stakeholders. Neither industry output changes nor tariff revenue directly establish national net welfare.\n\nTemporary protection may soften adjustment where workers cannot move easily and a region depends on steel. Over time, however, weaker competitive pressure can sustain inefficient firms and prolong costs. If learning spillovers or strategic supply justify intervention, identify evidence, a time limit and exit conditions. Compare retraining, wage insurance and targeted support. Retraining can address skill mismatch more directly, but takes time and public funds.\n\nTariffs may therefore support particular jobs in the short run without being the best instrument for aggregate employment. Effectiveness depends on industry linkages, adjustment, long-run capability, retaliation and alternatives. The cited report does not establish long-run security benefits or economy-wide net effects. Given these limits, a targeted, time-limited response with transition support is more defensible than indefinite broad protection.'),
   weakAnswer: pair('美国钢材产量增长 1.9%，所以美国就业增长 1.9%，证明关税对所有国家都有效。','US steel output rose 1.9%, so US employment rose 1.9%, proving tariffs work for every country.'), diagnosis: pair('把产量误写成就业，把行业误写成全国，把历史特定情境推广到所有国家。应注明指标和时期，分析下游成本、条件与替代政策。','It conflates output with employment, an industry with the whole economy, and a historical case with all countries. Preserve the indicator and period, then analyse downstream costs, conditions and alternatives.') },
  { id: 'calculate', marks: 10, minutes: 12, level: 'hl', title: pair('HL 计算与解释','HL calculation and interpretation'), prompt: pair('原创线性情境：Pw=10、t=2；税前 Qs0=30、Qd0=110，税后 Qs1=50、Qd1=90。计算税前后进口、税收、两种扭曲损失，以及消费者和生产者剩余变化；验证净福利变化。写出步骤和单位。','Original linear example: Pw=10, t=2; before the tariff Qs0=30, Qd0=110; afterwards Qs1=50, Qd1=90. Calculate imports, revenue, both distortion losses and changes in consumer/producer surplus, then reconcile net welfare. Show workings and units.'), criteria: [
   criterion('imports',['数量与税基','Quantities and tax base'],['进口 80→40 单位，税收 80 货币。','Imports 80→40 units; revenue 80 currency units.'],['税率乘税后进口，不能乘 Qd1 或税前进口。','Multiply the tariff by post-tariff imports, not Qd1 or initial imports.']),
   criterion('areas',['面积与净福利','Areas and net welfare'],['b=20，d=20，生产者 +80，消费者 −200，合计 −40 货币。','b=20, d=20, producers +80, consumers −200; total −40 currency units.'],['写出三角形或梯形公式、负号与单位，解释收入转移为何抵消。','Show triangle/trapezium workings, signs and units, and explain cancellation of transfers.'])
  ], modelAnswer: hl, weakAnswer: pair('税收=2×110=220，所以福利增加 220。','Revenue=2×110=220, so welfare rises by 220.'), diagnosis: pair('110 是税前需求，既不是税后进口也不是净福利。税收为 2×(90−50)=80；净福利变化为 −40。','110 is initial demand, neither post-tariff imports nor net welfare. Revenue is 2×(90−50)=80 and net welfare changes by −40.') }
 ],
 sources: [{ title: 'USITC · 2023 report on 2018–2021 tariff effects', url: source }, { title: 'IB · Economics examiner guidance (2025)', url: 'https://ibpublishing.ibo.org/exinst/apps/exinst/index.html?chapter=2&doc=EX_instructions_2025_e&part=10' }]
};
export const tariffOverrides = { 'u4-07-tariff': {
 articles: Object.fromEntries(['zh-CN','en'].map((locale, index) => [locale, {
  frontmatter: {
   takeaway: pair('关税提高进口的国内成本，重新分配消费者、生产者与政府的收益；小国无外部性模型中，净损失是两个扭曲三角形。','A tariff reallocates surplus between consumers, producers and government; in the small-country model without externalities, two distortion triangles remain as a net loss.')[locale],
   definition: pair('关税是对进口商品征收的税。单位关税为每单位固定税额 t；从价关税按进口价值的一定比例征收。本页分析单位关税。','A tariff is a tax on imports. A specific tariff charges a fixed amount t per unit; an ad valorem tariff charges a percentage of import value. This lesson analyses a specific tariff.')[locale],
   causalChain: index===0 ? ['小国世界价 Pw 不变；单位关税提高含税进口成本','国内价升至 Pw+t，沿原有 S 增产、沿 D 减少消费','进口差额缩小，政府只对税后进口征税','剩余在消费者、生产者与政府间转移，留下 b+d 净损失'] : ['Pw stays fixed; the tariff raises landed import cost','Domestic price reaches Pw+t; move along unchanged S and D','The import gap shrinks; government taxes remaining imports','Surplus is redistributed, leaving net losses b+d'],
   hlExtension: hl[locale],
   realWorldExample: { title: pair('美国钢材关税：行业收益与下游成本','US steel tariffs: protected output and downstream costs')[locale], sourceUrl: source, observedAt: '2026-10-20', explanation: caseText[locale] },
   misconceptions: (index===0 ? ['征税使国内价格改变，不意味着国内 D 与 S 本身移动。','税收使用税后进口量，是转移收入，不是净福利增加。','本国生产增加不直接证明总就业或净福利增加。','小国净损失结论有条件；真实大国、外部性和报复需另行分析。'] : ['A price change does not itself shift domestic D or S.','Revenue uses post-tariff imports and is a transfer, not a net welfare gain.','More domestic output does not directly establish more aggregate jobs or welfare.','The small-country result is conditional; large-country effects, externalities and retaliation need separate analysis.']),
   examApplication: index===0 ? ['解释题：交代模型假设，画图并用图上标记逐步解释利益相关者变化。','评价题：把真实案例用于论证，比较短期与长期、下游成本及替代措施，给出有条件判断。'] : ['Explanation: state assumptions, draw the diagram and use its labels to explain stakeholder effects.','Evaluation: use real-world evidence, compare time horizons, downstream costs and alternatives, then reach a conditional judgement.'],
   summary: index===0 ? ['税后价格 Pw+t；Qs 增、Qd 减、进口缩小。','消费者损失 a+b+c+d；生产者获得 a；政府获得 c。','净损失 b+d 来自生产与消费扭曲；条件与评价需明确。'] : ['After the tariff: Pw+t, higher Qs, lower Qd and fewer imports.','Consumers lose a+b+c+d; producers gain a and government gains c.','Net losses b+d are production and consumption distortions; state conditions and evaluate.']
  }, body: index===0 ? zhBody : enBody
 }])), workshop: tariffWorkshop
} };

tariffOverrides['u4-07-tariff'].practice = {
 'u4-07-tariff-flash-1': { answer: pair(
  '单位关税对每单位进口征固定税额。假设小国不能改变 Pw 且税后仍有进口，国内价升至 Pw+t，国内供给增加、消费减少、进口缩小；消费者受损，生产者和政府获得转移，无外部性模型留下 b+d 的净损失。',
  'A specific tariff charges a fixed tax per imported unit. If a small economy cannot change Pw and imports remain positive, domestic price rises to Pw+t, supply rises, consumption and imports fall. Consumers lose; producers and government receive transfers, leaving net losses b+d without externalities.'
 ) },
 'u4-07-tariff-short-1': { modelAnswer: pair(
  '关税是进口税。假定本国是世界价格接受者、商品同质、竞争市场，无外部性或报复，且税后仍有进口。单位关税使国内价由 Pw 升至 Pw+t；企业沿 S 增产至 Qs1，消费者沿 D 减少购买至 Qd1，进口缩小到 Qd1−Qs1。消费者剩余减少 a+b+c+d，生产者获得 a，政府税收为 c；本国转移 a 与 c 相抵后，生产扭曲 b 与消费扭曲 d 构成净损失。例如原创假设某小国对进口大米征单位关税：国内米厂扩产、家庭减少购买，进口差额缩小。不能仅由米厂获益推断全国净福利增加。',
  'A tariff taxes imports. Assume a price-taking economy, homogeneous goods, competition, no externalities or retaliation and positive remaining imports. A specific tariff raises domestic price from Pw to Pw+t. Firms move along S to Qs1 and consumers along D to Qd1; imports fall to Qd1−Qs1. Consumers lose a+b+c+d, producers gain a and government receives revenue c. Transfers a and c cancel, leaving production and consumption losses b+d. In an original hypothetical rice-importing economy, a tariff encourages local mills to expand while households buy less, shrinking the import gap. Producer gains alone do not establish a national welfare gain.'
 ) }
};
