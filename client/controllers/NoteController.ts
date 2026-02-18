import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('notes');

app.registerCallback('getNotes', 'gphone:server:notes:get');
app.registerCallback('createNote', 'gphone:server:notes:create');
app.registerCallback('updateNote', 'gphone:server:notes:update');
app.registerCallback('deleteNote', 'gphone:server:notes:delete');
