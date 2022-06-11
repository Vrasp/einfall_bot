/**
 * Test whether a value is numeric
 * @param {any} n - Value to test
 * 
 * @returns {boolean} Whether the value is a representation of a number
 */
module.exports = (n) => {
	return !isNaN(parseFloat(n)) && isFinite(n);
}