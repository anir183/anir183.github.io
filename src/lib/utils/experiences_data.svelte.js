/**
 * @typedef {{
 *   id: string,
 *   role: string,
 *   company: string,
 *   period: string,
 *   description: string,
 *   tags: string[]
 * }} Experience
 */

/** @type {Experience[]} */
export const experiences = [
	{
		id: "btech",
		role: "B.Tech CyberSecurity Student",
		company: "Techno Main Salt Lake",
		period: "2024 — Present",
		description:
			"Learning and practising core programming concepts and system architecture practices. Getting acquainted with related concepts like Networking, DBMS, Operating Systems, Compilers, etc.",
		tags: ["c", "python", "java", "sql", "linux"]
	},
	{
		id: "backend-iic",
		role: "Backend Developer",
		company: "IIC TMSL",
		period: "2024 — 2026",
		description:
			"Built and shipped backends for user registration and payment website for different club events. Maintained existing organisation sites from updating REST APIs to managing frontend UX.",
		tags: ["react", "javascript", "nodejs", "express", "mongodb"]
	},
	{
		id: "higher-secondary",
		role: "Higher Secondary",
		company: "P.B. Academic School",
		period: "2022 — 2024",
		description:
			"Advanced usage of JAVA and Object Oriented Programming in computer science. Getting familiar with the JAVA ecosystem.",
		tags: ["java", "javaawt", "jswing", "springboot", "maven", "gradle", "intellij"]
	},
	{
		id: "self-teaching",
		role: "Self-Taught",
		company: "Independent",
		period: "2019 — Present",
		description:
			"Strong grasp of procedural as well as object-oriented programming across various languages. Multi-framework proficiency. High proficiency with Linux and related tools. Experience and projects across several disciplines including Web Dev, Application Dev, System Design, Game Dev, DBMS and DevOps.",
		tags: ["unity", "c#", "godot", "linux", "java", "c", "rust", "go", "lua", "dart", "vercel", "onrender", "javascript", "python", "sql", "flutter", "react", "svelte", "neovim"]
	}
];
