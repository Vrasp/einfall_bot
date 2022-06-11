module.exports = (current, next) => {
	return ((next - current) / current) * 100;
}