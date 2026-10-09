/**
 * @typedef {{
 *   id: string,
 *   role: string,
 *   company: string,
 *   link?: string,
 *   period: string,
 *   description: string,
 *   results?: string,
 *   tags: string[]
 * }} Experience
 */

/** @type {Experience[]} */
export const experiences = [
	{
		id: "cachecrew",
		role: "Co-Founder & Full-Stack Developer",
		company: "CacheCrew",
		period: "2023 — Present",
		description:
			"Co-founded a hackathon team building and shipping full-stack, cross-platform applications. Work spans real-time backends, computer-vision pipelines and responsive front-ends, delivered end to end under competition deadlines across multiple Smart India Hackathon internal rounds.",
		tags: ["flutter", "go", "python", "firebase", "computer vision"]
	},
	{
		id: "btech",
		role: "B.Tech CSE (Cyber Security) Student",
		company: "Techno Main Salt Lake",
		link: "https://www.technomainsaltlake.ticollege.ac.in",
		period: "2024 — Present",
		description:
			"Pursuing core computer science and cyber security coursework spanning Networking, DBMS, Operating Systems and Compilers.",
		results: "YGPA: 7.74 1st year, 8.05 2nd year",
		tags: ["c", "python", "java", "sql", "linux"]
	},
	{
		id: "backend-iic",
		role: "Backend Developer",
		company: "IIC TMSL",
		link: "https://www.linkedin.com/company/iictmsl/",
		period: "2024 — 2026",
		description:
			"Built and shipped backends for user registration and payment website for different club events. Maintained existing organisation sites from updating REST APIs to managing frontend UX.",
		tags: ["react", "javascript", "nodejs", "express", "mongodb"]
	},
	{
		id: "higher-secondary",
		role: "Higher Secondary (ISC)",
		company: "P.B. Academic School",
		link: "https://pbacademic.in/",
		period: "2022 — 2024",
		description:
			"Computer Science stream with advanced Java and Object Oriented Programming.",
		results: "92% best of 4, 88.8% overall",
		tags: ["java", "javaawt", "jswing", "gradle", "intellij"]
	},
	{
		id: "schooling",
		role: "Primary, Middle & Secondary (ICSE)",
		company: "National Public School",
		link: "https://npskolkata.com/",
		period: "2012 — 2022",
		description:
			"Ten years of foundational schooling under the ICSE board with a Physics, Chemistry, Mathematics and Computer Science (PCMC) focus.",
		results: "89.6% best of 5, 88.5% overall",
		tags: ["icse", "science", "mathematics", "english"]
	}
];
