<script lang="ts">
  import { onMount } from "svelte";
  import { debugData } from "./utils/debug";
  import { fetchNui } from "./utils/fetchNui";

  let visible = false;
  let currentTime = "00:00";

  // Handle NUI messages
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;
    if (action === "setVisible") {
      visible = data;
    } else if (action === "setTime") {
      const { hours, minutes } = data;
      currentTime = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    }
  };

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePhone();
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
          hours: 4,
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
  };
</script>

{#if visible}
  <main
    class="flex h-screen w-screen items-center justify-center bg-transparent"
  >
    <!-- Phone Frame -->
    <div
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
          <span>{currentTime}</span>
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
        <div
          class="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-white"
        >
          <h1 class="mb-4 text-3xl font-bold tracking-tight">gPhone</h1>
          <p class="text-gray-400">Coming soon...</p>
          <button
            class="mt-8 rounded-full bg-blue-400 px-6 py-3 font-semibold text-gray-900 transition-transform hover:scale-105 active:scale-95"
            onclick={closePhone}
          >
            Close
          </button>
        </div>

        <!-- Home Indicator -->
        <div
          class="absolute bottom-2 left-1/2 z-20 h-1 w-1/3 -translate-x-1/2 transform rounded-full bg-white/80"
        ></div>
      </div>
    </div>
  </main>
{/if}
