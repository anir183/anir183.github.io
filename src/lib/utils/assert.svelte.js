/** @type {{ occurred: boolean, error: Error? }} */
export const assert_failure = $state({
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
		assert_failure.occurred = true;

		if (result instanceof Error) {
			assert_failure.error = result;
		} else {
			assert_failure.error = new Error(result);
		}

		throw assert_failure.error;
	}
}
