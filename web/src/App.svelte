<script lang="ts">
  import { onMount } from "svelte";
  import { debugData } from "./utils/debug";
  import { time } from "./store/time";
  import { currentApp, openApp, goHome, closePhone } from "./store/navigation";
  import { callStore } from "./store/call";
  import { isTakingPhoto } from "./store/camera";
  import PhoneFrame from "./components/PhoneFrame.svelte";
  import { registeredComponents } from "./store/registry";
  import Home from "./components/Home.svelte";

  const components: Record<string, any> = { ...registeredComponents };
  components["home"] = Home;

  let visible = false;

  // Handle NUI messages
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;
    if (action === "setVisible") {
      visible = data;
    } else if (action === "setTime") {
      time.set(data);
    } else if (action === "callStatus") {
      // { status: 'connected' | 'idle' | 'incoming', number: '...', name: '...' }
      if (data.status === "incoming") {
        visible = true;
        callStore.setIncoming(data.number, data.name);
        openApp("phone");
      } else {
        callStore.setStatus(data.status);
      }
    }
  };

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if ($currentApp.name !== "home") {
          goHome();
        } else {
          closePhone();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeydown);

    // Mock data for browser dev
    debugData([
      {
        action: "setVisible",
        data: true,
      },
      {
        action: "setTime",
        data: {
          hours: 16,
          minutes: 20,
        },
      },
    ]);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

{#if visible}
  <main
    class="flex h-screen w-screen items-end justify-end overflow-hidden p-12 transition-opacity duration-150"
    class:opacity-0={$isTakingPhoto}
    class:bg-transparent={true}
  >
    <PhoneFrame
      transparent={$currentApp.name === "camera"}
      onClose={closePhone}
    >
      {#if $currentApp.name === "home"}
        <svelte:component this={components["home"]} {openApp} {closePhone} />
      {:else if components[$currentApp.name]}
        <svelte:component
          this={components[$currentApp.name]}
          onback={goHome}
          {...$currentApp.props}
        />
      {/if}
    </PhoneFrame>
  </main>
{/if}
