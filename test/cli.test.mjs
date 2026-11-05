import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { agentTools } from '../src/agent-tools.mjs';
import { parseArguments } from '../cli.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('help lists every studio tool', () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'cli.mjs'), 'help'], {
    encoding: 'utf8',
    env: { ...process.env, GAME_TRAILER_STUDIO_DATA_ROOT: path.join(ROOT, '.studio-data', 'cli-test') },
  });
  assert.equal(result.status, 0, result.stderr);
  const line = result.stdout.split('\n').find(item => item.startsWith('Agent/editor interface:'));
  assert.ok(line, 'help must print the studio interface line');
  const listed = line.slice(line.indexOf('studio ') + 'studio '.length).split(' ')[0].split('|');
  for (const { name } of agentTools) {
    assert.ok(listed.includes(name.replace(/^studio_/, '')), `${name} is missing from help`);
  }
});

test('parseArguments keeps everything after the first = in a flag value', () => {
  const { flags, positional } = parseArguments([
    '--title=Score=100',
    '--query=a=b=c',
    '--x', 'v',
    '--y=z',
    '--no-cache',
    '--empty=',
    'tail',
  ]);
  assert.equal(flags.title, 'Score=100');
  assert.equal(flags.query, 'a=b=c');
  assert.equal(flags.x, 'v');
  assert.equal(flags.y, 'z');
  assert.equal(flags.cache, false);
  assert.equal(flags.empty, '');
  assert.deepEqual(positional, ['tail']);
});
