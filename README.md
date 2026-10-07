<div align="center">

# Aerix Ticket
### Enterprise Discord Support & Ticket Automation Suite

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Fastify](https://img.shields.io/badge/Fastify-Dashboard-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)

<br>

**Aerix Ticket** is a modern, minimal, SaaS-grade ticket management and support automation platform built specifically for Discord communities, hosting providers, and digital infrastructure services. Designed with a clean, dark-mode purple & blue aesthetic, it eliminates clutter while giving support teams powerful enterprise tooling.

</div>

---

## ⚡ Overview & Highlights

- **SaaS Helpdesk Experience**: Engineered to look and behave like a professional support desk inside Discord.
- **Role-Based Dynamic Action Buttons**: Segregated user controls and staff management actions that update in real time based on ticket lifecycle state.
- **Customizable Intake Questionnaires**: Modal forms supporting short text, paragraphs, dropdown selections, and file attachments before tickets open.
- **Full Ticket Embed Customizer**: Custom hex colors, title templates, notice banners, footer tags, and live mockup preview directly on the web dashboard.
- **Custom Chat Alert Templates**: Fine-grained template placeholders (`{creator}`, `{staff}`, `{department}`, `{number}`) for new ticket alerts and staff notifications.
- **Integrated Web Dashboard**: Lightweight, secure administrative control panel with Panel Studio, Guild Settings, Department Manager, and Bot Customizer.
- **Multi-Database Support**: Native Prisma ORM integration supporting **SQLite** (zero external setup), **MySQL**, and **PostgreSQL**.
- **High-Performance Architecture**: Fastify HTTP server, SQLite WAL mode, Keyv in-memory caching, and asynchronous interaction deferrals to eliminate timeouts.

---

## 🚀 Key Features

### 1. Modern Ticket Lifecycle Management
Tickets progress through clean, structured lifecycle states:
```
[ OPEN / ACTIVE ] ──> [ RESOLVED ] ──> [ ARCHIVED ] ──> [ DELETED ]
```
- **Active State**: Members can update their intake details, change departments, notify staff, or request ticket closure.
- **Resolved State**: Staff can mark tickets solved, lock normal user messaging, record resolver details, and initiate archiving.
- **Archived State**: Automatically moves channels to archive categories, locks read/write permissions, and prepares encrypted transcripts.
- **Protected Deletion**: Permanent deletion requires double-confirmation and transcript retention.

### 2. Role-Segregated Button System

| View | Action | Style | Functionality |
| :--- | :--- | :--- | :--- |
| **Member** | **Update Details** | Secondary (Gray) | Opens Discord modal allowing user to revise intake answers |
| **Member** | **Change Department** | Secondary (Blurple) | Dynamic select menu to transfer ticket to another department |
| **Member** | **Notify Staff** | Primary (Blue) | Alerts configured support roles with cooldown protection |
| **Member** | **Close Ticket** | Danger (Red) | Requests closure confirmation modal |
| **Staff** | **Resolve** | Success (Green) | Marks ticket resolved, records staff ID and timestamp |
| **Staff** | **Archive** | Secondary (Gray) | Locks channel, updates state, and archives ticket history |
| **Staff** | **Add Note** | Primary (Blurple) | Stores internal staff-only notes hidden from ticket creators |
| **Staff** | **Delete** | Danger (Red) | Displays safety confirmation before permanent channel purge |

### 3. Department & Panel Studio
- **Custom Ticket Placement**: Configure target Discord channel category folders individually per department.
- **Support Role Assignment**: Restrict viewing, claiming, and management privileges to dedicated staff roles per department.
- **Embed Customizer with Live Preview**:
  - Primary / Accent Color picker + HEX input
  - Custom title format with dynamic placeholders
  - High-contrast Markdown Support Notice quote block
  - Custom footer branding
  - Banner header/footer image support
  - Real-time Discord mockup card preview in the dashboard
- **Custom Chat Alerts**:
  - Customize ticket opening alert (e.g. `{staff} {creator} has opened a new ticket in {department}!`)
  - Customize "Notify Staff" in-channel mention alert
  - Automatic fallback to department staff roles when ping roles are omitted

### 4. Enterprise Administrative Dashboard
- **Web Address**: Built-in Fastify server running on port `8169`.
- **Passkey Authentication**: Secure admin secret access (`x-admin-secret` matching `DISCORD_SECRET`).
- **Bot Customizer Suite**: Real-time Discord bot username, About Me bio, avatar, and rotating activity status manager.
- **Analytics & SLA Stats**: Response time tracking, resolution metrics, customer satisfaction ratings, and ticket counters.

---

## 🛠️ Prerequisites

Before installing Aerix Ticket, ensure you have:

1. **Node.js**: Version **18.0.0** or higher (Node 20+ or 24 LTS recommended).
2. **Package Manager**: `npm` (bundled with Node.js).
3. **Discord Bot Application**:
   - Create an application on the [Discord Developer Portal](https://discord.com/developers/applications).
   - Under the **Bot** tab, enable the following **Privileged Gateway Intents**:
     - ✅ **Server Members Intent** (`GUILD_MEMBERS`)
     - ✅ **Message Content Intent** (`MESSAGE_CONTENT`)
   - Copy your **Bot Token** and **Client Secret**.
4. **Discord Bot Invite**:
   - Invite your bot with `Administrator` or permissions for `Manage Channels`, `Manage Roles`, `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`.

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Bihariaayu/aerix-ticket-bot.git
cd aerix-ticket-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

Open `.env` in your preferred editor (`nano .env`) and update the required values:

```env
# Discord Credentials
DISCORD_TOKEN="YOUR_BOT_TOKEN_HERE"
DISCORD_SECRET="YOUR_CLIENT_SECRET_HERE"

# Database Configuration (Default: SQLite file)
DB_PROVIDER="sqlite"
DB_CONNECTION_URL="file:./database.db"

# Data Encryption Key (Generate a 48-char hex key with: npm run keygen)
ENCRYPTION_KEY="YOUR_GENERATED_48_HEX_KEY"

# Web Dashboard Port & Host
HTTP_HOST="0.0.0.0"
HTTP_PORT="8169"
HTTP_EXTERNAL="http://YOUR_SERVER_IP:8169"
HTTP_INTERNAL="http://127.0.0.1:8169"

# Super Administrator Discord User ID
SUPER="YOUR_DISCORD_USER_ID"
PUBLISH_COMMANDS="true"
```

> **Tip**: Generate a secure 48-character encryption key by running:
> ```bash
> npm run keygen
> ```

### 4. Initialize Database & Migrations
Run the automated schema preparation:
```bash
npm run postinstall
```
*For manual Prisma synchronization:*
```bash
npx prisma db push
```

### 5. Start the Application

#### Option A: Direct Execution (Development)
```bash
npm start
```

#### Option B: PM2 Process Manager (Recommended for Production)
```bash
npm install -g pm2
pm2 start src/index.js --name "aerix-tickets"
pm2 save
pm2 startup
```

---

## 🖥️ Web Dashboard Access

1. Open your browser and navigate to:
   ```
   http://YOUR_SERVER_IP:8169/
   ```
2. Click **Admin Login** or enter your `DISCORD_SECRET` when prompted for the **Staff Passkey**.
3. Select your Discord server to configure departments, design ticket panels, customize chat alerts, and view tickets.

---

## 📋 Slash Commands Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `/new` | `/new [department]` | Directly open a ticket in a specific department |
| `/panel` | `/panel create` | Deploy an interactive ticket dispatch panel to a channel |
| `/close` | `/close [reason]` | Close the current ticket session |
| `/force-close` | `/force-close` | Force-close a ticket bypassing member confirmations |
| `/rename` | `/rename <name>` | Rename the ticket channel |
| `/move` | `/move <department>` | Transfer the ticket to another department |
| `/claim` | `/claim` | Claim exclusive handling of the ticket |
| `/release` | `/release` | Release claimed ticket back to staff queue |
| `/transfer` | `/transfer <user>` | Transfer ticket ownership to another member |
| `/tag` | `/tag <name>` | Send a pre-configured canned support response |
| `/transcript` | `/transcript` | Generate and export a full transcript of the ticket |
| `/topic` | `/topic <topic>` | Update the ticket discussion topic |
| `/help` | `/help` | View full command reference and system documentation |

---

## 🗄️ Database Architecture & Migrations

Aerix Ticket uses **Prisma ORM** with multi-provider schemas:

- `prisma/schema.prisma` - Active schema deployed on the system.
- `db/sqlite/schema.prisma` - SQLite production schema.
- `db/mysql/schema.prisma` - MySQL enterprise schema.
- `db/postgresql/schema.prisma` - PostgreSQL enterprise schema.

To switch databases, update `DB_PROVIDER` and `DB_CONNECTION_URL` in `.env`, then run:
```bash
node scripts/postinstall.js
```

---

## 🔒 Security & Performance

- **Zero-Emoji Compliance**: Strict enterprise aesthetic without clutter or decorative emojis across buttons, embeds, and dialogs.
- **Asynchronous Interaction Handling**: All interactions defer within **50ms**, preventing Discord's 3-second `10062 Unknown interaction` timeouts.
- **AES-256 Intake Data Encryption**: All custom question answers and intake form submissions are encrypted at rest using your `ENCRYPTION_KEY`.
- **Granular Permissions**: Separate permission pipelines for ticket creators, department support roles, ticket managers, and server administrators.

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0-or-later). See the [LICENSE](LICENSE) file for complete details.

---

<div align="center">
<sub>Engineered with precision by the <b>Aerix Team</b> · Enterprise Discord Solutions</sub>
</div>
