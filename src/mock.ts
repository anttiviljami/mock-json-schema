import _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';

export type SchemaLike = OpenAPIV3.SchemaObject;

export function mock(schema: SchemaLike): any {
  // allOf, merge all subschemas
  if (schema.allOf && schema.allOf[0]) {
    schema = _.reduce(schema.allOf, (combined, subschema: SchemaLike) => _.merge(combined, subschema), schema);
  }

  // use specified example
  if (schema.example !== undefined) {
    return schema.example;
  }

  // use default
  if (schema.default !== undefined) {
    return schema.default;
  }

  // oneOf, use first
  if (schema.oneOf && schema.oneOf[0]) {
    return mock(schema.oneOf[0] as SchemaLike);
  }

  // anyOf, use first
  if (schema.anyOf && schema.anyOf[0]) {
    return mock(schema.anyOf[0] as SchemaLike);
  }

  // get type, use first if array
  const type = _.isArray(schema) ? _.first(schema.type) : schema.type;

  if (type === 'object') {
    const obj = schema as OpenAPIV3.NonArraySchemaObject;
    const { properties } = obj;
    if (!properties) {
      return {};
    }
    return _.mapValues(properties, mock);
  }

  if (type === 'array') {
    const array = schema as OpenAPIV3.ArraySchemaObject;
    const items = array.items as SchemaLike;
    if (!items) {
      return [];
    }
    const examples = [];
    let example = ((items.oneOf && items.oneOf[0]) || items) as SchemaLike;
    if (items.anyOf) {
      // include one of each example for anyOf and allOf
      for (const option of items.anyOf) {
        example = option as SchemaLike;
        examples.push(mock(example));
      }
    }
    // if minItems is set make sure we have at least that many items
    const minItems = array.minItems || 1;
    while (examples.length < minItems) {
      examples.push(mock(example));
    }
    // limit to max items if applicable
    return array.maxItems ? _.take(examples, array.maxItems) : examples;
  }

  if (_.isArray(schema.enum)) {
    return schema.enum[0];
  }

  if (type === 'string') {
    const { format } = schema;
    const formatExamples: { [format: string]: string } = {
      email: 'user@example.com',
      hostname: 'example.com',
      ipv4: '8.8.8.8',
      ipv6: '2001:4860:4860::8888',
      uri: 'https://example.com/path',
      'uri-reference': '/path#anchor',
      'uri-template': '/path/{param}',
      'json-pointer': '/foo/bar',
      'date-time': new Date('1970-01-01').toJSON(),
      uuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      _default: 'string',
    };
    const val = formatExamples[format] || formatExamples._default;
    const minln = !_.isNil(schema.minLength) ? schema.minLength : 0;
    const maxln = !_.isNil(schema.maxLength) ? schema.maxLength : val.length;
    if (val === formatExamples._default && val.length < minln) {
      return _.padEnd(val, minln, val);
    }
    return val.substr(0, _.clamp(val.length, minln, maxln));
  }

  if (type === 'number') {
    let min = schema.minimum ? schema.minimum : -Number.MAX_VALUE;
    let max = schema.maximum ? schema.maximum : Number.MAX_VALUE;
    if (schema.multipleOf) {
      min = Math.ceil(min / schema.multipleOf) * schema.multipleOf;
      max = Math.floor(max / schema.multipleOf) * schema.multipleOf;
    }
    return _.clamp(0, min, max);
  }

  if (type === 'integer') {
    const schemaMin = schema.minimum && schema.exclusiveMinimum ? schema.minimum + 1 : schema.minimum;
    const schemaMax = schema.maximum && schema.exclusiveMaximum ? schema.maximum - 1 : schema.maximum;
    let min = !_.isNil(schemaMin) ? schemaMin : Number.MIN_SAFE_INTEGER;
    let max = !_.isNil(schemaMax) ? schemaMax : Number.MAX_SAFE_INTEGER;
    if (schema.multipleOf) {
      min = Math.ceil(min / schema.multipleOf) * schema.multipleOf;
      max = Math.floor(max / schema.multipleOf) * schema.multipleOf;
    }
    return _.clamp(0, min, max);
  }

  if (type === 'null') {
    return null;
  }

  if (type === 'boolean') {
    return true;
  }

  // unknown type
  return {};
}
