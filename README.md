# IB Econ Atlas

IB Econ Atlas 是一个以个人复习为核心、可由社区共同维护的中英双语 IB Economics 学习平台。它按照 2022–2029 Economics syllabus 重写原创知识内容，而不是教材电子化、逐页翻译或扫描副本。

IB Econ Atlas is an open-source bilingual study workspace for the 2022–2029 IB Diploma Programme Economics course. It is an original curriculum-aligned knowledge base, search tool, and review system—not a digitised or translated textbook.

> 当前状态 / Current status: Unit 1 MVP 已在本地实现。AI 接口已预留，但没有配置真实 API key，真实模型能力尚未验证。GitHub Pages 只有在功能分支合并到 `main` 后才会由工作流部署。

## 已实现 / What is included

- 43 个 Unit 1 知识点，每点均有独立中文与英文内容、定义、因果链、现实应用、误区、考试提示与总结。
- 129 道复习材料：每个知识点各有闪卡、选择题和关键词简答题。
- 考纲目录与 Cambridge 教材页码索引两套导航；稳定 ID 建立映射，不分发教材文件。
- 中英文跨语言模糊搜索、同义词、拼写容错、考纲代码、SL/HL/Extension 和临时考试范围过滤。
- 闪卡、选择题、简答题和混合复习；简答显示关键词命中、遗漏、覆盖率与人工修正。
- FSRS 间隔调度与 `new`、`learning`、`review`、`mastered` 状态。
- IndexedDB 本地进度、原子化 JSON 合并/替换导入，以及不包含 AI 访问码和临时范围的备份。
- 可键盘和触控操作的 PPC，附静态 SVG 与表格替代视图。
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

- 学习进度、练习记录和非敏感偏好仅存于浏览器 IndexedDB。
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
AI_RATE_LIMIT        KV binding
```

仓库不含真实 secrets。未配置时，本地学习、检索、复习、进度和离线功能全部照常工作。完整协议、威胁边界和部署前门禁见 [AI Worker 指南](docs/AI_WORKER.md)。

## GitHub Pages

项目针对 `https://louisjia2008-ux.github.io/ib-econ-atlas/` 和 `/ib-econ-atlas/` base 构建。`.github/workflows/pages.yml` 只在 `main` 更新时部署 `dist/`；功能分支不会自动成为公开版本。

发布步骤见 [发布指南](docs/PUBLISHING.md)。当前仓库在远程创建和发布前仍需重新完成 `gh` 登录。

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

欢迎原创内容、勘误、无障碍改进与测试贡献。所有内容 PR 必须同时提交中文和英文、目录映射、可核验的现实案例来源与日期、练习题，并确认没有复制或近似翻译教材。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。
