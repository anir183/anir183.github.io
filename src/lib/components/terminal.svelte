<script>
	import { tick, onMount } from "svelte";
	import { gsap } from "gsap";

	let {
		/** @type {import("$lib/utils/socials_data.svelte.js").Social[]} */
		socials = []
	} = $props();

	/** @type {{ cmd: string, desc: string, url?: string, name?: string, text?: string }[]} */
	let commandDefs = $derived([
		{ cmd: "help", desc: "Show available commands" },
		{ cmd: "whoami", desc: "Display the current user" },
		{ cmd: "date", desc: "Show current date and time" },
		{ cmd: "skills", desc: "List my technical skills" },
		{ cmd: "echo", desc: "Echo back the input" },
		{ cmd: "ascii", desc: "Show a random ASCII art" },
		{ cmd: "clear", desc: "Clear the terminal" },
		{ cmd: "sudo", desc: "Are you sure?" },
		...socials.map((s) => ({
			cmd: s.id,
			desc: `Open ${s.name}`,
			url: s.url,
			name: s.name
		}))
	]);

	let cmdMap = $derived(new Map(commandDefs.map((c) => [c.cmd, c])));

	/** @type {Array<{ id: number, type: string, text?: string, cls?: string, commands?: { cmd: string, desc: string }[], rows?: { name: string, skills: string }[] }>} */
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
	let currentInput = $state("");
	/** @type {string[]} */
	let history = $state([]);
	let historyIndex = $state(-1);
	let executing = $state(false);
	let nextId = $state(0);
	let focused = $state(false);

	/** @type {HTMLDivElement | undefined} */
	let outputEl = $state();
	/** @type {HTMLElement | undefined} */
	let terminalEl = $state();

	/**
	 * @param {string} type
	 * @param {string | { cmd: string, desc: string }[] | { name: string, skills: string }[]} content
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
		} else if (type === "skills") {
			lines = [
				...lines,
				{
					id,
					type,
					rows: /** @type {any} */ (content)
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

		if (cmd === "whoami") {
			addLine("text", "guest", "text-c-accent-1");
			return;
		}

		if (cmd === "date") {
			const d = new Date();
			const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			const months = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			];
			const day = String(d.getDate()).padStart(2, " ");
			const h = String(d.getHours()).padStart(2, "0");
			const m = String(d.getMinutes()).padStart(2, "0");
			const s = String(d.getSeconds()).padStart(2, "0");
			const tz =
				d
					.toLocaleTimeString("en-US", { timeZoneName: "short" })
					.split(" ")[2] ?? "UTC";
			addLine(
				"text",
				`${days[d.getDay()]} ${months[d.getMonth()]} ${day} ${h}:${m}:${s} ${tz} ${d.getFullYear()}`,
				"text-c-accent-1"
			);
			return;
		}

		if (cmd === "skills") {
			addLine("skills", [
				{
					name: "Languages",
					skills: "JavaScript, TypeScript, Python, Rust, C/C++"
				},
				{ name: "Frontend", skills: "Svelte, React, Tailwind CSS, GSAP" },
				{ name: "Backend", skills: "Node.js, Express, PostgreSQL, Redis" },
				{ name: "DevOps", skills: "Docker, Linux, CI/CD, Cloudflare" }
			]);
			return;
		}

		if (cmd === "ascii") {
			const art = asciiArts[Math.floor(Math.random() * asciiArts.length)];
			addLine("pre", art, "text-c-accent-1");
			return;
		}

		if (cmd === "echo") {
			const rest = currentInput.slice(5).trim();
			addLine("text", rest || "", "text-c-warning");
			return;
		}

		if (cmd === "sudo") {
			addLine(
				"text",
				"sudo: guest is not allowed to perform 'rm -rf /' as root on this system.",
				"text-c-error"
			);
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
		const raw = currentInput;
		const input = raw.trim().toLowerCase();
		if (!input) return;

		addLine("prompt", `guest@portfolio-183:~$ ${raw}`);

		const cmd = input.split(/\s+/)[0];

		history = [...history, raw];
		historyIndex = -1;
		currentInput = "";
		execCmd(cmd);
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			submitCommand();
		} else if (e.key === "Backspace") {
			e.preventDefault();
			if (historyIndex !== -1) historyIndex = -1;
			currentInput = currentInput.slice(0, -1);
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
		} else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			if (historyIndex !== -1) historyIndex = -1;
			currentInput += e.key;
		}
	}

	function onFocus() {
		focused = true;
	}

	function onBlur() {
		focused = false;
	}

	/** @param {MouseEvent} e */
	function onHelpClick(e) {
		const target = /** @type {HTMLElement} */ (e.target);
		const btn = target.closest("[data-cmd]");
		if (btn) {
			const cmd = btn.getAttribute("data-cmd");
			if (cmd) {
				addLine("prompt", `guest@portfolio-183:~$ ${cmd}`);
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
	});

	$effect(() => {
		const el = terminalEl;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.focus();
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={terminalEl}
	class="flex flex-col overflow-hidden rounded-2xl border-2 border-c-accent-0/15 bg-c-bg-1/50 backdrop-blur-sm transition-colors duration-300 outline-none max-lg:flex-1"
	tabindex="0"
	role="application"
	aria-label="Terminal"
	onkeydown={onKeydown}
	onfocus={onFocus}
	onblur={onBlur}
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
			guest@portfolio-183 — bash
		</span>
	</div>
	<div class="border-t border-c-border/10"></div>
	<div
		bind:this={outputEl}
		class="flex flex-col overflow-y-auto px-5 py-4 font-c-jetbrains text-sm leading-relaxed text-c-neutral-0 max-lg:max-h-[50vh] max-lg:min-h-[45vh] max-lg:px-4 max-lg:py-3 max-lg:text-xs lg:h-[55vh]"
	>
		{#each lines as line (line.id)}
			{#if line.type === "help"}
				<div
					class="w-fit max-w-full font-c-jetbrains text-sm max-lg:text-xs"
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
			{:else if line.type === "skills"}
				<div class="w-fit max-w-full font-c-jetbrains text-sm max-lg:text-xs">
					<div class="text-c-neutral-1">
						╔════════════╤════════════════════════════════════════════════════╗
					</div>
					<div class="flex text-c-neutral-1">
						<span class="shrink-0" style="margin-right:2ch">║</span>
						<span class="shrink-0" style="min-width:12ch">Category</span>
						<span class="shrink-0 text-c-neutral-1" style="margin-inline:2ch"
							>│</span
						>
						<span>Skills</span>
						<span class="min-w-0 flex-1"></span>
						<span class="shrink-0" style="margin-left:2ch">║</span>
					</div>
					<div class="text-c-neutral-1">
						╠════════════╪════════════════════════════════════════════════════╣
					</div>
					{#each line.rows as row (row.name)}
						<div class="flex text-c-neutral-1">
							<span class="shrink-0" style="margin-right:2ch">║</span>
							<span class="shrink-0 text-c-accent-1" style="min-width:12ch"
								>{row.name}</span
							>
							<span class="shrink-0 text-c-neutral-1" style="margin-inline:2ch"
								>│</span
							>
							<span class="text-c-accent-1">{row.skills}</span>
							<span class="min-w-0 flex-1"></span>
							<span class="shrink-0" style="margin-left:2ch">║</span>
						</div>
					{/each}
					<div class="text-c-neutral-1">
						╚════════════╧════════════════════════════════════════════════════╝
					</div>
				</div>
			{:else if line.type === "pre"}
				<div
					class="font-c-jetbrains text-sm leading-relaxed whitespace-pre max-lg:text-xs {line.cls}"
				>
					{line.text}
				</div>
			{:else if line.type === "prompt"}
				<div class="mt-4 text-c-neutral-1/60">{line.text}</div>
			{:else if line.cls}
				<div class={line.cls}>{line.text}</div>
			{:else}
				<div class="text-c-neutral-1">{line.text}</div>
			{/if}
		{/each}
		<div class="mt-4 flex items-center gap-2 text-sm max-lg:text-xs">
			<span class="shrink-0 text-c-accent-0">guest@portfolio-183:~$</span>
			<span class="text-c-neutral-0">{currentInput}</span>
			<span
				class="font-bold"
				class:cursor-blink={focused}
				class:opacity-0={!focused && currentInput === ""}>█</span
			>
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
