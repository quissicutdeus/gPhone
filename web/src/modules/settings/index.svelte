<script lang="ts">
    import { is24Hour } from "../../store/time";
    import Screen from "../../components/Screen.svelte";

    let { onback } = $props();

    const toggleTimeFormat = () => {
        is24Hour.update((v) => !v);
    };
</script>

<Screen title="Settings" {onback}>
    <div class="p-4 space-y-6">
        <!-- General Section -->
        <div>
            <h2
                class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 px-2"
            >
                General
            </h2>
            <div class="bg-gray-800 rounded-xl overflow-hidden">
                <div
                    class="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
                >
                    <div class="flex flex-col">
                        <span class="font-medium">24-Hour Time</span>
                        <span class="text-sm text-gray-400"
                            >Use 24-hour format</span
                        >
                    </div>
                    <button
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        class:bg-blue-600={$is24Hour}
                        class:bg-gray-600={!$is24Hour}
                        onclick={toggleTimeFormat}
                        aria-label="Toggle 24-hour time"
                    >
                        <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                            class:translate-x-6={$is24Hour}
                            class:translate-x-1={!$is24Hour}
                        ></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</Screen>
