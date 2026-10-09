/**
 * @typedef {{ id: string, number: string, name: string, image: string, imageMobile: string, tags: string[], description: string, images: string[], imagesMobile: string[], link: string }} Project
 */

/**
 * All applicable projects, ordered by importance (most important first).
 * The home page shows the first four, the projects page shows all of them,
 * and the resume lists the top five.
 *
 * @type {Project[]}
 */
export const projects = [
	{
		id: "traffiq",
		number: "01",
		name: "traffIQ",
		image: "/assets/project_images/traffiq/regular_0.png",
		imageMobile: "/assets/project_images/traffiq/mobile_0.png",
		tags: ["python", "computer vision", "anpr", "gis"],
		description:
			"A city-wide AI engine that links isolated CCTV and ANPR cameras into a unified vehicle-tracking and traffic-analytics platform. Computer-vision models identify vehicles at the edge, observations are correlated across cameras to reconstruct trajectories, and real-time and historical traffic insights are surfaced to operators. Built across successive Smart India Hackathon internal rounds.",
		images: [
			"/assets/project_images/traffiq/regular_0.png",
			"/assets/project_images/traffiq/regular_1.png",
			"/assets/project_images/traffiq/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/traffiq/mobile_0.png",
			"/assets/project_images/traffiq/mobile_1.png",
			"/assets/project_images/traffiq/mobile_2.png"
		],
		link: "https://github.com/anir183/traffIQ"
	},
	{
		id: "phisim",
		number: "02",
		name: "PhiSim",
		image: "/assets/project_images/phisim/regular_0.png",
		imageMobile: "/assets/project_images/phisim/mobile_0.png",
		tags: ["python", "fastapi", "sqlite", "websockets"],
		description:
			"A local, self-contained phishing-awareness lab. Participants move through believable mailbox, messenger, marketplace and MFA experiences while an analyst console records safe, explainable telemetry. FastAPI backend with SQLite persistence, a live WebSocket event stream, and deterministic indicator analysis — no real email, SMS, credentials or outbound network calls.",
		images: [
			"/assets/project_images/phisim/regular_0.png",
			"/assets/project_images/phisim/regular_1.png",
			"/assets/project_images/phisim/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/phisim/mobile_0.png",
			"/assets/project_images/phisim/mobile_1.png",
			"/assets/project_images/phisim/mobile_2.png"
		],
		link: "https://github.com/anir183/phisim"
	},
	{
		id: "safe-ping",
		number: "03",
		name: "Safe Ping",
		image: "/assets/project_images/safe_ping/regular_0.png",
		imageMobile: "/assets/project_images/safe_ping/mobile_0.png",
		tags: ["python", "flet", "websockets"],
		description:
			"A secure workspace and chat application built with Python. The frontend uses Flet (a Flutter-based UI framework for Python) and the backend is a FastAPI WebSocket server.",
		images: [
			"/assets/project_images/safe_ping/regular_0.png",
			"/assets/project_images/safe_ping/regular_1.png",
			"/assets/project_images/safe_ping/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/safe_ping/mobile_0.png",
			"/assets/project_images/safe_ping/mobile_1.png",
			"/assets/project_images/safe_ping/mobile_2.png"
		],
		link: "https://github.com/anir183/safe-ping"
	},
	{
		id: "showtime-hub",
		number: "04",
		name: "Showtime Hub",
		image: "/assets/project_images/movie_booking/regular_0.png",
		imageMobile: "/assets/project_images/movie_booking/mobile_0.png",
		tags: ["java", "javaawt", "jswing"],
		description:
			"A simple movie booking app simulation made in pure JAVA, with default UI libraries like JSwing and JavaAWT that comes with a stock JAVA install. Stores data in the filesystem within .txt files. Hackathon winner.",
		images: [
			"/assets/project_images/movie_booking/regular_0.png",
			"/assets/project_images/movie_booking/regular_1.png",
			"/assets/project_images/movie_booking/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/movie_booking/mobile_0.png",
			"/assets/project_images/movie_booking/mobile_1.png",
			"/assets/project_images/movie_booking/mobile_2.png"
		],
		link: "https://github.com/anir183/movie-booking.java"
	},
	{
		id: "auto-updater",
		number: "05",
		name: "Auto Updater",
		image: "/assets/project_images/auto_updater/regular_0.png",
		imageMobile: "/assets/project_images/auto_updater/mobile_0.png",
		tags: ["csharp", "unity", "networking"],
		description:
			"A cross-platform application launcher, installer and updater built in Unity. Originally a .NET WPF app, it was ported to Unity to ship on Windows, macOS and Linux, and uses Unity Remote Config to control update behaviour remotely without redeploying.",
		images: [
			"/assets/project_images/auto_updater/regular_0.png",
			"/assets/project_images/auto_updater/regular_1.png",
			"/assets/project_images/auto_updater/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/auto_updater/mobile_0.png",
			"/assets/project_images/auto_updater/mobile_1.png",
			"/assets/project_images/auto_updater/mobile_2.png"
		],
		link: "https://github.com/anir183/auto-updater.unity"
	},
	{
		id: "shebs",
		number: "06",
		name: "SHEBS",
		image: "/assets/project_images/shebs/regular_0.png",
		imageMobile: "/assets/project_images/shebs/mobile_0.png",
		tags: ["flutter", "firebase", "go"],
		description:
			"A Rapid Crisis Response system designed to instantly detect, report, and synchronize crisis response efforts across a decentralized hospitality ecosystem, acting as a highly reliable bridge between distressed guests, on-site personnel, and emergency services.",
		images: [
			"/assets/project_images/shebs/regular_0.png",
			"/assets/project_images/shebs/regular_1.png",
			"/assets/project_images/shebs/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/shebs/mobile_0.png",
			"/assets/project_images/shebs/mobile_1.png",
			"/assets/project_images/shebs/mobile_2.png"
		],
		link: "https://github.com/anir183/shebs"
	},
	{
		id: "cognify",
		number: "07",
		name: "Cognify",
		image: "/assets/project_images/cognify/regular_0.png",
		imageMobile: "/assets/project_images/cognify/mobile_0.png",
		tags: ["flutter", "go", "firebase", "hardhat"],
		description:
			"An AI-driven EdTech platform that delivers truly personalized learning through real-time adaptation, performance analysis, and gamified experiences. It moves beyond static course structures to dynamically adjust difficulty, pace, and reinforcement based on each learner's performance.",
		images: [
			"/assets/project_images/cognify/regular_0.png",
			"/assets/project_images/cognify/regular_1.png",
			"/assets/project_images/cognify/regular_2.png"
		],
		imagesMobile: [
			"/assets/project_images/cognify/mobile_0.png",
			"/assets/project_images/cognify/mobile_1.png",
			"/assets/project_images/cognify/mobile_2.png"
		],
		link: "https://github.com/anir183/cognify"
	}
];

/** Projects shown on the home page (the four most important). */
export const homeProjects = projects.slice(0, 4);
