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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
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
                <button
                    class="w-full p-2 bg-blue-600 rounded hover:bg-blue-500"
                    onclick={addContact}>Save</button
                >
            </div>
        {/if}

        {#snippet contactItem(contact: Contact)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class="flex items-center p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onclick={() => (selectedContact = contact)}
                role="button"
                tabindex="0"
            >
                <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold {contact.favorite
                        ? 'bg-yellow-600 ring-2 ring-yellow-400/30'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'}"
                >
                    {(contact.firstname[0] || "") +
                        (contact.lastname?.[0] || "")}
                </div>
                <div class="ml-4 flex flex-col flex-1">
                    <div class="flex items-center">
                        <span class="font-medium"
                            >{contact.firstname}
                            {contact.lastname || ""}</span
                        >
                        {#if contact.favorite}
                            <svg
                                class="w-3 h-3 text-yellow-500 ml-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                />
                            </svg>
                        {/if}
                    </div>
                    <span class="text-xs text-gray-400">{contact.phone}</span>
                </div>
            </div>
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
        <!-- Detailed View -->
        <div
            class="p-6 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-right duration-300"
        >
            <!-- Avatar -->
            <div
                class="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold {selectedContact.favorite
                    ? 'bg-yellow-600'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'}"
            >
                {(selectedContact.firstname[0] || "") +
                    (selectedContact.lastname?.[0] || "")}
            </div>

            <!-- Header Info -->
            <div class="text-center">
                <h2 class="text-2xl font-bold">
                    {selectedContact.firstname}
                    {selectedContact.lastname || ""}
                </h2>
            </div>

            <!-- Actions Row -->
            <div class="flex space-x-4">
                <button
                    class="p-3 bg-green-600 rounded-full hover:bg-green-500 transition-colors"
                    onclick={handleCall}
                    aria-label="Call"
                >
                    <!-- Call Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                </button>
                <button
                    class="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
                    onclick={handleMessage}
                    aria-label="Message"
                >
                    <!-- Message Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                </button>

                <button
                    class="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    onclick={shareContact}
                    aria-label="Share"
                >
                    <!-- Share Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                </button>
                <button
                    class="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    onclick={() => (isEditing = !isEditing)}
                    aria-label="Edit"
                >
                    <!-- Edit Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </button>
                <button
                    class="p-3 bg-red-900/50 text-red-400 rounded-full hover:bg-red-900/80 transition-colors"
                    onclick={deleteContact}
                    aria-label="Delete"
                >
                    <!-- Trash Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </button>
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
                        <button
                            class="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
                            onclick={updateContact}>Save Changes</button
                        >
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
                            <svg
                                class="w-6 h-6 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                />
                            </svg>
                        {:else}
                            <span class="text-gray-500">No</span>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</Screen>
