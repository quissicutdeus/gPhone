<script lang="ts">
    import { onMount } from "svelte";
    import { fetchNui } from "../../utils/fetchNui";
    import type { Contact } from "@shared/types";
    import { callStore } from "../../store/call";
    import { openApp } from "../../store/navigation";
    import Screen from "../../components/Screen.svelte";
    import {
        contacts,
        favoriteContacts,
        contacts as contactsStore,
    } from "../../store/contacts";
    import AddIcon from "../../components/icons/AddIcon.svelte";
    import StarIcon from "../../components/icons/StarIcon.svelte";
    import PhoneIcon from "../../components/icons/PhoneIcon.svelte";
    import MessageIcon from "../../components/icons/MessageIcon.svelte";
    import ShareIcon from "../../components/icons/ShareIcon.svelte";
    import EditIcon from "../../components/icons/EditIcon.svelte";
    import TrashIcon from "../../components/icons/TrashIcon.svelte";
    import Avatar from "../../components/Avatar.svelte";
    import ListItem from "../../components/ListItem.svelte";
    import Button from "../../components/Button.svelte";

    let { onback } = $props();

    // Derive other contacts from the main store
    let otherContacts = $derived($contacts.filter((c) => !c.favorite));
    let isAdding = $state(false);

    // New Contact Form State
    let newContact = $state({
        firstname: "",
        lastname: "",
        phone: "",
        email: "",
        favorite: false,
    });

    let selectedContact: Contact | null = $state(null);
    let isEditing = $state(false);

    const goBack = () => {
        if (selectedContact) {
            selectedContact = null;
            isEditing = false;
        } else {
            onback?.();
        }
    };

    const handleMessage = async () => {
        if (!selectedContact) return;
        // We can pass the contact info to Messages app to find/start conversation
        openApp("messages", { initialContact: selectedContact });
    };

    const handleCall = () => {
        if (!selectedContact) return;
        const name = `${selectedContact.firstname} ${selectedContact.lastname || ""}`;
        callStore.startCall(selectedContact.phone, name);
        openApp("phone");
    };

    const addContact = async () => {
        try {
            await contactsStore.add({
                ...newContact,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            isAdding = false;
            newContact = {
                firstname: "",
                lastname: "",
                phone: "",
                email: "",
                favorite: false,
            };
        } catch (e) {
            console.error("Failed to create contact", e);
        }
    };

    const updateContact = async () => {
        if (!selectedContact) return;
        try {
            // Sanitize payload to only include updatable fields
            const payload = {
                id: selectedContact.id, // ID is required for update in ServerApp
                firstname: selectedContact.firstname,
                lastname: selectedContact.lastname,
                phone: selectedContact.phone,
                email: selectedContact.email,
                favorite: selectedContact.favorite,
                avatar: selectedContact.avatar,
                citizenid: selectedContact.citizenid, // Required for type safety
                created_at: selectedContact.created_at,
                updated_at: new Date().toISOString(),
            };

            await contactsStore.update(payload);
            isEditing = false;
        } catch (e) {
            console.error("Failed to update contact", e);
        }
    };

    const deleteContact = async () => {
        if (!selectedContact) return;
        try {
            await contactsStore.delete(selectedContact.id);
            selectedContact = null;
        } catch (e) {
            console.error("Failed to delete contact", e);
        }
    };

    const shareContact = async () => {
        if (!selectedContact) return;
        try {
            await contactsStore.share(selectedContact);
        } catch (e) {
            console.error("Failed to share contact", e);
        }
    };

    onMount(() => {
        contactsStore.load();
    });

    const getTitle = () => (selectedContact ? "Contact Details" : "Contacts");
</script>

{#snippet headerActions()}
    {#if !selectedContact}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={() => (isAdding = !isAdding)}
            aria-label="Add contact"
        >
            <AddIcon />
        </button>
    {/if}
{/snippet}

<Screen title={getTitle()} onback={goBack} actions={headerActions}>
    {#if !selectedContact}
        {#if isAdding}
            <div class="p-4 space-y-3 bg-gray-800 m-2 rounded-lg">
                <input
                    class="w-full p-2 bg-gray-700 rounded"
                    placeholder="First Name"
                    bind:value={newContact.firstname}
                />
                <input
                    class="w-full p-2 bg-gray-700 rounded"
                    placeholder="Last Name"
                    bind:value={newContact.lastname}
                />
                <input
                    class="w-full p-2 bg-gray-700 rounded"
                    placeholder="Phone Number"
                    bind:value={newContact.phone}
                />
                <input
                    class="w-full p-2 bg-gray-700 rounded"
                    placeholder="Email"
                    bind:value={newContact.email}
                />
                <label class="flex items-center space-x-2">
                    <input type="checkbox" bind:checked={newContact.favorite} />
                    <span>Favorite</span>
                </label>
                <Button
                    class="w-full"
                    onclick={addContact}
                >
                    Save
                </Button>
            </div>
        {/if}

        {#snippet contactItem(contact: Contact)}
            <ListItem
                onclick={() => (selectedContact = contact)}
            >
                <div class="mr-4 shrink-0">
                    <Avatar
                        initials={(contact.firstname[0] || "") + (contact.lastname?.[0] || "")}
                        bgClass={contact.favorite ? 'bg-yellow-600 ring-2 ring-yellow-400/30' : 'bg-gradient-to-br from-blue-500 to-purple-600'}
                    />
                </div>
                <div class="flex flex-col flex-1">
                    <div class="flex items-center">
                        <span class="font-medium"
                            >{contact.firstname}
                            {contact.lastname || ""}</span
                        >
                        {#if contact.favorite}
                            <StarIcon class="w-3 h-3 text-yellow-500 ml-2" />
                        {/if}
                    </div>
                    <span class="text-xs text-gray-400">{contact.phone}</span>
                </div>
            </ListItem>
        {/snippet}

        <div class="overflow-y-auto">
            {#if $favoriteContacts.length > 0}
                <div>
                    <div
                        class="sticky top-0 z-10 px-4 py-1 text-xs font-bold text-gray-400 bg-gray-900/95 backdrop-blur border-b border-gray-800 uppercase tracking-wider"
                    >
                        Favorites
                    </div>
                    <div class="divide-y divide-gray-800">
                        {#each $favoriteContacts as contact}
                            {@render contactItem(contact)}
                        {/each}
                    </div>
                </div>
            {/if}

            <div>
                <div
                    class="sticky top-0 z-10 px-4 py-1 text-xs font-bold text-gray-400 bg-gray-900/95 backdrop-blur border-b border-gray-800 uppercase tracking-wider"
                >
                    Contacts
                </div>
                <div class="divide-y divide-gray-800">
                    {#each otherContacts as contact}
                        {@render contactItem(contact)}
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <div
            class="p-6 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-right duration-300"
        >
            <!-- Avatar -->
            <Avatar
                initials={(selectedContact.firstname[0] || "") + (selectedContact.lastname?.[0] || "")}
                size="w-24 h-24"
                textClass="text-4xl"
                bgClass={selectedContact.favorite ? 'bg-yellow-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}
            />

            <!-- Header Info -->
            <div class="text-center">
                <h2 class="text-2xl font-bold">
                    {selectedContact.firstname}
                    {selectedContact.lastname || ""}
                </h2>
            </div>

            <!-- Actions Row -->
            <div class="flex space-x-4">
                <Button
                    variant="icon"
                    class="bg-green-600 hover:bg-green-500 text-white hover:text-white"
                    onclick={handleCall}
                    aria-label="Call"
                >
                    <!-- Call Icon -->
                    <PhoneIcon />
                </Button>
                <Button
                    variant="icon"
                    class="bg-blue-600 hover:bg-blue-500 text-white hover:text-white"
                    onclick={handleMessage}
                    aria-label="Message"
                >
                    <!-- Message Icon -->
                    <MessageIcon />
                </Button>

                <Button
                    variant="icon"
                    class="bg-gray-700 hover:bg-gray-600 text-white hover:text-white"
                    onclick={shareContact}
                    aria-label="Share"
                >
                    <!-- Share Icon -->
                    <ShareIcon />
                </Button>
                <Button
                    variant="icon"
                    class="bg-gray-700 hover:bg-gray-600 text-white hover:text-white"
                    onclick={() => (isEditing = !isEditing)}
                    aria-label="Edit"
                >
                    <!-- Edit Icon -->
                    <EditIcon />
                </Button>
                <Button
                    variant="icon"
                    class="bg-red-900/50 hover:bg-red-900/80 text-red-400 hover:text-red-300"
                    onclick={deleteContact}
                    aria-label="Delete"
                >
                    <!-- Trash Icon -->
                    <TrashIcon />
                </Button>
            </div>

            <!-- Details List / Edit Form -->
            <div class="w-full bg-gray-800 rounded-xl p-4 space-y-4 shadow-lg">
                {#if isEditing}
                    <div class="space-y-3">
                        <input
                            class="w-full p-2 bg-gray-700 rounded"
                            bind:value={selectedContact.firstname}
                            placeholder="First Name"
                        />
                        <input
                            class="w-full p-2 bg-gray-700 rounded"
                            bind:value={selectedContact.lastname}
                            placeholder="Last Name"
                        />
                        <input
                            class="w-full p-2 bg-gray-700 rounded"
                            bind:value={selectedContact.phone}
                            placeholder="Phone"
                        />
                        <input
                            class="w-full p-2 bg-gray-700 rounded"
                            bind:value={selectedContact.email}
                            placeholder="Email"
                        />
                        <label class="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                bind:checked={selectedContact.favorite}
                            />
                            <span>Favorite</span>
                        </label>
                        <Button
                            class="w-full"
                            onclick={updateContact}
                        >
                            Save Changes
                        </Button>
                    </div>
                {:else}
                    <div class="flex flex-col border-b border-gray-700 pb-2">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider"
                            >Phone</span
                        >
                        <span class="text-lg">{selectedContact.phone}</span>
                    </div>
                    <div class="flex flex-col border-b border-gray-700 pb-2">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider"
                            >Email</span
                        >
                        <span class="text-lg"
                            >{selectedContact.email || "No email"}</span
                        >
                    </div>
                    <div class="flex items-center justify-between pt-2">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider"
                            >Favorite</span
                        >
                        {#if selectedContact.favorite}
                            <StarIcon class="w-6 h-6 text-yellow-500" />
                        {:else}
                            <span class="text-gray-500">No</span>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</Screen>
