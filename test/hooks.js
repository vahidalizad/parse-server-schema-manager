import Parse, {serverURL} from 'parse/node';
import {TestUtils} from 'parse-server';
import detect from 'detect-port';
import {port, reconfigureServer} from './server';

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
  // if (Object.keys(openConnections).length > 1) {
  //   console.warn(
  //     'There were open connections to the server left after the test finished'
  //   );
  // }
}

export const mochaHooks = {
  async afterEach() {
    await Parse.User.logOut();
    Parse.Storage._clear();
    await TestUtils.destroyAllDataPermanently(true);
  },
};
