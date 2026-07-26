<script lang="ts">
    import { slide } from "svelte/transition";
    import { charge } from "../store/charge";
    import { signalLevel, setSignal } from "../store/signal";
    import {
        soundVolume,
        soundMuted,
        setVolume,
        toggleMute,
    } from "../store/sound";
    import { devToolsVisible, hideDevTools } from "../store/dev";
    import { debugData } from "../utils/debug";
    import { toast } from "../store/toast";

    let { visible = $bindable(true) } = $props<{ visible: boolean }>();

    let isOpen = $state(false);

    // Call Simulation state
    let callName = $state("John Doe");
    let callNumber = $state("555-0199");

    const triggerCall = () => {
        debugData([
            {
                action: "incomingCall",
                data: {
                    number: callNumber,
                    name: callName,
                },
            },
        ]);
        toast.show({
            type: "info",
            message: `Simulating incoming call from ${callName}`,
        });
    };

    const triggerNotification = () => {
        toast.show({
            type: "info",
            title: "Simulated Toast",
            message: "This is a test push notification from Mock DevTools.",
        });
    };

    const triggerMessage = () => {
        debugData([
            {
                action: "receiveMessage",
                data: {
                    conversation_id: 1,
                    message: "Hey! This is a test message from Mock DevTools.",
                },
            },
        ]);
        toast.showMail({
            sender: "Ursula",
            subject: "Hey! This is a test message...",
        });
    };

    const triggerMail = () => {
        debugData([
            {
                action: "receiveMail",
                data: {
                    id: Date.now(),
                    sender: "boss@ls-gov.org",
                    subject: "Quarterly Review Notice",
                    message:
                        "Please review your upcoming schedule and metrics.",
                    read: false,
                    status: "active",
                    created_at: new Date().toISOString(),
                },
            },
        ]);
    };
</script>

{#if $devToolsVisible}
    <aside
        class="fixed top-4 left-4 z-[9999] text-white text-xs select-none font-sans flex flex-col items-start pointer-events-none"
    >
        <!-- Header Bar with Toggle & Close X -->
        <div class="flex items-center gap-1.5 pointer-events-auto">
            <button
                onclick={() => (isOpen = !isOpen)}
                class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 backdrop-blur-md shadow-2xl transition-all cursor-pointer group"
            >
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                    ></span>
                </span>
                <span class="font-semibold tracking-wide text-gray-200"
                    >Mock DevTools</span
                >
                <span
                    class="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30"
                    >Browser</span
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:text-white"
                    class:rotate-180={isOpen}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>

            <!-- Close X Button -->
            <button
                onclick={hideDevTools}
                class="p-2 rounded-xl bg-gray-900/90 hover:bg-red-950/80 hover:text-red-400 border border-gray-700/80 hover:border-red-800/80 backdrop-blur-md text-gray-400 shadow-2xl transition-all cursor-pointer"
                title="Dismiss DevTools (re-enable via Settings > Developer)"
                aria-label="Close DevTools"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>

    <!-- Collapsible Drawer Panel -->
    {#if isOpen}
        <div
            transition:slide={{ duration: 250 }}
            class="mt-2.5 w-80 p-4 rounded-2xl bg-gray-950/95 border border-gray-800 shadow-2xl backdrop-blur-xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto pointer-events-auto"
        >
            <!-- Header & Screen Toggle -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-800">
                <span class="font-bold text-sm tracking-wide text-white"
                    >OS Hardware Simulation</span
                >
                <button
                    onclick={() => (visible = !visible)}
                    class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border {visible ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}"
                >
                    Phone: {visible ? "ON" : "OFF"}
                </button>
            </div>

            <!-- Battery Level -->
            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center text-gray-300">
                    <span class="font-semibold">Battery Charge</span>
                    <span class="font-mono text-emerald-400">{Math.round($charge)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round($charge)}
                    oninput={(e) => charge.set(Number((e.currentTarget as HTMLInputElement).value))}
                    class="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div class="grid grid-cols-4 gap-1.5 pt-0.5">
                    <button
                        onclick={() => charge.set(0)}
                        class="px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-semibold text-center"
                    >
                        0% (Dead)
                    </button>
                    <button
                        onclick={() => charge.set(15)}
                        class="px-2 py-1 rounded bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-800 text-yellow-300 text-[10px] font-semibold text-center"
                    >
                        15% (Low)
                    </button>
                    <button
                        onclick={() => charge.set(50)}
                        class="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-[10px] font-semibold text-center"
                    >
                        50%
                    </button>
                    <button
                        onclick={() => charge.set(100)}
                        class="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-semibold text-center"
                    >
                        100%
                    </button>
                </div>
            </div>

            <!-- Signal Level -->
            <div class="flex flex-col gap-2 pt-1 border-t border-gray-800/80">
                <div class="flex justify-between items-center text-gray-300">
                    <span class="font-semibold">Signal Strength</span>
                    <span class="font-mono text-emerald-400">{$signalLevel} Bars</span>
                </div>
                <div class="grid grid-cols-5 gap-1.5">
                    {#each [0, 1, 2, 3, 4] as level}
                        <button
                            onclick={() => setSignal(level)}
                            class="py-1 rounded text-[11px] font-semibold transition-all border {$signalLevel === level ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}"
                        >
                            {level} Bar{level === 1 ? "" : "s"}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- System Volume & Sound -->
            <div class="flex flex-col gap-2 pt-1 border-t border-gray-800/80">
                <div class="flex justify-between items-center text-gray-300">
                    <span class="font-semibold">System Volume</span>
                    <div class="flex items-center gap-2">
                        <button
                            onclick={toggleMute}
                            class="px-1.5 py-0.5 rounded text-[10px] font-mono border {$soundMuted ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-gray-800 text-gray-300 border-gray-700'}"
                        >
                            {$soundMuted ? "MUTED" : "UNMUTED"}
                        </button>
                        <span class="font-mono text-emerald-400"
                            >{Math.round($soundVolume * 100)}%</span
                        >
                    </div>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={$soundVolume}
                    oninput={(e) => setVolume(Number((e.currentTarget as HTMLInputElement).value))}
                    class="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <!-- Incoming Call Simulation -->
            <div class="flex flex-col gap-2 pt-1 border-t border-gray-800/80">
                <span class="font-semibold text-gray-300">Incoming Call Test</span>
                <div class="flex gap-2">
                    <input
                        type="text"
                        bind:value={callName}
                        placeholder="Caller Name"
                        class="w-1/2 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                        type="text"
                        bind:value={callNumber}
                        placeholder="Phone Number"
                        class="w-1/2 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <button
                    onclick={triggerCall}
                    class="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    Simulate Incoming Call
                </button>
            </div>

            <!-- Notification & Message Triggers -->
            <div class="flex flex-col gap-2 pt-1 border-t border-gray-800/80">
                <span class="font-semibold text-gray-300">Push Notifications & SMS</span>
                <div class="grid grid-cols-3 gap-1.5">
                    <button
                        onclick={triggerNotification}
                        class="px-2 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium text-[11px] text-center"
                    >
                        Toast
                    </button>
                    <button
                        onclick={triggerMessage}
                        class="px-2 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium text-[11px] text-center"
                    >
                        SMS
                    </button>
                    <button
                        onclick={triggerMail}
                        class="px-2 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium text-[11px] text-center"
                    >
                        Email
                    </button>
                </div>
            </div>
        </div>
    {/if}
</aside>
{/if}
