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
  import { fetchNui } from "./utils/fetchNui";

  const components: Record<string, any> = { ...registeredComponents };
  components["home"] = Home;

  let visible = $state(false);

  // Handle NUI messages
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;
    if (action === "setVisible") {
      visible = data;
      if (!visible && isFreelook) {
        isFreelook = false;
      }
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

  let isFreelook = false;
  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.code === "AltLeft" || event.key === "Alt") {
        event.preventDefault();
        // Only toggle once per key press, ignore held repeats
        if (!event.repeat && visible) {
          isFreelook = !isFreelook;
          fetchNui("toggleFreelook", { state: isFreelook });
        }
      } else if (event.key === "Escape") {
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

  // Track if we are currently in the camera app and notify the client
  let wasInCameraApp = false;
  $effect(() => {
    const isCameraApp = $currentApp.name === "camera" && visible;
    if (isCameraApp !== wasInCameraApp) {
      wasInCameraApp = isCameraApp;
      fetchNui("onCameraApp", { state: isCameraApp });
    }
  });
</script>

{#if visible}
  <main
    class="flex h-screen w-screen overflow-hidden p-12"
    class:transition-all={!$isTakingPhoto}
    class:duration-150={!$isTakingPhoto}
    class:transition-none={$isTakingPhoto}
    class:items-center={$currentApp.name === "camera"}
    class:justify-center={$currentApp.name === "camera"}
    class:items-end={$currentApp.name !== "camera"}
    class:justify-end={$currentApp.name !== "camera"}
    class:opacity-0={$isTakingPhoto}
    class:bg-transparent={true}
  >
    <PhoneFrame
      transparent={$currentApp.name === "camera"}
      onClose={closePhone}
    >
      {#if $currentApp.name === "home"}
        {@const HomeComponent = components["home"]}
        <HomeComponent {openApp} {closePhone} />
      {:else if components[$currentApp.name]}
        {@const ActiveComponent = components[$currentApp.name]}
        <ActiveComponent onback={goHome} {...$currentApp.props} />
      {/if}
    </PhoneFrame>
  </main>
{/if}
