# Parse Server Schema Manager

[![CI/CD](https://github.com/vahidalizad/parse-server-schema-manager/actions/workflows/cd.yml/badge.svg)](https://github.com/vahidalizad/parse-server-schema-manager/actions/workflows/cd.yml)
[![codecov](https://codecov.io/gh/vahidalizad/parse-server-schema-manager/branch/main/graph/badge.svg)](https://codecov.io/gh/vahidalizad/parse-server-schema-manager)
[![npm version](https://badge.fury.io/js/parse-server-schema-manager.svg)](https://www.npmjs.com/package/parse-server-schema-manager)
[![license](https://img.shields.io/npm/l/parse-server-schema-manager.svg)](LICENSE)

Schema-as-code utilities for Parse Server. Define schemas, indexes, and class-level permissions in code, review the diff, and decide when to apply the changes to your Parse database.

## Features

- Define Parse classes, fields, indexes, and CLPs as versioned code.
- Compare your desired schema with the live Parse Server schema.
- Run safely in dry-run mode by leaving `commit`, `remove`, and `purge` disabled.
- Commit additions and changes only when you explicitly opt in.
- Generate DBML from the live schema for database diagrams.

## Requirements

- Node.js 20 or newer.
- A project using the Parse JavaScript SDK.
- `parse` installed in the host project. This package declares `parse >=6 <9` as a peer dependency.

## Installation

```shell
npm install parse-server-schema-manager parse
```

You can also install it with Bun, pnpm, or Yarn:

```shell
bun add parse-server-schema-manager parse
pnpm add parse-server-schema-manager parse
yarn add parse-server-schema-manager parse
```

## Setup

In Parse Server Cloud Code, `global.Parse` is usually available automatically. In scripts, workers, or tests, pass your configured Parse SDK instance before calling schema functions.

```javascript
import Parse from 'parse/node';
import {setParseInstance} from 'parse-server-schema-manager';

Parse.initialize('appId', 'javascriptKey', 'masterKey');
Parse.serverURL = 'http://localhost:1337/parse';

setParseInstance(Parse);
```

## Quick Start

```javascript
import {manageSchema} from 'parse-server-schema-manager';

const allSchemas = [
  {
    className: 'Player',
    fields: {
      objectId: {type: 'String'},
      createdAt: {type: 'Date'},
      updatedAt: {type: 'Date'},
      name: {type: 'String', required: true},
      age: {type: 'Number', defaultValue: 13},
      user: {type: 'Pointer', targetClass: '_User'},
    },
    indexes: {
      _id_: {_id: 1},
      name_1: {name: 1},
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
];

const diff = await manageSchema(
  allSchemas,
  {commit: false, remove: false, purge: false},
  {fields: true, indexes: true, classLevelPermissions: true},
  {
    ignoreClasses: ['_User', '_Role', '_Session'],
    ignoreAttributes: ['createdAt', 'updatedAt', 'objectId'],
  }
);

console.log(diff);
```

To apply safe additions and changes, set `commit: true`. To delete classes or fields, also set `remove: true`. Use `purge: true` only when you intentionally want Parse Server to purge data before removing a class.

## API

### `manageSchema(schema, actions, parts, options)`

Compares your desired schema with the live Parse Server schema and optionally synchronizes it.

```javascript
const result = await manageSchema(schema, actions, parts, options);
```

Parameters:

- `schema`: Array of Parse class schema objects.
- `actions`: `{commit?: boolean, remove?: boolean, purge?: boolean}`.
- `parts`: `{fields?: boolean, indexes?: boolean, classLevelPermissions?: boolean}`.
- `options`: `{ignoreClasses?: string[], ignoreAttributes?: string[]}`.

Returns an object describing additions, removals, field/index/CLP changes, and a `log` message.

### `getAllSchemas(parts, options)`

Reads all live schemas from Parse Server and returns them in the same shape accepted by `manageSchema`.

```javascript
import {getAllSchemas} from 'parse-server-schema-manager';

const schemas = await getAllSchemas(
  {fields: true, indexes: true, classLevelPermissions: true},
  {ignoreClasses: ['_Session'], ignoreAttributes: ['authData']}
);
```

### `createDBMLFile(additionalPointers, filename)`

Creates a DBML file from the live Parse Server schema.

```javascript
import {createDBMLFile} from 'parse-server-schema-manager';

await createDBMLFile(
  {
    Playlist: {
      user: 'ref: < _User.objectId',
    },
  },
  '_SCHEMA.dbml'
);
```

## Field Types

The schema manager supports the standard Parse field types:

```json
[
  "String",
  "Number",
  "Boolean",
  "Date",
  "File",
  "Pointer",
  "Relation",
  "GeoPoint",
  "Polygon",
  "Object",
  "Array"
]
```

Pointer and relation fields should include `targetClass`.

```javascript
{
  user: {type: 'Pointer', targetClass: '_User'},
  members: {type: 'Relation', targetClass: '_User'}
}
```

## Development

Integration tests expect MongoDB to be available at `mongodb://127.0.0.1:27017/schema-test`. The GitHub Actions workflow starts MongoDB as a service container; for local development, start MongoDB before running the test suite.

```shell
bun install
bun run type-check
bun test
bun run build
npm pack --dry-run --ignore-scripts
```

The package publishes the built `dist` files, `README.md`, `CHANGELOG.md`, and `LICENSE`. Run `bun run pack:check` before publishing to verify the npm package contents.

## Release

Publishing is intentionally tied to GitHub Releases, not ordinary merges to `main`.

1. Merge the release PR into `main`.
2. Create and publish a GitHub Release with a tag that matches the package version, for example `v3.0.1`.
3. The `release.published` workflow builds the package and runs `npm publish --provenance`.

This repository uses npm trusted publishing through GitHub Actions OIDC. Do not add an `NPM_TOKEN` to the workflow. The npm trusted publisher should be configured for:

- Repository: `vahidalizad/parse-server-schema-manager`
- Workflow: `.github/workflows/cd.yml`
- Environment: `npm`

The publish job declares `id-token: write` and the `npm` environment so npm can verify the trusted publisher identity.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, testing, and pull request guidance.

## Security

Please do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md) for reporting guidance.

## License

This project is open source under the [ISC License](LICENSE).
