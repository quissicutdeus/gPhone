<script lang="ts">
    import { fade } from "svelte/transition";
    import Button from "./Button.svelte";

    interface Props {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: "primary" | "secondary" | "danger";
        isLoading?: boolean;
        onconfirm: () => void;
        oncancel: () => void;
    }

    let {
        title,
        message,
        confirmText = "Confirm",
        cancelText = "Cancel",
        confirmVariant = "danger",
        isLoading = false,
        onconfirm,
        oncancel,
    }: Props = $props();
</script>

<div
    class="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
    transition:fade
>
    <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full">
        <h3 class="text-xl font-bold text-white mb-2">{title}</h3>
        <p class="text-gray-400 mb-6">{message}</p>
        <div class="flex gap-3">
            <Button
                class="flex-1"
                variant="secondary"
                onclick={oncancel}
                disabled={isLoading}
            >
                {cancelText}
            </Button>
            <Button
                class="flex-1"
                variant={confirmVariant}
                onclick={onconfirm}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : confirmText}
            </Button>
        </div>
    </div>
</div>
