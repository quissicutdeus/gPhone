import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('bank');

// Maps to gphone:server:bank:getTransactions
app.registerCallback('getTransactions', 'gphone:server:bank:getTransactions');
