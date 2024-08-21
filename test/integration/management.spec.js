import {manageSchema} from '@Functions/schema';
import {expect} from 'chai';
import {describe, it} from 'mocha';
import TestSchema from '../assets/test-schema.json';
import DefaultSchema from '../assets/default-schema.json';

const schemaOptions = {
  ignoreClasses: ['_Session', '_User', '_Role'],
  ignoreAttributes: [],
};

const cleanSchema = async () => {
  try {
    await manageSchema(
      DefaultSchema,
      {commit: true, purge: true, remove: true},
      {fields: true, indexes: true, classLevelPermissions: true},
      {
        ignoreClasses: ['_Session'],
        ignoreAttributes: [],
      }
    );
  } catch (error) {
    console.error('Default Schema: ', error);
  }
};

describe('Test Manage Schema', function () {
  this.beforeEach(async function () {
    await cleanSchema();
  });

  this.afterAll(async function () {
    await cleanSchema();
  });

  it('test add / remove class from schema', async function () {
    const result = await manageSchema(
      TestSchema,
      {commit: true},
      {fields: true},
      schemaOptions
    );
    expect(result).to.deep.equal({
      add: {Test: TestSchema[0]},
      log: 'Schema synced!',
    });
    const result2 = await manageSchema(
      TestSchema,
      {commit: true},
      {fields: true},
      schemaOptions
    );
    expect(result2).to.deep.equal({
      log: 'Schema synced!',
    });
    debugger;
  });

  it.skip('test diffs field of a schema class', async function () {});

  it.skip('test add field to schema class', async function () {});

  it.skip('test not add exist field to schema class with commit true', async function () {});

  it.skip('test not add field to schema class with commit false', async function () {});

  it.skip('test change field type in field class', async function () {});

  it.skip('test remove empty field in class with only remove', async function () {});

  it.skip('test remove field in class', async function () {});

  it.skip('test not to remove empty field in class with remove false', async function () {});

  it.skip('test not to remove field in class with purge false', async function () {});
});
