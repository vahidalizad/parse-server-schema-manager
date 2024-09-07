import {JSONValue} from './values';

export interface pointerOptions {
  targetClass: string;
}

export interface GenericField<T> {
  defaultValue?: T;
  required?: boolean;
}

export interface ParseFieldString extends GenericField<string> {
  type: 'String';
}

export interface ParseFieldNumber extends GenericField<number> {
  type: 'Number';
}

export interface ParseFieldBoolean extends GenericField<boolean> {
  type: 'Boolean';
}

export interface ParseFieldFile extends GenericField<Parse.File> {
  type: 'File';
}

export interface ParseFieldPointer
  extends GenericField<Parse.Pointer | Parse.Object> {
  type: 'Pointer';
  targetClass: string;
}

export interface ParseFieldDate extends GenericField<Date> {
  type: 'Date';
}

export interface ParseFieldGeoPoint extends GenericField<Parse.GeoPoint> {
  type: 'GeoPoint';
}

export interface ParseFieldPolygon extends GenericField<Parse.Polygon> {
  type: 'Polygon';
}

export interface ParseFieldRelation extends GenericField<Parse.Relation> {
  type: 'Relation';
}

export interface ParseFieldArray extends GenericField<Array<any>> {
  type: 'Array';
}

export interface ParseFieldObject extends GenericField<JSONValue> {
  type: 'Object';
}

export type ParseField =
  | ParseFieldString
  | ParseFieldNumber
  | ParseFieldBoolean
  | ParseFieldFile
  | ParseFieldPointer
  | ParseFieldGeoPoint
  | ParseFieldPolygon
  | ParseFieldRelation
  | ParseFieldArray
  | ParseFieldObject;

export interface ParseFields {
  [key: string]: ParseField;
}

type Indexes = {
  [key: string]: {
    [key: string]: number;
  };
};

export interface ParseClassSchema {
  className: string;
  fields: Record<string, ParseField>;
  classLevelPermissions?: Parse.Schema.CLP;
  indexes?: Indexes;
}
