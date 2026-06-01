import { gsap } from "gsap";

/**
 * @param {{
 *   introImages: HTMLElement[],
 *   heroHeadline: HTMLElement,
 *   navLinks: HTMLElement[],
 *   themeButton: HTMLElement,
 *   delay?: number,
 * }} config
 * @returns {Promise<{tl: gsap.core.Timeline, navSplit: *, headlineSplit: *}>}
 */
export async function heroEntrySequence(config) {
	const {
		introImages = [],
		heroHeadline = null,
		navLinks = [],
		themeButton = null,
		delay = 0.5,
	} = config ?? {};

	const { SplitText } = await import("gsap/SplitText");

	gsap.registerPlugin(SplitText);

	await Promise.all(
		Array.from(document.images).map((img) => {
			if (img.complete) return Promise.resolve();
			return new Promise((resolve) => {
				img.onload = resolve;
				img.onerror = resolve;
			});
		})
	);

	const navSplit = SplitText.create(navLinks, {
		type: "lines",
		linesClass: "line",
		mask: "lines",
		autoSplit: true,
	});

	const headlineSplit = SplitText.create(heroHeadline, {
		type: "lines",
		linesClass: "line",
		mask: "lines",
		autoSplit: true,
	});

	const navLines = navLinks.flatMap(
		(a) => [...a.querySelectorAll(".line")]
	);
	const headlineLines = heroHeadline
		? [...heroHeadline.querySelectorAll(".line")]
		: [];

	gsap.set([...navLines, ...headlineLines], {
		y: "125%",
		willChange: "true",
	});

	const introImgScale = 0.85;
	const introImgGap = 40;
	const introImgRotations = [-15, 5, -7.5, 10, -2.5];

	const introImgWidth = introImages[0].getBoundingClientRect().width;
	const totalWidth =
		introImgWidth * introImages.length +
		introImgGap * (introImages.length - 1);
	const startX = -totalWidth / 2 + introImgWidth / 2;

	introImages.forEach((img, i) => {
		const centeredX = startX + i * (introImgWidth + introImgGap);
		const rect = img.getBoundingClientRect();
		const offScreenX = centeredX - window.innerWidth / 2 - rect.width * 4;

		gsap.set(img, {
			xPercent: -50,
			yPercent: -50,
			x: offScreenX,
			scale: introImgScale,
			rotation: introImgRotations[i],
			borderRadius: "2rem",
		});

		img.dataset.centeredX = centeredX.toString();
	});

	const tl = gsap.timeline({ delay });

	introImages.forEach((img) => {
		tl.to(
			img,
			{
				x: parseFloat(img.dataset.centeredX || "0"),
				duration: 1.5,
				ease: "power4.out",
			},
			"<0.05"
		);
	});

	tl.to(
		[introImages[0], introImages[1]],
		{
			x: "-=1200",
			duration: 1.5,
			ease: "power4.out",
		},
		"-=0.5"
	);

	tl.to(
		[introImages[3], introImages[4]],
		{
			x: "+=1200",
			duration: 1.5,
			ease: "power4.out",
		},
		"<"
	);

	tl.to(
		introImages[2],
		{
			scale: 1,
			x: 0,
			y: 0,
			rotation: 0,
			width: "100vw",
			height: "100svh",
			borderRadius: 0,
			duration: 2,
			ease: "power4.out",
		},
		"<"
	);

	tl.to(
		navLines,
		{
			y: "0%",
			duration: 1,
			stagger: 0.1,
			ease: "power3.out",
		},
		"<1"
	);

	tl.fromTo(
		themeButton,
		{
			opacity: 0,
			y: 0,
			scale: 0.8,
		},
		{
			opacity: 1,
			y: -7,
			scale: 1,
			duration: 1,
			ease: "power3.out",
		},
		"<0.2"
	);

	tl.to(
		headlineLines,
		{
			y: "0%",
			duration: 1,
			stagger: 0.1,
			ease: "power3.out",
		},
		"<"
	);

	return { tl, navSplit, headlineSplit };
}
