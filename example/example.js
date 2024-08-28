import {manageSchema} from '../dist';

manageSchema(
  [
    {
      className: 'MAMAD',
      fields: {
        User: {
          type: 'Pointer',
          targetClass: '_User',
        },
        age: {
          type: 'Number',
          defaultValue: 10,
        },
      },
    },
  ],
  {commit: true},
  {classLevelPermissions: false},
  {ignoreClasses: ['_Session']}
);
