<script lang="ts">
    import AppIcon from "./AppIcon.svelte";
    import { registeredApps } from "../store/registry";

    let { openApp } = $props();
</script>

<div
    class="flex h-full flex-col items-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-white"
>
    <h1 class="mb-8 text-4xl font-bold tracking-tight">gphone</h1>

    <div class="grid grid-cols-4 gap-4 w-full px-4">
        {#each registeredApps as app}
            <AppIcon
                name={app.name}
                color={app.color}
                icon={app.icon}
                onclick={() => openApp(app.id)}
            />
        {/each}
    </div>
</div>
