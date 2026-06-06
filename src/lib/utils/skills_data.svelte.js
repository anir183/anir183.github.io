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
	// ── Languages ──
	{
		id: "javascript",
		name: "JavaScript",
		icon: "🟨",
		category: "Languages",
		description: "Dynamic language powering the modern web",
		experience: "3 years",
		relatedTechnologies: ["react", "svelte", "node", "expo", "express"]
	},
	{
		id: "java",
		name: "Java",
		icon: "☕",
		category: "Languages",
		description: "Mature OOP language for enterprise and Android",
		experience: "6 years",
		relatedTechnologies: ["docker", "linux"]
	},
	{
		id: "c",
		name: "C",
		icon: "⚙️",
		category: "Languages",
		description: "Low-level systems language with minimal abstraction",
		experience: "1 year",
		relatedTechnologies: ["rust", "linux"]
	},
	{
		id: "csharp",
		name: "C#",
		icon: "🔷",
		category: "Languages",
		description: "Versatile .NET language for apps and games",
		experience: "4 years",
		relatedTechnologies: ["unity"]
	},
	{
		id: "python",
		name: "Python",
		icon: "🐍",
		category: "Languages",
		description: "General-purpose language for data, web, and automation",
		experience: "4 years",
		relatedTechnologies: ["go", "docker", "linux", "flet"]
	},
	{
		id: "lua",
		name: "Lua",
		icon: "🌙",
		category: "Languages",
		description: "Lightweight embeddable scripting language",
		experience: "1 year",
		relatedTechnologies: []
	},
	{
		id: "dart",
		name: "Dart",
		icon: "🎯",
		category: "Languages",
		description: "Client-optimized language for multi-platform UIs",
		experience: "2 years",
		relatedTechnologies: ["flutter", "expo"]
	},
	{
		id: "go",
		name: "Go",
		icon: "🔵",
		category: "Languages",
		description: "Statically typed compiled language for performant services",
		experience: "1 year",
		relatedTechnologies: ["python", "docker", "linux"]
	},
	{
		id: "sql",
		name: "SQL",
		icon: "🗃️",
		category: "Languages",
		description: "Declarative query language for relational databases",
		experience: "1 year",
		relatedTechnologies: ["postgres", "sqlite", "mongodb"]
	},
	{
		id: "rust",
		name: "Rust",
		icon: "🦀",
		category: "Languages",
		description: "Memory-safe systems language with zero-cost abstractions",
		experience: "6 months",
		relatedTechnologies: ["go", "linux"]
	},

	// ── Frontend ──
	{
		id: "react",
		name: "React",
		icon: "⚛️",
		category: "Frontend",
		description: "Declarative UI library for web and native",
		experience: "2 years",
		relatedTechnologies: ["javascript", "node", "expo", "svelte"]
	},
	{
		id: "svelte",
		name: "Svelte",
		icon: "🧩",
		category: "Frontend",
		description: "Reactive component framework compiling to vanilla JS",
		experience: "1 year",
		relatedTechnologies: ["javascript", "node", "vercel"]
	},
	{
		id: "expo",
		name: "Expo",
		icon: "📱",
		category: "Frontend",
		description: "React Native framework for cross-platform mobile apps",
		experience: "1 year",
		relatedTechnologies: ["react", "dart", "javascript"]
	},
	{
		id: "flutter",
		name: "Flutter",
		icon: "💙",
		category: "Frontend",
		description: "Google's UI toolkit for natively compiled cross-platform apps",
		experience: "2 years",
		relatedTechnologies: ["dart", "flet"]
	},

	// ── Backend ──
	{
		id: "node",
		name: "Node.js",
		icon: "🟢",
		category: "Backend",
		description: "JavaScript runtime for server-side applications",
		experience: "3 years",
		relatedTechnologies: ["javascript", "express", "react", "postgres", "mongodb", "firestore", "vercel", "onrender"]
	},
	{
		id: "express",
		name: "Express",
		icon: "🚂",
		category: "Backend",
		description: "Minimalist Node.js web framework for APIs and apps",
		experience: "2 years",
		relatedTechnologies: ["node", "postgres", "mongodb"]
	},
	{
		id: "postgres",
		name: "PostgreSQL",
		icon: "🐘",
		category: "Backend",
		description: "Advanced relational database with strong ACID compliance",
		experience: "1 year",
		relatedTechnologies: ["node", "express", "sql"]
	},
	{
		id: "sqlite",
		name: "SQLite",
		icon: "📄",
		category: "Backend",
		description: "Self-contained embedded SQL database engine",
		experience: "2 years",
		relatedTechnologies: ["sql", "python"]
	},
	{
		id: "mongodb",
		name: "MongoDB",
		icon: "🍃",
		category: "Backend",
		description: "NoSQL document database for flexible data models",
		experience: "2 years",
		relatedTechnologies: ["node", "express", "sql"]
	},
	{
		id: "firestore",
		name: "Firestore",
		icon: "🔥",
		category: "Backend",
		description: "Serverless NoSQL database from Firebase",
		experience: "2 years",
		relatedTechnologies: ["node", "expo"]
	},
	{
		id: "flet",
		name: "Flet",
		icon: "🪶",
		category: "Backend",
		description: "Python framework for building Flutter UIs in Python",
		experience: "6 months",
		relatedTechnologies: ["python", "flutter", "docker"]
	},

	// ── DevOps ──
	{
		id: "git",
		name: "Git",
		icon: "🔀",
		category: "DevOps",
		description: "Distributed version control for collaborative development",
		experience: "4 years",
		relatedTechnologies: ["github", "linux"]
	},
	{
		id: "github",
		name: "GitHub",
		icon: "🐙",
		category: "DevOps",
		description: "Code hosting platform with CI/CD and project management",
		experience: "4 years",
		relatedTechnologies: ["git", "vercel", "onrender"]
	},
	{
		id: "linux",
		name: "Linux",
		icon: "🐧",
		category: "DevOps",
		description: "Open-source OS powering servers and development environments",
		experience: "2 years",
		relatedTechnologies: ["docker", "git", "python", "go", "rust"]
	},
	{
		id: "vercel",
		name: "Vercel",
		icon: "▲",
		category: "DevOps",
		description: "Frontend deployment platform with edge functions",
		experience: "1 year",
		relatedTechnologies: ["svelte", "node", "github"]
	},
	{
		id: "onrender",
		name: "Render",
		icon: "🔄",
		category: "DevOps",
		description: "Cloud platform for hosting web services and databases",
		experience: "1 year",
		relatedTechnologies: ["node", "github", "docker"]
	},
	{
		id: "docker",
		name: "Docker",
		icon: "🐳",
		category: "DevOps",
		description: "Container platform for reproducible deployment",
		experience: "1 year",
		relatedTechnologies: ["linux", "go", "python", "onrender"]
	},

	// ── Other ──
	{
		id: "unity",
		name: "Unity",
		icon: "🎮",
		category: "Other",
		description: "Cross-platform game engine for 2D and 3D games",
		experience: "4 years",
		relatedTechnologies: ["csharp"]
	}
];

/** @type {string[]} */
export const skillCategories = ["Languages", "Frontend", "Backend", "DevOps", "Other"];

/** Adjacency pairs for network connections */
export const skillConnections = [
	// languages → direct tool/framework links
	["javascript", "react"],
	["javascript", "svelte"],
	["javascript", "node"],
	["javascript", "expo"],
	["javascript", "express"],
	["dart", "flutter"],
	["python", "go"],
	["python", "docker"],
	["python", "linux"],
	["python", "flet"],
	["go", "docker"],
	["csharp", "unity"],
	["sql", "postgres"],
	["sql", "sqlite"],
	["sql", "mongodb"],

	// frontend
	["react", "node"],
	["react", "expo"],
	["react", "svelte"],
	["svelte", "node"],
	["flutter", "flet"],

	// backend
	["node", "express"],
	["node", "postgres"],
	["node", "mongodb"],
	["node", "vercel"],
	["node", "onrender"],

	// devops
	["git", "github"],
	["git", "linux"],
	["github", "vercel"],
	["github", "onrender"],
	["linux", "docker"]
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
