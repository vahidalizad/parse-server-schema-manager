import {manageSchema} from '@Functions/schema';
import {createSchema} from '@test/helper';
import {expect} from 'chai';
import {describe, it} from 'mocha';

const actionParts = {fields: true};
const schemaOptions = {};

describe('Test Manage Schema', function () {
  let testSchema = null;
  this.beforeAll(async function () {
    testSchema = await createSchema();
  });

  it('test diffs field of a schema class', async function () {
    const actions = {commit: false};
    const result = await manageSchema(
      [testSchema],
      actions,
      actionParts,
      schemaOptions
    );
    console.log('result', result);
    debugger;
    return expect(result).to.deep.equal([
      {
        className: 'Test',
        _fields: {
          age: {type: 'String'},
          name: {type: 'String'},
        },
      },
    ]);
  });

  it('test add field to schema class', async function () {
    const actions = {commit: true};
    const newSchema = {
      ...testSchema,
      _fields: {...testSchema._fields, test: {type: 'String'}},
    };
    debugger;
    const result = await manageSchema(
      [newSchema],
      actions,
      actionParts,
      schemaOptions
    );
    debugger;
    return expect(result).to.deep.equal([
      {
        className: 'Test',
        _fields: {
          age: {type: 'String'},
          name: {type: 'String'},
          test: {type: 'String'},
        },
      },
    ]);
  });

  it.skip('test not add exist field to schema class with commit true', async function () {});

  it.skip('test not add field to schema class with commit false', async function () {});

  it.skip('test change field type in field class', async function () {});

  it.skip('test remove empty field in class with only remove', async function () {});

  it.skip('test remove field in class', async function () {});

  it.skip('test not to remove empty field in class with remove false', async function () {});

  it.skip('test not to remove field in class with purge false', async function () {});

  // this.afterAll(async function () {
  //   try {
  //     await testSchema.purge();
  //   } catch (error) {
  //     console.error('Delete Schema: ', error);
  //   }
  // });
});
