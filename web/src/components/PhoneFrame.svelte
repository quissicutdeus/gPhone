<script lang="ts">
    import { fly } from "svelte/transition";
    import { formattedTime } from "../store/time";
    import { goHome } from "../store/navigation";
    import { displayCharge, isDead, roundedCharge } from "../store/charge";

    let { transparent = false, onClose, children } = $props();
</script>

<!-- Phone Frame -->
<div
    transition:fly={{ y: 1000, duration: 500 }}
    class="relative h-[850px] w-[400px] rounded-[3.5rem] border-[8px] border-gray-900 shadow-2xl ring-1 ring-gray-700 transition-colors duration-200"
    class:bg-black={!transparent || $isDead}
    class:bg-transparent={transparent && !$isDead}
>
    <!-- Side Buttons -->
    <!-- Power Button -->
    <button
        class="absolute -right-[13px] top-[180px] h-12 w-[5px] rounded-r-md bg-gray-800 cursor-pointer hover:bg-gray-700"
        onclick={onClose}
        title="Close Phone"
    ></button>
    <!-- Volume Buttons -->
    <div
        class="absolute -right-[13px] top-[250px] h-24 w-[5px] rounded-r-md bg-gray-800"
    ></div>

    <!-- Screen -->
    <div
        class="relative h-full w-full overflow-hidden rounded-[3rem] transition-colors duration-200"
        class:bg-gray-900={!transparent && !$isDead}
        class:bg-black={$isDead}
        class:bg-transparent={transparent && !$isDead}
    >
        <!-- Dead Phone Screen Overlay -->
        {#if $isDead}
            <div
                class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black text-white p-6"
            >
                <!-- Large Blinking Low Battery Icon -->
                <div
                    class="relative flex flex-col items-center justify-center gap-6 animate-pulse"
                >
                    <!-- Battery Outer Container -->
                    <div
                        class="relative w-28 h-14 rounded-2xl border-4 border-red-500/80 p-1.5 flex items-center justify-start shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                        <!-- Battery Nipple -->
                        <div
                            class="absolute -right-3.5 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-red-500/80 rounded-r-md"
                        ></div>
                        <!-- Low Battery Red Bar (blinking empty state) -->
                        <div class="h-full w-2 bg-red-500 rounded-sm"></div>
                        <!-- Lightning Cable Warning Icon overlay -->
                        <div
                            class="absolute inset-0 flex items-center justify-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-7 w-7 text-red-400 drop-shadow"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div class="flex flex-col items-center gap-1.5 text-center">
                        <span
                            class="text-xs font-semibold tracking-wider uppercase text-red-400"
                            >Battery Low</span
                        >
                        <span class="text-[11px] text-gray-400 font-light"
                            >Connect Battery Bank</span
                        >
                    </div>
                </div>
            </div>
        {/if}

        <!-- Status Bar -->
        {#if !transparent && !$isDead}
            <div
                class="absolute top-0 z-20 flex w-full items-center justify-between px-8 pt-3 text-sm font-medium text-white"
            >
                <span>{$formattedTime}</span>
                <div class="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                        />
                    </svg>

                    <!-- Battery Status Indicator -->
                    <div class="flex items-center gap-1.5">
                        <span
                            class="text-xs"
                            class:text-red-400={$displayCharge <= 20}
                            >{$displayCharge}%</span
                        >
                        <div
                            class="relative w-5 h-2.5 rounded-[3px] border border-white/80 p-[1px] flex items-center justify-start"
                        >
                            <div
                                class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1 bg-white/80 rounded-r-[1px]"
                            ></div>
                            <div
                                class="h-full rounded-[1px] transition-all duration-300"
                                class:bg-red-500={$displayCharge <= 20}
                                class:bg-yellow-400={$displayCharge > 20 &&
                                    $displayCharge <= 40}
                                class:bg-white={$displayCharge > 40}
                                style="width: {Math.max(8, $displayCharge)}%;"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Hole Punch Camera -->
        <div
            class="absolute left-1/2 top-2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-black ring-1 ring-gray-800"
        ></div>

        <!-- Content Area -->
        {#if !$isDead}
            <div
                class="h-full"
                class:pt-8={!transparent}
                class:pb-4={!transparent}
            >
                {@render children()}
            </div>
        {/if}

        <!-- Home Indicator -->
        <button
            class="absolute bottom-0 left-0 z-50 flex h-8 w-full cursor-pointer items-end justify-center pb-2"
            onclick={goHome}
            aria-label="Return to home screen"
        >
            <div
                class="h-1 w-1/3 rounded-full bg-white/80 transition-colors duration-200 hover:bg-white"
            ></div>
        </button>
    </div>
</div>
