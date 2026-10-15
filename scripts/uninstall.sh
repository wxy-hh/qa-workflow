#!/usr/bin/env bash
# qa-workflow 技能包卸载器
# 从指定技能目录删除本包带入的技能文件夹（技能清单以 .claude-plugin/plugin.json 为准）。
#
# 用法：
#   bash scripts/uninstall.sh [技能目录]          # 默认 ./.claude/skills
#   curl -fsSL https://raw.githubusercontent.com/wxy-hh/qa-workflow/main/scripts/uninstall.sh | bash
#
# 只删除清单内的目录，目标目录中的其他技能不受影响。
set -euo pipefail

TARGET="${1:-./.claude/skills}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"

# 技能清单来源：优先本地仓库的 plugin.json，其次远端（curl 直跑场景）
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/../.claude-plugin/plugin.json" ]; then
  MANIFEST="$(cat "$SCRIPT_DIR/../.claude-plugin/plugin.json")"
else
  MANIFEST="$(curl -fsSL https://raw.githubusercontent.com/wxy-hh/qa-workflow/main/.claude-plugin/plugin.json)"
fi

count=0
# 从 plugin.json 的 skills 数组提取技能文件夹名（形如 "./skills/engineering/to-spec" → to-spec）
for name in $(printf '%s' "$MANIFEST" | sed -n 's:.*"\./skills/[^"]*/\([^"]*\)".*:\1:p'); do
  if [ -d "$TARGET/$name" ]; then
    rm -rf "${TARGET:?}/$name"
    count=$((count + 1))
  fi
done

echo ">> 已从 ${TARGET} 卸载 ${count} 个技能"
echo ">> 提醒：setup 生成物（docs/agents/qa-workflow.md、指令文件中的 QA 指令块等）如需清理请按 README「卸载」一节处理"
