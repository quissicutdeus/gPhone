<script lang="ts">
    interface Props {
        value: string;
        placeholder?: string;
        focusRingClass?: string;
        class?: string;
    }

    let {
        value = $bindable(),
        placeholder = "Search...",
        focusRingClass = "focus:ring-blue-500",
        class: className = "bg-gray-800 text-white",
    }: Props = $props();

    const focus = (node: HTMLInputElement) => {
        // Optional autofocus could be added here if needed
    };
</script>

<input
    class="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-1 placeholder-gray-500 text-sm {className} {focusRingClass}"
    {placeholder}
    bind:value
    use:focus
/>
