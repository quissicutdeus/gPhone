<script lang="ts">
    import Screen from "../../components/Screen.svelte";
    import { useCamera, onAppMount } from "../../sdk";
    import type { Photo } from "@shared/types";
    import { fade } from "svelte/transition";
    import ShareSquareIcon from "../../components/icons/ShareSquareIcon.svelte";
    import TrashIcon from "../../components/icons/TrashIcon.svelte";
    import EmptyPhotoIcon from "../../components/icons/EmptyPhotoIcon.svelte";
    import CheckIcon from "../../components/icons/CheckIcon.svelte";
    import ConfirmDialog from "../../components/ConfirmDialog.svelte";
    import EmptyState from "../../components/EmptyState.svelte";

    import { get } from "svelte/store";

    let { onback, initialPhoto, initialPhotoId } = $props<{
        onback?: () => void;
        initialPhoto?: Photo;
        initialPhotoId?: number;
    }>();

    const { photosStore, deletePhoto } = useCamera();

    let selectedPhoto: Photo | null = $state(null);
    let isSelectionMode = $state(false);
    let selectedIds = $state<Set<number>>(new Set());
    let isLoading = $state(false);
    let showDeleteConfirm = $state(false);

    onAppMount(async () => {
        await photosStore.load();
        if (initialPhoto && !selectedPhoto) {
            selectedPhoto = initialPhoto;
        } else if (initialPhotoId && !selectedPhoto) {
            const list = get(photosStore);
            const found = list.find((p) => p.id === initialPhotoId);
            if (found) selectedPhoto = found;
        }
    });

    const toggleSelectionMode = () => {
        isSelectionMode = !isSelectionMode;
        if (!isSelectionMode) {
            selectedIds.clear();
        }
    };

    const handlePhotoClick = (photo: Photo) => {
        if (isSelectionMode) {
            if (selectedIds.has(photo.id)) {
                selectedIds.delete(photo.id);
            } else {
                selectedIds.add(photo.id);
            }
            selectedIds = new Set(selectedIds); // Trigger reactivity
        } else {
            selectedPhoto = photo;
        }
    };

    const deleteSelected = async () => {
        isLoading = true;
        try {
            for (const id of Array.from(selectedIds)) {
                await deletePhoto(id);
            }
            selectedIds.clear();
            isSelectionMode = false;
            showDeleteConfirm = false;
        } catch (e) {
            console.error("Failed to delete photos", e);
        } finally {
            isLoading = false;
        }
    };

    const shareSelected = () => {
        // Mock share functionality
        console.log("Sharing photos:", Array.from(selectedIds));
        alert("Photos shared! (Mock)");
        selectedIds.clear();
        isSelectionMode = false;
    };

    const deleteSingle = async () => {
        if (!selectedPhoto) return;
        isLoading = true;
        try {
            await deletePhoto(selectedPhoto.id);
            selectedPhoto = null;
            showDeleteConfirm = false;
        } catch (e) {
            console.error("Failed to delete photo", e);
        } finally {
            isLoading = false;
        }
    };

    const goBack = () => {
        if (selectedPhoto) {
            selectedPhoto = null;
        } else {
            onback?.();
        }
    };
</script>

{#snippet headerActions()}
    {#if !selectedPhoto}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors text-blue-400 font-semibold"
            onclick={toggleSelectionMode}
        >
            {isSelectionMode ? "Cancel" : "Select"}
        </button>
    {/if}
{/snippet}

<Screen
    title={selectedPhoto ? "Photo" : "Photos"}
    onback={goBack}
    actions={headerActions}
>
    {#if selectedPhoto}
        <!-- Full Screen Image View -->
        <div class="flex flex-col h-full bg-black relative" transition:fade>
            <div class="flex-1 flex items-center justify-center p-2">
                <!-- svelte-ignore a11y_missing_attribute -->
                <img
                    src={selectedPhoto.image}
                    class="w-full h-full object-contain"
                />
            </div>

            <div
                class="p-4 flex justify-between bg-black/80 backdrop-blur pb-8 border-t border-gray-800"
            >
                <button
                    class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    aria-label="Share photo"
                    onclick={() => {
                        console.log("Share photo", selectedPhoto?.id);
                        alert("Photo shared! (Mock)");
                    }}
                >
                    <ShareSquareIcon class="h-6 w-6" />
                </button>
                <button
                    class="p-2 text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Delete photo"
                    onclick={() => (showDeleteConfirm = true)}
                >
                    <TrashIcon class="h-6 w-6" />
                </button>
            </div>

            {#if showDeleteConfirm}
                <ConfirmDialog
                    title="Delete Photo?"
                    message="Are you sure you want to delete this photo?"
                    confirmText="Delete"
                    {isLoading}
                    oncancel={() => (showDeleteConfirm = false)}
                    onconfirm={deleteSingle}
                />
            {/if}
        </div>
    {:else}
        <!-- Grid View -->
        <div
            class="p-1 h-full overflow-y-auto no-scrollbar relative bg-gray-900"
        >
            {#if $photosStore.length === 0}
                <EmptyState title="No photos yet">
                    {#snippet icon()}
                        <EmptyPhotoIcon class="h-16 w-16" />
                    {/snippet}
                </EmptyState>
            {:else}
                <div class="grid grid-cols-3 gap-1">
                    {#each $photosStore as photo}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="relative aspect-square cursor-pointer group bg-gray-800"
                            onclick={() => handlePhotoClick(photo)}
                        >
                            <img
                                src={photo.image}
                                alt="Capture {photo.id}"
                                class="w-full h-full object-cover transition-opacity {isSelectionMode &&
                                selectedIds.has(photo.id)
                                    ? 'opacity-50'
                                    : 'group-hover:opacity-80'}"
                            />
                            {#if isSelectionMode}
                                <div
                                    class="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center {selectedIds.has(
                                        photo.id,
                                    )
                                        ? 'bg-blue-500'
                                        : 'bg-black/20 backdrop-blur-sm'}"
                                >
                                    {#if selectedIds.has(photo.id)}
                                        <CheckIcon class="h-4 w-4 text-white" />
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}

            {#if isSelectionMode && selectedIds.size > 0}
                <div
                    class="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-2xl border border-gray-700"
                    transition:fade
                >
                    <span class="text-white font-medium"
                        >{selectedIds.size} Selected</span
                    >
                    <div class="flex gap-4">
                        <button
                            class="text-blue-400 hover:text-blue-300"
                            aria-label="Share selected"
                            onclick={shareSelected}
                        >
                            <ShareSquareIcon class="h-5 w-5" />
                        </button>
                        <button
                            class="text-red-500 hover:text-red-400"
                            aria-label="Delete selected"
                            onclick={() => (showDeleteConfirm = true)}
                        >
                            <TrashIcon class="h-5 w-5" />
                        </button>
                    </div>
                </div>
            {/if}

            {#if showDeleteConfirm && isSelectionMode}
                <ConfirmDialog
                    title="Delete {selectedIds.size} Photos?"
                    message="Are you sure you want to delete these photos? This cannot be undone."
                    confirmText="Delete"
                    {isLoading}
                    oncancel={() => (showDeleteConfirm = false)}
                    onconfirm={deleteSelected}
                />
            {/if}
        </div>
    {/if}
</Screen>
