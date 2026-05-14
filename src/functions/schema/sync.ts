import {ParseClassSchema, ParseField, ParseFieldPointer} from '@Types/fields';
import {checkSame} from '../object';

const ignoreIndexesKeys = ['_id_'];

const globalKeys = ['objectId', 'updatedAt', 'createdAt', 'ACL'];

const saveSchema = async (schema: Parse.Schema) => {
  try {
    await schema.update();
  } catch (e) {
    try {
      await schema.save();
    } catch {
      throw e;
    }
  }
};

const getFieldOptions = (field: ParseField) => {
  let options: Record<string, unknown> = {type: field.type};
  if ('targetClass' in field) {
    if (field.targetClass !== undefined)
      options.targetClass = field.targetClass;
  }
  if (field.defaultValue !== undefined)
    options.defaultValue = field.defaultValue;
  if (field.required !== undefined) options.required = field.required;
  return options;
};

export const syncSchemaWithObject = async (
  className: string,
  schemaObject: ParseClassSchema | undefined,
  ignoreAttributes: string[]
) => {
  if (!schemaObject) return;
  let schema = new Parse.Schema(className);
  let available: Parse.RestSchema = {
    className: className,
    fields: {},
    indexes: {},
    classLevelPermissions: {},
  };
  try {
    available = await schema.get();
  } catch (e) {
    await schema.save();
    available = await schema.get();
  }

  const fields = structuredClone(schemaObject.fields);
  const indexes = structuredClone(schemaObject.indexes) || {};
  const CLP = schemaObject.classLevelPermissions || {};

  for (let ignore of ignoreIndexesKeys) delete indexes[ignore];

  for (let ignore of ignoreAttributes) {
    delete fields[ignore];
    delete available.fields[ignore];
  }

  // sync fields
  for (let key in fields)
    if (!available.fields || !available.fields[key])
      schema.addField(key, fields[key].type, getFieldOptions(fields[key]));

  let objectFields = Object.keys(fields);
  for (let cKey in available.fields)
    if (!objectFields.includes(cKey) && !globalKeys.includes(cKey))
      schema.deleteField(cKey);

  // update fields options
  for (let cKey in available.fields) {
    if (!fields[cKey]) continue;
    let cache = JSON.parse(JSON.stringify(fields[cKey]));

    let availableCache = JSON.parse(JSON.stringify(available.fields[cKey]));
    if (availableCache.required === false && !cache.required) {
      delete cache['required'];
      delete availableCache['required'];
    }
    if (!checkSame(availableCache, cache)) {
      if (availableCache.type !== cache.type)
        throw `Can't change type of a column you got to remove it then add it.`;
      schema.addField(cKey, fields[cKey].type, getFieldOptions(fields[cKey]));
    }
  }

  // sync CLP
  schema.setCLP(CLP);
  await saveSchema(schema);

  // sync indexes
  for (let key in indexes)
    if (!available.indexes || !available.indexes[key])
      schema.addIndex(key, indexes[key]);

  let indexesKeys = Object.keys(indexes);
  for (let cKey in available.indexes) {
    if (ignoreIndexesKeys.includes(cKey)) continue;
    if (!indexesKeys.includes(cKey)) schema.deleteIndex(cKey);
    else if (!checkSame(indexes[cKey], available.indexes[cKey]))
      schema.deleteIndex(cKey);
  }

  await schema.update();

  // add removed indexes
  for (let cKey in available.indexes) {
    if (ignoreIndexesKeys.includes(cKey)) continue;
    if (!indexesKeys.includes(cKey)) continue;
    if (!checkSame(indexes[cKey], available.indexes[cKey]))
      schema.addIndex(cKey, indexes[cKey]);
  }

  await schema.update();
};
