type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'File'
  | 'Pointer'
  | 'Array'
  | 'Object';

export interface globalOptions {
  required: boolean;
}

export interface pointerOptions {
  targetClass: string;
}

// TODO: ali fix it this should be this one not the bellow one but it gives error
// export interface ParseField {
//   type: FieldType;
//   targetClass?: string;
//   defaultValue?: string;
//   required?: boolean;
// }

export interface ParseField {
  [key: string]: string | boolean;
}

export interface ParseFieldString extends ParseField {
  type: 'String';
  options: globalOptions & {defaultValue: string};
}

export interface ParseFieldNumber extends ParseField {
  type: 'Number';
  options: globalOptions & {defaultValue: number};
}

export interface ParseFieldBoolean extends ParseField {
  type: 'Boolean';
  options: globalOptions & {defaultValue: boolean};
}

export interface ParseFieldFile extends ParseField {
  type: 'File';
  options: globalOptions;
}

export interface ParseFieldPointer extends ParseField {
  type: 'Pointer';
  options: globalOptions & pointerOptions;
}

export interface ParseFields {
  [key: string]: ParseField;
}

type Indexes = {
  [key: string]: {
    [key: string]: any;
  };
};

export interface ParseClassSchema {
  className: string;
  fields?: ParseFields;
  classLevelPermissions?: Parse.Schema.CLP;
  indexes?: Indexes;
}
