# parse-server-schema-manager

Parse Server Schema Manager is an npm package that implements "schema as code" for Parse Server. It allows developers to manage database schemas and Class Level Permissions (CLP) through code, offering improved control and synchronization between your codebase and database schema.

## Key Features

- **Schema as Code**: Define your Parse Server schema structure in code, enabling version control and easier review of changes.
- **Real-time Schema Diffing**: Automatically compare the current database schema with your code-defined schema.
- **Selective Commit System**: Apply schema changes by setting `commit: true` in the `manageSchema` or `manageCLP` functions.
- **Detailed Change Logging**: Get comprehensive information about changes in your schema or CLP.

## Why Use parse-server-schema-manager?

1. **Version Control**: Track schema changes over time using your preferred version control system.
2. **Flexibility**: Decide when to apply changes, allowing for careful consideration before committing to database modifications.
3. **Transparency**: Clearly see what changes are being made to your schema and CLPs, reducing the risk of unintended modifications.
4. **Developer Experience**: Simplify the process of managing Parse Server schemas, allowing developers to focus on building features.

## Install

Install via **npm**

```shell
npm install parse-server-schema-manager
```

Install via **yarn**

```shell
yarn add parse-server-schema-manager
```

## API Reference

The parse-server-schema-manager package provides three main functions to manage your Parse Server schema:

### 1. manageSchema(allSchemas, commit, remove, purge)

Manages the Parse Server schema, allowing for additions, modifications, and deletions. This function compares the provided schema definitions with the current database schema and can apply the differences.

#### Parameters:

- `allSchemas` (Object): An object containing all schema definitions.
- `commit` (Boolean): Flag to apply changes to the database. If false, only shows differences without making changes.
- `remove` (Boolean): Flag to allow removal of columns and tables.
- `purge` (Boolean): Flag to allow purging of non-empty tables before removal.

#### Returns:

- (Object): An object detailing the changes made or to be made.

#### Example:

```javascript
import {manageSchema} from 'parse-server-schema-manager';

const PLAYLIST_SCHEMA = () => {
  const obj = {
    user: {type: 'Pointer', options: {targetClass: '_User'}},
    title: {type: 'String'},
  };
  const indexes = {user_index: {_p_user: 1}};
  return {Playlist: {fields: obj, indexes}};
};
const allSchemas = {
  ...PLAYLIST_SCHEMA(),
};
const results = await manageSchema(allSchemas, commit, remove, purge);
console.log(results);
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
const SCHEMA_NAME = () => {
  const obj = {
    fieldName: {
      type: 'DataType',
      options: {
        /* field options */
      },
    },
    // ... other fields
  };
  const indexes = {indexName: {fieldName: 1}};
  return {TableName: {fields: obj, indexes}};
};
```

For detailed information on how to define schemas, please refer to the [Parse Server Schema Documentation](https://docs.parseplatform.org/defined-schema/guide).

#### Behavior:

- When all boolean flags (commit, remove, purge) are false, this function only shows the differences between the current database schema and your defined schema.
- Setting `commit` to true applies additions and changes to columns and tables.
- Setting `remove` to true allows removal of columns and tables.
- The `purge` flag is used when you want to remove a non-empty table, deleting all rows before removal.

This function allows you to manage your Parse Server schema through code, providing version control, easy reviewing of changes, and flexible application of schema updates.

### 2. manageCLP(allCLP, commit)

Manages Class Level Permissions (CLP) for Parse Server classes. This function allows you to define and update CLPs for your Parse Server classes.

#### Parameters:

- `allCLP` (Object): An object containing CLP definitions for all classes.
- `commit` (Boolean): Flag to apply changes to the database. If false, only shows differences without making changes.

#### Returns:

- (Object): An object detailing the changes made or to be made to CLPs.

#### Example:

```javascript
import {manageCLP} from 'parse-server-schema-manager';

const allCLP = {
  Playlist: {
    find: {'*': true},
    count: {'*': true},
    get: {'*': true},
    create: {'*': true},
    update: {'*': true},
    delete: {},
    addField: {requiresAuthentication: true},
    protectedFields: {'*': []},
  },
};
const results = await manageCLP(allCLP, commit);
console.log(results);
```

#### CLP Definition Structure:

The CLP object structure follows the Parse Server CLP format, with each key representing a class name and its value being the CLP definition for that class.

#### Behavior:

When `commit` is false, this function only shows the differences between the current CLPs and your defined CLPs.
Setting `commit` to true applies the defined CLP changes to the database.

#### Output:

The function returns an object that shows changes and differences in an understandable way. Each key in the output object represents a class name, and it only shows changes if there are any in the permissions (e.g., find, delete, update, etc.).

For more detailed information on how to define schemas and CLP objects, please refer to the [Parse Server Schema Documentation](https://docs.parseplatform.org/defined-schema/guide).

Note that in this package, the class name is used as the key for the schema object, rather than being included inside the object alongside fields and indexes.

### 3. createDBMLFile(additionalPointers, filename)

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
  const allSchemas = {
    /* Define your schemas here */
  };
  return await manageSchema(allSchemas, commit, remove, purge);
});
```

This Cloud function:

- Requires a master key for access, ensuring security.
- Accepts optional parameters for commit, remove, and purge operations.
- Allows you to define your schemas within the function.
- Returns the result of the manageSchema function.

You can call this function using the Parse JavaScript SDK or REST API, providing the necessary parameters to check for differences or apply changes as needed.

By implementing one of these approaches, you can maintain full control over your Parse Server schema and CLP management, whether as part of an automated process or on-demand.
