/** @type {{ occurred: boolean, error: Error? }} */
export const crash = $state({
	occurred: false,
	error: null
});

/**
 * @param {boolean} condition
 * @param {string | Error} result
 */
export function assert(
	condition,
	result = "unexpected state resulted in assertion failure"
) {
	if (!condition) {
		crash.occurred = true;

		if (result instanceof Error) {
			crash.error = result;
		} else {
			crash.error = new Error(result);
		}

		throw crash.error;
	}
}
