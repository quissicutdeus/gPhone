<script lang="ts">
    import { onMount } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import { notes } from "../../store/notes";
    import type { Note } from "@shared/types";
    import { marked } from "marked";
    import { fade } from "svelte/transition";

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

    // Helper to render markdown safely
    const renderMarkdown = (text: string) => {
        try {
            return marked.parse(text);
        } catch (e) {
            return text;
        }
    };
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
    {:else if selectedNote && !isEditing}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={startEditing}
            aria-label="Edit note"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
            </svg>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                        <button
                            class="p-2 hover:bg-gray-700 rounded text-gray-300"
                            onclick={() => insertMarkdown("- [ ] ", "", "task")}
                            title="Insert Task Item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
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
                    <button
                        class="flex-1 p-2 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50"
                        onclick={() => (isAdding = false)}
                        disabled={isLoading}>Cancel</button
                    >
                    <button
                        class="flex-1 p-2 bg-yellow-600 rounded hover:bg-yellow-500 text-black font-medium disabled:opacity-50"
                        onclick={addNote}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        {:else}
            <div
                class="p-2 space-y-2 overflow-y-auto h-full flex flex-col no-scrollbar"
            >
                {#if !isAdding && $notes.length > 0}
                    <div class="mb-2">
                        <input
                            class="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-500 text-sm"
                            placeholder="Search notes..."
                            bind:value={searchQuery}
                        />
                    </div>
                {/if}

                {#each filteredNotes as note}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                        class="p-4 bg-gray-800 rounded-lg shadow cursor-pointer hover:bg-gray-700 transition-colors"
                        onclick={() => (selectedNote = note)}
                        role="button"
                        tabindex="0"
                    >
                        <h3 class="font-bold text-lg text-yellow-500 truncate">
                            {note.title || "Untitled"}
                        </h3>
                        <p class="text-sm text-gray-400 line-clamp-2 mt-1">
                            {note.content}
                        </p>
                        <span class="text-xs text-gray-600 mt-2 block">
                            {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                {/each}
                {#if filteredNotes.length === 0}
                    <div
                        class="flex flex-col items-center justify-center flex-1 text-gray-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-12 w-12 mb-2 opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                        </svg>
                        <p>
                            {searchQuery ? "No matching notes" : "No notes yet"}
                        </p>
                    </div>
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                            <button
                                class="p-2 hover:bg-gray-600 rounded text-gray-200"
                                onclick={() =>
                                    insertMarkdown("- [ ] ", "", "task")}
                                title="Insert Task Item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
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
                        <button
                            class="flex-1 p-3 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60 transition-colors disabled:opacity-50"
                            onclick={() => (showDeleteConfirm = true)}
                            disabled={isLoading}
                        >
                            Delete
                        </button>
                        <button
                            class="flex-1 p-3 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                            onclick={updateNote}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
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
                <div
                    class="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
                    transition:fade
                >
                    <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full">
                        <h3 class="text-xl font-bold text-white mb-2">
                            Delete Note?
                        </h3>
                        <p class="text-gray-400 mb-6">
                            Are you sure you want to delete "{selectedNote.title ||
                                "Untitled"}"? This action cannot be undone.
                        </p>
                        <div class="flex gap-3">
                            <button
                                class="flex-1 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                onclick={() => (showDeleteConfirm = false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                class="flex-1 p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                                onclick={deleteNote}
                                disabled={isLoading}
                            >
                                {isLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</Screen>
