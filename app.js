// --- ESTADO E DADOS ---
const STATE_KEY = 'incubapro_state';
let state = loadState();

const BIRDS = {
    galinha: { name: 'Galinha', days: 21, icon: 'Lucide:bird', tempMin: 37.5, tempMax: 37.8, umidMin: 55, umidMax: 65, umidFinal: 75, turnStop: 18, candling: [7, 14] },
    codorna: { name: 'Codorna', days: 17, icon: 'lucide:bird', tempMin: 37.5, tempMax: 37.8, umidMin: 50, umidMax: 60, umidFinal: 70, turnStop: 14, candling: [6, 12] },
    pato: { name: 'Pato', days: 28, icon: 'lucide:duck', tempMin: 37.5, tempMax: 37.8, umidMin: 55, umidMax: 65, umidFinal: 80, turnStop: 25, candling: [7, 14, 21] },
    peru: { name: 'Peru', days: 28, icon: 'lucide:bird', tempMin: 37.2, tempMax: 37.5, umidMin: 55, umidMax: 65, umidFinal: 78, turnStop: 25, candling: [7, 14, 21] },
    ganso: { name: 'Ganso', days: 31, icon: 'lucide:bird', tempMin: 37.2, tempMax: 37.5, umidMin: 60, umidMax: 70, umidFinal: 85, turnStop: 27, candling: [8, 15, 22] }
};

function getDefaultState() {
    return {
        lots: [
            { id: 1, type: 'galinha', eggs: 24, startDate: getDateDaysAgo(5), status: 'incubando' },
            { id: 2, type: 'codorna', eggs: 50, startDate: getDateDaysAgo(15), status: 'incubando' }
        ],
        estufa: { temp: 37.5, umid: 60 },
        notifications: [
            { id: 1, text: 'Hora de virar os ovos do Lote 1 (Galinha)!', time: 'Agora', read: false, icon: 'lucide:rotate-cw' },
            { id: 2, text: 'Ovos de Codorna devem eclodir amanhã!', time: '1h atrás', read: false, icon: 'lucide:alert-triangle' }
        ],
        settings: { notifyTurn: true, notifyTemp: true }
    };
}

function loadState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : getDefaultState();
    } catch (e) { return getDefaultState(); }
}

function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().split('T')[0];
}

function getDaysDiff(dateStr) {
    const start = new Date(dateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0,0,0,0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

// --- NAVEGAÇÃO ---
const titles = {
    home: 'IncubaPro', lots: 'Meus Lotes', calendar: 'Calendário',
    ai: 'Assistente IA', table: 'Tabela Referência', estufa: 'Dados da Estufa',
    settings: 'Configurações', more: 'Mais Opções'
};

function nav(page) {
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.tb').forEach(b => {
        b.classList.remove('on');
        b.classList.add('text-neutral-500');
    });
    
    let targetId = `page-${page}`;
    if (page === 'more') targetId = 'page-table'; // Redireciona 'Mais' para a tabela por padrão

    const target = document.getElementById(targetId);
    if (target) target.classList.add('on');

    const btn = document.querySelector(`.tb[data-t="${page}"]`);
    if (btn) {
        btn.classList.add('on');
        btn.classList.remove('text-neutral-500');
    }

    document.getElementById('hTitle').innerText = titles[page] || 'IncubaPro';
    document.getElementById('mainArea').scrollTop = 0;
    
    renderPage(page);
}

function renderPage(page) {
    switch(page) {
        case 'home': renderHome(); break;
        case 'lots': renderLots(); break;
        case 'calendar': renderCalendar(); break;
        case 'ai': renderAI(); break;
        case 'table': renderTable(); break;
        case 'estufa': renderEstufa(); break;
        case 'settings': renderSettings(); break;
        case 'more': renderMore(); break;
    }
    updateBadge();
}

// --- RENDERIZAÇÃO DAS TELAS ---

function renderHome() {
    const el = document.getElementById('page-home');
    const activeLots = state.lots.filter(l => l.status === 'incubando');
    const totalEggs = activeLots.reduce((sum, l) => sum + l.eggs, 0);
    const needsTurning = activeLots.filter(l => {
        const b = BIRDS[l.type];
        const day = getDaysDiff(l.startDate);
        return day < b.turnStop;
    }).length;

    el.innerHTML = `
        <!-- Resumo Geral -->
        <div class="flex items-center justify-between">
            <div>
                <p class="text-neutral-500 text-xs font-medium uppercase tracking-wider">Visão Geral</p>
                <h2 class="text-2xl font-bold mt-1">Olá, Criador!</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-charcoal-900 border border-white/10 flex items-center justify-center text-gold-400">
                <iconify-icon icon="lucide:user" width="24"></iconify-icon>
            </div>
        </div>

        <!-- Card de Estatísticas -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-4">
                <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                    <iconify-icon icon="lucide:egg" width="16" class="text-gold-400"></iconify-icon>
                </div>
                <p class="text-2xl font-bold">${totalEggs}</p>
                <p class="text-xs text-neutral-500 mt-0.5">Ovos Incubando</p>
            </div>
            <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-4">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <iconify-icon icon="lucide:layers" width="16" class="text-blue-400"></iconify-icon>
                </div>
                <p class="text-2xl font-bold">${activeLots.length}</p>
                <p class="text-xs text-neutral-500 mt-0.5">Lotes Ativos</p>
            </div>
        </div>

        <!-- Lembretes de Viragem -->
        <div>
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold">Tarefas de Hoje</h3>
                <span class="text-xs text-gold-400 font-medium">${needsTurning > 0 ? 'Pendente' : 'Nenhuma'}</span>
            </div>
            ${needsTurning > 0 ? `
                <div class="bg-charcoal-900 border border-gold-500/20 card-glow rounded-2xl p-4 flex items-center gap-4 lot-card cursor-pointer" onclick="nav('lots')">
                    <div class="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0 pd">
                        <iconify-icon icon="lucide:rotate-cw" width="18" class="text-gold-400"></iconify-icon>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-semibold">Virar Ovos</p>
                        <p class="text-xs text-neutral-500 mt-0.5">${needsTurning} lote(s) precisam de viragem agora</p>
                    </div>
                    <iconify-icon icon="lucide:chevron-right" width="16" class="text-neutral-600"></iconify-icon>
                </div>
            ` : `
                <div class="bg-charcoal-900/50 border border-white/5 rounded-2xl p-4 text-center text-neutral-600 text-sm">
                    Nenhuma tarefa pendente no momento.
                </div>
            `}
        </div>

        <!-- Alertas de Temperatura -->
        <div>
            <h3 class="text-sm font-semibold mb-3">Alertas do Sistema</h3>
            ${renderTempAlertCard()}
        </div>

        <!-- Próximas Eclosões -->
        <div>
            <h3 class="text-sm font-semibold mb-3">Próximas Eclosões</h3>
            <div class="space-y-2">
                ${activeLots.map(l => {
                    const b = BIRDS[l.type];
                    const day = getDaysDiff(l.startDate);
                    const daysLeft = b.days - day;
                    const progress = (day / b.days) * 100;
                    return `
                        <div class="bg-charcoal-900 border border-white/5 rounded-xl p-3 flex items-center gap-3 lot-card" onclick="openLotDetails(${l.id})">
                            <div class="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-lg">🥚</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <p class="text-sm font-medium truncate">Lote #${l.id} - ${b.name}</p>
                                    <span class="text-xs text-gold-400 font-bold">${daysLeft}d</span>
                                </div>
                                <div class="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gold-gradient rounded-full transition-all duration-500" style="width: ${Math.min(progress, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
                ${activeLots.length === 0 ? '<p class="text-neutral-600 text-sm text-center py-4">Nenhum lote ativo.</p>' : ''}
            </div>
        </div>
    `;
}

function renderTempAlertCard() {
    const { temp, umid } = state.estufa;
    const activeLots = state.lots.filter(l => l.status === 'incubando');
    if (activeLots.length === 0) return '<div class="bg-charcoal-900/50 border border-white/5 rounded-2xl p-4 text-center text-neutral-600 text-sm">Adicione um lote para monitorar a temperatura.</div>';
    
    const l = activeLots[0]; // Pega o primeiro lote ativo como referência
    const b = BIRDS[l.type];
    let tempClass = 'temp-ok', tempText = 'Normal';
    let umidClass = 'temp-ok', umidText = 'Normal';

    if (temp < b.tempMin) { tempClass = 'temp-cold'; tempText = 'Baixa'; }
    else if (temp > b.tempMax) { tempClass = 'temp-hot'; tempText = 'Alta'; }

    if (umid < b.umidMin) { umidClass = 'temp-cold'; umidText = 'Baixa'; }
    else if (umid > b.umidMax) { umidClass = 'temp-hot'; umidText = 'Alta'; }

    const isAlert = tempText !== 'Normal' || umidText !== 'Normal';

    return `
        <div class="bg-charcoal-900 border ${isAlert ? 'border-red-500/30' : 'border-white/5'} rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <iconify-icon icon="lucide:thermometer" width="16" class="${tempClass}"></iconify-icon>
                    <span class="text-sm font-medium">Temperatura</span>
                </div>
                <span class="text-sm font-bold ${tempClass}">${temp.toFixed(1)}°C <span class="text-xs font-normal text-neutral-500">(${tempText})</span></span>
            </div>
            <div class="h-px bg-white/5"></div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <iconify-icon icon="lucide:droplets" width="16" class="${umidClass}"></iconify-icon>
                    <span class="text-sm font-medium">Umidade</span>
                </div>
                <span class="text-sm font-bold ${umidClass}">${umid}% <span class="text-xs font-normal text-neutral-500">(${umidText})</span></span>
            </div>
        </div>
    `;
}

function renderLots() {
    const el = document.getElementById('page-lots');
    el.innerHTML = `
        <button onclick="openCreateLotModal()" class="w-full py-3 px-4 rounded-xl bg-gold-gradient text-charcoal-900 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(242,201,76,0.4)] hover:shadow-[0_0_30px_-5px_rgba(242,201,76,0.6)] transition-all">
            <iconify-icon icon="lucide:plus" width="18"></iconify-icon>
            Novo Lote de Incubação
        </button>
        
        <div class="space-y-3 pt-2">
            ${state.lots.map(l => {
                const b = BIRDS[l.type];
                const day = getDaysDiff(l.startDate);
                const progress = Math.min((day / b.days) * 100, 100);
                const isFinished = l.status === 'finalizado' || day >= b.days;
                const statusColor = isFinished ? 'text-green-400 bg-green-500/10' : 'text-gold-400 bg-gold-500/10';
                const statusText = isFinished ? 'Finalizado' : 'Incubando';
                
                return `
                    <div class="lot-card bg-charcoal-900 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/10" onclick="openLotDetails(${l.id})">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h4 class="font-bold text-base">Lote #${l.id}</h4>
                                <p class="text-xs text-neutral-500 mt-0.5">${b.name} • ${l.eggs} ovos</p>
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColor}">${statusText}</span>
                        </div>
                        
                        <div class="flex items-center justify-between text-xs text-neutral-500 mb-2">
                            <span>Dia ${day < 0 ? 0 : day}</span>
                            <span>Dia ${b.days}</span>
                        </div>
                        <div class="w-full h-2 bg-charcoal-800 rounded-full overflow-hidden">
                            <div class="h-full bg-gold-gradient rounded-full transition-all duration-700" style="width: ${progress}%"></div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                            <div class="text-center">
                                <p class="text-xs text-neutral-500">Temp</p>
                                <p class="text-sm font-semibold mt-0.5">${b.tempMin}°</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs text-neutral-500">Umid</p>
                                <p class="text-sm font-semibold mt-0.5">${b.umidMin}%</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs text-neutral-500">Parar Virar</p>
                                <p class="text-sm font-semibold mt-0.5">Dia ${b.turnStop}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
            ${state.lots.length === 0 ? '<p class="text-center text-neutral-600 py-10">Nenhum lote cadastrado ainda.</p>' : ''}
        </div>
    `;
}

function renderCalendar() {
    const el = document.getElementById('page-calendar');
    const activeLots = state.lots.filter(l => l.status === 'incubando');
    
    let events = [];
    activeLots.forEach(l => {
        const b = BIRDS[l.type];
        const start = new Date(l.startDate + "T00:00:00");
        
        // Ovoscopia
        b.candling.forEach(d => {
            const date = new Date(start);
            date.setDate(date.getDate() + d);
            events.push({ date: date.toISOString().split('T')[0], type: 'candling', title: `Ovoscopia Lote #${l.id}`, desc: `${b.name} - Dia ${d}`, icon: 'lucide:eye' });
        });

        // Parar Viragem
        const stopTurnDate = new Date(start);
        stopTurnDate.setDate(stopTurnDate.getDate() + b.turnStop);
        events.push({ date: stopTurnDate.toISOString().split('T')[0], type: 'stop', title: `Parar Viragem Lote #${l.id}`, desc: `Retirar ovos do turner`, icon: 'lucide:hand' });

        // Eclosão
        const hatchDate = new Date(start);
        hatchDate.setDate(hatchDate.getDate() + b.days);
        events.push({ date: hatchDate.toISOString().split('T')[0], type: 'hatch', title: `Eclosão Lote #${l.id}`, desc: `Prever nascimento`, icon: 'lucide:baby' });
    });

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Filtrar eventos de hoje e próximos 7 dias
    const futureEvents = events.filter(e => {
        const eDate = new Date(e.date + "T00:00:00");
        const diff = (eDate - today) / (1000 * 60 * 60 * 24);
        return diff >= -1 && diff <= 14; // De ontem até 14 dias
    }).sort((a,b) => new Date(a.date) - new Date(b.date));

    const typeStyles = {
        candling: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
        stop: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
        hatch: 'border-green-500/30 bg-green-500/5 text-green-400'
    };

    el.innerHTML = `
        <div class="bg-charcoal-900 border border-white/5 rounded-2xl p-4 text-center mb-2">
            <p class="text-xs text-neutral-500 uppercase tracking-wider">Hoje</p>
            <p class="text-3xl font-bold mt-1 text-gold-400">${today.getDate()}</p>
            <p class="text-sm text-neutral-400">${today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div>
            <h3 class="text-sm font-semibold mb-3">Próximos Eventos Críticos</h3>
            <div class="space-y-2">
                ${futureEvents.length > 0 ? futureEvents.map(e => {
                    const eDate = new Date(e.date + "T00:00:00");
                    const isToday = e.date === todayStr;
                    const isPast = eDate < today && !isToday;
                    return `
                        <div class="border ${typeStyles[e.type]} rounded-xl p-3 flex items-center gap-3 ${isPast ? 'opacity-40' : ''}">
                            <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                <iconify-icon icon="${e.icon}" width="18"></iconify-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">${e.title}</p>
                                <p class="text-xs opacity-70 mt-0.5">${e.desc}</p>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-xs font-bold ${isToday ? 'text-gold-400' : ''}">${isToday ? 'Hoje' : eDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</p>
                            </div>
                        </div>
                    `;
                }).join('') : '<p class="text-neutral-600 text-sm text-center py-6">Nenhum evento próximo.</p>'}
            </div>
        </div>

        <div class="pt-2">
            <h3 class="text-sm font-semibold mb-3">Legenda</h3>
            <div class="grid grid-cols-3 gap-2 text-xs text-center">
                <div class="bg-blue-500/10 text-blue-400 rounded-lg py-2 px-1 border border-blue-500/20">Ovoscopia</div>
                <div class="bg-yellow-500/10 text-yellow-400 rounded-lg py-2 px-1 border border-yellow-500/20">Parar Virar</div>
                <div class="bg-green-500/10 text-green-400 rounded-lg py-2 px-1 border border-green-500/20">Eclosão</div>
            </div>
        </div>
    `;
}

function renderAI() {
    const el = document.getElementById('page-ai');
    el.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="flex-1 overflow-y-auto chat-scroll px-1 pb-4 space-y-4" id="chatBox">
                <div class="msg flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0 mt-1">
                        <iconify-icon icon="lucide:bot" width="16" class="text-charcoal-900"></iconify-icon>
                    </div>
                    <div class="bg-charcoal-900 border border-white/10 rounded-2xl rounded-tl-md p-3 max-w-[85%]">
                        <p class="text-sm leading-relaxed">Olá! Sou a IA da IncubaPro. Posso ajudar com dúvidas sobre temperatura, umidade, tempo de incubação ou problemas 
