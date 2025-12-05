<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { debugData } from "./utils/debug";
  import { fetchNui } from "./utils/fetchNui";
  import { time, formattedTime } from "./store/time";

  const modules = import.meta.glob("./components/*.svelte", { eager: true });
  const components: Record<string, any> = {};

  for (const path in modules) {
    const name = path.split("/").pop()?.replace(".svelte", "").toLowerCase();
    if (name) {
      components[name] = (modules[path] as any).default;
    }
  }

  let visible = false;
  let currentApp: string = "home";

  // Handle NUI messages
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;
    if (action === "setVisible") {
      visible = data;
    } else if (action === "setTime") {
      time.set(data);
    }
  };

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (currentApp !== "home") {
          currentApp = "home";
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

  const closePhone = () => {
    fetchNui("hideFrame");
    visible = false;
    currentApp = "home"; // Reset to home when closing
  };

  const openApp = (appName: string) => {
    currentApp = appName;
  };

  const goHome = () => {
    currentApp = "home";
  };
</script>

{#if visible}
  <main
    class="flex h-screen w-screen items-end justify-end overflow-hidden bg-transparent p-12"
  >
    <!-- Phone Frame -->
    <div
      transition:fly={{ y: 1000, duration: 500 }}
      class="relative h-[850px] w-[400px] rounded-[3.5rem] border-[8px] border-gray-900 bg-black shadow-2xl ring-1 ring-gray-700"
    >
      <!-- Side Buttons -->
      <!-- Power Button -->
      <div
        class="absolute -right-[10px] top-[180px] h-12 w-[10px] rounded-r-md bg-gray-800"
      ></div>
      <!-- Volume Buttons -->
      <div
        class="absolute -right-[10px] top-[250px] h-24 w-[10px] rounded-r-md bg-gray-800"
      ></div>

      <!-- Screen -->
      <div
        class="relative h-full w-full overflow-hidden rounded-[3rem] bg-gray-900"
      >
        <!-- Status Bar -->
        <div
          class="absolute top-0 z-20 flex w-full items-center justify-between px-8 pt-3 text-sm font-medium text-white"
        >
          <span>{$formattedTime}</span>
          <div class="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
              />
            </svg>
            <span>69%</span>
          </div>
        </div>

        <!-- Hole Punch Camera -->
        <div
          class="absolute left-1/2 top-2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-black ring-1 ring-gray-800"
        ></div>

        <!-- Content Area -->
        <div class="h-full pt-8 pb-4">
          {#if currentApp === "home"}
            <svelte:component
              this={components["home"]}
              {openApp}
              {closePhone}
            />
          {:else if components[currentApp]}
            <svelte:component this={components[currentApp]} onback={goHome} />
          {/if}
        </div>

        <!-- Home Indicator -->
        <div
          class="absolute bottom-2 left-1/2 z-20 h-1 w-1/3 -translate-x-1/2 transform rounded-full bg-white/80"
        ></div>
      </div>
    </div>
  </main>
{/if}
