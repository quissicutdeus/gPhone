<script lang="ts">
    import { photos } from "../store/photos";
    import PhotoIcon from "./icons/PhotoIcon.svelte";
    import CloseIcon from "./icons/CloseIcon.svelte";
    import CheckCircleIcon from "./icons/CheckCircleIcon.svelte";
    import Button from "./Button.svelte";

    let {
        title = "Select Photo",
        multiSelect = false,
        selectedIds = [],
        showRemove = false,
        onselect,
        onmultichange,
        onclose,
    } = $props<{
        title?: string;
        /** Single-select mode (contacts): fires onselect with image URL */
        multiSelect?: boolean;
        /** Multi-select mode (messages): tracks selected photo IDs */
        selectedIds?: number[];
        /** Show "Remove Photo" button (contacts avatar clear) */
        showRemove?: boolean;
        /** Single-select callback */
        onselect?: (image: string) => void;
        /** Multi-select toggle callback */
        onmultichange?: (photoId: number, image: string) => void;
        onclose: () => void;
    }>();

    const isSelected = (id: number) => selectedIds.includes(id);
    const selectedCount = $derived(selectedIds.length);
</script>

<div
    class="absolute inset-0 bg-gray-950/95 backdrop-blur-md z-30 flex flex-col animate-in fade-in duration-200"
>
    <!-- Header -->
    <div class="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 class="font-semibold text-base text-white flex items-center gap-2">
            <PhotoIcon class="w-5 h-5 text-blue-400" />
            {title}
        </h3>
        <button
            class="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onclick={onclose}
            aria-label="Close photo picker"
        >
            <CloseIcon class="w-5 h-5" />
        </button>
    </div>

    <!-- Photo Grid -->
    <div
        class="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 content-start"
    >
        {#each $photos as photo}
            {#if multiSelect}
                {@const selected = isSelected(photo.id)}
                <button
                    type="button"
                    class="aspect-square bg-gray-800 rounded-xl overflow-hidden relative border transition-all group {selected
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-gray-700/50 hover:border-gray-500'}"
                    onclick={() => onmultichange?.(photo.id, photo.image)}
                >
                    <img
                        src={photo.image}
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        alt=""
                    />
                    {#if selected}
                        <div
                            class="absolute top-1.5 right-1.5 bg-blue-600 rounded-full p-0.5 shadow-md"
                        >
                            <CheckCircleIcon class="w-4 h-4 text-white" />
                        </div>
                    {/if}
                </button>
            {:else}
                <button
                    type="button"
                    class="aspect-square bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700/50 hover:border-blue-500 transition-all group"
                    onclick={() => onselect?.(photo.image)}
                >
                    <img
                        src={photo.image}
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        alt=""
                    />
                </button>
            {/if}
        {/each}

        {#if $photos.length === 0}
            <div
                class="col-span-3 text-center text-gray-400 py-12 text-sm flex flex-col items-center"
            >
                <PhotoIcon class="w-10 h-10 text-gray-600 mb-2" />
                No photos in gallery.
            </div>
        {/if}
    </div>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-800 bg-gray-900 flex gap-2">
        {#if multiSelect}
            {#if selectedCount > 0}
                <Button
                    variant="danger"
                    class="flex-1 text-xs py-2"
                    onclick={() => {
                        // Clear all — parent handles resetting the array
                        for (const id of [...selectedIds]) {
                            const photo = $photos.find((p) => p.id === id);
                            if (photo) onmultichange?.(photo.id, photo.image);
                        }
                    }}
                >
                    Clear Selection
                </Button>
            {/if}
            <Button class="flex-1 text-xs py-2" onclick={onclose}>
                Done {selectedCount > 0 ? `(${selectedCount})` : ""}
            </Button>
        {:else}
            {#if showRemove}
                <Button
                    variant="danger"
                    class="flex-1 text-xs py-2"
                    onclick={() => onselect?.("")}
                >
                    Remove Photo
                </Button>
            {/if}
            <Button
                variant="secondary"
                class="flex-1 text-xs py-2"
                onclick={onclose}
            >
                Cancel
            </Button>
        {/if}
    </div>
</div>
