import {checkSame} from '@Functions/object';
import Parse from 'parse/node';

const diffSchemaCLP = async (allCLP) => {
  let list = await Parse.Schema.all();
  let changes = {};
  for (let l of list) {
    let cl = l.className;
    if (['_Role', '_Session'].includes(cl)) continue;
    let dbClp = l.classLevelPermissions;
    let nowClp = allCLP[cl];
    if (!checkSame(dbClp, nowClp)) {
      changes[cl] = changes[cl] ?? {};
      for (let key in dbClp) {
        if (!checkSame(dbClp[key], nowClp[key])) {
          changes[cl][key] = {db: dbClp[key], code: nowClp[key]};
        }
      }
    }
  }
  return changes;
};

const syncSchemasCLP = async (allCLP, diff) => {
  for (let key in allCLP) {
    if (!diff[key]) continue;
    let schema = new Parse.Schema(key);
    let available;
    try {
      available = await schema.get();
    } catch (e) {}
    if (available) {
      schema.setCLP(allCLP[key]);
      await schema.update();
    }
  }
};

/**
 * Manages Class Level Permissions (CLP) for Parse Server classes.
 * @param {Object} allCLP - An object containing CLP definitions for all classes.
 * @param {boolean} commit - Flag to apply changes to the database. If false, only shows differences.
 * @returns {Object} An object detailing the changes made or to be made to CLPs.
 * @see {@link https://docs.parseplatform.org/defined-schema/guide|Parse Server CLP Documentation}
 */
export const manageCLP = async (allCLP, commit) => {
  let diff = await diffSchemaCLP(allCLP);
  if (commit) await syncSchemasCLP(allCLP, diff);
  return {
    ...diff,
    commit,
    log: commit ? 'CLP Changed!' : 'Nothing happened!',
  };
};
