<script lang="ts">
    import { isTakingPhoto } from "../../store/camera";
    import { fetchNui } from "../../utils/fetchNui";

    let { onback } = $props<{ onback: () => void }>();

    let photoUri = $state<string | null>(null);

    const takePhoto = async () => {
        isTakingPhoto.set(true);

        // Small delay to allow Svelte to apply opacity-0 to the outer App frame
        setTimeout(async () => {
            try {
                // Returns a base64 encoded data URI string of the webp/jpg image
                const base64Data = await fetchNui<string>("takePhoto");
                photoUri = base64Data;
            } catch (err) {
                console.error("Failed to take photo", err);
            } finally {
                isTakingPhoto.set(false);
            }
        }, 150);
    };

    const closePhoto = () => {
        photoUri = null;
    };
</script>

<div class="relative flex h-full w-full flex-col bg-transparent">
    {#if photoUri}
        <!-- Photo Preview Area -->
        <div class="absolute inset-0 z-50 bg-black">
            <!-- svelte-ignore a11y_missing_attribute -->
            <img class="h-full w-full object-contain" src={photoUri} />

            <button
                class="absolute left-4 top-12 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                onclick={closePhoto}
                aria-label="Close photo"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    {/if}

    <!-- Top Bar (Back button, Flash toggle etc might go here) -->
    <div class="flex items-center justify-between p-4 pt-12">
        <button
            class="text-white hover:text-gray-300"
            onclick={onback}
            aria-label="Go back"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
    </div>

    <!-- Empty Middle Viewfinder Area (transparent to show game) -->
    <div class="flex-1"></div>

    <!-- Bottom Controls -->
    <div
        class="flex items-center justify-center bg-black/40 pb-12 pt-6 backdrop-blur-md"
    >
        <button
            class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-transparent transition-transform hover:scale-105 active:scale-95"
            onclick={takePhoto}
            aria-label="Take photo"
        >
            <div class="h-16 w-16 rounded-full bg-white"></div>
        </button>
    </div>
</div>
