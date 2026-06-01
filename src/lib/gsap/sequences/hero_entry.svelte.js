import { gsap } from "gsap";
import { assert, LG_BREAKPOINT, STAGGER_FAST } from "$lib";

/**
 * @param {{
 *   introImages: HTMLElement[],
 *   heroHeadline: HTMLElement | null | undefined,
 *   navLinks: HTMLElement[],
 *   themeButton: HTMLElement | null | undefined,
 *   hamburgerButton: HTMLElement | null | undefined,
 *   delay?: number,
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
		delay = 0.5
	} = config ?? {};

	const { SplitText } = await import("gsap/SplitText");

	gsap.registerPlugin(SplitText);

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

	const navLines = navLinks.flatMap((a) => [...a.querySelectorAll(".line")]);
	const headlineLines = heroHeadline
		? [...heroHeadline.querySelectorAll(".line")]
		: [];

	gsap.set([...navLines, ...headlineLines], {
		y: "125%",
		willChange: "transform"
	});

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

	const tl = gsap.timeline({ delay });

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

	tl.to(
		navLines,
		{
			y: "0%",
			duration: 1,
			stagger: STAGGER_FAST,
			ease: "power3.out"
		},
		"<1"
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

	return { tl };
}
