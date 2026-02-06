<script lang="ts">
    let { onback } = $props();

    let display = $state("0");
    let firstOperand: number | null = $state(null);
    let operator: string | null = $state(null);
    let waitingForSecondOperand = $state(false);

    const goBack = () => {
        onback?.();
    };

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            display = digit;
            waitingForSecondOperand = false;
        } else {
            display = display === "0" ? digit : display + digit;
        }
    };

    const inputDot = () => {
        if (waitingForSecondOperand) {
            display = "0.";
            waitingForSecondOperand = false;
            return;
        }
        if (!display.includes(".")) {
            display += ".";
        }
    };

    const clear = () => {
        display = "0";
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
    };

    const toggleSign = () => {
        display = String(parseFloat(display) * -1);
    };

    const inputPercent = () => {
        display = String(parseFloat(display) / 100);
    };

    const handleOperator = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        if (firstOperand === null) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            display = String(result);
            firstOperand = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
    };

    const calculate = (first: number, second: number, op: string) => {
        if (op === "+") return first + second;
        if (op === "-") return first - second;
        if (op === "×") return first * second;
        if (op === "÷") return first / second;
        return second;
    };

    const handleInput = (value: string) => {
        if (/[0-9]/.test(value)) {
            inputDigit(value);
        } else if (value === ".") {
            inputDot();
        } else if (value === "C") {
            clear();
        } else if (value === "±") {
            toggleSign();
        } else if (value === "%") {
            inputPercent();
        } else if (["+", "-", "×", "÷"].includes(value)) {
            handleOperator(value);
        } else if (value === "=") {
            if (operator && firstOperand !== null) {
                const result = calculate(
                    firstOperand,
                    parseFloat(display),
                    operator,
                );
                display = String(result);
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
            }
        }
    };

    const handleKeydown = (event: KeyboardEvent) => {
        const { key } = event;

        if (/[0-9]/.test(key)) {
            inputDigit(key);
        } else if (key === ".") {
            inputDot();
        } else if (key === "Enter" || key === "=") {
            event.preventDefault();
            if (operator && firstOperand !== null) {
                const result = calculate(
                    firstOperand,
                    parseFloat(display),
                    operator,
                );
                display = String(result);
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
            }
        } else if (key === "Escape") {
            clear();
        } else if (key === "+" || key === "-") {
            handleOperator(key);
        } else if (key === "*" || key === "x") {
            handleOperator("×");
        } else if (key === "/") {
            handleOperator("÷");
        } else if (key === "Backspace") {
            if (!waitingForSecondOperand && display.length > 1) {
                display = display.slice(0, -1);
            } else {
                display = "0";
            }
        }
    };
</script>

<svelte:window on:keydown={handleKeydown} />

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
        <h1 class="ml-2 text-xl font-semibold">Calculator</h1>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col p-4">
        <!-- Display -->
        <div
            class="flex-1 flex items-end justify-end text-6xl font-light mb-8 break-all"
        >
            {display}
        </div>

        <!-- Keypad -->
        <div class="grid grid-cols-4 gap-3">
            {#each ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="] as btn}
                <button
                    class="aspect-square rounded-full text-2xl font-medium transition-all active:scale-95 flex items-center justify-center
          {['÷', '×', '-', '+', '='].includes(btn)
                        ? 'bg-orange-500 hover:bg-orange-400'
                        : ['C', '±', '%'].includes(btn)
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-800 hover:bg-gray-700'}
          {btn === '0' ? 'col-span-2 aspect-auto rounded-full' : ''}"
                    onclick={() => handleInput(btn)}
                >
                    {btn}
                </button>
            {/each}
        </div>
    </div>
</div>
