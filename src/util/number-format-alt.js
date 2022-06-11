module.exports = (value, minDecimals, decimals, cannotNaN, shouldDefault) => {
	if (isNaN(value)) {
		if (shouldDefault) {
			return value;
		}

		if (!cannotNaN) {
			return 'NaN';
		} else {
			return 0;
		}
	}

	return Number(value).toLocaleString('en-US', { minimumFactionDigits: minDecimals, maximumFractionDigits: decimals });
}