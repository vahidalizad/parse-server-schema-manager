type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'File'
  | 'Pointer'
  | 'Date'
  | 'GeoPoint'
  | 'Relation'
  | 'Array'
  | 'Object';

export interface pointerOptions {
  targetClass: string;
}

export interface GenericField {
  defaultValue?: unknown;
  required?: boolean;
}

export interface ParseFieldString {
  type: 'String';
  defaultValue?: string;
}

export interface ParseFieldNumber {
  type: 'Number';
}

export interface ParseFieldBoolean {
  type: 'Boolean';
  defaultValue?: boolean;
}

export interface ParseFieldFile {
  type: 'File';
}

export interface ParseFieldPointer {
  type: 'Pointer';
  targetClass: string;
}

export interface ParseFieldDate {
  type: 'Date';
}

export interface ParseFieldGeoPoint {
  type: 'GeoPoint';
}

export interface ParseFieldRelation {
  type: 'Relation';
}

export interface ParseFieldArray {
  type: 'Array';
}

export interface ParseFieldObject {
  type: 'Object';
}

export type ParseField = GenericField &
  (
    | ParseFieldString
    | ParseFieldNumber
    | ParseFieldBoolean
    | ParseFieldFile
    | ParseFieldPointer
    | ParseFieldGeoPoint
    | ParseFieldRelation
    | ParseFieldArray
    | ParseFieldObject
  );

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
