type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'File'
  | 'Pointer'
  | 'Date'
  | 'GeoPoint'
  | 'polygon'
  | 'Relation'
  | 'Array'
  | 'Object';

export interface pointerOptions {
  targetClass: string;
}

export interface GenericField {
  defaultValue?: string | boolean | number | [] | {} | Date;
  required?: boolean;
}

export interface ParseACLField {
  type: 'ACL';
}

export interface ParseFieldString {
  type: 'String';
  defaultValue?: string;
}

export interface ParseFieldNumber {
  type: 'Number';
  defaultValue: number;
}

export interface ParseFieldBoolean {
  type: 'Boolean';
  defaultValue?: boolean;
}

export interface ParseFieldFile {
  type: 'File';
  defaultValue: Parse.File;
}

export interface ParseFieldPointer {
  type: 'Pointer';
  targetClass: string;
  defaultValue: Parse.Object;
}

export interface ParseFieldDate {
  type: 'Date';
  defaultValue: Date;
}

export interface ParseFieldGeoPoint {
  type: 'GeoPoint';
  defaultValue: Parse.GeoPoint;
}

export interface ParseFieldPolygon {
  type: 'Polygon';
  defaultValue: Parse.Polygon;
}

export interface ParseFieldRelation {
  type: 'Relation';
  defaultValue: Parse.Relation;
}

export interface ParseFieldArray {
  type: 'Array';
  defaultValue: Array<any>;
}

export interface ParseFieldObject {
  type: 'Object';
  defaultValue: Record<string, any>;
}

export type ParseField = GenericField &
  (
    | ParseFieldString
    | ParseFieldNumber
    | ParseFieldBoolean
    | ParseFieldFile
    | ParseFieldPointer
    | ParseFieldGeoPoint
    | ParseFieldPolygon
    | ParseFieldRelation
    | ParseFieldArray
    | ParseFieldObject
    | ParseACLField
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
  fields: ParseFields;
  classLevelPermissions?: Parse.Schema.CLP;
  indexes?: Indexes;
}
