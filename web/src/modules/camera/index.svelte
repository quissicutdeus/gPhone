<script lang="ts">
    import { isTakingPhoto } from "../../store/camera";
    import { fetchNui } from "../../utils/fetchNui";
    import { photos } from "../../store/photos";
    import CloseIcon from "../../components/icons/CloseIcon.svelte";
    import ChevronLeftIcon from "../../components/icons/ChevronLeftIcon.svelte";

    let { onback } = $props<{ onback: () => void }>();

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
                        await photos.add({ image: photoUri });
                    } else {
                        photoUri = base64Data; // fallback
                        await photos.add({ image: photoUri });
                    }
                } else {
                    photoUri = base64Data;
                    await photos.add({ image: photoUri });
                }
            } catch (err) {
                console.error("Failed to take photo", err);
            } finally {
                isTakingPhoto.set(false);
            }
        }, 50);
    };

    const closePhoto = () => {
        photoUri = null;
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !photoUri && !$isTakingPhoto) {
            e.preventDefault();
            takePhoto();
        }
    };
</script>

<svelte:window onkeydown={handleKeydown} />

<div
    bind:this={containerRef}
    class="relative flex h-full w-full flex-col bg-transparent"
>
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
                <CloseIcon />
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
            <ChevronLeftIcon />
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
