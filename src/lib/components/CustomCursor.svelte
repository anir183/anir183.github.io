<script>
	import { gsap } from "gsap";

	const RELEASE_MULT_X = 1.5;
	const RELEASE_MULT_Y = 1;

	/** @type {HTMLDivElement} */
	let cursor;

	/** @param {HTMLElement} el */
	function getBorderRadius(el) {
		const cs = getComputedStyle(el);
		const br = cs.borderRadius;
		let val;
		if (br.endsWith("%")) {
			val = Math.min(el.offsetWidth, el.offsetHeight) * (parseFloat(br) / 100);
		} else {
			val = parseFloat(br) || 0;
		}
		return Math.min(val, el.offsetWidth / 2, el.offsetHeight / 2);
	}

	$effect(() => {
		if (matchMedia("(pointer: coarse)").matches) return;
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const doc = document.documentElement;

		const accentColor = () =>
			getComputedStyle(doc).getPropertyValue("--color-c-accent-0").trim() ||
			"#f59e0b";

		/** @type {gsap.core.Tween | null} */
		let borderTween = null;

		const pos = { x: 0, y: 0, px: 0, py: 0, tx: 0, ty: 0, lerp: 0.25 };
		const sz = { w: 20, h: 20, br: 9999, tw: 20, th: 20, tbr: 9999, lerp: 0.18, brLerp: 0.45, skew: 0, tskew: 0 };
		const scale = { current: 0, target: 0, lerp: 0.08 };

		let hidden = true;
		let rawX = 0, rawY = 0;
		/** @type {HTMLElement | null} */
		let hovered = null;
		/** @type {((v: number) => void) | null} */
		let magnetX = null;
		/** @type {((v: number) => void) | null} */
		let magnetY = null;

		const release = () => {
			if (magnetX && magnetY) {
				magnetX(0);
				magnetY(0);
				magnetX = magnetY = null;
			}
			hovered = null;
			pos.tx = rawX - 10;
			pos.ty = rawY - 10;
			sz.tw = 20;
			sz.th = 20;
			sz.tbr = 9999;
			sz.tskew = 0;
			cursor.classList.remove("hovering");
			borderTween?.kill();
			borderTween = gsap.to(cursor, {
				backgroundColor: accentColor(),
				borderWidth: 0,
				duration: 0.15,
				ease: "power2.out",
				overwrite: "auto"
			});
		};

		/** @param {MouseEvent} e */
		const onMove = (e) => {
			rawX = e.clientX;
			rawY = e.clientY;

			if (hidden) {
				hidden = false;
				sz.w = sz.tw;
				sz.h = sz.th;
				sz.br = sz.tbr;
				pos.x = pos.px = rawX - sz.w / 2;
				pos.y = pos.py = rawY - sz.h / 2;
				pos.tx = pos.x;
				pos.ty = pos.y;
				scale.target = 1;
				gsap.set(cursor, {
					x: pos.x,
					y: pos.y,
					width: sz.w,
					height: sz.h,
					borderRadius: sz.br
				});
				return;
			}

			if (!hovered) {
				pos.tx = rawX - sz.w / 2;
				pos.ty = rawY - sz.h / 2;
			}

			if (hovered) {
				const r = hovered.getBoundingClientRect();
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const dx = rawX - cx;
				const dy = rawY - cy;
				if (
					Math.abs(dx) > r.width * RELEASE_MULT_X ||
					Math.abs(dy) > r.height * RELEASE_MULT_Y
				) {
					release();
					return;
				}
			}
		};

		/** @param {MouseEvent} e */
		const onOver = (e) => {
			if (hovered) return;
			const target = /** @type {HTMLElement | null} */ (e.target);
			const el = /** @type {HTMLElement | null} */ (
				target?.closest("[data-hover]")
			);
			if (!el) return;

			hovered = el;
			const r = el.getBoundingClientRect();
			sz.tw = r.width;
			sz.th = r.height;
			sz.tbr = getBorderRadius(el);
			sz.tskew = -6;
			pos.tx = r.left;
			pos.ty = r.top;
			cursor.classList.add("hovering");
			borderTween?.kill();
			borderTween = gsap.to(cursor, {
				backgroundColor: "transparent",
				borderWidth: 2,
				duration: 0.3,
				ease: "power2.out",
				overwrite: "auto"
			});

			magnetX = gsap.quickTo(el, "x", {
				duration: 1,
				ease: "elastic.out(1, 0.3)"
			});
			magnetY = gsap.quickTo(el, "y", {
				duration: 1,
				ease: "elastic.out(1, 0.3)"
			});
		};

		const onDown = () => {
			scale.target = hovered ? 0.9 : 0.8;
		};

		const onUp = () => {
			scale.target = 1;
		};

		const onLeave = () => {
			release();
			scale.target = 0;
		};

		const onEnter = () => {
			if (!hidden && !hovered) scale.target = 1;
		};

		window.addEventListener("mousemove", onMove, { passive: true });
		document.addEventListener("mouseover", onOver);
		document.addEventListener("mousedown", onDown);
		document.addEventListener("mouseup", onUp);
		document.addEventListener("mouseleave", onLeave);
		document.addEventListener("mouseenter", onEnter);
		doc.classList.add("c-cursor-active");

		const tick = () => {
			pos.px = pos.x;
			pos.py = pos.y;

			scale.current += (scale.target - scale.current) * scale.lerp;
			sz.w += (sz.tw - sz.w) * sz.lerp;
			sz.h += (sz.th - sz.h) * sz.lerp;
			sz.br += (sz.tbr - sz.br) * sz.brLerp;
			sz.skew += (sz.tskew - sz.skew) * sz.brLerp;

			let sx = scale.current, sy = scale.current;
			let angle = 0;

			if (hovered) {
				const r = hovered.getBoundingClientRect();
				pos.tx = r.left;
				pos.ty = r.top;
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const dx = rawX - cx;
				const dy = rawY - cy;

				if (magnetX && magnetY) {
					magnetX(dx * 0.2);
					magnetY(dy * 0.2);
				}
			} else {
				const vx = pos.x - pos.px;
				const vy = pos.y - pos.py;
				const vel = Math.sqrt(vx * vx + vy * vy);
				angle = Math.atan2(vy, vx) * (180 / Math.PI);
				const stretch = Math.min(vel * 0.04, 1);
				sx = scale.current + stretch;
				sy = scale.current - stretch * 0.3;
			}

			pos.x += (pos.tx - pos.x) * pos.lerp;
			pos.y += (pos.ty - pos.y) * pos.lerp;

			gsap.set(cursor, {
				x: pos.x,
				y: pos.y,
				width: sz.w,
				height: sz.h,
				borderRadius: sz.br,
				skewX: sz.skew,
				rotation: angle,
				scaleX: sx,
				scaleY: sy
			});
		};

		gsap.ticker.add(tick);

		return () => {
			window.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseover", onOver);
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("mouseup", onUp);
			document.removeEventListener("mouseleave", onLeave);
			document.removeEventListener("mouseenter", onEnter);
			doc.classList.remove("c-cursor-active");
			gsap.ticker.remove(tick);
			borderTween?.kill();
			release();
			cursor.classList.remove("hovering");
		};
	});
</script>

<div bind:this={cursor} class="cursor" aria-hidden="true"></div>

<style>
	:global(:root.c-cursor-active),
	:global(:root.c-cursor-active *) {
		cursor: none !important;
	}

	.cursor {
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 9999;
		will-change: transform, width, height, border-radius, skew;
		background-color: var(--color-c-accent-0);
		border: 0px solid var(--color-c-accent-0);
	}

	.cursor:global(.hovering) {
		background-color: transparent;
	}
</style>
