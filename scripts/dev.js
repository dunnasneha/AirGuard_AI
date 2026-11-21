import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Starting AirWise AI Full-Stack Platform...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Start Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

// 2. Start Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

function cleanup() {
  console.log('\nGracefully shutting down AirWise AI services...');
  serverProcess.kill('SIGINT');
  clientProcess.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
