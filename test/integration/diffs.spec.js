import {describe, expect, it} from 'bun:test';
import Parse from 'parse/node';
import {
  diffingCLP,
  diffingFields,
  diffingIndexes,
  getAllSchemas,
} from '@Functions/schema';

describe('Test Diffs', function () {
  it('test getAllSchemas output', async function () {
    const options = {
      ignoreClasses: [Parse.Role.className, 'Article', 'Project'],
      ignoreAttributes: ['authData'],
    };
    const list = await getAllSchemas(
      {
        indexes: false,
        classLevelPermissions: false,
      },
      options
    );
    expect(list).toEqual([
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
    const list2 = await getAllSchemas({fields: false}, options);
    expect(list2).toEqual([
      {
        className: '_User',
        fields: {},
        classLevelPermissions: {
          ACL: {'*': {read: true, write: true}},
          addField: {'*': true},
          count: {'*': true},
          create: {'*': true},
          delete: {'*': true},
          find: {'*': true},
          get: {'*': true},
          protectedFields: {'*': []},
          update: {'*': true},
        },
        indexes: {
          _auth_data_anonymous_id: {'_auth_data_anonymous.id': 1},
          _email_verify_token: {_email_verify_token: 1},
          _id_: {_id: 1},
          _perishable_token: {_perishable_token: 1},
          case_insensitive_email: {email: 1},
          case_insensitive_username: {username: 1},
          email_1: {email: 1},
          username_1: {username: 1},
        },
      },
    ]);
  });

  it('test diffing of fields object', async function () {
    const diffs = diffingFields(
      {
        objectId: {type: 'String'},
        createdAt: {type: 'Date'},
        updatedAt: {type: 'Date'},
        ACL: {type: 'ACL'},
        name: {type: 'String'},
        users: {type: 'Relation', targetClass: '_User'},
        roles: {type: 'Relation', targetClass: '_Role'},
      },
      {
        objectId: {type: 'String'},
        createdAt: {type: 'Date'},
        updatedAt: {type: 'Date'},
        ACL: {type: 'ACL'},
        name: {type: 'String', required: true},
        followers: {type: 'Relation', targetClass: '_User'},
      }
    );
    expect(diffs).toEqual({
      add: {followers: {type: 'Relation', targetClass: '_User'}},
      change: {name: ['required: undefined -> true']},
      remove: {
        users: {type: 'Relation', targetClass: '_User'},
        roles: {type: 'Relation', targetClass: '_Role'},
      },
    });
  });

  it('test diffing of indexes', async function () {
    const diffs = diffingIndexes(
      {
        _id_: {_id: 1},
        email_1: {email: 1},
        username_1: {username: 1},
      },
      {
        _id_: {_objectId: 1},
        email_1: {email: -1},
        username_2: {username: 1},
      }
    );
    expect(diffs).toEqual({
      add: {username_2: {username: 1}},
      remove: {username_1: {username: 1}},
      change: {
        _id_: {from: {_id: 1}, to: {_objectId: 1}},
        email_1: {from: {email: 1}, to: {email: -1}},
      },
    });
  });

  it('test diffing of CLP', async function () {
    const diffs = diffingCLP(
      {
        find: {'*': true},
        count: {'*': true},
        get: {'*': true},
        create: {'*': true},
        update: {'*': true},
        delete: {'*': true},
        addField: {},
        protectedFields: {'*': []},
      },
      {
        find: {requiresAuthentication: true},
        count: {'*': true},
        get: {'*': true},
        create: {requiresAuthentication: true, 'role:admin': true},
        update: {'*': true},
        delete: {'*': true},
        addField: {},
        protectedFields: {'*': ['user']},
      }
    );
    expect(diffs).toEqual({
      find: {from: {'*': true}, to: {requiresAuthentication: true}},
      create: {
        from: {'*': true},
        to: {requiresAuthentication: true, 'role:admin': true},
      },
      protectedFields: {from: {'*': []}, to: {'*': ['user']}},
    });
  });
});
