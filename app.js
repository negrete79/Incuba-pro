// ================= ESTADO E DADOS =================
const SPECIES = [
    { name: 'Galinha', days: 21, temp: 37.5, humidity: 60 },
    { name: 'Codorna', days: 17, temp: 37.5, humidity: 60 },
    { name: 'Pato', days: 28, temp: 37.5, humidity: 65 },
    { name: 'Ganso', days: 30, temp: 37.5, humidity: 70 },
    { name: 'Marreco', days: 35, temp: 37.2, humidity: 65 },
    { name: 'Pavão', days: 28, temp: 37.2, humidity: 60 },
    { name: 'Peru', days: 28, temp: 37.5, humidity: 65 },
    { name: 'Calopsita', days: 18, temp: 37.3, humidity: 55 }
];

let state = {
    lots: JSON.parse(localStorage.getItem('ip_lots') || '[]'),
    estufas: JSON.parse(localStorage.getItem('ip_estufas') || '[]'),
    notifs: JSON.parse(localStorage.getItem('ip_notifs') || '[]'),
    chatHistory: JSON.parse(localStorage.getItem('ip_chat') || '[]'),
    groqKey: localStorage.getItem('ip_groq') || ''
};

let currentTab = 'home';

function save(key, data) {
    localStorage.setItem(`ip_${key}`, JSON.stringify(data));
}

// ================= UTILITÁRIOS =================
function formatDate(d) {
    if(!d) return '-';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getDaysLeft(startDate, daysTotal) {
    if (!startDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return daysTotal - diff;
}

function getProgress(startDate, daysTotal) {
    if (!startDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.max(0, (diff / daysTotal) * 100));
}

function addNotif(text, type = 'info') {
    const n = { id: Date.now(), text, type, read: false, date: new Date().toISOString() };
    state.notifs.unshift(n);
    if (state.notifs.length > 20) state.notifs.pop();
    save('notifs', state.notifs);
    updateBadge();
}

function updateBadge() {
    const unread = state.notifs.filter(n => !n.read).length;
    const b = document.getElementById('badge');
    if (unread > 0) { b.classList.remove('hidden'); b.textContent = unread; }
    else { b.classList.add('hidden'); }
}

// ================= NAVEGAÇÃO =================
function nav(tab) {
    currentTab = tab;
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
    document.getElementById(`page-${tab}`).classList.add('on');
    document.querySelectorAll('.tb').forEach(b => {
        b.classList.remove('on');
        b.classList.add('text-neutral-500');
        if (b.dataset.t === tab) {
            b.classList.add('on');
            b.classList.remove('text-neutral-500');
        }
    });
    
    const titles = { home: 'IncubaPro', lots: 'Lotes de Incubação', calendar: 'Calendário', ai: 'Assistente IA', table: 'Tabela de Referência', estufa: 'Controle de Estufa', settings: 'Configurações' };
    document.getElementById('hTitle').textContent = titles[tab] || 'IncubaPro';

    if (tab === 'home') renderHome();
    if (tab === 'lots') renderLots();
    if (tab === 'calendar') renderCalendar();
    if (tab === 'ai') renderAI();
    if (tab === 'table') renderTable();
    if (tab === 'estufa') renderEstufa();
    if (tab === 'settings') renderSettings();
    
    document.getElementById('mainArea').scrollTop = 0;
}

// ================= TELA INICIAL =================
function renderHome() {
    const activeLots = state.lots.filter(l => l.status === 'incubando');
    const el = document.getElementById('page-home');
    
    let cardsHtml = activeLots.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-charcoal-800 flex items-center justify-center mb-4">
                <iconify-icon icon="lucide:egg" width="32" class="text-neutral-600"></iconify-icon>
            </div>
            <h3 class="text-lg font-semibold text-neutral-400 mb-2">Nenhum lote ativo</h3>
            <p class="text-sm text-neutral-600 mb-6">Crie seu primeiro lote para começar a monitorar.</p>
            <button onclick="nav('lots'); setTimeout(openAddLotModal, 100)" class="bg-gold-gradient text-charcoal-900 font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                <iconify-icon icon="lucide:plus" width="16" class="mr-1 inline-block"></iconify-icon> Criar Lote
            </button>
        </div>
    ` : activeLots.map(l => {
        const spec = SPECIES.find(s => s.name === l.species) || { days: l.days, temp: l.temp, humidity: l.humidity };
        const daysLeft = getDaysLeft(l.startDate, spec.days);
        const progress = getProgress(l.startDate, spec.days);
        const isUrgent = daysLeft <= 3 && daysLeft > 0;
        const isHatching = daysLeft <= 0 && l.status === 'incubando';
        
        return `
        <div class="lot-card bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer" onclick="openLotDetails('${l.id}')">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-xl ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-gold-500/10 text-gold-400'} flex items-center justify-center">
                        <iconify-icon icon="lucide:egg" width="18"></iconify-icon>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold">${l.name}</h4>
                        <p class="text-xs text-neutral-500">${l.species} • ${l.qty} ovos</p>
                    </div>
                </div>
                <div class="text-right">
                    ${isHatching ? '<span class="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Ecloção!</span>' : 
                      isUrgent ? `<span class="text-xs font-bold text-red-400">${daysLeft}d restantes</span>` : 
                      `<span class="text-2xl font-bold text-gold-400">${daysLeft}</span><span class="text-xs text-neutral-500 block">dias</span>`}
                </div>
            </div>
            <div class="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full ${isHatching ? 'bg-green-400' : 'bg-gold-gradient'} transition-all duration-500" style="width: ${progress}%"></div>
            </div>
            <div class="flex items-center justify-between mt-2 text-[10px] text-neutral-600">
                <span>Iniciado: ${formatDate(l.startDate)}</span>
                <span>Previsão: ${formatDate(l.expectedDate)}</span>
            </div>
        </div>`;
    }).join('');

    el.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold">Meus Lotes</h2>
                <p class="text-xs text-neutral-500 mt-0.5">${activeLots.length} lote(s) em andamento</p>
            </div>
            <button onclick="nav('lots'); setTimeout(openAddLotModal, 100)" class="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-[0_0_15px_-3px_rgba(242,201,76,0.4)] hover:scale-105 transition-transform">
                <iconify-icon icon="lucide:plus" width="18" class="text-charcoal-900"></iconify-icon>
            </button>
        </div>
        ${cardsHtml}
        
        <div class="grid grid-cols-2 gap-3 mt-2">
            <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-colors" onclick="nav('table')">
                <iconify-icon icon="lucide:book-open" width="20" class="text-gold-400 mb-2"></iconify-icon>
                <h4 class="text-sm font-bold">Tabela</h4>
                <p class="text-[10px] text-neutral-500 mt-1">Parâmetros por ave</p>
            </div>
            <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-colors" onclick="nav('estufa')">
                <iconify-icon icon="lucide:thermometer" width="20" class="text-gold-400 mb-2"></iconify-icon>
                <h4 class="text-sm font-bold">Estufas</h4>
                <p class="text-[10px] text-neutral-500 mt-1">Controle manual</p>
            </div>
        </div>
    `;
}

// ================= TELA LOTES =================
function renderLots() {
    const el = document.getElementById('page-lots');
    const lots = state.lots;
    
    let html = `
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold">Lotes de Incubação</h2>
            <button onclick="openAddLotModal()" class="text-xs font-bold text-gold-400 bg-gold-500/10 px-3 py-1.5 rounded-lg">+ Novo Lote</button>
        </div>
    `;

    if (lots.length === 0) {
        html += `<div class="text-center py-16 text-neutral-600"><iconify-icon icon="lucide:package-open" width="40" class="mx-auto mb-3"></iconify-icon><p class="text-sm">Nenhum lote registrado.</p></div>`;
    } else {
        html += lots.map(l => {
            const statusColors = { incubando: 'text-blue-400 bg-blue-400/10', nascido: 'text-green-400 bg-green-400/10', descartado: 'text-red-400 bg-red-400/10' };
            const sc = statusColors[l.status] || statusColors.incubando;
            return `
            <div class="lot-card bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer" onclick="openLotDetails('${l.id}')">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="text-sm font-bold">${l.name}</h4>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc}">${l.status}</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-neutral-500">
                    <span>${l.species}</span>
                    <span>${l.qty} ovos</span>
                    <span>Início: ${formatDate(l.startDate)}</span>
                </div>
            </div>`;
        }).join('');
    }
    el.innerHTML = html;
}

function openAddLotModal() {
    const specOptions = SPECIES.map(s => `<option value="${s.name}">${s.name} (${s.days} dias)</option>`).join('');
    
    document.getElementById('modalContent').innerHTML = `
    <div class="bg-charcoal-900 rounded-t-3xl p-6 border-t border-x border-white/10 max-h-[85vh] overflow-y-auto">
        <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-5"></div>
        <h3 class="text-lg font-bold mb-5">Novo Lote de Incubação</h3>
        <div class="space-y-4">
            <div>
                <label class="text-xs text-neutral-400 font-medium mb-1 block">Nome do Lote</label>
                <input id="mLotName" type="text" placeholder="Ex: Lote 01 - Galinha" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
            </div>
            <div>
                <label class="text-xs text-neutral-400 font-medium mb-1 block">Espécie</label>
                <select id="mLotSpec" onchange="toggleCustomSpec()" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-gold-500 transition-colors">
                    <option value="">Selecione...</option>
                    ${specOptions}
                    <option value="custom">Outra espécie (Personalizada)</option>
                </select>
            </div>
            <div id="customSpecFields" class="hidden space-y-4 p-4 bg-charcoal-800/50 rounded-xl border border-white/5">
                <div>
                    <label class="text-xs text-neutral-400 font-medium mb-1 block">Nome da Ave</label>
                    <input id="mCustomName" type="text" placeholder="Ex: Papagaio" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="text-xs text-neutral-400 font-medium mb-1 block">Dias</label>
                        <input id="mCustomDays" type="number" placeholder="21" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                    </div>
                    <div>
                        <label class="text-xs text-neutral-400 font-medium mb-1 block">Temp °C</label>
                        <input id="mCustomTemp" type="number" step="0.1" placeholder="37.5" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                    </div>
                    <div>
                        <label class="text-xs text-neutral-400 font-medium mb-1 block">Umid %</label>
                        <input id="mCustomHum" type="number" placeholder="60" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-neutral-400 font-medium mb-1 block">Quantidade de Ovos</label>
                    <input id="mLotQty" type="number" placeholder="12" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
                </div>
                <div>
                    <label class="text-xs text-neutral-400 font-medium mb-1 block">Data de Início</label>
                    <input id="mLotDate" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 transition-colors">
                </div>
            </div>
            <button onclick="saveLot()" class="w-full bg-gold-gradient text-charcoal-900 font-bold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-2">
                Salvar Lote
            </button>
        </div>
    </div>`;
    openModal();
}

function toggleCustomSpec() {
    const v = document.getElementById('mLotSpec').value;
    document.getElementById('customSpecFields').classList.toggle('hidden', v !== 'custom');
}

function saveLot() {
    const name = document.getElementById('mLotName').value.trim();
    const specVal = document.getElementById('mLotSpec').value;
    const qty = parseInt(document.getElementById('mLotQty').value);
    const startDate = document.getElementById('mLotDate').value;

    if (!name || !specVal || !qty || !startDate) {
        addNotif('Preencha todos os campos obrigatórios.', 'error');
        return;
    }

    let speciesName, days, temp, humidity;

    if (specVal === 'custom') {
        speciesName = document.getElementById('mCustomName').value.trim();
        days = parseInt(document.getElementById('mCustomDays').value);
        temp = parseFloat(document.getElementById('mCustomTemp').value);
        humidity = parseInt(document.getElementById('mCustomHum').value);
        if (!speciesName || !days || !temp || !humidity) {
            addNotif('Preencha os dados da espécie personalizada.', 'error');
            return;
        }
    } else {
        const spec = SPECIES.find(s => s.name === specVal);
        speciesName = spec.name;
        days = spec.days;
        temp = spec.temp;
        humidity = spec.humidity;
    }

    const start = new Date(startDate + 'T00:00:00');
    start.setDate(start.getDate() + days);
    const expectedDate = start.toISOString().split('T')[0];

    const lot = {
        id: 'lot_' + Date.now(),
        name, species: speciesName, qty, startDate, expectedDate,
        days, temp, humidity, status: 'incubando'
    };

    state.lots.push(lot);
    save('lots', state.lots);
    addNotif(`Lote "${name}" criado com sucesso!`, 'success');
    closeModal();
    renderLots();
    if(currentTab === 'home') renderHome();
}

function openLotDetails(id) {
    const l = state.lots.find(x => x.id === id);
    if (!l) return;
    const daysLeft = getDaysLeft(l.startDate, l.days);
    const progress = getProgress(l.startDate, l.days);

    document.getElementById('modalContent').innerHTML = `
    <div class="bg-charcoal-900 rounded-t-3xl p-6 border-t border-x border-white/10">
        <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-5"></div>
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-bold">${l.name}</h3>
                <p class="text-xs text-neutral-500">${l.species} • ${l.qty} ovos</p>
            </div>
            <span class="text-xs font-bold px-2 py-1 rounded-lg ${l.status === 'incubando' ? 'bg-blue-400/10 text-blue-400' : l.status === 'nascido' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}">${l.status}</span>
        </div>
        
        <div class="flex justify-center my-6 relative w-32 h-32 mx-auto">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#1A1A1A" stroke-width="8" fill="none"/>
                <circle cx="60" cy="60" r="50" stroke="url(#grad)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${Math.max(0, 314 - (314 * progress / 100))} 314"/>
                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#F2C94C"/><stop offset="100%" stop-color="#E6B800"/></linearGradient></defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-gold-400">${daysLeft > 0 ? daysLeft : 0}</span>
                <span class="text-[10px] text-neutral-500">dias restantes</span>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-charcoal-800 rounded-xl p-3 text-center">
                <iconify-icon icon="lucide:thermometer" width="16" class="text-gold-400 mx-auto mb-1"></iconify-icon>
                <p class="text-sm font-bold">${l.temp}°C</p>
                <p class="text-[10px] text-neutral-500">Temp</p>
            </div>
            <div class="bg-charcoal-800 rounded-xl p-3 text-center">
                <iconify-icon icon="lucide:droplets" width="16" class="text-gold-400 mx-auto mb-1"></iconify-icon>
                <p class="text-sm font-bold">${l.humidity}%</p>
                <p class="text-[10px] text-neutral-500">Umidade</p>
            </div>
            <div class="bg-charcoal-800 rounded-xl p-3 text-center">
                <iconify-icon icon="lucide:calendar-days" width="16" class="text-gold-400 mx-auto mb-1"></iconify-icon>
                <p class="text-sm font-bold">${l.days}d</p>
                <p class="text-[10px] text-neutral-500">Total</p>
            </div>
        </div>

        <div class="flex gap-2">
            ${l.status === 'incubando' ? `
                <button onclick="changeStatus('${l.id}', 'nascido')" class="flex-1 bg-green-500/10 text-green-400 font-semibold text-xs py-3 rounded-xl hover:bg-green-500/20 transition-colors">
                    <iconify-icon icon="lucide:check-circle" width="14" class="mr-1"></iconify-icon> Marcar Nascido
                </button>
                <button onclick="changeStatus('${l.id}', 'descartado')" class="flex-1 bg-red-500/10 text-red-400 font-semibold text-xs py-3 rounded-xl hover:bg-red-500/20 transition-colors">
