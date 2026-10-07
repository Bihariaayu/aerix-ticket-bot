module.exports = function renderDashboard(req, res, client) {
	res.header('Content-Type', 'text/html; charset=utf-8');
	return res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aerix Tickets · Enterprise Support Suite</title>
  <link rel="icon" href="/favicon.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f5f3ff',
              100: '#ede9fe',
              200: '#ddd6fe',
              300: '#c4b5fd',
              400: '#a78bfa',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
              950: '#2e1065',
            },
            discord: {
              dark: '#1e1f22',
              darker: '#111214',
              card: '#2b2d31',
              carddark: '#232428',
              blurple: '#5865F2',
              green: '#23a55a',
              yellow: '#f0b232',
              red: '#f23f43',
              gray: '#80848e',
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    .status-dot-online { background-color: #23a55a; }
    .status-dot-idle { background-color: #f0b232; }
    .status-dot-dnd { background-color: #f23f43; }
    .status-dot-invisible { background-color: #80848e; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-brand-600 selection:text-white">

  <!-- Main Navigation Header -->
  <header class="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand & Version -->
      <div class="flex items-center space-x-6">
        <a href="javascript:void(0)" onclick="navigateTo('servers')" class="flex items-center space-x-3">
          <img src="/assets/wordmark-dark.png" alt="Aerix Tickets" class="h-8">
        </a>
        <div class="hidden md:flex items-center space-x-2 text-[11px] font-semibold tracking-wider uppercase text-brand-300 bg-brand-950/70 border border-brand-700/50 px-2.5 py-1 rounded-full">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>Engine v4.2</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden lg:flex items-center space-x-1">
        <button onclick="navigateTo('servers')" id="nav-btn-servers" class="nav-tab px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-server text-brand-400"></i>
          <span>Servers</span>
        </button>
        <button onclick="navigateTo('bot')" id="nav-btn-bot" class="nav-tab px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-robot text-purple-400"></i>
          <span>Bot Customizer</span>
        </button>
        <button onclick="navigateTo('docs')" id="nav-btn-docs" class="nav-tab px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-book-open text-blue-400"></i>
          <span>Commands</span>
        </button>
      </nav>

      <!-- Right Header Actions & User Profile -->
      <div class="flex items-center space-x-4">
        <div id="headerPing" class="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 font-mono">
          <span class="w-2 h-2 rounded-full bg-green-400"></span>
          <span id="pingVal">0ms</span>
        </div>

        <div id="userProfileSection" class="flex items-center space-x-3">
          <a href="/auth/login" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-lg shadow-brand-950/40">
            <i class="fa-brands fa-discord"></i>
            <span>Login with Discord</span>
          </a>
        </div>
      </div>

    </div>
  </header>

  <!-- Notification Toasts Container -->
  <div id="toastContainer" class="fixed top-20 right-6 z-50 flex flex-col space-y-2.5 pointer-events-none"></div>

  <!-- Main View Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

    <!-- Loading State -->
    <div id="globalLoading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-slate-400 font-medium">Initializing Aerix Tickets suite...</p>
    </div>

    <!-- VIEW 1: Servers & Global Overview -->
    <div id="view-servers" class="view-panel hidden space-y-8">
      
      <!-- Enterprise Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 border border-brand-800/40 p-8 shadow-2xl">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-900/60 border border-brand-700/60 text-brand-300 text-xs font-semibold">
              <i class="fa-solid fa-shield-halved"></i>
              <span>Aerix Tickets · Enterprise Discord Suite</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Discord Support & Automation Console</h1>
            <p class="text-slate-400 text-sm max-w-2xl">High-performance ticket dispatching, customizable interactive panels, department categorization, and live bot presence controls.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="navigateTo('bot')" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-700 to-purple-600 hover:from-brand-600 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-brand-900/40 transition flex items-center space-x-2">
              <i class="fa-solid fa-paintbrush"></i>
              <span>Customize Bot Profile</span>
            </button>
            <button onclick="navigateTo('docs')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center space-x-2">
              <i class="fa-solid fa-terminal"></i>
              <span>Command Manual</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Live Metrics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-1.5 shadow">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Servers Active</span>
            <i class="fa-solid fa-server text-brand-400"></i>
          </div>
          <div id="statGuilds" class="text-2xl font-bold text-white">0</div>
          <div class="text-[11px] text-slate-500">Connected Discord guilds</div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-1.5 shadow">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Tickets Managed</span>
            <i class="fa-solid fa-ticket text-purple-400"></i>
          </div>
          <div id="statTickets" class="text-2xl font-bold text-white">0</div>
          <div class="text-[11px] text-slate-500">Total tickets processed</div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-1.5 shadow">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Avg Response</span>
            <i class="fa-solid fa-stopwatch text-emerald-400"></i>
          </div>
          <div id="statResponseTime" class="text-2xl font-bold text-emerald-400">0s</div>
          <div class="text-[11px] text-slate-500">First staff response velocity</div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-1.5 shadow">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Support Rating</span>
            <i class="fa-solid fa-star text-amber-400"></i>
          </div>
          <div id="statRating" class="text-2xl font-bold text-amber-400">5.0 / 5</div>
          <div class="text-[11px] text-slate-500">Member satisfaction score</div>
        </div>
      </div>

      <!-- Servers Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Your Discord Servers</h2>
            <p class="text-xs text-slate-400">Select a server to manage ticket departments, panels, and staff permissions.</p>
          </div>
        </div>

        <div id="guildsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>

    <!-- VIEW 2: Server Workspace (when a guild is selected) -->
    <div id="view-guild" class="view-panel hidden space-y-6">
      
      <!-- Server Hero Header -->
      <div class="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div class="flex items-center space-x-4">
          <button onclick="navigateTo('servers')" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700" title="Back to servers">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <img id="currentGuildIcon" src="/favicon.png" alt="Guild Logo" class="w-14 h-14 rounded-2xl object-cover border-2 border-brand-700 bg-slate-800">
          <div>
            <div class="flex items-center space-x-2">
              <h1 id="currentGuildName" class="text-2xl font-bold text-white">Loading Server...</h1>
              <span id="currentGuildBadge" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-900/60 text-brand-300 border border-brand-700/60">Administrator</span>
            </div>
            <p id="currentGuildId" class="text-xs text-slate-400 font-mono mt-0.5">ID: 000000000000000000</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button onclick="deployPanelQuick()" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition flex items-center space-x-2 shadow">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Deploy Ticket Panel</span>
          </button>
        </div>
      </div>

      <!-- Guild Workspace Tabs -->
      <div class="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button onclick="switchGuildTab('overview')" id="tab-btn-overview" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-300 bg-brand-950/60 border border-brand-700/50 flex items-center space-x-2">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Overview</span>
        </button>
        <button onclick="switchGuildTab('categories')" id="tab-btn-categories" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-folder-tree"></i>
          <span>Departments</span>
        </button>
        <button onclick="switchGuildTab('panels')" id="tab-btn-panels" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-layer-group"></i>
          <span>Ticket Panels</span>
        </button>
        <button onclick="switchGuildTab('tickets')" id="tab-btn-tickets" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-ticket"></i>
          <span>Tickets Log</span>
        </button>
        <button onclick="switchGuildTab('tags')" id="tab-btn-tags" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-tags"></i>
          <span>Canned Tags</span>
        </button>
        <button onclick="switchGuildTab('settings')" id="tab-btn-settings" class="guild-tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2">
          <i class="fa-solid fa-gear"></i>
          <span>Configuration</span>
        </button>
      </div>

      <!-- Guild Tab 1: Overview -->
      <div id="guild-tab-overview" class="guild-tab-content space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Server Tickets</span>
            <div id="guildStatTickets" class="text-3xl font-bold text-white">0</div>
            <p class="text-xs text-slate-500">Processed in this server</p>
          </div>
          <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Velocity</span>
            <div id="guildStatResponse" class="text-3xl font-bold text-emerald-400">0s</div>
            <p class="text-xs text-slate-500">Average first staff response</p>
          </div>
          <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department Count</span>
            <div id="guildStatCategories" class="text-3xl font-bold text-purple-400">0</div>
            <p class="text-xs text-slate-500">Configured ticket categories</p>
          </div>
        </div>

        <!-- Quick Deploy Panel Helper -->
        <div class="bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 rounded-2xl border border-brand-800/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-base font-bold text-white flex items-center space-x-2">
              <i class="fa-solid fa-bullhorn text-brand-400"></i>
              <span>Deploy Ticket Panel in Discord</span>
            </h3>
            <p class="text-xs text-slate-300">Design an interactive panel with buttons and dropdowns, then deploy it directly to any server channel.</p>
          </div>
          <button onclick="switchGuildTab('panels')" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-xs font-semibold text-white transition flex items-center space-x-1.5 shadow">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>Open Panel Studio</span>
          </button>
        </div>
      </div>

      <!-- Guild Tab 2: Categories -->
      <div id="guild-tab-categories" class="guild-tab-content hidden space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">Support Departments</h3>
            <p class="text-xs text-slate-400">Configure ticket departments members can choose when opening a support ticket.</p>
          </div>
          <button onclick="openCreateCategoryModal()" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-xs font-semibold text-white transition flex items-center space-x-1.5 shadow">
            <i class="fa-solid fa-plus"></i>
            <span>Add Department</span>
          </button>
        </div>

        <div id="categoriesList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Guild Tab 3: Ticket Panels Studio -->
      <div id="guild-tab-panels" class="guild-tab-content hidden space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center space-x-2">
              <i class="fa-solid fa-layer-group text-brand-400"></i>
              <span>Ticket Panels Studio</span>
            </h3>
            <p class="text-xs text-slate-400">Design, customize, and deploy interactive ticket creation embeds directly into any Discord channel.</p>
          </div>
          <button onclick="submitDeployPanel()" id="btnDeployPanelTop" class="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition flex items-center space-x-2 shadow">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Deploy Panel to Discord</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left Controls Column (7 Cols) -->
          <div class="lg:col-span-7 space-y-5">
            <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-lg">
              <div class="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <div class="w-8 h-8 rounded-lg bg-brand-900/80 text-brand-300 flex items-center justify-center text-sm font-bold">
                  <i class="fa-solid fa-sliders"></i>
                </div>
                <h4 class="text-sm font-bold text-white">Panel Settings & Target</h4>
              </div>

              <!-- Target Discord Channel -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Target Discord Channel</label>
                <div class="flex space-x-2">
                  <select id="panelChannelSelect" class="flex-1 text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
                    <option value="">Loading server channels...</option>
                  </select>
                  <button type="button" onclick="loadGuildChannels()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition" title="Refresh channels">
                    <i class="fa-solid fa-arrows-rotate"></i>
                  </button>
                </div>
                <p class="text-[11px] text-slate-500">Select where Aerix Tickets should post the interactive embed.</p>
              </div>

              <!-- Panel Title -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Panel Title</label>
                <input type="text" id="panelTitleInput" value="Aerix Tickets · Enterprise Support" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition" oninput="updatePanelPreview()">
              </div>

              <!-- Panel Description -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Panel Message Body (Description)</label>
                <textarea id="panelDescInput" rows="3" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition" oninput="updatePanelPreview()">Welcome to the support center. Please select an appropriate department below to open a private ticket with our staff team.</textarea>
              </div>

              <!-- Component Style -->
              <div class="space-y-2">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Component Layout</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label class="panel-type-option cursor-pointer flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                    <input type="radio" name="panelType" value="BUTTON" checked class="text-brand-500" onchange="updatePanelPreview()">
                    <span class="text-xs font-semibold text-slate-200">Buttons</span>
                  </label>
                  <label class="panel-type-option cursor-pointer flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                    <input type="radio" name="panelType" value="MENU" class="text-brand-500" onchange="updatePanelPreview()">
                    <span class="text-xs font-semibold text-slate-200">Select Menu</span>
                  </label>
                  <label class="panel-type-option cursor-pointer flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                    <input type="radio" name="panelType" value="MESSAGE" class="text-brand-500" onchange="updatePanelPreview()">
                    <span class="text-xs font-semibold text-slate-200">Embed Only</span>
                  </label>
                </div>
              </div>

              <!-- Attached Departments -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Departments Attached</label>
                  <button type="button" onclick="toggleAllPanelCategories()" class="text-[11px] text-brand-400 hover:text-brand-300 font-semibold">Toggle All</button>
                </div>
                <div id="panelCategoriesCheckboxes" class="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  <!-- Populated by JS -->
                </div>
                <p class="text-[11px] text-slate-500">Tickets created through this panel will route to the selected departments.</p>
              </div>

              <!-- Media URLs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Thumbnail URL (Optional)</label>
                  <input type="text" id="panelThumbnailInput" placeholder="https://..." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition" oninput="updatePanelPreview()">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Banner Image URL (Optional)</label>
                  <input type="text" id="panelImageInput" placeholder="https://..." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition" oninput="updatePanelPreview()">
                </div>
              </div>

              <!-- Deploy Action Bar -->
              <div class="pt-3 border-t border-slate-800 flex justify-end">
                <button type="button" id="btnDeployPanel" onclick="submitDeployPanel()" class="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs shadow-xl shadow-brand-950/40 transition flex items-center space-x-2">
                  <i class="fa-solid fa-paper-plane"></i>
                  <span>Deploy Panel to Discord Channel</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Right Discord Preview Column (5 Cols) -->
          <div class="lg:col-span-5 sticky top-24 space-y-3">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <i class="fa-solid fa-eye text-brand-400"></i>
              <span>Live Discord Panel Preview</span>
            </div>

            <!-- Simulated Discord Message Box -->
            <div class="bg-[#313338] rounded-xl p-4 shadow-2xl border border-slate-800 space-y-3">
              <div class="flex items-center space-x-3">
                <img id="previewBotAvatar" src="/favicon.png" class="w-10 h-10 rounded-full object-cover">
                <div>
                  <div class="flex items-center space-x-1.5">
                    <span class="text-sm font-bold text-white">Aerix Ticket</span>
                    <span class="bg-brand-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">BOT</span>
                    <span class="text-[11px] text-slate-400 ml-1">Today at 12:00 PM</span>
                  </div>
                </div>
              </div>

              <!-- Discord Embed -->
              <div id="previewEmbedCard" class="bg-[#2b2d31] rounded-r-lg border-l-4 border-brand-600 p-4 space-y-2.5">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1.5 flex-1">
                    <h4 id="previewEmbedTitle" class="text-sm font-bold text-white">Aerix Tickets · Enterprise Support</h4>
                    <p id="previewEmbedDesc" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">Welcome to the support center. Please select an appropriate department below to open a private ticket with our staff team.</p>
                  </div>
                  <img id="previewEmbedThumb" src="" class="hidden w-14 h-14 rounded-lg object-cover">
                </div>
                <img id="previewEmbedBanner" src="" class="hidden w-full max-h-40 rounded-lg object-cover">
                <div class="flex items-center space-x-2 pt-1 border-t border-slate-700/40 text-[10px] text-slate-400">
                  <img id="previewEmbedFooterIcon" src="/favicon.png" class="w-4 h-4 rounded-full">
                  <span id="previewEmbedFooterText">Aerix Tickets · Enterprise Suite</span>
                </div>
              </div>

              <!-- Action Components Preview -->
              <div id="previewComponentsContainer" class="pt-1">
                <!-- Dynamically rendered buttons or select menu preview -->
              </div>
            </div>

            <p class="text-[11px] text-slate-500 text-center">Preview simulates how Discord will display the embed and components.</p>
          </div>
        </div>
      </div>

      <!-- Guild Tab 3: Tickets -->
      <div id="guild-tab-tickets" class="guild-tab-content hidden space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">Tickets Log</h3>
            <p class="text-xs text-slate-400">Audit trail of active and archived support tickets.</p>
          </div>
          <button onclick="loadGuildTickets()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition">
            <i class="fa-solid fa-arrows-rotate mr-1"></i> Refresh
          </button>
        </div>

        <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Number</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Created</th>
                <th class="px-4 py-3">Closed Reason</th>
              </tr>
            </thead>
            <tbody id="ticketsTableBody" class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading tickets...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Guild Tab 4: Tags -->
      <div id="guild-tab-tags" class="guild-tab-content hidden space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">Canned Snippets & Tags</h3>
            <p class="text-xs text-slate-400">Pre-written responses accessible via <code class="text-brand-300">/tag &lt;name&gt;</code> or <code class="text-brand-300">t?tag &lt;name&gt;</code>.</p>
          </div>
          <button onclick="promptCreateTag()" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-xs font-semibold text-white transition flex items-center space-x-1.5">
            <i class="fa-solid fa-plus"></i>
            <span>Add Tag</span>
          </button>
        </div>

        <div id="tagsList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Guild Tab 5: Settings -->
      <div id="guild-tab-settings" class="guild-tab-content hidden space-y-6">
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 max-w-2xl">
          <h3 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Server Configuration</h3>
          
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Command Prefix</label>
            <input type="text" id="guildPrefixInput" placeholder="t?" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
            <p class="text-[11px] text-slate-500">Text prefix for chat commands (e.g. <code class="text-brand-300">t?help</code>, <code class="text-brand-300">t?new</code>).</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Primary Accent Color (HEX)</label>
            <div class="flex items-center space-x-3">
              <input type="color" id="guildColorPicker" value="#6D28D9" class="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer" onchange="document.getElementById('guildColorInput').value = this.value">
              <input type="text" id="guildColorInput" value="#6D28D9" class="flex-1 text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 font-mono transition" oninput="document.getElementById('guildColorPicker').value = this.value">
            </div>
          </div>

          <div class="pt-4 border-t border-slate-800 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <i class="fa-solid fa-sliders text-brand-400"></i>
              <span>Default Ticket Messages & Embed Defaults</span>
            </h4>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Default Ticket Created Chat Alert</label>
              <input type="text" id="guildTicketCreatedMsg" placeholder="{staff} {creator} has created a new ticket." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
              <p class="text-[11px] text-slate-500">Alert message above embed when opened. Placeholders: <code class="text-brand-300">{creator}</code>, <code class="text-brand-300">{staff}</code>, <code class="text-brand-300">{department}</code>, <code class="text-brand-300">{number}</code>.</p>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Default Notify Staff Alert Message</label>
              <input type="text" id="guildNotifyStaffMsg" placeholder="{staff} Staff assistance requested by {creator}. A team member will reply shortly." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
              <p class="text-[11px] text-slate-500">Alert message sent when "Notify Staff" is clicked. Placeholders: <code class="text-brand-300">{creator}</code>, <code class="text-brand-300">{staff}</code>, <code class="text-brand-300">{department}</code>.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Default Embed Title Format</label>
                <input type="text" id="guildEmbedTitle" placeholder="Ticket #{number} · {department}" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Default Embed Footer Text</label>
                <input type="text" id="guildEmbedFooter" placeholder="AERIX TICKETS INFRASTRUCTURE · Fast • Reliable • Always Here" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Default Support Notice</label>
              <textarea id="guildEmbedNotice" rows="2" placeholder="Thank you for contacting Aerix Support. A staff member will assist you shortly." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 transition"></textarea>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button onclick="saveGuildSettings()" class="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition flex items-center space-x-2 shadow">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Save Server Settings</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- VIEW 3: Bot Customizer Suite -->
    <div id="view-bot" class="view-panel hidden space-y-8">
      
      <!-- Top Overview Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 p-6 rounded-2xl border border-brand-800/40 shadow-xl">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center space-x-3">
            <span>Bot Customizer Suite</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-700 text-white uppercase tracking-wider">Aerix Engine</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">Live Discord profile modification, avatar manager, About Me bio, and dynamic activity engine.</p>
        </div>
        <div class="flex items-center space-x-3">
          <button onclick="saveBotSettings()" class="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-950/40 transition">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Save & Apply Live</span>
          </button>
        </div>
      </div>

      <!-- Grid: Left Controls, Right Discord Mockup Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Controls Column (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">

          <!-- Card 1: Identity & Profile -->
          <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-lg">
            <div class="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div class="w-8 h-8 rounded-lg bg-brand-900/80 text-brand-300 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-user-gear"></i>
              </div>
              <h2 class="text-base font-bold text-white">Bot Identity</h2>
            </div>

            <!-- Profile Pic (Avatar) -->
            <div class="space-y-3">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Picture (Avatar)</label>
              <div class="flex items-center space-x-4">
                <img id="formAvatarPreview" src="/favicon.png" alt="Bot Avatar" class="w-16 h-16 rounded-full ring-2 ring-brand-700 object-cover bg-slate-950 shadow">
                <div class="flex-1 space-y-2">
                  <div class="flex space-x-2">
                    <input type="text" id="inputAvatarUrl" placeholder="Paste image URL (https://...)" class="flex-1 text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition">
                    <button type="button" onclick="previewAvatarFromUrl()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition">Load</button>
                  </div>
                  <div class="flex items-center space-x-3 text-xs text-slate-400">
                    <span>or upload file:</span>
                    <label class="cursor-pointer text-brand-400 hover:text-brand-300 font-semibold underline">
                      <span>Choose Image (PNG/JPG)</span>
                      <input type="file" id="inputFileAvatar" accept="image/*" class="hidden" onchange="handleAvatarFile(this)">
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label for="inputUsername" class="text-xs font-semibold uppercase tracking-wider text-slate-400">Bot Username</label>
                <span class="text-[11px] text-slate-500">Max 2 changes / 2 hrs (Discord API limit)</span>
              </div>
              <input type="text" id="inputUsername" placeholder="Aerix Ticket" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition" oninput="updateBotMockup()">
            </div>

            <!-- Description / Bio -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label for="inputDescription" class="text-xs font-semibold uppercase tracking-wider text-slate-400">About Me / Bio ("dic")</label>
                <span class="text-[11px] text-slate-500">Official Discord Application Bio</span>
              </div>
              <textarea id="inputDescription" rows="3" placeholder="Aerix Tickets · Enterprise Discord Support Suite" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition" oninput="updateBotMockup()"></textarea>
            </div>
          </div>

          <!-- Card 2: Status & Presence -->
          <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-lg">
            <div class="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div class="w-8 h-8 rounded-lg bg-brand-900/80 text-brand-300 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-signal"></i>
              </div>
              <h2 class="text-base font-bold text-white">Status & Activities</h2>
            </div>

            <!-- Status Selector -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Online Status</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label class="bot-status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                  <input type="radio" name="botStatus" value="online" class="hidden" onchange="updateBotMockup()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-online"></span>
                  <span class="text-xs font-semibold text-slate-200">Online</span>
                </label>
                <label class="bot-status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                  <input type="radio" name="botStatus" value="idle" class="hidden" onchange="updateBotMockup()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-idle"></span>
                  <span class="text-xs font-semibold text-slate-200">Idle</span>
                </label>
                <label class="bot-status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                  <input type="radio" name="botStatus" value="dnd" class="hidden" onchange="updateBotMockup()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-dnd"></span>
                  <span class="text-xs font-semibold text-slate-200">Do Not Disturb</span>
                </label>
                <label class="bot-status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition">
                  <input type="radio" name="botStatus" value="invisible" class="hidden" onchange="updateBotMockup()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-invisible"></span>
                  <span class="text-xs font-semibold text-slate-200">Invisible</span>
                </label>
              </div>
            </div>

            <!-- Rotation Interval -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label for="inputInterval" class="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity Rotation Interval</label>
                <span class="text-[11px] text-slate-500">Seconds (minimum 5s)</span>
              </div>
              <input type="number" id="inputInterval" min="5" max="3600" value="20" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
            </div>

            <!-- Activities Manager -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Rotating Activity Phrases</label>
                  <p class="text-[11px] text-slate-500">Add status activities with dynamic variables.</p>
                </div>
                <button type="button" onclick="addBotActivityRow()" class="px-3 py-1.5 bg-brand-700 hover:bg-brand-600 text-xs font-semibold rounded-lg text-white transition flex items-center space-x-1.5">
                  <i class="fa-solid fa-plus"></i>
                  <span>Add Activity</span>
                </button>
              </div>

              <div id="botActivitiesList" class="space-y-2.5">
                <!-- Injected by JS -->
              </div>

              <!-- Variable Pills -->
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div class="text-[11px] font-semibold text-slate-400">Dynamic Variable Placeholders:</div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" onclick="insertBotPlaceholder('{openTickets}')" class="text-[10px] font-mono bg-slate-900 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{openTickets}</button>
                  <button type="button" onclick="insertBotPlaceholder('{totalTickets}')" class="text-[10px] font-mono bg-slate-900 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{totalTickets}</button>
                  <button type="button" onclick="insertBotPlaceholder('{guilds}')" class="text-[10px] font-mono bg-slate-900 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{guilds}</button>
                  <button type="button" onclick="insertBotPlaceholder('{avgResponseTime}')" class="text-[10px] font-mono bg-slate-900 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{avgResponseTime}</button>
                  <button type="button" onclick="insertBotPlaceholder('{avgRating}')" class="text-[10px] font-mono bg-slate-900 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{avgRating}</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Save Button Bar -->
          <div class="flex items-center justify-end space-x-4 pt-2">
            <button type="button" onclick="loadBotSettings()" class="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition">
              Discard Changes
            </button>
            <button type="button" id="btnSaveBotBottom" onclick="saveBotSettings()" class="flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-sm shadow-xl shadow-brand-950/40 transition">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Save & Apply Live</span>
            </button>
          </div>

        </div>

        <!-- Right Column: Live Discord Profile Mockup (5 Cols) -->
        <div class="lg:col-span-5 sticky top-24 space-y-4">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <i class="fa-solid fa-eye text-brand-400"></i>
            <span>Live Discord Preview</span>
          </div>

          <!-- Discord Mockup Card -->
          <div class="bg-discord-card rounded-2xl overflow-hidden shadow-2xl border border-slate-800 max-w-sm mx-auto">
            
            <!-- Banner -->
            <div class="h-28 bg-gradient-to-r from-brand-950 via-brand-800 to-purple-950 relative"></div>

            <div class="px-4 pb-5 pt-0 relative">
              <!-- Avatar with Status Dot -->
              <div class="relative -top-10 -mb-7 w-20 h-20">
                <img id="mockupAvatar" src="/favicon.png" alt="Bot Avatar" class="w-20 h-20 rounded-full border-4 border-discord-card object-cover bg-slate-950">
                <div id="mockupStatusDot" class="absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-discord-card status-dot-online"></div>
              </div>

              <!-- Names & Badge -->
              <div class="bg-discord-darker p-3.5 rounded-xl space-y-3 mt-4 border border-slate-800">
                <div>
                  <div class="flex items-center space-x-1.5">
                    <span id="mockupUsername" class="text-base font-bold text-white">Aerix Ticket</span>
                    <span class="bg-brand-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">BOT</span>
                  </div>
                  <div id="mockupTag" class="text-xs text-slate-400 font-medium">aerix_ticket#9436</div>
                </div>

                <!-- Live Activity Display -->
                <div class="border-t border-slate-800 pt-2.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity</div>
                  <div class="flex items-center space-x-2 mt-1">
                    <div class="w-2 h-2 rounded-full bg-brand-500"></div>
                    <div class="text-xs text-slate-200 font-medium">
                      <span id="mockupActivityType" class="text-slate-400">Playing</span>
                      <span id="mockupActivityName" class="font-semibold text-white ml-1">/new</span>
                    </div>
                  </div>
                </div>

                <!-- About Me (Bio) -->
                <div class="border-t border-slate-800 pt-2.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">About Me</div>
                  <div id="mockupBio" class="text-xs text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    Aerix Tickets · Enterprise Discord Support Suite
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div class="font-semibold text-slate-300 flex items-center space-x-1.5">
              <i class="fa-solid fa-bolt text-brand-400"></i>
              <span>Instant Hot-Reload</span>
            </div>
            <p>Presence and bio updates applied here push directly to Discord in real time without restarting your bot process.</p>
          </div>

        </div>

      </div>

    </div>

    <!-- VIEW 4: Commands Manual & Documentation -->
    <div id="view-docs" class="view-panel hidden space-y-6">
      <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-2">
        <h1 class="text-2xl font-bold text-white flex items-center space-x-3">
          <i class="fa-solid fa-terminal text-brand-400"></i>
          <span>Aerix Tickets Command Reference</span>
        </h1>
        <p class="text-xs text-slate-400">All commands can be executed using either modern Discord Slash Commands (<code class="text-brand-300">/&lt;command&gt;</code>) or Text Prefix Triggers (<code class="text-brand-300">t?&lt;command&gt;</code>).</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Ticket Operations -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <i class="fa-solid fa-ticket text-brand-400"></i>
            <span>Ticket Operations</span>
          </h2>
          <div class="space-y-3 text-xs">
            <div>
              <span class="font-mono text-brand-300 font-semibold">/new</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?new</span>
              <p class="text-slate-400 mt-0.5">Open a new private support channel with category selection.</p>
            </div>
            <div>
              <span class="font-mono text-brand-300 font-semibold">/close</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?close</span>
              <p class="text-slate-400 mt-0.5">Safely close and archive an active support ticket.</p>
            </div>
            <div>
              <span class="font-mono text-brand-300 font-semibold">/claim</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?claim</span>
              <p class="text-slate-400 mt-0.5">Assign ticket responsibility to the executing staff member.</p>
            </div>
            <div>
              <span class="font-mono text-brand-300 font-semibold">/release</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?release</span>
              <p class="text-slate-400 mt-0.5">Unclaim ticket back to shared staff pool.</p>
            </div>
            <div>
              <span class="font-mono text-brand-300 font-semibold">/transfer &lt;user&gt;</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?transfer</span>
              <p class="text-slate-400 mt-0.5">Hand over a claimed ticket to another staff member.</p>
            </div>
            <div>
              <span class="font-mono text-brand-300 font-semibold">/rename &lt;name&gt;</span> <span class="text-slate-500">or</span> <span class="font-mono text-purple-300">t?rename</span>
              <p class="text-slate-400 mt-0.5">Update ticket channel name dynamically.</p>
            </div>
          </div>
        </div>

        <!-- Management & Deployment -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <i class="fa-solid fa-sliders text-emerald-400"></i>
            <span>Management & Deployment</span>
          </h2>
          <div class="space-y-3 text-xs">
            <div>
              <span class="font-mono text-emerald-400 font-semibold">/setup</span> <span class="text-slate-500">or</span> <span class="font-mono text-emerald-300">t?setup</span>
              <p class="text-slate-400 mt-0.5">Automated 1-click server initialization: creates Discord category, support channel, database categories, and panel.</p>
            </div>
            <div>
              <span class="font-mono text-emerald-400 font-semibold">/panel [channel]</span> <span class="text-slate-500">or</span> <span class="font-mono text-emerald-300">t?panel</span>
              <p class="text-slate-400 mt-0.5">Post the interactive ticket creation panel into any desired server channel.</p>
            </div>
            <div>
              <span class="font-mono text-emerald-400 font-semibold">/prefix set &lt;prefix&gt;</span> <span class="text-slate-500">or</span> <span class="font-mono text-emerald-300">t?prefix set</span>
              <p class="text-slate-400 mt-0.5">Customize the text command prefix for your Discord server.</p>
            </div>
            <div>
              <span class="font-mono text-emerald-400 font-semibold">/tag &lt;name&gt;</span> <span class="text-slate-500">or</span> <span class="font-mono text-emerald-300">t?tag</span>
              <p class="text-slate-400 mt-0.5">Dispatch pre-written canned response snippets into the channel.</p>
            </div>
            <div>
              <span class="font-mono text-emerald-400 font-semibold">/transcript</span> <span class="text-slate-500">or</span> <span class="font-mono text-emerald-300">t?transcript</span>
              <p class="text-slate-400 mt-0.5">Export and generate HTML/Markdown transcript of the ticket discussion.</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </main>

  <!-- Modal: Department Create / Edit -->
  <div id="modalCategory" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[92vh]">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="catModalTitle" class="text-base font-bold text-white flex items-center space-x-2">
          <i class="fa-solid fa-folder-tree text-brand-400"></i>
          <span>Edit Department</span>
        </h3>
        <button type="button" onclick="closeCategoryModal()" class="text-slate-400 hover:text-white transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <input type="hidden" id="catId" value="">

      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Department Name <span class="text-red-400">*</span></label>
            <input type="text" id="catName" oninput="updateCatLiveEmbedPreview()" placeholder="e.g. Technical Support" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition" required>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Channel Name Template</label>
            <input type="text" id="catChannelName" value="ticket-{num}" placeholder="ticket-{num}" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
          <textarea id="catDescription" rows="2" placeholder="Brief summary displayed on panels and select menus" class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"></textarea>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Opening Greeting Message</label>
          <textarea id="catOpeningMessage" rows="2" placeholder="Thank you for reaching out to Aerix Tickets support. A staff member will assist you shortly." class="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"></textarea>
          <p class="text-[11px] text-slate-500">Sent immediately into the ticket channel once opened by a member.</p>
        </div>

        <!-- Target Discord Category & Staff Roles Configuration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Discord Category Folder</span>
              <span class="text-[10px] text-brand-400 font-normal">Ticket Placement</span>
            </label>
            <select id="catDiscordCategory" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 transition font-mono">
              <option value="">[Auto-Create New Discord Category Channel]</option>
            </select>
            <p class="text-[11px] text-slate-500">Discord Category channel folder where tickets in this department are created.</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Support / Staff Roles</span>
              <span id="catStaffRolesCountBadge" class="text-[10px] font-bold text-brand-300">0 selected</span>
            </label>
            <div class="relative">
              <button type="button" onclick="toggleStaffRolesDropdown()" id="catStaffRolesBtn" class="w-full text-left text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 hover:border-brand-500 focus:outline-none transition flex items-center justify-between">
                <span id="catStaffRolesBtnLabel" class="truncate">Select roles that can manage tickets...</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-500 ml-2"></i>
              </button>

              <div id="catStaffRolesDropdown" class="hidden absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-2">
                <div class="relative">
                  <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-500"></i>
                  <input type="text" id="catStaffRoleSearch" oninput="filterStaffRolesList(this.value)" placeholder="Search roles..." class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-brand-500">
                </div>
                <div id="catStaffRolesList" class="max-h-48 overflow-y-auto space-y-1 pr-1">
                  <!-- Dynamically populated role items with checkboxes -->
                </div>
              </div>
            </div>
            <div id="catSelectedRolesChips" class="flex flex-wrap gap-1.5 pt-1">
              <span class="text-[11px] text-slate-500 italic">No roles selected. Only administrators can manage tickets.</span>
            </div>
            <p class="text-[11px] text-slate-500">Only members with these roles can view, claim, and manage tickets in this department.</p>
          </div>
        </div>

        <!-- Intake Questions & Form Fields Section -->
        <div class="pt-4 border-t border-slate-800 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div class="flex items-center space-x-2">
                <i class="fa-solid fa-list-check text-brand-400 text-sm"></i>
                <h4 class="text-xs font-bold uppercase tracking-wider text-white">Intake Questions & Form Fields</h4>
                <span id="catQuestionsCountBadge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-950 border border-brand-800 text-brand-300">0/5</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Collect member details, dropdown choices, or file screenshots before ticket opens.</p>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" onclick="addQuestionField('SHORT')" class="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-brand-900/60 hover:text-brand-200 text-slate-200 border border-slate-700 hover:border-brand-600 rounded-lg transition flex items-center space-x-1" title="Short text / fill in the blanks">
                <i class="fa-solid fa-font text-brand-400 text-[10px]"></i>
                <span>+ Blank Text</span>
              </button>
              <button type="button" onclick="addQuestionField('PARAGRAPH')" class="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-brand-900/60 hover:text-brand-200 text-slate-200 border border-slate-700 hover:border-brand-600 rounded-lg transition flex items-center space-x-1" title="Multi-line detailed paragraph">
                <i class="fa-solid fa-paragraph text-brand-400 text-[10px]"></i>
                <span>+ Paragraph</span>
              </button>
              <button type="button" onclick="addQuestionField('CHOICE')" class="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-brand-900/60 hover:text-brand-200 text-slate-200 border border-slate-700 hover:border-brand-600 rounded-lg transition flex items-center space-x-1" title="Select choice / dropdown options">
                <i class="fa-solid fa-square-check text-brand-400 text-[10px]"></i>
                <span>+ Choices</span>
              </button>
              <button type="button" onclick="addQuestionField('FILE')" class="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-brand-900/60 hover:text-brand-200 text-slate-200 border border-slate-700 hover:border-brand-600 rounded-lg transition flex items-center space-x-1" title="Screenshot / file upload drop zone">
                <i class="fa-solid fa-paperclip text-brand-400 text-[10px]"></i>
                <span>+ Upload File</span>
              </button>
            </div>
          </div>

          <div id="catQuestionsContainer" class="space-y-3">
            <!-- Dynamically injected questions -->
          </div>

          <div id="catQuestionsEmpty" class="py-4 px-3 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-500 text-xs">
            No intake questions configured. Tickets will open directly without an intake form.
          </div>
        </div>

        <div class="space-y-3 pt-3 border-t border-slate-800">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" id="catClaiming" class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500">
            <div>
              <span class="text-xs font-semibold text-slate-200">Require Staff Claiming</span>
              <p class="text-[11px] text-slate-500">Staff must claim tickets before member messages can be replied to.</p>
            </div>
          </label>

          <label class="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" id="catEnableFeedback" class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500">
            <div>
              <span class="text-xs font-semibold text-slate-200">Collect Member Feedback</span>
              <p class="text-[11px] text-slate-500">Prompt member for a 1-5 star rating when ticket is closed.</p>
            </div>
          </label>
        </div>

        <!-- Chat Notification Alerts Customization -->
        <div class="pt-4 border-t border-slate-800 space-y-3">
          <div class="flex items-center space-x-2">
            <i class="fa-solid fa-bullhorn text-brand-400 text-sm"></i>
            <h4 class="text-xs font-bold uppercase tracking-wider text-white">Chat Notification Alerts</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Ticket Created Chat Alert</span>
              </label>
              <input type="text" id="catTicketCreatedMessage" placeholder="{staff} {creator} has created a new ticket." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
              <p class="text-[11px] text-slate-500">Alert message above embed when opened. Placeholders: <code class="text-brand-300">{creator}</code>, <code class="text-brand-300">{staff}</code>, <code class="text-brand-300">{department}</code>, <code class="text-brand-300">{number}</code>.</p>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Notify Staff Button Message</span>
              </label>
              <input type="text" id="catNotifyStaffMessage" placeholder="{staff} Staff assistance requested by {creator}. A team member will reply shortly." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
              <p class="text-[11px] text-slate-500">Alert message sent when "Notify Staff" is clicked. Placeholders: <code class="text-brand-300">{creator}</code>, <code class="text-brand-300">{staff}</code>, <code class="text-brand-300">{department}</code>.</p>
            </div>
          </div>
        </div>

        <!-- Embed Full Customizer Section -->
        <div class="pt-4 border-t border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i class="fa-solid fa-palette text-purple-400 text-sm"></i>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Ticket Embed Customization</h4>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">Live Preview Enabled</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Title Template</label>
              <input type="text" id="catEmbedTitle" oninput="updateCatLiveEmbedPreview()" placeholder="Ticket #{number} · {department}" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
              <p class="text-[11px] text-slate-500">Placeholders: <code class="text-brand-300">{number}</code>, <code class="text-brand-300">{department}</code>, <code class="text-brand-300">{status}</code></p>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Accent Color (HEX)</label>
              <div class="flex items-center space-x-2">
                <input type="color" id="catEmbedColorPicker" value="#6D28D9" class="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer" onchange="document.getElementById('catEmbedColor').value = this.value; updateCatLiveEmbedPreview()">
                <input type="text" id="catEmbedColor" oninput="document.getElementById('catEmbedColorPicker').value = this.value; updateCatLiveEmbedPreview()" placeholder="#6D28D9" class="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Support Notice Box</label>
            <textarea id="catEmbedNotice" rows="2" oninput="updateCatLiveEmbedPreview()" placeholder="Thank you for contacting Aerix Support. A staff member will assist you shortly." class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"></textarea>
            <p class="text-[11px] text-slate-500">Styled inside the high-contrast support notice field on the ticket card.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Footer Text</label>
              <input type="text" id="catEmbedFooter" oninput="updateCatLiveEmbedPreview()" placeholder="AERIX TICKETS INFRASTRUCTURE · Fast • Reliable • Always Here" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed Banner Image URL</label>
              <input type="text" id="catImage" oninput="updateCatLiveEmbedPreview()" placeholder="https://example.com/banner.png" class="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition">
            </div>
          </div>

          <!-- Interactive Live Embed Preview Box -->
          <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Live Ticket Card Preview</span>
              <span class="text-brand-400 text-[10px]">Discord Mockup</span>
            </div>
            <div id="catLivePreviewCard" class="bg-[#2b2d31] rounded-r-lg border-l-4 border-brand-600 p-3.5 space-y-2 text-xs">
              <div class="flex items-center space-x-2 text-slate-400 text-[11px]">
                <span class="w-4 h-4 rounded-full bg-brand-600 inline-block"></span>
                <span class="font-medium text-slate-300">Member (@user)</span>
              </div>
              <h5 id="catLivePreviewTitle" class="font-bold text-white text-sm">Ticket #0001 · Technical Support</h5>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] py-1 border-y border-slate-700/40">
                <div><span class="text-slate-400 block text-[10px]">Status</span><code class="text-purple-300">Active</code></div>
                <div><span class="text-slate-400 block text-[10px]">Member</span><span class="text-slate-200">@Member</span></div>
                <div><span class="text-slate-400 block text-[10px]">Department</span><span id="catLivePreviewDept" class="text-slate-200">Support</span></div>
                <div><span class="text-slate-400 block text-[10px]">Created</span><span class="text-slate-400">Today</span></div>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Support Notice</span>
                <p id="catLivePreviewNotice" class="text-slate-300 italic pl-2 border-l-2 border-slate-600 text-[11px]">Thank you for contacting Aerix Support. A staff member will assist you shortly.</p>
              </div>
              <img id="catLivePreviewBanner" src="" class="hidden w-full max-h-32 rounded-lg object-cover">
              <div class="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                <span id="catLivePreviewFooter">AERIX TICKETS INFRASTRUCTURE · Fast • Reliable • Always Here</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
        <button type="button" onclick="closeCategoryModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition">Cancel</button>
        <button type="button" id="btnSaveCategory" onclick="saveCategory()" class="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg transition flex items-center space-x-2">
          <i class="fa-solid fa-floppy-disk"></i>
          <span>Save Department</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Aerix Team Enterprise Footer -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-8 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <img src="/assets/wordmark-dark.png" alt="Aerix Tickets" class="h-6">
        <span class="text-slate-600">|</span>
        <span class="text-xs text-slate-400 font-medium">Enterprise Discord Support Suite</span>
      </div>
      <div class="text-xs text-slate-500 text-center md:text-right">
        <span>Designed & Engineered with precision by <strong class="text-brand-400 font-semibold">Aerix Team</strong></span>
        <div class="text-[11px] text-slate-600 mt-0.5">All systems operational · Protected by Aerix Security Core</div>
      </div>
    </div>
  </footer>

  <!-- Core Dashboard Client Logic -->
  <script>
    let clientStats = null;
    let currentUser = null;
    let userGuilds = [];
    let currentGuildData = null;
    let selectedAvatarData = null;

    // Toast Notification System
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-emerald-600 border-emerald-500' : type === 'warning' ? 'bg-amber-600 border-amber-500' : 'bg-red-600 border-red-500';
      const icon = type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark';
      
      toast.className = \`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl border text-white text-xs font-semibold shadow-2xl transition duration-300 transform translate-y-2 opacity-0 \${bg}\`;
      toast.innerHTML = \`<i class="fa-solid \${icon} text-sm"></i><span>\${message}</span>\`;
      
      container.appendChild(toast);
      setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // View Navigation Router
    function navigateTo(viewName, pushState = true) {
      document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.nav-tab').forEach(el => {
        el.classList.remove('bg-brand-900/60', 'text-brand-300', 'border', 'border-brand-700/50');
        el.classList.add('text-slate-300');
      });

      const activeBtn = document.getElementById('nav-btn-' + viewName);
      if (activeBtn) {
        activeBtn.classList.add('bg-brand-900/60', 'text-brand-300', 'border', 'border-brand-700/50');
        activeBtn.classList.remove('text-slate-300');
      }

      const viewEl = document.getElementById('view-' + viewName);
      if (viewEl) viewEl.classList.remove('hidden');

      if (pushState) {
        const path = viewName === 'servers' ? '/settings' : '/' + viewName;
        window.history.pushState({ view: viewName }, '', path);
      }

      if (viewName === 'bot') {
        loadBotSettings();
      }
    }

    function getApiHeaders(customHeaders = {}) {
      const secret = localStorage.getItem('aerix_admin_secret');
      return {
        ...customHeaders,
        ...(secret ? { 'x-admin-secret': secret } : {})
      };
    }

    async function apiFetch(url, options = {}) {
      const headers = getApiHeaders(options.headers || {});
      return fetch(url, { ...options, headers });
    }

    function promptAdminKey() {
      const current = localStorage.getItem('aerix_admin_secret') || '';
      const key = prompt('Enter your Aerix Bot Secret Key to authenticate as Administrator:', current);
      if (key !== null) {
        if (key.trim()) {
          localStorage.setItem('aerix_admin_secret', key.trim());
          showToast('Staff Passkey saved! Reloading workspace...', 'success');
        } else {
          localStorage.removeItem('aerix_admin_secret');
          showToast('Staff Passkey removed.', 'warning');
        }
        setTimeout(() => window.location.reload(), 500);
      }
    }

    // Initial Data Fetcher
    async function initDashboard() {
      try {
        // 1. Fetch Client Stats
        const clientRes = await apiFetch('/api/client');
        if (clientRes.ok) {
          clientStats = await clientRes.json();
          renderClientStats(clientStats);
        }

        // 2. Fetch User Profile
        try {
          const userRes = await apiFetch('/api/users/@me');
          if (userRes.ok) {
            currentUser = await userRes.json();
          }
        } catch {}
        renderUserProfile(currentUser);

        // 3. Fetch User Guilds
        try {
          const guildsRes = await apiFetch('/api/guilds');
          if (guildsRes.ok) {
            userGuilds = await guildsRes.json();
            renderGuildsGrid(userGuilds);
          }
        } catch {}

        document.getElementById('globalLoading').classList.add('hidden');

        // Route resolution
        const path = window.location.pathname;
        if (path.startsWith('/bot') || path.startsWith('/settings/bot')) {
          navigateTo('bot', false);
        } else if (path.startsWith('/docs')) {
          navigateTo('docs', false);
        } else {
          navigateTo('servers', false);
        }

      } catch (err) {
        document.getElementById('globalLoading').classList.add('hidden');
        showToast('Error loading dashboard: ' + err.message, 'error');
        navigateTo('servers', false);
      }
    }

    function renderClientStats(data) {
      if (!data) return;
      const s = data.stats || {};
      document.getElementById('statGuilds').textContent = s.guilds || '1';
      document.getElementById('statTickets').textContent = s.tickets || '0';
      document.getElementById('statResponseTime').textContent = s.avgResponseTime || '30s';
      document.getElementById('statRating').textContent = (s.avgRating || '5.0') + ' / 5';

      if (s.ping) {
        document.getElementById('pingVal').textContent = s.ping + 'ms';
      }
    }

    function renderUserProfile(user) {
      const el = document.getElementById('userProfileSection');
      if (!user) return;
      el.innerHTML = \`
        <div class="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <img src="https://cdn.discordapp.com/avatars/\${user.id}/\${user.avatar}.webp" class="w-7 h-7 rounded-full border border-slate-700">
          <span class="text-xs font-semibold text-slate-200 hidden sm:inline">\${user.username}</span>
          <a href="/auth/logout" title="Logout" class="text-slate-400 hover:text-red-400 text-xs ml-1 transition">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </a>
        </div>
      \`;
    }

    function renderGuildsGrid(guilds) {
      const container = document.getElementById('guildsGrid');
      if (!guilds || guilds.length === 0) {
        container.innerHTML = \`
          <div class="col-span-full bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <i class="fa-solid fa-circle-question text-3xl text-slate-600"></i>
            <h3 class="text-base font-bold text-white">No active servers detected</h3>
            <p class="text-xs text-slate-400 max-w-md mx-auto">Invite Aerix Tickets to your Discord server or ensure you are logged in with the server administrator account.</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = guilds.map(g => \`
        <div class="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-5 space-y-4 hover:border-brand-700/60 transition shadow group">
          <div class="flex items-center space-x-3.5">
            <img src="\${g.logo || '/favicon.png'}" alt="\${g.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-white truncate">\${g.name}</h3>
              <p class="text-[11px] text-slate-500 font-mono truncate">ID: \${g.id}</p>
            </div>
            \${g.privilegeLevel >= 2 ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">Admin</span>' : ''}
          </div>

          <button onclick="openGuildWorkspace('\${g.id}')" class="w-full py-2.5 rounded-xl bg-slate-800 group-hover:bg-brand-700 text-slate-200 group-hover:text-white text-xs font-semibold transition flex items-center justify-center space-x-2">
            <span>Manage Support Suite</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
      \`).join('');
    }

    // Guild Workspace Logic
    let currentGuildCategories = [];
    let currentGuildChannels = [];
    let currentGuildRoles = [];

    function escapeHtml(text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    async function openGuildWorkspace(guildId) {
      navigateTo('guild', true);
      const guild = userGuilds.find(g => g.id === guildId) || { id: guildId, name: 'Server ' + guildId, logo: '/favicon.png' };
      
      document.getElementById('currentGuildName').textContent = guild.name;
      document.getElementById('currentGuildId').textContent = 'ID: ' + guild.id;
      document.getElementById('currentGuildIcon').src = guild.logo || '/favicon.png';

      // Load guild data
      try {
        const [gRes, setRes, catRes] = await Promise.all([
          apiFetch(\`/api/admin/guilds/\${guildId}\`),
          apiFetch(\`/api/admin/guilds/\${guildId}/settings\`),
          apiFetch(\`/api/admin/guilds/\${guildId}/categories\`)
        ]);

        if (gRes.ok) {
          const gData = await gRes.json();
          document.getElementById('guildStatTickets').textContent = gData.stats?.tickets || '0';
          document.getElementById('guildStatResponse').textContent = gData.stats?.avgResponseTime || '0s';
          document.getElementById('guildStatCategories').textContent = gData.stats?.categories?.length || '0';
        }

        if (setRes.ok) {
          const setData = await setRes.json();
          document.getElementById('guildPrefixInput').value = setData.prefix || 't?';
          document.getElementById('guildColorInput').value = setData.primaryColour || '#6D28D9';
          document.getElementById('guildColorPicker').value = setData.primaryColour || '#6D28D9';
          if (document.getElementById('guildTicketCreatedMsg')) document.getElementById('guildTicketCreatedMsg').value = setData.ticketCreatedMessage || '';
          if (document.getElementById('guildNotifyStaffMsg')) document.getElementById('guildNotifyStaffMsg').value = setData.notifyStaffMessage || '';
          if (document.getElementById('guildEmbedTitle')) document.getElementById('guildEmbedTitle').value = setData.embedTitle || '';
          if (document.getElementById('guildEmbedFooter')) document.getElementById('guildEmbedFooter').value = setData.embedFooter || '';
          if (document.getElementById('guildEmbedNotice')) document.getElementById('guildEmbedNotice').value = setData.embedNotice || '';
          const embedCard = document.getElementById('previewEmbedCard');
          if (embedCard && setData.primaryColour) {
            embedCard.style.borderLeftColor = setData.primaryColour;
          }
        }

        if (catRes.ok) {
          currentGuildCategories = await catRes.json();
          renderCategoriesList(currentGuildCategories);
          renderPanelCategoriesSelection(currentGuildCategories);
          updatePanelPreview();
        }

        await Promise.all([
          loadGuildChannels(guildId),
          loadGuildRoles(guildId)
        ]);
        renderCategoriesList(currentGuildCategories);

      } catch (err) {
        showToast('Error loading guild data: ' + err.message, 'error');
      }
    }

    function switchGuildTab(tabName) {
      document.querySelectorAll('.guild-tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.guild-tab-btn').forEach(el => {
        el.classList.remove('bg-brand-950/60', 'text-brand-300', 'border', 'border-brand-700/50');
        el.classList.add('text-slate-400');
      });

      const btn = document.getElementById('tab-btn-' + tabName);
      if (btn) {
        btn.classList.add('bg-brand-950/60', 'text-brand-300', 'border', 'border-brand-700/50');
        btn.classList.remove('text-slate-400');
      }

      const content = document.getElementById('guild-tab-' + tabName);
      if (content) content.classList.remove('hidden');

      if (tabName === 'panels') {
        if (!currentGuildChannels || currentGuildChannels.length === 0) {
          loadGuildChannels();
        }
        renderPanelCategoriesSelection(currentGuildCategories);
        updatePanelPreview();
      }
      if (tabName === 'tickets') loadGuildTickets();
      if (tabName === 'tags') loadGuildTags();
    }

    function getArrayRoles(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }

    function getCategoryChannelName(channelId) {
      if (!channelId) return 'Auto-created';
      const ch = currentGuildChannels.find(c => String(c.id) === String(channelId));
      return ch ? escapeHtml(ch.name) : ('ID: ' + escapeHtml(channelId));
    }

    function renderStaffRoleBadges(rolesVal) {
      const roles = getArrayRoles(rolesVal);
      if (roles.length === 0) {
        return '<span class="text-slate-500 italic text-[10px]">Administrators Only</span>';
      }
      return roles.slice(0, 3).map(id => {
        const r = currentGuildRoles.find(role => String(role.id) === String(id));
        const name = r ? r.name : ('Role ' + id);
        const color = (r && r.color) ? '#' + r.color.toString(16).padStart(6, '0') : '#a78bfa';
        return \`
          <span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: \${color}"></span>
            <span class="truncate max-w-[90px]">\${escapeHtml(name)}</span>
          </span>
        \`;
      }).join('') + (roles.length > 3 ? \`<span class="px-1 py-0.5 text-[9px] text-slate-500">+\${roles.length - 3}</span>\` : '');
    }

    function renderCategoriesList(cats) {
      currentGuildCategories = cats || [];
      const container = document.getElementById('categoriesList');
      if (!cats || cats.length === 0) {
        container.innerHTML = \`
          <div class="col-span-full bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <i class="fa-solid fa-folder-open text-3xl text-slate-600"></i>
            <h4 class="text-sm font-bold text-white">No departments configured</h4>
            <p class="text-xs text-slate-400">Add a support department so members can open tickets.</p>
            <button onclick="openCreateCategoryModal()" class="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-xs font-semibold text-white transition inline-flex items-center space-x-1.5 shadow">
              <i class="fa-solid fa-plus"></i>
              <span>Add Department</span>
            </button>
          </div>
        \`;
        return;
      }

      container.innerHTML = cats.map(c => \`
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-brand-700/60 transition shadow flex flex-col justify-between">
          <div class="space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center space-x-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-brand-900/60 border border-brand-700/60 text-brand-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <i class="fa-solid fa-folder"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-sm text-white truncate">\${escapeHtml(c.name)}</h4>
                  <span class="text-[10px] font-mono text-slate-500">#\${escapeHtml(c.channelName || 'ticket-{num}')}</span>
                </div>
              </div>
              <div class="flex items-center space-x-1.5 flex-wrap justify-end gap-1">
                \${c.questions && c.questions.length ? \`<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-950/90 text-brand-300 border border-brand-800/80"><i class="fa-solid fa-list-check mr-1 text-[8px]"></i>\${c.questions.length} Field\${c.questions.length > 1 ? 's' : ''}</span>\` : ''}
                \${c.claiming ? '<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/60">Claiming</span>' : ''}
                \${c.enableFeedback ? '<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60">Feedback</span>' : ''}
              </div>
            </div>

            <p class="text-xs text-slate-400 line-clamp-2">\${escapeHtml(c.description || 'General support inquiries and member requests.')}</p>

            <!-- Destination Discord Folder & Managing Staff Roles -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
              <div class="space-y-0.5 min-w-0">
                <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Discord Folder:</span>
                <p class="text-slate-300 font-medium truncate flex items-center space-x-1">
                  <i class="fa-solid fa-folder-tree text-brand-400 text-[10px] flex-shrink-0"></i>
                  <span class="truncate">\${getCategoryChannelName(c.discordCategory)}</span>
                </p>
              </div>
              <div class="space-y-0.5 min-w-0">
                <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Managing Staff:</span>
                <div class="flex flex-wrap gap-1">
                  \${renderStaffRoleBadges(c.staffRoles)}
                </div>
              </div>
            </div>

            \${c.questions && c.questions.length ? \`
              <div class="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div class="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <span>Intake Form (\${c.questions.length}/5)</span>
                  <span class="text-brand-400 font-mono">\${c.questions.some(q => q.type === 'FILE') ? 'Drop Zone Active' : 'Modal Form'}</span>
                </div>
                <div class="space-y-1">
                  \${c.questions.map(q => \`
                    <div class="flex items-center space-x-1.5 text-xs">
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold \${q.type === 'FILE' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : q.type === 'CHOICE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : q.type === 'PARAGRAPH' ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60' : 'bg-slate-800 text-slate-300 border border-slate-700'}">\${q.type === 'FILE' ? 'FILE' : q.type === 'CHOICE' ? 'CHOICE' : q.type === 'PARAGRAPH' ? 'PARAGRAPH' : 'TEXT'}</span>
                      <span class="truncate text-slate-300 text-[11px]">\${escapeHtml(q.label)}</span>
                      \${q.required ? '<span class="text-red-400 text-[10px] font-bold">*</span>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \` : ''}

            \${c.openingMessage ? \`
              <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Opening Greeting:</span>
                <p class="truncate text-slate-300 italic">"\${escapeHtml(c.openingMessage)}"</p>
              </div>
            \` : ''}
          </div>

          <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800/80">
            <button onclick="openEditCategoryModal(\${c.id})" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-brand-600 transition flex items-center space-x-1.5">
              <i class="fa-solid fa-pen-to-square text-[11px]"></i>
              <span>Edit Department</span>
            </button>
            <button onclick="confirmDeleteCategory(\${c.id}, '\${escapeHtml(c.name).replace(/'/g, "\\\\'")}')" class="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/60 hover:border-red-600 transition flex items-center space-x-1">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      \`).join('');
    }

    function updateQuestionsCount() {
      const container = document.getElementById('catQuestionsContainer');
      if (!container) return;
      const rows = container.querySelectorAll('.cat-question-row');
      const emptyMsg = document.getElementById('catQuestionsEmpty');
      const badge = document.getElementById('catQuestionsCountBadge');
      
      if (badge) badge.textContent = \`\${rows.length}/5\`;
      if (emptyMsg) {
        if (rows.length === 0) {
          emptyMsg.classList.remove('hidden');
        } else {
          emptyMsg.classList.add('hidden');
        }
      }

      rows.forEach((row, idx) => {
        const numBadge = row.querySelector('.q-num');
        if (numBadge) numBadge.textContent = \`Q\${idx + 1}\`;
      });
    }

    function getQuestionPlaceholderHint(type) {
      if (type === 'CHOICE') return 'Comma-separated choices: Bug Report, Feature Request, Billing';
      if (type === 'FILE') return 'e.g. Upload screenshots or logs in ticket drop zone';
      if (type === 'PARAGRAPH') return 'Detailed explanation placeholder...';
      return 'Brief placeholder or hint...';
    }

    function getQuestionSubHint(type) {
      if (type === 'CHOICE') return 'User selects or types from these choices.';
      if (type === 'FILE') return '<span class="text-brand-400 font-medium">Ticket will render a dedicated Screenshot & File Drop Zone embed.</span>';
      if (type === 'PARAGRAPH') return 'Multi-line text area in Discord intake modal.';
      return 'Single-line text input in Discord intake modal.';
    }

    function onQuestionTypeChange(select) {
      const row = select.closest('.cat-question-row');
      if (!row) return;
      const type = select.value;
      const input = row.querySelector('.q-placeholder');
      const hint = row.querySelector('.q-hint-text');
      if (input) input.placeholder = getQuestionPlaceholderHint(type);
      if (hint) hint.innerHTML = getQuestionSubHint(type);
    }

    function removeQuestionField(btn) {
      const row = btn.closest('.cat-question-row');
      if (row) {
        row.remove();
        updateQuestionsCount();
      }
    }

    function addQuestionField(type = 'SHORT', data = null) {
      const container = document.getElementById('catQuestionsContainer');
      if (!container) return;
      const rows = container.querySelectorAll('.cat-question-row');
      if (rows.length >= 5) {
        showToast('Maximum 5 intake questions allowed by Discord', 'warning');
        return;
      }

      const row = document.createElement('div');
      row.className = 'bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5 cat-question-row shadow-sm';
      
      const qType = (data && data.type) ? data.type : type;
      const qLabel = (data && data.label) ? data.label : '';
      let qPlaceholder = (data && data.placeholder) ? data.placeholder : '';
      if (qType === 'CHOICE' && data && data.options) {
        try {
          const opts = typeof data.options === 'string' ? JSON.parse(data.options) : data.options;
          if (Array.isArray(opts) && opts.length) qPlaceholder = opts.join(', ');
        } catch (_) {}
      }
      const qRequired = data ? (data.required !== false) : true;

      row.innerHTML = \`
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="q-num px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-300 font-mono text-[11px] font-bold">Q\${rows.length + 1}</span>
            <select class="q-type bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500 transition font-medium" onchange="onQuestionTypeChange(this)">
              <option value="SHORT" \${qType === 'SHORT' ? 'selected' : ''}>Blank Text (Short)</option>
              <option value="PARAGRAPH" \${qType === 'PARAGRAPH' ? 'selected' : ''}>Paragraph (Long)</option>
              <option value="CHOICE" \${qType === 'CHOICE' ? 'selected' : ''}>Select Menu / Choices</option>
              <option value="FILE" \${qType === 'FILE' ? 'selected' : ''}>File / Screenshot Drop</option>
            </select>
          </div>
          <div class="flex items-center space-x-3">
            <label class="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" class="q-required w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500" \${qRequired ? 'checked' : ''}>
              <span>Required</span>
            </label>
            <button type="button" onclick="removeQuestionField(this)" class="text-slate-500 hover:text-red-400 p-1 transition" title="Delete question">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <input type="text" class="q-label w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition" placeholder="Question label / prompt (e.g. In-game Username or Issue Summary)" value="\${escapeHtml(qLabel)}" required>
        </div>

        <div class="q-extra-box space-y-1">
          <input type="text" class="q-placeholder w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition" placeholder="\${getQuestionPlaceholderHint(qType)}" value="\${escapeHtml(qPlaceholder)}">
          <p class="q-hint-text text-[10px] text-slate-500">\${getQuestionSubHint(qType)}</p>
        </div>
      \`;

      container.appendChild(row);
      updateQuestionsCount();
    }

    let selectedStaffRoleIds = new Set();

    function populateDepartmentCategoriesDropdown(selectedCatId = '') {
      const select = document.getElementById('catDiscordCategory');
      if (!select) return;
      const categoryChannels = currentGuildChannels.filter(c => c.type === 4);
      let html = '<option value="">[Auto-Create New Discord Category Channel]</option>';
      categoryChannels.forEach(c => {
        const isSelected = String(c.id) === String(selectedCatId);
        html += \`<option value="\${c.id}" \${isSelected ? 'selected' : ''}>📁 \${escapeHtml(c.name)}</option>\`;
      });
      if (selectedCatId && !categoryChannels.some(c => String(c.id) === String(selectedCatId))) {
        html += \`<option value="\${selectedCatId}" selected>📁 Category ID: \${escapeHtml(selectedCatId)}</option>\`;
      }
      select.innerHTML = html;
    }

    function renderStaffRolesList(filter = '') {
      const list = document.getElementById('catStaffRolesList');
      if (!list) return;
      const filterLower = (filter || '').toLowerCase();
      const guildId = document.getElementById('currentGuildId')?.textContent.replace('ID: ', '').trim();
      const filtered = currentGuildRoles.filter(r => {
        if (String(r.id) === String(guildId) || r.name === '@everyone') return false;
        if (filterLower && !r.name.toLowerCase().includes(filterLower)) return false;
        return true;
      });

      if (filtered.length === 0) {
        list.innerHTML = '<p class="text-[11px] text-slate-500 italic p-2 text-center">No matching roles</p>';
        return;
      }

      list.innerHTML = filtered.map(r => {
        const isChecked = selectedStaffRoleIds.has(String(r.id));
        const colorHex = (r.color && r.color !== 0) ? '#' + r.color.toString(16).padStart(6, '0') : '#94a3b8';
        return \`
          <label class="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition">
            <input type="checkbox" value="\${r.id}" \${isChecked ? 'checked' : ''} onchange="toggleStaffRoleSelection('\${r.id}')" class="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: \${colorHex}"></span>
            <span class="font-medium text-slate-200 truncate flex-1">\${escapeHtml(r.name)}</span>
          </label>
        \`;
      }).join('');
    }

    function updateStaffRolesUI() {
      const badge = document.getElementById('catStaffRolesCountBadge');
      const btnLabel = document.getElementById('catStaffRolesBtnLabel');
      const chips = document.getElementById('catSelectedRolesChips');
      const count = selectedStaffRoleIds.size;

      if (badge) badge.textContent = \`\${count} selected\`;

      if (count === 0) {
        if (btnLabel) btnLabel.textContent = 'Select roles that can manage tickets...';
        if (chips) chips.innerHTML = '<span class="text-[11px] text-slate-500 italic">No roles selected. Only administrators can manage tickets.</span>';
      } else {
        const names = [];
        selectedStaffRoleIds.forEach(id => {
          const role = currentGuildRoles.find(r => String(r.id) === String(id));
          if (role) names.push(role.name);
        });
        if (btnLabel) {
          btnLabel.textContent = names.length > 0 ? names.slice(0, 2).join(', ') + (names.length > 2 ? \` (+\${names.length - 2} more)\` : '') : \`\${count} roles selected\`;
        }
        if (chips) {
          chips.innerHTML = Array.from(selectedStaffRoleIds).map(id => {
            const role = currentGuildRoles.find(r => String(r.id) === String(id)) || { id, name: 'Role ' + id, color: 0 };
            const colorHex = (role.color && role.color !== 0) ? '#' + role.color.toString(16).padStart(6, '0') : '#94a3b8';
            return \`
              <span class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] bg-slate-950 border border-slate-800 text-slate-200 shadow-sm">
                <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: \${colorHex}"></span>
                <span class="truncate max-w-[120px]">\${escapeHtml(role.name)}</span>
                <button type="button" onclick="toggleStaffRoleSelection('\${id}')" class="text-slate-500 hover:text-red-400 ml-1 transition">
                  <i class="fa-solid fa-xmark text-[9px]"></i>
                </button>
              </span>
            \`;
          }).join('');
        }
      }
    }

    function toggleStaffRoleSelection(roleId) {
      roleId = String(roleId);
      if (selectedStaffRoleIds.has(roleId)) {
        selectedStaffRoleIds.delete(roleId);
      } else {
        selectedStaffRoleIds.add(roleId);
      }
      updateStaffRolesUI();
      renderStaffRolesList(document.getElementById('catStaffRoleSearch')?.value || '');
    }

    function toggleStaffRolesDropdown() {
      const dropdown = document.getElementById('catStaffRolesDropdown');
      if (!dropdown) return;
      dropdown.classList.toggle('hidden');
      if (!dropdown.classList.contains('hidden')) {
        renderStaffRolesList(document.getElementById('catStaffRoleSearch')?.value || '');
        setTimeout(() => document.getElementById('catStaffRoleSearch')?.focus(), 50);
      }
    }

    function filterStaffRolesList(val) {
      renderStaffRolesList(val);
    }

    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('catStaffRolesDropdown');
      const btn = document.getElementById('catStaffRolesBtn');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      }
    });

    function openCreateCategoryModal() {
      document.getElementById('catId').value = '';
      document.getElementById('catModalTitle').innerHTML = '<i class="fa-solid fa-folder-plus text-brand-400"></i><span>Add New Department</span>';
      document.getElementById('catName').value = '';
      document.getElementById('catDescription').value = '';
      document.getElementById('catChannelName').value = 'ticket-{num}';
      document.getElementById('catOpeningMessage').value = 'Thank you for contacting Aerix Tickets support. A staff member will assist you shortly.';
      document.getElementById('catClaiming').checked = false;
      document.getElementById('catEnableFeedback').checked = false;
      
      const container = document.getElementById('catQuestionsContainer');
      if (container) container.innerHTML = '';
      updateQuestionsCount();

      selectedStaffRoleIds.clear();
      populateDepartmentCategoriesDropdown('');
      updateStaffRolesUI();
      const searchInput = document.getElementById('catStaffRoleSearch');
      if (searchInput) searchInput.value = '';
      const rolesDropdown = document.getElementById('catStaffRolesDropdown');
      if (rolesDropdown) rolesDropdown.classList.add('hidden');

      // Reset chat alerts and embed customization fields
      if (document.getElementById('catTicketCreatedMessage')) document.getElementById('catTicketCreatedMessage').value = '';
      if (document.getElementById('catNotifyStaffMessage')) document.getElementById('catNotifyStaffMessage').value = '';
      if (document.getElementById('catEmbedTitle')) document.getElementById('catEmbedTitle').value = '';
      if (document.getElementById('catEmbedColorPicker')) document.getElementById('catEmbedColorPicker').value = '#6D28D9';
      if (document.getElementById('catEmbedColor')) document.getElementById('catEmbedColor').value = '#6D28D9';
      if (document.getElementById('catEmbedNotice')) document.getElementById('catEmbedNotice').value = '';
      if (document.getElementById('catEmbedFooter')) document.getElementById('catEmbedFooter').value = '';
      if (document.getElementById('catImage')) document.getElementById('catImage').value = '';
      updateCatLiveEmbedPreview();

      document.getElementById('btnSaveCategory').innerHTML = '<i class="fa-solid fa-plus"></i><span>Create Department</span>';
      
      const modal = document.getElementById('modalCategory');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function openEditCategoryModal(catId) {
      const cat = currentGuildCategories.find(c => c.id === catId);
      if (!cat) return;

      document.getElementById('catId').value = cat.id;
      document.getElementById('catModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square text-brand-400"></i><span>Edit Department</span>';
      document.getElementById('catName').value = cat.name || '';
      document.getElementById('catDescription').value = cat.description || '';
      document.getElementById('catChannelName').value = cat.channelName || 'ticket-{num}';
      document.getElementById('catOpeningMessage').value = cat.openingMessage || '';
      document.getElementById('catClaiming').checked = !!cat.claiming;
      document.getElementById('catEnableFeedback').checked = !!cat.enableFeedback;
      
      const container = document.getElementById('catQuestionsContainer');
      if (container) {
        container.innerHTML = '';
        if (Array.isArray(cat.questions) && cat.questions.length > 0) {
          cat.questions.forEach(q => addQuestionField(q.type || 'SHORT', q));
        }
      }
      updateQuestionsCount();

      selectedStaffRoleIds.clear();
      const staffRoles = getArrayRoles(cat.staffRoles);
      staffRoles.forEach(id => selectedStaffRoleIds.add(String(id)));
      populateDepartmentCategoriesDropdown(cat.discordCategory || '');
      updateStaffRolesUI();
      const searchInput = document.getElementById('catStaffRoleSearch');
      if (searchInput) searchInput.value = '';
      const rolesDropdown = document.getElementById('catStaffRolesDropdown');
      if (rolesDropdown) rolesDropdown.classList.add('hidden');

      // Populate chat alerts and embed customization fields
      const catColor = (cat.embedColor && cat.embedColor.startsWith('#')) ? cat.embedColor : '#6D28D9';
      if (document.getElementById('catTicketCreatedMessage')) document.getElementById('catTicketCreatedMessage').value = cat.ticketCreatedMessage || '';
      if (document.getElementById('catNotifyStaffMessage')) document.getElementById('catNotifyStaffMessage').value = cat.notifyStaffMessage || '';
      if (document.getElementById('catEmbedTitle')) document.getElementById('catEmbedTitle').value = cat.embedTitle || '';
      if (document.getElementById('catEmbedColorPicker')) document.getElementById('catEmbedColorPicker').value = catColor;
      if (document.getElementById('catEmbedColor')) document.getElementById('catEmbedColor').value = cat.embedColor || '#6D28D9';
      if (document.getElementById('catEmbedNotice')) document.getElementById('catEmbedNotice').value = cat.embedNotice || '';
      if (document.getElementById('catEmbedFooter')) document.getElementById('catEmbedFooter').value = cat.embedFooter || '';
      if (document.getElementById('catImage')) document.getElementById('catImage').value = cat.image || '';
      updateCatLiveEmbedPreview();

      document.getElementById('btnSaveCategory').innerHTML = '<i class="fa-solid fa-floppy-disk"></i><span>Save Changes</span>';

      const modal = document.getElementById('modalCategory');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeCategoryModal() {
      const modal = document.getElementById('modalCategory');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      const dropdown = document.getElementById('catStaffRolesDropdown');
      if (dropdown) dropdown.classList.add('hidden');
    }

    function updateCatLiveEmbedPreview() {
      const name = document.getElementById('catName')?.value?.trim() || 'General Support';
      const rawTitle = document.getElementById('catEmbedTitle')?.value?.trim() || 'Ticket #{number} · {department}';
      const color = document.getElementById('catEmbedColor')?.value?.trim() || '#6D28D9';
      const rawNotice = document.getElementById('catEmbedNotice')?.value?.trim() || 'Thank you for contacting Aerix Support. A staff member will assist you shortly.';
      const rawFooter = document.getElementById('catEmbedFooter')?.value?.trim() || 'AERIX TICKETS INFRASTRUCTURE · Fast • Reliable • Always Here';
      const banner = document.getElementById('catImage')?.value?.trim() || '';

      const formatMock = (text) => {
        if (!text) return '';
        return text
          .replace(/{+\s?num(ber)?\s?}+/gi, '0001')
          .replace(/{+\s?rawNum(ber)?\s?}+/gi, '1')
          .replace(/{+\s?dep(artment)?\s?}+/gi, name)
          .replace(/{+\s?status\s?}+/gi, 'Active')
          .replace(/{+\s?creator\s?}+/gi, '@Member')
          .replace(/{+\s?user\s?}+/gi, '@Member')
          .replace(/{+\s?staff\s?}+/gi, '@Support');
      };

      const titleEl = document.getElementById('catLivePreviewTitle');
      if (titleEl) titleEl.textContent = formatMock(rawTitle);

      const deptEl = document.getElementById('catLivePreviewDept');
      if (deptEl) deptEl.textContent = name;

      const cardEl = document.getElementById('catLivePreviewCard');
      if (cardEl) {
        cardEl.style.borderLeftColor = color.startsWith('#') ? color : '#6D28D9';
      }

      const noticeEl = document.getElementById('catLivePreviewNotice');
      if (noticeEl) noticeEl.textContent = formatMock(rawNotice);

      const footerEl = document.getElementById('catLivePreviewFooter');
      if (footerEl) footerEl.textContent = formatMock(rawFooter);

      const bannerEl = document.getElementById('catLivePreviewBanner');
      if (bannerEl) {
        if (banner) {
          bannerEl.src = banner;
          bannerEl.classList.remove('hidden');
        } else {
          bannerEl.classList.add('hidden');
          bannerEl.src = '';
        }
      }
    }

    async function saveCategory() {
      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      const catId = document.getElementById('catId').value.trim();
      const name = document.getElementById('catName').value.trim();
      const description = document.getElementById('catDescription').value.trim();
      const channelName = document.getElementById('catChannelName').value.trim() || 'ticket-{num}';
      const openingMessage = document.getElementById('catOpeningMessage').value.trim();
      const claiming = document.getElementById('catClaiming').checked;
      const enableFeedback = document.getElementById('catEnableFeedback').checked;
      const discordCategory = document.getElementById('catDiscordCategory').value.trim();
      const staffRoles = Array.from(selectedStaffRoleIds);

      if (!name) {
        showToast('Department name is required', 'warning');
        return;
      }

      // Collect questions from question rows
      const rows = document.querySelectorAll('#catQuestionsContainer .cat-question-row');
      const questions = [];
      let hasEmptyLabel = false;

      rows.forEach((row, idx) => {
        const type = row.querySelector('.q-type').value;
        const label = row.querySelector('.q-label').value.trim();
        const placeholder = row.querySelector('.q-placeholder').value.trim();
        const required = row.querySelector('.q-required').checked;

        if (!label) {
          hasEmptyLabel = true;
          return;
        }

        let options = [];
        if (type === 'CHOICE' && placeholder) {
          options = placeholder.split(',').map(s => s.trim()).filter(Boolean);
        }

        questions.push({
          type,
          label,
          placeholder,
          options,
          style: (type === 'PARAGRAPH') ? 2 : 1,
          required,
          order: idx
        });
      });

      if (hasEmptyLabel) {
        showToast('All intake questions require a question prompt/label', 'warning');
        return;
      }

      const ticketCreatedMessage = document.getElementById('catTicketCreatedMessage')?.value?.trim();
      const notifyStaffMessage = document.getElementById('catNotifyStaffMessage')?.value?.trim();
      const embedTitle = document.getElementById('catEmbedTitle')?.value?.trim();
      const embedColor = document.getElementById('catEmbedColor')?.value?.trim();
      const embedNotice = document.getElementById('catEmbedNotice')?.value?.trim();
      const embedFooter = document.getElementById('catEmbedFooter')?.value?.trim();
      const image = document.getElementById('catImage')?.value?.trim();

      const btn = document.getElementById('btnSaveCategory');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving...</span>';

      const payload = {
        name,
        description,
        channelName,
        openingMessage,
        claiming,
        enableFeedback,
        staffRoles,
        questions,
        ticketCreatedMessage: ticketCreatedMessage || null,
        notifyStaffMessage: notifyStaffMessage || null,
        embedTitle: embedTitle || null,
        embedColor: embedColor || null,
        embedNotice: embedNotice || null,
        embedFooter: embedFooter || null,
        image: image || null
      };
      if (discordCategory) {
        payload.discordCategory = discordCategory;
      }

      try {
        const adminSecret = localStorage.getItem('aerix_admin_secret') || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(adminSecret ? { 'x-admin-secret': adminSecret } : {})
        };

        let res;
        if (catId) {
          res = await fetch(\`/api/admin/guilds/\${guildId}/categories/\${catId}\`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
          });
        } else {
          payload.emoji = '';
          res = await fetch(\`/api/admin/guilds/\${guildId}/categories\`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to save department');
        }

        showToast(catId ? 'Department updated successfully!' : 'New department created!', 'success');
        closeCategoryModal();
        await reloadGuildCategories(guildId);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = catId ? '<i class="fa-solid fa-floppy-disk"></i><span>Save Changes</span>' : '<i class="fa-solid fa-plus"></i><span>Create Department</span>';
      }
    }

    async function confirmDeleteCategory(catId, catName) {
      if (!confirm(\`Are you sure you want to delete department "\${catName}"? Existing tickets in this department will remain archived.\`)) {
        return;
      }

      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      try {
        const adminSecret = localStorage.getItem('aerix_admin_secret') || '';
        const res = await fetch(\`/api/admin/guilds/\${guildId}/categories/\${catId}\`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(adminSecret ? { 'x-admin-secret': adminSecret } : {})
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to delete department');
        }

        showToast(\`Department "\${catName}" deleted.\`, 'success');
        await reloadGuildCategories(guildId);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    async function reloadGuildCategories(guildId) {
      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/categories\`);
        if (res.ok) {
          currentGuildCategories = await res.json();
          renderCategoriesList(currentGuildCategories);
          renderPanelCategoriesSelection(currentGuildCategories);
          updatePanelPreview();
          document.getElementById('guildStatCategories').textContent = currentGuildCategories.length;
        }
      } catch (err) {
        console.error('Failed to reload categories:', err);
      }
    }

    // Panel Studio Methods
    async function loadGuildChannels(guildId) {
      if (!guildId) {
        guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      }
      const select = document.getElementById('panelChannelSelect');
      if (!select) return;
      select.innerHTML = '<option value="">Loading channels...</option>';

      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/data?query=channels.cache\`);
        if (res.ok) {
          const channels = await res.json();
          currentGuildChannels = Array.isArray(channels) ? channels : [];
          // type 0 = text channel, type 5 = announcement
          const textChannels = currentGuildChannels.filter(c => c.type === 0 || c.type === 5);
          
          let html = '<option value="">[Auto-create: #create-a-ticket]</option>';
          textChannels.forEach(c => {
            html += \`<option value="\${c.id}">#\${escapeHtml(c.name)}</option>\`;
          });
          select.innerHTML = html;
        } else {
          select.innerHTML = '<option value="">[Auto-create: #create-a-ticket]</option>';
        }
      } catch (err) {
        select.innerHTML = '<option value="">[Auto-create: #create-a-ticket]</option>';
      }
    }

    async function loadGuildRoles(guildId) {
      if (!guildId) {
        guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      }
      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/data?query=roles.cache\`);
        if (res.ok) {
          const roles = await res.json();
          currentGuildRoles = Array.isArray(roles) ? roles : [];
          currentGuildRoles.sort((a, b) => (b.position || 0) - (a.position || 0));
        }
      } catch (err) {
        console.error('Failed to load guild roles:', err);
      }
    }

    function renderPanelCategoriesSelection(cats) {
      const container = document.getElementById('panelCategoriesCheckboxes');
      if (!container) return;
      if (!cats || cats.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-500 py-2">No departments available. Create a department first.</p>';
        return;
      }

      container.innerHTML = cats.map(c => \`
        <label class="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs transition">
          <input type="checkbox" name="panelCat" value="\${c.id}" checked onchange="updatePanelPreview()" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500">
          <span class="font-semibold text-slate-200">\${escapeHtml(c.name)}</span>
          <span class="text-[11px] text-slate-500 truncate">(\${escapeHtml(c.description || 'Department')})</span>
        </label>
      \`).join('');
    }

    function toggleAllPanelCategories() {
      const boxes = document.querySelectorAll('input[name="panelCat"]');
      const anyUnchecked = Array.from(boxes).some(b => !b.checked);
      boxes.forEach(b => b.checked = anyUnchecked);
      updatePanelPreview();
    }

    function updatePanelPreview() {
      const title = document.getElementById('panelTitleInput')?.value || 'Aerix Tickets · Enterprise Support';
      const desc = document.getElementById('panelDescInput')?.value || 'Select a department below to open a ticket.';
      const thumbUrl = document.getElementById('panelThumbnailInput')?.value.trim();
      const bannerUrl = document.getElementById('panelImageInput')?.value.trim();
      const typeRadio = document.querySelector('input[name="panelType"]:checked');
      const panelType = typeRadio ? typeRadio.value : 'BUTTON';

      const titleEl = document.getElementById('previewEmbedTitle');
      const descEl = document.getElementById('previewEmbedDesc');
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;

      const thumbImg = document.getElementById('previewEmbedThumb');
      if (thumbImg) {
        if (thumbUrl) {
          thumbImg.src = thumbUrl;
          thumbImg.classList.remove('hidden');
        } else {
          thumbImg.classList.add('hidden');
        }
      }

      const bannerImg = document.getElementById('previewEmbedBanner');
      if (bannerImg) {
        if (bannerUrl) {
          bannerImg.src = bannerUrl;
          bannerImg.classList.remove('hidden');
        } else {
          bannerImg.classList.add('hidden');
        }
      }

      const guildName = document.getElementById('currentGuildName')?.textContent || 'Aerix Tickets';
      const guildIcon = document.getElementById('currentGuildIcon')?.src || '/favicon.png';
      const footerIcon = document.getElementById('previewEmbedFooterIcon');
      const footerText = document.getElementById('previewEmbedFooterText');
      if (footerIcon) footerIcon.src = guildIcon;
      if (footerText) footerText.textContent = guildName + ' · Aerix Tickets';

      // Live buttons or select menu preview
      const checkedCatIds = Array.from(document.querySelectorAll('input[name="panelCat"]:checked')).map(b => parseInt(b.value, 10));
      const selectedCats = currentGuildCategories.filter(c => checkedCatIds.includes(c.id));
      const compContainer = document.getElementById('previewComponentsContainer');
      if (!compContainer) return;

      if (panelType === 'MESSAGE' || selectedCats.length === 0) {
        compContainer.innerHTML = '';
      } else if (selectedCats.length === 1) {
        compContainer.innerHTML = \`
          <div class="flex">
            <button class="px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg font-medium text-xs shadow flex items-center space-x-1.5 pointer-events-none">
              <i class="fa-solid fa-envelope-open-text"></i>
              <span>Create Ticket</span>
            </button>
          </div>
        \`;
      } else if (panelType === 'BUTTON') {
        compContainer.innerHTML = \`
          <div class="flex flex-wrap gap-2">
            \${selectedCats.map(c => \`
              <button class="px-3.5 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded-lg font-medium text-xs shadow flex items-center space-x-1.5 pointer-events-none">
                <i class="fa-solid fa-folder-closed text-[11px] text-brand-300"></i>
                <span>\${escapeHtml(c.name)}</span>
              </button>
            \`).join('')}
          </div>
        \`;
      } else if (panelType === 'MENU') {
        compContainer.innerHTML = \`
          <div class="w-full bg-[#1e1f22] border border-slate-700/60 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
            <div class="flex items-center space-x-2">
              <i class="fa-solid fa-bars text-slate-400"></i>
              <span>Select Department (\${selectedCats.length} choices)...</span>
            </div>
            <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
          </div>
        \`;
      }
    }

    async function submitDeployPanel() {
      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      const channel = document.getElementById('panelChannelSelect').value || null;
      const title = document.getElementById('panelTitleInput').value.trim();
      const description = document.getElementById('panelDescInput').value.trim();
      const image = document.getElementById('panelImageInput').value.trim() || undefined;
      const thumbnail = document.getElementById('panelThumbnailInput').value.trim() || undefined;
      const typeRadio = document.querySelector('input[name="panelType"]:checked');
      const type = typeRadio ? typeRadio.value : 'BUTTON';

      const checkedCatIds = Array.from(document.querySelectorAll('input[name="panelCat"]:checked')).map(b => parseInt(b.value, 10));
      if (checkedCatIds.length === 0) {
        showToast('Please select at least 1 department to attach to this panel.', 'warning');
        return;
      }

      const btn = document.getElementById('btnDeployPanel');
      const btnTop = document.getElementById('btnDeployPanelTop');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Deploying to Discord...</span>';
      }
      if (btnTop) btnTop.disabled = true;

      const payload = {
        channel,
        title,
        description,
        image,
        thumbnail,
        type,
        categories: checkedCatIds
      };

      try {
        const adminSecret = localStorage.getItem('aerix_admin_secret') || '';
        const res = await fetch(\`/api/admin/guilds/\${guildId}/panels\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminSecret ? { 'x-admin-secret': adminSecret } : {})
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.errors && errData.errors.length) {
            throw new Error(errData.errors[0].message);
          }
          throw new Error(errData.message || 'Failed to deploy panel');
        }

        showToast('Interactive ticket panel successfully published to Discord!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>Deploy Panel to Discord Channel</span>';
        }
        if (btnTop) btnTop.disabled = false;
      }
    }

    async function loadGuildTickets() {
      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      const tbody = document.getElementById('ticketsTableBody');
      tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading tickets...</td></tr>';
      
      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/tickets\`);
        if (res.ok) {
          const tickets = await res.json();
          if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">No support tickets found on this server.</td></tr>';
            return;
          }
          tbody.innerHTML = tickets.map(t => \`
            <tr class="hover:bg-slate-800/40">
              <td class="px-4 py-3 font-mono font-bold text-brand-300">#\${t.number}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase \${t.open ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                  \${t.open ? 'OPEN' : 'CLOSED'}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-300">\${t.categoryId}</td>
              <td class="px-4 py-3 text-slate-400">\${new Date(t.createdAt).toLocaleDateString()}</td>
              <td class="px-4 py-3 text-slate-400">\${t.closedReason || '—'}</td>
            </tr>
          \`).join('');
        }
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="5" class="px-4 py-8 text-center text-red-400">Error: \${err.message}</td></tr>\`;
      }
    }

    async function loadGuildTags() {
      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      const container = document.getElementById('tagsList');
      container.innerHTML = '<p class="col-span-full text-slate-500 text-xs text-center py-6">Loading tags...</p>';

      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/tags\`);
        if (res.ok) {
          const tags = await res.json();
          if (!tags || tags.length === 0) {
            container.innerHTML = '<p class="col-span-full text-slate-500 text-xs text-center py-6">No canned tags configured. Click "Add Tag" to create one.</p>';
            return;
          }
          container.innerHTML = tags.map(tag => \`
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-brand-300 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">/tag \${tag.name}</span>
              </div>
              <p class="text-xs text-slate-300 line-clamp-3">\${tag.content}</p>
            </div>
          \`).join('');
        }
      } catch (err) {
        container.innerHTML = \`<p class="col-span-full text-red-400 text-xs text-center py-6">\${err.message}</p>\`;
      }
    }

    async function saveGuildSettings() {
      const guildId = document.getElementById('currentGuildId').textContent.replace('ID: ', '').trim();
      const prefix = document.getElementById('guildPrefixInput').value.trim() || 't?';
      const color = document.getElementById('guildColorInput').value.trim() || '#6D28D9';
      const ticketCreatedMessage = document.getElementById('guildTicketCreatedMsg')?.value?.trim() || null;
      const notifyStaffMessage = document.getElementById('guildNotifyStaffMsg')?.value?.trim() || null;
      const embedTitle = document.getElementById('guildEmbedTitle')?.value?.trim() || null;
      const embedFooter = document.getElementById('guildEmbedFooter')?.value?.trim() || null;
      const embedNotice = document.getElementById('guildEmbedNotice')?.value?.trim() || null;

      try {
        const res = await apiFetch(\`/api/admin/guilds/\${guildId}/settings\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prefix,
            primaryColour: color,
            ticketCreatedMessage,
            notifyStaffMessage,
            embedTitle,
            embedFooter,
            embedNotice
          })
        });
        if (res.ok) {
          showToast('Server settings updated successfully!', 'success');
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to save settings');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    function deployPanelQuick() {
      switchGuildTab('panels');
    }

    // ==========================================
    // BOT CUSTOMIZER SUITE LOGIC
    // ==========================================
    let botConfigData = null;

    const activityTypeLabels = {
      0: 'Playing',
      1: 'Streaming',
      2: 'Listening to',
      3: 'Watching',
      5: 'Competing in'
    };

    async function loadBotSettings() {
      try {
        const res = await fetch('/api/bot');
        if (!res.ok) throw new Error('Failed to load bot details');
        botConfigData = await res.json();

        const bot = botConfigData.bot || {};
        const config = botConfigData.config || {};

        document.getElementById('inputUsername').value = bot.username || '';
        document.getElementById('inputDescription').value = bot.description || '';
        document.getElementById('formAvatarPreview').src = bot.avatar || '/favicon.png';
        document.getElementById('inputInterval').value = config.interval || 20;

        // Status radio
        const status = config.status || 'online';
        document.querySelectorAll('input[name="botStatus"]').forEach(r => {
          r.checked = (r.value === status);
          updateStatusRadioStyle(r);
        });

        // Activities
        const list = document.getElementById('botActivitiesList');
        list.innerHTML = '';
        const acts = config.activities || [];
        if (acts.length === 0) {
          addBotActivityRow({ name: '/new', type: 0 });
        } else {
          acts.forEach(act => addBotActivityRow(act));
        }

        updateBotMockup();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    function updateStatusRadioStyle(radio) {
      const parent = radio.closest('.bot-status-option');
      if (parent) {
        if (radio.checked) {
          parent.classList.add('ring-2', 'ring-brand-500', 'bg-slate-800');
          parent.classList.remove('bg-slate-950');
        } else {
          parent.classList.remove('ring-2', 'ring-brand-500', 'bg-slate-800');
          parent.classList.add('bg-slate-950');
        }
      }
    }

    function addBotActivityRow(act = { name: '', type: 0 }) {
      const list = document.getElementById('botActivitiesList');
      const row = document.createElement('div');
      row.className = 'bot-activity-row flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800';
      row.innerHTML = \`
        <select class="bot-act-type text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-medium focus:outline-none focus:border-brand-500" onchange="updateBotMockup()">
          <option value="0" \${act.type == 0 ? 'selected' : ''}>Playing</option>
          <option value="2" \${act.type == 2 ? 'selected' : ''}>Listening to</option>
          <option value="3" \${act.type == 3 ? 'selected' : ''}>Watching</option>
          <option value="5" \${act.type == 5 ? 'selected' : ''}>Competing in</option>
          <option value="1" \${act.type == 1 ? 'selected' : ''}>Streaming</option>
        </select>
        <input type="text" value="\${act.name || ''}" placeholder="Activity text..." class="bot-act-name flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" oninput="updateBotMockup()">
        <button type="button" onclick="this.closest('.bot-activity-row').remove(); updateBotMockup();" class="text-slate-500 hover:text-red-400 p-2 text-xs transition">
          <i class="fa-solid fa-trash"></i>
        </button>
      \`;
      list.appendChild(row);
      updateBotMockup();
    }

    function insertBotPlaceholder(val) {
      const active = document.querySelector('.bot-activity-row:last-child .bot-act-name');
      if (active) {
        active.value += (active.value.length ? ' ' : '') + val;
        updateBotMockup();
      }
    }

    function previewAvatarFromUrl() {
      const url = document.getElementById('inputAvatarUrl').value.trim();
      if (!url) return;
      selectedAvatarData = url;
      document.getElementById('formAvatarPreview').src = url;
      document.getElementById('mockupAvatar').src = url;
    }

    function handleAvatarFile(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          selectedAvatarData = e.target.result;
          document.getElementById('formAvatarPreview').src = selectedAvatarData;
          document.getElementById('mockupAvatar').src = selectedAvatarData;
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    function updateBotMockup() {
      const username = document.getElementById('inputUsername').value || (botConfigData?.bot?.username || 'Aerix Ticket');
      const bio = document.getElementById('inputDescription').value || 'Aerix Tickets · Enterprise Discord Support Suite';

      document.getElementById('mockupUsername').textContent = username;
      document.getElementById('mockupTag').textContent = username.toLowerCase().replace(/\\s+/g, '_') + '#' + (botConfigData?.bot?.discriminator || '9436');
      document.getElementById('mockupBio').textContent = bio;

      const checkedRadio = document.querySelector('input[name="botStatus"]:checked');
      const status = checkedRadio ? checkedRadio.value : 'online';
      document.querySelectorAll('input[name="botStatus"]').forEach(r => updateStatusRadioStyle(r));

      const dot = document.getElementById('mockupStatusDot');
      dot.className = \`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-discord-card status-dot-\${status}\`;

      const firstRow = document.querySelector('.bot-activity-row');
      if (firstRow) {
        const typeVal = parseInt(firstRow.querySelector('.bot-act-type').value, 10);
        let nameVal = firstRow.querySelector('.bot-act-name').value || '/new';

        nameVal = nameVal
          .replace(/{+guilds}+/gi, clientStats?.stats?.guilds || '1')
          .replace(/{+openTickets}+/gi, '0')
          .replace(/{+totalTickets}+/gi, clientStats?.stats?.tickets || '1')
          .replace(/{+avgResponseTime}+/gi, clientStats?.stats?.avgResponseTime || '30s')
          .replace(/{+avgRating}+/gi, clientStats?.stats?.avgRating || '5.0');

        document.getElementById('mockupActivityType').textContent = activityTypeLabels[typeVal] || 'Playing';
        document.getElementById('mockupActivityName').textContent = nameVal;
      }
    }

    async function saveBotSettings() {
      const btn = document.getElementById('btnSaveBotBottom');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving & Applying...</span>';

      const username = document.getElementById('inputUsername').value.trim();
      const description = document.getElementById('inputDescription').value.trim();
      const interval = parseInt(document.getElementById('inputInterval').value, 10) || 20;

      const checkedRadio = document.querySelector('input[name="botStatus"]:checked');
      const status = checkedRadio ? checkedRadio.value : 'online';

      const activities = [];
      document.querySelectorAll('.bot-activity-row').forEach(row => {
        const type = parseInt(row.querySelector('.bot-act-type').value, 10);
        const name = row.querySelector('.bot-act-name').value.trim();
        if (name) activities.push({ name, type });
      });

      const payload = {
        description,
        interval,
        status,
        username,
        activities
      };

      if (selectedAvatarData) {
        payload.avatar = selectedAvatarData;
      }

      try {
        const adminSecret = localStorage.getItem('aerix_admin_secret') || '';
        const res = await fetch('/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminSecret ? { 'x-admin-secret': adminSecret } : {})
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.status === 403) {
          const pass = prompt('Admin authorization required. Please enter your Bot Secret Key or log in with Discord:');
          if (pass) {
            localStorage.setItem('aerix_admin_secret', pass.trim());
            return saveBotSettings();
          }
          throw new Error('Not authorized. Log in via Discord or provide your secret passkey.');
        }

        if (!res.ok) {
          throw new Error(data.message || 'Failed to save bot settings');
        }

        showToast('Aerix Tickets bot customized & applied live in Discord!', 'success');
        if (data.warnings && data.warnings.length) {
          data.warnings.forEach(w => showToast(w, 'warning'));
        }

        selectedAvatarData = null;
        await loadBotSettings();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i><span>Save & Apply Live</span>';
      }
    }

    // Handle Browser Back/Forward buttons
    window.addEventListener('popstate', e => {
      if (e.state && e.state.view) {
        navigateTo(e.state.view, false);
      }
    });

    // Start Dashboard
    initDashboard();
  </script>
</body>
</html>`);
};
