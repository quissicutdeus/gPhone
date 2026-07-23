// Server Battery Controller

// In-memory battery store by citizenid / source fallback
const playerBatteryStore: Record<string, number> = {};

// Helper to get QBX/QB Player
const getPlayer = (src: number): any => {
    try {
        if (exports['qbx_core']?.GetPlayer) {
            return exports['qbx_core'].GetPlayer(src);
        } else if (exports['qb-core']?.GetCoreObject) {
            return exports['qb-core'].GetCoreObject().Functions.GetPlayer(src);
        }
    } catch (e) {
        return null;
    }
    return null;
};

// Helper to remove item from inventory
const removeBatteryBankItem = (src: number): boolean => {
    const player = getPlayer(src);
    if (player) {
        if (player.Functions?.RemoveItem) {
            return player.Functions.RemoveItem('battery_bank', 1);
        }
    }
    try {
        if (exports['ox_inventory']?.RemoveItem) {
            return exports['ox_inventory'].RemoveItem(src, 'battery_bank', 1);
        }
    } catch (e) {
        // ox_inventory not present
    }
    return true; // Fallback allow if framework remove not detected
};

// Helper to save battery level into player metadata (which QBX/QBCore persists to MySQL players table)
const setPlayerBatteryMeta = (src: number, level: number) => {
    const player = getPlayer(src);
    const citizenid = player?.PlayerData?.citizenid || player?.citizenid || `src_${src}`;
    const safeLevel = Math.max(0, Math.min(100, level));
    playerBatteryStore[citizenid] = safeLevel;

    if (player?.Functions?.SetMetaData) {
        player.Functions.SetMetaData('gphone_battery', safeLevel);
    } else if (player?.PlayerData?.metadata) {
        player.PlayerData.metadata.gphone_battery = safeLevel;
    }

    try {
        if (exports['qbx_core']?.SetMetaData) {
            exports['qbx_core'].SetMetaData(src, 'gphone_battery', safeLevel);
        }
    } catch (e) {
        // ignore
    }
};

// Event handler for battery_bank item or custom server trigger to recharge phone
onNet('gphone:server:useBatteryBank', () => {
    const src = source;
    const removed = removeBatteryBankItem(src);
    if (removed) {
        setPlayerBatteryMeta(src, 100);
        emitNet('gphone:client:rechargePhone', src);
    }
});

// Event to save battery charge from client
onNet('gphone:server:saveBattery', (chargeAmount: number) => {
    const src = source;
    setPlayerBatteryMeta(src, chargeAmount);
});

// Helper function to send battery charge to client from metadata
const sendLoadedBatteryToClient = (src: number) => {
    const player = getPlayer(src);
    const citizenid = player?.PlayerData?.citizenid || player?.citizenid || `src_${src}`;
    
    let savedCharge = 100;
    if (player?.PlayerData?.metadata?.gphone_battery !== undefined) {
        savedCharge = player.PlayerData.metadata.gphone_battery;
    } else if (player?.PlayerData?.metadata?.phone_battery !== undefined) {
        savedCharge = player.PlayerData.metadata.phone_battery;
    } else if (playerBatteryStore[citizenid] !== undefined) {
        savedCharge = playerBatteryStore[citizenid];
    }
    emitNet('gphone:client:setCharge', src, savedCharge);
};

// Event for client to request saved battery level on spawn / join
onNet('gphone:server:loadBattery', () => {
    sendLoadedBatteryToClient(source);
});

// Listen for QBX / QBCore character load events
on('QBCore:Server:OnPlayerLoaded', (player: any) => {
    const src = typeof player === 'number' ? player : player?.PlayerData?.source;
    if (src) {
        sendLoadedBatteryToClient(src);
    }
});

on('qbx_core:server:playerLoaded', (player: any) => {
    const src = typeof player === 'number' ? player : player?.PlayerData?.source;
    if (src) {
        sendLoadedBatteryToClient(src);
    }
});

// Register usable item with qbx_core / qb-core framework if available
try {
    if (exports['qbx_core']?.CreateUseableItem) {
        exports['qbx_core'].CreateUseableItem('battery_bank', (source: number) => {
            const removed = removeBatteryBankItem(source);
            if (removed) {
                emitNet('gphone:client:rechargePhone', source);
            }
        });
    } else if (exports['qb-core']?.GetCoreObject) {
        const QBCore = exports['qb-core'].GetCoreObject();
        if (QBCore?.Functions?.CreateUseableItem) {
            QBCore.Functions.CreateUseableItem('battery_bank', (source: number) => {
                const removed = removeBatteryBankItem(source);
                if (removed) {
                    emitNet('gphone:client:rechargePhone', source);
                }
            });
        }
    }
} catch (error) {
    console.error("Framework item registration skipped:", error);
}
