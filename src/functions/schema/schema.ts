import {checkSame} from '../object';
import {syncSchemasCLP, syncSchemaWithObject} from './sync';
import Parse from 'parse/node';

const checkSecondProperties = ['type'];

const checkOptions = ['targetClass', 'required', 'defaultValue'];

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

type DiffFieldsOutput = {
  change?: ChangeFields;
  add?: Fields;
  remove?: Fields;
};

export const diffingFields = (obj1: Fields, obj2: Fields): DiffFieldsOutput => {
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

  const output: DiffFieldsOutput = {};
  if (Object.keys(add).length) output.add = add;
  if (Object.keys(remove).length) output.remove = remove;
  if (Object.keys(change).length) output.change = change;
  return output;
};

type ChangedIndex = {
  [key: string]: Indexes;
};

type ChangedIndexesMap = {
  [key: string]: ChangedIndex;
};

type AddOrRemoveIndexes = {
  [key: string]: Indexes;
};

type DiffIndexesOutput = {
  change?: ChangedIndexesMap;
  add?: AddOrRemoveIndexes;
  remove?: AddOrRemoveIndexes;
};

export const diffingIndexes = (
  obj1: Indexes,
  obj2: Indexes
): DiffIndexesOutput => {
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
  const output: DiffIndexesOutput = {};
  if (Object.keys(add).length) output.add = add;
  if (Object.keys(remove).length) output.remove = remove;
  if (Object.keys(change).length) output.change = change;
  return output;
};

type CLP = {
  [key: string]: {
    [key: string]: any;
  };
};

type DiffClPOutput = {
  [key: string]: CLP;
};

export const diffingCLP = (obj1: CLP, obj2: CLP): DiffClPOutput => {
  const change: DiffClPOutput = {};
  for (let key in obj2) {
    const allKeys = [...Object.keys(obj1[key])];
    if (
      allKeys.some((key2) => !checkSame(obj1[key]?.[key2], obj2[key]?.[key2]))
    ) {
      change[key] = {
        from: obj1[key],
        to: obj2[key],
      };
    }
  }
  return change;
};

type DiffSchemaOutput = {
  fields?: DiffFieldsOutput;
  indexes?: DiffIndexesOutput;
  classLevelPermissions?: DiffClPOutput;
};

const sanitizeSchemaParts = (parts: SchemaParts) => {
  return Object.assign(
    {
      fields: true,
      indexes: true,
      classLevelPermissions: true,
    },
    parts
  );
};

const sanitizeSchemaOptions = (outputOptions: SchemaOutputOptions) => {
  return Object.assign(
    {
      ignoreClasses: ['_Session'],
      ignoreAttributes: [
        'ACL',
        'password',
        'authData',
        'emailVerified',
        'email',
      ],
    },
    outputOptions
  );
};

export const diffingSchema = (
  obj1: RestSchema,
  obj2: RestSchema,
  parts: SchemaParts = {}
): DiffSchemaOutput => {
  const changes: DiffSchemaOutput = {};
  const schemaParts = sanitizeSchemaParts(parts);

  if (schemaParts.fields) {
    const diff = diffingFields(obj1.fields as Fields, obj2.fields as Fields);
    if (Object.keys(diff).length) changes.fields = diff;
  }
  if (schemaParts.indexes) {
    const diff = diffingIndexes(
      obj1.indexes as Indexes,
      obj2.indexes as Indexes
    );
    if (Object.keys(diff).length) changes.indexes = diff;
  }
  if (schemaParts.classLevelPermissions) {
    const diff = diffingCLP(
      obj1.classLevelPermissions as CLP,
      obj2.classLevelPermissions as CLP
    );
    if (Object.keys(diff).length) changes.classLevelPermissions = diff;
  }
  return changes;
};

type SchemaParts = {
  fields?: boolean;
  indexes?: boolean;
  classLevelPermissions?: boolean;
};
type SchemaOutputOptions = {
  ignoreClasses?: Array<string>;
  ignoreAttributes?: Array<string>;
};

export const getAllSchemas = async (
  parts: SchemaParts = {},
  outputOptions: SchemaOutputOptions = {}
) => {
  const schemaParts = sanitizeSchemaParts(parts);
  const options = sanitizeSchemaOptions(outputOptions);

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

type AddRemoveSchema = {
  [key: string]: RestSchema;
};
type ChangeSchema = {
  [key: string]: DiffFieldsOutput | DiffIndexesOutput | DiffClPOutput;
};

type AddRemoveSchemaOutput = {
  add?: AddRemoveSchema;
  remove?: AddRemoveSchema;
};

type PartString = 'fields' | 'indexes' | 'classLevelPermissions';

const diffSchemaChanges = (
  existingSchema: Array<RestSchema>,
  schema: Array<RestSchema>,
  part: PartString
) => {
  const change: ChangeSchema = {};
  for (let cls of schema) {
    const className = cls.className;
    const existingCls = existingSchema.find(
      (c) => c.className === className
    ) as RestSchema;
    if (!existingCls) continue;
    const diff =
      part === 'fields'
        ? diffingFields(existingCls.fields as Fields, cls.fields as Fields)
        : part === 'indexes'
        ? diffingIndexes(existingCls.indexes as Indexes, cls.indexes as Indexes)
        : diffingCLP(
            existingCls.classLevelPermissions as CLP,
            cls.classLevelPermissions as CLP
          );
    if (Object.keys(diff).length) change[className] = diff;
  }
  return change;
};

const addRemoveSchemaChanges = (
  existingSchema: Array<RestSchema>,
  schema: Array<RestSchema>
) => {
  const add: AddRemoveSchema = {};
  const remove: AddRemoveSchema = {};

  for (let cls of schema) {
    const className = cls.className;
    const existingCls = existingSchema.find(
      (c) => c.className === className
    ) as RestSchema;
    if (existingCls) continue;
    add[className] = cls;
  }

  for (let cls of existingSchema) {
    const className = cls.className;
    const newCls = schema.find((c) => c.className === className) as RestSchema;
    if (newCls) continue;
    remove[className] = cls;
  }

  const output: AddRemoveSchemaOutput = {};
  if (Object.keys(add).length) output.add = add;
  if (Object.keys(remove).length) output.remove = remove;
  return output;
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
type SchemaManagerActions = {
  commit: boolean;
  remove: boolean;
  purge: boolean;
};
type ChangesDiff = {
  fields?: ChangeSchema;
  indexes?: ChangeSchema;
  classLevelPermissions?: ChangeSchema;
};
export const manageSchema = async (
  schema: Array<RestSchema>,
  {commit = false, remove = false, purge = false}: SchemaManagerActions,
  actionParts: SchemaParts = {},
  schemaOptions: SchemaOutputOptions = {}
) => {
  const schemaParts = sanitizeSchemaParts(actionParts);
  const options = sanitizeSchemaOptions(schemaOptions);

  const existingSchema = await getAllSchemas(actionParts, options);
  const addRemove = addRemoveSchemaChanges(existingSchema, schema);
  const changesDiff: ChangesDiff = {};
  for (let key in schemaParts)
    if (schemaParts[key as PartString] as boolean | undefined)
      changesDiff[key as PartString] = diffSchemaChanges(
        existingSchema,
        schema,
        key as PartString
      );

  let log = 'Nothing changed!';
  if (commit) {
    for (let key in addRemove.add ?? {})
      await syncSchemaWithObject(
        new Parse.Schema(key),
        addRemove.add?.[key].fields,
        addRemove.add?.[key].indexes
      );

    let keysToSync: Set<string> | Array<string> = new Set();
    for (let classKey in changesDiff.fields ?? {}) keysToSync.add(classKey);
    for (let classKey in changesDiff.indexes ?? {}) keysToSync.add(classKey);
    keysToSync = [...keysToSync];

    for (let key of keysToSync) {
      const cls = schema.find((t) => t.className === key);
      await syncSchemaWithObject(
        new Parse.Schema(key),
        cls?.fields,
        cls?.indexes
      );
    }

    for (let key in changesDiff.classLevelPermissions ?? {})
      await syncSchemasCLP(key, changesDiff.classLevelPermissions?.[key]);

    log = 'Schema synced!';
  }

  if (remove)
    for (let key in addRemove.remove ?? {}) {
      const mySchema = new Parse.Schema(key);
      if (purge) await mySchema.purge();
      await mySchema.delete();
      log = 'Schema synced!';
    }

  return {...addRemove, ...changesDiff, commit, log: 'Nothing happened!'};
};
