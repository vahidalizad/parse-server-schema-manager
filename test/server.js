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
  },
  revokeSessionOnPasswordReset: false,
  allowCustomObjectId: false,
  allowClientClassCreation: true,
  encodeParseObjectInCloudFunction: true,
  masterKeyIps: ['0.0.0.0/0', '0.0.0.0', '::/0', '::'],
  emailAdapter: MockEmailAdapterWithOptions(),
  port,
  mountPath,
  enableInsecureAuthAdapters: false,
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
