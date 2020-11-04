const {
  expect
} = require('chai');


describe('validate module', function() {

  it('should expose CJS bundle', function() {

    // given
    const Validator = require('../../dist');

    // then
    expect(Validator).to.exist;
  });
});