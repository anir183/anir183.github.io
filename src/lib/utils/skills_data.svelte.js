/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   icon: string,
 *   devicon: (string|null),
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
		id: "java",
		name: "Java",
		icon: "☕",
		devicon: "java-plain",
		category: "Languages",
		description: "Mature OOP language for enterprise and Android",
		experience: "6 years",
		relatedTechnologies: ["linux", "firebase"]
	},
	{
		id: "javascript",
		name: "JavaScript",
		icon: "🟨",
		devicon: "javascript-plain",
		category: "Languages",
		description: "Dynamic language powering the modern web",
		experience: "3 years",
		relatedTechnologies: ["react", "svelte", "node"]
	},
	{
		id: "rust",
		name: "Rust",
		icon: "🦀",
		devicon: "rust-original",
		category: "Languages",
		description: "Memory-safe systems language with zero-cost abstractions",
		experience: "6 months",
		relatedTechnologies: ["c", "linux"]
	},
	{
		id: "c",
		name: "C",
		icon: "⚙️",
		devicon: "c-original",
		category: "Languages",
		description: "Low-level systems language with minimal abstraction",
		experience: "1 year",
		relatedTechnologies: ["rust", "lua", "linux"]
	},
	{
		id: "csharp",
		name: "C#",
		icon: "🔷",
		devicon: "csharp-plain",
		category: "Languages",
		description: "Versatile .NET language for apps and games",
		experience: "4 years",
		relatedTechnologies: ["unity", "godot"]
	},
	{
		id: "lua",
		name: "Lua",
		icon: "🌙",
		devicon: "lua-plain",
		category: "Languages",
		description: "Lightweight embeddable scripting language",
		experience: "1 year",
		relatedTechnologies: ["c"]
	},
	{
		id: "python",
		name: "Python",
		icon: "🐍",
		devicon: "python-plain",
		category: "Languages",
		description: "General-purpose language for data, web, and automation",
		experience: "4 years",
		relatedTechnologies: ["flet", "sqlite", "linux"]
	},
	{
		id: "dart",
		name: "Dart",
		icon: "🎯",
		devicon: "dart-plain",
		category: "Languages",
		description: "Client-optimized language for multi-platform UIs",
		experience: "2 years",
		relatedTechnologies: ["flutter"]
	},
	{
		id: "go",
		name: "Go",
		icon: "🔵",
		devicon: "go-plain",
		category: "Languages",
		description: "Statically typed compiled language for performant services",
		experience: "1 year",
		relatedTechnologies: ["linux"]
	},
	{
		id: "sql",
		name: "SQL",
		icon: "🗃️",
		devicon: "azuresqldatabase-plain",
		category: "Languages",
		description: "Declarative query language for relational databases",
		experience: "1 year",
		relatedTechnologies: ["postgres", "sqlite"]
	},

	// ── Web & Mobile ──
	{
		id: "react",
		name: "React",
		icon: "⚛️",
		devicon: "react-original",
		category: "Web & Mobile",
		description: "Declarative UI library for web and native",
		experience: "2 years",
		relatedTechnologies: ["javascript", "node", "vercel", "firebase"]
	},
	{
		id: "svelte",
		name: "Svelte",
		icon: "🧩",
		devicon: "svelte-plain",
		category: "Web & Mobile",
		description: "Reactive component framework compiling to vanilla JS",
		experience: "1 year",
		relatedTechnologies: ["javascript", "vercel"]
	},
	{
		id: "flutter",
		name: "Flutter",
		icon: "💙",
		devicon: "flutter-plain",
		category: "Web & Mobile",
		description: "Google's UI toolkit for natively compiled cross-platform apps",
		experience: "2 years",
		relatedTechnologies: ["dart", "flet", "firebase"]
	},
	{
		id: "node",
		name: "Node.js",
		icon: "🟢",
		devicon: "nodejs-plain",
		category: "Web & Mobile",
		description: "JavaScript runtime for server-side applications",
		experience: "3 years",
		relatedTechnologies: ["javascript", "express", "react", "postgres", "mongodb", "vercel", "onrender", "linux", "firebase"]
	},
	{
		id: "express",
		name: "Express",
		icon: "🚂",
		devicon: "express-original",
		category: "Web & Mobile",
		description: "Minimalist Node.js web framework for APIs and apps",
		experience: "2 years",
		relatedTechnologies: ["node", "mongodb", "postgres"]
	},
	{
		id: "flet",
		name: "Flet",
		icon: "🪶",
		devicon: null,
		category: "Web & Mobile",
		description: "Python framework for building cross-platform Flutter UIs",
		experience: "6 months",
		relatedTechnologies: ["python", "flutter"]
	},
	{
		id: "firebase",
		name: "Firebase",
		icon: "🔥",
		devicon: "firebase-plain",
		category: "Web & Mobile",
		description: "Google's app development platform with auth, database, hosting, and serverless functions",
		experience: "2 years",
		relatedTechnologies: ["react", "flutter", "node", "java"]
	},

	// ── Databases ──
	{
		id: "mongodb",
		name: "MongoDB",
		icon: "🍃",
		devicon: "mongodb-plain",
		category: "Databases",
		description: "NoSQL document database for flexible data models",
		experience: "2 years",
		relatedTechnologies: ["node", "express"]
	},
	{
		id: "postgres",
		name: "PostgreSQL",
		icon: "🐘",
		devicon: "postgresql-plain",
		category: "Databases",
		description: "Advanced relational database with strong ACID compliance",
		experience: "1 year",
		relatedTechnologies: ["sql", "node", "express"]
	},
	{
		id: "sqlite",
		name: "SQLite",
		icon: "📄",
		devicon: "sqlite-plain",
		category: "Databases",
		description: "Self-contained embedded SQL database engine",
		experience: "2 years",
		relatedTechnologies: ["sql", "python"]
	},

	// ── Game Development ──
	{
		id: "unity",
		name: "Unity",
		icon: "🎮",
		devicon: "unity-plain",
		category: "Game Development",
		description: "Cross-platform game engine for 2D and 3D games",
		experience: "4 years",
		relatedTechnologies: ["csharp"]
	},
	{
		id: "godot",
		name: "Godot",
		icon: "👾",
		devicon: "godot-plain",
		category: "Game Development",
		description: "Cross-platform open-source game engine",
		experience: "1 year",
		relatedTechnologies: ["csharp"]
	},
	// ── DevOps & Tools ──
	{
		id: "linux",
		name: "Linux",
		icon: "🐧",
		devicon: "linux-plain",
		category: "DevOps & Tools",
		description: "Open-source OS powering servers and development environments",
		experience: "2 years",
		relatedTechnologies: ["c", "node", "python", "go", "java", "git", "rust"]
	},
	{
		id: "git",
		name: "Git",
		icon: "🔀",
		devicon: "git-plain",
		category: "DevOps & Tools",
		description: "Distributed version control for collaborative development",
		experience: "4 years",
		relatedTechnologies: ["github", "linux"]
	},
	{
		id: "github",
		name: "GitHub",
		icon: "🐙",
		devicon: "github-original",
		category: "DevOps & Tools",
		description: "Code hosting platform with CI/CD and project management",
		experience: "4 years",
		relatedTechnologies: ["git", "vercel", "onrender"]
	},
	{
		id: "vercel",
		name: "Vercel",
		icon: "▲",
		devicon: "vercel-original",
		category: "DevOps & Tools",
		description: "Frontend deployment platform with edge functions",
		experience: "1 year",
		relatedTechnologies: ["github", "svelte", "react", "node"]
	},
	{
		id: "onrender",
		name: "Render",
		icon: "☁️",
		devicon: null,
		category: "DevOps & Tools",
		description: "Cloud platform for hosting web services and databases",
		experience: "1 year",
		relatedTechnologies: ["github", "node"]
	}
];

/** @type {string[]} */
export const skillCategories = ["Languages", "Web & Mobile", "Databases", "Game Development", "DevOps & Tools"];

/** Adjacency pairs for network connections */
export const skillConnections = [
	// languages → frameworks/techs
	["javascript", "react"],
	["javascript", "svelte"],
	["javascript", "node"],
	["dart", "flutter"],
	["python", "flet"],
	["python", "sqlite"],
	["csharp", "unity"],
	["csharp", "godot"],
	["c", "rust"],
	["c", "lua"],
	["c", "linux"],
	["sql", "postgres"],
	["sql", "sqlite"],

	// web & mobile
	["node", "express"],
	["node", "mongodb"],
	["node", "postgres"],
	["node", "vercel"],
	["node", "onrender"],
	["node", "linux"],
	["express", "mongodb"],
	["express", "postgres"],
	["react", "node"],
	["react", "vercel"],
	["svelte", "vercel"],
	["flutter", "flet"],
	["firebase", "react"],
	["firebase", "flutter"],
	["firebase", "node"],
	["firebase", "java"],

	// devops & tools
	["git", "github"],
	["git", "linux"],
	["github", "vercel"],
	["github", "onrender"],
	["linux", "go"],
	["linux", "java"],
	["linux", "rust"],
	["linux", "python"]
];

/**
 * Computes random positions for every skill with minimum spacing.
 * Called once at module load — each reload produces a fresh layout.
 * @param {any[]} arr
 */
function computePositions(arr) {
	const xPad = 0.08;
	const yPad = 0.08;
	const minPx = 64;
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
