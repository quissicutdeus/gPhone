import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('conversations');

app.registerCallback('getConversations', 'gphone:server:conversations:get');
app.registerCallback('startConversation', 'gphone:server:conversations:create');
app.registerCallback('deleteConversation', 'gphone:server:conversations:delete');
app.registerCallback('leaveConversation', 'gphone:server:conversations:delete');
