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
		id: "exp-1",
		role: "Senior Software Engineer",
		company: "Tech Corp",
		period: "2024 — Present",
		description:
			"Leading frontend architecture and design system development for a SaaS platform serving 50k+ users.",
		tags: ["svelte", "typescript", "tailwind"]
	},
	{
		id: "exp-2",
		role: "Full Stack Developer",
		company: "StartupXYZ",
		period: "2022 — 2024",
		description:
			"Built and shipped core product features across the full stack, from real-time APIs to responsive UIs.",
		tags: ["react", "node", "postgres"]
	},
	{
		id: "exp-3",
		role: "Backend Engineer",
		company: "DataFlow Inc",
		period: "2021 — 2022",
		description:
			"Designed and maintained microservices handling 1M+ daily requests with a focus on reliability and observability.",
		tags: ["python", "go", "docker", "aws"]
	},
	{
		id: "exp-4",
		role: "Junior Developer",
		company: "WebAgency Co",
		period: "2020 — 2021",
		description:
			"Developed responsive client websites and internal tooling, collaborating closely with designers and PMs.",
		tags: ["javascript", "react", "figma"]
	},
	{
		id: "exp-5",
		role: "Open Source Contributor",
		company: "Community",
		period: "2019 — Present",
		description:
			"Active contributor to several open-source projects, focusing on tooling, documentation, and bug fixes.",
		tags: ["typescript", "node", "git"]
	}
];
