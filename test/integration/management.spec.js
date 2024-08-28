import {manageSchema} from '@Functions/schema';
import {saveToDatabase} from '@test/helper';
import {expect} from 'chai';
import {describe, it} from 'mocha';
import DefaultSchema from '../assets/default-schema.json';
import TestSchema from '../assets/test-schema.json';

const schemaOptions = {
  ignoreClasses: ['_Session', '_User', '_Role'],
  ignoreAttributes: ['ACL'],
};
const schemaObject = TestSchema[0];
const actionParts = {fields: true};

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

describe('Reset Schemas', function () {
  it('test cleaning speed', async function () {
    await cleanSchema();
  });
});

describe('Test Manage Schema', function () {
  this.timeout(5000);

  this.afterEach(async function () {
    await cleanSchema();
  });

  it('test add / remove class from schema', async function () {
    const result = await manageSchema(
      TestSchema,
      {commit: true},
      actionParts,
      schemaOptions
    );
    expect(result).to.deep.equal({
      add: {Test: TestSchema[0]},
      log: 'Schema synced!',
    });
    const result2 = await manageSchema(
      DefaultSchema,
      {commit: true, remove: true},
      actionParts,
      schemaOptions
    );
    expect(result2).to.deep.equal({
      remove: {Test: TestSchema[0]},
      log: 'Schema synced!',
    });
  });

  it('test not add exist field to schema class with commit true', async function () {
    const modifiedSchema = {
      ...schemaObject,
      fields: {
        ...schemaObject.fields,
        name: {type: 'String'},
      },
    };
    const result = await manageSchema(
      [modifiedSchema],
      {commit: true},
      actionParts,
      schemaOptions
    );
    const resultSchema = {[schemaObject.className]: schemaObject};
    expect(result).to.deep.equal({
      add: resultSchema,
      log: 'Schema synced!',
    });
  });

  it('test not add field to schema class with commit false', async function () {
    const newSchema = {
      ...schemaObject,
      fields: {...schemaObject.fields, email: {type: 'String'}},
    };
    const result = await manageSchema(
      [newSchema],
      {commit: false},
      actionParts,
      schemaOptions
    );
    const resultSchema = {[newSchema.className]: newSchema};
    expect(result).to.deep.equal({
      add: resultSchema,
      log: 'Nothing changed!',
    });
  });

  it('test change field type in field class', async function () {
    const modifiedSchema = {
      ...schemaObject,
      fields: {
        ...schemaObject.fields,
        name: {type: 'Number'},
      },
    };
    const result = await manageSchema(
      [modifiedSchema],
      {commit: true},
      actionParts,
      schemaOptions
    );
    const resultSchema = {[modifiedSchema.className]: modifiedSchema};
    expect(result).to.deep.equal({
      add: resultSchema,
      log: 'Schema synced!',
    });
  });

  it('test remove empty field in class with only remove', async function () {
    const newSchema = {
      ...schemaObject,
      fields: {...schemaObject.fields, email: {type: 'String'}},
    };

    await manageSchema([newSchema], {commit: true}, actionParts, schemaOptions);

    const modifiedSchema = structuredClone(newSchema);
    delete modifiedSchema.fields.email;

    const result = await manageSchema(
      [modifiedSchema],
      {commit: true, remove: true},
      actionParts,
      schemaOptions
    );
    const resultObject = {
      fields: {
        Test: {
          remove: {
            email: {
              type: 'String',
            },
          },
        },
      },
    };
    expect(result).to.deep.equal({
      changes: resultObject,
      log: 'Schema synced!',
    });
  });

  it('test remove field in class', async function () {
    const newSchema = {
      ...schemaObject,
      fields: {...schemaObject.fields, email: {type: 'String'}},
    };

    await manageSchema([newSchema], {commit: true}, actionParts, schemaOptions);

    const modifiedSchema = structuredClone(newSchema);
    delete modifiedSchema.fields.email;

    const result = await manageSchema(
      [modifiedSchema],
      {commit: true, remove: true, purge: true},
      actionParts,
      schemaOptions
    );
    const resultObject = {
      fields: {
        Test: {
          remove: {
            email: {
              type: 'String',
            },
          },
        },
      },
    };
    expect(result).to.deep.equal({
      changes: resultObject,
      log: 'Schema synced!',
    });
  });

  it('test not to remove empty field in class with remove false', async function () {
    const newSchema = {
      ...schemaObject,
      fields: {...schemaObject.fields, email: {type: 'String'}},
    };

    await manageSchema([newSchema], {commit: true}, actionParts, schemaOptions);

    const result = await manageSchema(
      [schemaObject],
      {commit: true, remove: false},
      actionParts,
      schemaOptions
    );
    const resultObject = {
      fields: {
        Test: {
          remove: {
            email: {
              type: 'String',
            },
          },
        },
      },
    };
    expect(result).to.deep.equal({
      changes: resultObject,
      log: 'Schema synced!',
    });
  });

  it('test not to remove field in class with purge false', async function () {
    const newSchema = {
      ...schemaObject,
      fields: {...schemaObject.fields, email: {type: 'String'}},
    };

    await manageSchema([newSchema], {commit: true}, actionParts, schemaOptions);

    await saveToDatabase({className: newSchema.className});

    const modifiedSchema = structuredClone(newSchema);
    delete modifiedSchema.fields.email;

    const result = await manageSchema(
      [modifiedSchema],
      {commit: true, remove: true},
      actionParts,
      schemaOptions
    );

    const resultObject = {
      fields: {
        Test: {
          remove: {
            email: {
              type: 'String',
            },
          },
        },
      },
    };

    expect(result).to.deep.equal({
      changes: resultObject,
      log: 'Schema synced!',
    });
  });
});
