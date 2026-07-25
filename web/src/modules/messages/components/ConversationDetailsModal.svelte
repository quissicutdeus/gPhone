<script lang="ts">
    import Avatar from "../../../components/Avatar.svelte";
    import Button from "../../../components/Button.svelte";
    import CloseIcon from "../../../components/icons/CloseIcon.svelte";
    import ArchiveIcon from "../../../components/icons/ArchiveIcon.svelte";
    import TrashIcon from "../../../components/icons/TrashIcon.svelte";
    import StarIcon from "../../../components/icons/StarIcon.svelte";
    import ChevronRightIcon from "../../../components/icons/ChevronRightIcon.svelte";
    import { openApp } from "../../../store/navigation";
    import { contacts } from "../../../store/contacts";
    import {
        messagesStore,
        type UIConversation,
    } from "../../../store/messages";

    interface Props {
        currentConv: UIConversation;
        onclose: () => void;
        ondelete: () => void;
    }

    let { currentConv, onclose, ondelete }: Props = $props();

    let editNameValue = $state("");

    $effect(() => {
        if (currentConv) {
            editNameValue = currentConv.targetName;
        }
    });

    const handleSaveGroupName = async () => {
        if (editNameValue.trim() && currentConv) {
            await messagesStore.renameConversation(
                currentConv.id,
                editNameValue.trim(),
            );
        }
    };
</script>

<div
    class="absolute inset-0 bg-gray-950/95 backdrop-blur-md z-40 flex flex-col animate-in fade-in duration-200"
>
    <!-- Modal Header -->
    <div class="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 class="font-semibold text-base text-white">Conversation Details</h3>
        <button
            type="button"
            class="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            onclick={onclose}
            aria-label="Close details"
        >
            <CloseIcon class="w-5 h-5" />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        <!-- Header Avatar & Name Info -->
        <div class="flex flex-col items-center text-center space-y-2 py-2">
            <Avatar
                src={currentConv.targetAvatar}
                initials={currentConv.targetName
                    ? currentConv.targetName[0]
                    : "?"}
                size="w-20 h-20"
                textClass="text-2xl font-bold"
                bgClass={currentConv.is_group
                    ? "bg-indigo-700"
                    : "bg-gray-800 border border-gray-700"}
            />
            <div>
                <div class="flex items-center justify-center gap-1.5">
                    <h2 class="text-lg font-bold text-white">
                        {currentConv.targetName}
                    </h2>
                    {#if !currentConv.is_group}
                        {@const targetContact = $contacts.find(
                            (c) =>
                                c.phone === currentConv.target ||
                                c.citizenid === currentConv.target,
                        )}
                        {#if targetContact?.favorite}
                            <StarIcon
                                filled={true}
                                class="w-5 h-5 text-yellow-400 shrink-0"
                            />
                        {/if}
                    {/if}
                </div>
                <p class="text-xs text-gray-400">
                    {currentConv.is_group
                        ? "Group Conversation"
                        : currentConv.target}
                </p>
            </div>
        </div>

        <!-- Group Rename & Participants Section -->
        {#if currentConv.is_group}
            <div
                class="bg-gray-900/80 rounded-xl p-3 border border-gray-800 space-y-2"
            >
                <label
                    for="group-name-input"
                    class="text-xs font-semibold text-gray-300"
                    >Group Name</label
                >
                <div class="flex gap-2">
                    <input
                        id="group-name-input"
                        type="text"
                        bind:value={editNameValue}
                        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter group name"
                    />
                    <Button
                        class="text-xs py-1.5 px-3 shrink-0"
                        onclick={handleSaveGroupName}
                    >
                        Save
                    </Button>
                </div>
            </div>

            <!-- Group Participants Section -->
            <div class="space-y-2">
                <h4
                    class="text-xs font-bold text-gray-400 uppercase tracking-wider px-1"
                >
                    Group Members ({currentConv.participants?.length || 0})
                </h4>
                <div
                    class="bg-gray-800/80 rounded-xl divide-y divide-gray-700/50 overflow-hidden border border-gray-700/60 shadow-lg"
                >
                    {#each currentConv.participants || [] as member}
                        {@const pContact =
                            member.contact ||
                            $contacts.find(
                                (c) => c.citizenid === member.citizenid,
                            )}
                        <button
                            type="button"
                            class="w-full p-3 text-left hover:bg-gray-700/50 transition-colors flex items-center justify-between group cursor-pointer"
                            onclick={() => {
                                onclose();
                                if (pContact) {
                                    openApp("contacts", {
                                        initialContact: pContact,
                                    });
                                }
                            }}
                        >
                            <div class="flex items-center gap-3">
                                <Avatar
                                    src={pContact?.avatar}
                                    initials={pContact
                                        ? pContact.firstname[0]
                                        : "M"}
                                    size="w-8 h-8"
                                    textClass="text-xs"
                                    bgClass="bg-gray-800 border border-gray-700/60"
                                />
                                <div>
                                    <p
                                        class="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors"
                                    >
                                        {pContact
                                            ? `${pContact.firstname} ${pContact.lastname || ""}`.trim()
                                            : member.citizenid}
                                    </p>
                                    {#if pContact?.phone}
                                        <p class="text-[10px] text-gray-400">
                                            {pContact.phone}
                                        </p>
                                    {/if}
                                </div>
                            </div>
                            <ChevronRightIcon
                                class="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors"
                            />
                        </button>
                    {/each}
                    {#if !currentConv.participants || currentConv.participants.length === 0}
                        <div class="p-3 text-xs text-gray-500 text-center">
                            No member details available.
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Conversation Actions (Archive & Delete) -->
        <div class="space-y-2 pt-2">
            <Button
                variant="secondary"
                class="w-full text-xs flex items-center justify-center gap-2 py-2.5"
                onclick={async () => {
                    if (currentConv) {
                        const isArchived = currentConv.status === "archived";
                        await messagesStore.archiveConversation(
                            currentConv.id,
                            !isArchived,
                        );
                        onclose();
                    }
                }}
            >
                <ArchiveIcon class="w-4 h-4" />
                {currentConv?.status === "archived"
                    ? "Unarchive Conversation"
                    : "Archive Conversation"}
            </Button>

            <Button
                variant="danger"
                class="w-full text-xs flex items-center justify-center gap-2 py-2.5"
                onclick={async () => {
                    if (currentConv) {
                        await messagesStore.deleteConversation(currentConv.id);
                        ondelete();
                    }
                }}
            >
                <TrashIcon class="w-4 h-4" />
                Delete Conversation
            </Button>
        </div>
    </div>
</div>
