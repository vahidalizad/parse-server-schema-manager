import {checkSame} from '../object';
import {syncSchemaWithObject} from './sync';
import Parse from 'parse/node';

const checkSecondProperties = ['type'];

const checkOptions = ['targetClass', 'required', 'defaultValue'];

const ignoreTables = ['_Session', '_Role'];
const ignoreAdditionalTables = ['_User'];
const ignoreAttributes = [
  'ACL',
  'password',
  'authData',
  'emailVerified',
  'email',
];
const ignoreAdditionalAttributes = ['objectId', 'createdAt', 'updatedAt'];

type FieldOptions = {
  [key: string]: string | boolean;
};

type Fields = {
  [key: string]: FieldOptions;
};
type Indexes = {
  [key: string]: {
    [key: string]: any;
  };
};

type ChangeFields = {
  [key: string]: Array<string>;
};

interface RestSchema {
  className: string;
  fields?: Fields;
  classLevelPermissions?: Parse.Schema.CLP;
  indexes?: Indexes;
}

export const diffingFields = (obj1: Fields, obj2: Fields) => {
  let add: Fields = {};
  let remove: Fields = {};
  let change: ChangeFields = {};
  for (let key in obj2) {
    if (!obj1[key]) add[key] = obj2[key];
    else {
      for (let pr of checkSecondProperties)
        if (obj1[key]?.[pr] !== obj2[key]?.[pr]) {
          change[key] = change[key] ?? [];
          change[key].push(`${pr}: ${obj1[key][pr]} -> ${obj2[key][pr]}`);
        }
      for (let pr of checkOptions)
        if (!checkSame(obj1[key]?.[pr], obj2[key]?.[pr])) {
          if (
            pr === 'required' &&
            obj1[key]?.[pr] === false &&
            !obj2[key]?.[pr]
          )
            continue;
          if (
            pr === 'defaultValue' &&
            obj1[key]?.[pr] === false &&
            !obj2[key]?.[pr]
          )
            continue;
          change[key] = change[key] ?? [];
          change[key].push(
            `${pr}: ${JSON.stringify(obj1[key][pr])} -> ${JSON.stringify(
              obj2[key]?.[pr]
            )}`
          );
        }
    }
  }
  for (let key in obj1) if (!obj2[key]) remove[key] = obj1[key];
  return {add, change, remove};
};

// const diffingObject = (obj1: Fields, obj2: Fields) => {
//   let add: Fields = {};
//   let remove: Fields = {};
//   let change = {};
//   for (let key in obj1) {
//     if (!obj2[key]) remove[key] = obj1[key];
//     else {
//       //
//       if (Object.keys(add2).length) {
//         change[key] = change[key] || {};
//         change[key].add = add2;
//       }
//       if (Object.keys(remove2).length) {
//         change[key] = change[key] || {};
//         change[key].remove = remove2;
//       }
//       if (Object.keys(change2).length) {
//         change[key] = change[key] || {};
//         change[key].change = change2;
//       }
//     }
//   }
//   for (let key in obj2) if (!obj1[key]) add[key] = obj2[key];
//   return {add, remove, change};
// };

type ChangedIndex = {
  [key: string]: Indexes;
};

type ChangedIndexesMap = {
  [key: string]: ChangedIndex;
};

type AddOrRemoveIndexes = {
  [key: string]: Indexes;
};

export const diffingIndexes = (obj1: Indexes, obj2: Indexes) => {
  const change: ChangedIndexesMap = {};
  const add: AddOrRemoveIndexes = {};
  const remove: AddOrRemoveIndexes = {};

  for (let key in obj1) if (!obj2[key]) remove[key] = obj1[key];

  for (let key in obj2) {
    if (!obj1[key]) {
      add[key] = obj2[key];
      continue;
    }
    const allKeys = [
      ...new Set([...Object.keys(obj1[key]), ...Object.keys(obj2[key])]),
    ];
    if (
      allKeys.some((key2) => !checkSame(obj1[key]?.[key2], obj2[key]?.[key2]))
    ) {
      change[key] = {
        from: obj1[key],
        to: obj2[key],
      };
    }
  }
  return {add, remove, change};
};

type schemaParts = {
  fields?: boolean;
  indexes?: boolean;
  classLevelPermissions?: boolean;
};
type schemaOutputOptions = {
  ignoreClasses?: Array<string>;
  ignoreAttributes?: Array<string>;
};

export const getAllSchemas = async (
  parts: schemaParts = {},
  outputOptions: schemaOutputOptions = {}
) => {
  const schemaParts = Object.assign(
    {
      fields: true,
      indexes: true,
      classLevelPermissions: true,
    },
    parts
  );
  const options = Object.assign(
    {
      ignoreClasses: [],
      ignoreAttributes: [],
    },
    outputOptions
  );
  const {ignoreClasses, ignoreAttributes} = options;
  const list = await Parse.Schema.all();
  const clone = structuredClone(list).filter(
    (c) => !ignoreClasses.includes(c.className)
  );
  const returnList = [];
  for (let cls of clone) {
    let obj: RestSchema = {className: cls.className};
    if (schemaParts.fields) {
      obj.fields = cls.fields;
      for (let atr of ignoreAttributes ?? [])
        if (obj.fields?.[atr]) delete obj.fields[atr];
    }
    if (schemaParts.indexes) obj.indexes = cls.indexes;
    if (schemaParts.classLevelPermissions)
      obj.classLevelPermissions = cls.classLevelPermissions;
    returnList.push(obj);
  }
  return returnList;
};

// /**
//  * Manages the Parse Server schema, allowing for additions, modifications, and deletions.
//  * @param {Object} allSchemas - An object containing all schema definitions.
//  * @param {boolean} options - Flag to apply changes to the database. If false, only shows differences.
//  * @param {boolean} remove - Flag to allow removal of columns and tables.
//  * @param {boolean} purge - Flag to allow purging of non-empty tables before removal.
//  * @returns {Object} An object detailing the changes made or to be made.
//  * @see {@link https://docs.parseplatform.org/defined-schema/guide|Parse Server Schema Documentation}
//  */
// export const manageSchema = async (schema, {commit, remove, purge}) => {
//   let reviewFields = {};
//   let reviewIndexes = {};
//   for (let key in schema) {
//     reviewFields[key] = schema[key].fields;
//     reviewIndexes[key] = schema[key].indexes;
//   }

//   let existingSchema = await getAllSchemas(true, true);
//   let diff = diffingObject(existingSchema.fields, reviewFields);
//   let indexChanges = addDiffIndexes(existingSchema.indexes, reviewIndexes);

//   if (!commit) return {...diff, indexChanges, commit, log: 'Nothing happened!'};

//   for (let key in schema)
//     if (diff.add[key] || diff.change[key] || indexChanges[key])
//       await syncSchemaWithObject(
//         new Parse.Schema(key),
//         schema[key].fields,
//         schema[key].indexes
//       );

//   // remove removed classes
//   if (remove)
//     for (let key in diff.remove ?? {}) {
//       const mySchema = new Parse.Schema(key);
//       if (purge) await mySchema.purge();
//       await mySchema.delete();
//     }

//   return {...diff, indexChanges, commit, log: 'Schema changed!'};
// };
