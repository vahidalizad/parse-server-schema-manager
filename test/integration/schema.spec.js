import {describe, it} from 'mocha';
import {expect} from 'chai';
import {diffingFields, getAllSchemas} from '@Functions/schema';

describe('Schema Management', function () {
  it('test getAllSchemas output', async function () {
    const options = {
      ignoreClasses: [Parse.Role.className, 'Article', 'Project'],
      ignoreAttributes: ['authData'],
    };
    let list = await getAllSchemas(
      {
        indexes: false,
        classLevelPermissions: false,
      },
      options
    );
    expect(list).to.deep.equal([
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
    let list2 = await getAllSchemas({fields: false}, options);
    expect(list2).to.deep.equal([
      {
        className: '_User',
        classLevelPermissions: {
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
          _id_: {_id: 1},
          case_insensitive_email: {email: 1},
          case_insensitive_username: {username: 1},
          email_1: {email: 1},
          username_1: {username: 1},
        },
      },
    ]);
  });

  it('test diffing of fields object', async function () {
    let diffs = diffingFields(
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
        name: {type: 'String', requred: true},
        followers: {type: 'Relation', targetClass: '_User'},
      }
    );
    console.log(diffs);
    debugger;
    let q = await new Parse.Query(Parse.User).findAll({useMasterKey: true});
    expect(q).to.be.an('array');
  });
});
