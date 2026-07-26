<script lang="ts">
    import { onMount } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import { notes } from "../../store/notes";
    import type { Note } from "@shared/types";
    import { renderMarkdown } from "../../utils/markdown";
    import { fade } from "svelte/transition";
    import AddIcon from "../../components/icons/AddIcon.svelte";
    import EditIcon from "../../components/icons/EditIcon.svelte";
    import ListBulletIcon from "../../components/icons/ListBulletIcon.svelte";
    import CheckCircleIcon from "../../components/icons/CheckCircleIcon.svelte";
    import DocumentIcon from "../../components/icons/DocumentIcon.svelte";
    import ConfirmDialog from "../../components/ConfirmDialog.svelte";
    import EmptyState from "../../components/EmptyState.svelte";
    import SearchBar from "../../components/SearchBar.svelte";
    import Button from "../../components/Button.svelte";
    import ListItem from "../../components/ListItem.svelte";

    let { onback } = $props();

    let selectedNote: Note | null = $state(null);
    let draftNote: Note | null = $state(null); // Draft state for editing
    let isEditing = $state(false);
    let isAdding = $state(false);
    let isLoading = $state(false);
    let searchQuery = $state("");
    let showDeleteConfirm = $state(false);
    let showHeadingDropdown = $state(false);
    let textAreaRef: HTMLTextAreaElement | null = $state(null);

    // New Note State
    let newNote = $state({
        title: "",
        content: "",
    });

    const goBack = () => {
        if (selectedNote) {
            selectedNote = null;
            draftNote = null;
            isEditing = false;
            showDeleteConfirm = false;
        } else {
            onback?.();
        }
    };

    const addNote = async () => {
        if (!newNote.title.trim() && !newNote.content.trim()) return;

        isLoading = true;
        try {
            await notes.add({
                ...newNote,
                title: newNote.title || "Untitled",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            isAdding = false;
            newNote = { title: "", content: "" };
        } catch (e) {
            console.error("Failed to create note", e);
        } finally {
            isLoading = false;
        }
    };

    const updateNote = async () => {
        if (!draftNote) return;
        isLoading = true;
        try {
            const updated = {
                ...draftNote,
                updated_at: new Date().toISOString(),
            };
            await notes.update(updated);
            selectedNote = updated; // Update the view with saved data
            // Keep editing or switch to view mode? Let's switch to view mode to see the markdown
            isEditing = false;
        } catch (e) {
            console.error("Failed to update note", e);
        } finally {
            isLoading = false;
        }
    };

    const deleteNote = async () => {
        if (!selectedNote) return;
        isLoading = true;
        try {
            await notes.delete(selectedNote.id);
            selectedNote = null;
            draftNote = null;
            showDeleteConfirm = false;
        } catch (e) {
            console.error("Failed to delete note", e);
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        notes.load();
    });

    const getTitle = () =>
        selectedNote
            ? isEditing
                ? "Edit Note"
                : selectedNote.title || "Untitled"
            : "Notes";

    const focus = (node: HTMLElement) => {
        node.focus();
    };

    const startEditing = () => {
        if (selectedNote) {
            draftNote = { ...selectedNote }; // Create a copy
            isEditing = true;
        }
    };

    const insertMarkdown = (
        prefix: string,
        suffix: string = "",
        placeholder: string = "",
    ) => {
        if (!textAreaRef) return;

        const start = textAreaRef.selectionStart;
        const end = textAreaRef.selectionEnd;
        const text = textAreaRef.value;
        const selectedText = text.substring(start, end) || placeholder;

        const before = text.substring(0, start);
        const after = text.substring(end);

        const newText = before + prefix + selectedText + suffix + after;

        // Update draft content
        if (draftNote) {
            draftNote.content = newText;
        } else if (isAdding) {
            newNote.content = newText;
        }

        // Restore focus and selection
        setTimeout(() => {
            if (textAreaRef) {
                textAreaRef.focus();
                const newCursorPos =
                    start + prefix.length + selectedText.length + suffix.length;
                textAreaRef.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    let filteredNotes = $derived(
        (searchQuery
            ? $notes.filter(
                  (n) =>
                      (n.title || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (n.content || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
              )
            : $notes
        ).sort(
            (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime(),
        ),
    );
</script>

{#snippet headerActions()}
    {#if !selectedNote && !isAdding}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={() => (isAdding = true)}
            aria-label="Add note"
        >
            <AddIcon />
        </button>
    {:else if selectedNote && !isEditing}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={startEditing}
            aria-label="Edit note"
        >
            <EditIcon />
        </button>
    {/if}
{/snippet}

<Screen title={getTitle()} onback={goBack} actions={headerActions}>
    {#if !selectedNote}
        {#if isAdding}
            <div
                class="p-4 space-y-3 bg-gray-800 m-2 rounded-lg animate-in fade-in slide-in-from-right h-[calc(100%-1rem)] flex flex-col"
            >
                <input
                    class="w-full p-2 bg-gray-700 rounded text-lg font-bold placeholder-gray-500"
                    placeholder="Title"
                    bind:value={newNote.title}
                    use:focus
                    disabled={isLoading}
                />
                <div class="relative flex-1 min-h-0">
                    <textarea
                        class="w-full h-full p-2 bg-gray-700 rounded resize-none placeholder-gray-500 pb-12 no-scrollbar"
                        placeholder="Content (Markdown supported)"
                        bind:this={textAreaRef}
                        bind:value={newNote.content}
                        disabled={isLoading}
                    ></textarea>
                    <!-- Markdown Toolbar -->
                    <div
                        class="absolute bottom-2 left-2 right-2 flex gap-1 bg-gray-800 p-1 rounded-lg border border-gray-600 shadow-lg justify-evenly"
                    >
                        <button
                            class="p-2 hover:bg-gray-700 rounded text-gray-300 font-bold"
                            onclick={() => insertMarkdown("**", "**", "bold")}
                            title="Bold">B</button
                        >
                        <button
                            class="p-2 hover:bg-gray-700 rounded text-gray-300 italic font-serif"
                            onclick={() => insertMarkdown("*", "*", "italic")}
                            title="Italic">I</button
                        >
                        <button
                            class="p-2 hover:bg-gray-700 rounded text-gray-300"
                            onclick={() => insertMarkdown("- ", "", "item")}
                            title="Insert List Item"
                        >
                            <ListBulletIcon />
                        </button>
                        <button
                            class="p-2 hover:bg-gray-700 rounded text-gray-300"
                            onclick={() => insertMarkdown("- [ ] ", "", "task")}
                            title="Insert Task Item"
                        >
                            <CheckCircleIcon />
                        </button>
                        <div class="relative">
                            <button
                                class="p-2 hover:bg-gray-700 rounded text-gray-300 font-bold"
                                onclick={() =>
                                    (showHeadingDropdown =
                                        !showHeadingDropdown)}
                                title="Insert Heading">H</button
                            >
                            {#if showHeadingDropdown}
                                <div
                                    class="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col min-w-[3rem] overflow-hidden"
                                    transition:fade={{ duration: 100 }}
                                >
                                    {#each [1, 2, 3, 4, 5, 6] as level}
                                        <button
                                            class="px-3 py-2 hover:bg-gray-700 text-left text-gray-300 text-sm font-bold border-b border-gray-700 last:border-0"
                                            onclick={() => {
                                                insertMarkdown(
                                                    "#".repeat(level) + " ",
                                                    "",
                                                    `Heading ${level}`,
                                                );
                                                showHeadingDropdown = false;
                                            }}
                                            title="Insert Heading {level}"
                                        >
                                            H{level}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <Button
                        class="flex-1"
                        variant="secondary"
                        onclick={() => (isAdding = false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        class="flex-1"
                        onclick={addNote}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        {:else}
            <div
                class="p-2 space-y-2 overflow-y-auto h-full flex flex-col no-scrollbar"
            >
                {#if !isAdding && $notes.length > 0}
                    <div class="mb-2">
                        <SearchBar
                            bind:value={searchQuery}
                            placeholder="Search notes..."
                            focusRingClass="focus:ring-yellow-500"
                        />
                    </div>
                {/if}

                {#each filteredNotes as note}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <ListItem
                        class="p-4 bg-gray-800 rounded-lg shadow mb-2"
                        onclick={() => (selectedNote = note)}
                    >
                        <div class="flex flex-col w-full">
                            <h3
                                class="font-bold text-lg text-yellow-500 truncate"
                            >
                                {note.title || "Untitled"}
                            </h3>
                            <p class="text-sm text-gray-400 line-clamp-2 mt-1">
                                {note.content}
                            </p>
                            <span class="text-xs text-gray-600 mt-2 block">
                                {new Date(note.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </ListItem>
                {/each}
                {#if filteredNotes.length === 0}
                    <EmptyState
                        title={searchQuery
                            ? "No matching notes"
                            : "No notes yet"}
                    >
                        {#snippet icon()}
                            <DocumentIcon class="h-12 w-12" />
                        {/snippet}
                    </EmptyState>
                {/if}
            </div>
        {/if}
    {:else}
        <!-- Detailed View / Edit -->
        <div class="flex flex-col h-full bg-gray-900 relative">
            {#if isEditing && draftNote}
                <div class="p-4 flex flex-col h-full gap-4">
                    <input
                        class="w-full p-2 bg-gray-800 rounded text-xl font-bold placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                        bind:value={draftNote.title}
                        placeholder="Title"
                        disabled={isLoading}
                    />
                    <div class="relative flex-1 min-h-0">
                        <textarea
                            class="w-full h-full p-2 bg-gray-800 rounded resize-none placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:outline-none font-mono text-sm pb-12 no-scrollbar"
                            bind:this={textAreaRef}
                            bind:value={draftNote.content}
                            placeholder="Markdown content..."
                            disabled={isLoading}
                        ></textarea>
                        <!-- Markdown Toolbar -->
                        <div
                            class="absolute bottom-2 left-2 right-2 flex gap-1 bg-gray-700/90 backdrop-blur p-1 rounded-lg border border-gray-600 shadow-lg justify-evenly"
                        >
                            <button
                                class="p-2 hover:bg-gray-600 rounded text-gray-200 font-bold"
                                onclick={() =>
                                    insertMarkdown("**", "**", "bold")}
                                title="Bold">B</button
                            >
                            <button
                                class="p-2 hover:bg-gray-600 rounded text-gray-200 italic font-serif"
                                onclick={() =>
                                    insertMarkdown("*", "*", "italic")}
                                title="Italic">I</button
                            >
                            <button
                                class="p-2 hover:bg-gray-600 rounded text-gray-200"
                                onclick={() => insertMarkdown("- ", "", "item")}
                                title="Insert List Item"
                            >
                                <ListBulletIcon />
                            </button>
                            <button
                                class="p-2 hover:bg-gray-600 rounded text-gray-200"
                                onclick={() =>
                                    insertMarkdown("- [ ] ", "", "task")}
                                title="Insert Task Item"
                            >
                                <CheckCircleIcon />
                            </button>
                            <div class="relative">
                                <button
                                    class="p-2 hover:bg-gray-600 rounded text-gray-200 font-bold"
                                    onclick={() =>
                                        (showHeadingDropdown =
                                            !showHeadingDropdown)}
                                    title="Insert Heading">H</button
                                >
                                {#if showHeadingDropdown}
                                    <div
                                        class="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col min-w-[3rem] overflow-hidden"
                                        transition:fade={{ duration: 100 }}
                                    >
                                        {#each [1, 2, 3, 4, 5, 6] as level}
                                            <button
                                                class="px-3 py-2 hover:bg-gray-700 text-left text-gray-300 text-sm font-bold border-b border-gray-700 last:border-0"
                                                onclick={() => {
                                                    insertMarkdown(
                                                        "#".repeat(level) + " ",
                                                        "",
                                                        `Heading ${level}`,
                                                    );
                                                    showHeadingDropdown = false;
                                                }}
                                                title="Insert Heading {level}"
                                            >
                                                H{level}
                                            </button>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <Button
                            class="flex-1"
                            variant="danger"
                            onclick={() => (showDeleteConfirm = true)}
                            disabled={isLoading}
                        >
                            Delete
                        </Button>
                        <Button
                            class="flex-1"
                            onclick={updateNote}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            {:else}
                <div class="p-4 flex-1 overflow-y-auto no-scrollbar">
                    <div class="prose prose-invert prose-sm max-w-none">
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html renderMarkdown(selectedNote.content)}
                    </div>
                </div>
            {/if}

            {#if showDeleteConfirm}
                <ConfirmDialog
                    title="Delete Note?"
                    message={`Are you sure you want to delete "${selectedNote.title || "Untitled"}"? This action cannot be undone.`}
                    confirmText="Delete"
                    {isLoading}
                    oncancel={() => (showDeleteConfirm = false)}
                    onconfirm={deleteNote}
                />
            {/if}
        </div>
    {/if}
</Screen>
