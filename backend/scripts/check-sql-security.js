/**
 * Static Analysis Security Script: Check for SQL Injection Risks
 *
 * Scans backend source code using ESLint and custom AST rules to prevent:
 * - Direct string concatenation (+) into SQL queries
 * - Unsafe template literal interpolation (${...}) into SQL queries
 *
 * Usage:
 *   node scripts/check-sql-security.js
 *   npm run security:sql
 */

const path = require('path');
const { ESLint } = require('eslint');

async function main() {
  console.log('\n🔒 ========================================================');
  console.log('   Opulanz DevOps Backend - SQL Injection Security Scanner  ');
  console.log('========================================================\n');

  const backendDir = path.resolve(__dirname, '..');
  const eslint = new ESLint({
    cwd: backendDir,
    overrideConfigFile: path.join(backendDir, '.eslintrc.js'),
    rulePaths: [path.join(backendDir, 'eslint-rules')],
  });

  const patterns = ['src/**/*.js'];
  console.log(`📁 Scanning patterns: ${patterns.join(', ')}`);

  const results = await eslint.lintFiles(patterns);

  let errorCount = 0;
  let warningCount = 0;
  let filesScanned = results.length;
  let filesWithIssues = 0;

  for (const fileResult of results) {
    if (fileResult.errorCount > 0 || fileResult.warningCount > 0) {
      filesWithIssues++;
      errorCount += fileResult.errorCount;
      warningCount += fileResult.warningCount;

      const relPath = path.relative(backendDir, fileResult.filePath);
      console.log(`\n❌ Issues found in: ${relPath}`);

      for (const msg of fileResult.messages) {
        const severity = msg.severity === 2 ? 'ERROR' : 'WARN';
        console.log(`   [Line ${msg.line}:${msg.column}] [${severity}] ${msg.message}`);
        if (msg.ruleId) {
          console.log(`     Rule: ${msg.ruleId}`);
        }
      }
    }
  }

  console.log('\n--------------------------------------------------------');
  console.log(`📊 Scan Summary:`);
  console.log(`   Files scanned:       ${filesScanned}`);
  console.log(`   Files with issues:   ${filesWithIssues}`);
  console.log(`   Errors found:        ${errorCount}`);
  console.log(`   Warnings:            ${warningCount}`);
  console.log('--------------------------------------------------------');

  if (errorCount > 0) {
    console.error('\n🚨 FAILED: SQL security check failed! Please fix the errors above.\n');
    process.exit(1);
  } else {
    console.log('\n✅ PASSED: All database queries adhere to safe parameterized patterns!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error during SQL security check:', err);
  process.exit(1);
});
