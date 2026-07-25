<script lang="ts">
    import Avatar from "../../../components/Avatar.svelte";
    import MessageStatusIcon from "../../../components/icons/MessageStatusIcon.svelte";
    import { formatTime } from "../../../utils/formatters";
    import { openApp } from "../../../store/navigation";
    import { contacts } from "../../../store/contacts";
    import type { UIMessage, UIConversation } from "../../../store/messages";
    import type { Contact } from "@shared/types";

    interface Props {
        msg: UIMessage;
        currentConv: UIConversation;
        isLastReadMyMessage: boolean;
        isReadByOther: boolean;
    }

    let { msg, currentConv, isLastReadMyMessage, isReadByOther }: Props =
        $props();

    const getSenderInfo = () => {
        if (!currentConv)
            return { name: "Member", avatar: undefined, contact: undefined };
        const p = currentConv.participants?.find(
            (part) => part.citizenid === msg.citizenid,
        );
        const contact =
            p?.contact || $contacts.find((c) => c.citizenid === msg.citizenid);
        const name = contact
            ? `${contact.firstname} ${contact.lastname || ""}`.trim()
            : p?.citizenid || "Member";
        const avatar = contact?.avatar;
        return { name, avatar, contact };
    };

    const handleOpenSenderContact = (contact?: Contact) => {
        if (contact) {
            openApp("contacts", { initialContact: contact });
        }
    };
</script>

<div
    class="flex flex-col mb-1.5 {msg.sender === 'me'
        ? 'items-end'
        : 'items-start'}"
>
    {#if currentConv?.is_group && msg.sender === "other"}
        {@const senderInfo = getSenderInfo()}
        <button
            type="button"
            class="flex items-center gap-1.5 mb-1 ml-1 hover:opacity-80 transition-opacity text-left cursor-pointer group/sender"
            onclick={() => handleOpenSenderContact(senderInfo.contact)}
        >
            <Avatar
                src={senderInfo.avatar}
                initials={senderInfo.name[0] || "?"}
                size="w-4 h-4"
                textClass="text-[9px]"
                bgClass="bg-gray-800 border border-gray-700/60"
            />
            <span
                class="text-xs font-semibold text-blue-400 group-hover/sender:underline"
            >
                {senderInfo.name}
            </span>
        </button>
    {/if}

    <div
        class="max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm {msg.sender ===
        'me'
            ? 'bg-blue-600 text-white rounded-tr-xs'
            : 'bg-gray-800 text-gray-100 rounded-tl-xs'}"
    >
        {#if msg.attachments && msg.attachments.length > 0}
            <div class="mb-2 space-y-2">
                {#each msg.attachments as attach}
                    <img
                        src={attach.attachment}
                        alt="Attachment"
                        class="rounded-lg max-w-full"
                    />
                {/each}
            </div>
        {/if}
        <p class="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.message}
        </p>
    </div>

    <div class="flex items-center gap-1.5 mt-1 px-1 select-none">
        <span class="text-[10px] text-gray-400">
            {formatTime(msg.created_at)}
        </span>
        {#if msg.sender === "me" && currentConv}
            {#if isLastReadMyMessage}
                <MessageStatusIcon status="read" class="w-3.5 h-3.5" />
            {:else if !isReadByOther}
                <MessageStatusIcon status="delivered" class="w-3.5 h-3.5" />
            {/if}
        {/if}
    </div>
</div>
