# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 约定与语义化版本。

## [0.1.0] - 2026-10-14

### 新增

- 首个公开发布版本：qa-workflow 研发闭环工作流技能包（7 阶段流水线：需求对齐 → 规格 → 工单/qa-plan → TDD → 真实浏览器验收 → 双轴审查 → PR 证据）。
- 自研技能：`setup-qa-workflow`（宿主项目参数化 scaffold，幂等）、`qa-test-planner`（验收用例规划）。
- vendored 基础工程技能 18 个（源自 mattpocock/skills，MIT），定制点以「项目定制」标记。
- 核心规范模板栈中立化：`{DEV_COMMAND}` / `{WEB_PORT}` / `{E2E_COMMAND}` / `{E2E_DIR}` / `{CORE_LINKS}` 占位符在 setup 时落定。
- Next.js 技术栈适配包（stack-packs/nextjs.md）：水合锚点、禁止 networkidle、dev 首编译预算、RSC 边界。
- 分发通道：Claude Code 插件清单（.claude-plugin/）、Codex 插件、skills.sh 安装器（npx skills）。
- 仓库自检：`scripts/lint.mjs` + GitHub Actions lint 工作流。
