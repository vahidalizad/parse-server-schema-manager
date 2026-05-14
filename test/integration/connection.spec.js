import {describe, expect, it} from 'bun:test';
import {getParseInstance, setParseInstance} from '@Functions/parse';

describe('Check Parse', function () {
  it('Check Parse Init', function () {
    expect(typeof Parse.Config.current()).toBe('object');
  });

  it('check users', async function () {
    let q = await new Parse.Query(Parse.User).findAll({useMasterKey: true});
    expect(Array.isArray(q)).toBe(true);
  });

  it('uses the active global Parse instance', function () {
    const activeParse = globalThis.Parse;
    const fakeParse = {Schema: function Schema() {}};

    setParseInstance(undefined);
    globalThis.Parse = fakeParse;

    try {
      expect(getParseInstance()).toBe(fakeParse);
    } finally {
      globalThis.Parse = activeParse;
      setParseInstance(undefined);
    }
  });
});
