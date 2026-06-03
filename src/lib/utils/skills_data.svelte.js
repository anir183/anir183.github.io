/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   icon: string,
 *   category: string,
 *   description: string,
 *   experience: string,
 *   relatedTechnologies: string[],
 *   position: { x: number, y: number }
 * }} Skill
 */

/** @type {Omit<Skill, 'position'>[]} */
const _skills = [
	{
		id: "svelte",
		name: "Svelte",
		icon: "🧩",
		category: "Frontend",
		description: "Reactive component framework compiling to vanilla JS",
		experience: "2 years",
		relatedTechnologies: ["typescript", "vite"]
	},
	{
		id: "react",
		name: "React",
		icon: "⚛️",
		category: "Frontend",
		description: "Declarative UI library with a vast ecosystem",
		experience: "3 years",
		relatedTechnologies: ["typescript", "tailwind"]
	},
	{
		id: "typescript",
		name: "TypeScript",
		icon: "📘",
		category: "Frontend",
		description: "Typed superset of JavaScript for scalable apps",
		experience: "3 years",
		relatedTechnologies: ["react", "node"]
	},
	{
		id: "tailwind",
		name: "Tailwind",
		icon: "🎨",
		category: "Frontend",
		description: "Utility-first CSS framework for rapid UI development",
		experience: "2 years",
		relatedTechnologies: ["react", "figma"]
	},
	{
		id: "gsap",
		name: "GSAP",
		icon: "⚡",
		category: "Frontend",
		description: "High-performance animation library for the web",
		experience: "1 year",
		relatedTechnologies: ["threejs", "svelte"]
	},
	{
		id: "node",
		name: "Node.js",
		icon: "🟢",
		category: "Backend",
		description: "JavaScript runtime built on Chrome's V8 engine",
		experience: "3 years",
		relatedTechnologies: ["typescript", "postgres"]
	},
	{
		id: "python",
		name: "Python",
		icon: "🐍",
		category: "Backend",
		description: "Versatile language for automation, data, and APIs",
		experience: "4 years",
		relatedTechnologies: ["postgres", "go"]
	},
	{
		id: "go",
		name: "Go",
		icon: "🔵",
		category: "Backend",
		description: "Statically typed compiled language for performant services",
		experience: "1 year",
		relatedTechnologies: ["docker", "python"]
	},
	{
		id: "postgres",
		name: "PostgreSQL",
		icon: "🐘",
		category: "Backend",
		description: "Advanced relational database with strong ACID compliance",
		experience: "3 years",
		relatedTechnologies: ["node", "redis"]
	},
	{
		id: "redis",
		name: "Redis",
		icon: "🟥",
		category: "Backend",
		description: "In-memory data store for caching and real-time workloads",
		experience: "2 years",
		relatedTechnologies: ["node", "postgres"]
	},
	{
		id: "docker",
		name: "Docker",
		icon: "🐳",
		category: "Backend",
		description: "Container platform for reproducible deployment",
		experience: "3 years",
		relatedTechnologies: ["go", "aws"]
	},
	{
		id: "git",
		name: "Git",
		icon: "🔀",
		category: "Tools",
		description: "Distributed version control for collaborative development",
		experience: "4 years",
		relatedTechnologies: ["docker", "vite"]
	},
	{
		id: "vite",
		name: "Vite",
		icon: "📦",
		category: "Tools",
		description: "Next-generation build tool with instant HMR",
		experience: "2 years",
		relatedTechnologies: ["svelte", "node"]
	},
	{
		id: "aws",
		name: "AWS",
		icon: "☁️",
		category: "Tools",
		description: "Cloud platform for scalable infrastructure and services",
		experience: "2 years",
		relatedTechnologies: ["docker", "node"]
	},
	{
		id: "figma",
		name: "Figma",
		icon: "🎭",
		category: "Tools",
		description: "Collaborative design tool for UI/UX prototyping",
		experience: "2 years",
		relatedTechnologies: ["tailwind", "react"]
	},
	{
		id: "threejs",
		name: "Three.js",
		icon: "🎲",
		category: "Tools",
		description: "3D graphics library for browser-based rendering",
		experience: "1 year",
		relatedTechnologies: ["gsap", "svelte"]
	}
];

/** @type {string[]} */
export const skillCategories = ["Frontend", "Backend", "Tools"];

/** Adjacency pairs for network connections */
export const skillConnections = [
	["svelte", "react"],
	["svelte", "typescript"],
	["svelte", "vite"],
	["react", "typescript"],
	["react", "tailwind"],
	["typescript", "node"],
	["tailwind", "gsap"],
	["tailwind", "figma"],
	["gsap", "threejs"],
	["gsap", "svelte"],
	["node", "python"],
	["node", "postgres"],
	["node", "redis"],
	["node", "vite"],
	["python", "postgres"],
	["python", "go"],
	["go", "docker"],
	["postgres", "redis"],
	["redis", "docker"],
	["docker", "aws"],
	["docker", "git"],
	["aws", "node"],
	["figma", "react"],
	["threejs", "svelte"]
];

/**
 * Computes random positions for every skill with minimum spacing.
 * Called once at module load — each reload produces a fresh layout.
 * @param {any[]} arr
 */
function computePositions(arr) {
	const xPad = 0.08;
	const yPad = 0.08;
	const minPx = 80;
	const minPxSq = minPx * minPx;
	const vw = 1000;
	const vh = 700;
	/** @type {{ x: number, y: number }[]} */
	const placed = [];
	const maxAttempts = 100;

	for (const s of arr) {
		let ok = false;
		for (let a = 0; a < maxAttempts; a++) {
			const x = xPad + Math.random() * (1 - 2 * xPad);
			const y = yPad + Math.random() * (1 - 2 * yPad);
			let valid = true;
			for (const p of placed) {
				const dx = (x - p.x) * vw;
				const dy = (y - p.y) * vh;
				if (dx * dx + dy * dy < minPxSq) {
					valid = false;
					break;
				}
			}
			if (valid) {
				s.position = { x, y };
				placed.push(s.position);
				ok = true;
				break;
			}
		}
		if (!ok) {
			s.position = {
				x: xPad + Math.random() * (1 - 2 * xPad),
				y: yPad + Math.random() * (1 - 2 * yPad)
			};
			placed.push(s.position);
		}
	}
}

computePositions(_skills);

/** @type {Skill[]} */
export const skills = /** @type {Skill[]} */ (_skills);
