/**
 * @typedef {{ id: string, name: string, image: string, imageMobile: string, tags: string[], description: string }} Project
 */

/** @type {Project[]} */
export const projects = [
	{
		id: "proj-0",
		name: "Project Alpha",
		image: "/assets/project_images/project_0.jpg",
		imageMobile: "/assets/project_images/project_mobile_0.jpg",
		tags: ["Svelte", "GSAP", "Tailwind"],
		description:
			"A full-stack web application with smooth animations and responsive design."
	},
	{
		id: "proj-1",
		name: "Project Beta",
		image: "/assets/project_images/project_1.jpg",
		imageMobile: "/assets/project_images/project_mobile_1.jpg",
		tags: ["Three.js", "WebGL", "React"],
		description:
			"An interactive 3D visualization tool built for real-time data exploration."
	},
	{
		id: "proj-2",
		name: "Project Gamma",
		image: "/assets/project_images/project_2.jpg",
		imageMobile: "/assets/project_images/project_mobile_2.jpg",
		tags: ["Node.js", "PostgreSQL", "Docker"],
		description:
			"A scalable backend service handling millions of requests per day."
	},
	{
		id: "proj-3",
		name: "Project Delta",
		image: "/assets/project_images/project_3.jpg",
		imageMobile: "/assets/project_images/project_mobile_3.jpg",
		tags: ["Python", "TensorFlow", "FastAPI"],
		description:
			"Machine learning pipeline for real-time image classification and analysis."
	}
];
