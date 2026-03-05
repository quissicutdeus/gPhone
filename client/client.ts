import './controllers';
import { ClientApp } from './lib/ClientApp';

let isPhoneOpen = false;
let isFreelookActive = false;
let freelookTick: number | null = null;

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
    isFreelookActive = false;
    SetNuiFocusKeepInput(false);
    SetNuiFocus(false, false);
    SendNuiMessage(JSON.stringify({
      action: 'setVisible',
      data: false
    }));
    if (freelookTick !== null) {
      clearTick(freelookTick);
      freelookTick = null;
    }
  }
}, false);

// Register Key Mapping
RegisterKeyMapping('togglePhone', 'Open Phone', 'keyboard', 'm');

// NUI Callback to toggle freelook
RegisterNuiCallbackType('toggleFreelook');
on('__cfx_nui:toggleFreelook', (data: { state: boolean }, cb: Function) => {
  if (isPhoneOpen) {
    if (data && data.state) {
      isFreelookActive = true;
      SetNuiFocus(true, false);
      SetNuiFocusKeepInput(true);

      if (freelookTick === null) {
        freelookTick = setTick(() => {
          DisableAllControlActions(0);
          EnableControlAction(0, 1, true); // Look left/right
          EnableControlAction(0, 2, true); // Look up/down
          EnableControlAction(0, 30, true); // Move left/right
          EnableControlAction(0, 31, true); // Move forward/back
          EnableControlAction(0, 36, true); // Crouch
          EnableControlAction(0, 21, true); // Sprint
          EnableControlAction(0, 22, true); // Jump
        });
      }
    } else {
      isFreelookActive = false;
      SetNuiFocusKeepInput(false);
      SetNuiFocus(true, true);

      if (freelookTick !== null) {
        clearTick(freelookTick);
        freelookTick = null;
      }
    }
  }
  cb({});
});

// NUI Callback to close phone
RegisterNuiCallbackType('hideFrame');
on('__cfx_nui:hideFrame', (_: any, cb: Function) => {
  isPhoneOpen = false;
  isFreelookActive = false;
  SetNuiFocusKeepInput(false);
  SetNuiFocus(false, false);
  SendNuiMessage(JSON.stringify({
    action: 'setVisible',
    data: false
  }));
  if (freelookTick !== null) {
    clearTick(freelookTick);
    freelookTick = null;
  }
  cb({});
});

let savedCameraViewMode: number | null = null;
RegisterNuiCallbackType('onCameraApp');
on('__cfx_nui:onCameraApp', (data: { state: boolean }, cb: Function) => {
  if (data.state) {
    // Save current view mode and force first person (4)
    savedCameraViewMode = GetFollowPedCamViewMode();
    SetFollowPedCamViewMode(4);
  } else {
    // Restore previous view mode
    if (savedCameraViewMode !== null) {
      SetFollowPedCamViewMode(savedCameraViewMode);
      savedCameraViewMode = null;
    }
  }
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

RegisterNuiCallbackType('getCitizenId');
on('__cfx_nui:getCitizenId', (_: any, cb: Function) => {
  try {
    const PlayerData = exports['qbx_core'].GetPlayerData();
    cb(PlayerData.citizenid);
  } catch (error) {
    console.error("Error getting citizenid from qbx_core:", error);
    cb(null);
  }
});


// Time Sync Loop
setInterval(() => {
  if (isPhoneOpen) {
    sendTimeToNui();
  }
}, 1000);