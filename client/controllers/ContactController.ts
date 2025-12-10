import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('contacts');

// Registers 'getContacts', 'createContact', 'updateContact', 'deleteContact'
app.registerCallback('getContacts', 'gphone:server:contacts:get');
app.registerCallback('createContact', 'gphone:server:contacts:create');
app.registerCallback('updateContact', 'gphone:server:contacts:update');
app.registerCallback('deleteContact', 'gphone:server:contacts:delete');
