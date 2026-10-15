# qa-workflow

> QA = Quality Assurance，质量保证——以质量保证为纲的研发闭环工作流。
> 一套可安装的 Agent 技能包：把「需求对齐 → 规格 → TDD → 真实浏览器验收 → 双轴审查 → PR 证据」固化成 Claude Code / Codex / Kimi Code 等编码 Agent 的默认动作。

**English**: An installable agent-skills pack that turns QA into a closed-loop engineering workflow for coding agents (Claude Code, Codex, Kimi Code, and any agent supported by the [skills](https://skills.sh) installer). It wraps spec-driven development, TDD, real-browser acceptance with screenshot evidence, and a dual-axis (Standards + Spec) review gate into one default pipeline. The core pipeline doc is stack-neutral; stack-specific rules ship as pluggable stack-packs (Next.js included). Docs and prompts are primarily in Chinese; vendored upstream skills remain in English.

---

## 为什么存在

编码 Agent 的三大失效模式：**需求没对齐就写码**、**声称完成却无证据**、**审查靠自觉**。本工作流的对策是三层结构：

- **软约束**：技能提示词定义默认动作（什么时候该 grill、什么时候必须浏览器验收）；
- **硬证据**：截图、执行记录、双轴对账表——交付必须挂证据，不允许「完成态话术」；
- **人类硬闸门**：git 提交需用户确认、PR 人工终审——Agent 永不自己合闸。

流水线核心规范见 [skills/engineering/setup-qa-workflow/templates/qa-workflow.md](./skills/engineering/setup-qa-workflow/templates/qa-workflow.md)（安装后在宿主项目落地为 `docs/agents/qa-workflow.md`），实施细则参考书见 [docs/guide.md](./docs/guide.md)。

## 流水线全景

```
[1. 需求对齐]   /grill-with-docs → 厘清边界，沉淀 GLOSSARY / ADR
[2. 规格确立]   /to-spec → .scratch/<feature>/spec.md
[3A. 工单拆解]  /to-tickets（仅跨会话交接或并发派发时触发）
[3B. 测试规划]  /qa-test-planner → qa-plan.md（P0 冒烟、定位器、断言）
[4. 编码实现]   /implement → TDD 红绿循环
[5. 浏览器验收] 真实浏览器逐条执行 qa-plan（三级自愈探活、截图证据、FAIL 现场留存）
[6. 双轴审查]   /code-review → Standards 规范轴 + Spec 需求轴对账表
[7. 交付沉淀]   /pr 挂 Before/After 证据 → /retro 复盘
```

中小型改动按「适用范围与剪裁」规则走快车道，不搞教条瀑布流。

## 安装

分**用户级**（本机所有项目可用）与**项目级**（随仓库提交，团队 clone 共享）两种作用域，按需要选择。

### Claude Code

**用户级**：

```bash
claude plugin marketplace add wxy-hh/qa-workflow
claude plugin install qa-workflow@wxy-hh
```

**项目级**（二选一）：

- **方式 A：技能入库，clone 即用（推荐团队场景）**——在宿主仓库根目录执行一行安装脚本（自动平铺到正确目录，避免手工拷贝搞错层级。注意 `skills/` 下的 `engineering/`、`productivity/` 只是本仓库的源码分组，运行时要求 `.claude/skills/<技能名>/SKILL.md` 一层结构，**不要连分组目录一起拷**）：

```bash
curl -fsSL https://raw.githubusercontent.com/wxy-hh/qa-workflow/main/scripts/install.sh | bash
# Kimi Code 项目级目录：curl -fsSL <同上地址> | bash -s -- ./.agents/skills
```

  脚本幂等、只覆盖本包自带的技能，不碰目录中的其他技能。然后 `git add .claude/skills` 提交，成员 clone 即用（首次需信任工作区）；跟进本仓库更新时重跑同一行命令即可，或改用 git submodule / subtree；
- **方式 B：插件机制项目作用域**——本机已 add 过市场的前提下执行：

```bash
claude plugin install qa-workflow@wxy-hh --scope project
```

  该命令把启用记录写入项目 `.claude/settings.json`（`enabledPlugins`），提交后对所有成员生效。注意：外部源插件不会随 clone 自动下载，每名成员首次仍需在本机执行过一次 `claude plugin install`（任意作用域）。

### Codex

**用户级**：

```bash
codex plugin marketplace add wxy-hh/qa-workflow
codex plugin add qa-workflow@wxy-hh
```

**项目级**：插件本体仍安装在用户级缓存，项目级控制「本仓库是否启用」——在宿主仓库提交 `.codex/config.toml`：

```toml
[plugins."qa-workflow@wxy-hh"]
enabled = true
```

项目需已被 trust；项目配置覆盖用户级配置，成员 clone 后本仓库自动启用该插件。

### Kimi Code / 其他 agent（经 skills.sh 安装器）

**项目级（默认）**：在宿主仓库根目录执行，技能落盘 `./.claude/skills/` 或 `./.agents/skills/`，提交入库即团队共享：

```bash
npx skills@latest add wxy-hh/qa-workflow            # 按提示选择你的 agent
# 或显式指定：npx skills@latest add wxy-hh/qa-workflow -a <agent>
```

**用户级**：把技能目录改放到用户技能目录（如 Kimi Code 的 `~/.kimi-code/skills/`），本机所有项目共享。

**手动安装**：推荐直接运行 `scripts/install.sh`（见上方方式 A，避免拷错层级）；或克隆本仓库后手动把 `skills/` 两个分组目录下需要的**技能文件夹**（不含 `engineering/`、`productivity/` 分组层）平铺拷入宿主项目的技能目录，正确形态为 `.claude/skills/to-spec/SKILL.md`（或 `.agents/skills/to-spec/SKILL.md`）。

## 快速开始

技能装好后，**全程无需手动拷贝或编辑任何文件**——以下步骤都由 Agent 执行，文档生成、`CLAUDE.md`/`AGENTS.md` 指令块注入均为 Agent 自动写入，你只需在确认环节核对参数。在**宿主项目**里按顺序执行：

0. **确认技能可见**：重开一个会话，让 Agent 列出可用技能（或直接输入 `/` 看补全），应能看到 `setup-qa-workflow`、`qa-test-planner`、`to-spec` 等；看不到时先查下方 FAQ；
1. `/setup-matt-pocock-skills` —— 配置工单追踪（GitHub/GitLab/本地 markdown，无远端仓库的项目推荐本地 markdown）、分诊标签、领域文档位置；
2. `/setup-qa-workflow` —— 探测项目参数（启动命令、端口、E2E、核心链路、技术栈），与你确认后生成 `docs/agents/qa-workflow.md`、拷贝 `docs/agents/prompt-shortcuts.md`、向 `CLAUDE.md`/`AGENTS.md` 注入 QA 门禁指令块、按需并入技术栈适配包。幂等，可安全重跑；
3. **自检**：Agent 输出环境自检清单（dev 服务器探活、浏览器工具、密钥文件、异步链路），按清单补齐缺失项即完成接入。

之后正常提需求即可，Agent 会在每轮回复首部声明门禁自检状态（阶段/车道/核心链路判定/验收计划/审查状态）。

## 日常使用（口令速查）

| 场景 | 口令 | 走向 |
| --- | --- | --- |
| 新特性（多会话/跨模块/触及核心链路） | 「用 qa-workflow 做 XXX」或直接开聊 | 慢车道全流程：grill → spec → qa-plan → TDD → 浏览器验收 → 双轴审查 → PR 证据 |
| 中型改动（单会话可完成） | 直接描述需求 | 跳过工单拆解：spec → qa-plan → implement → 验收 → 双轴审查 |
| 小型修复（文案/样式/单点 Bug） | 直接描述 | 快车道：implement + TDD；触及 P0 链路时补 Standards 轴自查 |
| 计划没想清楚 | `/grill-me` | 逐题拷问决策树直到收敛 |
| 会话交接 | `/handoff` | 跨人用 `docs/handoff/` 入库交接，同机续接用系统临时目录 |
| 会话复盘 | `/retro` | 环境阻力与规范缺失改进建议 |

## 更新、卸载与重装

**更新**：

- **插件通道**（Claude Code / Codex）：插件随市场源更新，按各自工具的更新机制执行（Claude Code 后台自动更新或 `claude plugin update`；Codex 用 `codex plugin marketplace upgrade`）；
- **skills.sh 通道**：`npx skills@latest update`，再 `npx skills@latest add wxy-hh/qa-workflow` 领取新技能；
- **重跑 setup**：`/setup-qa-workflow` 有幂等护栏——已生成 `docs/agents/qa-workflow.md` 时不覆盖任何文件，只重跑环境自检；项目参数（端口/命令/核心链路）变化时直接编辑 `docs/agents/qa-workflow.md`，无需重跑。

**卸载**：

```bash
# Claude Code（按安装时的作用域加 -s project；不再需要市场源时再执行第二条）
claude plugin uninstall qa-workflow@wxy-hh
claude plugin marketplace remove wxy-hh

# Codex
codex plugin remove qa-workflow@wxy-hh
codex plugin marketplace remove wxy-hh
```

- **Kimi Code / skills.sh / 手动安装**：运行卸载脚本（删除清单以 `plugin.json` 为准，只删本包技能、不碰其他技能）：

```bash
curl -fsSL https://raw.githubusercontent.com/wxy-hh/qa-workflow/main/scripts/uninstall.sh | bash
```

  或手动删除技能目录中本包带入的 20 个技能文件夹；存在 `skills-lock.json` 时同步删除对应条目；
- **项目级启用痕迹**：删除宿主仓库 `.claude/settings.json` 的 `enabledPlugins` 条目、`.codex/config.toml` 的 `[plugins."qa-workflow@wxy-hh"]` 段（按使用过的通道清理）；
- **setup 生成物**（所有通道通用，按需）：移除指令文件（`CLAUDE.md`/`AGENTS.md`）中的 QA 指令块、`docs/agents/qa-workflow.md`、`docs/agents/prompt-shortcuts.md`；`docs/agents/issue-tracker.md` 等基础配置与 `docs/handoff/` 交接档案属项目资产，通常保留。


## 常见问题（FAQ）

- **宿主已装过 mattpocock/skills（如 `grill-me`、`to-spec`），再装本包会怎样**：技能以 `name` 为主键。同一技能目录安装时同名文件夹被本包覆盖（拿到带 qa-workflow 定制的版本，推荐）；跨通道混装（上游走插件 + 本包走项目目录）会出现重名条目，模型可能误调无定制的上游版导致验收钩子被静默跳过——**一个项目只留一份来源**。若宿主对上游技能有本地魔改，安装前先 diff 备份；若想保留上游原版不动，`/setup-qa-workflow` 的「技能定制核验与修复」步骤会对缺失的定制就地补注（幂等），但上游版本过新时注入锚点可能失配，需人工核对。
- **装了技能但 Agent 看不到**：确认安装到了当前 agent 对应的技能目录（Claude Code 为 `.claude/skills/`，Kimi Code 为 `.agents/skills/`），并重开会话刷新技能清单；`npx skills add` 时用 `-a <agent>` 显式指定目标。手动拷贝时最常见的坑是多套了一层分组目录——正确形态是 `.claude/skills/<技能名>/SKILL.md`，不是 `.claude/skills/engineering/<技能名>/SKILL.md`。
- **阶段 5 探活失败**：工作流内置三级自愈（首选端口 → 漂移区间 +30 → 后台拉起 dev 服务器）；仍失败时按 setup 输出的环境自检清单逐项排查（依赖未装、密钥缺失、worker 未起）。
- **没有 ego-browser（非 macOS）**：属预期场景，阶段 5 自动降级 Playwright（MCP 或原生驱动），流水线不阻断；建议另行 `playwright install` 备好无头浏览器。
- **生成的文档里残留 `{CORE_LINKS}` 等占位符**：说明 setup 的确认步骤被跳过——重跑 `/setup-qa-workflow`，或直接全文替换为项目的实际值。
- **想裁剪流程**：直接编辑宿主项目的 `docs/agents/qa-workflow.md`（它是生成物，归项目所有）；裁剪原则见其「流程自身的剪裁」一节。

## 技术栈适配（stack-packs）

核心规范是栈中立的（端口、启动命令等以占位符在 setup 时落定）；栈私有规则做成适配包，由 `/setup-qa-workflow` 检测依赖后自动并入生成的规范：

- [Next.js](./skills/engineering/setup-qa-workflow/templates/stack-packs/nextjs.md)：SSR 水合锚点、禁止 networkidle、dev 首编译预算、RSC 边界、dev/build 行为差异。

欢迎 PR 贡献更多栈适配包（Vite SPA、Expo、FastAPI……）。

## 浏览器工具依赖（可插拔）

阶段 5 需要一个真实浏览器自动化工具，**本仓库不捆绑**，任选其一：

- [`ego-browser`](https://github.com/citrolabs/ego-lite)（推荐，macOS）：真实登录态、可视窗口、人机接管、批处理省 token；
- Playwright（MCP 或原生驱动）：跨平台降级通道，同时承担无头 CI 回归固化职责。

## 仓库导览

```
skills/engineering/   工程技能：setup-qa-workflow、qa-test-planner、to-spec、to-tickets、
                      implement、implement-spec、tdd、code-review、pr、retro、
                      grill-with-docs、diagnosing-bugs、improve-codebase-architecture、
                      codebase-design、domain-modeling、setup-matt-pocock-skills
skills/productivity/  效能技能：grill-me、grilling、handoff、writing-great-skills
docs/guide.md         实施细则参考书（为什么这么做 + 怎么做）
```

## 与上游的关系

本仓库的 18 个基础技能 vendored 自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT），并打入了 qa-workflow 定制（定制点以「项目定制」标记，见 [NOTICE](./NOTICE)）。自研部分为 `setup-qa-workflow` 与 `qa-test-planner`。

## 贡献

- 新的 stack-pack、缺陷修复、规则改进：直接提 Issue 或 PR；
- 提交前请跑 `node scripts/lint.mjs`（校验 frontmatter、占位符、内部链接与私货词）。

## License

MIT © 位笑雨（vendored 上游技能 © Matt Pocock，MIT，详见 [NOTICE](./NOTICE)）
