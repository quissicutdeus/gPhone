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
    import { photos } from "../../store/photos";
    import CloseIcon from "../../components/icons/CloseIcon.svelte";
    import SearchIcon from "../../components/icons/SearchIcon.svelte";
    import SearchBar from "../../components/SearchBar.svelte";
    import ChevronRightIcon from "../../components/icons/ChevronRightIcon.svelte";
    import { messagesStore } from "../../store/messages";
    import { formatRelativeTime } from "../../utils/formatters";
    import { useScrollDetect } from "../../utils/useScrollDetect";
    import FloatingActionButton from "../../components/FloatingActionButton.svelte";
    import PhotoPickerModal from "../../components/PhotoPickerModal.svelte";

    let { onback } = $props();

    // Derive other contacts from the main store
    let otherContacts = $derived($contacts.filter((c) => !c.favorite));
    let isAdding = $state(false);

    // New Contact Form State
    let newContact = $state({
        firstname: "",
        lastname: "",
        phone: "",
        avatar: "",
        favorite: false,
    });

    let selectedContact: Contact | null = $state(null);
    let isEditing = $state(false);
    let showPhotoPicker = $state(false);
    let photoPickerTarget: "new" | "edit" = $state("new");
    let showSearch = $state(false);
    let searchQuery = $state("");
    let isScrolled = $state(false);

    // Filtered contacts based on search query
    let filteredContacts = $derived(
        searchQuery.trim()
            ? $contacts.filter(
                  (c) =>
                      `${c.firstname} ${c.lastname || ""}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      c.phone.includes(searchQuery.trim()),
              )
            : $contacts,
    );
    let filteredFavorites = $derived(
        filteredContacts.filter((c) => c.favorite),
    );
    let filteredOther = $derived(filteredContacts.filter((c) => !c.favorite));

    // Derived conversation & recent messages for selected contact
    let matchingConv = $derived(
        selectedContact
            ? $messagesStore.find(
                  (c) =>
                      c.target === selectedContact?.phone ||
                      c.target === selectedContact?.citizenid ||
                      c.participants?.some(
                          (p) =>
                              p.contact?.phone === selectedContact?.phone ||
                              p.citizenid === selectedContact?.citizenid,
                      ),
              )
            : null,
    );

    const messageStore = messagesStore.messages;
    let contactMessages = $derived(
        matchingConv ? $messageStore[matchingConv.id] || [] : [],
    );

    let recentMessages = $derived(contactMessages.slice(-5).reverse());

    $effect(() => {
        if (selectedContact && matchingConv) {
            messagesStore.loadMessages(matchingConv.id);
        }
    });

    const openPhotoPicker = (target: "new" | "edit") => {
        photoPickerTarget = target;
        photos.load();
        showPhotoPicker = true;
    };

    const selectPhoto = (image: string) => {
        if (photoPickerTarget === "new") {
            newContact.avatar = image;
        } else if (selectedContact) {
            selectedContact.avatar = image;
        }
        showPhotoPicker = false;
    };

    const goBack = () => {
        if (selectedContact) {
            selectedContact = null;
            isEditing = false;
        } else if (isAdding) {
            isAdding = false;
        } else if (showSearch) {
            showSearch = false;
            searchQuery = "";
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
            });
            isAdding = false;
            newContact = {
                firstname: "",
                lastname: "",
                phone: "",
                avatar: "",
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

    const toggleFavorite = async () => {
        if (!selectedContact) return;
        selectedContact.favorite = !selectedContact.favorite;
        await updateContact();
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
            await contactsStore.share({
                name: `${selectedContact.firstname} ${selectedContact.lastname || ""}`.trim(),
                firstname: selectedContact.firstname,
                lastname: selectedContact.lastname,
                phone: selectedContact.phone,
                avatar: selectedContact.avatar || "",
            });
        } catch (e) {
            console.error("Failed to share contact", e);
        }
    };

    onMount(() => {
        contactsStore.load();
        messagesStore.loadConversations();
    });

    useScrollDetect((v) => (isScrolled = v));

    const getTitle = () => (selectedContact ? "Contact Details" : "Contacts");
</script>

{#snippet headerActions()}
    {#if !selectedContact && !isAdding}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors {showSearch
                ? 'text-blue-400 bg-gray-800'
                : 'text-gray-300'}"
            onclick={() => {
                showSearch = !showSearch;
                if (!showSearch) searchQuery = "";
            }}
            title="Search Contacts"
            aria-label="Search Contacts"
        >
            <SearchIcon class="w-5 h-5" />
        </button>
    {/if}
{/snippet}

{#snippet fabOverlay()}
    {#if !selectedContact && !isAdding}
        <FloatingActionButton
            label="Add Contact"
            collapsed={isScrolled}
            onclick={() => (isAdding = true)}
        >
            {#snippet icon()}
                <AddIcon class="w-4 h-4 text-white shrink-0" />
            {/snippet}
        </FloatingActionButton>
    {/if}
{/snippet}

<Screen
    title={getTitle()}
    onback={goBack}
    actions={headerActions}
    overlay={fabOverlay}
>
    {#if !selectedContact}
        {#if isAdding}
            <!-- New Contact Dropdown Panel (Sticky overlay directly below header) -->
            <div
                class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-2xl p-4 space-y-3 animate-in slide-in-from-top duration-200"
            >
                <div
                    class="flex items-center justify-between pb-1 border-b border-gray-800"
                >
                    <h3 class="font-semibold text-base text-white">
                        New Contact
                    </h3>
                    <button
                        type="button"
                        class="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        onclick={() => (isAdding = false)}
                        aria-label="Close form"
                    >
                        <CloseIcon class="w-5 h-5" />
                    </button>
                </div>

                <!-- Avatar Preview & Edit Pencil -->
                <div class="flex justify-center py-2">
                    <div class="relative">
                        <Avatar
                            src={newContact.avatar}
                            initials={(newContact.firstname[0] || "") +
                                (newContact.lastname?.[0] || "")}
                            size="w-24 h-24"
                            textClass="text-3xl"
                        />
                        <button
                            type="button"
                            class="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg border-2 border-gray-900 transition-transform active:scale-95 flex items-center justify-center"
                            onclick={() => openPhotoPicker("new")}
                            aria-label="Select photo from gallery"
                            title="Select photo from gallery"
                        >
                            <EditIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <input
                    class="w-full p-2 bg-gray-700 rounded text-sm text-white placeholder-gray-400"
                    placeholder="First Name"
                    bind:value={newContact.firstname}
                />
                <input
                    class="w-full p-2 bg-gray-700 rounded text-sm text-white placeholder-gray-400"
                    placeholder="Last Name"
                    bind:value={newContact.lastname}
                />
                <input
                    class="w-full p-2 bg-gray-700 rounded text-sm text-white placeholder-gray-400"
                    placeholder="Phone Number"
                    bind:value={newContact.phone}
                />
                <label
                    class="flex items-center space-x-2 text-sm text-gray-300"
                >
                    <input
                        type="checkbox"
                        bind:checked={newContact.favorite}
                        class="rounded bg-gray-700 border-gray-600 text-blue-600"
                    />
                    <span>Favorite</span>
                </label>

                <div class="flex space-x-2 pt-1">
                    <Button
                        variant="secondary"
                        class="flex-1 text-xs"
                        onclick={() => (isAdding = false)}
                    >
                        Cancel
                    </Button>
                    <Button class="flex-1 text-xs" onclick={addContact}>
                        Save Contact
                    </Button>
                </div>
            </div>
        {/if}

        {#snippet contactItem(contact: Contact)}
            <ListItem onclick={() => (selectedContact = contact)}>
                <div class="mr-4 shrink-0">
                    <Avatar
                        src={contact.avatar}
                        initials={(contact.firstname[0] || "") +
                            (contact.lastname?.[0] || "")}
                        bgClass="bg-gray-800 border border-gray-700/60"
                    />
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                    <div class="flex items-center">
                        <span class="font-medium truncate">
                            {contact.firstname}
                            {contact.lastname || ""}
                        </span>
                        {#if contact.favorite}
                            <StarIcon
                                class="w-4 h-4 text-yellow-400 ml-1.5 shrink-0"
                            />
                        {/if}
                    </div>
                    <span class="text-xs text-gray-400">{contact.phone}</span>
                </div>
            </ListItem>
        {/snippet}

        {#if showSearch}
            <!-- Search Dropdown Overlay -->
            <div
                class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md p-3 border-b border-gray-800 animate-in slide-in-from-top duration-200"
            >
                <SearchBar
                    bind:value={searchQuery}
                    placeholder="Search contacts..."
                />
            </div>
        {/if}

        <div class="overflow-y-auto">
            {#if filteredFavorites.length > 0}
                <div>
                    <div
                        class="sticky top-0 z-10 px-4 py-1 text-xs font-bold text-gray-400 bg-gray-900/95 backdrop-blur border-b border-gray-800 uppercase tracking-wider"
                    >
                        Favorites
                    </div>
                    <div class="divide-y divide-gray-800">
                        {#each filteredFavorites as contact}
                            {@render contactItem(contact)}
                        {/each}
                    </div>
                </div>
            {/if}

            {#if filteredOther.length > 0}
                <div>
                    <div
                        class="sticky top-0 z-10 px-4 py-1 text-xs font-bold text-gray-400 bg-gray-900/95 backdrop-blur border-b border-gray-800 uppercase tracking-wider"
                    >
                        Contacts
                    </div>
                    <div class="divide-y divide-gray-800">
                        {#each filteredOther as contact}
                            {@render contactItem(contact)}
                        {/each}
                    </div>
                </div>
            {/if}

            {#if filteredContacts.length === 0}
                <div class="py-16 text-center text-sm text-gray-400">
                    No matching contacts found.
                </div>
            {/if}
        </div>
    {:else}
        <div
            class="p-6 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-right duration-300"
        >
            <!-- Avatar & Pencil Overlay -->
            <div class="relative">
                <Avatar
                    src={selectedContact.avatar}
                    initials={(selectedContact.firstname[0] || "") +
                        (selectedContact.lastname?.[0] || "")}
                    size="w-24 h-24"
                    textClass="text-4xl"
                    bgClass="bg-gray-800 border border-gray-700/60"
                />
                <button
                    type="button"
                    class="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg border-2 border-gray-900 transition-transform active:scale-95 flex items-center justify-center"
                    onclick={() => openPhotoPicker("edit")}
                    aria-label="Select photo from gallery"
                    title="Select photo from gallery"
                >
                    <EditIcon class="w-4 h-4" />
                </button>
            </div>

            <!-- Header Info & Favorite Toggle -->
            <div class="flex items-center justify-center space-x-2">
                <h2 class="text-2xl font-bold">
                    {selectedContact.firstname}
                    {selectedContact.lastname || ""}
                </h2>
                <button
                    type="button"
                    class="p-1 rounded-full hover:scale-110 active:scale-95 transition-transform"
                    onclick={toggleFavorite}
                    aria-label="Toggle favorite"
                    title={selectedContact.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"}
                >
                    <StarIcon
                        filled={selectedContact.favorite}
                        class={selectedContact.favorite
                            ? "w-6 h-6 text-yellow-400"
                            : "w-6 h-6 text-gray-500 hover:text-yellow-400"}
                    />
                </button>
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
                        <label class="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                bind:checked={selectedContact.favorite}
                            />
                            <span>Favorite</span>
                        </label>
                        <Button class="w-full" onclick={updateContact}>
                            Save Changes
                        </Button>
                    </div>
                {:else}
                    <div class="flex flex-col">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider"
                            >Phone</span
                        >
                        <span class="text-lg">{selectedContact.phone}</span>
                    </div>
                {/if}
            </div>

            <!-- Recent Text Messages Card -->
            <div
                class="w-full bg-gray-800 rounded-xl border border-gray-700/60 overflow-hidden shadow-lg"
            >
                <div
                    class="px-4 py-3 border-b border-gray-700/60 flex items-center justify-between bg-gray-800/80"
                >
                    <div class="flex items-center gap-2">
                        <MessageIcon class="w-4 h-4 text-blue-400" />
                        <h4
                            class="text-xs font-bold text-gray-300 uppercase tracking-wider"
                        >
                            Recent Text Messages
                        </h4>
                    </div>
                    {#if matchingConv}
                        <button
                            type="button"
                            class="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                            onclick={handleMessage}
                        >
                            View All ({contactMessages.length})
                        </button>
                    {/if}
                </div>

                {#if recentMessages.length > 0}
                    <div class="divide-y divide-gray-700/40">
                        {#each recentMessages as msg}
                            <button
                                type="button"
                                class="w-full p-3.5 text-left hover:bg-gray-700/40 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                                onclick={handleMessage}
                            >
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span
                                            class="text-xs font-bold {msg.sender ===
                                            'me'
                                                ? 'text-blue-400'
                                                : 'text-gray-200'}"
                                        >
                                            {msg.sender === "me"
                                                ? "You"
                                                : selectedContact.firstname}
                                        </span>
                                        <span class="text-[10px] text-gray-500"
                                            >•</span
                                        >
                                        <span class="text-[10px] text-gray-400">
                                            {formatRelativeTime(msg.created_at)}
                                        </span>
                                    </div>
                                    <p
                                        class="text-xs text-gray-300 truncate leading-relaxed"
                                    >
                                        {msg.message}
                                    </p>
                                </div>
                                <ChevronRightIcon
                                    class="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                                />
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2"
                    >
                        <MessageIcon class="w-8 h-8 text-gray-600 mb-1" />
                        <span
                            >No recent messages with {selectedContact.firstname}.</span
                        >
                        <button
                            type="button"
                            class="mt-1 px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium transition-all cursor-pointer"
                            onclick={handleMessage}
                        >
                            Send Text Message
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Photo Gallery Picker Modal -->
    {#if showPhotoPicker}
        <PhotoPickerModal
            title="Select Contact Photo"
            showRemove={(photoPickerTarget === "new" && !!newContact.avatar) ||
                (photoPickerTarget === "edit" && !!selectedContact?.avatar)}
            onselect={selectPhoto}
            onclose={() => (showPhotoPicker = false)}
        />
    {/if}
</Screen>
