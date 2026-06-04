<script>
	import { tick, onMount } from "svelte";
	import { gsap } from "gsap";

	let {
		/** @type {import("$lib/utils/socials_data.svelte.js").Social[]} */
		socials = []
	} = $props();

	/** @type {{ cmd: string, desc: string, url?: string, name?: string }[]} */
	let commandDefs = $derived([
		{ cmd: "help", desc: "Show available commands" },
		{ cmd: "clear", desc: "Clear the terminal" },
		...socials.map((s) => ({
			cmd: s.id,
			desc: `Open ${s.name}`,
			url: s.url,
			name: s.name
		}))
	]);

	let cmdMap = $derived(new Map(commandDefs.map((c) => [c.cmd, c])));

	/** @type {Array<{ id: number, type: string, text?: string, commands?: { cmd: string, desc: string }[] }>} */
	let lines = $state([]);
	let currentInput = $state("");
	/** @type {string[]} */
	let history = $state([]);
	let historyIndex = $state(-1);
	let executing = $state(false);
	let nextId = $state(0);
	let cursorBlinkVisible = $state(true);

	/** @type {HTMLDivElement | undefined} */
	let outputEl = $state();
	/** @type {HTMLInputElement | undefined} */
	let inputEl = $state();

	/**
	 * @param {string} type
	 * @param {string | { cmd: string, desc: string }[]} content
	 */
	function addLine(type, content) {
		const id = nextId++;
		if (type === "help") {
			lines = [
				...lines,
				{
					id,
					type,
					commands: /** @type {{ cmd: string, desc: string }[]} */ (content)
				}
			];
		} else {
			lines = [...lines, { id, type, text: /** @type {string} */ (content) }];
		}
		tick().then(() => {
			if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
		});
	}

	/** @param {string} cmd */
	function execCmd(cmd) {
		if (executing) return;
		const def = cmdMap.get(cmd);

		if (cmd === "help") {
			addLine("help", commandDefs);
			return;
		}

		if (cmd === "clear") {
			lines = [];
			return;
		}

		if (def && def.url) {
			executing = true;
			addLine("text", `Opening ${def.name}...`);
			gsap.delayedCall(0.4, () => {
				window.open(def.url, "_blank");
				executing = false;
			});
			return;
		}

		addLine("text", `bash: ${cmd}: command not found`);
	}

	function submitCommand() {
		const input = currentInput.trim().toLowerCase();
		if (!input) return;

		addLine("prompt", `anir183@portfolio:~$ ${currentInput}`);
		history = [...history, currentInput];
		historyIndex = -1;
		currentInput = "";
		execCmd(input);
		if (inputEl) inputEl.focus();
	}

	/** @param {KeyboardEvent} e */
	function onInputKeydown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			submitCommand();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (history.length === 0) return;
			const newIdx =
				historyIndex === -1
					? history.length - 1
					: Math.max(0, historyIndex - 1);
			historyIndex = newIdx;
			currentInput = history[historyIndex];
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (historyIndex === -1) return;
			const newIdx = historyIndex + 1;
			if (newIdx >= history.length) {
				historyIndex = -1;
				currentInput = "";
			} else {
				historyIndex = newIdx;
				currentInput = history[historyIndex];
			}
		}
	}

	/** @param {MouseEvent} e */
	function onHelpClick(e) {
		const target = /** @type {HTMLElement} */ (e.target);
		const btn = target.closest("[data-cmd]");
		if (btn) {
			const cmd = btn.getAttribute("data-cmd");
			if (cmd) {
				addLine("prompt", `anir183@portfolio:~$ ${cmd}`);
				execCmd(cmd);
				if (inputEl) inputEl.focus();
			}
		}
	}

	function initTerminal() {
		addLine(
			"text",
			"Welcome to anir183's portfolio. Type 'help' to see available commands."
		);
		addLine("prompt", "anir183@portfolio:~$ help");
		addLine("help", commandDefs);
		addLine("prompt", "anir183@portfolio:~$ ");
		if (inputEl) inputEl.focus();
	}

	onMount(() => {
		initTerminal();
	});

	$effect(() => {
		const interval = setInterval(() => {
			cursorBlinkVisible = !cursorBlinkVisible;
		}, 530);
		return () => clearInterval(interval);
	});
</script>

<div
	class="flex flex-col overflow-hidden rounded-2xl border border-c-border/20 bg-c-bg-1/50 backdrop-blur-sm transition-colors duration-300 hover:border-c-border/40 max-lg:flex-1"
>
	<div
		class="flex w-full items-center gap-3 px-5 py-3 max-lg:px-4 max-lg:py-2.5"
	>
		<div class="flex gap-1.5">
			<span class="h-3 w-3 rounded-full bg-c-error max-lg:h-2.5 max-lg:w-2.5"
			></span>
			<span class="h-3 w-3 rounded-full bg-c-warning max-lg:h-2.5 max-lg:w-2.5"
			></span>
			<span class="h-3 w-3 rounded-full bg-c-success max-lg:h-2.5 max-lg:w-2.5"
			></span>
		</div>
		<span
			class="font-c-jetbrains text-xs tracking-wide text-c-neutral-1 max-lg:text-[11px]"
		>
			anir183@portfolio — bash
		</span>
	</div>
	<div class="border-t border-c-border/10"></div>
	<div class="flex flex-col">
		<div
			bind:this={outputEl}
			class="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4 font-c-jetbrains text-sm leading-relaxed text-c-neutral-0 max-lg:min-h-[160px] max-lg:px-4 max-lg:py-3 max-lg:text-xs lg:max-h-[80vh] lg:min-h-[40vh]"
		>
			{#each lines as line (line.id)}
				{#if line.type === "help"}
					<div class="help-block" onclick={onHelpClick} role="presentation">
						{#each line.commands ?? [] as cmd (cmd.cmd)}
							<div class="help-row">
								<span class="help-indent"> </span>
								<button class="cmd-btn" data-cmd={cmd.cmd}>{cmd.cmd}</button>
								<span class="help-desc"> {cmd.desc}</span>
							</div>
						{/each}
					</div>
				{:else if line.type === "prompt"}
					<div class="text-c-neutral-0">{line.text}</div>
				{:else}
					<div class="text-c-neutral-1">{line.text}</div>
				{/if}
			{/each}
		</div>

		<div
			class="border-t border-c-border/10 px-5 py-3 max-lg:px-4 max-lg:py-2.5"
		>
			<div
				class="flex items-center gap-2 font-c-jetbrains text-sm max-lg:text-xs"
			>
				<span class="shrink-0 text-c-accent-0">anir183@portfolio:~$</span>
				<input
					bind:this={inputEl}
					bind:value={currentInput}
					onkeydown={onInputKeydown}
					class="min-w-0 flex-1 bg-transparent text-c-neutral-0 outline-none"
					aria-label="Terminal input"
					autocomplete="off"
					spellcheck="false"
				/>
				<span class:text-hidden={!cursorBlinkVisible}>█</span>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.cmd-btn) {
		background: none;
		border: none;
		color: var(--color-c-accent-0);
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		padding: 0;
		text-decoration: underline;
		text-decoration-color: transparent;
		transition: text-decoration-color 0.15s ease;
	}

	:global(.cmd-btn:hover) {
		text-decoration-color: var(--color-c-accent-0);
	}

	:global(.cmd-btn:focus-visible) {
		outline: 1px solid var(--color-c-accent-0);
		outline-offset: 1px;
	}

	.text-hidden {
		opacity: 0;
	}
</style>
