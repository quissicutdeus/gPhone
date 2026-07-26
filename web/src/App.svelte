<script lang="ts">
  import { onMount } from "svelte";
  import { debugData } from "./utils/debug";
  import { time } from "./store/time";
  import { charge } from "./store/charge";
  import { currentApp, openApp, goHome, closePhone } from "./store/navigation";
  import { callStore } from "./store/call";
  import { isTakingPhoto } from "./store/camera";
  import PhoneFrame from "./components/PhoneFrame.svelte";
  import { registeredComponents } from "./store/registry";
  import Home from "./components/Home.svelte";
  import { fetchNui } from "./utils/fetchNui";
  import { mailStore } from "./store/mail";
  import { messagesStore } from "./store/messages";
  import { contacts } from "./store/contacts";
  import { toast } from "./store/toast";
  import { bootstrapStores } from "./store/bootstrap";
  import ToastContainer from "./components/ToastContainer.svelte";
  import ErrorBoundary from "./components/ErrorBoundary.svelte";

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
    } else if (action === "setCharge") {
      if (typeof data === "number") {
        charge.set(data);
      }
    } else if (action === "receiveMail") {
      mailStore.addReceivedMail(data);
      toast.showMail({
        sender: data.sender || "Mail",
        subject: data.subject || "New Message",
        onClick: () => {
          visible = true;
          openApp("mail", { mailId: data.id });
        },
      });
    } else if (action === "receiveMessage") {
      messagesStore.addReceivedMessage(data);
      toast.showIncomingMessage({
        sender: data.senderName || data.phone || "Message",
        message: data.message || "",
        avatar: data.avatar,
        onReply: async (replyText) => {
          if (data.conversation_id) {
            await messagesStore.sendMessage(data.conversation_id, replyText);
          }
        },
        onClick: () => {
          visible = true;
          openApp("messages", {
            conversationId: data.conversation_id,
            phone: data.phone || data.senderPhone,
          });
        },
      });
    } else if (action === "receiveContactShare" || action === "shareContact") {
      const handleAcceptContact = async () => {
        const firstname = typeof data.firstname === "string" ? data.firstname.trim() : "";
        const phone = typeof data.phone === "string" ? data.phone.trim() : "";

        if (!firstname || !phone) {
          toast.show({
            type: "error",
            message: "Cannot add contact: missing required name or phone number",
          });
          return;
        }

        const payload = {
          firstname,
          lastname: typeof data.lastname === "string" ? data.lastname.trim() : "",
          phone,
          email: typeof data.email === "string" ? data.email.trim() : undefined,
          avatar: typeof data.avatar === "string" ? data.avatar : undefined,
          favorite: typeof data.favorite === "boolean" ? data.favorite : false,
        };
        try {
          await contacts.add(payload);
          toast.show({
            type: "success",
            message: "Contact added to address book",
          });
        } catch (e: any) {
          toast.show({
            type: "error",
            message: e.message || "Failed to add contact",
          });
        }
      };

      toast.showContactShare({
        name: `${data.firstname || ""} ${data.lastname || ""}`.trim() || data.phone || "Contact",
        phone: data.phone || "",
        avatar: data.avatar,
        onAccept: handleAcceptContact,
        onDecline: () => {
          toast.show({
            type: "info",
            message: "Contact share declined",
          });
        },
        onClick: handleAcceptContact,
      });
    } else if (action === "callStatus") {
      // { status: 'connected' | 'idle' | 'incoming', number: '...', name: '...' }
      if (data.status === "incoming") {
        callStore.setIncoming(data.number, data.name);
        toast.showCall({
          name: data.name,
          number: data.number,
          onAccept: () => {
            visible = true;
            openApp("phone");
          },
          onDecline: () => {
            callStore.setStatus("idle");
            fetchNui("rejectCall", { number: data.number });
          },
        });
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
    const now = new Date();
    debugData([
      {
        action: "setVisible",
        data: true,
      },
      {
        action: "setTime",
        data: {
          hours: now.getHours(),
          minutes: now.getMinutes(),
        },
      },
    ]);

    if (import.meta.env.DEV) {
      (window as any).triggerTestToast = (
        type: "message" | "contact" | "call" | "email" = "message",
      ) => {
        if (type === "message") {
          const testMsg = {
            conversation_id: 1,
            senderName: "Ursula (Crazy Ex)",
            message: "1... 🤬😡🗯️‼️",
            phone: "555-0199",
            avatar:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
          };
          fetchNui("receiveMessage", testMsg).catch(() => {});
          window.postMessage(
            {
              action: "receiveMessage",
              data: testMsg,
            },
            "*",
          );
        } else if (type === "contact") {
          window.postMessage(
            {
              action: "shareContact",
              data: {
                firstname: "Franklin",
                lastname: "Clinton",
                phone: "555-0177",
              },
            },
            "*",
          );
        } else if (type === "call") {
          window.postMessage(
            {
              action: "callStatus",
              data: {
                status: "incoming",
                name: "Lester Crest",
                number: "555-0155",
              },
            },
            "*",
          );
        } else if (type === "email") {
          window.postMessage(
            {
              action: "receiveMail",
              data: {
                sender: "Fleeca Bank",
                subject: "Your Monthly Account Statement is Ready",
              },
            },
            "*",
          );
        }
      };
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  $effect(() => {
    if (visible) {
      bootstrapStores();
    }
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
      <ToastContainer />
      {#if $currentApp.name === "home"}
        {@const HomeComponent = components["home"]}
        <HomeComponent {openApp} {closePhone} />
      {:else if components[$currentApp.name]}
        {@const ActiveComponent = components[$currentApp.name]}
        {#key $currentApp.name}
          <ErrorBoundary appName={$currentApp.name}>
            <ActiveComponent onback={goHome} {...$currentApp.props} />
          </ErrorBoundary>
        {/key}
      {/if}
    </PhoneFrame>
  </main>
{/if}
