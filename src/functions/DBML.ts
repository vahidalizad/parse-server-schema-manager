import Parse from 'parse/node';
import fs from 'fs';

const colors = {
  red: '#d32f2f',
  pink: '#c2185b',
  purple: '#7b1fa2',
  deepPurple: '#512da8',
  indigo: '#303f9f',
  blue: '#1976d2',
  lightBlue: '#0277bd',
  cyan: '#00838f',
  teal: '#00796b',
  green: '#2e7d32',
  lightGreen: '#387002',
  lime: '#6c6f00',
  yellow: '#bc5100',
  amber: '#c43e00',
  orange: '#bb4d00',
  deepOrange: '#ac0800',
  brown: '#5d4037',
  grey: '#616161',
  blueGrey: '#455a64',
};

const colorByIndex = (id: number) => {
  const colorsArray = Object.values(colors);
  const index = id % colorsArray.length;
  return colorsArray[index];
};

/**
 * Creates a DBML (Database Markup Language) file from Parse Server schemas.
 *
 * @param {Record<string, Record<string, string>>} additionalPointers - Additional pointer relationships to include in the DBML file.
 * @param {string} filename - The name of the output DBML file.
 * @returns {Promise<void>}
 */
export const createDBMLFile = async (
  additional: Record<string, Record<string, string>> = {},
  schemaDBML = '_SCHEMA.dbml'
) => {
  let DBML = [];
  DBML.push(`// Generated by Server Components Tools`);

  const _SCHEMA = await Parse.Schema.all();
  for (let classIndex in _SCHEMA) {
    const parseClass = _SCHEMA[classIndex];
    const className = parseClass.className;

    const keys = Object.keys(parseClass.fields);

    const fields = keys.filter(
      (key) => !['_id', 'objectId', 'updatedAt', 'createdAt'].includes(key)
    );

    const color = colorByIndex(Number(classIndex));

    let TABLE = `Table ${className} [headercolor: ${color}] {
    objectId String
    createdAt Date [default: \`now()\`, note: "created time"]
    updatedAt Date [default: \`now()\`, note: "updated time"]
`;

    const scalarFields = [];
    const pointerFields = [];
    const relationFields = [];

    const indexes = [];
    indexes.push(`      objectId [pk]`);
    for (let ind in parseClass.indexes) {
      if (ind === '_id_') continue;
      let indKeys = Object.keys(parseClass.indexes[ind]);
      let first = indKeys.length > 1 ? `(${indKeys.join(', ')})` : indKeys[0];
      let second = `[name: '${ind}']`;
      indexes.push(`      ${first} ${second}`);
    }

    const dbmlOptions: Record<string, string> = {};

    for (let fieldName of fields) {
      let field = parseClass.fields[fieldName];
      const fieldType = field.type;

      const messages: string[] = [];

      if (additional?.[className]?.[fieldName])
        messages.push(additional[className][fieldName]);

      if (field.defaultValue !== undefined)
        messages.push(`default: \`${JSON.stringify(field.defaultValue)}\``);

      const notes = [];
      if (field.required) notes.push('required');

      if (fieldType === 'Pointer') {
        pointerFields.push(fieldName);
        messages.push(`ref: > ${field.targetClass}.objectId`);
        notes.push('MANY-to-ONE');
      } else if (fieldType === 'Relation') {
        relationFields.push(fieldName);
        messages.push(`ref: - ${field.targetClass}.objectId`);
        notes.push('MANY-to-MANY');
      } else scalarFields.push(fieldName);

      messages.push(`note: '${notes.join(', ')}'`);

      const dbmlOptionsAsString = dbmlOptions[fieldName].length
        ? `[${messages.join(', ')}]`
        : '';
      dbmlOptions[fieldName] = dbmlOptionsAsString;
    }

    scalarFields.forEach((fieldName) => {
      const fieldType = parseClass.fields[fieldName].type;
      TABLE += `    ${fieldName} ${fieldType} ${dbmlOptions[fieldName]}
`;
    });

    pointerFields.forEach((fieldName) => {
      TABLE += `    ${fieldName} "Pointer" ${dbmlOptions[fieldName]}
`;
    });

    relationFields.forEach((fieldName) => {
      TABLE += `    ${fieldName} "Relation" ${dbmlOptions[fieldName]}
`;
    });

    TABLE += `
    indexes {
${indexes.join('\n')}
    }
`;
    TABLE += `}`;
    DBML.push(TABLE);
  }

  const dbml = DBML.join('\n\n');

  fs.writeFileSync(schemaDBML, dbml);
};
