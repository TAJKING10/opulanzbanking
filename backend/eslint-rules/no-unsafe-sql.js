/**
 * Custom ESLint Rule: no-unsafe-sql
 *
 * Prevents SQL Injection vulnerabilities by flagging:
 * 1. String concatenation (+) in SQL query calls or query variable assignments
 * 2. Template literal interpolation (${...}) with non-parameter expressions in SQL queries
 *
 * Allows safe parameter index interpolation such as:
 * - $${paramIndex}, $${paramIndex + 1}
 * - $${paramCount}
 * - $${countIndex}, $${countIndex + 1}
 * - $${params.length + 1}, $${params.length + 2}
 * - ${updates.join(', ')} (when building parameterized UPDATE sets)
 * - ${where} (when building parameterized WHERE clauses)
 * - ${narviIdField} (internal hardcoded column toggle)
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw string concatenation and unsafe interpolation in SQL queries',
      category: 'Security',
      recommended: true,
    },
    messages: {
      unsafeConcat: 'Unsafe SQL: Avoid string concatenation (+) in database queries. Use parameterized queries ($1, $2, ...) instead.',
      unsafeInterpolation: 'Unsafe SQL: Avoid interpolating dynamic expression "{{name}}" directly into SQL query. Use parameterized queries ($1, $2, ...) instead.',
    },
    schema: [],
  },

  create(context) {
    const SAFE_IDENTIFIERS = new Set([
      'paramindex',
      'paramcount',
      'countindex',
      'where',
      'narviidfield',
    ]);

    function isSafeExpression(exprNode) {
      if (!exprNode) return false;

      // Simple identifier: paramIndex, countIndex, etc.
      if (exprNode.type === 'Identifier') {
        return SAFE_IDENTIFIERS.has(exprNode.name.toLowerCase());
      }

      // MemberExpression: params.length, countParams.length
      if (exprNode.type === 'MemberExpression') {
        const obj = (exprNode.object.name || '').toLowerCase();
        const prop = (exprNode.property.name || '').toLowerCase();
        if ((obj === 'params' || obj === 'countparams') && prop === 'length') {
          return true;
        }
      }

      // BinaryExpression with '+' (e.g., paramIndex + 1, params.length + 1)
      if (exprNode.type === 'BinaryExpression' && exprNode.operator === '+') {
        const leftIsSafe = isSafeExpression(exprNode.left);
        const rightIsLiteralNumber =
          exprNode.right.type === 'Literal' && typeof exprNode.right.value === 'number';
        if (leftIsSafe && rightIsLiteralNumber) {
          return true;
        }
      }

      // CallExpression: updates.join(', ')
      if (exprNode.type === 'CallExpression') {
        if (
          exprNode.callee.type === 'MemberExpression' &&
          exprNode.callee.property.name === 'join' &&
          (exprNode.callee.object.name === 'updates' || exprNode.callee.object.name === 'conditions')
        ) {
          return true;
        }
      }

      return false;
    }

    function checkSqlNode(node, reportNode) {
      if (!node) return;

      // 1. Check for BinaryExpression with '+'
      if (node.type === 'BinaryExpression' && node.operator === '+') {
        const leftIsLiteral = node.left.type === 'Literal';
        const rightIsLiteral = node.right.type === 'Literal';
        if (!leftIsLiteral || !rightIsLiteral) {
          context.report({
            node: reportNode || node,
            messageId: 'unsafeConcat',
          });
          return;
        }
      }

      // 2. Check for TemplateLiteral
      if (node.type === 'TemplateLiteral') {
        for (const expr of node.expressions) {
          if (!isSafeExpression(expr)) {
            const sourceCode = context.getSourceCode();
            const exprText = sourceCode.getText(expr);
            context.report({
              node: expr,
              messageId: 'unsafeInterpolation',
              data: { name: exprText },
            });
          }
        }
      }
    }

    function isQueryCall(node) {
      if (!node.callee) return false;
      if (node.callee.type === 'MemberExpression') {
        const prop = node.callee.property.name;
        const obj = node.callee.object.name;
        return (
          prop === 'query' &&
          (!obj || ['pool', 'client', 'db', 'runner', 'm'].includes(obj))
        );
      }
      return false;
    }

    const QUERY_VAR_NAMES = new Set(['query', 'countquery', 'sql', 'text']);

    return {
      CallExpression(node) {
        if (isQueryCall(node) && node.arguments.length > 0) {
          const firstArg = node.arguments[0];
          checkSqlNode(firstArg, firstArg);
        }
      },

      AssignmentExpression(node) {
        if (node.left.type === 'Identifier') {
          const varName = node.left.name.toLowerCase();
          if (QUERY_VAR_NAMES.has(varName)) {
            checkSqlNode(node.right, node);
          }
        }
      },

      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') {
          const varName = node.id.name.toLowerCase();
          if (QUERY_VAR_NAMES.has(varName) && node.init) {
            checkSqlNode(node.init, node);
          }
        }
      },
    };
  },
};
