import type { Expression, Node, Program } from 'estree';

// next-mdx-remote v6 drops every `prop={...}` attribute in a remark step (blockJS).
// remarkMdxLiteralProps runs before that step and stores attributes whose expression
// is pure data (literals, arrays, plain objects, number arithmetic, `constants.<name>`)
// as JSON strings. rehypeMdxLiteralProps runs after it and turns those strings back
// into literal expressions built from the parsed JSON, so no author code is kept.
// Anything else (identifiers, calls, member chains) is still removed by blockJS.

export const LITERAL_PROPS_ATTRIBUTE = 'data-mdx-literal-props';

type MdxAttribute = {
  type: string;
  name?: string;
  value?: string | null | { type: string; value?: string; data?: { estree?: Program | null } };
};
type MdxNode = { type: string; attributes?: MdxAttribute[]; children?: MdxNode[] };

const INVALID = Symbol('invalid');

const evaluate = (node: Node, constants: Record<string, unknown>): unknown => {
  switch (node.type) {
    case 'Literal':
      return node.value === null || ['string', 'number', 'boolean'].includes(typeof node.value) ? node.value : INVALID;
    case 'TemplateLiteral':
      return node.expressions.length === 0 ? node.quasis.map((quasi) => quasi.value.cooked ?? '').join('') : INVALID;
    case 'UnaryExpression': {
      const value = evaluate(node.argument, constants);
      if (typeof value !== 'number') return INVALID;
      return node.operator === '-' ? -value : node.operator === '+' ? value : INVALID;
    }
    case 'BinaryExpression': {
      const a = node.left.type === 'PrivateIdentifier' ? INVALID : evaluate(node.left, constants);
      const b = evaluate(node.right, constants);
      if (typeof a !== 'number' || typeof b !== 'number') return INVALID;
      if (node.operator === '+') return a + b;
      if (node.operator === '-') return a - b;
      if (node.operator === '*') return a * b;
      if (node.operator === '/') return a / b;
      return INVALID;
    }
    case 'MemberExpression': {
      const { object, property } = node;
      if (node.computed || object.type !== 'Identifier' || object.name !== 'constants' || property.type !== 'Identifier') {
        return INVALID;
      }
      const value = Object.prototype.hasOwnProperty.call(constants, property.name) ? constants[property.name] : undefined;
      return typeof value === 'number' || typeof value === 'string' ? value : INVALID;
    }
    case 'ArrayExpression': {
      const values = node.elements.map((element) =>
        element && element.type !== 'SpreadElement' ? evaluate(element, constants) : INVALID,
      );
      return values.includes(INVALID) ? INVALID : values;
    }
    case 'ObjectExpression': {
      const result: Record<string, unknown> = {};
      for (const property of node.properties) {
        if (property.type !== 'Property' || property.computed || property.kind !== 'init' || property.method) return INVALID;
        const { key } = property;
        const name = key.type === 'Identifier' ? key.name : key.type === 'Literal' ? key.value : undefined;
        if (typeof name !== 'string' && typeof name !== 'number') return INVALID;
        const value = evaluate(property.value, constants);
        if (value === INVALID) return INVALID;
        result[String(name)] = value;
      }
      return result;
    }
    default:
      return INVALID;
  }
};

const encodeAttributes = (node: MdxNode, constants: Record<string, unknown>) => {
  if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.attributes) {
    const encoded: string[] = [];
    node.attributes.forEach((attribute) => {
      const { value } = attribute;
      if (attribute.type !== 'mdxJsxAttribute' || !attribute.name || !value || typeof value === 'string') return;
      const body = value.data?.estree?.body;
      const statement = body?.length === 1 ? body[0] : undefined;
      if (statement?.type !== 'ExpressionStatement') return;
      const evaluated = evaluate(statement.expression, constants);
      if (evaluated === INVALID) return;
      attribute.value = JSON.stringify(evaluated);
      encoded.push(attribute.name);
    });
    if (encoded.length > 0) {
      node.attributes.push({ type: 'mdxJsxAttribute', name: LITERAL_PROPS_ATTRIBUTE, value: encoded.join(',') });
    }
  }
  node.children?.forEach((child) => encodeAttributes(child, constants));
};

export const remarkMdxLiteralProps = (options: { constants?: Record<string, unknown> } = {}) => {
  const constants = options.constants ?? {};
  return (tree: MdxNode) => encodeAttributes(tree, constants);
};

const toEstree = (value: unknown): Expression => {
  if (Array.isArray(value)) {
    return { type: 'ArrayExpression', elements: value.map(toEstree) };
  }
  if (value !== null && typeof value === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(value).map(([key, item]) => ({
        type: 'Property',
        key: { type: 'Literal', value: key },
        value: toEstree(item),
        kind: 'init',
        computed: false,
        method: false,
        shorthand: false,
      })),
    };
  }
  if (typeof value === 'number' && (value < 0 || Object.is(value, -0))) {
    return { type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: -value } };
  }
  return { type: 'Literal', value: value as string | number | boolean | null };
};

const restoreAttributes = (node: MdxNode) => {
  const marker = node.attributes?.find((attribute) => attribute.name === LITERAL_PROPS_ATTRIBUTE);
  if (node.attributes && marker && typeof marker.value === 'string') {
    const names = new Set(marker.value.split(','));
    node.attributes = node.attributes.filter((attribute) => attribute !== marker);
    node.attributes.forEach((attribute) => {
      if (!attribute.name || !names.has(attribute.name) || typeof attribute.value !== 'string') return;
      const source = attribute.value;
      const expression = toEstree(JSON.parse(source));
      attribute.value = {
        type: 'mdxJsxAttributeValueExpression',
        value: source,
        data: { estree: { type: 'Program', sourceType: 'module', body: [{ type: 'ExpressionStatement', expression }] } },
      };
    });
  }
  node.children?.forEach(restoreAttributes);
};

export const rehypeMdxLiteralProps = () => (tree: MdxNode) => restoreAttributes(tree);
