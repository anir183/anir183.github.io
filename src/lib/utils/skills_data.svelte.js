/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   icon: string,
 *   category: string,
 *   description: string,
 *   experience: string,
 *   relatedTechnologies: string[],
 *   featured: boolean,
 *   position: { x: number, y: number }
 * }} Skill
 */

/** @type {Skill[]} */
export const skills = [
	{
		id: "svelte",
		name: "Svelte",
		icon: "🧩",
		category: "Frontend",
		featured: true,
		description: "Reactive component framework compiling to vanilla JS",
		experience: "2 years",
		relatedTechnologies: ["typescript", "vite"],
		position: { x: 0.1, y: 0.18 }
	},
	{
		id: "react",
		name: "React",
		icon: "⚛️",
		category: "Frontend",
		featured: true,
		description: "Declarative UI library with a vast ecosystem",
		experience: "3 years",
		relatedTechnologies: ["typescript", "tailwind"],
		position: { x: 0.28, y: 0.22 }
	},
	{
		id: "typescript",
		name: "TypeScript",
		icon: "📘",
		category: "Frontend",
		featured: true,
		description: "Typed superset of JavaScript for scalable apps",
		experience: "3 years",
		relatedTechnologies: ["react", "node"],
		position: { x: 0.46, y: 0.17 }
	},
	{
		id: "tailwind",
		name: "Tailwind",
		icon: "🎨",
		category: "Frontend",
		featured: false,
		description: "Utility-first CSS framework for rapid UI development",
		experience: "2 years",
		relatedTechnologies: ["react", "figma"],
		position: { x: 0.64, y: 0.22 }
	},
	{
		id: "gsap",
		name: "GSAP",
		icon: "⚡",
		category: "Frontend",
		featured: false,
		description: "High-performance animation library for the web",
		experience: "1 year",
		relatedTechnologies: ["threejs", "svelte"],
		position: { x: 0.82, y: 0.18 }
	},
	{
		id: "node",
		name: "Node.js",
		icon: "🟢",
		category: "Backend",
		featured: true,
		description: "JavaScript runtime built on Chrome's V8 engine",
		experience: "3 years",
		relatedTechnologies: ["typescript", "postgres"],
		position: { x: 0.08, y: 0.48 }
	},
	{
		id: "python",
		name: "Python",
		icon: "🐍",
		category: "Backend",
		featured: true,
		description: "Versatile language for automation, data, and APIs",
		experience: "4 years",
		relatedTechnologies: ["postgres", "go"],
		position: { x: 0.26, y: 0.52 }
	},
	{
		id: "go",
		name: "Go",
		icon: "🔵",
		category: "Backend",
		featured: false,
		description: "Statically typed compiled language for performant services",
		experience: "1 year",
		relatedTechnologies: ["docker", "python"],
		position: { x: 0.44, y: 0.47 }
	},
	{
		id: "postgres",
		name: "PostgreSQL",
		icon: "🐘",
		category: "Backend",
		featured: true,
		description: "Advanced relational database with strong ACID compliance",
		experience: "3 years",
		relatedTechnologies: ["node", "redis"],
		position: { x: 0.62, y: 0.53 }
	},
	{
		id: "redis",
		name: "Redis",
		icon: "🟥",
		category: "Backend",
		featured: false,
		description: "In-memory data store for caching and real-time workloads",
		experience: "2 years",
		relatedTechnologies: ["node", "postgres"],
		position: { x: 0.8, y: 0.48 }
	},
	{
		id: "docker",
		name: "Docker",
		icon: "🐳",
		category: "Backend",
		featured: true,
		description: "Container platform for reproducible deployment",
		experience: "3 years",
		relatedTechnologies: ["go", "aws"],
		position: { x: 0.94, y: 0.52 }
	},
	{
		id: "git",
		name: "Git",
		icon: "🔀",
		category: "Tools",
		featured: true,
		description: "Distributed version control for collaborative development",
		experience: "4 years",
		relatedTechnologies: ["docker", "vite"],
		position: { x: 0.12, y: 0.8 }
	},
	{
		id: "vite",
		name: "Vite",
		icon: "📦",
		category: "Tools",
		featured: false,
		description: "Next-generation build tool with instant HMR",
		experience: "2 years",
		relatedTechnologies: ["svelte", "node"],
		position: { x: 0.32, y: 0.78 }
	},
	{
		id: "aws",
		name: "AWS",
		icon: "☁️",
		category: "Tools",
		featured: false,
		description: "Cloud platform for scalable infrastructure and services",
		experience: "2 years",
		relatedTechnologies: ["docker", "node"],
		position: { x: 0.52, y: 0.82 }
	},
	{
		id: "figma",
		name: "Figma",
		icon: "🎭",
		category: "Tools",
		featured: false,
		description: "Collaborative design tool for UI/UX prototyping",
		experience: "2 years",
		relatedTechnologies: ["tailwind", "react"],
		position: { x: 0.72, y: 0.78 }
	},
	{
		id: "threejs",
		name: "Three.js",
		icon: "🎲",
		category: "Tools",
		featured: false,
		description: "3D graphics library for browser-based rendering",
		experience: "1 year",
		relatedTechnologies: ["gsap", "svelte"],
		position: { x: 0.9, y: 0.8 }
	}
];

/** @type {Skill[]} */
export const featuredSkills = skills.filter((s) => s.featured);

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

const featuredIdSet = new Set(featuredSkills.map((s) => s.id));

/** Edges where both endpoints are featured (used for mobile graph) */
export const featuredConnections = skillConnections.filter(
	([a, b]) => featuredIdSet.has(a) && featuredIdSet.has(b)
);
