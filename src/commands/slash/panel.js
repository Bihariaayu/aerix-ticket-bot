const { SlashCommand } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	MessageFlags,
	PermissionsBitField,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');

module.exports = class PanelSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'panel';
		super(client, {
			...options,
			description: 'Send a ticket creation panel into a channel',
			dmPermission: false,
			name,
			options: [
				{
					channelTypes: [ChannelType.GuildText],
					description: 'The channel to send the ticket panel into',
					name: 'channel',
					required: false,
					type: ApplicationCommandOptionType.Channel,
				},
				{
					description: 'Custom title for the ticket panel',
					name: 'title',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
				{
					description: 'Custom description for the ticket panel',
					name: 'description',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			],
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
						.setDescription('Only server administrators and staff can deploy ticket panels.'),
				],
			});
		}

		const targetChannel =
			interaction.options.getChannel?.('channel', false) ||
			interaction.channel ||
			interaction.message?.channel;

		if (!targetChannel || typeof targetChannel.send !== 'function') {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
						.setColor(0xdc2626)
						.setTitle('DEPLOYMENT FAILED')
						.setDescription('Unable to locate a valid text channel to deploy the ticket panel.'),
				],
			});
		}

		let settings = await client.prisma.guild.findUnique({
			include: { categories: true },
			where: { id: interaction.guild.id },
		});

		if (!settings || settings.categories.length === 0) {
			let discordCat = interaction.guild.channels.cache.find(c => c.type === 4 && /ticket/i.test(c.name));
			if (!discordCat) {
				try {
					discordCat = await interaction.guild.channels.create({
						name: 'TICKETS',
						type: ChannelType.GuildCategory,
					});
				} catch {
					discordCat = { id: targetChannel.parentId || targetChannel.id };
				}
			}

			const defaultCategory = await client.prisma.category.create({
				data: {
					channelName: 'ticket-{number}',
					claiming: false,
					description: 'General support and inquiries',
					discordCategory: String(discordCat.id),
					emoji: '',
					guildId: interaction.guild.id,
					name: 'General Support',
					openingMessage: 'Thank you for reaching out to Aerix Support. A staff member will assist you shortly.',
					pingRoles: '[]',
					requiredRoles: '[]',
					staffRoles: '[]',
				},
			});

			settings = await client.prisma.guild.findUnique({
				include: { categories: true },
				where: { id: interaction.guild.id },
			});
		}

		const customTitle = interaction.options.getString?.('title', false) || 'SUPPORT DISPATCH';
		const customDesc =
			interaction.options.getString?.('description', false) ||
			'Need assistance or wish to submit an inquiry? Select an action below to open a private support ticket with our team.';

		const headerBox =
			'```prolog\n' +
			'┌── SUPPORT DISPATCH ─────────────────────────┐\n' +
			'│ AERIX TICKETS AUTOMATION SYSTEM             │\n' +
			'└──────────────────────────────────────────────┘\n' +
			'```';

		const panelEmbed = new ExtendedEmbedBuilder({
			iconURL: interaction.guild.iconURL(),
			text: settings.footer || 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH',
		})
			.setColor(settings.primaryColour || 0x6d28d9)
			.setTitle(customTitle.toUpperCase())
			.setDescription(`${headerBox}\n${customDesc}`);

		const rows = [];

		if (settings.categories.length === 1) {
			const cat = settings.categories[0];
			rows.push(
				new ActionRowBuilder().setComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'create', target: cat.id }))
						.setLabel('CREATE TICKET')
						.setStyle(ButtonStyle.Success),
				),
			);
		} else {
			rows.push(
				new ActionRowBuilder().setComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify({ action: 'create' }))
						.setPlaceholder('SELECT TICKET CATEGORY')
						.setOptions(
							settings.categories.map(c =>
								new StringSelectMenuOptionBuilder()
									.setLabel(c.name)
									.setDescription(c.description || 'Open a ticket in this department')
									.setValue(String(c.id)),
							),
						),
				),
			);
		}

		await targetChannel.send({
			components: rows,
			embeds: [panelEmbed],
		});

		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
					.setColor(0x6d28d9)
					.setTitle('PANEL DEPLOYED')
					.setDescription(`Successfully sent the ticket creation panel to <#${targetChannel.id}>.`),
			],
		});
	}
};
