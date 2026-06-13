/**
 * @typedef {{ id: string, number: string, name: string, image: string, imageMobile: string, tags: string[], description: string, images: string[], imagesMobile: string[], link: string }} Project
 */

/** @type {Project[]} */
export const projects = [
	{
		id: "safe-ping",
		number: "01",
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
		id: "shebs",
		number: "02",
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
		number: "03",
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
	},
	{
		id: "showtime-hub",
		number: "04",
		name: "Showtime Hub",
		image: "/assets/project_images/movie_booking/regular_0.png",
		imageMobile: "/assets/project_images/movie_booking/mobile_0.png",
		tags: ["java", "javaawt", "jswing"],
		description:
			"A simple movie booking app simulation made in pure JAVA, with default UI libraries like JSwing and JavaAWT that comes with a stock JAVA install. Stores data in the filesystem within .txt files.",
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
	}
];
