<script lang="ts">
    import {
        bankBalance,
        transactions,
        citizenid,
        fetchBalance,
        fetchTransactions,
        fetchCitizenId,
    } from "../../store/account";
    import { hashStringToCardNumber } from "../../utils/cardUtils";
    import Screen from "../../components/Screen.svelte";

    let { onback } = $props();

    $effect(() => {
        fetchBalance();
        fetchTransactions();
        fetchCitizenId();
    });
</script>

<Screen title="Bank" {onback}>
    <div class="p-4">
        <!-- Card -->
        <div
            class="rounded-2xl p-6 mb-8 shadow-lg text-white"
            style="background-image: linear-gradient(to bottom right, var(--color-purple-600), var(--color-blue-600));"
        >
            <div class="flex justify-between items-start mb-8">
                <span class="text-white/80 font-medium">Total Balance</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                </svg>
            </div>
            <div class="text-3xl font-bold mb-2">
                ${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format($bankBalance)}
            </div>
            <div class="text-white/80 text-sm font-mono tracking-wider">
                {hashStringToCardNumber($citizenid)}
            </div>
        </div>

        <!-- Transactions -->
        <h3 class="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div class="space-y-4">
            {#each $transactions as transaction}
                <div
                    class="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
                >
                    <div class="flex items-center">
                        <div
                            class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <div class="font-medium">
                                {transaction.message ||
                                    transaction.title ||
                                    "Transaction"}
                            </div>
                            <div class="text-xs text-gray-400">
                                {new Date(
                                    transaction.time * 1000,
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <span
                        class={`font-medium ${transaction.amount < 0 ? "text-red-400" : "text-green-400"}`}
                    >
                        {transaction.amount < 0
                            ? "-"
                            : "+"}${new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(Math.abs(transaction.amount))}
                    </span>
                </div>
            {/each}
        </div>
    </div>
</Screen>
