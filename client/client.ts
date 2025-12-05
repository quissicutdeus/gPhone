let isPhoneOpen = false;

// Function to send time to NUI
const sendTimeToNui = () => {
  const hours = GetClockHours();
  const minutes = GetClockMinutes();
  SendNuiMessage(JSON.stringify({
    action: 'setTime',
    data: {
      hours,
      minutes
    }
  }));
};

// Toggle Phone Command
RegisterCommand('togglePhone', () => {
  isPhoneOpen = !isPhoneOpen;

  if (isPhoneOpen) {
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({
      action: 'setVisible',
      data: true
    }));
    // Send time immediately when opening
    sendTimeToNui();
  } else {
    SetNuiFocus(false, false);
    SendNuiMessage(JSON.stringify({
      action: 'setVisible',
      data: false
    }));
  }
}, false);

// Register Key Mapping
RegisterKeyMapping('togglePhone', 'Open Phone', 'keyboard', 'm');

// NUI Callback to close phone
RegisterNuiCallbackType('hideFrame');
on('__cfx_nui:hideFrame', (_: any, cb: Function) => {
  isPhoneOpen = false;
  SetNuiFocus(false, false);
  SendNuiMessage(JSON.stringify({
    action: 'setVisible',
    data: false
  }));
  cb({});
});

// NUI Callback to get bank balance
RegisterNuiCallbackType('getBankBalance');
on('__cfx_nui:getBankBalance', (_: any, cb: Function) => {
  try {
    const PlayerData = exports['qbx_core'].GetPlayerData();
    cb(PlayerData.money.bank);
  } catch (error) {
    console.error("Error getting bank balance from qbx_core:", error);
    cb(0);
  }
});

// Transaction Callback Logic
const pendingCallbacks = new Map<string, Function>();

onNet('gphone:client:bank:receiveTransactions', (cbId: string, data: any) => {
  if (pendingCallbacks.has(cbId)) {
    const cb = pendingCallbacks.get(cbId);
    if (cb) cb(data);
    pendingCallbacks.delete(cbId);
  }
});

RegisterNuiCallbackType('getTransactions');
on('__cfx_nui:getTransactions', (_: any, cb: Function) => {
  const cbId = Math.random().toString(36).substring(7);
  pendingCallbacks.set(cbId, cb);
  emitNet('gphone:server:bank:getTransactions', cbId);
});

// Time Sync Loop
setInterval(() => {
  if (isPhoneOpen) {
    sendTimeToNui();
  }
}, 1000);