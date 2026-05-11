<script lang="ts">
    import { onMount } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import { photos } from "../../store/photos";
    import type { Photo } from "@shared/types";
    import { fade } from "svelte/transition";

    let { onback } = $props();

    let selectedPhoto: Photo | null = $state(null);
    let isSelectionMode = $state(false);
    let selectedIds = $state<Set<number>>(new Set());
    let isLoading = $state(false);
    let showDeleteConfirm = $state(false);

    onMount(() => {
        photos.load();
    });

    const toggleSelectionMode = () => {
        isSelectionMode = !isSelectionMode;
        if (!isSelectionMode) {
            selectedIds.clear();
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        // Force reactivity for Set
        selectedIds = new Set(selectedIds);
    };

    const handlePhotoClick = (photo: Photo) => {
        if (isSelectionMode) {
            toggleSelect(photo.id);
        } else {
            selectedPhoto = photo;
        }
    };

    const deleteSelected = async () => {
        isLoading = true;
        try {
            for (const id of Array.from(selectedIds)) {
                await photos.delete(id);
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
            await photos.delete(selectedPhoto.id);
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

<Screen title={selectedPhoto ? "Photo" : "Photos"} onback={goBack} actions={headerActions}>
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
            
            <div class="p-4 flex justify-between bg-black/80 backdrop-blur pb-8 border-t border-gray-800">
                <button
                    class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    aria-label="Share photo"
                    onclick={() => {
                        console.log("Share photo", selectedPhoto?.id);
                        alert("Photo shared! (Mock)");
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                </button>
                <button
                    class="p-2 text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Delete photo"
                    onclick={() => (showDeleteConfirm = true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </div>

            {#if showDeleteConfirm}
                <div class="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm" transition:fade>
                    <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full">
                        <h3 class="text-xl font-bold text-white mb-2">Delete Photo?</h3>
                        <p class="text-gray-400 mb-6">Are you sure you want to delete this photo?</p>
                        <div class="flex gap-3">
                            <button class="flex-1 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors" onclick={() => (showDeleteConfirm = false)} disabled={isLoading}>Cancel</button>
                            <button class="flex-1 p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50" onclick={deleteSingle} disabled={isLoading}>Delete</button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Grid View -->
        <div class="p-1 h-full overflow-y-auto no-scrollbar relative bg-gray-900">
            {#if $photos.length === 0}
                <div class="flex flex-col items-center justify-center h-full text-gray-500 pb-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    <p class="text-lg">No photos yet</p>
                </div>
            {:else}
                <div class="grid grid-cols-3 gap-1">
                    {#each $photos as photo}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="relative aspect-square cursor-pointer group bg-gray-800"
                            onclick={() => handlePhotoClick(photo)}
                        >
                            <img
                                src={photo.image}
                                alt="Capture {photo.id}"
                                class="w-full h-full object-cover transition-opacity {isSelectionMode && selectedIds.has(photo.id) ? 'opacity-50' : 'group-hover:opacity-80'}"
                            />
                            {#if isSelectionMode}
                                <div class="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center {selectedIds.has(photo.id) ? 'bg-blue-500' : 'bg-black/20 backdrop-blur-sm'}">
                                    {#if selectedIds.has(photo.id)}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}

            {#if isSelectionMode && selectedIds.size > 0}
                <div class="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-2xl border border-gray-700" transition:fade>
                    <span class="text-white font-medium">{selectedIds.size} Selected</span>
                    <div class="flex gap-4">
                        <button class="text-blue-400 hover:text-blue-300" aria-label="Share selected" onclick={shareSelected}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                        </button>
                        <button class="text-red-500 hover:text-red-400" aria-label="Delete selected" onclick={() => (showDeleteConfirm = true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </div>
                </div>
            {/if}

            {#if showDeleteConfirm && isSelectionMode}
                <div class="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm" transition:fade>
                    <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full">
                        <h3 class="text-xl font-bold text-white mb-2">Delete {selectedIds.size} Photos?</h3>
                        <p class="text-gray-400 mb-6">Are you sure you want to delete these photos? This cannot be undone.</p>
                        <div class="flex gap-3">
                            <button class="flex-1 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors" onclick={() => (showDeleteConfirm = false)} disabled={isLoading}>Cancel</button>
                            <button class="flex-1 p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50" onclick={deleteSelected} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</Screen>
