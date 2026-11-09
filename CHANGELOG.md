# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 约定与语义化版本。

## [Unreleased]

## [0.3.0] - 2026-11-09

### 新增

- **宿主无关的审查来源凭据（ADR-0048）**：`review-package collect` 发放一次性 challenge（nonce、轮次、treeDigest、打包时间）；审查子代理自写 `review/r<n>-*.md` 并运行 `review-package seal` 生成同名 `.source.json` 凭据；`qa-check review` 输出「来源核验」强度行（转录（强）／自述凭据（弱）／未核验（人工））。
- **`review-package seal`**：校验 challenge 与当前审查包一致，拒绝覆盖已有凭据；r2 起支持 `--pending-ids`；无子代理宿主可用 `--reviewer-kind external-session`。
- **`code-review` 可写审查者协议**：子代理 prompt 携带 binding 与 nonce，自写原文并 seal，最终返回 `QA_REVIEW_RECEIPT`；只读探索型代理不能担任审查者，无子代理宿主由用户手动另开独立会话。
- ADR-0048 与教学词汇表新增 `ReviewChallenge`、`ReviewSourceReceipt`、`SourceVerificationStrength`。

### 变更

- 有 challenge 的新轮次取消同轮原文纠偏：原文有问题时按真实返回保留、保持待独立审查，或按新轮次重新审查；主代理不转抄、不改写、不重算凭据。
- 旧轮次（无 challenge）继续走主代理逐字落盘与 Claude Code 转录全等比对，不强制迁移。
- 审查方式行 `宿主=<宿主名>` 在新轮次降为说明字段，`qa-check` 按证据判定来源；无 challenge 的旧轮次保留原兼容分支。
- 正本、安装模板、`code-review` 定制段、指南与 README 同步凭据协议。

### 测试

- 新增凭据协议测试：seal 生成最小凭据、challenge 轮次与哈希校验、强档/弱档/人工分级、复审 `pendingIds` 提示、旧轮次兼容。

## [0.2.0] - 2026-11-09

### 新增

- **Schema 4 证据链**：`qa-plan.md` 声明 `QA Schema: 4`、`QA Mode` 与可选 `QA Kind: fix`；执行记录要求 qa-run 日志、`[TCxx-n] PASS 实测：` 断言标记与 unit/integration 用例绑定；验收输出 PASS/FAIL/BLOCKED 对账表并写入 `_qa/reconciliation.md`。
- **三个零依赖检查器**（随 `/setup-qa-workflow` 安装到宿主 `tooling/scripts/`）：
  - `qa-check.mjs`：`plan` / `acceptance` / `review` 三阶段聚合检查，可机械修复的缺口硬失败；
  - `qa-run.mjs`：带 tree 哈希与时间戳的不可覆盖证据日志；
  - `review-package.mjs`：开工前快照、范围白名单、审查包 collect 与混入提交标注。
- **双轴审查闭环**：collect → 用 Skill 工具调用 `code-review` → 两轴子代理原文逐字落盘 `review/r<n>-*.md` → 三档分流 → 增量复审，自动上限 2 轮（r2、r3），用尽交人工裁决。
- **审查来源核验**：按特性、轮次、轴绑定真实最终返回；已定位失真阻断，同轮可逐字纠偏；用可靠事件时间取代 mtime；分流表为唯一缺陷清单与流程状态源。
- **车道升级机制**：实现中发现事实不符时停下报告，用户确认后只升不降；补齐新车道阶段与 `baseline-upgrade-*` 基线细则。
- **工作区数据存储扫描**：从 workspace 配置推导直接依赖数据库驱动的包，包名、子路径、相对与绝对路径导入均不可豁免。
- 测试仓：249 项工具与文档契约测试，覆盖 Schema 4、宿主扫描、控制点、审查包与跨文件契约。

### 变更

- `qa-test-planner` 重写为 Schema 4 规划器：原子断言、合适接缝、成本边界、计划冻结与交付命令。
- `implement` / `implement-spec` 改为默认单会话串行、显式并行上限 2 个实现子代理，并内置验收后审查交接。
- `to-spec` 增加交付命令、US 粒度与推翻既有决策的证据要求；`to-tickets` / `grill-with-docs` 统一唯一后继收口。
- `code-review` 增加 QA 调用时的 diff 来源、审查绑定、原文落盘与来源纠偏规则。
- `handoff` 增加 QA 续接快照；`pr` 增加遗留事项；`tdd` 复用已确认 Seam；`retro` 以工具轨迹与审查原文为准。
- 核心规范、安装模板、指南与教学材料同步到 Schema 4。

### 移除

- `qa-test-planner` 与 Schema 4 冲突的旧上游 references/scripts 模板。

### 修复与硬化

- **阶段 5 浏览器工具防偷懒硬化 (Schema Bias 防线)**：堵死模型因存在 Playwright MCP 工具而擅自降级后台无头运行的漏洞；`claude-qa-directive.md`、`qa-workflow.md` 模板与实战指南强化规定 macOS 桌面开发机必须强制使用 `ego-browser` 弹出真实前台窗口进行验收；首步必须执行 `ego-browser --version` 命令行探活，未经探活直接调 Playwright 视为严重流程违规。

### 安装与分发

- `scripts/install.sh` / `scripts/uninstall.sh`：一行命令安装/卸载技能包（自动平铺、幂等、只覆盖本包技能，不误删宿主其他技能）。

### 文档

- README：安装节拆分用户级/项目级矩阵并补全卸载命令；明确手动拷贝的平铺规则与分组目录陷阱；新增「宿主已装上游技能」冲突 FAQ；强调 `/setup-qa-workflow` 全程无需手动拷贝编辑。

## [0.1.0] - 2026-10-14

### 新增

- 首个公开发布版本：qa-workflow 研发闭环工作流技能包（7 阶段流水线：需求对齐 → 规格 → 工单/qa-plan → TDD → 真实浏览器验收 → 双轴审查 → PR 证据）。
- 自研技能：`setup-qa-workflow`（宿主项目参数化 scaffold，幂等）、`qa-test-planner`（验收用例规划）。
- vendored 基础工程技能 18 个（源自 mattpocock/skills，MIT），定制点以「项目定制」标记。
- 核心规范模板栈中立化：`{DEV_COMMAND}` / `{WEB_PORT}` / `{E2E_COMMAND}` / `{E2E_DIR}` / `{CORE_LINKS}` 占位符在 setup 时落定。
- Next.js 技术栈适配包（stack-packs/nextjs.md）：水合锚点、禁止 networkidle、dev 首编译预算、RSC 边界。
- 分发通道：Claude Code 插件清单（.claude-plugin/）、Codex 插件、skills.sh 安装器（npx skills）。
- 仓库自检：`scripts/lint.mjs` + GitHub Actions lint 工作流。
