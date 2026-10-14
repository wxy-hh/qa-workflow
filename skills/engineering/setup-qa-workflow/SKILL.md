---
name: setup-qa-workflow
description: "在宿主项目上 scaffold qa-workflow 研发闭环定制层：流水线规范、指令文件门禁、技能定制核验与浏览器验收约定。跨项目推广时使用，每个新项目运行一次。"
disable-model-invocation: true
---

# Setup QA Workflow

在宿主仓库上 scaffold **qa-workflow 定制层**（7 阶段闭环流水线：规格 → 工单/qa-plan → TDD → 真实浏览器验收 → 双轴审查 → PR 证据）。

本技能自包含：基础工程技能（to-spec、tdd、code-review 等）随 qa-workflow 技能包一同分发，宿主项目装好技能包后直接运行本技能即可。

本技能是 prompt 驱动的流程，不是确定性脚本：先探索，向用户呈现发现并确认，然后才写入。

## 0. 前置检测

逐项检测并报告缺失项；有硬性缺失时停止：

- **基础技能在位**：`to-spec`、`to-tickets`、`implement`、`implement-spec`、`tdd`、`code-review`、`pr`、`retro`、`handoff`、`grill-with-docs`、`diagnosing-bugs`、`improve-codebase-architecture`、`codebase-design`、`domain-modeling`、`setup-matt-pocock-skills`、`qa-test-planner`、`grill-me`、`grilling`、`writing-great-skills`。它们随 qa-workflow 技能包分发；若缺失，提示用户先安装技能包（见仓库 README 的安装矩阵），然后停止。
- **基础追踪配置已生成**：`docs/agents/issue-tracker.md`、`docs/agents/triage-labels.md`、`docs/agents/domain.md`——即 `/setup-matt-pocock-skills` 的产物。若缺失，提示用户先运行 `/setup-matt-pocock-skills`（无 GitHub/GitLab 的仓库推荐本地 markdown tracker），完成后再回本技能。

**幂等护栏**：若 `docs/agents/qa-workflow.md` 已存在，不要重新生成或覆盖任何文件。报告定制层已配置，改为只跑第 4 步的环境自检清单后退出。

## 1. 探索

读实际存在的东西，不要假设：

- `package.json` scripts：启动用户可见 Web 应用的**开发命令**（如 `pnpm dev`、`npm run dev`）及其**首选端口**（看 `-p` 参数、端口决议脚本、env 文件、文档）。
- E2E 配置：是否有 Playwright 配置与 e2e 目录（如 `e2e/`、`apps/<app>/e2e/`）？用什么命令跑？
- **运行时与指令文件检测**：仓库根的 `CLAUDE.md` 与 `AGENTS.md` 哪个存在？是否符号链接？是否已有 QA 指令块？`.claude/`、`.agents/`、`.codex/` 目录的存在性（判断宿主 agent 运行时）。
- **技术栈检测**：`package.json` dependencies——含 `next` → 使用 `templates/stack-packs/nextjs.md` 适配包；其他栈暂无适配包，跳过并在报告中注明（欢迎向 qa-workflow 仓库贡献新栈适配包）。
- `docs/agents/`：已有哪些文件？
- `.gitignore`：`.scratch/` 已被忽略？技能目录（`.claude/skills/`、`.agents/skills/`）被 git 跟踪还是被忽略？
- `docs/handoff/` 是否存在？

## 2. 呈现发现并确认

汇总探测到的参数，写入任何东西之前与用户确认：

- `{DEV_COMMAND}` —— 启动开发服务器的命令
- `{WEB_PORT}` —— 本地开发首选端口
- `{E2E_COMMAND}` / `{E2E_DIR}` —— 无头回归命令与用例目录（若尚不存在，按技术栈提出合理默认值，并注明首次使用时需创建）
- `{CORE_LINKS}` —— 项目用户可见、永远不许跳过真实浏览器验收的核心旅程。按领域给出示例（如认证、核心对话/提交流程、支付、历史记录）；最终清单必须由用户确认。
- **指令文件选择**：`CLAUDE.md` / `AGENTS.md` 已有哪个写哪个；两者经符号链接共存时编辑真实文件；都没有则询问用户创建哪一个，不替用户选。多运行时并存（如 Claude Code + Kimi Code）时建议符号链接方案（`AGENTS.md` → `CLAUDE.md`，单一事实源）。
- **stack-pack 合并**：报告检测到的技术栈与将并入的适配包。
- 另问一个问题：技能目录是否**纳入 git 跟踪**（团队推广推荐入库，定制随仓库版本化），还是保持本地？

## 3. 写入

使用本技能目录下的模板。把每个 `{PLACEHOLDER}` 替换为已确认的值；写出的文件里不允许残留任何占位符（第 4 条例外，见下）。

1. **`docs/agents/qa-workflow.md`** —— 从 [templates/qa-workflow.md](./templates/qa-workflow.md) 生成。适配点：核心链路清单、环境自愈段（开发命令、端口、漂移区间来源——首选端口起 +30 区间）、e2e 命令/目录、P0 固化用例清单（初始为空，随验收沉淀登记）。若第 1 步检测到技术栈适配包，将对应 `templates/stack-packs/<stack>.md` 全文原样追加到文末（其首行即为「## 技术栈适配（\<Stack\>）」章节标题，不要另加外层标题），并在阶段 5 小节处保留互链指引。
2. **`docs/agents/prompt-shortcuts.md`** —— 原样拷贝 [templates/prompt-shortcuts.md](./templates/prompt-shortcuts.md)。文件已存在则跳过。
3. **指令文件（CLAUDE.md / AGENTS.md）** —— 按第 2 步确认的目标文件，注入 [templates/claude-qa-directive.md](./templates/claude-qa-directive.md) 的 QA 指令块（替换 `{CORE_LINKS}`）。已有 QA 指令块则原地更新；绝不清空周围的用户段落。
4. **技能定制核验与修复** —— 对 `to-spec`、`implement`、`implement-spec`、`handoff`、`retro` 与 `docs/agents/issue-tracker.md` 检查 [templates/skill-customizations.md](./templates/skill-customizations.md) 描述的定制标记：
   - 宿主安装的是本技能包分发的技能时，六处定制已内置——只需把 `implement`、`implement-spec` 中残留的 `{CORE_LINKS}` 占位符替换为确认值；
   - 若某处定制标记缺失（宿主另行安装了上游原版技能），按 `skill-customizations.md` 的注入文本就地补注（含 `{CORE_LINKS}` 替换）。每处注入都带 `项目定制` 标记：标记已存在且无占位符残留时跳过（幂等重跑）。不要改动其他技能文件。
5. **`.gitignore`** —— 确保 `.scratch/` 被忽略（工作区绝不许入库）。若用户选择技能目录入库，确保技能目录未被毯式忽略（仅忽略 `.claude/settings.local.json`、`.claude/worktrees/` 等本地文件）。
6. **`docs/handoff/`** —— 不存在则创建（放 `.gitkeep`）；它是工作流引用的入库跨人交接通道。

## 4. 完成

报告写入了什么，然后输出**环境自检清单**，逐项探测并标记 ready/missing，供在这台机器上跑流水线的人使用：

- 运行时版本管理文件（`.nvmrc` / `.node-version`）满足；依赖已安装
- `{DEV_COMMAND}` 能启动且探针端口返回 200
- 浏览器工具：`ego-browser` CLI 已安装（macOS 首选，真实登录态+人机接管）；否则安装 Playwright 浏览器（`playwright install`）作为降级通道
- 环境变量/密钥文件按项目自身文档就位
- 异步链路（队列/worker）在跑（若产品有）

提示用户后续可直接编辑 `docs/agents/qa-workflow.md`；重跑本技能是安全的（幂等护栏），已配置时只报告状态。
