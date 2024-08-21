import Parse from 'parse/node';
import {ParseServer, TestUtils} from 'parse-server';
import Path from 'path';
import MockEmailAdapterWithOptions from './support/MockEmailAdapterWithOptions';
import detect from 'detect-port';

const port = 1327;
const mountPath = '/api/parse';
const serverURL = 'http://127.0.0.1:1327/api/parse';

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
};

const openConnections = {};
let parseServer;

const reconfigureServer = async () => {
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
  parseServer.server.on('connection', (connection) => {
    const key = `${connection.remoteAddress}:${connection.remotePort}`;
    openConnections[key] = connection;
    connection.on('close', () => {
      delete openConnections[key];
    });
    connection.on('error', console.log);
  });
  return parseServer;
};

const wait = (t) => new Promise((r) => setTimeout(r, t));

const isReady = async () => {
  try {
    await Parse.Schema.all();
    console.info('Parse Schema isReady');
  } catch (e) {
    await wait(3000);
    return isReady();
  }
};

export async function mochaGlobalSetup() {
  process.env.TESTING = true;

  let openPort = await detect(port);
  if (openPort === port) {
    console.log('Initiating parse server instance');
    await reconfigureServer();
  } else console.log('Using the running parse server.');

  Parse.initialize('dev');
  Parse.CoreManager.set('SERVER_URL', serverURL);
  Parse.CoreManager.set('MASTER_KEY', 'devdevdev');

  await isReady();
}

export function mochaGlobalTeardown() {
  if (Object.keys(openConnections).length > 1) {
    console.warn(
      'There were open connections to the server left after the test finished'
    );
  }
}

export const mochaHooks = {
  async afterEach() {
    await Parse.User.logOut();
    Parse.Storage._clear();
    await TestUtils.destroyAllDataPermanently(true);
  },
};
