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

## API Reference

The parse-server-schema-manager package provides four main functions to manage your Parse Server schema:

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
const PLAYLIST_SCHEMA = () => {
  const obj = {
    user: {type: 'Pointer', options: {targetClass: '_User'}},
    title: {type: 'String'},
  };
  const indexes = {user_index: {_p_user: 1}};
  return {Playlist: {fields: obj, indexes}};
};

let allSchemas = {
  ...PLAYLIST_SCHEMA(),
};

let results = await manageSchema(allSchemas, commit, remove, purge);

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

#### Behavior:

- When all boolean flags (commit, remove, purge) are false, this function only shows the differences between the current database schema and your defined schema.
- Setting `commit` to true applies additions and changes to columns and tables.
- Setting `remove` to true allows removal of columns and tables.
- The `purge` flag is used when you want to remove a non-empty table, deleting all rows before removal.

This function allows you to manage your Parse Server schema through code, providing version control, easy reviewing of changes, and flexible application of schema updates.
