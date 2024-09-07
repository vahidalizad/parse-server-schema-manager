[![CI/CD](https://github.com/vahidalizad/parse-server-schema-manager/actions/workflows/cd.yml/badge.svg)](https://github.com/vahidalizad/parse-server-schema-manager/actions/workflows/cd.yml)
[![codecov](https://codecov.io/gh/vahidalizad/parse-server-schema-manager/branch/main/graph/badge.svg)](https://codecov.io/gh/vahidalizad/parse-server-schema-manager)
[![npm version](https://badge.fury.io/js/parse-server-schema-manager.svg)](https://www.npmjs.com/package/parse-server-schema-manager)

# Parse Server Schema Manager

Parse Server Schema Manager is an npm package that implements "schema as code" for Parse Server. It allows developers to manage database schemas and Class Level Permissions (CLP) through code, offering improved control and synchronization between your codebase and database schema.

## Key Features

- **Schema as Code**: Define your Parse Server schema structure in code, enabling version control and easier review of changes.
- **Real-time Schema Diffing**: Automatically compare the current database schema with your code-defined schema.
- **Selective Commit System**: Apply schema changes by setting `commit: true` in the `manageSchema` or `manageCLP` functions.
- **Detailed Change Logging**: Get comprehensive information about changes in your schema or CLP.

## Why Use Parse Server Schema Manager?

1. **Version Control**: Track schema changes over time using your preferred version control system.
2. **Flexibility**: Decide when to apply changes, allowing for careful consideration before committing to database modifications.
3. **Transparency**: Clearly see what changes are being made to your schema and CLPs, reducing the risk of unintended modifications.
4. **Developer Experience**: Simplify the process of managing Parse Server schemas, allowing developers to focus on building features.

## Installation

You can install Parse Server Schema Manager using npm or yarn:

```shell
# Install via npm
npm install parse-server-schema-manager

# Install via yarn
yarn add parse-server-schema-manager
```

## API Reference

The Parse Server Schema Manager package provides three main functions to manage your Parse Server schema:

### 1. `manageSchema(allSchemas, commit, remove, purge)`

Manages the Parse Server schema, allowing for additions, modifications, and deletions. This function compares the provided schema definitions with the current database schema and can apply the differences.

#### Parameters:

- `schema` (Array): An array of Parse Schema Class Objects
- `schema Actions` (Object): an object that defines which actions should be performed on the database. `{commit: boolean, remove: boolean, purge: boolean}`
- `Action Parts` (Object): an object that define which parts will change. `{fields: boolean, indexes:boolean, classLevelPermissions: boolean}`
- `Schema Options` (Object): an object to specify which class and fields should be ignored. `{ignoreClasses: [], ignoreAttributes: []}`

#### Returns:

- (Object): An object detailing the changes made or to be made.

#### Example:

```javascript
import {manageSchema} from 'parse-server-schema-manager';

const allSchema = [
  {
    className: 'MyClass',
    fields: {
      objectId: {type: 'String'},
      createdAt: {type: 'Date'},
      updatedAt: {type: 'Date'},
      someField: {type: 'String', required: true},
      anotherField: {type: 'Number', defaultValue: 0},
      pointerField: {type: 'Pointer', targetClass: 'AnotherClass'},
    },
    indexes: {
      _id_: {_id: 1},
    },
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
  },
  {
    className: 'AnotherClass',
    fields: {
      objectId: {type: 'String'},
      createdAt: {type: 'Date'},
      updatedAt: {type: 'Date'},
      /* Builtin Parse Classes e.g. (User, Role, etc.) must be referneced by a "_" before its name.*/
      user: {type: 'Pointer', targetClass: '_User'},
    },
  },
];

const results = await manageSchema(
  allSchemas,
  {commit:false,remove:false,purge:false},
  {
    fields: true,
    indexes: true,
    classLevelPermissions: true,
  },
  {
    ignoreClasses: ["_User", "_Role", "_Session"],
    ignoreAttributes: ["createdAt", "updatedAt"]
  }
);
console.log(results);
```

#### Available Field Types

All Parse field types are supported.

```json
"String"
"Number"
"Boolean"
"Date"
"File"
"Pointer"
"Relation"
"GeoPoint"
"Polygon"
"Object"
"Array"
```

#### Return Object Structure:

```json
{
  "add": {},
  "remove": {},
  "change": {
    "Playlist": {
      "remove": {
        "description": {
          "type": "String",
          "required": false
        }
      }
    }
  },
  "indexChanges": {}
}
```

This output provides a detailed breakdown of the changes:

- `add`: Lists any new tables or columns to be added.
- `remove`: Shows any tables or columns to be removed.
- `change`: Indicates modifications to existing tables or columns.
- `indexChanges`: Displays any changes to indexes.

#### Schema Definition Structure:

```javascript
const SCHEMA_STRUCTURE_EXAMPLE = {
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
};
```

For detailed information on how to define schemas, please refer to the [Parse Server Schema Documentation](https://docs.parseplatform.org/defined-schema/guide).

#### Behavior:

- When all boolean flags (`commit`, `remove`, `purge`) are `false`, this function only shows the differences between the current database schema and your defined schema.
- Setting `commit` to `true` applies additions and changes to columns and tables.
- Setting `remove` to `true` allows removal of empty columns or tables.
- The `purge` flag is used when you want to remove a non-empty table, deleting all data in it before removal.

This function allows you to manage your Parse Server schema through code, providing version control, easy reviewing of changes, and flexible application of schema updates.

### 2. createDBMLFile(additionalPointers, filename)

Creates a DBML (Database Markup Language) file from your Parse Server schemas, allowing for visual representation of your database structure.

#### Parameters:

- `additionalPointers` (Object): Additional pointer relationships to include in the DBML file.
- `filename` (String): The name of the output DBML file.

#### Example:

```javascript
import {createDBMLFile} from 'parse-server-schema-manager';

const ADDITIONAL_POINTERS = {
  Playlist: {user: 'ref: < _User.objectId'},
};
await createDBMLFile(ADDITIONAL_POINTERS, '_SCHEMA.dbml');
```

#### Behavior:

- This function generates a DBML file based on your Parse Server schemas.
- It creates the file in your main directory with the specified filename.
- Additional pointers can be defined to represent relationships not explicitly in your schemas.

#### Usage:

After creating the DBML file, you can visualize it using various free, open-source tools by importing the file or copying and pasting its contents.
This function allows you to easily generate a visual representation of your database schema, which can be useful for documentation, planning, and communication within your team.

## Integration and Advanced Usage

### CI/CD Pipeline Integration

You can easily integrate the schema and CLP management functions into your CI/CD pipeline. Simply initialize Parse Server in your pipeline script and run these functions. This allows you to automatically manage your database schema and permissions as part of your deployment process.

### Parse Cloud Function

Alternatively, you can create a Parse Cloud function to manage your schemas on-demand. This approach allows you to check for differences and apply changes manually. Here's an example of how to set this up:

```javascript
Parse.Cloud.define('configureSchemas', async (request) => {
  if (!request.master) throw 'You can not access this function';
  const commit = request.params?.commit;
  const remove = request.params?.remove;
  const purge = request.params?.purge;
  const allSchemas = [
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
    },
  ];

  return await manageSchema(
    allSchemas,
    {commit, remove, purge},
    {fields: true, indexes: true, classLevelPermissions: true},
    {
      ignoreClasses: ['_Session', '_Role'],
      ignoreAttributes: ['createdAt', 'updatedAt', 'objectId'],
    }
  );
});
```

This Cloud function:

- Requires a master key for access, ensuring security.
- Accepts optional parameters for commit, remove, and purge operations.
- Allows you to define your schemas within the function.
- Returns the result of the manageSchema function.

You can call this function using the Parse JavaScript SDK or REST API, providing the necessary parameters to check for differences or apply changes as needed.

By implementing one of these approaches, you can maintain full control over your Parse Server schema and CLP management, whether as part of an automated process or on-demand.
