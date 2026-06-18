<script>
	import { tick, onMount } from "svelte";
	import { gsap } from "gsap";
	import { goto } from "$app/navigation";
	import {
		segmentLsShort, segmentLsLong,
		segmentBashrc, segmentQuotes,
		segmentGrepLine,
		segmentDate,
		highlightInput,
		getCompletions,
		applyCompletion
	} from "$lib";

	let {
		/** @type {import("$lib/utils/socials_data.svelte.js").Social[]} */
		socials = [],
		playEntry = $bindable(undefined)
	} = $props();

	/** @type {{ cmd: string, desc: string, url?: string, name?: string, text?: string }[]} */
	let commandDefs = $derived([
		{ cmd: "help", desc: "show available commands" },
		{ cmd: "whoami", desc: "display the current user" },
		{ cmd: "date", desc: "show current date and time" },
		{ cmd: "ls", desc: "list directory contents" },
		{ cmd: "cd", desc: "change directory" },
		{ cmd: "pwd", desc: "print working directory" },
		{ cmd: "cat", desc: "display file contents" },
		{ cmd: "grep", desc: "search file contents" },
		{ cmd: "git", desc: "version control simulation" },
		{ cmd: "echo", desc: "echo back the input" },
		{ cmd: "ascii", desc: "show a random ascii art" },
		{ cmd: "clear", desc: "clear the terminal" },
		{ cmd: "sudo", desc: "are you sure?" },
		{ cmd: "exit", desc: "exit the terminal" },
		...socials.map((s) => ({
			cmd: s.id,
			desc: `open ${s.name}`,
			url: s.url,
			name: s.name
		}))
	]);

	let cmdMap = $derived(new Map(commandDefs.map((c) => [c.cmd, c])));

	/** @type {Array<{ id: number, type: string, text?: string, cls?: string, commands?: { cmd: string, desc: string }[], richText?: Array<{ text: string, cls: string }> }>} */
	let lines = $state([]);

	const asciiArts = [
		`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡿⠇⠀⠀⠀⠀⢻⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡇⠀⠀⠀⠀⡸⣞⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠃⠀⠀⠀⢀⣧⢿⣽⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⣿⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣼⣞⡿⣞⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠀⠀⠀⣰⣟⢾⣽⢫⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣠⢤⣶⡻⣞⣿⣺⢯⣽⣳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⡀⠀⠀⠀⠀⠙⢦⡀⠀⠀⠀⠀⣀⣠⣤⣿⣽⣻⢾⣽⣷⣾⣽⣻⣞⣷⣳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣶⣄⡀⠀⠀⠀⣉⣲⣴⢶⣞⡿⣽⣞⡷⣯⢿⡽⣞⣿⠟⠋⠁⠉⠈⠳⣟⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⢶⣾⣿⡽⣯⣟⡾⣽⡷⣯⣟⡽⡾⣽⡯⠁⠀⠀⠀⠀⠀⠀⢮⣭⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢞⣿⣿⢯⡿⣿⣯⣟⣷⣯⢿⣳⣟⡷⣽⣼⣻⣽⠀⠀⠀⠀⠀⠀⠀⢀⣼⡯⡗⠋⠤⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢾⣿⣿⣯⣽⣾⣿⣾⣗⡿⣯⡷⣯⣟⡷⣞⣼⣿⣀⠀⠀⠀⠀⢀⣠⡿⣏⡗⠈⠐⠈⠅⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⠛⠏⠉⠉⠽⢟⢿⣿⣿⣿⣿⣷⣻⢾⡽⣞⡷⠄⡹⣶⢿⣻⢿⣻⡽⢯⣼⢦⠶⠁⠈⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣯⠇⠀⠀⠀⠀⠀⠁⣽⣿⣿⣿⣷⣯⣿⣽⣛⡦⠀⠀⢩⣿⣹⢯⣷⢻⣟⠺⢣⡖⣘⠤⠓⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⣿⡃⠁⠀⠀⠀⢀⣤⣾⣟⢿⣻⣿⣿⣟⡾⣽⡳⠄⠎⢳⣯⢯⣟⡾⢯⣞⣯⣓⠉⢀⠀⠀⡄⢢⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣷⣷⣶⣳⣶⣺⣿⣿⣳⢯⣟⣿⣿⣳⢯⠛⠅⠃⠀⠀⣴⣿⡿⣬⢶⠾⠙⣊⣥⠾⡒⠊⢁⢠⠣⣌⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢺⡽⣾⡽⣯⣟⣿⡿⣯⣿⣿⣾⢿⣿⠳⢏⣈⢠⠀⠀⣰⢿⡿⣽⣉⡶⠌⠋⠉⣀⡀⠁⠀⠀⠀⣘⡐⣂⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣽⣳⣟⣳⣟⣾⣽⣿⣿⣿⣿⣿⣦⣜⡻⡽⠆⠧⣴⡟⣯⢟⡳⣭⠲⠄⠐⠀⠀⠀⠈⠁⠉⠑⢊⡕⢃⠄⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣾⣿⣯⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣾⢧⠀⠹⠾⡵⡞⡽⢢⣃⠐⠀⠀⠄⡐⠀⠀⠀⡘⢦⠘⣌⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠹⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢯⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠒⡈⠀⡀⠄⡑⠢⣉⠴⣈⣆
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢯⣏⡴⣶⣵⣢⢤⢠⡀⡄⢠⠐⡰⢌⡱⠀⡁⡀⠆⡥⠆⡥⣛⡽⣾
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠔⠉⠀⠀⢽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣼⣻⢷⣯⡽⣞⣷⣻⡼⣡⢋⡔⠣⠜⡐⢐⠠⡓⣤⣙⣲⣽⣻⢷
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡿⣽⣞⣷⣻⡴⣣⢜⡱⣊⡕⣊⠠⡙⡰⣭⢷⣯⣿⢿`,
		`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣄⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡸⠋⠀⠘⣇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠇⠀⠀⠀⢸⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠀⠀⠀⠀⢸⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠇⠀⠀⠀⠀⢸⠇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡎⠀⠀⠀⠀⠀⢸⠀⠀⠀
⠀⠀⢀⣀⣀⣀⠀⠀⠀⠀⠀⢀⣀⣤⡤⠤⠤⠤⠤⢤⣤⣀⡤⢖⡿⠛⠉⢳⠀⠀⠀⠀⠀⢸⠀⠀⠀
⠀⢼⠁⠉⠉⠛⠻⢭⡓⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣏⠀⠀⠀⢸⠀⠀⠀⠀⠀⡤⠀⠀⠀
⠀⠸⡄⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠂⠀⠀⡜⠀⠀⠀⠀⢀⡇⠀⠀⠀
⠀⠀⢷⠀⠀⠀⠠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢣⢠⠏⠀⠀⠀⠀⢸⠃⠀⠀⠀
⠀⠀⠈⢧⠀⢀⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠈⢳⡈⠁⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⣶⣶⣦⠀⠀⢹⠀⠀⠀⠀⠀⡎⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⢠⣾⣟⣹⡄⠀⠀⠀⠀⡀⠀⣿⣿⣿⡇⠀⢈⣧⠤⠤⠶⠶⢷⠒⠒⠂⠀
⠀⠀⢀⣀⣠⡧⠄⠀⠀⠀⣾⣿⣿⣿⠇⠀⠀⠀⠙⠁⠀⠙⠻⠿⠃⠀⠨⣼⣤⣀⡀⠀⠈⢧⠀⠀⠀
⠘⠉⠁⠀⢸⣤⡤⠀⠀⠀⠛⢿⡿⠋⠀⠀⠀⠀⠴⠦⠀⠀⠀⠀⠀⠐⣲⣯⡀⠀⠈⠙⠓⠺⣧⣄⡀
⠀⣀⡤⠚⠉⢳⡴⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠃⠀⠈⠓⢦⡀⠀⠀⢸⠀⠈
⠀⠁⠀⢀⡔⠉⠙⡶⢄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠴⠚⠁⠀⠀⠀⠀⠀⠀⠈⠓⠆⠀⡇⠀
⠀⠀⠰⠋⠀⠀⢸⡇⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠁⠀
⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡎⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠙⢆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠄⠀⢰⠇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠶⠺⣇⠀⣀⡜⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⡄⠀⠀⠀⠹⡟⠒⢢⡀⠀⠀⠀⠀⢀⡏⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣄⠀⠀⢀⡇⠀⠀⠻⣄⠀⠀⠀⡸⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠶⠋⠀⠀⠀⠀⠈⣣⠶⠖⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
		`⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⡇⠛⠛⠿⡿⡟⠻⣻⣿⠛⠛⠟⠛⠛⠛⠃⠙⠛⣛
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⣴⣶⣿⣿⣿⡏⠘⠟⠀⠀⠀⣼⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠘⢿⣿⣿⣿⡇⠠⡶⢠⠰⢸⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡠⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⡙⣿⣿⢳⢰⡇⠀⠀⠈⠛⠛
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢻⠿⠃⠀⠀⠀⠀⠀⣀⣾⣿⣿⣿⣿⣧⣈⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠠⡱⢬⠉⠀⠈⣷⢔⠄⠀⢀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠇⠀⡘⠀⠀⠀⣠⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⡀⠀⠀⠀⠀⠈⡈⢁⡰⠀⠸⠀⠀⠀⣤⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⣼⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⠀⠈⠐⠯⠁⠁⠀⡁⣷⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⠀⣾⡏⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠄⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⠟⡛⠃⠀⠀⠀⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠈⠀⡀⠀⠀⠀⠀⡿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⣴⠒⢠⣴⣿⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠂⠀⠀⡇⣿⣿
⢂⠀⠀⠀⠀⠀⠀⢀⡿⠀⢸⣿⣿⡇⣿⣿⣿⣯⡉⠻⠿⢿⣿⢿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⢿⣿⣿⢟⠀⣤⣶⡆⠀⡄⠀⠀⠀⡇⣿⣿
⢸⣄⠀⠀⠀⠀⠀⠈⠃⠀⠘⠿⠿⠁⣿⣿⣿⣿⣷⣤⣄⣀⠀⠁⢸⣿⣿⠛⠋⠉⠉⢀⣀⣜⣶⣶⡧⠊⠀⢳⣿⡇⠘⣸⠀⡄⠀⠘⣿⣿
⢸⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣇⡈⠉⠉⠉⠁⠀⠠⣴⣾⣿⣿⣧⠀⠀⠈⠉⠉⠙⠛⠋⢁⡤⠀⠘⢿⠇⠀⠻⠀⡇⠀⠀⣿⣿
⣘⣿⣾⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⣿⣿⣶⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣷⠙⣦⣄⣀⣀⢀⢶⣾⣿⠀⠀⠀⠀⠀⠀⠀⠇⠀⠀⣻⡿
⠿⣿⣭⡙⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠘⢻⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣧⣌⢿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠘⠐⣿⣗
⠀⠉⢻⣿⣦⣙⢿⣦⣀⡀⠀⠀⠀⠀⢠⣴⣝⠿⣟⣿⣿⣯⠙⠁⠈⠙⠛⠉⠁⠋⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣛
⡀⣀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⠶⠂⣿⣿⣿⣿⣿⣿⣿⣦⣤⣤⣀⠀⠀⠀⢀⣿⣿⣿⣇⣴⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⢀⠀⢠⡄⣿
⣿⣷⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠈⣛⣿⣿⣿⡿⣿⣿⣿⢿⢻⣿⣻⣶⣿⣿⢿⣿⣿⡟⠀⠀⠀⠀⠤⠠⠀⠜⠀⠀⠀⠆⠤⠤⠟
⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⣁⣤⠀⠀⠀⠑⠙⢻⣿⣧⣀⣉⣈⡉⠳⠃⢀⣀⠈⠀⢺⠟⠁⠀⠀⠀⠀⠀⠐⢶⠀⣄⠀⠀⠀⢰⣶⣶⣶
⣿⣿⠿⠿⠟⠛⠛⠃⣀⣀⣾⣿⣿⣆⠀⠀⠀⠀⠀⡸⣿⠎⠫⠉⡛⢷⡶⢿⠟⠀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⢺⣿⣿⣿
⣭⣤⣶⣶⣶⣶⣖⣿⠻⣷⣝⠻⣿⣿⣷⣄⠀⠀⠀⠀⢻⣧⡀⠀⠀⠀⠀⠀⠀⠀⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠂⠻⢿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣬⢷⡌⠻⣦⠙⢿⣿⣿⣶⡀⠀⠀⠀⠘⢿⣷⣶⣶⠶⠶⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣷⠆⢀⣤⠉⣽⣾⢶⣄⠍⢻
⣿⣿⣿⣿⣿⣿⣿⣿⡞⢿⣄⠈⠳⣄⠙⣿⡿⣿⣶⣄⠀⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⣏⣿⠿⢃⣴⣿⣿⣗⢻⣿⣿⣟⡛⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣷⣦⣄⠱⠶⣶⣤⣌⠙⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣦⡿⠉⢠⣾⣿⣿⣿⢌⣇⢻⣿⣿⣿⣷
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⡙⠻⠿⠶⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡏⠁⣀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`,
		`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣶⣿⣷⣶⣶⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣷⣤⣤⣴⣶⣶⣶⣶⣶⣶⣶⣶⣶⣦⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⡿⢛⣿⣿⠿⠟⠋⠉⠁⡀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠿⠿⣶⣦⣄⣀⣴⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣾⠿⠋⠁⠀⠀⠀⠠⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⠟⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢦⡄⠀⠻⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⡀⠀⠀⠀⠀⠀⠀⠀⠙⢷⡀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢾⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⡀⠀⠀⠀⢠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⣾⣿⣿⠿⢿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⠃⠀⠀⠀⠀⣠⠂⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣧⡀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣧⠘⢿⣿⣿⣿⣿⣆⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⣿⣿⠇⠀⠀⠀⠀⢠⡟⠀⠀⢀⣴⣿⡇⠀⠀⠀⠀⠀⠀⣴⡄⠀⠀⠀⠀⠀⠘⣷⡀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣇⠘⢿⣿⣿⣿⣿⣆⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⡟⠀⠀⠀⠀⠀⣼⠃⠀⢠⣾⠋⠸⣿⠀⡄⠀⠀⠀⠀⣿⣿⣄⠀⠀⢠⡀⠀⠸⣷⡀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⡄⢘⣿⣿⣿⣿⣿⠂⠀⠀
⠀⠀⠀⠀⠀⠀⣿⣿⣷⠄⠀⠀⠀⢰⣿⠀⣰⡿⠧⠤⣤⣿⡆⣷⠀⠀⠀⠀⣿⠉⢿⣦⠀⠘⣿⣦⡀⢻⣷⡀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣷⣿⣿⣿⣿⡿⠁⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⢸⣿⣰⡿⠁⠀⠀⠀⠘⣿⣿⣇⠀⠀⠀⣿⠀⠠⣿⣷⡶⣿⡿⢿⣮⣿⣇⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⡂⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣾⡿⢿⣿⠀⠀⠀⠀⣸⣿⣿⣷⣿⣷⣦⣄⠀⣹⣿⣿⡄⠀⠀⣿⠀⠀⠀⠘⠿⣿⣧⠈⠻⣿⣿⡀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠏⠘⣿⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣿⠇⢸⡿⢾⡄⠀⠀⣿⣿⠋⢱⣿⣿⣿⣿⣷⡟⢻⣿⣷⡀⠀⣿⡀⢠⣤⢀⣠⣬⣿⣤⣄⡘⢿⡇⠀⠀⠀⢸⡀⠀⢿⣿⣿⣿⣇⠀⠀⢿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⠀⢸⡇⢸⡇⠀⠀⣿⣿⠀⣿⣿⣿⣿⣯⣉⣿⠀⠹⣿⣿⡄⢹⡇⢈⣴⣿⣿⣿⣿⣿⡿⣿⣿⣇⠀⠀⠀⢸⡇⠀⢸⣿⣿⣿⣿⠀⠀⢸⣿⠂⠀⠀⠀
⠀⠀⠀⠀⣿⡏⠀⣸⡇⣸⣿⡀⠀⣿⣷⠀⢻⣿⠛⠉⠻⣿⡇⠀⠀⠈⢿⣿⣼⣿⠘⣿⣿⣿⣿⣏⣹⡇⠘⣿⣿⠀⠀⠀⣾⡇⠀⢸⣇⣿⣿⣿⡀⠀⠈⣿⡇⠀⠀⠀
⠀⠀⠀⢀⣿⠇⠀⣿⣿⣿⣿⣇⠀⣿⡇⠀⠀⠙⠳⠶⠾⠋⠀⠀⠀⠀⠀⠙⠿⣿⣇⢻⣿⠛⠛⠻⣿⡇⠰⣿⡿⠀⠀⢠⣿⣿⣦⡀⣿⣿⣿⣿⡇⠀⠀⣿⣷⠀⠀⠀
⠀⠀⠀⣸⣿⠀⠀⣿⣿⣿⣿⣿⡄⢹⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠋⠀⠻⠷⠴⠾⠋⠀⠀⣸⡇⠀⠀⣾⣿⣿⡿⢿⣿⣿⣿⣿⡇⠀⠀⢹⣿⠀⠀⠀
⠀⠀⠀⣿⡇⣴⠀⣿⣿⣿⡏⠹⣿⣾⣿⣿⣧⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠃⢀⣾⣿⣿⣿⠁⠀⠀⣿⣿⣿⡇⠀⠀⢸⣿⠁⠀⠀
⠀⠀⢀⣿⠃⣿⢸⣿⣿⣿⡇⠀⠘⢿⣿⣿⣿⣿⡻⢶⣤⣀⡀⠀⠐⠶⠤⠴⠆⠀⠀⠀⠀⠀⠀⢀⣠⣴⣾⡏⣠⣿⣿⣿⡿⠃⠀⠀⠀⢻⣿⣿⡇⠀⠀⠈⣿⡇⠀⠀
⠀⠀⣸⣿⠀⣿⢸⣿⣿⣿⠀⠀⠀⠈⠻⠟⠻⣿⣿⣿⣿⣿⣿⣿⡷⢶⣶⣶⣦⣶⣶⣶⣶⣶⣿⠿⢟⣿⣿⣾⠟⠉⠉⠉⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⣿⣇⠀⠀
⠀⠀⣿⡇⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⢿⣿⣟⡹⣷⣴⡿⣿⣅⣰⣿⠋⠙⣿⣄⠀⠸⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⢿⣿⠀⠀
⠀⢸⣿⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⠃⠈⢹⣷⣾⠋⠉⢷⡄⢶⣾⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⢸⣿⠀⠀
⠀⣾⡏⠀⠀⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⢠⠀⣼⢧⣿⠉⢉⠹⣿⣾⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠸⣿⡄⠀
⢠⣿⠇⠀⠀⢻⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⢸⢀⣿⠀⣿⠀⠀⠀⠈⢿⣿⣿⣿⣿⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⠀⠀⠀⠀⣿⡗⠀
⢸⣿⠀⠀⠀⢸⣿⣿⣿⡇⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣫⡿⡆⢸⣿⡆⣿⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⠀⠀⠀⠀⣿⣷⠀
⢸⣿⡄⠀⠀⠈⣿⣿⣿⣧⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣻⡟⡹⠁⣼⡟⠃⣿⡀⢸⡄⠀⠘⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⢹⣿⡄
⢸⣿⣧⠀⠀⠀⢹⣿⣿⣿⠀⠀⠀⢸⣇⣈⣿⣿⣿⣿⣟⡘⠁⠀⣹⣷⣶⣟⠁⠀⢳⣀⣀⣘⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠃⠀⢰⠀⠀⠘⣿⡗
⢸⣿⣿⡄⠀⠀⠈⣿⣿⣿⠀⠀⠀⠀⠛⠛⠛⢉⣼⣿⣿⣿⣧⣴⣿⣿⣿⣿⣆⢠⣶⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣇⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀⣿⠀⠀⠀⣿⣧
⠘⣿⣿⣷⡀⠀⠀⠸⣿⣿⡆⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣾⡟⠀⠀⠀⠀⠀⠀⠀⣿⣿⠇⠀⢠⣿⠀⠀⠀⣿⣧
⠀⢻⣿⣿⣷⣄⠀⠀⢻⣿⣷⠀⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣟⣻⣿⣿⣿⣿⣿⣿⣟⣻⣿⣿⣷⡿⠟⠁⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡟⠀⠀⣾⣿⠀⠀⠀⣿⡏
⠀⠀⠹⣿⣿⣿⣷⣄⠀⢿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠈⢹⣯⣭⣿⣿⣿⣿⢻⣛⣉⣉⣁⣰⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡿⠁⠀⣼⣿⡏⠀⠀⣼⣿⠁
⠀⠀⠀⠘⢿⣿⣿⣿⣷⣾⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⠃⢀⣾⣿⣿⠃⢀⣼⣿⠋⠀
⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡿⢃⣴⣿⣿⣿⣟⣴⣿⡿⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠛⠿⠿⠃⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠀⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⠿⠿⠿⠟⠛⠛⠛⠋⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠿⠟⠛⠁⠀⢿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
		`⠀⠀⢀⠀⣠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⠀⣿⡂⢹⡇⠀⠀⣰⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢸⡇⢸⣇⢸⣇⠀⢀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢾⠀⠀⣯⡀⡆⠀⠀
⢸⣷⢸⣇⣸⣇⠀⣾⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣠⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⣂⠀⣿⡄⢸⡀⣤
⢠⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣊⡝⠛⠙⠂⠄⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣦⣼⣷⣼⣁⠼
⢸⣿⣿⣿⣿⣿⣿⣀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⡻⣥⢋⡔⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣂⣜⣿⡟⢿⣿⣿⣄
⠈⣿⣿⣿⣿⣿⣿⣿⠿⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣷⢯⣿⣾⡔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢪⣷⣿⢿⣿⣿
⠀⣿⣿⣟⢿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡟⠛⠉⡉⢸⡉⠁⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢢⣽⣗⣿⠇
⠀⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠺⣿⡇⣤⡤⢔⡿⣇⠀⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣯⠀
⠘⡟⣛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⣿⣿⠗⡲⠏⠟⠿⠀⠈⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠍⠁⠁⠀
⠃⡜⡠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣼⣿⡟⢡⡿⠿⠷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣟⠒⠂⠂
⠐⢐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠸⣡⢶⣿⣟⡃⠀⠘⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡇⠀⡀⠀
⢠⡏⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡰⢨⠣⠉⠉⠋⠉⠀⠀⠀⠀⢈⠀⡂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡿⠀⠀⠀⠀
⢺⡇⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣽⡿⢛⢭⠏⣢⠍⠈⠖⠀⠀⠒⣶⢦⡁⠂⠀⠀⠀⠀⠀⠯⠤⣤⣴⢶⣍⠝⣯⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⢌⣿⠱⠀⠀⠀⠀⠀⠀
⣯⣯⠸⣀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠄⠀⠈⠀⠁⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠏⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠧⠍⠶⠤⠈⣆⠀⠀⠀⠀⠀⠀⠀⣷⡻⠀⣼⠀⠀⠀⠀
⣯⣨⡀⢀⡠⠤⣐⠤⣀⣰⠔⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠑⠐⠐⠢⠺⠥⡾⠉⡠⠀⠀⠀⠀
⠋⠙⠈⠉⠉⠁⠈⠈⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠓⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠇⣣⡁⢶⣠⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢶⠀⡶⣲⠀⣆⡒⣰⠒⢦⢰⠀⢰⡆⣴⠐⣶⠒⣐⣒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣺⣿⣿⣿⠛
⠀⠀⠑⢌⠻⣗⣔⠉⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠞⠚⠃⠻⠴⠃⠦⠝⠘⠤⠎⠸⠤⠘⠧⠞⠀⠛⠀⠰⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡟⣾⣿⣿⣿⠃⠀
⠀⠀⠀⠀⠉⠢⠁⠀⠀⠀⠀⢀⣤⣤⣤⣄⠀⠀⢠⣤⠀⠀⣤⣄⠀⠀⠀⣤⣤⠀⢠⣤⣤⣤⣤⣤⡄⢠⣤⣄⠀⠀⠀⠀⣤⣤⡄⠀⠀⠀⢠⣤⡄⠀⠀⠀⢘⡮⡝⣿⣿⡿⢆⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⠏⠉⠉⢿⣷⠀⢸⣿⠀⠠⣿⣿⣧⡀⠀⣿⣿⠀⢸⣿⡏⠉⠉⠉⠁⢼⣿⣿⡄⠀⠀⢸⡿⣿⡇⠀⠀⢀⣿⢻⣷⠀⠀⠀⠞⡜⣹⣿⣿⡙⢆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⠀⢸⣿⠀⠐⣿⡯⢻⣷⡀⣿⣿⠀⢸⣿⣷⣶⣶⡆⠀⢺⣿⠹⣿⡀⢠⣿⠃⣿⡇⠀⠀⣾⡟⠀⢿⣧⠀⠀⠀⠠⢽⣿⣯⡙⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⡀⠀⠀⣠⣤⠀⢸⣿⠀⢈⣿⡧⠀⠹⣿⣿⣿⠀⢸⣿⡇⠀⠀⠀⠀⢸⣿⡄⢻⣧⣾⡏⢠⣿⡇⠀⣼⣿⣷⣶⣾⣿⣇⠀⠀⠀⠘⣿⢣⠜⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣶⣾⣿⠏⠀⢸⣿⠀⠀⣿⡷⠀⠀⠹⣿⣿⠀⢸⣿⣿⣿⣿⣿⡆⢸⣿⡆⠀⢿⡿⠀⢰⣿⡇⢀⣿⡏⠀⠀⠀⢹⣿⡀⠀⠀⠀⠀⠈⡆⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠀⠀⠀⠈⠉⠀⠀⠉⠁⠀⠀⠀⠉⠉⠀⠈⠉⠉⠈⠉⠉⠁⠈⠉⠀⠀⠈⠁⠀⠀⠉⠁⠈⠉⠀⠀⠀⠀⠈⠉⠁⠐⡀⠀⠀⠀⠀⠀⠀⠀`,
		`⠀⠀⠀⢠⣾⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣰⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣄⣀⣀⣤⣤⣶⣾⣿⣿⣿⡷
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀
⣿⣿⣿⡇⠀⡾⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀
⣿⣿⣿⣧⡀⠁⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠉⢹⠉⠙⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣀⠀⣀⣼⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠀⠤⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⠿⠋⢃⠈⠢⡁⠒⠄⡀⠈⠁⠀⠀⠀⠀⠀⠀⠀
⣿⣿⠟⠁⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
		`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⠤⣤⣤⣤⣤⠤⢤⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⡾⣟⣛⣫⡭⣭⣤⣤⠬⢭⣉⣙⣒⠛⠿⢷⣶⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣻⠽⠓⣊⣩⣭⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣶⣶⡭⢿⣿⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⠿⠛⣉⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣷⣬⡙⠻⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣼⣿⣿⠞⣡⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⡻⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢠⣾⣿⠟⣡⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣻⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣿⡿⢃⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣼⡿⢁⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢻⢿⡿⠛⢿⣿⢿⣿⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣿⠁⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⢀⡏⣿⠃⠀⢠⣯⡛⠉⢠⢿⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⡘⡇⣿⡄⠀⣿⡇⠀⠀⠸⣴⣾⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⣿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣗⡧⠀⣷⢳⣧⠀⢻⣧⠀⠀⠀⠻⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠘⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣷⠻⣿⣿⣿⣿⡁⠀⢻⣯⢿⣧⠀⠻⣧⣴⠊⠙⣻⣿⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⣸⣿⣿⣿⣿⣿⣿⣿⣿⣻⡈⢻⣿⣿⡟⣿⣿⣿⣿⡾⠿⣿⣿⣿⣿⣿⠿⡇⠘⢿⣿⣿⣧⠀⠀⢻⣯⢻⣷⡀⠈⠛⠻⢿⣿⣼⣿⣿⣿⣿⣶⣦⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⣇⠀⢿⣿⣧⠹⣿⣿⣿⣿⠀⠈⢿⣿⣿⢃⣀⣀⣀⣼⣿⣿⣿⣧⡀⠀⠙⢷⣝⢿⣦⣀⠀⢈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶
⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠸⡄⠈⢿⣿⠀⠘⣿⣿⣿⣇⠀⠈⣿⣷⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣷⣦⣬⣿⣷⣽⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⢹⡀⠈⢿⡆⠀⠘⣿⣿⠛⠀⣼⢻⣿⢿⣿⣿⣿⣿⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⢳⡀⠈⢷⠀⠀⠸⣿⠀⠀⡇⣾⣿⡘⢿⣿⣿⣿⠃⢹⣿⢿⣿⡟⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣴⠖⠃⠀⠳⡄⢸⡆⠀⠀⠁⠀⠀⠀⠁⠀⠙⠦⣽⡿⠏⠀⠀⠻⡜⣿⠃⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡄⠀⠀⠁⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢀⣴⣯⣭⣷⡂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⡏⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠀⣿⣿⢻⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠃⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣛⠧⢽⣻⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡏⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⢻⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⡈⠁⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠘⡇⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡏⠀⠀⢀⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⣷⠀⠈⢿⡇⠙⢿⣿⣿⣿⣿⠃⠀⢻⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⡟⠒⣾⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠛⠀⠀⠙⣿⣿⠃⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣶⣤⣤⣾⡿⠿⠿⢿⣼⣿⣧⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠈⠙⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠉⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⢹⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠳⣄⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`
	];

	/** @type {{ [path: string]: { type: string, children?: string[], content?: string } }} */
	const fs = {
		"/": { type: "dir", children: ["home"] },
		"/home": { type: "dir", children: ["guest"] },
		"/home/guest": {
			type: "dir",
			children: [
				"skills", "projects", "about", "memes", "secrets", "quotes",
				"easter", ".bashrc", "diary"
			]
		},
		"/home/guest/skills": {
			type: "file",
		},
		"/home/guest/projects": {
			type: "file",
		},
		"/home/guest/about": {
			type: "file",
		},
		"/home/guest/diary": {
			type: "file",
			content: [
				"Day 1: They said learn web dev they said.",
				"Day 2: spent 6 hours debugging a missing semicolon.",
				"Day 32: finally understand closures. or do i.",
				"Day 69: why does npm install take 47 years.",
				"Day 100: i am become developer, destroyer of prod."
			].join("\n")
		},
		"/home/guest/.bashrc": {
			type: "file",
			content: [
				"alias ls='ls --color=auto'",
				"alias ll='ls -alF'",
				"alias la='ls -A'",
				"alias l='ls -CF'",
				"",
				"alias grep='grep --color=auto'",
				"",
				"alias g='git'",
				"alias gs='git status'",
				"alias gc='git commit'",
				"alias gp='git push'",
				"alias gl='git log --oneline --graph'",
				"",
				"alias please='sudo !!'",
				"alias ..='cd ..'",
				"alias ...='cd ../..'"
			].join("\n")
		},
		"/home/guest/memes": {
			type: "dir",
			children: ["programming", "anime", "67" ]
		},
		"/home/guest/memes/programming": {
			type: "file",
			content: [
				"Me: writes 100 lines of code",
				"Also me: it works, dont touch it",
				"",
				"",
				"Q: How many programmers does it take to change a light bulb?",
				"A: None, thats a hardware issue.",
				"",
				"",
				"I dont always test my code, but when I do, I do it in production.",
				"",
				"",
				"There are two hard things in programming - Naming Variables, Cache Validation and Off-by-one Errors.",
			].join("\n")
		},
		"/home/guest/memes/67": {
			type: "file",
			content: "*sighs* i need help.\n"
		},
		"/home/guest/memes/anime": {
			type: "file",
			content: [
				"Me: says I'll only watch 1 episode",
				"Also me: 47 episodes later",
				"",
				"",
				"Me: *clicks on an anime*",
				"My sleep schedule: Sayonara.",
				"",
				"",
				"No thoughts. Head empty.",
				"— Every anime protagonist",
				"",
				"",
				"The power of friendship can defeat anyone.",
				"The power of friendship cannot defeat student loans.",
				"",
				"",
				"Anime character: *exists*",
				"The fanbase: OMG PEAK FICTION",
				"",
				"",
				"How to spot a weeb:",
				"1. They talk about anime unironically",
				"2. They own more body pillows than real pillows",
				"3. They unironically say \"ara ara\"",
				"",
				"",
				"POV: You just said \"I prefer the dub\"",
				"",
				"",
				"Reality is often disappointing.",
				"That's why I watch anime.",
				"",
				"",
				"I could fix them.",
				"— Every anime fan",
				"",
				"",
				"The prophecy:",
				"First episode: boring",
				"Second episode: okay this is interesting",
				"Twelfth episode: WHY DID THEY END IT THERE",
			].join("\n")
		},
		"/home/guest/secrets": {
			type: "dir",
			children: ["sudoers", "fourofour", "conspiracy"]
		},
		"/home/guest/secrets/sudoers": {
			type: "file",
			content: [
				"# This file must be edited with the visudo command",
				"#",
				"# As it turns out, guest is in fact NOT in the sudoers list.",
				"# Shocking, I know.",
				"#",
				"# root    ALL=(ALL:ALL) ALL",
				"# guest   ALL=(ALL:ALL) NOPASSWD: ALL   <-- lol nice try"
			].join("\n")
		},
		"/home/guest/secrets/fourofour": {
			type: "file",
			content: [
				"",
				"    ╔═══════════════════════╗",
				"    ║                       ║",
				"    ║    HTTP 404           ║",
				"    ║    Not Found          ║",
				"    ║                       ║",
				"    ║    ¯\\_(ツ)_/¯         ║",
				"    ║                       ║",
				"    ╚═══════════════════════╝",
				"",
				"You found it! 🎉",
				"This file does not actually exist. Or does it?",
				"",
				"Error 404: Meaning of life not found.",
				"But seriously, the answer is 42.",
				"",
				"Also, never gonna give you up, never gonna let you down.",
				"",
				"💥 Initiating crash sequence..."
			].join("\n")
		},
		"/home/guest/secrets/conspiracy": {
			type: "file",
			content: [
				"THE TRUTH IS OUT THERE.",
				"",
				"- JavaScript was created in 10 days and we are all still paying for it.",
				"- CSS was designed by chaos itself.",
				"- \"It works on my machine\" is the most dangerous phrase in tech.",
				"- Half of the internet is held together by duct tape and Stack Overflow.",
				"- The bug is always in the last place you look... because you stop after finding it.",
				"- Tabs are actually superior to spaces (but dont tell anyone I said that).",
				"- Forget about touching it. If it works, don't even look at it wrong!"
			].join("\n")
		},
		"/home/guest/quotes": {
			type: "dir",
			children: ["tech", "movies", "anime"]
		},

		"/home/guest/quotes/tech": {
			type: "file",
			content: [
				'"Any fool can write code that a computer can understand. Good programmers write code that humans can understand."',
				"— Martin Fowler",
				"",
				'"First solve the problem, then write the code." — John Johnson',
				"",
				'"Talk is cheap. Show me the code." — Linus Torvalds',
				"",
				'"It is not a bug — it is an undocumented feature." — Every dev ever',
				"",
				'"I have a dream that one day my code will work on the first try." — MLK, probably'
			].join("\n")
		},
		"/home/guest/quotes/movies": {
			type: "file",
			content: [
				'"I will be back" — The Terminator (after a segfault)',
				"",
				'"May the Force be with you" — Every dev before deploying on Friday',
				"",
				'"Life is like a box of chocolates, you never know what you are gonna get" — Me reading legacy code',
				"",
				'"To infinity and beyond!" — My array index',
				"",
				'"Why so serious?" — The linter',
				"",
				'"There is no spoon" — The /dev/null'
			].join("\n")
		},
		"/home/guest/quotes/anime": {
			type: "file",
			content: [
				"\"People die if they are killed.\" — Shirou Emiya (Fate/stay night)",
				"",
				"\"Believe in the me that believes in you!\" — Kamina (Gurren Lagann)",
				"",
				"\"I am not running away anymore. I will not look away. I will not run away again. Never.\" — Levi (AoT)",
				"",
				"\"A lesson without pain is meaningless.\" — Edward Elric (Fullmetal Alchemist)",
				"",
				"\"The world is not perfect. But it is there for us, doing the best it can.\" — (Fruits Basket)",
				"",
				"\"It is not like I wanted to compile your code, baka!\" — Tsundere Compiler",
				"",
				"\"You didn't take me to the moon, but you were there with me.\" — Lucy (Cyberpunk Edgerunners)",
				"",
				"\"It's only a mere 10 year journey.\" — Frieren (Sousou no Frieren)",
				"",
				"\"Maybe there's only a dark road up ahead. But you still have to believe and keep going.\" — Kaori (Your Lie in April)",
				"",
				"\"What someone likes is nobody else's business.\" — Marin (My Dress-Up Darling)",
				"",
				"\"Look, Mom. I'm at the very top of the Arasaka Tower.\" — David (Cyberpunk Edgerunners)"
			].join("\n")
		},
		"/home/guest/easter": {
			type: "dir",
			children: ["snake", "whatisthis", "matrix", "coffee"]
		},
		"/home/guest/easter/snake": {
			type: "file",
			content: [
				"Sorry, this is not the game. The real Snake game is in a terminal somewhere else.",
				"",
				"Somewhere else where? IDK, not in this site atleast...",
				"But here is a snake for your troubles:",
				"~🐍~ SSSSSSSSSS",
				"",
				"Fun Fact: Python is named after Monty Python, not the snake.",
				"The snake is just a bonus."
			].join("\n")
		},
		"/home/guest/easter/whatisthis": {
			type: "file",
			content: [
				"We are no strangers to code",
				"",
				"You know the rules and so do I",
				"A full commit is what I am thinking of",
				"You would not get this from any other guy",
				"",
				"I just wanna tell you how I am feeling",
				"Gotta make you understand",
				"",
				"Never gonna give you up",
				"Never gonna let you down",
				"Never gonna run around and desert you",
				"Never gonna make you cry",
				"Never gonna say goodbye",
				"Never gonna tell a lie and hurt you"
			].join("\n")
		},
		"/home/guest/easter/matrix": {
			type: "file",
			content: [
				"Wake up, Neo...",
				"",
				"The Matrix has you...",
				"",
				"Follow the white rabbit.",
				"",
				"Knock, knock, Neo.",
				"",
				"You take the blue pill — the story ends, you wake up in your bed and believe whatever you want to believe.",
				"You take the red pill — you stay in Wonderland and I show you how deep the rabbit hole goes."
			].join("\n")
		},
		"/home/guest/easter/coffee": {
			type: "file",
			content: [
				"",
				"    ╔═══════════════════════╗",
				"    ║                       ║",
				"    ║    HTTP 418           ║",
				"    ║    I'm a teapot       ║",
				"    ║                       ║",
				"    ║    (╯°□°)╯︵ ┻━┻      ║",
				"    ║                       ║",
				"    ╚═══════════════════════╝",
				"",
				"The server refuses to brew coffee",
				"because it is, permanently, a teapot.",
				"",
				"This is not a bug. This is art.",
				"",
				"💥 Initiating crash sequence..."
			].join("\n")
		}
	};

	const home = "/home/guest";

	/** @type {Record<string, { name: string, hash: string }>} */
	const symlinks = {
		"/home/guest/about": { name: "About", hash: "#about" },
		"/home/guest/projects": { name: "Projects", hash: "#projects" },
		"/home/guest/skills": { name: "Skills", hash: "#skills" }
	};

	const aliases = new Map();
	const aliasRegex = /alias\s+([\w.]+)\s*=\s*'([^']*)'/g;
	const bashrc = fs["/home/guest/.bashrc"];
	if (bashrc && bashrc.type === "file" && typeof bashrc.content === "string") {
		let m;
		while ((m = aliasRegex.exec(bashrc.content)) !== null) {
			aliases.set(m[1], m[2]);
		}
	}

	/** @param {string} p */
	function resolvePath(p) {
		if (p === "~") return home;
		if (p.startsWith("~/")) p = home + p.slice(1);
		const parts = (p.startsWith("/") ? [] : cwd.split("/").filter(Boolean))
			.concat(p.split("/").filter(Boolean));
		const resolved = [];
		for (const part of parts) {
			if (part === "." || part === "") continue;
			if (part === "..") { resolved.pop(); continue; }
			resolved.push(part);
		}
		return "/" + resolved.join("/");
	}

	let cwd = $state(home);

	let promptDir = $derived(cwd === home ? "~" : cwd === "/" ? "/" : cwd.replace(/\/$/, "").split("/").pop() ?? "");

	let currentInput = $state("");
	/** @type {string[]} */
	let history = $state([]);
	let historyIndex = $state(-1);
	let executing = $state(false);
	let nextId = $state(0);
	let aliasDepth = 0;
	let awaitingConfirm = $state(false);
	let focused = $state(false);

	let tabCompletions = $state(/** @type {string[]} */ ([]));
	let tabCompletionIdx = $state(0);

/** @type {HTMLDivElement | undefined} */
let completionPopupEl = $state();

let popupAbove = $state(true);

$effect(() => {
	const idx = tabCompletionIdx;
	const el = completionPopupEl;
	if (!el || !tabCompletions.length) return;
	const btn = el.querySelector(`[data-idx="${idx}"]`);
	if (btn && !(btn instanceof HTMLElement)) return;
	(/** @type {HTMLElement} */ (btn))?.scrollIntoView({ block: "nearest" });
});

$effect(() => {
	if (!tabCompletions.length || !outputEl || !hiddenInput) return;
	const raf = requestAnimationFrame(() => {
		if (!tabCompletions.length || !outputEl || !hiddenInput) return;
		const opRect = outputEl.getBoundingClientRect();
		const inRect = hiddenInput.getBoundingClientRect();
		popupAbove = inRect.top - opRect.top >= 120;
	});
	return () => cancelAnimationFrame(raf);
});

	let inputSegments = $derived(highlightInput(currentInput, cmdMap, aliases, fs, cwd));

/** @type {HTMLDivElement | undefined} */
let outputEl = $state();
/** @type {HTMLElement | undefined} */
let terminalEl = $state();
/** @type {HTMLInputElement | undefined} */
let hiddenInput = $state();
let composing = $state(false);
let isMobileDevice = $state(false);


	/** @type {{ container: Element, titleBar: Element, separator: Element, initialLines: Element[], inputPrompt: Element } | null} */
	let animRefs = $state(null);
	let hasAnimated = false;
	let entryInitialized = false;
	/** @type {gsap.core.Timeline | null} */
	let animTl = null;

	/**
	 * @param {string} type
	 * @param {string | { cmd: string, desc: string }[]} content
	 * @param {string} [cls]
	 */
	function addLine(type, content, cls) {
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
			lines = [
				...lines,
				{
					id,
					type,
					text: /** @type {string} */ (content),
					cls: cls ?? "text-c-neutral-1"
				}
			];
		}
		tick().then(() => {
			if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
		});
	}

	/**
	 * @param {Array<{ text: string, cls: string }>} segments
	 */
	function addRichLine(segments) {
		const id = nextId++;
		lines = [...lines, { id, type: "rich", richText: segments }];
		tick().then(() => {
			if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
		});
	}

	/** @param {string} cmd @param {string} [raw] */
		function execCmd(cmd, raw) {
		if (executing) return;

		if (aliases.has(cmd) && aliasDepth === 0) {
			aliasDepth = 1;
			const expanded = aliases.get(cmd);
			const rest = (raw ?? currentInput).slice(cmd.length);
			const newRaw = expanded + rest;
			const newCmd = expanded.split(/\s+/)[0];
			execCmd(newCmd, newRaw);
			aliasDepth = 0;
			return;
		}

		const def = cmdMap.get(cmd);

		if (cmd === "help") {
			addLine("help", commandDefs);
			return;
		}

		if (cmd === "clear") {
			lines = [];
			return;
		}

		if (cmd === "whoami") {
			addLine("text", "guest", "text-c-accent-1");
			return;
		}

		if (cmd === "date") {
			addRichLine(segmentDate(new Date()));
			return;
		}

		if (cmd === "ls") {
			const args = ((raw ?? currentInput).slice(3).trim() || "").split(/\s+/).filter(Boolean);
			const shortFlags = args.filter(a => /^-[a-zA-Z]+$/.test(a)).flatMap(a => a.slice(1).split(""));
			const paths = args.filter(a => !a.startsWith("-"));
			const showAll = shortFlags.includes("a") || shortFlags.includes("A");
			const longFormat = shortFlags.includes("l");
			const classify = shortFlags.includes("F");
			const target = paths.length ? resolvePath(paths[0]) : cwd;
			const node = fs[target];
			if (!node) {
				addLine("text", `ls: cannot access '${paths[0]}': No such file or directory`, "text-c-error");
			} else if (node.type !== "dir") {
				addLine("text", target.split("/").filter(Boolean).pop() ?? "", "text-c-accent-1");
			} else {
				let children = node.children ? [...node.children] : [];
				if (!showAll) children = children.filter(c => !c.startsWith("."));
				if (children.length === 0) return;
				if (longFormat) {
					for (const c of children) {
						const childPath = target === "/" ? "/" + c : target + "/" + c;
						const childNode = fs[childPath];
						const nodeType = childNode?.type ?? "file";
						const isSymlink = !!symlinks[childPath];
						let suffix = "";
						if (classify) {
							if (isSymlink) suffix = "@";
							else if (nodeType === "dir") suffix = "/";
						}
						const prefix = isSymlink ? "l" : (nodeType === "dir" ? "d" : "-");
						const size = nodeType === "dir" ? "4.0K" : "2.3K";
						const metaStr = `${prefix}rw-r--r--  guest guest  ${size}  `;
						addRichLine(segmentLsLong(metaStr, c, suffix, nodeType, isSymlink));
					}
				} else {
				/** @type {(name: string) => { type: string, isSymlink: boolean }} */
				const lookup = (name) => {
					const p = target === "/" ? "/" + name : target + "/" + name;
					const node = fs[p];
					return {
						type: node?.type ?? "file",
						isSymlink: !!symlinks[p]
					};
				};
				addRichLine(segmentLsShort(children, lookup, classify));
			}
			}
			return;
		}

		if (cmd === "pwd") {
			addLine("text", cwd, "text-c-accent-1");
			return;
		}

		if (cmd === "cd") {
			const arg = (raw ?? currentInput).slice(3).trim() || "~";
			const target = resolvePath(arg);
			const node = fs[target];
			if (!node) {
				addLine("text", `cd: ${arg}: No such directory`, "text-c-error");
			} else if (node.type !== "dir") {
				addLine("text", `cd: ${arg}: Not a directory`, "text-c-error");
			} else {
				cwd = target;
			}
			return;
		}

		if (cmd === "cat") {
			const args = ((raw ?? currentInput).slice(4).trim() || "").split(/\s+/);
			if (args.length === 0 || !args[0]) {
				addLine("text", "cat: missing operand", "text-c-error");
				return;
			}
			for (const arg of args) {
				const target = resolvePath(arg);
				const sl = symlinks[target];
				if (sl) {
					addLine("text", `Navigating to ${sl.name}...`, "text-c-success");
					gsap.delayedCall(0.4, () => {
						window.location.hash = sl.hash;
					});
					continue;
				}
				const node = fs[target];
				if (!node) {
					addLine("text", `cat: ${arg}: No such file`, "text-c-error");
				} else if (node.type !== "file") {
					addLine("text", `cat: ${arg}: Is a directory`, "text-c-error");
				} else {
					const content = node.content ?? "";
					if (target.endsWith(".bashrc")) {
						addRichLine(segmentBashrc(content));
					} else if (target.startsWith("/home/guest/quotes/")) {
						addRichLine(segmentQuotes(content));
					} else {
						addLine("text", content, "text-c-accent-1");
					}
					if (target === "/home/guest/easter/coffee") {
						gsap.delayedCall(5, () => goto("/coffee"));
					}
					if (target === "/home/guest/secrets/fourofour") {
						gsap.delayedCall(5, () => goto("/fourofour"));
					}
				}
			}
			return;
		}

		if (cmd === "ascii") {
			const art = asciiArts[Math.floor(Math.random() * asciiArts.length)];
			addLine("pre", art, "text-c-accent-1");
			return;
		}

		if (cmd === "echo") {
			const rest = (raw ?? currentInput).slice(5).trim();
			addLine("text", rest || "", "text-c-warning");
			return;
		}

		if (cmd === "grep") {
			const args = ((raw ?? currentInput).slice(5).trim() || "").split(/\s+/).filter(Boolean);
			const pattern = args.find(a => !a.startsWith("-") && a !== "--color=auto");
			const files = args.filter(a => !a.startsWith("-") && a !== pattern && a !== "--color=auto");
			if (!pattern) {
				addLine("text", "usage: grep [pattern] [file...]", "text-c-error");
				return;
			}
			const targets = files.length
				? files.map(f => resolvePath(f)).filter(p => fs[p]?.type === "file")
				: Object.keys(fs).filter(p => {
						const node = fs[p];
						return node.type === "file" && p.startsWith(home + "/");
				  });
			let found = false;
			for (const fp of targets) {
				const name = fp.split("/").pop();
				const content = fs[fp].content ?? "";
				const lines = content.split("\n");
				for (const line of lines) {
					if (line.toLowerCase().includes(pattern.toLowerCase())) {
						found = true;
						addRichLine(segmentGrepLine(line, pattern, targets.length > 1 ? name : undefined));
					}
				}
			}
			if (!found) addLine("text", "", "text-c-neutral-1");
			return;
		}

		if (cmd === "git") {
			const args = ((raw ?? currentInput).slice(4).trim() || "").split(/\s+/).filter(Boolean);
			if (args[0] === "init") {
				addLine("text", "user \"guest\" is not allowed to create git repositories. contact admin.", "text-c-error");
			} else if (args[0]) {
				addLine("text", "fatal: not a git repository (or any of the parent directories): .git", "text-c-error");
			} else {
				addLine("text", "usage: git <command> [<args>]\n\nAvailable commands:\n  init     Create an empty git repository\n  status   Show working tree status\n  commit   Record changes\n  push     Push to remote\n  log      Show commit logs", "text-c-neutral-1");
			}
			return;
		}

		if (cmd === "visudo") {
			addLine("text", "want to use sudo now, do you?", "text-c-error");
			return;
		}

		if (cmd === "sudo") {
			addLine("text", "guest is not in the sudoers list", "text-c-error");
			return;
		}

		if (cmd === "exit") {
			awaitingConfirm = true;
			addLine("text", "Are you sure you want to exit? ", "text-c-warning");
			return;
		}

		if (def && def.url) {
			executing = true;
			addLine("text", `Opening ${def.name}...`, "text-c-success");
			gsap.delayedCall(0.4, () => {
				window.open(def.url, "_blank");
				executing = false;
			});
			return;
		}

		addLine("text", `bash: ${cmd}: command not found`, "text-c-error");
	}

	function submitCommand() {
		tabCompletions = [];
		const raw = currentInput;
		const input = raw.trim().toLowerCase();
		if (!input) {
			addLine("prompt", `guest@portfolio-183:${promptDir}$ `);
			history = [...history, ""];
			historyIndex = -1;
			currentInput = "";
			return;
		}

		if (awaitingConfirm) {
			if (lines.length > 0) {
				const updated = [...lines];
				const last = { ...updated[updated.length - 1] };
				last.text += raw;
				updated[updated.length - 1] = last;
				lines = updated;
			}
			if (input === "y") {
				awaitingConfirm = false;
				addLine("text", "Goodbye.", "text-c-info");
				gsap.delayedCall(1, () => {
					document.body.style.background = "var(--color-c-bg-0)";
					document.body.style.color = "var(--color-c-neutral-1)";
					document.body.style.display = "flex";
					document.body.style.alignItems = "center";
					document.body.style.justifyContent = "center";
					document.body.style.height = "100vh";
					document.body.style.margin = "0";
					document.body.style.fontFamily = "var(--font-c-jetbrains)";
					document.body.style.fontSize = "14px";
					document.body.style.whiteSpace = "pre-wrap";
					document.body.style.textAlign = "center";
					document.body.innerHTML = "System halted.\n\nYou may now close this tab.";
					window.close();
				});
			} else {
				awaitingConfirm = false;
				addLine("text", "Cancelled.", "text-c-info");
			}
			history = [...history, raw];
			historyIndex = -1;
			currentInput = "";
			return;
		}

		addLine("prompt", `guest@portfolio-183:${promptDir}$ ${raw}`);

		const cmd = input.split(/\s+/)[0];

		history = [...history, raw];
		historyIndex = -1;
		currentInput = "";
		execCmd(cmd, raw);
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (composing) return;
		if (tabCompletions.length > 0 && e.key !== "Tab" && e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") {
			tabCompletions = [];
		}
		if (e.key === "Enter") {
			e.preventDefault();
			submitCommand();
		} else if (e.key === "Backspace") {
			if (historyIndex !== -1) historyIndex = -1;
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
		} else if (e.key === "Tab") {
			e.preventDefault();
			if (historyIndex !== -1) historyIndex = -1;

			if (tabCompletions.length > 0) {
				const len = tabCompletions.length;
				if (e.shiftKey) {
					tabCompletionIdx = (tabCompletionIdx - 1 + len) % len;
				} else {
					tabCompletionIdx = (tabCompletionIdx + 1) % len;
				}
				currentInput = applyCompletion(currentInput, tabCompletions[tabCompletionIdx]);
			} else {
				const comps = getCompletions(currentInput, cmdMap, aliases, fs, cwd);
				if (comps.length === 1) {
					currentInput = applyCompletion(currentInput, comps[0]);
				} else if (comps.length > 1) {
					tabCompletions = comps;
					tabCompletionIdx = 0;
					currentInput = applyCompletion(currentInput, comps[0]);
				}
			}
		} else if (e.key === "Escape") {
			if (tabCompletions.length > 0) {
				tabCompletions = [];
			} else {
				terminalEl?.blur();
			}
		}
	}

	function onFocus() {
		focused = true;
		hiddenInput?.focus({ preventScroll: true });
		try { hiddenInput?.setSelectionRange(currentInput.length, currentInput.length); } catch {}
	}

	/** @param {FocusEvent} e */
	function onBlur(e) {
		if (e.relatedTarget instanceof Node && terminalEl?.contains(e.relatedTarget)) return;
		focused = false;
	}

	function onHiddenBlur() {
		focused = false;
	}

	function onInput() {
		if (composing || !hiddenInput) return;
		currentInput = hiddenInput.value;
	}

	function onCompositionStart() {
		composing = true;
	}

	function onCompositionEnd() {
		composing = false;
		if (hiddenInput) {
			currentInput = hiddenInput.value;
			try { hiddenInput.setSelectionRange(currentInput.length, currentInput.length); } catch {}
		}
	}

	/** @param {MouseEvent} e */
	function onHelpClick(e) {
		const target = /** @type {HTMLElement} */ (e.target);
		const btn = target.closest("[data-cmd]");
		if (btn) {
			const cmd = btn.getAttribute("data-cmd");
			if (cmd) {
				addLine("prompt", `guest@portfolio-183:${promptDir}$ ${cmd}`);
				execCmd(cmd);
				terminalEl?.focus();
			}
		}
	}

	function initTerminal() {
		addLine(
			"text",
			"Welcome to portfolio-183. Type 'help' for commands.",
			"text-c-info"
		);
		addLine("prompt", "guest@portfolio-183:~$ ascii");
		addLine("pre", asciiArts[5], "text-c-accent-1");
	}

	onMount(() => {
		initTerminal();

		isMobileDevice =
			"ontouchstart" in window && matchMedia("(hover: none)").matches;

		let mounted = true;

		tick().then(() => {
			if (!mounted || !terminalEl || !outputEl) return;

			const reducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;

			if (reducedMotion) return;

			const titleBar = terminalEl.children[0];
			const separator = terminalEl.children[1];
			const outputChildren = [...outputEl.children];
			const initialLines = outputChildren.slice(0, -1);
			const inputPrompt = outputChildren[outputChildren.length - 1];

			gsap.set(terminalEl, { opacity: 0 });
			gsap.set(titleBar, { y: -8, opacity: 0 });
			gsap.set(separator, { opacity: 0 });
			gsap.set(initialLines, { y: 12, opacity: 0 });
			gsap.set(inputPrompt, { y: 8, opacity: 0 });

			animRefs = { container: terminalEl, titleBar, separator, initialLines, inputPrompt };
		});

		return () => {
			mounted = false;
		};
	});

	$effect(() => {
		if (playEntry && animRefs && !entryInitialized) {
			entryInitialized = true;
			hasAnimated = true;
			if (!isMobileDevice) terminalEl?.focus();
			const { container, titleBar, separator, initialLines, inputPrompt } =
				animRefs;

			const tl = gsap.timeline();

			tl.to(container, {
				opacity: 1,
				duration: 0.7,
				ease: "power2.out"
			});

			tl.to(
				titleBar,
				{
					y: 0,
					opacity: 1,
					duration: 0.5,
					ease: "power3.out"
				},
				"-=0.1"
			);

			tl.to(
				separator,
				{
					opacity: 1,
					duration: 0.5,
					ease: "power2.out"
				},
				0
			);

			tl.to(
				initialLines,
				{
					y: 0,
					opacity: 1,
					duration: 0.7,
					stagger: 0.12,
					ease: "power3.out"
				},
				0
			);

			tl.to(
				inputPrompt,
				{
					y: 0,
					opacity: 1,
					duration: 0.6,
					ease: "power2.out"
				},
				"-=0.05"
			);

			animTl = tl;
		}
	});

	$effect(() => {
		const el = terminalEl;
		if (!el || entryInitialized || playEntry !== undefined) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!isMobileDevice) el.focus();
					observer.disconnect();

					if (!hasAnimated && animRefs) {
						entryInitialized = true;
						hasAnimated = true;
						const { container, titleBar, separator, initialLines, inputPrompt } =
							animRefs;

						const tl = gsap.timeline();

						tl.to(container, {
							opacity: 1,
							duration: 0.7,
							ease: "power2.out"
						});

						tl.to(
							titleBar,
							{
								y: 0,
								opacity: 1,
								duration: 0.5,
								ease: "power3.out"
							},
							"-=0.1"
						);

						tl.to(
							separator,
							{
								opacity: 1,
								duration: 0.5,
								ease: "power2.out"
							},
							0
						);

						tl.to(
							initialLines,
							{
								y: 0,
								opacity: 1,
								duration: 0.7,
								stagger: 0.12,
								ease: "power3.out"
							},
							0
						);

						tl.to(
							inputPrompt,
							{
								y: 0,
								opacity: 1,
								duration: 0.6,
								ease: "power2.out"
							},
							"-=0.05"
						);

						animTl = tl;
					}
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(el);
		return () => {
			observer.disconnect();
			animTl?.kill();
			animTl = null;
		};
	});

	$effect(() => {
		if (composing || !hiddenInput) return;
		const val = currentInput;
		if (hiddenInput.value !== val) {
			hiddenInput.value = val;
		}
		try { hiddenInput.setSelectionRange(currentInput.length, currentInput.length); } catch {}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={terminalEl}
		class="flex flex-col overflow-hidden rounded-2xl border-2 bg-c-bg-1/50 backdrop-blur-sm transition-colors duration-300 outline-none max-lg:flex-1 max-lg:min-h-0 {focused ? 'border-c-accent-0/15' : 'border-transparent'}"
	tabindex="-1"
	role="application"
	aria-label="Terminal"
	onkeydown={onKeydown}
	onfocus={onFocus}
	onblur={onBlur}
>
	<div
		class="flex w-full items-center gap-2.5 px-4 py-2.5 max-lg:px-3 max-lg:py-2"
	>
		<div class="flex gap-1">
			<span class="h-2.5 w-2.5 rounded-full bg-c-error max-lg:h-2 max-lg:w-2"
			></span>
			<span class="h-2.5 w-2.5 rounded-full bg-c-warning max-lg:h-2 max-lg:w-2"
			></span>
			<span class="h-2.5 w-2.5 rounded-full bg-c-success max-lg:h-2 max-lg:w-2"
			></span>
		</div>
		<span
			class="font-c-jetbrains text-xs tracking-wide text-c-neutral-1 max-lg:text-[11px]"
		>
			guest@portfolio-183 — bash
		</span>
	</div>
	<div class="border-t border-c-border/10"></div>
	<div
		bind:this={outputEl}
		class="flex flex-col overflow-y-auto px-4 py-3 font-c-jetbrains text-xs leading-relaxed text-c-neutral-0 max-lg:flex-1 max-lg:min-h-0 max-lg:px-3 max-lg:py-2.5 max-lg:text-xs lg:h-[55vh]"
	>
		{#each lines as line (line.id)}
			{#if line.type === "help"}
				<div
					class="w-fit max-w-full font-c-jetbrains text-xs max-lg:text-xs"
					onclick={onHelpClick}
					role="presentation"
				>
					<div class="text-c-neutral-1">
						╔══════════════════════════════════════════════════════════╗
					</div>
					<div class="flex text-c-neutral-1">
						<span class="shrink-0" style="margin-right:2ch">║</span>
						<span class="shrink-0" style="min-width:16ch">command</span>
						<span style="margin-left:2ch">description</span>
						<span class="min-w-0 flex-1"></span>
						<span class="shrink-0" style="margin-left:2ch">║</span>
					</div>
					<div class="text-c-neutral-1">
						╠══════════════════════════════════════════════════════════╣
					</div>
					{#each line.commands ?? [] as cmd (cmd.cmd)}
						<div class="flex text-c-neutral-1">
							<span class="shrink-0" style="margin-right:2ch">║</span>
							<button
								class="cmd-btn shrink-0 text-left"
								style="min-width:16ch"
								data-cmd={cmd.cmd}>{cmd.cmd}</button
							>
							<span style="margin-left:2ch">{cmd.desc}</span>
							<span class="min-w-0 flex-1"></span>
							<span class="shrink-0" style="margin-left:2ch">║</span>
						</div>
					{/each}
					<div class="text-c-neutral-1">
						╚══════════════════════════════════════════════════════════╝
					</div>
				</div>
			{:else if line.type === "pre"}
				<div
					class="font-c-jetbrains text-xs leading-relaxed whitespace-pre max-lg:text-xs {line.cls}"
				>
					{line.text}
				</div>
			{:else if line.type === "rich"}
				<div class="whitespace-pre">
					{#each line.richText as seg, j (j)}
						<span class={seg.cls}>{seg.text}</span>
					{/each}
				</div>
			{:else if line.type === "prompt"}
				<div class="mt-3 text-c-neutral-1/60">{line.text}</div>
			{:else if line.cls}
				<div class="whitespace-pre {line.cls}">{line.text}</div>
			{:else}
				<div class="whitespace-pre text-c-neutral-1">{line.text}</div>
			{/if}
		{/each}
		<div class="mt-3 flex items-center gap-1.5 text-xs max-lg:text-xs">
			{#if awaitingConfirm}
				<span class="text-c-warning">(y/N): </span>
			{:else}
				<span class="shrink-0 text-c-accent-0">guest@portfolio-183:{promptDir}$</span>
			{/if}
			<span class="relative flex items-center">
				<span class="whitespace-pre">
				{#each inputSegments as seg, i}
					<span class={seg.cls}>{seg.text}</span>
				{/each}
			</span>
				<span
					class="font-bold -ml-[1px]"
					class:cursor-blink={focused}
					class:opacity-0={!focused}>█</span
				>
				<input
					bind:this={hiddenInput}
					class="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
					tabindex="-1"
					aria-hidden="true"
					type="text"
					autocomplete="off"
					data-lpignore="true"
					data-1p-ignore
					data-bwignore
					autocapitalize="off"
					autocorrect="off"
					spellcheck="false"
					oninput={onInput}
					oncompositionstart={onCompositionStart}
					oncompositionend={onCompositionEnd}
					onblur={onHiddenBlur}
				/>
				{#if tabCompletions.length > 0}
					<div
						bind:this={completionPopupEl}
						role="listbox"
						tabindex="-1"
						class="absolute left-0 max-h-40 overflow-y-auto rounded-lg border border-c-border/20 bg-c-bg-1 py-0.5 shadow-xl {popupAbove ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}"
						onmousedown={(e) => e.stopPropagation()}
					>
						{#each tabCompletions as comp, i}
							<button
								data-idx={i}
								class="block w-full whitespace-nowrap px-2.5 py-0.5 text-left font-c-jetbrains text-xs transition-colors {i === tabCompletionIdx ? 'bg-c-accent-0/10 text-c-accent-0' : 'text-c-neutral-0'}"
								onmousedown={(e) => {
									e.preventDefault();
									currentInput = applyCompletion(currentInput, comp);
									tabCompletions = [];
									terminalEl?.focus();
								}}>{comp}</button
							>
						{/each}
					</div>
				{/if}
			</span>
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

	.cursor-blink {
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
