const numberFormat = require('./number-format');
const isNumeric = require('./is-numeric');

/**
 * Adds a suffix to a number, ie 1,000 = 1K
 * @param {number} n - Value to shorten
 * @param {number} min - Minimum value to allow shortening on
 * 
 * @returns {string} Number with the proper suffix
 */
module.exports = (n, min = 0) => {
	if (!isNumeric(n)) { return 0; }
	if (!isNumeric(min)) { min = 0; }

	var an = Math.abs(n);

	if (an >= 1e18 && an >= min)
	{
		return numberFormat(n / 1e18, 2) + 'Qi';
	}
	else if (an >= 1e15 && an >= min)
	{
		return numberFormat(n/1e15, 2) + 'Qa';
	}
	else if (an >= 1e12 && an >= min)
	{
		return numberFormat(n/1e12, 2) + 'T';
	}
	else if (an >= 1e9 && an >= min)
	{
		return numberFormat(n/1e9, 2) + 'B';
	}
	else if (an >= 1e6 && an >= min)
	{
		return numberFormat(n/1e6, 2) + 'M';
	}
	else if (an >= 1e3 && an >= min)
	{
		return numberFormat(n/1e3, 2) + 'K';
	}
	else
	{
		return numberFormat(n);
	}
}