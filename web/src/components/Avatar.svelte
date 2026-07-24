<script lang="ts">
    interface Props {
        initials: string;
        size?: string;
        textClass?: string;
        bgClass?: string;
    }

    let {
        initials,
        size = "w-10 h-10",
        textClass = "text-sm",
        bgClass = "bg-gradient-to-br from-blue-500 to-purple-600",
    }: Props = $props();
</script>

<div
    class="{size} rounded-full flex items-center justify-center font-bold {bgClass} {textClass}"
>
    {initials}
</div>
