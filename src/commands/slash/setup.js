const { SlashCommand } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	MessageFlags,
	PermissionsBitField,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');

module.exports = class SetupSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'setup';
		super(client, {
			...options,
			description: 'Automatically set up ticket categories, channels, and panel',
			dmPermission: false,
			name,
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const isAuthorized =
			interaction.member.permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
			interaction.member.permissions?.has(PermissionsBitField.Flags.Administrator) ||
			(await isStaff(interaction.guild, interaction.user.id));

		if (!isAuthorized) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
						.setColor(0xdc2626)
						.setTitle('PERMISSION DENIED')
						.setDescription('Only server administrators and staff can run automated setup.'),
				],
			});
		}

		// 1. Find or create Discord Category
		let discordCat = interaction.guild.channels.cache.find(
			c => c.type === ChannelType.GuildCategory && /ticket/i.test(c.name),
		);
		if (!discordCat) {
			discordCat = await interaction.guild.channels.create({
				name: 'TICKETS',
				type: ChannelType.GuildCategory,
			});
		}

		// 2. Find or create #create-ticket or #support channel
		let panelChannel = interaction.guild.channels.cache.find(
			c => c.type === ChannelType.GuildText && /ticket|support/i.test(c.name),
		);
		if (!panelChannel) {
			panelChannel = await interaction.guild.channels.create({
				name: 'support',
				parent: discordCat.id,
				type: ChannelType.GuildText,
			});
		}

		// 3. Upsert Guild & Category in Prisma
		await client.prisma.guild.upsert({
			create: {
				id: interaction.guild.id,
				locale: 'en-GB',
				prefix: 't?',
			},
			update: {},
			where: { id: interaction.guild.id },
		});

		let category = await client.prisma.category.findFirst({
			where: { guildId: interaction.guild.id },
		});

		if (!category) {
			category = await client.prisma.category.create({
				data: {
					channelName: 'ticket-{number}',
					claiming: false,
					description: 'General support inquiries and assistance',
					discordCategory: String(discordCat.id),
					emoji: '',
					guildId: interaction.guild.id,
					name: 'General Support',
					openingMessage: 'Thank you for contacting Aerix Support. A staff member will assist you shortly.',
					pingRoles: '[]',
					requiredRoles: '[]',
					staffRoles: '[]',
				},
			});
		}

		// 4. Send Panel to panelChannel
		const headerBox =
			'```prolog\n' +
			'┌── SUPPORT DISPATCH ─────────────────────────┐\n' +
			'│ AERIX TICKETS AUTOMATION SYSTEM             │\n' +
			'└──────────────────────────────────────────────┘\n' +
			'```';

		const panelEmbed = new ExtendedEmbedBuilder({
			iconURL: interaction.guild.iconURL(),
			text: 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH',
		})
			.setColor(0x6d28d9)
			.setTitle('SUPPORT DISPATCH')
			.setDescription(
				`${headerBox}\n` +
				'Need assistance or wish to submit an inquiry? Click the button below to open a private support ticket with our staff.',
			);

		await panelChannel.send({
			components: [
				new ActionRowBuilder().setComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'create', target: category.id }))
						.setLabel('CREATE TICKET')
						.setStyle(ButtonStyle.Success),
				),
			],
			embeds: [panelEmbed],
		});

		const successBox =
			'```prolog\n' +
			'┌── SYSTEM INITIALIZED ───────────────────────┐\n' +
			'│ STATUS: COMPLETE                            │\n' +
			'│ CATEGORY: GENERAL SUPPORT                   │\n' +
			'│ DISPATCH CHANNEL: READY                     │\n' +
			'└──────────────────────────────────────────────┘\n' +
			'```';

		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
					.setColor(0x6d28d9)
					.setTitle('SETUP COMPLETE')
					.setDescription(
						`${successBox}\n` +
						`**Aerix Tickets** has been configured for **${interaction.guild.name}**.\n` +
						`> Category Channel: **${discordCat.name}**\n` +
						`> Panel Channel: <#${panelChannel.id}>\n` +
						`> Default Prefix: \`t?\` (Use \`/prefix set\` to change)\n\n` +
						`Members can now create tickets using <#${panelChannel.id}>, \`/new\`, or \`t?new\`!`,
					),
			],
		});
	}
};
