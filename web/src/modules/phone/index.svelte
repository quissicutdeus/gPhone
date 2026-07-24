<script lang="ts">
    import { onMount } from "svelte";
    import { callStore } from "../../store/call";
    import Screen from "../../components/Screen.svelte";
    import {
        contacts as contactsStore,
        favoriteContacts,
    } from "../../store/contacts";
    import PhoneIcon from "../../components/icons/PhoneIcon.svelte";
    import BackspaceIcon from "../../components/icons/BackspaceIcon.svelte";
    import MicrophoneIcon from "../../components/icons/MicrophoneIcon.svelte";
    import KeypadIcon from "../../components/icons/KeypadIcon.svelte";
    import SpeakerIcon from "../../components/icons/SpeakerIcon.svelte";
    import Avatar from "../../components/Avatar.svelte";

    let { onback } = $props();

    let enteredNumber = $state("");

    const handleKeypad = (num: string) => {
        if (enteredNumber.length < 15) {
            enteredNumber += num;
        }
    };

    const handleBackspace = () => {
        enteredNumber = enteredNumber.slice(0, -1);
    };

    const startCall = (number: string, name?: string) => {
        if (!number) return;
        callStore.startCall(number, name);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    onMount(() => {
        // Ensure contacts are loaded for favorites
        contactsStore.load();
    });
</script>

<div
    class="flex h-full flex-col bg-gray-900 text-white relative overflow-hidden"
>
    {#if $callStore.status === "idle"}
        <!-- Keypad View -->
        <Screen title="Phone" {onback}>
            <div
                class="flex-1 flex flex-col items-center justify-end p-8 pb-12 h-full"
            >
                <!-- Favorites Bar -->
                {#if $favoriteContacts.length > 0}
                    <div class="w-full mb-auto mt-4">
                        <div
                            class="text-xs text-gray-400 uppercase font-bold mb-2 ml-1"
                        >
                            Favorites
                        </div>
                        <div
                            class="flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
                        >
                            {#each $favoriteContacts as fav}
                                <button
                                    class="flex flex-col items-center space-y-1 min-w-[64px]"
                                    onclick={() =>
                                        startCall(
                                            fav.phone,
                                            `${fav.firstname} ${fav.lastname || ""}`,
                                        )}
                                >
                                    <Avatar
                                        initials={(fav.firstname[0] || "") + (fav.lastname?.[0] || "")}
                                        size="w-12 h-12"
                                        textClass="text-lg"
                                        bgClass="bg-yellow-600 shadow-lg"
                                    />
                                    <span
                                        class="text-xs text-gray-300 truncate w-full text-center"
                                        >{fav.firstname}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Number Display -->
                <div class="text-4xl font-light mb-8 h-12 flex items-center">
                    {enteredNumber}
                </div>

                <!-- Keypad -->
                <div class="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
                        <button
                            class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                            onclick={() => handleKeypad(num.toString())}
                        >
                            {num}
                        </button>
                    {/each}
                    <button
                        class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                        onclick={() => handleKeypad("*")}>*</button
                    >
                    <button
                        class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                        onclick={() => handleKeypad("0")}>0</button
                    >
                    <button
                        class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                        onclick={() => handleKeypad("#")}>#</button
                    >
                </div>

                <div
                    class="flex items-center justify-center mt-8 w-full max-w-[280px] relative"
                >
                    <!-- Place holder to center call button -->
                    <div class="w-16"></div>

                    <!-- Call Button -->
                    <button
                        class="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30 mx-auto"
                        aria-label="Call"
                        onclick={() => startCall(enteredNumber)}
                    >
                        <PhoneIcon class="h-8 w-8 text-white" />
                    </button>

                    <!-- Backspace -->
                    <div class="w-16 flex justify-center">
                        {#if enteredNumber}
                            <button
                                class="text-gray-400 hover:text-white transition-colors"
                                onclick={handleBackspace}
                                aria-label="Backspace"
                            >
                                <BackspaceIcon class="h-8 w-8" />
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        </Screen>
    {:else}
        <!-- In Call View -->
        <div
            class="flex-1 flex flex-col items-center pt-20 pb-12 bg-gradient-to-b from-gray-800 to-gray-900 animate-in fade-in duration-300"
        >
            <!-- Avatar/Icon -->
            <Avatar
                initials={$callStore.name?.[0] || "#"}
                size="w-32 h-32"
                textClass="text-4xl text-gray-400"
                bgClass="bg-gray-700 shadow-2xl mb-8"
            />

            <h2 class="text-3xl font-semibold mb-2 text-center px-4">
                {$callStore.name || $callStore.number}
            </h2>
            <p class="text-gray-400 text-lg mb-12">
                {#if $callStore.status === "dialing"}
                    Dialing...
                {:else if $callStore.status === "connected"}
                    {formatDuration($callStore.duration)}
                {:else if $callStore.status === "incoming"}
                    Incoming Call...
                {/if}
            </p>

            <!-- Controls -->
            <div class="grid grid-cols-3 gap-8 w-full max-w-[300px] mt-auto">
                <!-- Mute -->
                <button
                    class="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Mute"
                >
                    <div class="p-4 rounded-full bg-gray-800">
                        <MicrophoneIcon />
                    </div>
                    <span class="text-xs">Mute</span>
                </button>

                <!-- Keypad -->
                <button
                    class="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Keypad"
                >
                    <div class="p-4 rounded-full bg-gray-800">
                        <KeypadIcon />
                    </div>
                    <span class="text-xs">Keypad</span>
                </button>

                <!-- Speaker -->
                <button
                    class="flex flex-col items-center space-y-2 transition-colors {$callStore.speaker
                        ? 'text-white'
                        : 'text-gray-400'}"
                    onclick={callStore.toggleSpeaker}
                    aria-label="Speaker"
                >
                    <div
                        class="p-4 rounded-full bg-gray-800 {$callStore.speaker
                            ? 'bg-white text-gray-900'
                            : ''}"
                    >
                        <SpeakerIcon />
                    </div>
                    <span class="text-xs">Speaker</span>
                </button>
            </div>

            <!-- End Call -->
            <div class="mt-12 mb-8 flex space-x-8 justify-center">
                {#if $callStore.status === "incoming"}
                    <button
                        class="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30"
                        onclick={() => callStore.answerCall()}
                        aria-label="Answer Call"
                    >
                        <PhoneIcon class="h-8 w-8 text-white" />
                    </button>
                {/if}

                <button
                    class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
                    onclick={() => callStore.endCall()}
                    aria-label="End Call"
                >
                    <PhoneIcon class="h-8 w-8 text-white transform rotate-135" />
                </button>
            </div>
        </div>
    {/if}
</div>
