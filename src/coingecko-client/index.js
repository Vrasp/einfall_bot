const coinGecko = require('coingecko-api');
const { numberFormatAlt, numberFormat, shortenNumber } = require('../util');
const coinGeckoClient = new coinGecko();

coinGeckoClient.getTicker = function(name) {
	let ticker = name.toLowerCase();
	let realTicker = this.coinList.find((coin) => { return coin.id.toLowerCase() == name; });

	if (!realTicker) {
		realTicker = this.coinList.find((coin) => { return coin.symbol.toLowerCase() == ticker; });
	}

	return realTicker;
}

coinGeckoClient.getDetails = function(info) {
	let marketData = info.market_data;
	let currentPrice = marketData.current_price.usd;
	let allTimeHigh = marketData.ath.usd;
	let athChangePercent = marketData.ath_change_percentage.usd;
	let allTimeLow = marketData.atl.usd;
	let atlChangePercent = marketData.atl_change_percentage.usd;
	let marketCap = marketData.market_cap.usd;
	let marketCapPercentageChange = marketData.market_cap_change_percentage_24h;
	let totalVolume = marketData.total_volume.usd;
	let high24 = marketData.high_24h.usd;
	let low24 = marketData.low_24h.usd;
	let change24h = marketData.price_change_24h_in_currency.usd;
	let percentageChange24h = marketData.price_change_percentage_24h_in_currency.usd;
	let percentageChange7d = marketData.price_change_percentage_7d_in_currency.usd;
	let change7d = currentPrice - (currentPrice / (1 + (percentageChange7d / 100)));
	let lowChange = ((currentPrice - low24) / low24) * 100;
	let highChange = ((currentPrice - high24) / high24) * 100;

	return {
		marketData,
		currentPrice,
		allTimeHigh,
		athChangePercent,
		allTimeLow,
		atlChangePercent,
		marketCap,
		marketCapPercentageChange,
		totalVolume,
		high24,
		low24,
		change24h,
		percentageChange24h,
		percentageChange7d,
		change7d,
		lowChange,
		highChange
	};
}

coinGeckoClient.displayCoinGeckoPrice = async function(message, ticker, embed) {
	let realTicker = this.getTicker(ticker);

	if (!realTicker) {
		return message.reply(`Sorry ${message.author}, I can't find that crypto.`);
	}

	let details = await this.coins.fetch(realTicker.id);
	let info = details.data;

	if (!Object.values(info).length) {
		return message.reply(`Sorry, I can't find a cryptocurrency with the ticker ${ticker}!`);
	}

	let {
		marketData, currentPrice, allTimeHigh, athChangePercent,
		allTimeLow, atlChangePercent, marketCap, marketCapPercentageChange,
		totalVolume, high24, low24,	change24h, percentageChange24h,
		percentageChange7d, change7d, lowChange, highChange
	} = this.getDetails(info);

	embed.setTitle(`${info.name} (${info.symbol.toUpperCase()}) - $${numberFormatAlt(currentPrice, 2, 8)} (${(percentageChange24h >= 0 ? '+' : '')}${numberFormat(percentageChange24h, 2)}%)`)
		.setDescription(`**Market Cap**: $${shortenNumber(marketCap)} (${(marketData.market_cap_change_24h >= 0 ? '+' : '')}$${shortenNumber(marketData.market_cap_change_24h)})\n**Volume**: $${shortenNumber(totalVolume, 2)} (~${numberFormat(totalVolume / currentPrice, 5)} coins)`)
		.setThumbnail(info.image.thumb);

	embed.addField("24h Ago", `$${numberFormat(currentPrice - change24h, 5)} (${(percentageChange24h >= 0 ? '+' : '')}${numberFormat(percentageChange24h, 2)}%)`, true)
		.addField("\u200B", "\u200B", true)
		.addField("7d Ago", `$${numberFormat(currentPrice - change7d, 5)} (${(percentageChange7d >= 0 ? '+' : '')}${numberFormat(percentageChange7d, 2)}%)`, true)
		.addField("24h Low", `$${numberFormat(low24, 5)} (${(lowChange >= 0 ? '+' : '')}${numberFormat(lowChange, 2)}%)`, true)
		.addField("\u200B", "\u200B", true)
		.addField("24h High", `$${numberFormat(high24, 5)} (${(highChange >= 0 ? '+' : '')}${numberFormat(highChange, 2)}%)`, true);

	embed.setFooter({ text: 'Powered by CoinGecko' });

	return message.reply({ embeds: [ embed ] });
}

coinGeckoClient.displayCoinGeckoPrices = async function(message, tickers, embed) {
	for (let i=0; i < tickers.length; i++)
	{
		let ticker = tickers[i].toLowerCase();
		let realTicker = coinGeckoClient.getTicker(ticker);

		if (!realTicker)
		{
			embed.addField(`**${ticker}**`, `Invalid Ticker`, true);
		}
		else
		{
			let details = await coinGeckoClient.coins.fetch(realTicker.id);
			let data = details.data;

			this.addCoinGeckoEmbed(embed, data);
		}

		if (i % 2 == 1)
		{
			embed.addField("\u200B", "\u200B", true);
		}
	}

	embed.setFooter({ text: 'Powered by CoinGecko' });

	let msg = await message.reply({ embeds: [ embed ] });

	setTimeout(() => message.delete() && msg.delete(), 30000);
}

coinGeckoClient.addCoinGeckoEmbed = function(embed, info) {
	let {
		marketData, currentPrice, allTimeHigh, athChangePercent,
		allTimeLow, atlChangePercent, marketCap, marketCapPercentageChange,
		totalVolume, high24, low24,	change24h, percentageChange24h,
		percentageChange7d, change7d, lowChange, highChange
	} = this.getDetails(info);

	embed.addField(
		`**${info.name} (${info.symbol.toUpperCase()})** -  $${numberFormatAlt(currentPrice, 2, 8)} (${(percentageChange24h >= 0 ? '+' : '')}${numberFormat(percentageChange24h, 2)}%)`,
		`**Volume**: $${numberFormat(totalVolume, 2)}\n`
			+ `**24h Ago**: $${numberFormat(currentPrice - change24h, 5)} (${(percentageChange24h >= 0 ? '+' : '')}${numberFormat(percentageChange24h, 2)}%)\n`
			+ `**7d Ago**: $${numberFormat(currentPrice - change7d, 5)} (${(percentageChange7d >= 0 ? '+' : '')}${numberFormat(percentageChange7d, 2)}%)\n`
			+ `**24h Low**: $${numberFormat(low24, 5)} (${(lowChange >= 0 ? '+' : '')}${numberFormat(lowChange, 2)}%)\n`
			+ `**24h High**: $${numberFormat(high24, 5)} (${(highChange >= 0 ? '+' : '')}${numberFormat(highChange, 2)}%)`,
		true
	);	
}

module.exports = coinGeckoClient;