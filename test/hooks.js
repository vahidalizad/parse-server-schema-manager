import Parse from 'parse/node';
import {TestUtils} from 'parse-server';
import detect from 'detect-port';
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

export const mochaHooks = {
  async beforeAll() {
    this.timeout(50000);
    process.env.TESTING = true;

    let openPort = await detect(port);
    if (openPort === port) {
      console.log('Initiating parse server instance');
      await reconfigureServer();
    } else console.log('Using the running parse server.');

    Parse.initialize('dev');
    Parse.serverURL = serverURL;
    Parse.CoreManager.set('SERVER_URL', serverURL);
    Parse.CoreManager.set('MASTER_KEY', 'devdevdev');

    await isReady();
  },

  async afterAll() {
    await Parse.User.logOut();
    Parse.Storage._clear();
    await TestUtils.destroyAllDataPermanently(true);
  },
};
