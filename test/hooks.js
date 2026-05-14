import Parse from 'parse/node';
import {TestUtils} from 'parse-server';
import detect from 'detect-port';
import {afterAll, beforeAll} from 'bun:test';
import {port, reconfigureServer, serverURL} from './server';

const wait = (t) => new Promise((r) => setTimeout(r, t));

const isReady = async () => {
  try {
    await Parse.Schema.all();
    console.info('Parse Schema isReady');
  } catch (e) {
    await reconfigureServer();
    await wait(3000);
    return isReady();
  }
};

beforeAll(async () => {
  process.env.TESTING = true;

  const openPort = await detect(port);
  if (openPort === port) {
    console.log('Initiating parse server instance');
    await reconfigureServer();
  } else console.log('Using the running parse server.');

  Parse.initialize('dev');
  Parse.serverURL = serverURL;
  Parse.CoreManager.set('SERVER_URL', serverURL);
  Parse.CoreManager.set('MASTER_KEY', 'devdevdev');
  globalThis.Parse = Parse;

  await isReady();
});

afterAll(async () => {
  await Parse.User.logOut();
  Parse.Storage._clear();
  await TestUtils.destroyAllDataPermanently(true);
});
