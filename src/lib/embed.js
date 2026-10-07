const { EmbedBuilder } = require('discord.js');
const { THEME_HEX, stripEmojis, toSmallCaps } = require('./aerixTheme');

module.exports = class ExtendedEmbedBuilder extends EmbedBuilder {
	constructor(footer, opts) {
		super(opts);
		this.setColor(THEME_HEX);

		if (footer && footer.text) {
			const clean = stripEmojis(footer.text);
			this.setFooter({
				iconURL: footer.iconURL,
				text: clean.includes('eartharoid') || clean.includes('Discord Tickets')
					? 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH'
					: clean || 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH',
			});
		} else {
			this.setFooter({ text: 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH' });
		}
	}

	setTitle(title) {
		if (!title) return this;
		return super.setTitle(stripEmojis(title));
	}

	setDescription(description) {
		if (!description) return this;
		return super.setDescription(stripEmojis(description));
	}

	setColor(color) {
		if (!color || color === '#009999' || color === 'Default') {
			return super.setColor(THEME_HEX);
		}
		return super.setColor(color);
	}
};