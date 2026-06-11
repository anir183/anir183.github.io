import { gsap } from "gsap";
import { assert, LG_BREAKPOINT, STAGGER_FAST } from "$lib";

/**
 * @param {{
 *   introImages: HTMLElement[],
 *   heroHeadline: HTMLElement | null | undefined,
 *   navLinks: HTMLElement[],
 *   themeButton: HTMLElement | null | undefined,
 *   hamburgerButton: HTMLElement | null | undefined,
 *   logoEl: HTMLElement | null | undefined,
 *   delay?: number,
 *   skipImageAnimation?: boolean,
 *   reducedMotion?: boolean
 * }} config
 * @returns {Promise<{tl: gsap.core.Timeline}>}
 */
export async function heroEntrySequence(config) {
	const {
		introImages = [],
		heroHeadline = null,
		navLinks = [],
		themeButton = null,
		hamburgerButton = null,
		logoEl = null,
		delay = 0.5,
		skipImageAnimation = false,
		reducedMotion = false
	} = config ?? {};

	console.log("[heroEntry] started", { navLinks: navLinks.length, heroHeadline: !!heroHeadline, introImages: introImages.length, themeButton: !!themeButton });

	const { SplitText } = await import("gsap/SplitText");

	if (!reducedMotion) {
		gsap.registerPlugin(SplitText);

		console.time("[heroEntry] SplitText");
		SplitText.create(navLinks, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		SplitText.create(heroHeadline, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});
		console.timeEnd("[heroEntry] SplitText");

		const navLines = navLinks.flatMap((a) => [...a.querySelectorAll(".line")]);
		const headlineLines = heroHeadline
			? [...heroHeadline.querySelectorAll(".line")]
			: [];
		console.log("[heroEntry] lines created", { navLines: navLines.length, headlineLines: headlineLines.length });

		if (logoEl) {
			gsap.set(logoEl, {
				opacity: 0,
				x: -20
			});
		}

		gsap.set([...navLines, ...headlineLines], {
			y: "125%",
			willChange: "transform"
		});
	}

	const INTRO_IMG_SPREAD = 1200;
	const introImgScale = 0.85;
	const introImgGap = 40;
	const introImgRotations = [-15, 5, -7.5, 10, -2.5];

	assert(introImages.length > 0, "introImages should have at least one image");
	const introImgWidth = introImages[0].getBoundingClientRect().width;
	const totalWidth =
		introImgWidth * introImages.length + introImgGap * (introImages.length - 1);
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
			borderRadius: "2rem"
		});

		img.dataset.centeredX = centeredX.toString();
	});

	if (skipImageAnimation) {
		introImages.forEach((img) => {
			const centeredX = parseFloat(img.dataset.centeredX || "0");
			gsap.set(img, { x: centeredX, opacity: 0 });
		});
		gsap.set([introImages[0], introImages[1]], { x: `-=${INTRO_IMG_SPREAD}`, opacity: 0 });
		gsap.set([introImages[3], introImages[4]], { x: `+=${INTRO_IMG_SPREAD}`, opacity: 0 });
		gsap.set(introImages[2], {
			scale: 1,
			x: 0,
			y: 0,
			rotation: 0,
			width: "100vw",
			height: "100svh",
			borderRadius: 0,
			opacity: 0
		});
	}

	if (reducedMotion) {
		if (skipImageAnimation) {
			introImages.forEach((img) => gsap.set(img, { opacity: 1 }));
		} else {
			introImages.forEach((img, i) => {
				const cx = parseFloat(img.dataset.centeredX || "0");
				if (i === 2) {
					gsap.set(img, {
						opacity: 1, scale: 1, x: 0, y: 0, rotation: 0,
						width: "100vw", height: "100svh", borderRadius: 0
					});
				} else {
					gsap.set(img, {
						opacity: 1,
						x: i < 2 ? cx - INTRO_IMG_SPREAD : cx + INTRO_IMG_SPREAD
					});
				}
			});
		}
		if (logoEl) gsap.set(logoEl, { opacity: 1, x: 0 });
		if (themeButton) gsap.set(themeButton, { opacity: 1, scale: 1 });
		if (hamburgerButton && window.innerWidth < LG_BREAKPOINT) {
			gsap.set(hamburgerButton, { opacity: 1, scale: 1 });
		}
		console.log("[heroEntry] reduced motion — skipping animation");
		return { tl: gsap.timeline({ delay }) };
	}

	const navLines = navLinks.flatMap((a) => [...a.querySelectorAll(".line")]);
	const headlineLines = heroHeadline
		? [...heroHeadline.querySelectorAll(".line")]
		: [];

	const tl = gsap.timeline({ delay });

	if (skipImageAnimation) {
		tl.to(
			introImages,
			{
				opacity: 1,
				duration: 5,
				ease: "power4.out",
				stagger: 0.05
			},
			0
		);
	}

	if (!skipImageAnimation) {
		introImages.forEach((img) => {
			tl.to(
				img,
				{
					x: parseFloat(img.dataset.centeredX || "0"),
					duration: 1.5,
					ease: "power4.out"
				},
				"<0.05"
			);
		});

		tl.to(
			[introImages[0], introImages[1]],
			{
				x: `-=${INTRO_IMG_SPREAD}`,
				duration: 1.5,
				ease: "power4.out"
			},
			"-=0.5"
		);

		tl.to(
			[introImages[3], introImages[4]],
			{
				x: `+=${INTRO_IMG_SPREAD}`,
				duration: 1.5,
				ease: "power4.out"
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
				ease: "power4.out"
			},
			"<"
		);
	}

	if (logoEl) {
		tl.to(
			logoEl,
			{
				opacity: 1,
				x: 0,
				duration: 0.7,
				ease: "power3.out"
			},
			"<1"
		);
	}

	tl.to(
		navLines,
		{
			y: "0%",
			duration: 1,
			stagger: STAGGER_FAST,
			ease: "power3.out"
		},
		"<"
	);

	tl.fromTo(
		themeButton,
		{
			opacity: 0,
			scale: 0.8
		},
		{
			opacity: 1,
			scale: 1,
			duration: 0.5,
			ease: "power3.out"
		},
		"<0.2"
	);

	if (hamburgerButton && window.innerWidth < LG_BREAKPOINT) {
		tl.fromTo(
			hamburgerButton,
			{
				opacity: 0,
				scale: 0.8
			},
			{
				opacity: 1,
				scale: 1,
				duration: 1,
				ease: "power3.out"
			},
			"<0.2"
		);
	}

	tl.to(
		headlineLines,
		{
			y: "0%",
			duration: 1,
			stagger: STAGGER_FAST,
			ease: "power3.out"
		},
		"<"
	);

	console.log("[heroEntry] returning tl");
	return { tl };
}
