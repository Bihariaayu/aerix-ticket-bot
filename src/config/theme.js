/**
 * Aerix Ticket - Modern SaaS Helpdesk Theme Configuration
 * Style: Modern, minimal, premium dark helpdesk
 */

module.exports = {
	brand: {
		name: 'Aerix Ticket',
		company: 'Aerix Cloud',
		footerText: 'AERIX TICKETS INFRASTRUCTURE\nFast • Reliable • Always Here',
		shortFooter: 'AERIX TICKETS INFRASTRUCTURE · Fast • Reliable • Always Here',
	},
	colors: {
		primary: '#6D28D9',    // Deep Royal Purple
		secondary: '#2563EB',  // Royal Blue
		accent: '#3B82F6',     // Electric Blue
		success: '#10B981',    // Emerald Green (Resolved)
		warning: '#F59E0B',    // Amber
		danger: '#EF4444',     // Crimson Red (Close / Delete)
		archived: '#475569',   // Slate Gray (Archived)
		dark: '#0F172A',       // Obsidian
	},
	status: {
		OPEN: 'Active',
		ACTIVE: 'Active',
		RESOLVED: 'Resolved',
		ARCHIVED: 'Archived',
		CLOSED: 'Closed',
	},
};
