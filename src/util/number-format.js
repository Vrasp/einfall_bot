/**
 * Formats a number with decimals and commas
 * @param {Number} value - the value to format
 * @param {Number} decimals - how many decimals to include
 * @param {boolean} [cannotNaN] - if false, return NaN if NaN, otherwise return 0
 * @param {boolean} [shouldDefault] - if true and value is NaN, return the original value instead of returning NaN/0
 * 
 * @returns {String} the formatted number
 */
module.exports = (value, decimals, cannotNaN, shouldDefault) => {
	if (isNaN(value)) {
		if (shouldDefault) {
			return value;
		}

		if (!cannotNaN) {
			return NaN;
		} else {
			return 0;
		}
	}

	let parts = Number(value).toFixed(decimals).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}