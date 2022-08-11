import Parse from 'parse/node';
const {APP_ID, REST_KEY, MASTER_KEY, SERVER_URL} = process.env;

Parse.initialize(APP_ID, REST_KEY, MASTER_KEY);
Parse.masterKey = MASTER_KEY;
Parse.serverURL = SERVER_URL;

debugger;
