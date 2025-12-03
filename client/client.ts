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

// Time Sync Loop
setInterval(() => {
  if (isPhoneOpen) {
    sendTimeToNui();
  }
}, 1000);