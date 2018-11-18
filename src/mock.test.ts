import { mock, SchemaLike } from './index';

describe('mock', () => {
  describe('null', () => {
    test('null primitive', () => {
      const schema: SchemaLike = {
        type: 'null',
      };
      expect(mock(schema)).toStrictEqual(null);
    });
  });

  describe('boolean', () => {
    test('boolean primitive', () => {
      const schema: SchemaLike = {
        type: 'boolean',
      };
      expect(mock(schema)).toStrictEqual(true);
    });

    test('boolean with default', () => {
      const schema: SchemaLike = {
        type: 'boolean',
        default: false,
      };
      expect(mock(schema)).toStrictEqual(false);
    });
  });

  describe('number', () => {
    test('number primitive', () => {
      const schema: SchemaLike = {
        type: 'number',
      };
      expect(mock(schema)).toStrictEqual(0);
    });

    test('number with minimum', () => {
      const schema: SchemaLike = {
        type: 'number',
        minimum: 3.14,
      };
      expect(mock(schema)).toStrictEqual(3.14);
    });

    test('number with maximum', () => {
      const schema: SchemaLike = {
        type: 'number',
        maximum: -14.4,
      };
      expect(mock(schema)).toStrictEqual(-14.4);
    });

    test('number with multipleOf', () => {
      const schema: SchemaLike = {
        type: 'number',
        multipleOf: 0.6,
        minimum: 1,
      };
      expect(mock(schema)).toStrictEqual(1.2);
    });
  });

  describe('integer', () => {
    test('integer primitive', () => {
      const schema: SchemaLike = {
        type: 'integer',
      };
      expect(mock(schema)).toStrictEqual(0);
    });

    test('integer with maximum', () => {
      const schema: SchemaLike = {
        type: 'integer',
        maximum: -1,
      };
      expect(mock(schema)).toStrictEqual(-1);
    });

    test('integer with maximum exclusiveMaximum=true', () => {
      const schema: SchemaLike = {
        type: 'integer',
        maximum: -1,
        exclusiveMaximum: true,
      };
      expect(mock(schema)).toStrictEqual(-2);
    });

    test('integer with minimum', () => {
      const schema: SchemaLike = {
        type: 'integer',
        minimum: 1,
      };
      expect(mock(schema)).toStrictEqual(1);
    });

    test('integer with minimum exclusiveMinimum=true', () => {
      const schema: SchemaLike = {
        type: 'integer',
        minimum: 1,
        exclusiveMinimum: true,
      };
      expect(mock(schema)).toStrictEqual(2);
    });

    test('integer with multipleOf', () => {
      const schema: SchemaLike = {
        type: 'integer',
        multipleOf: 5,
        minimum: 5,
        exclusiveMinimum: true,
      };
      expect(mock(schema)).toStrictEqual(10);
    });
  });

  describe('string', () => {
    test('string primitive', () => {
      const schema: SchemaLike = {
        type: 'string',
      };
      expect(mock(schema)).toStrictEqual('string');
    });

    test('string with maxLength', () => {
      const schema: SchemaLike = {
        type: 'string',
        maxLength: 3,
      };
      expect(mock(schema)).toStrictEqual('str');
    });

    test('string with minLength', () => {
      const schema: SchemaLike = {
        type: 'string',
        minLength: 9,
      };
      expect(mock(schema)).toStrictEqual('stringstr');
    });

    test('string with format', () => {
      const schema: SchemaLike = {
        type: 'string',
        format: 'date-time',
      };
      expect(mock(schema)).toStrictEqual(new Date('1970-01-01').toJSON());
    });

    test('string with enum', () => {
      const schema: SchemaLike = {
        type: 'string',
        enum: ['opt1', 'opt2'],
      };
      expect(mock(schema)).toStrictEqual('opt1');
    });
  });

  describe('object', () => {
    test('object primitive', () => {
      const schema: SchemaLike = {
        type: 'object',
      };
      expect(mock(schema)).toStrictEqual({});
    });

    test('object with properties', () => {
      const schema: SchemaLike = {
        type: 'object',
        properties: {
          numberProp: {
            type: 'number',
          },
          stringProp: {
            type: 'string',
          },
        },
      };
      expect(mock(schema)).toStrictEqual({ numberProp: 0, stringProp: 'string' });
    });

    test('object with nested properties', () => {
      const schema: SchemaLike = {
        type: 'object',
        properties: {
          child: {
            type: 'object',
            properties: {
              numberProp: {
                type: 'number',
              },
              stringProp: {
                type: 'string',
              },
            },
          },
        },
      };
      expect(mock(schema)).toStrictEqual({ child: { numberProp: 0, stringProp: 'string' } });
    });
  });

  describe('array', () => {
    test('array with items', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
        },
      };
      expect(mock(schema)).toStrictEqual(['string']);
    });

    test('array with minItems', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 3,
      };
      expect(mock(schema)).toStrictEqual(['string', 'string', 'string']);
    });

    test('array with oneOf', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          oneOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
      };
      expect(mock(schema)).toStrictEqual(['string1']);
    });

    test('array with allOf', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          allOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
      };
      expect(mock(schema)).toStrictEqual(['string1', 'string2']);
    });

    test('array with anyOf', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          anyOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
      };
      expect(mock(schema)).toStrictEqual(['string1', 'string2']);
    });

    test('array with anyOf + maxItems', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          anyOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
        maxItems: 1,
      };
      expect(mock(schema)).toStrictEqual(['string1']);
    });

    test('array with anyOf + minItems', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          anyOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
        minItems: 4,
      };
      expect(mock(schema)).toStrictEqual(['string1', 'string2', 'string2', 'string2']);
    });

    test('array with oneOf + minItems', () => {
      const schema: SchemaLike = {
        type: 'array',
        items: {
          type: 'string',
          oneOf: [
            {
              type: 'string',
              example: 'string1',
            },
            {
              type: 'string',
              example: 'string2',
            },
          ],
        },
        minItems: 4,
      };
      expect(mock(schema)).toStrictEqual(['string1', 'string1', 'string1', 'string1']);
    });
  });

  describe('anyOf', () => {
    test('anyOf with options', () => {
      const schema: SchemaLike = {
        type: 'object',
        anyOf: [
          {
            type: 'object',
            properties: {
              propA: {
                type: 'string',
                example: 'a',
              },
            },
          },
          {
            type: 'object',
            properties: {
              propB: {
                type: 'string',
                example: 'b',
              },
            },
          },
        ],
      };
      expect(mock(schema)).toStrictEqual({ propA: 'a' });
    });
  });

  describe('oneOf', () => {
    test('oneOf with options', () => {
      const schema: SchemaLike = {
        type: 'object',
        oneOf: [
          {
            type: 'object',
            properties: {
              propA: {
                type: 'string',
                example: 'a',
              },
            },
          },
          {
            type: 'object',
            properties: {
              propB: {
                type: 'string',
                example: 'b',
              },
            },
          },
        ],
      };
      expect(mock(schema)).toStrictEqual({ propA: 'a' });
    });
  });
});
