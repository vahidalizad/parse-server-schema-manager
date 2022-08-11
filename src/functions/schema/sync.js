const ignoreIndexesKeys = ['_id_'];

const globalKeys = ['objectId', 'updatedAt', 'createdAt', 'ACL'];

export const syncSchemaWithObject = async (schema, obj, indexes = {}) => {
  let change = false;
  let available = {fields: {}, indexes: {}};
  try {
    available = await schema.get();
  } catch (e) {
    // throw e;
  }

  for (let key in obj)
    if (!available.fields || !available.fields[key]) {
      change = true;
      schema.addField(key, obj[key].type, obj[key].options);
    }

  let objectFields = Object.keys(obj);
  for (let cKey in available.fields)
    if (!objectFields.includes(cKey) && !globalKeys.includes(cKey)) {
      change = true;
      schema.deleteField(cKey);
    }

  for (let key in indexes)
    if (!available.indexes || !available.indexes[key]) {
      change = true;
      schema.addIndex(key, indexes[key]);
    }

  let indexesKeys = Object.keys(indexes);
  for (let cKey in available.indexes)
    if (!indexesKeys.includes(cKey) && !ignoreIndexesKeys.includes(cKey)) {
      change = true;
      schema.deleteIndex(cKey);
    }

  return Object.keys(available.fields).length
    ? change
      ? schema.update()
      : Promise.resolve()
    : schema.save();
};
