import {checkSame} from '../object';

const ignoreIndexesKeys = ['_id_'];

const globalKeys = ['objectId', 'updatedAt', 'createdAt', 'ACL'];

export const syncSchemaWithObject = async (schema, obj, indexes = {}) => {
  let available = {fields: {}, indexes: {}};
  try {
    available = await schema.get();
  } catch (e) {
    // throw e;
  }

  // sync fields
  for (let key in obj)
    if (!available.fields || !available.fields[key])
      schema.addField(key, obj[key].type, obj[key].options);

  let objectFields = Object.keys(obj);
  for (let cKey in available.fields)
    if (!objectFields.includes(cKey) && !globalKeys.includes(cKey))
      schema.deleteField(cKey);

  // update fields options
  for (let cKey in available.fields) {
    if (!obj[cKey]) continue;
    let cache = JSON.parse(JSON.stringify(obj[cKey]));
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
      schema.addField(cKey, obj[cKey].type, obj[cKey].options);
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

  return Object.keys(available.fields).length ? schema.update() : schema.save();
};
