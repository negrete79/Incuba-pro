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

const STEPS = [
    { id: 1, title: 'Antes de Ligar a Chocadeira', desc: 'Configuração inicial, limpeza e teste do equipamento.' },
    { id: 2, title: 'Preparando os Ovos', desc: 'Seleção, armazenamento correto e ponto de ovos férteis.' },
    { id: 3, title: 'Antes de Utilizar a Chocadeira', desc: 'Estabilização de temperatura e umidade ideais.' },
    { id: 4, title: 'Acompanhamento Dia a Dia', desc: 'Viragem de ovos, controle de umidade e temperatura.' },
    { id: 5, title: 'Ovoscopia Crítica', desc: 'Verificação nos dias 7 e 14 para descartar ovos não viability.' },
    { id: 6, title: 'Eclosão e Nascimento', desc: 'Preparação do pinteiro, stop da viragem e nascedouro.' }
];

let state = {
    lots: JSON.parse(localStorage.getItem('ip_lots') || '[]'),
    notifs: JSON.parse(localStorage.getItem('ip_notifs') || '[]'),
    chatHistory: JSON.parse(localStorage.getItem('ip_chat') || '[]'),
    groqKey: localStorage.getItem('ip_groq') || '',
    currentStep: parseInt(localStorage.getItem('ip_step') || '1')
};

let currentTab = 'home';

function save(key, data) {
    localStorage.setItem(`ip_${key}`, JSON.stringify(data));
}

// ================= UTILITÁRIOS =================
function formatDate(d) {
    if(!d) return '-';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getDaysLeft(startDate, daysTotal) {
    if (!startDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    return daysTotal - Math.floor((now - start) / (1000 * 60 * 60 * 24));
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
    
    const titles = { home: 'IncubaPro', lots: 'Lotes de Incubação', calendar: 'Calendário', ai: 'Assistente IA', table: 'Espécies & Parâmetros', settings: 'Configurações' };
    document.getElementById('hTitle').textContent = titles[tab] || 'IncubaPro';

    if (tab === 'home') renderHome();
    if (tab === 'lots') renderLots();
    if (tab === 'calendar') renderCalendar();
    if (tab === 'ai') renderAI();
    if (tab === 'table') renderTable();
    if (tab === 'settings') renderSettings();
    
    document.getElementById('mainArea').scrollTop = 0;
}

// ================= TELA INICIAL (ETAPAS) =================
function renderHome() {
    const el = document.getElementById('page-home');
    const completed = state.currentStep - 1;
    const progress = Math.round((completed / STEPS.length) * 100);

    let stepsHtml = STEPS.map(s => {
        const isDone = s.id < state.currentStep;
        const isCurrent = s.id === state.currentStep;
        const isLocked = s.id > state.currentStep;

        return `
        <div class="step-card ${isLocked ? 'locked' : ''} bg-charcoal-900 border ${isCurrent ? 'border-gold-500/50' : 'border-white/5'} rounded-2xl p-4 flex items-center gap-4 ${!isLocked ? 'cursor-pointer' : ''}" 
             ${!isLocked ? `onclick="handleStep(${s.id})"` : ''}>
            
            <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isDone ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-gold-500/20 text-gold-400' : 'bg-charcoal-800 text-neutral-600'}">
                ${isDone ? '<iconify-icon icon="lucide:check-circle" width="20"></iconify-icon>' : 
                  isLocked ? '<iconify-icon icon="lucide:lock" width="18"></iconify-icon>' : 
                  `<span class="text-sm font-bold">${s.id}</span>`}
            </div>
            
            <div class="flex-1">
                <h4 class="text-sm font-bold ${isLocked ? 'text-neutral-600' : 'text-white'}">${s.title}</h4>
                <p class="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">${s.desc}</p>
            </div>
            
            ${isCurrent ? '<div class="w-2 h-2 rounded-full bg-gold-400 pd"></div>' : ''}
        </div>`;
    }).join('');

    el.innerHTML = `
        <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-sm font-bold text-neutral-300">Sua Incubação</h2>
                <span class="text-xs font-bold text-gold-400">${completed} de ${STEPS.length} etapas</span>
            </div>
            <div class="w-full h-2 bg-charcoal-800 rounded-full overflow-hidden mb-1">
                <div class="progress-fill h-full rounded-full bg-gold-gradient" style="width: ${progress}%"></div>
            </div>
            <p class="text-[10px] text-neutral-600 text-right">${progress}% concluído</p>
        </div>
        ${stepsHtml}
    `;
}

function handleStep(id) {
    if (id === state.currentStep) {
        showConfirm(`Concluir a etapa "${STEPS[id-1].title}" e avançar?`, () => {
            state.currentStep = id + 1;
            if(state.currentStep > STEPS.length) state.currentStep = STEPS.length; // Reset loop seguro
            localStorage.setItem('ip_step', state.currentStep);
            addNotif(`Etapa "${STEPS[id-1].title}" concluída!`, 'success');
            renderHome();
        });
    } else if (id < state.currentStep) {
        addNotif('Etapa já concluída anteriormente.', 'info');
    }
}

// ================= TELA LOTES =================
function renderLots() {
    const el = document.getElementById('page-lots');
    let html = `
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold">Lotes de Incubação</h2>
            <button onclick="openAddLotModal()" class="text-xs font-bold text-gold-400 bg-gold-500/10 px-3 py-1.5 rounded-lg">+ Novo Lote</button>
        </div>`;

    if (state.lots.length === 0) {
        html += `<div class="text-center py-16 text-neutral-600"><iconify-icon icon="lucide:package-open" width="40" class="mx-auto mb-3"></iconify-icon><p class="text-sm">Nenhum lote registrado.</p></div>`;
    } else {
        html += state.lots.map(l => {
            const sc = l.status === 'incubando' ? 'text-blue-400 bg-blue-400/10' : l.status === 'nascido' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10';
            return `
            <div class="lot-card bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer" onclick="openLotDetails('${l.id}')">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="text-sm font-bold">${l.name}</h4>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc}">${l.status}</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-neutral-500">
                    <span>${l.species}</span><span>${l.qty} ovos</span><span>Restam: ${getDaysLeft(l.startDate, l.days)}d</span>
                </div>
            </div>`;
        }).join('');
    }
    el.innerHTML = html;
}

function openAddLotModal() {
    const specOpts = SPECIES.map(s => `<option value="${s.name}">${s.name} (${s.days} dias)</option>`).join('');
    document.getElementById('modalContent').innerHTML = `
    <div class="bg-charcoal-900 rounded-t-3xl p-6 border-t border-x border-white/10 max-h-[85vh] overflow-y-auto">
        <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-5"></div>
        <h3 class="text-lg font-bold mb-5">Novo Lote</h3>
        <div class="space-y-4">
            <div>
                <label class="text-xs text-neutral-400 font-medium mb-1 block">Nome do Lote</label>
                <input id="mLotName" type="text" placeholder="Ex: Lote 01" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
            </div>
            <div>
                <label class="text-xs text-neutral-400 font-medium mb-1 block">Espécie</label>
                <select id="mLotSpec" onchange="toggleCustom()" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-gold-500 transition-colors">
                    <option value="">Selecione...</option>
                    ${specOpts}
                    <option value="custom">Outra espécie (Personalizada)</option>
                </select>
            </div>
            <div id="customFields" class="hidden space-y-4 p-4 bg-charcoal-800/50 rounded-xl border border-white/5">
                <input id="mCName" type="text" placeholder="Nome da Ave" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
                <div class="grid grid-cols-3 gap-3">
                    <input id="mCDays" type="number" placeholder="Dias" class="bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                    <input id="mCTemp" type="number" step="0.1" placeholder="Temp °C" class="bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                    <input id="mCHum" type="number" placeholder="Umid %" class="bg-charcoal-800 border border-white/10 rounded-xl px-3 py-3 text-sm text-white text-center placeholder-neutral-600 focus:border-gold-500 transition-colors">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-neutral-400 font-medium mb-1 block">Qtd. de Ovos</label>
                    <input id="mLotQty" type="number" placeholder="12" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500 transition-colors">
                </div>
                <div>
                    <label class="text-xs text-neutral-400 font-medium mb-1 block">Início</label>
                    <input id="mLotDate" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 transition-colors">
                </div>
            </div>
            <button onclick="saveLot()" class="w-full bg-gold-gradient text-charcoal-900 font-bold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity">Salvar Lote</button>
        </div>
    </div>`;
    openModal();
}

function toggleCustom() {
    document.getElementById('customFields').classList.toggle('hidden', document.getElementById('mLotSpec').value !== 'custom');
}

function saveLot() {
    const name = document.getElementById('mLotName').value.trim();
    const specVal = document.getElementById('mLotSpec').value;
    const qty = parseInt(document.getElementById('mLotQty').value);
    const startDate = document.getElementById('mLotDate').value;
    if (!name || !specVal || !qty || !startDate) return addNotif('Preencha todos os campos.', 'error');

    let speciesName, days, temp, humidity;
    if (specVal === 'custom') {
        speciesName = document.getElementById('mCName').value.trim();
        days = parseInt(document.getElementById('mCDays').value);
        temp = parseFloat(document.getElementById('mCTemp').value);
        humidity = parseInt(document.getElementById('mCHum').value);
        if (!speciesName || !days || !temp || !humidity) return addNotif('Preencha os dados da espécie personalizada.', 'error');
    } else {
        const spec = SPECIES.find(s => s.name === specVal);
        speciesName = spec.name; days = spec.days; temp = spec.temp; humidity = spec.humidity;
    }

    const start = new Date(startDate + 'T00:00:00');
    start.setDate(start.getDate() + days);
    
    state.lots.push({ id: 'lot_'+Date.now(), name, species: speciesName, qty, startDate, expectedDate: start.toISOString().split('T')[0], days, temp, humidity, status: 'incubando' });
    save('lots', state.lots);
    addNotif(`Lote "${name}" criado!`, 'success');
    closeModal(); renderLots();
}

function openLotDetails(id) {
    const l = state.lots.find(x => x.id === id); if(!l) return;
    const daysLeft = getDaysLeft(l.startDate, l.days);
    const sc = l.status === 'incubando' ? 'bg-blue-400/10 text-blue-400' : l.status === 'nascido' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400';

    document.getElementById('modalContent').innerHTML = `
    <div class="bg-charcoal-900 rounded-t-3xl p-6 border-t border-x border-white/10">
        <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-5"></div>
        <div class="flex justify-between items-start mb-6">
            <div><h3 class="text-lg font-bold">${l.name}</h3><p class="text-xs text-neutral-500">${l.species} • ${l.qty} ovos</p></div>
            <span class="text-xs font-bold px-2 py-1 rounded-lg ${sc}">${l.status}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-charcoal-800 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-gold-400">${daysLeft > 0 ? daysLeft : 0}</p><p class="text-[10px] text-neutral-500">Dias Restantes</p></div>
            <div class="bg-charcoal-800 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-white">${l.days}</p><p class="text-[10px] text-neutral-500">Total de Dias</p></div>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-charcoal-800 rounded-xl p-3 text-center"><iconify-icon icon="lucide:thermometer" width="16" class="text-gold-400 mb-1"></iconify-icon><p class="text-sm font-bold">${l.temp}°C</p></div>
            <div class="bg-charcoal-800 rounded-xl p-3 text-center"><iconify-icon icon="lucide:droplets" width="16" class="text-gold-400 mb-1"></iconify-icon><p class="text-sm font-bold">${l.humidity}%</p></div>
        </div>
        <div class="flex gap-2">
            ${l.status === 'incubando' ? `
                <button onclick="changeStatus('${l.id}', 'nascido')" class="flex-1 bg-green-500/10 text-green-400 font-semibold text-xs py-3 rounded-xl">Marcar Nascido</button>
                <button onclick="changeStatus('${l.id}', 'descartado')" class="flex-1 bg-red-500/10 text-red-400 font-semibold text-xs py-3 rounded-xl">Descartar</button>
            ` : `<button onclick="deleteLot('${l.id}')" class="flex-1 bg-red-500/10 text-red-400 font-semibold text-xs py-3 rounded-xl">Excluir Lote</button>`}
        </div>
    </div>`;
    openModal();
}

function changeStatus(id, status) {
    const l = state.lots.find(x => x.id === id);
    if(l){ l.status = status; save('lots', state.lots); addNotif(`Lote "${l.name}" marcado como ${status}.`, status==='nascido'?'success':'error'); closeModal(); renderLots(); }
}
function deleteLot(id) {
    showConfirm('Excluir este lote permanentemente?', () => {
        state.lots = state.lots.filter(x => x.id !== id); save('lots', state.lots); closeModal(); renderLots();
    });
}

// ================= TELA CALENDÁRIO =================
function renderCalendar() {
    const el = document.getElementById('page-calendar');
    const now = new Date(); const year = now.getFullYear(); const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    let daysHtml = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div class="text-center text-[10px] font-medium text-neutral-600 py-2">${d}</div>`).join('');
    for(let i=0; i<firstDay; i++) daysHtml += `<div></div>`;
    
    for(let d=1; d<=daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = d === now.getDate();
        const hasEvent = state.lots.some(l => l.startDate === dateStr || l.expectedDate === dateStr);
        daysHtml += `<div class="relative flex flex-col items-center justify-center py-2 rounded-xl ${isToday ? 'bg-gold-500/20 border border-gold-500/50' : ''}"><span class="text-xs font-medium ${isToday ? 'text-gold-400' : 'text-neutral-400'}">${d}</span>${hasEvent ? '<div class="w-1.5 h-1.5 rounded-full bg-gold-400 mt-0.5"></div>' : ''}</div>`;
    }

    el.innerHTML = `
        <h2 class="text-lg font-bold capitalize">${monthName}</h2>
        <div class="grid grid-cols-7 gap-1 bg-charcoal-900 rounded-2xl p-3 border border-white/5">${daysHtml}</div>
        <h3 class="text-sm font-bold">Próximas Eclosões</h3>
        <div class="space-y-2">${state.lots.filter(l=>l.status==='incubando').map(l=>`
            <div class="flex items-center gap-3 bg-charcoal-900 border border-white/5 rounded-xl p-3">
                <iconify-icon icon="lucide:egg" width="16" class="text-gold-400"></iconify-icon>
                <div class="flex-1"><p class="text-xs font-bold">${l.name}</p><p class="text-[10px] text-neutral-500">Previsão: ${formatDate(l.expectedDate)}</p></div>
                <span class="text-xs font-bold text-gold-400">${getDaysLeft(l.startDate, l.days)}d</span>
            </div>`).join('') || '<p class="text-xs text-neutral-600 text-center py-4">Nenhum evento próximo.</p>'}</div>
    `;
}

// ================= TELA IA (GROQ) =================
function renderAI() {
    const el = document.getElementById('page-ai');
    const hasKey = !!state.groqKey;
    let chatHtml = state.chatHistory.map(m => `
        <div class="msg flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-gold-gradient text-charcoal-900 font-medium rounded-br-md' : 'bg-charcoal-800 text-neutral-200 border border-white/5 rounded-bl-md'}">
                ${m.role === 'user' ? m.content : m.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold-300">$1</strong>').replace(/\n/g, '<br>')}
            </div>
        </div>`).join('');

    el.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="flex-1 overflow-y-auto space-y-3 pb-4" id="chatBox">
                ${chatHtml || `<div class="flex flex-col items-center justify-center h-full text-center px-4">
                    <div class="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mb-4"><iconify-icon icon="lucide:bot" width="28" class="text-gold-400"></iconify-icon></div>
                    <h3 class="font-bold text-neutral-300 mb-
