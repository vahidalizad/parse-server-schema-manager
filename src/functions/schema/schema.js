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

const diffingObject = (obj1, obj2) => {
  let add = {};
  let remove = {};
  let change = {};
  for (let key in obj1) {
    if (!obj2[key]) remove[key] = obj1[key];
    else {
      let add2 = {};
      let remove2 = {};
      let change2 = {};
      for (let key2 in obj2[key]) {
        if (!obj1[key][key2]) add2[key2] = obj2[key][key2];
        else {
          for (let pr of checkSecondProperties)
            if (obj1[key][key2]?.[pr] !== obj2[key][key2]?.[pr]) {
              change2[key2] = change2[key2] ?? [];
              change2[key2].push(
                `${pr}: ${obj1[key][key2][pr]} -> ${obj2[key][key2][pr]}`
              );
            }
          for (let pr of checkOptions)
            if (
              !checkSame(obj1[key][key2]?.[pr], obj2[key][key2]?.options?.[pr])
            ) {
              if (
                pr === 'required' &&
                obj1[key][key2]?.[pr] === false &&
                !obj2[key][key2]?.options?.[pr]
              )
                continue;
              if (
                pr === 'defaultValue' &&
                obj1[key][key2]?.[pr] === false &&
                !obj2[key][key2]?.options?.[pr]
              )
                continue;
              change2[key2] = change2[key2] ?? [];
              change2[key2].push(
                `${pr}: ${JSON.stringify(
                  obj1[key][key2][pr]
                )} -> ${JSON.stringify(obj2[key][key2]?.options?.[pr])}`
              );
            }
        }
      }
      for (let key2 in obj1[key])
        if (!obj2[key][key2]) remove2[key2] = obj1[key][key2];
      if (Object.keys(add2).length) {
        change[key] = change[key] || {};
        change[key].add = add2;
      }
      if (Object.keys(remove2).length) {
        change[key] = change[key] || {};
        change[key].remove = remove2;
      }
      if (Object.keys(change2).length) {
        change[key] = change[key] || {};
        change[key].change = change2;
      }
    }
  }
  for (let key in obj2) if (!obj1[key]) add[key] = obj2[key];
  return {add, remove, change};
};

const addDiffIndexes = (obj1, obj2) => {
  let indexChanges = {};
  for (let key in obj2) {
    let oldInd = {};
    let toInd = {};
    let diff = (key2) => {
      if (!checkSame(obj1[key]?.[key2], obj2[key]?.[key2])) {
        oldInd[key2] = obj1[key]?.[key2];
        toInd[key2] = obj2[key]?.[key2];
      }
    };
    for (let key2 in obj2[key] ?? {}) diff(key2);
    for (let key2 in obj1[key] ?? {}) diff(key2);
    if (Object.keys(oldInd).length) {
      indexChanges[key] = {
        from: oldInd,
        to: toInd,
      };
    }
  }
  return indexChanges;
};

export const getAllSchemas = async (
  ignoreAdditional = false,
  indexes = false
) => {
  let list = await Parse.Schema.all();
  let obj = list.reduce((a, b) => {
    if (
      !ignoreTables.includes(b.className) &&
      (!ignoreAdditional || !ignoreAdditionalTables.includes(b.className))
    )
      a[b.className] = b.fields;
    for (let atr of ignoreAttributes)
      if (a[b.className] && a[b.className][atr]) delete a[b.className][atr];
    if (ignoreAdditional)
      for (let atr of ignoreAdditionalAttributes)
        if (a[b.className] && a[b.className][atr]) delete a[b.className][atr];
    return a;
  }, {});
  if (indexes)
    return {
      fields: obj,
      indexes: list.reduce((a, b) => {
        if (
          !ignoreTables.includes(b.className) &&
          (!ignoreAdditional || !ignoreAdditionalTables.includes(b.className))
        ) {
          a[b.className] = b.indexes ?? {};
          delete a[b.className]['_id_'];
        }
        return a;
      }, {}),
    };
  return obj;
};

export const manageSchema = async (schema, commit, remove, purge) => {
  let reviewFields = {};
  let reviewIndexes = {};
  for (let key in schema) {
    reviewFields[key] = schema[key].fields;
    reviewIndexes[key] = schema[key].indexes;
  }

  let existingSchema = await getAllSchemas(true, true);
  let diff = diffingObject(existingSchema.fields, reviewFields);
  let indexChanges = addDiffIndexes(existingSchema.indexes, reviewIndexes);

  if (!commit) return {...diff, indexChanges, commit, log: 'Nothing happened!'};

  for (let key in schema)
    if (diff.add[key] || diff.change[key] || indexChanges[key])
      await syncSchemaWithObject(
        new Parse.Schema(key),
        schema[key].fields,
        schema[key].indexes
      );

  // remove removed classes
  if (remove)
    for (let key in diff.remove ?? {}) {
      const mySchema = new Parse.Schema(key);
      if (purge) await mySchema.purge();
      await mySchema.delete();
    }

  return {...diff, indexChanges, commit, log: 'Schema changed!'};
};
