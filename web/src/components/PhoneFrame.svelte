<script lang="ts">
    import { fly } from "svelte/transition";
    import { formattedTime } from "../store/time";
    import { goHome } from "../store/navigation";

    let { transparent = false, onClose, children } = $props();
</script>

<!-- Phone Frame -->
<div
    transition:fly={{ y: 1000, duration: 500 }}
    class="relative h-[850px] w-[400px] rounded-[3.5rem] border-[8px] border-gray-900 shadow-2xl ring-1 ring-gray-700 transition-colors duration-200"
    class:bg-black={!transparent}
    class:bg-transparent={transparent}
>
    <!-- Side Buttons -->
    <!-- Power Button -->
    <button
        class="absolute -right-[13px] top-[180px] h-12 w-[5px] rounded-r-md bg-gray-800"
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
        class:bg-gray-900={!transparent}
        class:bg-transparent={transparent}
    >
        <!-- Status Bar -->
        {#if !transparent}
            <div
                class="absolute top-0 z-20 flex w-full items-center justify-between px-8 pt-3 text-sm font-medium text-white"
            >
                <span>{$formattedTime}</span>
                <div class="flex gap-2">
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
                    <span>69%</span>
                </div>
            </div>
        {/if}

        <!-- Hole Punch Camera -->
        <div
            class="absolute left-1/2 top-2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-black ring-1 ring-gray-800"
        ></div>

        <!-- Content Area -->
        <div class="h-full" class:pt-8={!transparent} class:pb-4={!transparent}>
            {@render children()}
        </div>

        <!-- Home Indicator -->
        <button
            class="absolute bottom-0 left-0 z-20 flex h-8 w-full cursor-pointer items-end justify-center pb-2"
            onclick={goHome}
            aria-label="Return to home screen"
        >
            <div
                class="h-1 w-1/3 rounded-full bg-white/80 transition-colors duration-200 hover:bg-white"
            ></div>
        </button>
    </div>
</div>
