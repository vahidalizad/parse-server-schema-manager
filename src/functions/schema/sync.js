import {checkSame} from '../object';

const ignoreIndexesKeys = ['_id_'];

const globalKeys = ['objectId', 'updatedAt', 'createdAt', 'ACL'];

export const syncSchemaWithObject = async (className, schemaObject) => {
  const schema = new Parse.Schema(className);
  let available = {fields: {}, indexes: {}, classLevelPermissions: {}};
  try {
    available = await schema.get();
  } catch (e) {
    // throw e;
  }

  const fields = schemaObject.fields;
  const indexes = schemaObject.indexes;
  const CLP = schemaObject.classLevelPermissions;

  // sync fields
  for (let key in fields)
    if (!available.fields || !available.fields[key])
      schema.addField(key, fields[key].type, fields[key].options);

  let objectFields = Object.keys(fields);
  for (let cKey in available.fields)
    if (!objectFields.includes(cKey) && !globalKeys.includes(cKey))
      schema.deleteField(cKey);

  // update fields options
  for (let cKey in available.fields) {
    if (!fields[cKey]) continue;
    let cache = JSON.parse(JSON.stringify(fields[cKey]));
    cache = {...cache, ...(cache.options ?? {})};
    delete cache['options'];

    let availableCache = JSON.parse(JSON.stringify(available.fields[cKey]));
    if (availableCache.required === false && !cache.required) {
      delete cache['required'];
      delete availableCache['required'];
    }
    if (!checkSame(availableCache, cache)) {
      if (availableCache.type !== cache.type)
        throw `Can't change type of a column you got to remove it then add it.`;
      schema.addField(cKey, fields[cKey].type, fields[cKey].options);
    }
  }

  // sync indexes
  for (let key in indexes)
    if (!available.indexes || !available.indexes[key])
      schema.addIndex(key, indexes[key]);

  let changedIndexes = false;
  let indexesKeys = Object.keys(indexes);
  for (let cKey in available.indexes) {
    if (ignoreIndexesKeys.includes(cKey)) continue;
    if (!indexesKeys.includes(cKey)) schema.deleteIndex(cKey);
    else if (!checkSame(indexes[cKey], available.indexes[cKey])) {
      changedIndexes = true;
      schema.deleteIndex(cKey);
    }
  }
  if (changedIndexes) {
    await schema.update();
    // add removed indexes
    for (let cKey in available.indexes) {
      if (ignoreIndexesKeys.includes(cKey)) continue;
      if (!indexesKeys.includes(cKey)) continue;
      if (!checkSame(indexes[cKey], available.indexes[cKey]))
        schema.addIndex(cKey, indexes[cKey]);
    }
  }

  // sync CLP
  schema.setCLP(CLP);

  return Object.keys(available.fields).length ? schema.update() : schema.save();
};
