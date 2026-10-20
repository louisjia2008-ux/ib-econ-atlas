# IB Econ Atlas

IB Econ Atlas 是一个以个人复习为核心、可由社区共同维护的中英双语 IB Economics 学习平台。它按照 2022–2029 Economics syllabus 重写原创知识内容，而不是教材电子化、逐页翻译或扫描副本。

IB Econ Atlas is an open-source bilingual study workspace for the 2022–2029 IB Diploma Programme Economics course. It is an original curriculum-aligned knowledge base, search tool, and review system—not a digitised or translated textbook.

> 当前状态 / Current status: Units 1–4 已上线；本轮修复更正 SL/HL 边界、公式说明与练习，并补齐遗漏。This audit update corrects level boundaries, formula explanations and practice, and fills content gaps. AI 尚未配置。

## 已实现 / What is included

- 本轮审计修复、证据与范围见 [内容审计](docs/CONTENT_AUDIT.md)。Unit 1 的官方考纲目录已更正为 1.1 与 1.2。
- Unit 1 / 2 / 3 / 4 分别有 44 / 60 / 60 / 63 个知识点：共 227 点、454 篇中文/英文学习页面。
- Unit 2 覆盖 2.1–2.12：34 个 SL/HL 共用点、26 个 HL 点，含原创推导、教学情境、误区、考试提示和总结。Full coverage map: [Unit 2](docs/UNIT_2.md).
- Unit 3 覆盖 3.1–3.7：51 个 SL/HL 共用点、9 个 HL 深入点。覆盖与边界见 [Unit 3](docs/UNIT_3.md)。
- Unit 4 覆盖 4.1–4.10：49 个共用点、13 个 HL 深入点、1 个扩展点，详见 [Unit 4](docs/UNIT_4.md)。
- 695 道复习材料：每个知识点各有闪卡、选择题和关键词简答题；部分共用点另附明确标注、SL 复习自动排除的 HL 计算题。
- 8 幅原创全球经济 SVG：进口、出口、关税、配额、生产补贴、外汇市场、J 曲线和贫困循环，附双语文字替代。
- 考纲目录与 Cambridge 教材页码索引两套导航；稳定 ID 建立映射，不分发教材文件。
- 中英文跨语言模糊搜索、同义词、拼写容错、考纲代码、SL/HL/Extension 和临时考试范围过滤。
- 闪卡、选择题、简答题和混合复习；简答的关键词命中仅用于查漏，核对概念、因果和情境并明确自评后才记录结果。
- 知识点练习入口直接限定当前主题，按 SL/HL 筛选；自由复习保留独立入口。
- 关税示范工坊：完整机制与福利推导、键盘／触控作图、10 分解释题、15 分评价题、HL 计算、自查反馈和本机草稿。3 道工坊题独立于上述 695 道基础材料；题目为原创练习，不是 IB 真题或自动阅卷。详见 [学习工坊](docs/LEARNING_WORKSHOP.md)。
- FSRS 间隔调度与 `new`、`learning`、`review`、`mastered` 状态。
- IndexedDB 本地进度、原子化 JSON 合并/替换导入，以及不包含 AI 访问码和临时范围的备份。
- 可键盘和触控操作的 PPC，附静态 SVG 与表格替代视图。
- 12 幅原创微观 SVG 示意图，含供需、税补、限价、四类外部性、企业边际决策及物品分类，附双语文字替代。
- 8 幅原创宏观 SVG 示意图：AD–AS、需求扩张、供给冲击、LRAS、凯恩斯 AS、经济周期、菲利普斯曲线和洛伦兹曲线，附双语文字替代与假设提示。
- PWA 离线缓存、提示式更新与 Hash Router 深链接。
- 可选 Cloudflare Worker AI 边界：只读取 Worker 自带的 Atlas 内容 bundle，并校验站内 citation。

## 运行项目 / Run locally

要求 Node.js 22 或以上版本。

```bash
npm ci
npm run dev
```

Vite 默认使用仓库子路径。打开终端显示的 `/ib-econ-atlas/` URL；路由示例：

```text
/#/study/u1-04-scarcity
/#/study/u2-01-demand
/#/study/u3-02-gdp
/#/study/u4-07-tariff
/#/search
/#/review
/#/progress
/#/settings
```

完整本地门禁：

```bash
npm run verify
```

该命令依次执行内容与生成报告校验、文档/工作流检查、ESLint 只读检查、前端和 Worker TypeScript、Vitest、生产/PWA 构建、PWA 产物审计与密钥扫描。浏览器端到端验收使用：

```bash
npm run test:e2e
```

首次运行浏览器验收前，请安装 Chromium：`npx playwright install chromium`。测试会自行完成严格生产构建，并在 1440px、768px、390px 视口以及离线模式下运行。

## 内容结构 / Content structure

```text
content/
  manifest.yaml
  knowledge/<knowledge-point-id>/
    meta.yaml
    zh.md
    en.md
  quizzes/<knowledge-point-id>.yaml
  diagrams/<diagram-id>.svg
```

源内容在构建时编译为前端知识库和 Worker 最小可信 bundle。严格构建会拒绝：语言缺失、ID/引用断链、层级或目录映射缺失、无来源日期的现实案例、缺失图表，以及被 Git 跟踪的 PDF。

更完整的字段和写作规则见 [内容模型](docs/CONTENT_MODEL.md) 与 [贡献指南](CONTRIBUTING.md)。当前自动生成的范围证据见 [内容覆盖报告](reports/content-coverage.md) 和 [版权边界审计](reports/copyright-audit.md)。

## 数据与隐私 / Data and privacy

- 学习进度、练习记录和非敏感偏好仅存于浏览器 IndexedDB；工坊画图／长答草稿存于本机 localStorage，暂不包含在进度 JSON 备份中。
- 当前考试范围只存于 `sessionStorage`，关闭会话后消失，也不会进入备份。
- Owner access token 只保存在当前设备的浏览器存储中，不进入备份、URL、日志或仓库。
- Service Worker 只管理静态应用缓存，不删除或迁移 IndexedDB。
- 不需要账号，也没有项目提供的云数据库。

详见 [隐私与本地数据](docs/PRIVACY.md)。

## 可选 AI / Optional AI

静态 GitHub Pages 不直接调用 OpenAI。开源使用者必须部署自己的 Cloudflare Worker，并自行设置：

```text
OPENAI_API_KEY       secret
OWNER_ACCESS_TOKEN   secret
OPENAI_MODEL         variable (suggested deployment default: gpt-6-luna)
ALLOWED_ORIGIN       variable
AI_DAILY_LIMIT       variable
AI_RATE_LIMIT        Durable Object binding (DailyAiQuota)
```

仓库不含真实 secrets。未配置时，本地学习、检索、复习、进度和离线功能全部照常工作。完整协议、威胁边界和部署前门禁见 [AI Worker 指南](docs/AI_WORKER.md)。

## GitHub Pages

项目针对 `https://louisjia2008-ux.github.io/ib-econ-atlas/` 和 `/ib-econ-atlas/` base 构建。`.github/workflows/pages.yml` 只在 `main` 更新时部署 `dist/`；功能分支不会自动成为公开版本。

发布步骤见 [发布指南](docs/PUBLISHING.md)。Units 1–4 已通过 PR 合并并发布；本轮审计修复的范围及验证见 [审计报告](docs/CONTENT_AUDIT.md)。Worker 部署独立于学习内容发布。

## 课程与资料边界 / Curriculum and source boundaries

- 课程兼容性以 [IB Economics 课程页](https://ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/economics/)、[SL subject brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/sl-economics-en.pdf) 和 [HL subject brief](https://ibo.org/globalassets/new-structure/programmes/dp/pdfs/hl-economics-en.pdf) 为基准。
- 本地 Cambridge coursebook 只用于章节与页码索引以及独立理解。PDF、扫描页、出版商图片、大段原文和逐页翻译不属于本项目，也不得提交。
- 外部现实案例链接只作为事实来源；第三方内容、标志和商标不被纳入仓库许可。

IB Econ Atlas 与 International Baccalaureate Organization 和 Cambridge University Press 均无隶属、认可或赞助关系。“IB”仅用于描述课程兼容性。IB 与 International Baccalaureate 是 International Baccalaureate Organization 的商标。

## 许可 / Licensing

- 程序代码：[MIT](LICENSE)
- `content/` 中的原创学习内容：[CC BY-SA 4.0](LICENSE-CONTENT)
- 第三方事实、链接、商标及本地参考教材不属于上述许可范围，详见 [NOTICE](NOTICE)

固定项目署名为 **IB Econ Atlas Contributors**；个人贡献由 Git 历史和 GitHub Contributors 保留。

## 贡献 / Contributing

欢迎原创内容、勘误、无障碍改进与测试贡献。内容 PR 必须同时提交中文和英文、目录映射、练习题，并确认没有复制或近似翻译教材。现实案例须有可核验来源与日期；原创教学情境须明确标为假设。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。
