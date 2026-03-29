import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  console.log('Running build...');
  const output = execSync('npx.cmd next build', { encoding: 'utf-8', stdio: 'pipe' });
  writeFileSync('build_log.txt', output);
  console.log('Build succeeded.');
} catch (error) {
  writeFileSync('build_log.txt', error.output ? error.output.join('\n') : error.message);
  console.error('Build failed.');
}
