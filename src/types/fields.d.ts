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

export interface ParseField {
  type: FieldType;
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
