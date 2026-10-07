const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const ExtendedEmbedBuilder = require('./embed');

/**
 * Adapter that provides a ChatInputCommandInteraction-like interface for regular text Messages
 */
class MessageInteractionAdapter {
	constructor(message, commandName, args, client) {
		this.message = message;
		this.client = client;
		this.commandName = commandName;
		this.args = args;
		this.guild = message.guild;
		this.guildId = message.guild.id;
		this.channel = message.channel;
		this.member = message.member;
		this.user = message.author;
		this.replyMessage = null;
		this.deferred = false;
		this.replied = false;
	}

	inGuild() {
		return true;
	}

	get options() {
		return {
			getChannel: (name, required = false) => {
				return this.message.mentions.channels.first() || this.channel;
			},
			getInteger: (name, required = false) => {
				const num = parseInt(this.args[0], 10);
				return isNaN(num) ? (required ? null : null) : num;
			},
			getMember: (name, required = false) => {
				const mention = this.message.mentions.members.first();
				if (mention) return mention;
				const idArg = this.args[0];
				if (idArg && /^\d{17,20}$/.test(idArg)) {
					return this.guild.members.cache.get(idArg) || null;
				}
				return null;
			},
			getRole: (name, required = false) => {
				return this.message.mentions.roles.first() || null;
			},
			getString: (name, required = false) => {
				if (this.commandName === 'prefix') {
					if (name === 'prefix') return this.args[1] || this.args[0] || (required ? null : null);
				}
				if (name === 'references') {
					return this.args[0] || (required ? null : null);
				}
				if (name === 'reason') {
					return this.args.join(' ') || (required ? null : null);
				}
				if (name === 'name' || name === 'topic') {
					return this.args.join(' ') || (required ? null : null);
				}
				if (name === 'tag') {
					return this.args[0] || (required ? null : null);
				}
				if (name === 'priority') {
					return this.args[0]?.toUpperCase() || (required ? null : null);
				}
				return this.args.join(' ') || (required ? null : null);
			},
			getSubcommand: (required = true) => {
				const sub = this.args[0]?.toLowerCase();
				if (sub === 'set' || sub === 'reset' || sub === 'view') {
					return sub;
				}
				return required ? 'view' : null;
			},
			getUser: (name, required = false) => {
				const mention = this.message.mentions.users.first();
				if (mention) return mention;
				const idArg = this.args[0];
				if (idArg && /^\d{17,20}$/.test(idArg)) {
					return this.client.users.cache.get(idArg) || null;
				}
				return null;
			},
		};
	}

	async deferReply(opts = {}) {
		this.deferred = true;
		return true;
	}

	async reply(payload) {
		this.replied = true;
		const cleanPayload = this._cleanPayload(payload);
		if (this.replyMessage) {
			return await this.replyMessage.edit(cleanPayload);
		}
		this.replyMessage = await this.message.reply(cleanPayload);
		return this.replyMessage;
	}

	async editReply(payload) {
		const cleanPayload = this._cleanPayload(payload);
		if (this.replyMessage) {
			return await this.replyMessage.edit(cleanPayload);
		}
		this.replyMessage = await this.message.reply(cleanPayload);
		return this.replyMessage;
	}

	async followUp(payload) {
		const cleanPayload = this._cleanPayload(payload);
		return await this.channel.send(cleanPayload);
	}

	async showModal(modal) {
		const title = modal.data?.title || 'OPEN FORM';
		const customId = modal.data?.custom_id || 'modal_form';
		return await this.message.reply({
			components: [
				new ActionRowBuilder().setComponents(
					new ButtonBuilder()
						.setCustomId(customId)
						.setLabel(title)
						.setStyle(ButtonStyle.Primary),
				),
			],
			content: 'Click the button below to complete this action:',
		});
	}

	_cleanPayload(payload) {
		if (typeof payload === 'string') {
			return { content: payload };
		}
		const p = { ...payload };
		delete p.flags;
		return p;
	}
}

/**
 * Retrieve the current prefix for a guild
 * @param {import('../client')} client
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getGuildPrefix(client, guildId) {
	if (!guildId) return 't?';
	const cacheKey = `cache/guild-prefix:${guildId}`;
	const cached = await client.keyv.get(cacheKey);
	if (cached) return cached;

	try {
		const guildData = await client.prisma.guild.findUnique({
			select: { prefix: true },
			where: { id: guildId },
		});

		const prefix = guildData?.prefix || 't?';
		await client.keyv.set(cacheKey, prefix, 3600000);
		return prefix;
	} catch {
		return 't?';
	}
}

/**
 * Process a message to check and execute any prefix commands
 * @param {import('../client')} client
 * @param {import('discord.js').Message} message
 * @returns {Promise<boolean>}
 */
async function handlePrefixCommand(client, message) {
	if (message.author.bot || !message.guild) return false;

	const guildPrefix = await getGuildPrefix(client, message.guild.id);
	const content = message.content.trim();

	let usedPrefix = null;
	const botId = client.user?.id;
	const botMention = botId ? `<@${botId}>` : null;
	const botMentionNick = botId ? `<@!${botId}>` : null;

	if (content.startsWith(guildPrefix)) {
		usedPrefix = guildPrefix;
	} else if (botMention && content.startsWith(botMention)) {
		usedPrefix = botMention;
	} else if (botMentionNick && content.startsWith(botMentionNick)) {
		usedPrefix = botMentionNick;
	} else {
		return false;
	}

	const rawArgs = content.slice(usedPrefix.length).trim().split(/\s+/);
	const commandTrigger = rawArgs.shift()?.toLowerCase();

	if (!commandTrigger) {
		await message.reply({
			embeds: [
				new ExtendedEmbedBuilder({ iconURL: message.guild.iconURL() })
					.setColor(0x6d28d9)
					.setTitle('AERIX TICKETS INFRASTRUCTURE')
					.setDescription(
						'```prolog\n' +
						'┌── SYSTEM STATUS ────────────────────────────┐\n' +
						'│ PLATFORM: AERIX TICKETS                     │\n' +
						`│ ACTIVE PREFIX: ${guildPrefix.padEnd(29, ' ')}│\n` +
						'└──────────────────────────────────────────────┘\n' +
						'```\n' +
						`The active command prefix for this server is \`${guildPrefix}\`.\n` +
						`Use \`${guildPrefix}help\` or \`/help\` to inspect available commands.`
					),
			],
		});
		return true;
	}

	const commandAliases = {
		add: 'add',
		claim: 'claim',
		close: 'close',
		create: 'new',
		delete: 'close',
		forceclose: 'force-close',
		'force-close': 'force-close',
		help: 'help',
		move: 'move',
		new: 'new',
		open: 'new',
		panel: 'panel',
		prefix: 'prefix',
		priority: 'priority',
		release: 'release',
		remove: 'remove',
		rename: 'rename',
		setup: 'setup',
		tag: 'tag',
		ticket: 'tickets',
		tickets: 'tickets',
		topic: 'topic',
		transcript: 'transcript',
		transfer: 'transfer',
		unclaim: 'release',
	};

	const resolvedCommandName = commandAliases[commandTrigger];
	if (!resolvedCommandName) return false;

	const slashCommand =
		client.commands.commands?.slash?.get(resolvedCommandName) ||
		client.commands.components.find(c => c.name === resolvedCommandName) ||
		client.commands.components.get(`1:${resolvedCommandName}`);

	if (!slashCommand) return false;

	client.log.info.commands(`User ${message.author.tag} (${message.author.id}) used prefix command "${resolvedCommandName}" in #${message.channel?.name || message.channel?.id || 'unknown'}`);

	const adapter = new MessageInteractionAdapter(message, resolvedCommandName, rawArgs, client);

	try {
		await slashCommand.run(adapter);
		return true;
	} catch (err) {
		client.log.error(`Error executing prefix command ${resolvedCommandName}:`, err);
		await message.reply({
			embeds: [
				new ExtendedEmbedBuilder({ iconURL: message.guild.iconURL() })
					.setColor(0xdc2626)
					.setTitle('COMMAND ERROR')
					.setDescription(`An error occurred while executing the command: \`${err.message || 'Unknown error'}\``),
			],
		}).catch(() => {});
		return true;
	}
}

module.exports = {
	getGuildPrefix,
	handlePrefixCommand,
	MessageInteractionAdapter,
};
