import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const processes = [
  {
    name: 'API',
    args: [path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'watch', 'src/index.ts'],
    cwd: path.join(root, 'server'),
  },
  {
    name: 'Web',
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port=3000', '--host=0.0.0.0'],
    cwd: root,
  },
];

let stopping = false;
const children = processes.map(({ name, args, cwd }) => {
  const child = spawn(process.execPath, args, { cwd, stdio: 'inherit' });
  child.on('error', error => {
    console.error(`${name} process failed:`, error);
    stop(1);
  });
  child.on('exit', code => {
    if (!stopping) stop(code ?? 1);
  });
  return child;
});

function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
