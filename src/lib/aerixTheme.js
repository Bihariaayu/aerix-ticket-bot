const { ButtonBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const THEME_PURPLE = 0x6d28d9; // Royal Purple (#6D28D9)
const THEME_HEX = '#6D28D9';

const smallCapsMap = {
	a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
	j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
	s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

function toSmallCaps(text) {
	if (!text) return '';
	return text.toLowerCase().split('').map((c) => smallCapsMap[c] || c).join('');
}

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

function stripEmojis(str) {
	if (typeof str !== 'string') return str;
	return str.replace(EMOJI_REGEX, '').replace(/\s+/g, ' ').trim();
}

function createPrologBox(title, contentLines = []) {
	const smallTitle = toSmallCaps(title);
	let box = '```prolog\n';
	box += `┌── ${smallTitle} ${'─'.repeat(Math.max(2, 44 - smallTitle.length - 5))}┐\n`;
	for (const line of contentLines) {
		box += `│ ${line}\n`;
	}
	box += '└──────────────────────────────────────────────┘\n```';
	return box;
}

// Global Discord UI Enforcement: Strictly ZERO Emojis
ButtonBuilder.prototype.setEmoji = function () {
	// Enforce no-emoji aesthetic
	return this;
};

StringSelectMenuOptionBuilder.prototype.setEmoji = function () {
	// Enforce no-emoji aesthetic
	return this;
};

module.exports = {
	THEME_PURPLE,
	THEME_HEX,
	toSmallCaps,
	stripEmojis,
	createPrologBox,
};
