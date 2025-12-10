import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('contacts');

app.registerCallback('getContacts', 'gphone:server:contacts:get');
app.registerCallback('createContact', 'gphone:server:contacts:create');
app.registerCallback('updateContact', 'gphone:server:contacts:update');
app.registerCallback('deleteContact', 'gphone:server:contacts:delete');
