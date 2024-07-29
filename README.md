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

## Usage Example

The parse-server-schema-manager package provides four main functions to manage your Parse Server schema:

### 1. manageSchema

To define a schema for a table, create a function that returns an object with the table structure. Here's an example for a "Playlist" table:

```javascript
const PLAYLIST_SCHEMA = () => {
  const obj = {
    user: {type: 'Pointer', options: {targetClass: '_User'}},
    title: {type: 'String'},
  };
  const indexes = {user_index: {_p_user: 1}};
  return {Playlist: {fields: obj, indexes}};
};
```

This defines a "Playlist" table with two columns: "user" (a pointer to the \_User table) and "title" (a string). It also creates an index on the user field for faster queries.
To use this schema definition:

```javascript
let allSchemas = {
  ...PLAYLIST_SCHEMA(),
};
let results = await manageSchema(allSchemas, commit, remove, purge);
```

#### Parameters

The `manageSchema` function takes four parameters:

- `allSchemas`: An object containing all your schema definitions
- `commit`: Boolean flag to apply changes to the database
- `remove`: Boolean flag to allow removal of columns and tables
- `purge`: Boolean flag to allow purging of non-empty tables before removal

When all boolean flags are false, the function only shows the differences between the current database schema and your defined schema. Setting commit to true applies additions and changes to columns and tables. Setting remove to true allows removal of columns and tables. The purge flag is used when you want to remove a non-empty table, deleting all rows before removal.

#### Output

The function returns an object with the following structure:

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
