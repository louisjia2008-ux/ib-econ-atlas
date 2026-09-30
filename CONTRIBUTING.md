# Contributing to IB Econ Atlas

感谢你帮助构建可公开、可核验、真正适合复习的 IB Economics 学习资源。提交 PR 即表示你同意遵守以下原创与版权边界。

## 内容贡献必须满足

1. **原创表达**：根据概念自行组织定义、机制、例子与总结。不得复制、改写过近或逐句翻译 Cambridge、IB 或其他付费资料。
2. **双语成对**：`zh.md` 与 `en.md` 必须同时存在。两种语言应表达相同知识含义，但英文不能只是机械逐句翻译。
3. **稳定 ID**：新增 ID 先进入 `content/manifest.yaml`，发布后不要因标题变化而改 ID。
4. **双目录映射**：`syllabusRefs` 与 `textbookRefs` 均不能为空；教材只填写章节、section 和页码，不链接或提交 PDF。
5. **层级明确**：`level` 只能是 `core`、`hl` 或 `extension`。Extension 不能伪装成考试必修内容。
6. **来源可核验**：现实案例需要 HTTPS 来源和 `YYYY-MM-DD` 观察日期。优先使用官方机构、原始数据和研究来源。
7. **复习材料**：每点至少一张闪卡，以及选择题或简答题；当前 Unit 1 标准为三种题型各一题。
8. **引用完整**：`related`、`prerequisites`、`quizIds` 和 `diagramIds` 的目标必须存在。
9. **不提交 secrets**：不得提交 API key、owner token、`.dev.vars`、真实 `wrangler.toml` 或任何 Bearer token。

## 写作检查表

- 一句话结论能否在 20 秒内回忆？
- 定义是否说明概念边界，而非只提供同义改写？
- 因果链是否每一步都能回答“为什么”？
- 现实案例是否只陈述来源能够支持的事实？
- 误区是否解释“错在哪里”？
- 考试应用是否使用 command term、图形或评价角度？
- 总结能否独立用于考前快速复习？
- 中文和英文是否在结论、条件与例外上保持一致？

## 本地验证

```bash
npm ci
npm run content:validate
npm run content:report
npm run test:repository
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:pwa
npm run test:secrets
npm run test:e2e
```

也可以运行统一门禁：

```bash
npm run verify
```

## Pull request 要求

- PR 聚焦一个章节组或一类功能，不把无关格式化混在一起。
- 在 PR 模板中列出知识点 ID、来源、验证命令和版权确认。
- 视觉变更提供桌面与 390px 窄屏截图。
- 不要在 PR 中提交构建目录、测试报告或本地备份文件。
- 不要把本地测试成功描述成 GitHub Pages、真实设备或真实 AI 模型已经成功。

原创内容以 CC BY-SA 4.0 贡献，代码以 MIT 贡献。署名固定为 `IB Econ Atlas Contributors`；个人贡献由 Git 历史保留。
