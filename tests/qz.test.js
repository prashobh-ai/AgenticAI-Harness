'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { validate, install, parseFrontmatter, main } = require('../scripts/qz');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qz-test-'));
}

test('the Qualizeal QE pack validates cleanly', () => {
  const { errors, counts } = validate();
  assert.deepEqual(errors, []);
  assert.ok(counts.agents >= 7 && counts.skills >= 8 && counts.commands >= 8);
});

test('parseFrontmatter reads inline keys and the body', () => {
  const parsed = parseFrontmatter('---\nname: qz-x\ndescription: Does x.\n---\n\n# Body\n');
  assert.equal(parsed.values.name, 'qz-x');
  assert.equal(parsed.values.description, 'Does x.');
  assert.match(parsed.body, /# Body/);
  assert.equal(parseFrontmatter('# no frontmatter'), null);
});

test('validate reports a skill whose name does not match its directory', () => {
  const root = tmpDir();
  const pack = path.join(root, 'qualizeal-qe');
  fs.mkdirSync(path.join(pack, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(pack, 'skills', 'qz-alpha'), { recursive: true });
  fs.writeFileSync(path.join(pack, '.claude-plugin', 'plugin.json'), '{"name":"qualizeal-qe","version":"0.0.1","description":"x"}');
  fs.writeFileSync(path.join(pack, 'skills', 'qz-alpha', 'SKILL.md'), '---\nname: qz-beta\ndescription: x\n---\n## When to Activate\n');
  const { errors } = validate({ root, packDir: pack, engineDir: path.join(root, 'engine') });
  assert.ok(errors.some(e => e.includes('must match directory')), errors.join('\n'));
  assert.ok(errors.some(e => e.includes('no agents found')));
});

test('install --target claude writes agents, commands, and skills', () => {
  const dest = tmpDir();
  const { written, skipped } = install({ target: 'claude', dest });
  assert.equal(skipped.length, 0);
  assert.ok(fs.existsSync(path.join(dest, '.claude', 'agents', 'qz-test-designer.md')));
  assert.ok(fs.existsSync(path.join(dest, '.claude', 'commands', 'qz-stlc.md')));
  assert.ok(fs.existsSync(path.join(dest, '.claude', 'skills', 'qz-stlc-orchestration', 'templates', 'defect-report.md')));

  const again = install({ target: 'claude', dest });
  assert.equal(again.written.length, 0, 'second install must not overwrite without --force');
  assert.equal(again.skipped.length, written.length);
});

test('install --target kiro emits valid agent JSON and a steering file', () => {
  const dest = tmpDir();
  install({ target: 'kiro', dest });
  const agent = JSON.parse(fs.readFileSync(path.join(dest, '.kiro', 'agents', 'qz-defect-triager.json'), 'utf8'));
  assert.equal(agent.name, 'qz-defect-triager');
  assert.match(agent.prompt, /Qualizeal Defect Triager/);
  assert.doesNotMatch(agent.prompt, /^---/);
  const steering = fs.readFileSync(path.join(dest, '.kiro', 'steering', 'qualizeal-qe.md'), 'utf8');
  assert.match(steering, /Workflow: qz-stlc/);
  assert.doesNotMatch(steering, /\$ARGUMENTS/);
});

test('install --dry-run writes nothing', () => {
  const dest = tmpDir();
  const { written } = install({ target: 'codex', dest, dryRun: true });
  assert.ok(written.length > 0);
  assert.equal(fs.existsSync(path.join(dest, '.agents')), false);
});

test('install rejects unknown targets', () => {
  assert.throws(() => install({ target: 'vim', dest: tmpDir() }), /Unknown target/);
  assert.equal(main(['install', '--target', 'vim']), 1);
});
