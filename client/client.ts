import './controllers';
import { sendChargeToNui } from './controllers/BatteryController';

let isPhoneOpen = false;
let isFreelookActive = false;
let freelookTick: number | null = null;
let phoneProp: number | null = null;
let activeApp: string | null = null;
let savedCameraViewMode: number | null = null;
let currentAnimId = 0;

interface AppState {
  dict: string;
  anim: string;
  init?: () => void;
  cleanup?: () => void;
}

const AppStates: Record<string, AppState> = {
  camera: {
    dict: 'amb@world_human_tourist_mobile@male@base',
    anim: 'base',
    init: () => {
      savedCameraViewMode = GetFollowPedCamViewMode();
      SetFollowPedCamViewMode(4);
    },
    cleanup: () => {
      if (savedCameraViewMode !== null) {
        SetFollowPedCamViewMode(savedCameraViewMode);
        savedCameraViewMode = null;
      }
    }
  },
  default: {
    dict: 'cellphone@',
    anim: 'cellphone_text_read_base'
  }
};

const playAppAnimation = async (ped: number, appName: string | null) => {
  const animId = ++currentAnimId;
  const state = appName && AppStates[appName] ? AppStates[appName] : AppStates.default;

  await loadAnimDict(state.dict);

  // Abort if another animation was requested or phone was closed while loading
  if (animId !== currentAnimId || !isPhoneOpen) {
    RemoveAnimDict(state.dict);
    return;
  }

  if (appName && AppStates[appName] && AppStates[appName].init) {
    AppStates[appName].init!();
  }

  TaskPlayAnim(ped, state.dict, state.anim, 8.0, 8.0, -1, 50, 0, false, false, false);
  RemoveAnimDict(state.dict);
};

const stopAllPhoneAnimations = (ped: number) => {
  currentAnimId++; // Cancel any pending animations
  if (activeApp && AppStates[activeApp]) {
    if (AppStates[activeApp].cleanup) {
      AppStates[activeApp].cleanup!();
    }
    StopAnimTask(ped, AppStates[activeApp].dict, AppStates[activeApp].anim, 1.0);
  }
  activeApp = null;
  StopAnimTask(ped, AppStates.default.dict, AppStates.default.anim, 1.0);
};

const delay = (ms: number) => new Promise(res => setTimeout(() => res(true), ms));

const loadAnimDict = async (dict: string) => {
  RequestAnimDict(dict);
  while (!HasAnimDictLoaded(dict)) {
    await delay(10);
  }
};

const loadModel = async (model: string | number) => {
  const hash = typeof model === 'string' ? GetHashKey(model) : model;
  if (IsModelValid(hash)) {
    RequestModel(hash);
    while (!HasModelLoaded(hash)) {
      await delay(10);
    }
  }
};

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

    const ped = PlayerPedId();
    playAppAnimation(ped, null);

    loadModel('prop_npc_phone_02').then(() => {
      if (!isPhoneOpen || phoneProp) return; // Phone was closed before model loaded, or prop already exists
      const coords = GetEntityCoords(ped, true);
      phoneProp = CreateObject(GetHashKey('prop_npc_phone_02'), coords[0], coords[1], coords[2], true, true, false);
      AttachEntityToEntity(phoneProp, ped, GetPedBoneIndex(ped, 28422), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1, true);
      SetModelAsNoLongerNeeded(GetHashKey('prop_npc_phone_02'));
    });
    // Send time and battery charge immediately when opening
    sendTimeToNui();
    sendChargeToNui();
  } else {
    const ped = PlayerPedId();
    if (phoneProp) {
      DeleteObject(phoneProp);
      phoneProp = null;
    }
    stopAllPhoneAnimations(ped);

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

  const ped = PlayerPedId();
  if (phoneProp) {
    DeleteObject(phoneProp);
    phoneProp = null;
  }
  stopAllPhoneAnimations(ped);

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

RegisterNuiCallbackType('onCameraApp');
on('__cfx_nui:onCameraApp', async (data: { state: boolean }, cb: Function) => {
  const ped = PlayerPedId();
  if (data.state) {
    activeApp = 'camera';
    await playAppAnimation(ped, activeApp);
  } else {
    if (activeApp === 'camera') {
      if (AppStates.camera.cleanup) AppStates.camera.cleanup();
      StopAnimTask(ped, AppStates.camera.dict, AppStates.camera.anim, 1.0);
      activeApp = null;
    }
    await playAppAnimation(ped, null);
  }
  cb({});
});

const getClientPlayerData = () => {
  try {
    if (exports['qbx_core']?.GetPlayerData) {
      return exports['qbx_core'].GetPlayerData();
    } else if (exports['qb-core']?.GetCoreObject) {
      return exports['qb-core'].GetCoreObject().Functions.GetPlayerData();
    }
  } catch (error) {
    console.error("Error getting PlayerData from framework:", error);
    return null;
  }
  return null;
};

// NUI Callback to get bank balance
RegisterNuiCallbackType('getBankBalance');
on('__cfx_nui:getBankBalance', (_: any, cb: Function) => {
  try {
    if (exports['qbx_core']?.GetMoney) {
      const balance = exports['qbx_core'].GetMoney('bank');
      if (typeof balance === 'number') {
        cb(balance);
        return;
      }
    }
    const PlayerData = getClientPlayerData();
    cb(PlayerData?.money?.bank ?? 0);
  } catch (error) {
    console.error("Error getting bank balance:", error);
    cb(0);
  }
});

RegisterNuiCallbackType('getCitizenId');
on('__cfx_nui:getCitizenId', (_: any, cb: Function) => {
  try {
    const PlayerData = getClientPlayerData();
    cb(PlayerData?.citizenid ?? null);
  } catch (error) {
    console.error("Error getting citizenid:", error);
    cb(null);
  }
});


// Time Sync Loop
setInterval(() => {
  if (isPhoneOpen) {
    sendTimeToNui();
  }
}, 1000);