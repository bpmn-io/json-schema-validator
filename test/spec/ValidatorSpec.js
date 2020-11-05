import { expect } from 'chai';

import { map, keys } from 'min-dash';

import { Validator } from '../../lib';

import schema from '../fixtures/json-schema/schema.json';


describe('Validator', function() {

  let validator;

  beforeEach(function() {
    validator = new Validator({
      schema
    });
  });


  describe('#validateAll', function() {

    it('should validate without errors', function() {

      // given
      const samples = require('../fixtures/samples/multiple-samples.json');

      // when
      const {
        valid,
        results
      } = validator.validateAll(samples);

      // then
      expect(valid).to.be.true;
      expect(results.length).to.eql(samples.length);

      expect(results.every(r => r.valid)).to.be.true;

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should validate with errors', function() {

      // given
      const samples = require('../fixtures/samples/multiple-errors.json');

      // when
      const {
        valid,
        results
      } = validator.validateAll(samples);

      // then
      expect(valid).to.be.false;

      expect(results.map(r => r.valid)).to.eql([
        false, false, true, true, true, false
      ]);

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should provide all valid objects', function() {

      // given
      const samples = require('../fixtures/samples/multiple-errors.json');

      // when
      const {
        results
      } = validator.validateAll(samples);

      // then
      const validObjects = results.filter(r => r.valid).map(r => r.object);

      expect(validObjects).to.eql([
        samples[2],
        samples[3],
        samples[4]
      ]);
    });

  });


  describe('#validate', function() {

    it('should validate', function() {

      // given
      const sample = require('../fixtures/samples/example.json');

      // when
      const {
        errors,
        object,
        valid
      } = validator.validate(sample);

      // then
      expect(valid).to.be.true;
      expect(object).to.equal(sample);
      expect(errors).not.to.exist;
    });


    it('should retrieve errors', function() {

      // given
      const sample = require('../fixtures/samples/invalid-name.json');

      // when
      const {
        errors,
        object,
        valid
      } = validator.validate(sample);

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(object).to.equal(sample);

      expect(normalizedErrors).to.eql([{
        message: 'must start with <number_>'
      }]);

    });


    it('should validate required properties', function() {

      // given
      const sample = require('../fixtures/samples/missing-id.json');

      // when
      const {
        errors,
        valid
      } = validator.validate(sample);

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(normalizedErrors).to.eql([{
        message: 'should have required property \'id\'',
        params: {
          missingProperty: 'id'
        }
      }]);

    });


    it('should allow optional properties', function() {

      // given
      const sample = require('../fixtures/samples/no-foo.json');

      // when
      const {
        errors,
        valid
      } = validator.validate(sample);

      // then
      expect(valid).to.be.true;
      expect(errors).not.to.exist;

    });


    it('should NOT allow custom properties if configured', function() {

      // given
      const sample = require('../fixtures/samples/additional-property.json');

      validator.setSchema(require('../fixtures/json-schema/schema-no-additional.json'));

      // when
      const {
        errors,
        valid
      } = validator.validate(sample);

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(normalizedErrors).to.eql([{
        message: 'should NOT have additional properties',
        params: {
          additionalProperty: 'bar'
        }
      }]);

    });


    describe('custom error messages', function() {

      it('should allow custom error messages', function() {

        // given
        const sample = require('../fixtures/samples/invalid-name.json');

        // when
        const {
          errors
        } = validator.validate(sample);

        // then
        expect(errors[0].message).to.equal('must start with <number_>');
      });


      it('should escape json pointers', function() {

        // given
        const sample = require('../fixtures/samples/invalid-type.json');

        // when
        const {
          errors
        } = validator.validate(sample);

        // then
        expect(errors[0].message).to.equal('invalid property type "Bar"; must be any of { String, Number }');

      });


      it('should wrap raw error messages', function() {

        // given
        const sample = require('../fixtures/samples/invalid-type.json');

        // when
        const {
          errors
        } = validator.validate(sample);

        // then
        expect(errors[0].params.rawErrors).to.exist;
      });


      it('should ignore supporting error messages', function() {

        // given
        const sample = require('../fixtures/samples/invalid-name.json');

        // when
        const {
          errors
        } = validator.validate(sample);

        const normalizedErrors = normalizeErrors(errors);

        // then
        expect(normalizedErrors).not.to.deep.include(
          {
            message: 'should match "then" schema',
            params: { failingKeyword: 'then' }
          }
        );
      });

    });

  });

});


// helper //////////////

function normalizeErrors(errors) {
  if (!errors) {
    return;
  }

  return map(errors, function(error) {

    let normalizedError = {
      message: error.message
    };

    // ignore raw errors generated by ajv (in case of custom errorMessage)
    const params = error.params;

    if (params) {

      if (params.rawErrors) {
        delete params.rawErrors;
      }

      if (keys(params).length) {
        normalizedError.params = params;
      }
    }

    return normalizedError;
  });
}