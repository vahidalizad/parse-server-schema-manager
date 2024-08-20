import {describe, it} from 'mocha';
import testSchemas from '../assets/schema.json';
import {manageSchema} from '@Functions/schema';
import {expect} from 'chai';

const schema = testSchemas[0];
const actionParts = {fields: true};
const schemaOptions = {};

describe('Test Manage Schema', function () {
  it('test diffs field of a schema class', async function () {
    const actions = {commit: false};
    const result = await manageSchema(
      [schema],
      actions,
      actionParts,
      schemaOptions
    );
    debugger;
    expect(result).to.deep.equal([
      {
        className: '_User',
        fields: {
          ACL: {type: 'ACL'},
          createdAt: {type: 'Date'},
          email: {type: 'String'},
          emailVerified: {type: 'Boolean'},
          objectId: {type: 'String'},
          password: {type: 'String'},
          updatedAt: {type: 'Date'},
          username: {type: 'String'},
        },
      },
    ]);
  });

  it('test add field to schema class', async function () {
    const actions = {commit: true};
    const newSchema = {
      ...schema,
      fields: {...schema.fields, test: {type: 'String'}},
    };
    const result = await manageSchema(
      newSchema,
      actions,
      actionParts,
      schemaOptions
    );
    expect(result).to.deep.equal([
      {
        className: '_User',
        fields: {
          ACL: {type: 'ACL'},
          createdAt: {type: 'Date'},
          email: {type: 'String'},
          emailVerified: {type: 'Boolean'},
          objectId: {type: 'String'},
          password: {type: 'String'},
          updatedAt: {type: 'Date'},
          username: {type: 'String'},
          test: {type: 'String'},
        },
      },
    ]);
  });

  it('test not add exist field to schema class with commit true', async function () {});

  it('test not add field to schema class with commit false', async function () {});

  it('test change field type in field class', async function () {});

  it('test remove empty field in class with only remove', async function () {});

  it('test remove field in class', async function () {});

  it('test not to remove empty field in class with remove false', async function () {});

  it('test not to remove field in class with purge false', async function () {});
});
