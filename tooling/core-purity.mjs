import path from 'node:path';
import { fileURLToPath } from 'node:url';

const coreRoot = fileURLToPath(new URL('../src/core/', import.meta.url));

const allowedMath = new Set([
  'abs',
  'ceil',
  'floor',
  'fround',
  'imul',
  'max',
  'min',
  'round',
  'sign',
  'sqrt',
  'trunc',
  'SQRT1_2',
]);

export const corePurity = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      boundary: 'Core may import only relative code modules inside src/core.',
      dynamic: 'Use static ES module imports in core.',
      math: 'Use a directly named, approved Math member in core.',
      power: 'Exponentiation is forbidden in core.',
      order: 'Use an explicit deterministic iteration order in core.',
    },
  },

  create(context) {
    const directory = path.dirname(context.filename);

    function checkSource(node) {
      if (!node.source) return;

      const specifier = node.source.value;
      const relativeImport =
        typeof specifier === 'string' &&
        (specifier.startsWith('./') || specifier.startsWith('../'));

      if (
        !relativeImport ||
        /[\\?#]/u.test(specifier) ||
        specifier.endsWith('.json')
      ) {
        context.report({ node: node.source, messageId: 'boundary' });
        return;
      }

      const target = path.resolve(directory, specifier);
      const relative = path.relative(coreRoot, target);

      if (
        relative === '..' ||
        relative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relative)
      ) {
        context.report({ node: node.source, messageId: 'boundary' });
      }
    }

    return {
      ImportDeclaration: checkSource,
      ExportNamedDeclaration: checkSource,
      ExportAllDeclaration: checkSource,
      TSImportType: checkSource,

      'ImportExpression, TSImportEqualsDeclaration'(node) {
        context.report({ node, messageId: 'dynamic' });
      },

      "Identifier[name='Math']"(node) {
        const parent = node.parent;
        const approved =
          parent.type === 'MemberExpression' &&
          parent.object === node &&
          !parent.computed &&
          parent.property.type === 'Identifier' &&
          allowedMath.has(parent.property.name);

        if (!approved) {
          context.report({ node, messageId: 'math' });
        }
      },

      "BinaryExpression[operator='**'], AssignmentExpression[operator='**=']"(
        node,
      ) {
        context.report({ node, messageId: 'power' });
      },

      ForInStatement(node) {
        context.report({ node, messageId: 'order' });
      },
    };
  },
};
