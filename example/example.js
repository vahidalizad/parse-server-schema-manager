import {manageSchema} from '../dist';

manageSchema(
  [
    {
      className: 'Player',
      fields: {
        User: {
          type: 'Pointer',
          targetClass: '_User',
        },
        age: {
          type: 'Number',
          defaultValue: 13,
        },
        name: {
          type: 'String',
          required: true,
        },
      },
      indexes: {
        _id_: {_id: 1},
        name_1: {name: 1},
      },
      classLevelPermissions: {
        find: {'*': true},
        count: {'*': true},
        get: {'*': true},
        create: {'*': true},
        update: {'*': true},
        delete: {'*': true},
        addField: {'*': true},
        protectedFields: {'*': []},
      },
    },
  ],
  {commit: true},
  {fields: true, indexes: false, classLevelPermissions: false},
  {ignoreClasses: ['_Session'], ignoreAttributes: []}
);
