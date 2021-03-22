import Ajv from 'ajv';

import AjvErrors from 'ajv-errors';

import {
  filter,
  forEach
} from 'min-dash';


export default class Validator {

  /**
   * Create a new validator instance.
   *
   * @param {Object} options - Options.
   * @param {Object} [options.schema] - JSON Schema.
   */
  constructor(options) {
    this.schema = options.schema;
  }

  /**
   * Validate a single object.
   *
   * @param {Object} object
   * @return {Object} single object validation result
   */
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
      object: object,
      errors: errors
    };
  }

  /**
   * Validate a list of objects
   *
   * @param  {Object[]} objects
   * @return {Object} list validation result
   */
  validateAll(objects) {

    const self = this;
    const results = [];

    let allValid = true;

    forEach(objects, function(object) {
      const result = self.validate(object);

      if (!result.valid) {
        allValid = false;
      }

      results.push(result);
    });

    return {
      valid: allValid,
      results: results
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
    strict: false
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