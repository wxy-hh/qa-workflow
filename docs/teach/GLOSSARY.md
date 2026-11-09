# QA & 浏览器测试闭环教学词汇表 (Glossary)

本词汇表定义了研发与测试闭环工作流中的核心标准术语及反模式词汇，供团队成员在设计、编码、测试与复盘时统一语言。

## 阶段与技能术语 (Phases & Skills)

**`/grill-with-docs` (文档化盘问)**:
在严苛盘问需求与设计边界的同时，强制挂载领域建模（domain-modeling）技能，将关键术语落盘至 CONTEXT.md 并将重大取舍沉淀为 ADR 的前置对齐过程。
_Avoid_: 闲聊需求、随意沟通

**`/grill-me` (轻量盘问)**:
仅针对设计分支和逻辑漏洞进行连续问答推演，不强制产出 ADR 与通用词汇表的纯思维对齐技能。
_Avoid_: 口头评审、非结构化提问

**`/to-spec` (规格确立)**:
基于盘问对齐共识，将业务目标转化为长篇用户故事（User Stories）、实现决策与测试接缝（Seams）的只读综合技能。
_Avoid_: 需求草稿、PRD摘要

**`/qa-test-planner` (测试用例规划)**:
分析真实 UI DOM 元素（aria-label、placeholder、role）与 Spec 契约，生成包含前置条件、步骤与量化断言的结构化测试计划技能。
_Avoid_: 随便点点看、手工测试大纲

**`/implement` 与 `/implement-spec` (TDD 实现)**:
以 Spec 或工单为输入，严格通过 Red-Green 循环和单测先行驱动代码实现，并最终串联代码审查与提交的编码技能。
_Avoid_: 随意写代码、先码后测

**`ego-browser` (真机验收浏览器)**:
支持 Agent 与开发者无缝协作的真实 Chromium 浏览器环境，用于自动执行点击、输入、等待与截图，并支持人工接管控制权。
_Avoid_: 无头模拟器、mock页面测试

---

## 工程准则与排障术语 (Engineering & Diagnostics)

**隔离探针 (Isolated Probe)**:
一种完全绕开当前重构代码、仅保留最简调用链路的独立测试脚本，用于科学判定异常是属于外部环境阻塞还是业务代码缺陷。
_Avoid_: 盲猜改代码、回滚看运气

**就绪锚点 (Readiness Anchor)**:
在 SSR 应用中，用来证明客户端 React 水合已完成、事件监听器已挂载完毕的特征 DOM 节点（如输入框激活态），替代不可用的 networkidle。
_Avoid_: 盲等休眠、网络空闲等待

**时间盒 (Timebox)**:
为交互式浏览器真机验收设定的强制成本上限（默认不超过 5 条用例 / 15 分钟），超出时必须停下排障或降级为脚本回归。
_Avoid_: 无休止重试、通宵验界面

**严格行为保持 (Behavior Preservation)**:
在重构过程中，通过确保既有测试文件一行未改且全量测试保持 100% 绿灯，证明重构未对既有契约造成意外退化。
_Avoid_: 悄悄改测试断言、破坏性重构

---

## QA 证据与审查术语 (Evidence & Review)

**ReviewChallenge (审查挑战)**:
`review-package collect` 为每轮审查发放的一次性凭据，写入 `_qa/review-challenge.json`，包含 nonce、轮次、treeDigest 与打包时间；再次 collect 会更换 nonce，旧凭据不能用于新轮次。
_Avoid_: 审查令牌, 会话 ID, 审查包 ID

**ReviewSourceReceipt (审查来源凭据)**:
审查子代理自写原文后由 `review-package seal` 生成、与原文同名的 `.source.json`，记录 nonce、round、axis、reviewerKind、host、reportPath、sha256 与 completedAt；凭据是自述证据，不证明作者或独立性。
_Avoid_: 审查签名, 来源证明, 原文回执

**SourceVerificationStrength (来源核验强度)**:
`qa-check` 对审查来源的证据分级：找到同 nonce 的 Claude Code 子代理转录且哈希行一致为「转录（强）」；只有自述凭据且内部一致为「自述凭据（弱）」；两者都没有为「未核验（人工）」。强度行不改变 PASS / BLOCKED 语义。
_Avoid_: 审查可信度, 质量评分, 来源评分
