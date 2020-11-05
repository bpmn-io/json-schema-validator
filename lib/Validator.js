import Ajv from 'ajv';

import AjvErrors from 'ajv-errors';

import {
  filter,
  forEach
} from 'min-dash';

/**
 * @param {Object} options - Options.
 * @param {Object} [options.schema] - JSON Schema.
 */
export default class Validator {

  constructor(options) {
    this.schema = options.schema;
  }

  validate(object) {
    const validate = createValidator(this.schema);

    const valid = validate(object);

    let errors = validate.errors;

    if (errors && errors.length) {

      // @pinussilvestrus: the <ajv-errors> extensions produces a couple of.
      // unnecessary errors when using an <errorMessage> attribute.
      // Therefore, we should flatten the produced errors a bit to not
      // confuse the consumer of this library.

      // (1) wrap raw errors in case of custom errorMessage attribute
      forEach(errors, wrapRawErrors);

      // (2) ignore supportive error messages (e.g. "if-then-rules")
      errors = ignoreSupportiveErrors(errors);
    }

    return {
      valid: valid,
      errors: errors
    };
  }

  validateAll(objects) {
    let validObjects = [],
        erroredObjects = [],
        self = this;

    forEach(objects, function(object) {
      const {
        valid,
        errors
      } = self.validate(object);

      if (valid) {
        validObjects.push(object);
      } else {
        erroredObjects.push({
          errors: errors,
          object: object
        });
      }

    });

    return {
      validObjects: validObjects,
      erroredObjects: erroredObjects
    };
  }

  getSchema() {
    return this.schema;
  }

  setSchema(schema) {
    this.schema = schema;
  }
}


// helper //////////////

function createValidator(schema) {
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true
  });

  AjvErrors(ajv);

  return ajv.compile(schema);
}

function wrapRawErrors(error) {
  const params = error.params;

  if (params && params.errors) {
    params.rawErrors = params.errors;
    delete params.errors;
  }
}

function ignoreSupportiveErrors(errors) {
  return filter(errors, function(error) {
    return error.keyword !== 'if';
  });
}