// Dictionary to track active calls: CallID -> { caller: source, target: source }
interface ActiveCall {
    id: number;
    caller: number; // Source ID
    target: number; // Source ID
    callerPhone: string;
    targetPhone: string;
    startTime: number;
}

const activeCalls: Record<number, ActiveCall> = {};
const playerCalls: Record<number, number> = {}; // Source -> CallID (Fast lookup)

// Helper: Get Player Phone (Depends on QBCore/QBX)
const getPlayerPhone = (src: number): string | null => {
    const player = exports['qbx_core'].GetPlayer(src);
    return player?.PlayerData?.charinfo?.phone || null;
}

// Helper: Find Player Source by Phone
const getPlayerFromPhone = (phone: string): number | null => {
    const players = exports['qbx_core'].GetQBPlayers(); // Returns dict of source -> player
    // This might be heavy if many players. Optimize if needed.
    for (const src in players) {
        if (players[src].PlayerData.charinfo.phone === phone) {
            return parseInt(src);
        }
    }
    return null;
}

const generateCallId = () => Math.floor(Math.random() * 900000) + 100000;

onNet('gphone:server:startCall', (targetPhone: string) => {
    const src = source;
    const callerPhone = getPlayerPhone(src);

    if (!callerPhone) return;

    // Look up target
    const targetSrc = getPlayerFromPhone(targetPhone);

    if (!targetSrc) {
        emitNet('gphone:client:notify', src, { type: 'error', text: 'Number unavailable' });
        // Tell client to reset
        emitNet('gphone:call:failed', src);
        return;
    }

    if (targetSrc === src) {
        emitNet('gphone:client:notify', src, { type: 'error', text: 'Busy' });
        emitNet('gphone:call:failed', src);
        return;
    }

    if (playerCalls[targetSrc] || playerCalls[src]) {
        emitNet('gphone:client:notify', src, { type: 'error', text: 'Line busy' });
        emitNet('gphone:call:failed', src);
        return;
    }

    const callId = generateCallId();
    const call: ActiveCall = {
        id: callId,
        caller: src,
        target: targetSrc,
        callerPhone,
        targetPhone,
        startTime: Date.now()
    };

    activeCalls[callId] = call;
    playerCalls[src] = callId;
    playerCalls[targetSrc] = callId;

    // Notify receiving player
    // We send 'callId' so they can reference it if needed (though mostly internal)
    emitNet('gphone:client:receiveCall', targetSrc, {
        from: callerPhone, // Number to display
        callId: callId
    });
});

onNet('gphone:server:answerCall', () => {
    const src = source;
    const callId = playerCalls[src];
    const call = activeCalls[callId];

    if (!call || call.target !== src) return;

    // Set PMA Voice Channel for both
    // In PMA-Voice, we often use `setPlayerCall(source, channel)` or similar if using native exports.
    // If using straight Mumble channels, `addPlayerToCall`.

    // We will emit back to client so CLIENT can trigger pma-voice export 
    // (Common pattern: Clients manage their own voice connection via exports)

    emitNet('gphone:client:callAccepted', call.caller, { callId });
    emitNet('gphone:client:callAccepted', call.target, { callId });
});

onNet('gphone:server:endCall', () => {
    const src = source;
    const callId = playerCalls[src];
    const call = activeCalls[callId];

    if (!call) return;

    // Notify both
    if (call.caller !== src) emitNet('gphone:client:endCall', call.caller);
    if (call.target !== src) emitNet('gphone:client:endCall', call.target);

    // Clean up
    delete playerCalls[call.caller];
    delete playerCalls[call.target];
    delete activeCalls[callId];
});

// Clean up on drop
on("playerDropped", () => {
    const src = source;
    const callId = playerCalls[src];
    if (callId) {
        const call = activeCalls[callId];
        // End for other party
        const other = call.caller === src ? call.target : call.caller;
        emitNet('gphone:client:endCall', other);

        delete playerCalls[other];
        delete playerCalls[src];
        delete activeCalls[callId];
    }
});
