# json-schema-validator

[![CI](https://github.com/bpmn-io/json-schema-validator/workflows/CI/badge.svg)](https://github.com/bpmn-io/json-schema-validator/actions?query=workflow%3ACI)

Validate JSON based on [JSON Schema](https://json-schema.org/) files.

## Installation

```sh
$ npm i --save @bpmn-io/json-schema-validator
```

## Usage

Given
* an [example JSON schema](./test/fixtures/json-schema/schema.json)
* an [example JSON object](./test/fixtures/samples/invalid-name.json)

```js
import { Validator } from '@bpmn-io/json-schema-validator';

import schema from './test/fixtures/json-schema/schema.json';

import sample from './test/fixtures/samples/invalid-name.json';

const validator = new Validator({
  schema: schema
});

const {
  valid,
  errors
} = validator.validate(sample);

if (!valid) {
  console.error('Invalid JSON detected:', errors);
}

```

This will print detailed information about errors inside the sample

```json
[
  {
    "message": "must start with <number_>",
    "keyword": "errorMessage",
    "dataPath": "/properties/0/name",
    "dataPointer": {
      "key": { "line": 5, "column": 6, "pos": 97 },
      "keyEnd": { "line": 5, "column": 12, "pos": 103 },
      "value": { "line": 5, "column": 14, "pos": 105 },
      "valueEnd": { "line": 5, "column": "19", "pos": 110 }
    },
    "schemaPath": "#/properties/properties/items/allOf/0/then/properties/name/errorMessage",
    "params": {
      "rawErrors": [
        {
          "keyword": "pattern",
          "dataPath": "/properties/0/name",
          "schemaPath": "#/properties/properties/items/allOf/0/then/properties/name/pattern",
          "params": {
            "pattern": "^(number_)"
          },
          "message": "should match pattern \"^(number_)\""
        }
      ]
    }
  }
]
```


It's also possible to validate multiple objects at once

```js
import Validator from '@bpmn-io/json-schema-validator';

import schema from './test/fixtures/json-schema/schema.json';

import samples from './test/fixtures/samples/multiple-samples.json';

const validator = new Validator({
  schema: schema
});

const {
  valid,
  results
} = validator.validateAll(samples);

if (!valid) {
  console.error('Invalid JSON objects detected:', results.filter(r => !r.valid));
}

```

## Example JSON Schemas

* [@camunda/element-templates-json-schema](https://github.com/camunda/element-templates-json-schema)

## License

MIT

