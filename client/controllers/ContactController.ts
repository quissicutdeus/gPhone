import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('contacts');

app.registerCallback('getContacts', 'gphone:server:contacts:get');
app.registerCallback('createContact', 'gphone:server:contacts:create');
app.registerCallback('updateContact', 'gphone:server:contacts:update');
app.registerCallback('deleteContact', 'gphone:server:contacts:delete');

// Register manual NUI callback for client-side logic
RegisterNuiCallbackType('shareContact');
on('__cfx_nui:shareContact', (data: any, cb: Function) => {
    // Proximity logic would go here
    console.log('Searching for nearby players to share contact...');

    // Simulate finding players and sending (or just return success for now)
    // In a real implementation, you'd calculate distance, find players, and TriggerServerEvent to send info.

    cb({ success: true });
});
