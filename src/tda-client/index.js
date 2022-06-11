const tdaClient = require('tda-api-client');
const Discord = require('discord.js');
const { getPercentChange, numberFormat, shortenNumber } = require('../util');

class TDAClient {
	constructor() {
		this.client = tdaClient;
	}

	getDetails(data) {
		let currentPrice = data.lastPrice;
		let openPrice = data.openPrice;
		let closePrice = data.closePrice;
		let highPrice = data.highPrice;
		let lowPrice = data.lowPrice;
		let yrHigh = data['52WkHigh'];
		let yrLow = data['52WkLow'];

		let highChange = getPercentChange(highPrice, currentPrice);
		let lowChange = getPercentChange(lowPrice, currentPrice);
		let openChange = getPercentChange(openPrice, currentPrice);
		let percentChange = getPercentChange(closePrice, currentPrice);
		let yrHighChange = getPercentChange(yrHigh, currentPrice);
		let yrLowChange = getPercentChange(yrLow, currentPrice);

		let color = (percentChange >= 0 ? 3066993 : 15158332);

		return {
			currentPrice,
			openPrice,
			closePrice,
			highPrice,
			lowPrice,
			yrHigh,
			yrLow,
			highChange,
			lowChange,
			openChange,
			percentChange,
			yrHighChange,
			yrLowChange,
			color
		};
	}

	displayTDAPrice(message, ticker, info) {
		if (!Object.values(info).length) {
			return message.reply(`I can't find a stock with the ${ticker} ticker!`);
		}

		let data = info[ticker];

		let {
			currentPrice, openPrice, closePrice, highPrice, lowPrice,
			yrHigh, yrLow,
			highChange, lowChange, openChange, percentChange, yrHighChange, yrLowChange,
			color
		} = this.getDetails(data);

		const embed = new Discord.MessageEmbed()	
			.setTitle(
				`**${data.description.replace('Common Stock', '').replace('Class A', '').replace('Common stock', '').replace(' - ', '')}\n`
				+ `${ticker}** - $${numberFormat(currentPrice, 2)} (${(percentChange >= 0 ? '+' : '')}${numberFormat(percentChange, 2)}%)`
			).setDescription(
				`**Volume**: ${numberFormat(data.totalVolume)}`
				+ (data.fundamentals ?
					`\n**Market Cap**: $${data.fundamentals.marketCap ? shortenNumber(data.fundamentals.marketCap * 1000000) : shortenNumber(data.fundamentals.sharesOutstanding * currentPrice)}`
				: '')
			).setColor(color);

		embed.addField("Open Price", `$${numberFormat(currentPrice, 2)}`, true)
			.addField("\u200B", "\u200B", true)
			.addField("Closing Price", `$${numberFormat(closePrice, 2)}`, true)
			.addField("Low of Day", `$${numberFormat(lowPrice, 2)} (${(lowChange >= 0 ? '+' : '')}${numberFormat(lowChange, 2)}%)`, true)
			.addField("\u200B", "\u200B", true)
			.addField("High of Day", `$${numberFormat(highPrice, 2)} (${(highChange >= 0 ? '+' : '')}${numberFormat(highChange, 2)}%)`, true)
			.addField("52WkLow", `$${numberFormat(yrLow, 2)} (${(yrLowChange >= 0 ? '+' : '')}${numberFormat(yrLowChange, 2)}%)`, true)
			.addField("\u200B", "\u200B", true)
			.addField("52WkHigh", `$${numberFormat(yrHigh, 2)} (${(yrHighChange >= 0 ? '+' : '')}${numberFormat(yrHighChange, 2)}%)`, true);

		return message.reply({ embeds: [ embed ]});
	}

	displayTDAFundamentals(message, ticker, info) {
		if (!Object.values(info).length) {
			return message.reply(`I can't find a stock with the ${ticker} ticker!`);
		}

		let data = info[ticker];

		let {
			currentPrice, percentChange, color
		} = this.getDetails(data);

		const embed = new Discord.MessageEmbed()
			.setTitle(
				`**${data.description.replace('Common Stock', '').replace('Class A', '').replace('Common stock', '').replace(' - ', '')}\n`
				+ `${ticker}** - $${numberFormat(currentPrice, 2)} (${(percentChange >= 0 ? '+' : '')}${numberFormat(percentChange, 2)}%)`
			).setDescription(
				`**Volume**: ${numberFormat(data.totalVolume)}`
			).setColor(color);
		
		const dividendDate = new Date(data.fundamentals.dividendPayDate);
		const todayDate = new Date();

		embed.addField("Market Cap", `$${data.fundamentals.marketCap ? shortenNumber(data.fundamentals.marketCap * 1000000) : shortenNumber(data.fundamentals.sharesOutstanding * currentPrice)}`, true)
			.addField("\u200B", "\u200B", true)
			.addField("Shares Outstanding", `${numberFormat(data.fundamentals.sharesOutstanding)}`, true)
			.addField("P/E Ratio", `${data.peRatio}`, true)
			.addField("\u200B", "\u200B", true)
			.addField("EPS", `${data.fundamentals.epsTTM}`, true);

		if (dividendDate > todayDate)
		{
			embed.addField("Dividend Payout", `$${data.fundamentals.dividendPayAmount}`, true)
				.addField("\u200B", "\u200B", true)
				.addField("Dividend Pay Date", dividendDate.toLocaleDateString(), true);
		}

		return message.reply({ embeds: [ embed ] });
	}

	async displayTDAPrices(message, info) {
		let tickerNum = 1;

		const embed = new Discord.MessageEmbed()
			.setTitle('Stock Prices');
		const replacementEmbed = new Discord.MessageEmbed()
			.setTitle('Stock Prices');

		for (let ticker in info) {
			let data = info[ticker];

			let {
				currentPrice, openPrice, highPrice, lowPrice, closePrice,
				highChange, lowChange, openChange, percentChange
			} = this.getDetails(data);

			embed.addField(
				`**${data.description.replace('Common Stock', '').replace('Class A', '').replace('Common stock', '').replace(' - ', '')}\n${ticker}** - $${numberFormat(currentPrice, 2)} (${(percentChange >= 0 ? '+' : '')}${numberFormat(percentChange, 2)}%)`,
				`**Volume**: ${numberFormat(data.totalVolume)}\n`
					+ `**Open**: $${numberFormat(openPrice, 2)} (${(openChange >= 0 ? '+' : '')}${numberFormat(openChange, 2)}%)\n`
					+ `**Close**: $${numberFormat(closePrice, 2)}\n`
					+ `**Low**: $${numberFormat(lowPrice, 2)} (${(lowChange >= 0 ? '+' : '')}${numberFormat(lowChange, 2)}%)\n`
					+ `**High**: $${numberFormat(highPrice, 2)} (${(highChange >= 0 ? '+' : '')}${numberFormat(highChange, 2)}%)`,
				true
			);
	
			replacementEmbed.addField(
				`**${data.description.replace('Common Stock', '').replace('Class A', '').replace('Common stock', '').replace(' - ', '')}\n${ticker}** - $${numberFormat(currentPrice, 2)} (${(percentChange >= 0 ? '+' : '')}${numberFormat(percentChange, 2)}%)`,
				`**Volume**: ${numberFormat(data.totalVolume)}\n`,
				true
			);
	
			if (tickerNum % 2 == 1)
			{
				embed.addField("\u200B", "\u200B", true);
				replacementEmbed.addField("\u200B", "\u200B", true);
			}
	
			tickerNum++;
		}

		let msg = await message.reply({ embeds: [ embed ] });

		// Replace the original embed with a truncated embed after 30 seconds,
		// because the original embed can be quite large
		setTimeout(() => msg.edit({ embeds: [ replacementEmbed ] }), 30000);
	}

	async displayTDAMovers(message) {
		let info = await this.client.movers.getMovers({ "index": "$SPX.X", "apikey": "" });

		return this.display_TDA_Prices(message, info);
	}
}

module.exports = new TDAClient();