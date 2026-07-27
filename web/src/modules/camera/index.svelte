<script lang="ts">
    import { isTakingPhoto, isPreviewingPhoto } from "../../store/camera";
    import { useCamera, useNuiBridge, onAppMount } from "../../sdk";
    import { openApp } from "../../store/navigation";
    import { isBrowser } from "../../utils/isBrowser";
    import { sampleAvatars } from "../../mocks/data";
    import CloseIcon from "../../components/icons/CloseIcon.svelte";
    import FlipCameraIcon from "../../components/icons/FlipCameraIcon.svelte";
    import PhotoIcon from "../../components/icons/PhotoIcon.svelte";
    import { onDestroy } from "svelte";

    let { onback } = $props<{ onback: () => void }>();

    const { capturePhoto, photosStore } = useCamera();
    const { fetchNui } = useNuiBridge();

    let cameraMode = $state<"PHOTO" | "VIDEO" | "LANDSCAPE">("PHOTO");
    let isFrontCamera = $state(false);
    let isFlashing = $state(false);
    let isThumbnailBouncing = $state(false);

    let mockPhotoIndex = $state(1);
    let currentViewfinderImage = $derived(
        sampleAvatars[mockPhotoIndex % sampleAvatars.length],
    );

    let containerRef = $state<HTMLElement | null>(null);

    onAppMount(() => {
        photosStore.load();
    });

    onDestroy(() => {
        isPreviewingPhoto.set(false);
    });

    const toggleFlipCamera = async () => {
        isFrontCamera = !isFrontCamera;
        try {
            await fetchNui("flipCamera", { isFrontCamera });
        } catch (e) {
            console.error("Failed to flip camera", e);
        }
    };

    const takePhoto = async () => {
        isTakingPhoto.set(true);

        // Get the phone dimensions from the container before hiding it
        const rect = containerRef?.getBoundingClientRect();

        // Trigger flash animation strictly inside picture viewfinder area on shutter click
        isFlashing = true;
        setTimeout(() => {
            isFlashing = false;
        }, 180);

        setTimeout(async () => {
            try {
                let capturedImage: string;

                if (isBrowser()) {
                    // In browser mode, capture the EXACT image currently shown on the big viewfinder screen!
                    capturedImage = currentViewfinderImage;
                    // Advance viewfinder screen to the next scene for the next photo
                    mockPhotoIndex++;
                } else {
                    const base64Data = await fetchNui<string>("takePhoto");
                    capturedImage = base64Data;

                    if (
                        !base64Data.startsWith("http") &&
                        !base64Data.startsWith("https") &&
                        rect &&
                        base64Data
                    ) {
                        try {
                            const img = new Image();
                            img.crossOrigin = "Anonymous";
                            img.src = base64Data.startsWith("data:")
                                ? base64Data
                                : "data:image/jpeg;base64," + base64Data;

                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                                setTimeout(
                                    () =>
                                        reject(new Error("Image load timeout")),
                                    3000,
                                );
                            });

                            const scaleX = img.naturalWidth / window.innerWidth;
                            const scaleY =
                                img.naturalHeight / window.innerHeight;

                            const physX = Math.round(rect.left * scaleX);
                            const physY = Math.round(rect.top * scaleY);
                            const physWidth = Math.round(rect.width * scaleX);
                            const physHeight = Math.round(rect.height * scaleY);

                            if (physWidth > 10 && physHeight > 10) {
                                const canvas = document.createElement("canvas");
                                canvas.width = physWidth;
                                canvas.height = physHeight;

                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                    ctx.imageSmoothingEnabled = false;
                                    ctx.drawImage(
                                        img,
                                        physX,
                                        physY,
                                        physWidth,
                                        physHeight,
                                        0,
                                        0,
                                        physWidth,
                                        physHeight,
                                    );
                                    const cropped = canvas.toDataURL(
                                        "image/jpeg",
                                        0.5,
                                    );
                                    if (
                                        cropped &&
                                        cropped.length > 30 &&
                                        cropped !== "data:,"
                                    ) {
                                        capturedImage = cropped;
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn("Canvas crop fallback used:", err);
                            capturedImage = base64Data;
                        }
                    }
                }

                if (
                    !capturedImage ||
                    capturedImage === "data:," ||
                    capturedImage.length < 30
                ) {
                    capturedImage = sampleAvatars[0];
                }

                // Directly save captured photo to gallery
                await capturePhoto(capturedImage);
                await photosStore.load();

                // Trigger gallery thumbnail bounce highlight
                isThumbnailBouncing = true;
                setTimeout(() => {
                    isThumbnailBouncing = false;
                }, 600);
            } catch (err) {
                console.error("Failed to take photo", err);
            } finally {
                isTakingPhoto.set(false);
            }
        }, 50);
    };
</script>

<div
    bind:this={containerRef}
    class="flex flex-col h-full bg-black text-white relative select-none overflow-hidden rounded-[3rem]"
>
    <!-- Live Viewfinder / Camera View -->
    <div
        class="flex-1 relative flex flex-col justify-between p-4 overflow-hidden bg-black rounded-[3rem]"
    >
        <!-- Mock Browser Viewfinder Background Image (Displayed in browser mode when FiveM 3D world is not running) -->
        {#if isBrowser()}
            <img
                src={currentViewfinderImage}
                alt="Camera Viewfinder Mock"
                class="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none transition-opacity duration-300"
            />
        {/if}

        <!-- Viewfinder Picture Shutter Flash Overlay (Only over picture area, behind controls) -->
        {#if isFlashing}
            <div
                class="absolute inset-0 bg-white z-0 pointer-events-none transition-opacity duration-150"
            ></div>
        {/if}

        <!-- Top Controls -->
        <div
            class="flex justify-between items-center z-10 pt-1 transition-opacity duration-75"
            class:opacity-0={$isTakingPhoto}
        >
            <button
                onclick={onback}
                class="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/10 shadow-lg cursor-pointer"
                aria-label="Go back"
            >
                <CloseIcon class="h-5 w-5" />
            </button>
        </div>

        <!-- Grid Overlay Guide -->
        <div
            class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 transition-opacity duration-75"
            class:opacity-0={$isTakingPhoto}
        >
            <div class="border-r border-b border-white"></div>
            <div class="border-r border-b border-white"></div>
            <div class="border-b border-white"></div>
            <div class="border-r border-b border-white"></div>
            <div class="border-r border-b border-white"></div>
            <div class="border-b border-white"></div>
            <div class="border-r border-white"></div>
            <div class="border-r border-white"></div>
            <div></div>
        </div>

        <!-- Bottom Controls & Opacity Overlay Container (Always visible) -->
        <div
            class="z-10 relative flex flex-col items-center gap-4 pt-4 pb-10 px-4 bg-black/90 backdrop-blur-lg rounded-b-[3rem] mx-[-1rem] mb-[-1rem] text-white shadow-2xl overflow-hidden transform-gpu"
        >
            <!-- Mode Toggle Buttons -->
            <div class="flex items-center gap-4">
                {#each ["PHOTO", "VIDEO", "LANDSCAPE"] as mode}
                    <button
                        type="button"
                        onclick={() =>
                            (cameraMode = mode as
                                | "PHOTO"
                                | "VIDEO"
                                | "LANDSCAPE")}
                        class="px-3.5 py-1 rounded-full text-xs tracking-wider font-semibold uppercase transition-all duration-200 cursor-pointer {cameraMode ===
                        mode
                            ? 'text-yellow-400 bg-black/60 border border-yellow-400/40 shadow-sm scale-105'
                            : 'text-gray-300 hover:text-white'}"
                    >
                        {mode}
                    </button>
                {/each}
            </div>

            <!-- Shutter Row: Gallery Preview (Left) | Shutter Button (Center) | Flip Camera (Right) -->
            <div class="flex items-center justify-between w-full px-6 pt-1">
                <!-- Left: Gallery Preview Thumbnail (Clicking opens directly to that photo in Photos app) -->
                <button
                    type="button"
                    onclick={() => {
                        if ($photosStore.length > 0) {
                            openApp("photos", {
                                initialPhoto: $photosStore[0],
                            });
                        } else {
                            openApp("photos");
                        }
                    }}
                    class="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/30 flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer group {isThumbnailBouncing
                        ? 'scale-110 border-yellow-400 ring-2 ring-yellow-400/60 shadow-yellow-400/30 shadow-xl'
                        : 'hover:scale-105'}"
                    aria-label="Open Photos Gallery"
                >
                    {#if $photosStore.length > 0}
                        <img
                            src={$photosStore[0].image}
                            alt="Recent capture"
                            class="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                    {:else}
                        <PhotoIcon class="h-6 w-6 text-gray-400" />
                    {/if}
                </button>

                <!-- Center: Shutter Button -->
                <button
                    onclick={takePhoto}
                    class="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform shadow-2xl cursor-pointer"
                    aria-label="Take photo"
                >
                    <div
                        class="w-full h-full rounded-full transition-all duration-200 {cameraMode ===
                        'VIDEO'
                            ? 'bg-red-500 rounded-md scale-75'
                            : 'bg-white'}"
                    ></div>
                </button>

                <!-- Right: Flip Camera Button -->
                <button
                    type="button"
                    onclick={toggleFlipCamera}
                    class="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:rotate-180 transition-transform cursor-pointer border border-white/20"
                    aria-label="Flip camera"
                >
                    <FlipCameraIcon class="h-6 w-6" />
                </button>
            </div>
        </div>
    </div>
</div>
