import type Parse from 'parse/node';

type ParseInstance = typeof Parse;

let configuredParse: ParseInstance | undefined;

const getGlobalParse = (): ParseInstance | undefined => {
  return (globalThis as typeof globalThis & {Parse?: ParseInstance}).Parse;
};

const loadPeerParse = (): ParseInstance | undefined => {
  try {
    return require('parse/node') as ParseInstance;
  } catch {
    return undefined;
  }
};

export const setParseInstance = (parse: ParseInstance | undefined) => {
  configuredParse = parse;
};

export const getParseInstance = (): ParseInstance => {
  const parse = configuredParse ?? getGlobalParse() ?? loadPeerParse();

  if (!parse?.Schema) {
    throw new Error(
      'parse-server-schema-manager could not find an active Parse SDK instance. In Parse Server Cloud Code, global.Parse should be available; otherwise call setParseInstance(Parse) before using schema functions.'
    );
  }

  return parse;
};
