#!/usr/bin/env node
'use strict';

/**
 * Qualizeal Harness CLI (zero dependencies).
 *
 *   node scripts/qz.js validate
 *   node scripts/qz.js install --target claude|kiro|codex [--dest <dir>] [--force] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACK = path.join(ROOT, 'qualizeal-qe');
const ENGINE = path.join(ROOT, 'engine');
const TARGETS = ['claude', 'kiro', 'codex'];

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return null;
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) values[kv[1]] = kv[2].trim();
  }
  return { values, body: match[2] };
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith(ext)).sort();
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
}

function loadPack(packDir = PACK) {
  const agents = listFiles(path.join(packDir, 'agents'), '.md').map(file => {
    const source = fs.readFileSync(path.join(packDir, 'agents', file), 'utf8');
    return { file, id: path.basename(file, '.md'), source, fm: parseFrontmatter(source) };
  });
  const skills = listDirs(path.join(packDir, 'skills')).map(dir => {
    const skillPath = path.join(packDir, 'skills', dir, 'SKILL.md');
    const source = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf8') : null;
    return { dir, id: dir, source, fm: source ? parseFrontmatter(source) : null };
  });
  const commands = listFiles(path.join(packDir, 'commands'), '.md').map(file => {
    const source = fs.readFileSync(path.join(packDir, 'commands', file), 'utf8');
    return { file, id: path.basename(file, '.md'), source, fm: parseFrontmatter(source) };
  });
  return { agents, skills, commands };
}

function validate({ root = ROOT, packDir = PACK, engineDir = ENGINE } = {}) {
  const errors = [];
  const { agents, skills, commands } = loadPack(packDir);
  const namePattern = /^qz-[a-z0-9-]+$/;

  const manifestPath = path.join(packDir, '.claude-plugin', 'plugin.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const field of ['name', 'version', 'description']) {
      if (!manifest[field]) errors.push(`plugin.json: missing "${field}"`);
    }
  } catch (err) {
    errors.push(`plugin.json: ${err.message}`);
  }

  if (!agents.length) errors.push('no agents found');
  for (const agent of agents) {
    if (!agent.fm) { errors.push(`agents/${agent.file}: missing frontmatter`); continue; }
    const { name, description, tools, model } = agent.fm.values;
    if (name !== agent.id) errors.push(`agents/${agent.file}: name "${name}" must match filename`);
    if (!namePattern.test(agent.id)) errors.push(`agents/${agent.file}: name must use the qz- prefix`);
    if (!description) errors.push(`agents/${agent.file}: missing description`);
    if (!tools) errors.push(`agents/${agent.file}: missing tools`);
    if (!model) errors.push(`agents/${agent.file}: missing model`);
  }

  if (!skills.length) errors.push('no skills found');
  for (const skill of skills) {
    if (!skill.source) { errors.push(`skills/${skill.dir}: missing SKILL.md`); continue; }
    if (!skill.fm) { errors.push(`skills/${skill.dir}/SKILL.md: missing frontmatter`); continue; }
    const { name, description } = skill.fm.values;
    if (name !== skill.id) errors.push(`skills/${skill.dir}: name "${name}" must match directory`);
    if (!namePattern.test(skill.id)) errors.push(`skills/${skill.dir}: name must use the qz- prefix`);
    if (!description || /^[|>]/.test(description)) {
      errors.push(`skills/${skill.dir}: description must be an inline scalar`);
    }
    if (!/## When to Activate/.test(skill.fm.body)) errors.push(`skills/${skill.dir}: missing "When to Activate" section`);
    for (const ref of skill.fm.body.matchAll(/`(templates\/[\w./-]+)`/g)) {
      if (!fs.existsSync(path.join(packDir, 'skills', skill.dir, ref[1]))) {
        errors.push(`skills/${skill.dir}: referenced ${ref[1]} does not exist`);
      }
    }
  }

  for (const command of commands) {
    if (!command.fm || !command.fm.values.description) errors.push(`commands/${command.file}: missing description`);
    if (!namePattern.test(command.id)) errors.push(`commands/${command.file}: name must use the qz- prefix`);
  }

  // Every agent/skill a pack file mentions by qz- name must exist.
  const known = new Set([...agents.map(a => a.id), ...skills.map(s => s.id), ...commands.map(c => c.id)]);
  for (const doc of [...agents, ...skills, ...commands]) {
    for (const ref of (doc.source || '').matchAll(/`\/?(qz-[a-z0-9-]+)`/g)) {
      if (!known.has(ref[1])) errors.push(`${doc.file || doc.dir}: references unknown "${ref[1]}"`);
    }
  }

  // No collisions with engine names (both plugins install side by side).
  const engineNames = new Set([
    ...listFiles(path.join(engineDir, 'agents'), '.md').map(f => path.basename(f, '.md')),
    ...listDirs(path.join(engineDir, 'skills')),
    ...listFiles(path.join(engineDir, 'commands'), '.md').map(f => path.basename(f, '.md'))
  ]);
  for (const name of known) {
    if (engineNames.has(name)) errors.push(`"${name}" collides with an engine agent/skill/command`);
  }

  const marketplacePath = path.join(root, '.claude-plugin', 'marketplace.json');
  try {
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
    for (const plugin of marketplace.plugins || []) {
      const source = path.join(root, plugin.source);
      const pluginJson = path.join(source, '.claude-plugin', 'plugin.json');
      if (!fs.existsSync(pluginJson)) {
        errors.push(`marketplace.json: "${plugin.name}" source has no .claude-plugin/plugin.json`);
        continue;
      }
      const manifest = JSON.parse(fs.readFileSync(pluginJson, 'utf8'));
      if (manifest.name !== plugin.name) {
        errors.push(`marketplace.json: "${plugin.name}" does not match plugin.json name "${manifest.name}"`);
      }
      if (plugin.version && manifest.version && plugin.version !== manifest.version) {
        errors.push(`marketplace.json: "${plugin.name}" version ${plugin.version} != plugin.json ${manifest.version}`);
      }
    }
  } catch (err) {
    errors.push(`marketplace.json: ${err.message}`);
  }

  return { errors, counts: { agents: agents.length, skills: skills.length, commands: commands.length } };
}

function copyDir(src, dest, ops) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to, ops);
    else ops.push({ from, to });
  }
}

function kiroSteering(pack) {
  const rows = pack.commands.map(c => `| \`${c.id}\` | ${c.fm.values.description} |`).join('\n');
  const workflows = pack.commands
    .map(c => `## Workflow: ${c.id}\n\n${c.fm.body.replace(/^# .*\r?\n+/, '').replace(/\$ARGUMENTS/g, "the user's input").trim()}`)
    .join('\n\n');
  return `---\ninclusion: always\n---\n\n# Qualizeal QE Pack\n\nKiro has no slash commands, so ask for a workflow by name (for example\n"run qz-stlc on docs/spec.md"). Follow the \`qz-stlc-orchestration\` skill and\nwrite artifacts under \`qa/\`.\n\n| Workflow | What it does |\n| --- | --- |\n${rows}\n\n${workflows}\n`;
}

function planInstall(target, dest, pack = loadPack()) {
  const ops = [];
  const writes = [];
  if (target === 'claude') {
    for (const a of pack.agents) ops.push({ from: path.join(PACK, 'agents', a.file), to: path.join(dest, '.claude', 'agents', a.file) });
    for (const c of pack.commands) ops.push({ from: path.join(PACK, 'commands', c.file), to: path.join(dest, '.claude', 'commands', c.file) });
    for (const s of pack.skills) copyDir(path.join(PACK, 'skills', s.dir), path.join(dest, '.claude', 'skills', s.dir), ops);
  } else if (target === 'kiro') {
    for (const a of pack.agents) {
      const { name, description } = a.fm.values;
      const config = {
        name,
        description,
        tools: ['@builtin'],
        allowedTools: ['fs_read'],
        resources: [],
        prompt: a.fm.body.trim()
      };
      writes.push({ to: path.join(dest, '.kiro', 'agents', `${name}.json`), content: `${JSON.stringify(config, null, 2)}\n` });
    }
    for (const s of pack.skills) copyDir(path.join(PACK, 'skills', s.dir), path.join(dest, '.kiro', 'skills', s.dir), ops);
    writes.push({ to: path.join(dest, '.kiro', 'steering', 'qualizeal-qe.md'), content: kiroSteering(pack) });
  } else if (target === 'codex') {
    for (const s of pack.skills) copyDir(path.join(PACK, 'skills', s.dir), path.join(dest, '.agents', 'skills', s.dir), ops);
  } else {
    throw new Error(`Unknown target "${target}". Use one of: ${TARGETS.join(', ')}`);
  }
  return [
    ...ops.map(op => ({ to: op.to, content: () => fs.readFileSync(op.from) })),
    ...writes.map(w => ({ to: w.to, content: () => w.content }))
  ];
}

function install({ target, dest, force = false, dryRun = false }) {
  const plan = planInstall(target, path.resolve(dest));
  const result = { written: [], skipped: [] };
  for (const item of plan) {
    if (fs.existsSync(item.to) && !force) { result.skipped.push(item.to); continue; }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(item.to), { recursive: true });
      fs.writeFileSync(item.to, item.content());
    }
    result.written.push(item.to);
  }
  return result;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force' || arg === '--dry-run') args[arg.slice(2)] = true;
    else if (arg.startsWith('--')) args[arg.slice(2)] = argv[++i];
    else args._.push(arg);
  }
  return args;
}

function main(argv) {
  const args = parseArgs(argv);
  const [command] = args._;
  if (command === 'validate') {
    const { errors, counts } = validate();
    if (errors.length) {
      errors.forEach(e => console.error(`  x ${e}`));
      console.error(`\nQualizeal QE pack: ${errors.length} problem(s)`);
      return 1;
    }
    console.log(`Qualizeal QE pack OK - ${counts.agents} agents, ${counts.skills} skills, ${counts.commands} commands`);
    return 0;
  }
  if (command === 'install') {
    if (!TARGETS.includes(args.target)) {
      console.error(`--target is required: ${TARGETS.join(' | ')}`);
      return 1;
    }
    const dest = args.dest || process.cwd();
    const { written, skipped } = install({ target: args.target, dest, force: args.force, dryRun: args['dry-run'] });
    const verb = args['dry-run'] ? 'Would write' : 'Wrote';
    console.log(`${verb} ${written.length} file(s) for ${args.target} into ${path.resolve(dest)}`);
    if (skipped.length) console.log(`Skipped ${skipped.length} existing file(s); re-run with --force to overwrite`);
    return 0;
  }
  console.log('Usage:\n  node scripts/qz.js validate\n  node scripts/qz.js install --target claude|kiro|codex [--dest <dir>] [--force] [--dry-run]');
  return command ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { parseFrontmatter, loadPack, validate, planInstall, install, main };
