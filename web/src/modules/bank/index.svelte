<script lang="ts">
    import {
        bankBalance,
        transactions,
        citizenid,
        fetchBalance,
        fetchTransactions,
        fetchCitizenId,
    } from "../../store/account";
    import Screen from "../../components/Screen.svelte";
    import CreditCard from "./components/CreditCard.svelte";
    import TransactionItem from "./components/TransactionItem.svelte";

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
        <CreditCard balance={$bankBalance} citizenid={$citizenid} />

        <!-- Transactions -->
        <h3 class="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div class="space-y-4">
            {#each $transactions as transaction}
                <TransactionItem {transaction} />
            {/each}
        </div>
    </div>
</Screen>
