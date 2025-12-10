<script lang="ts">
    import { onMount } from "svelte";
    import { fetchNui } from "../utils/fetchNui";
    import type { Contact } from "@shared/types";

    let { onback } = $props();

    let contacts: Contact[] = $state([]);
    let isAdding = $state(false);

    // New Contact Form State
    let newContact = $state({
        firstname: "",
        lastname: "",
        phone: "",
        favorite: false,
    });

    const goBack = () => {
        onback?.();
    };

    const loadContacts = async () => {
        try {
            contacts = await fetchNui<Contact[]>("getContacts");
        } catch (e) {
            console.error("Failed to load contacts", e);
            // Mock data for browser testing
            contacts = [
                {
                    id: 1,
                    citizenid: "1",
                    firstname: "Alice",
                    lastname: "Smith",
                    phone: "555-0100",
                    favorite: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    citizenid: "2",
                    firstname: "Bob",
                    lastname: "Jones",
                    phone: "555-0101",
                    favorite: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ];
        }
    };

    const addContact = async () => {
        try {
            const created = await fetchNui<Contact>(
                "createContact",
                newContact,
            );
            contacts = [...contacts, created];
            isAdding = false;
            newContact = {
                firstname: "",
                lastname: "",
                phone: "",
                favorite: false,
            };
        } catch (e) {
            console.error("Failed to create contact", e);
        }
    };

    onMount(() => {
        loadContacts();
    });
</script>

<div class="flex h-full flex-col bg-gray-900 text-white">
    <!-- Header -->
    <div
        class="flex items-center px-4 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700"
    >
        <button
            class="p-2 -ml-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={goBack}
            aria-label="Go back"
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
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>
        <h1 class="ml-2 text-xl font-semibold">Contacts</h1>
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
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
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

        <div class="divide-y divide-gray-800">
            {#each contacts as contact}
                <div
                    class="flex items-center p-4 hover:bg-gray-800/50 transition-colors"
                >
                    <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold {contact.favorite
                            ? 'bg-yellow-600'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'}"
                    >
                        {contact.firstname[0]}
                    </div>
                    <div class="ml-4 flex flex-col">
                        <span class="font-medium"
                            >{contact.firstname}
                            {contact.lastname || ""}</span
                        >
                        <span class="text-xs text-gray-400"
                            >{contact.phone}</span
                        >
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
