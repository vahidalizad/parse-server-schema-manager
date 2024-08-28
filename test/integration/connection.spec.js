import {describe, it} from 'mocha';
import {expect} from 'chai';

describe('Check Parse', function () {
  it('Check Parse Init', function () {
    expect(Parse.Config.current()).to.be.an('object');
  });

  it('check users', async function () {
    let q = await new Parse.Query(Parse.User).findAll({useMasterKey: true});
    expect(q).to.be.an('array');
  });
});
