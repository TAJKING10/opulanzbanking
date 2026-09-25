/**
 * Automated test script to verify the no-unsafe-sql rule correctly identifies
 * SQL injection patterns while allowing safe parameterized patterns.
 */

const { Linter } = require('eslint');
const rule = require('../eslint-rules/no-unsafe-sql');

const linter = new Linter();
linter.defineRule('no-unsafe-sql', rule);

const config = {
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest' },
  rules: { 'no-unsafe-sql': 'error' },
};

const testCases = [
  // --- UNSAFE CASES (Must be caught) ---
  {
    name: 'Unsafe: Direct string concatenation in pool.query()',
    code: "pool.query('SELECT * FROM users WHERE id = ' + userId);",
    shouldFail: true,
  },
  {
    name: 'Unsafe: Template literal with user variable in pool.query()',
    code: 'pool.query(`SELECT * FROM users WHERE email = "${userEmail}"`);',
    shouldFail: true,
  },
  {
    name: 'Unsafe: String concatenation in query variable',
    code: "let query = 'SELECT * FROM users'; query += ' WHERE role = ' + role;",
    shouldFail: true,
  },
  {
    name: 'Unsafe: Template literal in query variable',
    code: 'let query = "SELECT * FROM users"; query += ` WHERE status = "${status}"`;',
    shouldFail: true,
  },
  {
    name: 'Unsafe: Direct interpolation of req.query',
    code: 'pool.query(`SELECT * FROM applications WHERE type = "${req.query.type}"`);',
    shouldFail: true,
  },

  // --- SAFE CASES (Must pass cleanly) ---
  {
    name: 'Safe: Parameterized query with array',
    code: "pool.query('SELECT * FROM users WHERE id = $1', [userId]);",
    shouldFail: false,
  },
  {
    name: 'Safe: Dynamic query building with $paramIndex',
    code: `
      let query = 'SELECT * FROM users WHERE 1=1';
      if (email) {
        query += \` AND email = $\${paramIndex}\`;
        params.push(email);
        paramIndex++;
      }
      query += \` ORDER BY created_at DESC LIMIT $\${paramIndex} OFFSET $\${paramIndex + 1}\`;
    `,
    shouldFail: false,
  },
  {
    name: 'Safe: Parameterized UPDATE with updates.join',
    code: 'const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`;',
    shouldFail: false,
  },
  {
    name: 'Safe: params.length interpolation for parameter placeholder',
    code: 'query += ` WHERE status = $${params.length}`;',
    shouldFail: false,
  },
  {
    name: 'Safe: params.length + 1 pagination placeholder',
    code: 'query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;',
    shouldFail: false,
  },
];

console.log('🧪 Running SQL Injection Static Rule Verification...\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const messages = linter.verify(tc.code, config);
  const hasErrors = messages.some(m => m.severity === 2);

  if (tc.shouldFail && hasErrors) {
    console.log(`✅ [CAUGHT UNSAFE] ${tc.name}`);
    console.log(`   Message: ${messages[0].message}`);
    passed++;
  } else if (!tc.shouldFail && !hasErrors) {
    console.log(`✅ [ALLOWED SAFE]  ${tc.name}`);
    passed++;
  } else if (tc.shouldFail && !hasErrors) {
    console.error(`❌ [MISSED VULNERABILITY] ${tc.name}`);
    failed++;
  } else {
    console.error(`❌ [FALSE POSITIVE] ${tc.name}`);
    console.error(`   Message: ${messages.map(m => m.message).join(', ')}`);
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

process.exit(failed > 0 ? 1 : 0);
