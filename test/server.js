import {ParseServer} from 'parse-server';
import MockEmailAdapterWithOptions from './support/MockEmailAdapterWithOptions';

export const port = 1327;
export const mountPath = '/api/parse';
export const serverURL = 'http://127.0.0.1:1327/api/parse';

const defaultConfiguration = {
  databaseURI: 'mongodb://127.0.0.1:27017/schema-test',
  appId: 'dev',
  masterKey: 'devdevdev',
  serverURL,
  liveQuery: {
    classNames: [],
  },
  startLiveQueryServer: true,
  verbose: false,
  silent: true,
  fileUpload: {
    enableForPublic: true,
    enableForAnonymousUser: true,
    enableForAuthenticatedUser: true,
    allowedFileUrlDomains: [],
  },
  pages: {
    encodePageParamHeaders: true,
  },
  revokeSessionOnPasswordReset: false,
  allowCustomObjectId: false,
  allowClientClassCreation: true,
  masterKeyIps: ['0.0.0.0/0', '0.0.0.0', '::/0', '::'],
  readOnlyMasterKeyIps: ['127.0.0.1', '::1'],
  requestComplexity: {
    includeDepth: 10,
    includeCount: 100,
    subqueryDepth: 10,
    queryDepth: 10,
    graphQLDepth: 20,
    graphQLFields: 200,
    batchRequestLimit: 100,
  },
  protectedFieldsOwnerExempt: false,
  protectedFieldsTriggerExempt: true,
  protectedFieldsSaveResponseExempt: false,
  installation: {
    duplicateDeviceTokenActionEnforceAuth: true,
  },
  emailAdapter: MockEmailAdapterWithOptions(),
  port,
  mountPath,
};

let parseServer;

export const reconfigureServer = async () => {
  if (parseServer) {
    await parseServer.handleShutdown();
    await new Promise((resolve) => parseServer.server.close(resolve));
    parseServer = undefined;
    return reconfigureServer();
  }

  parseServer = await ParseServer.startApp(defaultConfiguration);
  if (parseServer.config.state === 'initialized') {
    console.error('Failed to initialize Parse Server');
    return reconfigureServer();
  }
  //   parseServer.server.on('connection', (connection) => {
  //     const key = `${connection.remoteAddress}:${connection.remotePort}`;
  //     global.openConnections = global.openConnections || {};
  //     openConnections[key] = connection;
  //     connection.on('close', () => {
  //       delete openConnections[key];
  //     });
  //     connection.on('error', console.log);
  //   });
  return parseServer;
};
