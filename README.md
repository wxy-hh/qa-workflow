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

## 安装（30 秒）

**Claude Code**

```bash
claude plugin marketplace add wxy-hh/qa-workflow
claude plugin install qa-workflow@wxy-hh
```

**Codex**

```bash
codex plugin marketplace add wxy-hh/qa-workflow
codex plugin add qa-workflow@wxy-hh
```

**Kimi Code / 其他 agent**（cursor、opencode、windsurf 等，经 skills.sh 安装器）

```bash
npx skills@latest add wxy-hh/qa-workflow            # 按提示选择你的 agent
# 或显式指定：npx skills@latest add wxy-hh/qa-workflow -a <agent>
```

**手动安装**：克隆本仓库，把 `skills/` 下需要的技能目录拷入宿主项目的技能目录（`.claude/skills/` 或 `.agents/skills/`）。

## 快速开始

技能装好后，在**宿主项目**里按顺序执行：

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

## 更新与重装

- **插件通道**（Claude Code / Codex）：插件随市场源更新，按各自工具的更新机制执行；
- **skills.sh 通道**：`npx skills@latest update`，再 `npx skills@latest add wxy-hh/qa-workflow` 领取新技能；
- **重跑 setup**：`/setup-qa-workflow` 有幂等护栏——已生成 `docs/agents/qa-workflow.md` 时不覆盖任何文件，只重跑环境自检；项目参数（端口/命令/核心链路）变化时直接编辑 `docs/agents/qa-workflow.md`，无需重跑。

## 常见问题（FAQ）

- **装了技能但 Agent 看不到**：确认安装到了当前 agent 对应的技能目录（Claude Code 为 `.claude/skills/`，Kimi Code 为 `.agents/skills/`），并重开会话刷新技能清单；`npx skills add` 时用 `-a <agent>` 显式指定目标。
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
