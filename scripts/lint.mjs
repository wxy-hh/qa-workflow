#!/usr/bin/env node
// qa-workflow 仓库自检：技能完整性、frontmatter、私货词、内部链接、插件清单一一对应
// 用法：node scripts/lint.mjs（仓库根目录执行）
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const TEXT_EXT = new Set(['.md', '.json', '.mjs', '.yml', '.yaml', '.sh', '.txt']);

// 私货词清单：任何命中都视为泄露了源项目的具体信息，必须泛化
const FORBIDDEN = [
  '3030', 'dev:web', 'dev-port', '@repo/', 'apps/web', 'gitee', 'bazi',
  'DESIGN.md', 'AI 聚合', 'AI聚合', '通义千问', '智谱', 'deepseek', 'agnes',
  'tooling/scripts', 'AI-aggregation', '/Users/',
];

const errors = [];
const err = (msg) => errors.push(msg);
const SELF = rel2 => rel2 === 'scripts/lint.mjs'; // 词表定义在自身，跳过私货词扫描

// 收集仓库内全部文本文件（跳过 .git）
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(p.slice(p.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const rel = (p) => p.slice(ROOT.length + 1);

// 1. 技能目录完整性与 frontmatter
const skillDirs = [];
for (const group of ['engineering', 'productivity']) {
  const gdir = join(ROOT, 'skills', group);
  if (!existsSync(gdir)) { err(`缺少技能分组目录 skills/${group}`); continue; }
  for (const name of readdirSync(gdir)) {
    const dir = join(gdir, name);
    if (!statSync(dir).isDirectory()) continue;
    skillDirs.push(`skills/${group}/${name}`);
    const skillFile = join(dir, 'SKILL.md');
    if (!existsSync(skillFile)) { err(`${rel(dir)} 缺少 SKILL.md`); continue; }
    const head = readFileSync(skillFile, 'utf8').slice(0, 600);
    if (!head.startsWith('---')) err(`${rel(skillFile)} 缺少 frontmatter 起始 ---`);
    if (!/^name:\s*\S+/m.test(head)) err(`${rel(skillFile)} frontmatter 缺少 name`);
    if (!/^description:\s*\S+/m.test(head)) err(`${rel(skillFile)} frontmatter 缺少 description`);
  }
}

// 2. 私货词零命中（/Users/ 需大小写敏感，避免误伤 /users/ 这类 API 路径示例）
for (const f of files) {
  if (SELF(rel(f))) continue;
  const text = readFileSync(f, 'utf8');
  const lower = text.toLowerCase();
  for (const word of FORBIDDEN) {
    const hit = word === '/Users/' ? text.includes(word) : lower.includes(word.toLowerCase());
    if (hit) err(`${rel(f)} 命中私货词: ${word}`);
  }
}

// 3. Markdown 内部相对链接可解析
// 豁免：上游 domain-modeling 的 GLOSSARY-FORMAT.md 内为「多上下文目录长什么样」的示意性示例链接，非真实资源
const LINK_CHECK_EXEMPT = new Set(['skills/engineering/domain-modeling/GLOSSARY-FORMAT.md']);
for (const f of files.filter((p) => p.endsWith('.md'))) {
  if (LINK_CHECK_EXEMPT.has(rel(f))) continue;
  const text = readFileSync(f, 'utf8');
  const re = /\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const href = m[1];
    if (/^(https?:|mailto:|#|kimi-code:)/.test(href)) continue;
    if (!existsSync(resolve(dirname(f), href))) err(`${rel(f)} 存在失效内部链接: ${href}`);
  }
}

// 4. plugin.json 与磁盘技能一一对应
const plugin = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
const listed = (plugin.skills ?? []).map((s) => s.replace(/^\.\//, '').replace(/\/$/, ''));
for (const s of listed) {
  if (!skillDirs.includes(s)) err(`plugin.json 列出的技能路径不存在: ${s}`);
}
for (const s of skillDirs) {
  if (!listed.includes(s)) err(`磁盘技能未列入 plugin.json: ${s}`);
}

// 5. 模板占位符只允许白名单集合
const KNOWN_PLACEHOLDERS = new Set(['{DEV_COMMAND}', '{WEB_PORT}', '{E2E_COMMAND}', '{E2E_DIR}', '{CORE_LINKS}']);
for (const f of files.filter((p) => rel(p).startsWith('skills/engineering/setup-qa-workflow/templates'))) {
  const text = readFileSync(f, 'utf8');
  const re = /\{[A-Z_]+\}/g;
  let m;
  while ((m = re.exec(text))) {
    if (!KNOWN_PLACEHOLDERS.has(m[0])) err(`${rel(f)} 出现未知占位符: ${m[0]}`);
  }
}

if (errors.length) {
  console.error(`qa-workflow lint FAIL（${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`qa-workflow lint PASS：${skillDirs.length} 个技能、${files.length} 个文本文件，全部校验通过。`);
