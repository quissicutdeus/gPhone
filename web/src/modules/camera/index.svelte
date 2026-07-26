<script lang="ts">
    import { isTakingPhoto } from "../../store/camera";
    import { useCamera, useNuiBridge } from "../../sdk";
    import CloseIcon from "../../components/icons/CloseIcon.svelte";
    import ChevronLeftIcon from "../../components/icons/ChevronLeftIcon.svelte";

    let { onback } = $props<{ onback: () => void }>();

    const { capturePhoto } = useCamera();
    const { fetchNui } = useNuiBridge();

    let photoUri = $state<string | null>(null);

    let containerRef = $state<HTMLElement | null>(null);

    const takePhoto = async () => {
        isTakingPhoto.set(true);

        // Get the phone dimensions from the container before hiding it
        const rect = containerRef?.getBoundingClientRect();

        // Wait a single DOM frame (50ms) to allow the instantly-triggered `transition-none` opacity-0
        // state to apply. We must capture instantly so the player's First Person breathing
        // idle animation doesn't bob the camera away from their targeted subject.
        setTimeout(async () => {
            try {
                // Returns a base64 encoded data URI string of the webp/jpg image
                const base64Data = await fetchNui<string>("takePhoto");

                if (rect && base64Data) {
                    // Create an offscreen image to load the full screenshot
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = base64Data.startsWith("data:")
                        ? base64Data
                        : "data:image/jpeg;base64," + base64Data;

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        setTimeout(
                            () => reject(new Error("Image load timeout")),
                            3000,
                        );
                    });

                    // Since the UI squish bug is fixed, we can trust that the CSS grid aspect ratio
                    // perfectly matches the FiveM Native screenshot output aspect ratio without assuming black bars.
                    // We map the horizontal and vertical scaling independently to perfectly align the crop.
                    const scaleX = img.naturalWidth / window.innerWidth;
                    const scaleY = img.naturalHeight / window.innerHeight;

                    // Math.round ensures the physical pixel boundaries perfectly map
                    // to avoid drawing subpixel interpolated moire patterns during the canvas cutout.
                    const physX = Math.round(rect.left * scaleX);
                    const physY = Math.round(rect.top * scaleY);
                    const physWidth = Math.round(rect.width * scaleX);
                    const physHeight = Math.round(rect.height * scaleY);

                    // Create canvas at the exact high resolution to avoid blurry scaling
                    const canvas = document.createElement("canvas");
                    canvas.width = physWidth;
                    canvas.height = physHeight;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.imageSmoothingEnabled = false; // Never bilinear filter a pristine native screenshot
                        ctx.drawImage(
                            img,
                            physX, // source x
                            physY, // source y
                            physWidth, // source width
                            physHeight, // source height
                            0, // destination x
                            0, // destination y
                            physWidth, // destination width
                            physHeight, // destination height
                        );

                        // Set the photo URI to the cropped image
                        photoUri = canvas.toDataURL("image/jpeg", 0.5);
                        await capturePhoto(photoUri);
                    } else {
                        photoUri = base64Data; // fallback
                        await capturePhoto(photoUri);
                    }
                } else {
                    photoUri = base64Data;
                    await capturePhoto(photoUri);
                }
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
    class="flex flex-col h-full bg-black text-white relative select-none"
>
    {#if photoUri}
        <!-- Photo Preview Screen (Framed like standard OS apps) -->
        <div class="flex flex-col h-full bg-gray-950 text-white">
            <!-- Top Header Bar -->
            <div class="flex items-center justify-between px-4 pt-2 pb-2.5 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md z-10">
                <button
                    onclick={() => (photoUri = null)}
                    class="p-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                    aria-label="Back to camera"
                >
                    <ChevronLeftIcon class="h-6 w-6" />
                </button>
                <span class="font-semibold text-sm tracking-wide text-gray-200">Photo Preview</span>
                <div class="w-8"></div>
            </div>

            <!-- Framed Photo Container -->
            <div class="flex-1 p-4 flex items-center justify-center overflow-hidden">
                <div class="relative w-full h-full rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl bg-black flex items-center justify-center">
                    <img
                        src={photoUri}
                        alt="Captured preview"
                        class="w-full h-full object-contain"
                    />
                </div>
            </div>

            <!-- Bottom Action Bar -->
            <div class="p-4 pb-8 flex justify-around items-center bg-gray-900/90 border-t border-gray-800 backdrop-blur-md z-10">
                <button
                    onclick={() => (photoUri = null)}
                    class="px-6 py-2.5 rounded-full bg-gray-800 text-gray-200 font-medium hover:bg-gray-700 transition-colors text-sm border border-gray-700 shadow"
                >
                    Retake
                </button>
                <button
                    onclick={onback}
                    class="px-6 py-2.5 rounded-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors text-sm shadow-lg shadow-yellow-500/20"
                >
                    Use Photo
                </button>
            </div>
        </div>
    {:else}
        <!-- Live Viewfinder / Camera View -->
        <div class="flex-1 relative flex flex-col justify-between p-4">
            <!-- Top Controls -->
            <div class="flex justify-between items-center z-10 pt-2">
                <button
                    onclick={onback}
                    class="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    aria-label="Go back"
                >
                    <CloseIcon class="h-5 w-5" />
                </button>
            </div>

            <!-- Grid Overlay Guide -->
            <div
                class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20"
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

            <!-- Bottom Controls / Shutter Button -->
            <div class="flex justify-center items-center pb-8 z-10 relative">
                <button
                    onclick={takePhoto}
                    class="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform shadow-2xl"
                    aria-label="Take photo"
                >
                    <div
                        class="w-full h-full bg-white rounded-full transition-colors"
                    ></div>
                </button>
            </div>
        </div>
    {/if}
</div>
