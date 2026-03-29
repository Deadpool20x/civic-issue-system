import { ESLint } from 'eslint';
import { writeFileSync } from 'fs';

(async function main() {
  try {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['app/**/*.js', 'lib/**/*.js', 'components/**/*.js', 'models/**/*.js']);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = await formatter.format(results);
    writeFileSync('eslint_results.txt', resultText);
    console.log('Linting complete');
  } catch(e) {
    writeFileSync('eslint_results.txt', e.toString());
  }
})();
