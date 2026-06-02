/**
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<void>}
 */
export async function loadAllImages(onProgress) {
	const images = Array.from(document.images);
	if (images.length === 0) {
		onProgress?.(1);
		return;
	}

	let loaded = 0;
	const onLoad = () => {
		loaded++;
		onProgress?.(loaded / images.length);
	};

	await Promise.all(
		images.map((img) => {
			if (img.complete) {
				return Promise.resolve().then(() => {
					onLoad();
				});
			}
			return new Promise((resolve) => {
				img.addEventListener(
					"load",
					() => {
						onLoad();
						resolve(undefined);
					},
					{ once: true }
				);
				img.addEventListener(
					"error",
					() => {
						onLoad();
						resolve(undefined);
					},
					{ once: true }
				);
			});
		})
	);
}
