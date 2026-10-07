module.exports.get = fastify => ({
	handler: async (req, res) => {
		res.header('Content-Type', 'text/html; charset=utf-8');
		return res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aerix Tickets · Bot Customizer</title>
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
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    .status-dot-online { background-color: #23a55a; }
    .status-dot-idle { background-color: #f0b232; }
    .status-dot-dnd { background-color: #f23f43; }
    .status-dot-invisible { background-color: #80848e; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col">

  <!-- Navigation Bar -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <a href="/settings" class="flex items-center">
          <img src="/assets/wordmark-dark.png" alt="Aerix Tickets" class="h-8">
        </a>
        <span class="text-slate-600 font-bold">/</span>
        <span class="text-sm font-semibold tracking-wide text-brand-500 uppercase bg-brand-900/40 border border-brand-700/50 px-2.5 py-1 rounded-md">
          Bot Customizer
        </span>
      </div>

      <div class="flex items-center space-x-4">
        <div id="statsBadge" class="hidden sm:flex items-center space-x-3 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <span><i class="fa-solid fa-server text-brand-500 mr-1.5"></i><span id="guildsCount">0</span> Guilds</span>
          <span>•</span>
          <span><i class="fa-solid fa-bolt text-green-400 mr-1.5"></i><span id="pingMs">0</span>ms</span>
        </div>

        <a href="/settings" class="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">
          <i class="fa-solid fa-arrow-left mr-1.5"></i> Guild Settings
        </a>
        
        <div id="userProfile" class="flex items-center space-x-2">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  </header>

  <!-- Notification Banner -->
  <div id="toastContainer" class="fixed top-20 right-6 z-50 flex flex-col space-y-2 pointer-events-none"></div>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div id="loadingOverlay" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-slate-400 font-medium">Fetching Aerix bot profile and configuration...</p>
    </div>

    <div id="customizerContent" class="hidden space-y-8">
      
      <!-- Top Overview Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900/50 via-slate-800 to-slate-800/80 p-6 rounded-2xl border border-brand-800/40 shadow-xl">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center space-x-3">
            <span>Bot Identity & Customization</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-600 text-white tracking-wide uppercase">Aerix Suite</span>
          </h1>
          <p class="text-sm text-slate-300 mt-1">Live Discord profile modification, avatar manager, and dynamic presence engine.</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="btnSaveTop" onclick="saveBotSettings()" class="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-900/30 transition duration-200">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Save & Apply Live</span>
          </button>
        </div>
      </div>

      <!-- Two Column Grid: Left Controls, Right Discord Mockup Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Controls Column (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">

          <!-- Card 1: Identity & Profile -->
          <div class="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-lg">
            <div class="flex items-center space-x-3 border-b border-slate-700/80 pb-4">
              <div class="w-8 h-8 rounded-lg bg-brand-900/80 text-brand-400 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-user-gear"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Bot Identity</h2>
            </div>

            <!-- Profile Pic (Avatar) -->
            <div class="space-y-3">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Picture (Avatar)</label>
              <div class="flex items-center space-x-4">
                <img id="formAvatarPreview" src="/favicon.png" alt="Bot Avatar" class="w-16 h-16 rounded-full ring-2 ring-brand-700 object-cover bg-slate-900 shadow">
                <div class="flex-1 space-y-2">
                  <div class="flex space-x-2">
                    <input type="text" id="inputAvatarUrl" placeholder="Paste image URL (https://...)" class="flex-1 text-sm bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition">
                    <button type="button" onclick="previewAvatarFromUrl()" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-slate-200 transition">Load</button>
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
              <input type="text" id="inputUsername" placeholder="Aerix Ticket" class="w-full text-sm bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition" oninput="updatePreview()">
            </div>

            <!-- Description / Bio -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label for="inputDescription" class="text-xs font-semibold uppercase tracking-wider text-slate-400">About Me / Bio ("dic")</label>
                <span class="text-[11px] text-slate-500">Discord Application Bio</span>
              </div>
              <textarea id="inputDescription" rows="3" placeholder="Aerix Tickets · Enterprise Discord Support Suite" class="w-full text-sm bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition" oninput="updatePreview()"></textarea>
            </div>
          </div>

          <!-- Card 2: Status & Presence -->
          <div class="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-lg">
            <div class="flex items-center space-x-3 border-b border-slate-700/80 pb-4">
              <div class="w-8 h-8 rounded-lg bg-brand-900/80 text-brand-400 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-signal"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Status & Activities</h2>
            </div>

            <!-- Status Selector -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Online Status</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label class="status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition">
                  <input type="radio" name="status" value="online" class="hidden" onchange="updatePreview()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-online"></span>
                  <span class="text-xs font-semibold text-slate-200">Online</span>
                </label>
                <label class="status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition">
                  <input type="radio" name="status" value="idle" class="hidden" onchange="updatePreview()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-idle"></span>
                  <span class="text-xs font-semibold text-slate-200">Idle</span>
                </label>
                <label class="status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition">
                  <input type="radio" name="status" value="dnd" class="hidden" onchange="updatePreview()">
                  <span class="w-3.5 h-3.5 rounded-full status-dot-dnd"></span>
                  <span class="text-xs font-semibold text-slate-200">Do Not Disturb</span>
                </label>
                <label class="status-option cursor-pointer flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition">
                  <input type="radio" name="status" value="invisible" class="hidden" onchange="updatePreview()">
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
              <input type="number" id="inputInterval" min="5" max="3600" value="20" class="w-full text-sm bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 transition">
            </div>

            <!-- Activities Manager -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Activity List (Rotating)</label>
                  <p class="text-[11px] text-slate-500">Add status phrases. Supports dynamic variables.</p>
                </div>
                <button type="button" onclick="addActivityRow()" class="px-3 py-1.5 bg-brand-700 hover:bg-brand-600 text-xs font-semibold rounded-lg text-white transition flex items-center space-x-1.5">
                  <i class="fa-solid fa-plus"></i>
                  <span>Add Activity</span>
                </button>
              </div>

              <div id="activitiesList" class="space-y-2.5">
                <!-- Rows injected by JS -->
              </div>

              <!-- Variable Pills -->
              <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <div class="text-[11px] font-semibold text-slate-400">Available Dynamic Placeholders:</div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" onclick="insertPlaceholder('{openTickets}')" class="text-[10px] font-mono bg-slate-800 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{openTickets}</button>
                  <button type="button" onclick="insertPlaceholder('{totalTickets}')" class="text-[10px] font-mono bg-slate-800 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{totalTickets}</button>
                  <button type="button" onclick="insertPlaceholder('{guilds}')" class="text-[10px] font-mono bg-slate-800 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{guilds}</button>
                  <button type="button" onclick="insertPlaceholder('{avgResponseTime}')" class="text-[10px] font-mono bg-slate-800 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{avgResponseTime}</button>
                  <button type="button" onclick="insertPlaceholder('{avgRating}')" class="text-[10px] font-mono bg-slate-800 hover:bg-brand-900 border border-slate-700 px-2 py-0.5 rounded text-brand-300 transition">{avgRating}</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Save Button Bar -->
          <div class="flex items-center justify-end space-x-4 pt-2">
            <button type="button" onclick="loadBotSettings()" class="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition">
              Discard Changes
            </button>
            <button type="button" id="btnSaveBottom" onclick="saveBotSettings()" class="flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-sm shadow-xl shadow-brand-900/40 transition">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Save & Apply Live</span>
            </button>
          </div>

        </div>

        <!-- Right Column: Live Discord Profile Mockup (5 Cols) -->
        <div class="lg:col-span-5 sticky top-24 space-y-4">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <i class="fa-solid fa-eye text-brand-500"></i>
            <span>Live Discord Preview</span>
          </div>

          <!-- Discord Card Mockup -->
          <div class="bg-discord-card rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 max-w-sm mx-auto">
            
            <!-- Banner -->
            <div class="h-28 bg-gradient-to-r from-brand-900 via-brand-800 to-purple-950 relative"></div>

            <div class="px-4 pb-5 pt-0 relative">
              <!-- Avatar with Status Dot -->
              <div class="relative -top-10 -mb-7 w-20 h-20">
                <img id="mockupAvatar" src="/favicon.png" alt="Bot Avatar" class="w-20 h-20 rounded-full border-4 border-discord-card object-cover bg-slate-900">
                <div id="mockupStatusDot" class="absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-discord-card status-dot-online"></div>
              </div>

              <!-- Names & Badge -->
              <div class="bg-discord-darker p-3 rounded-xl space-y-3 mt-4 border border-slate-800">
                <div>
                  <div class="flex items-center space-x-1.5">
                    <span id="mockupUsername" class="text-base font-bold text-white">Aerix Ticket</span>
                    <span class="bg-brand-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">BOT</span>
                  </div>
                  <div id="mockupTag" class="text-xs text-slate-400 font-medium">aerix_ticket#9436</div>
                </div>

                <!-- Live Activity Display -->
                <div class="border-t border-slate-700/60 pt-2.5">
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
                <div class="border-t border-slate-700/60 pt-2.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">About Me</div>
                  <div id="mockupBio" class="text-xs text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    Aerix Tickets · Enterprise Discord Support Suite
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Quick Tip Card -->
          <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-xs text-slate-400 space-y-1.5">
            <div class="font-semibold text-slate-300 flex items-center space-x-1.5">
              <i class="fa-solid fa-lightbulb text-yellow-400"></i>
              <span>Instant Hot Reloading</span>
            </div>
            <p>Changes saved here take effect on your running Discord bot immediately without interrupting ongoing support tickets or quest processes.</p>
          </div>

        </div>

      </div>

    </div>
  </main>

  <script>
    let botData = null;
    let selectedAvatarData = null;

    const activityTypeLabels = {
      0: 'Playing',
      1: 'Streaming',
      2: 'Listening to',
      3: 'Watching',
      5: 'Competing in'
    };

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-green-600 border-green-500' : type === 'warning' ? 'bg-amber-600 border-amber-500' : 'bg-red-600 border-red-500';
      const icon = type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark';
      
      toast.className = \`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl border text-white text-xs font-semibold shadow-2xl transition duration-300 transform translate-y-2 opacity-0 \${bg}\`;
      toast.innerHTML = \`<i class="fa-solid \${icon} text-sm"></i><span>\${message}</span>\`;
      
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    async function loadBotSettings() {
      try {
        const res = await fetch('/api/bot');
        if (!res.ok) {
          throw new Error('Failed to fetch bot data (' + res.status + ')');
        }
        botData = await res.json();
        renderData(botData);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    function renderData(data) {
      document.getElementById('loadingOverlay').classList.add('hidden');
      document.getElementById('customizerContent').classList.remove('hidden');

      // Header stats
      if (data.stats) {
        document.getElementById('guildsCount').textContent = data.stats.guilds;
        document.getElementById('pingMs').textContent = data.stats.ping;
        document.getElementById('statsBadge').classList.remove('hidden');
      }

      // User profile in header
      const userProfileEl = document.getElementById('userProfile');
      if (data.user) {
        userProfileEl.innerHTML = \`
          <img src="https://cdn.discordapp.com/avatars/\${data.user.id}/\${data.user.avatar}.webp" class="w-8 h-8 rounded-full border border-slate-700">
          <span class="text-xs font-semibold text-slate-300 hidden md:inline">\${data.user.username}</span>
          <a href="/auth/logout" title="Logout" class="text-slate-400 hover:text-red-400 text-xs ml-2"><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
        \`;
      } else {
        userProfileEl.innerHTML = \`
          <a href="/auth/login" class="px-3 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition">Login with Discord</a>
        \`;
      }

      // Bot inputs
      const bot = data.bot || {};
      const config = data.config || {};

      document.getElementById('inputUsername').value = bot.username || '';
      document.getElementById('inputDescription').value = bot.description || '';
      document.getElementById('formAvatarPreview').src = bot.avatar || '/favicon.png';
      document.getElementById('inputInterval').value = config.interval || 20;

      // Status radio
      const status = config.status || 'online';
      document.querySelectorAll('input[name="status"]').forEach(r => {
        r.checked = (r.value === status);
        updateStatusStyle(r);
      });

      // Activities list
      const listEl = document.getElementById('activitiesList');
      listEl.innerHTML = '';
      const activities = config.activities || [];
      if (activities.length === 0) {
        addActivityRow({ name: '/new', type: 0 });
      } else {
        activities.forEach(act => addActivityRow(act));
      }

      updatePreview();
    }

    function updateStatusStyle(radio) {
      const parent = radio.closest('.status-option');
      if (parent) {
        if (radio.checked) {
          parent.classList.add('ring-2', 'ring-brand-500', 'bg-slate-800');
          parent.classList.remove('bg-slate-900/60');
        } else {
          parent.classList.remove('ring-2', 'ring-brand-500', 'bg-slate-800');
          parent.classList.add('bg-slate-900/60');
        }
      }
    }

    function addActivityRow(act = { name: '', type: 0 }) {
      const listEl = document.getElementById('activitiesList');
      const row = document.createElement('div');
      row.className = 'activity-row flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-700';
      row.innerHTML = \`
        <select class="act-type text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-medium focus:outline-none focus:border-brand-500" onchange="updatePreview()">
          <option value="0" \${act.type == 0 ? 'selected' : ''}>Playing</option>
          <option value="2" \${act.type == 2 ? 'selected' : ''}>Listening to</option>
          <option value="3" \${act.type == 3 ? 'selected' : ''}>Watching</option>
          <option value="5" \${act.type == 5 ? 'selected' : ''}>Competing in</option>
          <option value="1" \${act.type == 1 ? 'selected' : ''}>Streaming</option>
        </select>
        <input type="text" value="\${act.name || ''}" placeholder="Activity text..." class="act-name flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" oninput="updatePreview()">
        <button type="button" onclick="this.closest('.activity-row').remove(); updatePreview();" class="text-slate-400 hover:text-red-400 p-2 text-xs transition">
          <i class="fa-solid fa-trash"></i>
        </button>
      \`;
      listEl.appendChild(row);
      updatePreview();
    }

    function insertPlaceholder(placeholder) {
      const activeInput = document.querySelector('.activity-row:last-child .act-name');
      if (activeInput) {
        activeInput.value += (activeInput.value.length ? ' ' : '') + placeholder;
        updatePreview();
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

    function updatePreview() {
      const username = document.getElementById('inputUsername').value || (botData?.bot?.username || 'Aerix Ticket');
      const bio = document.getElementById('inputDescription').value || 'Aerix Tickets · Enterprise Discord Support Suite';
      
      document.getElementById('mockupUsername').textContent = username;
      document.getElementById('mockupTag').textContent = username.toLowerCase().replace(/\\s+/g, '_') + '#' + (botData?.bot?.discriminator || '9436');
      document.getElementById('mockupBio').textContent = bio;

      // Status
      const checkedRadio = document.querySelector('input[name="status"]:checked');
      const status = checkedRadio ? checkedRadio.value : 'online';
      document.querySelectorAll('input[name="status"]').forEach(r => updateStatusStyle(r));

      const dotEl = document.getElementById('mockupStatusDot');
      dotEl.className = \`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-discord-card status-dot-\${status}\`;

      // First activity
      const firstRow = document.querySelector('.activity-row');
      if (firstRow) {
        const typeVal = parseInt(firstRow.querySelector('.act-type').value, 10);
        let nameVal = firstRow.querySelector('.act-name').value || '/new';
        
        nameVal = nameVal
          .replace(/{+guilds}+/gi, botData?.stats?.guilds || '1')
          .replace(/{+openTickets}+/gi, '0')
          .replace(/{+totalTickets}+/gi, '1')
          .replace(/{+avgResponseTime}+/gi, '2m')
          .replace(/{+avgRating}+/gi, '5.0');

        document.getElementById('mockupActivityType').textContent = activityTypeLabels[typeVal] || 'Playing';
        document.getElementById('mockupActivityName').textContent = nameVal;
      }
    }

    async function saveBotSettings() {
      const btnTop = document.getElementById('btnSaveTop');
      const btnBottom = document.getElementById('btnSaveBottom');
      
      const setButtonsLoading = loading => {
        [btnTop, btnBottom].forEach(btn => {
          btn.disabled = loading;
          btn.innerHTML = loading
            ? '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving & Applying...</span>'
            : '<i class="fa-solid fa-floppy-disk"></i><span>Save & Apply Live</span>';
        });
      };

      setButtonsLoading(true);

      const username = document.getElementById('inputUsername').value.trim();
      const description = document.getElementById('inputDescription').value.trim();
      const interval = parseInt(document.getElementById('inputInterval').value, 10) || 20;

      const checkedRadio = document.querySelector('input[name="status"]:checked');
      const status = checkedRadio ? checkedRadio.value : 'online';

      const activities = [];
      document.querySelectorAll('.activity-row').forEach(row => {
        const type = parseInt(row.querySelector('.act-type').value, 10);
        const name = row.querySelector('.act-name').value.trim();
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
          const pass = prompt('Admin authorization required. Please log in with Discord or enter your Bot Secret Key to authenticate:');
          if (pass) {
            localStorage.setItem('aerix_admin_secret', pass.trim());
            return saveBotSettings();
          }
          throw new Error('Not authorized. Please log in with Discord or provide your bot secret key.');
        }

        if (!res.ok) {
          throw new Error(data.message || 'Failed to update bot configuration');
        }

        showToast('Aerix Tickets bot updated and applied live in Discord!', 'success');

        if (data.warnings && data.warnings.length) {
          data.warnings.forEach(w => showToast(w, 'warning'));
        }

        selectedAvatarData = null;
        await loadBotSettings();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setButtonsLoading(false);
      }
    }

    // Init
    loadBotSettings();
  </script>
</body>
</html>`);
	},
});
