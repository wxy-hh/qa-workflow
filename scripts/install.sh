#!/usr/bin/env bash
# qa-workflow 技能包安装器
# 把本仓库 skills/ 下的全部技能平铺安装到宿主项目的技能目录（无分组层）。
#
# 用法：
#   curl -fsSL https://raw.githubusercontent.com/wxy-hh/qa-workflow/main/scripts/install.sh | bash
#   bash scripts/install.sh [目标技能目录]        # 默认 ./.claude/skills
#   curl ... | bash -s -- ./.agents/skills        # Kimi Code 等项目级目录
#
# 幂等：重复执行覆盖同名技能目录；不触碰目标目录中本包以外的技能。
set -euo pipefail

REPO="wxy-hh/qa-workflow"
TARGET="${1:-./.claude/skills}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo ">> 下载 qa-workflow 技能包（${REPO}@main）"
if command -v git >/dev/null 2>&1; then
  git clone --depth 1 --quiet "https://github.com/${REPO}.git" "$TMP/repo"
else
  curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/refs/heads/main" | tar -xz -C "$TMP"
  mv "$TMP"/qa-workflow-* "$TMP/repo"
fi

mkdir -p "$TARGET"
count=0
for group in engineering productivity; do
  for skill in "$TMP/repo/skills/$group"/*/; do
    name="$(basename "$skill")"
    rm -rf "${TARGET:?}/$name"
    cp -R "$skill" "$TARGET/$name"
    count=$((count + 1))
  done
done

echo ">> 已安装 ${count} 个技能到 ${TARGET}（平铺，形如 <技能目录>/<技能名>/SKILL.md）"
echo ">> 下一步：在宿主项目的 agent 会话中依次运行 /setup-matt-pocock-skills 与 /setup-qa-workflow"
