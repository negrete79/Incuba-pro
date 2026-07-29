var SPECIES = [
  {name:'Galinha',days:21,temp:'37.5-37.8',humid:'55-60',humidLock:'65-70',turns:'3x/dia',emoji:'🐔'},
  {name:'Calopsita',days:20,temp:'37.2-37.5',humid:'45-50',humidLock:'55-60',turns:'3-4x/dia',emoji:'🦜'},
  {name:'Codorna',days:17,temp:'37.5-37.8',humid:'50-55',humidLock:'60-65',turns:'3x/dia',emoji:'🐣'},
  {name:'Pato',days:28,temp:'37.2-37.5',humid:'55-60',humidLock:'70-75',turns:'3-4x/dia',emoji:'🦆'},
  {name:'Peru',days:28,temp:'37.2-37.5',humid:'55-60',humidLock:'65-70',turns:'3x/dia',emoji:'🦃'},
  {name:'Marreco',days:28,temp:'37.2-37.5',humid:'55-60',humidLock:'70-75',turns:'3-4x/dia',emoji:'🦆'},
  {name:'Faisão',days:24,temp:'37.5-37.8',humid:'55-60',humidLock:'65-70',turns:'3x/dia',emoji:'🦅'},
  {name:'Pavão',days:28,temp:'37.2-37.5',humid:'55-60',humidLock:'65-70',turns:'3x/dia',emoji:'🦚'},
  {name:'Ganso',days:31,temp:'37.2-37.5',humid:'55-60',humidLock:'70-75',turns:'3-4x/dia',emoji:'🪿'},
  {name:'Outra',days:21,temp:'37.5',humid:'55-60',humidLock:'65-70',turns:'3x/dia',emoji:'🥚'}
];

var TIPS = [
  'No dia 12, evite abrir a incubadora por mais de 30 segundos.',
  'Virar ovos 3x ao dia em horários regulares melhora a taxa de eclosão.',
  'Umidade abaixo de 50% causa desidratação dos embriões.',
  'Na ovoscopia, ovo claro sem veias é infértil — remova-o.',
  'No lockdown, NÃO vire mais os ovos!',
  'Meça a temperatura na altura dos ovos, não no topo.',
  'Deixe o pintinho secar 12-24h antes de transferir para o criatório.',
  'Lave as mãos antes de manusear os ovos.',
  'Temperatura acima de 39°C por horas pode matar o embrião.',
  'Ovos muito grandes ou muito pequenos têm menor taxa de eclosão.'
];

var S;
try { S = JSON.parse(localStorage.getItem('incubapro_v11')); } catch(e) {}
if (!S || !S.lots) {
  S = {lots:[],activeLotId:null,readings:[],notifications:[],calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),chatHistory:[],alarms:[],checkedDays:{},apiKey:''};
}
if (!S.alarms) S.alarms = [];
if (!S.checkedDays) S.checkedDays = {};
if (!S.apiKey) S.apiKey = '';

function save() { localStorage.setItem('incubapro_v11', JSON.stringify(S)); }

function esc(s) { if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function sp(n) { for(var i=0;i<SPECIES.length;i++) if(SPECIES[i].name===n) return SPECIES[i]; return SPECIES[0]; }
function active() { for(var i=0;i<S.lots.length;i++) if(S.lots[i].id===S.activeLotId) return S.lots[i]; return null; }
function ds(d) { var s=new Date(d),n=new Date(); s.setHours(0,0,0,0); n.setHours(0,0,0,0); return Math.floor((n-s)/86400000); }
function gid() { return Date.now().toString(36)+Math.random().toString(36).substr(2,6); }
function fmtDate(d) { return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'}); }

function toast(m) {
  var d = document.createElement('div');
  d.className = 'toast-msg';
  d.innerHTML = '<iconify-icon icon="lucide:check-circle" width="16" style="color:#E6B800;flex-shrink:0"></iconify-icon>' + esc(m);
  document.body.appendChild(d);
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 2600);
}

function addN(t, tp) {
  S.notifications.unshift({text:t, type:tp||'info', time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), read:false});
  if (S.notifications.length > 30) S.notifications.pop();
  save(); updB();
}

function updB() {
  var c = 0;
  for (var i=0; i<S.notifications.length; i++) if(!S.notifications[i].read) c++;
  var el = document.getElementById('badge');
  if (c > 0) { el.textContent = c > 9 ? '9+' : c; el.classList.remove('hidden'); }
  else { el.classList.add('hidden'); }
}

function openNotifPanel() {
  document.getElementById('notifPanel').classList.add('show');
  var l = document.getElementById('notifList'), h = '';
  if (!S.notifications.length) {
    h = '<div style="text-align:center;padding:3rem 0"><iconify-icon icon="lucide:bell-off" width="36" style="color:#262626;margin-bottom:0.75rem;display:block"></iconify-icon><p style="font-size:0.75rem;color:#525252">Sem notificações</p></div>';
  } else {
    for (var i=0; i<S.notifications.length; i++) {
      var n = S.notifications[i];
      var ic = n.type==='warn' ? 'lucide:alert-triangle' : n.type==='success' ? 'lucide:check-circle' : 'lucide:info';
      var cl = n.type==='warn' ? 'color:#fbbf24' : n.type==='success' ? 'color:#34d399' : 'color:#E6B800';
      var bg = n.read ? 'background:rgba(255,255,255,0.02)' : 'background:rgba(255,255,255,0.05)';
      var tc = n.read ? 'color:#525252' : 'color:#d4d4d4';
      h += '<div style="display:flex;gap:0.75rem;padding:0.75rem;border-radius:0.75rem;'+bg+';border:1px solid rgba(255,255,255,0.05);cursor:pointer" onclick="markR('+i+')">';
      h += '<iconify-icon icon="'+ic+'" width="18" style="'+cl+';flex-shrink:0;margin-top:2px"></iconify-icon>';
      h += '<div style="flex:1;min-width:0"><p style="font-size:0.75rem;line-height:1.5;'+tc+'">'+esc(n.text)+'</p><p style="font-size:0.625rem;color:#404040;margin-top:4px">'+n.time+'</p></div>';
      if (!n.read) h += '<div style="width:8px;height:8px;border-radius:50%;background:#E6B800;flex-shrink:0;margin-top:8px"></div>';
      h += '</div>';
    }
  }
  l.innerHTML = h;
}

function markR(i) { S.notifications[i].read = true; save(); updB(); openNotifPanel(); }
function closeNotifPanel() { document.getElementById('notifPanel').classList.remove('show'); }

function schedAlarms(lot) {
  var s = sp(lot.species), td = parseInt(s.days), st = new Date(lot.startDate), now = new Date(), na = [];
  if (lot.autoTurn !== false) {
    for (var d=0; d<td-3; d++) {
      var ed = new Date(st); ed.setDate(ed.getDate()+d);
      if (ed >= now) {
        [8,13,18].forEach(function(hr) {
          var t = new Date(ed); t.setHours(hr,0,0,0);
          if (t > now) na.push({id:lot.id+'_t'+d+'_'+hr, lotId:lot.id, type:'turn', title:'Virar Ovos', body:lot.name+' — '+(d+1)+'° dia', time:t.toISOString(), fired:false});
        });
      }
    }
  }
  var mkEvt = function(day, hr, type, title, body) {
    var dt = new Date(st); dt.setDate(dt.getDate()+day); dt.setHours(hr,0,0,0);
    if (dt > now) na.push({id:lot.id+'_'+type, lotId:lot.id, type:type, title:title, body:lot.name+' — '+body, time:dt.toISOString(), fired:false});
  };
  mkEvt(7, 9, 'ovoscopia', '1ª Ovoscopia', 'Dia 7. Verifique os embriões!');
  mkEvt(14, 9, 'ovoscopia', '2ª Ovoscopia', 'Dia 14. Verifique desenvolvimento!');
  mkEvt(td-3, 7, 'lockdown', 'LOCKDOWN', 'PARE de virar! Umidade '+s.humidLock+'%');
  mkEvt(td, 6, 'eclosao', 'Dia da Eclosão!', 'Hoje é o grande dia!');
  mkEvt(td+1, 8, 'retirada', 'Retirar Pintinhos', 'Transfira para o criatório.');
  S.alarms = S.alarms.filter(function(a){return a.lotId!==lot.id;}).concat(na);
  save();
}

function checkAlarms() {
  var now = new Date();
  for (var i=0; i<S.alarms.length; i++) {
    var a = S.alarms[i];
    if (!a.fired && new Date(a.time) <= now) {
      a.fired = true;
      addN(a.title+': '+a.body, a.type==='lockdown'?'warn':'info');
      if ('Notification' in window && Notification.permission === 'granted') new Notification(a.title, {body:a.body});
    }
  }
  save();
}

if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
setInterval(checkAlarms, 30000);
checkAlarms();

function nextAlarm(lid) {
  var now = new Date(), nx = null;
  for (var i=0; i<S.alarms.length; i++) {
    var a = S.alarms[i];
    if (a.lotId===lid && !a.fired && new Date(a.time)>now) {
      if (!nx || new Date(a.time)<new Date(nx.time)) nx = a;
    }
  }
  return nx;
}

function openModal(h) {
  document.getElementById('modalContent').innerHTML = h;
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('show'); }

function showConf(ti, ms, ok, lb) {
  document.getElementById('confirmContent').innerHTML =
    '<div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem"><iconify-icon icon="lucide:alert-triangle" width="28" style="color:#f87171"></iconify-icon></div>' +
    '<h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem">' + esc(ti) + '</h3>' +
    '<p style="font-size:0.875rem;color:#a3a3a3;margin-bottom:1.5rem;line-height:1.6">' + esc(ms) + '</p>' +
    '<div style="display:flex;gap:0.75rem">' +
    '<button onclick="closeConf()" style="flex:1;padding:0.75rem;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;font-weight:500;color:#a3a3a3;background:transparent;cursor:pointer;font-family:inherit">Cancelar</button>' +
    '<button id="cfmBtn" style="flex:1;padding:0.75rem;border-radius:0.75rem;border:none;background:#ef4444;font-size:0.875rem;font-weight:700;color:white;cursor:pointer;font-family:inherit">' + esc(lb||'Excluir') + '</button>' +
    '</div>';
  closeModal();
  document.getElementById('confirmOverlay').classList.add('show');
  document.getElementById('cfmBtn').onclick = function() { closeConf(); ok(); };
}
function closeConf() { document.getElementById('confirmOverlay').classList.remove('show'); }

function nav(p) {
  var all = document.querySelectorAll('.scr');
  for (var i=0; i<all.length; i++) all[i].classList.remove('on');
  var t = document.getElementById('page-'+p);
  if (t) t.classList.add('on');
  var tabs = document.querySelectorAll('.tb');
  for (var i=0; i<tabs.length; i++) { tabs[i].classList.remove('on'); tabs[i].style.color = '#737373'; }
  var at = document.querySelector('.tb[data-t="'+p+'"]');
  if (at) { at.classList.add('on'); at.style.color = ''; }
  var titles = {home:'IncubaPro',calendar:'Calendário',ai:'Assistente IA',table:'Tabela Referência',lots:'Meus Lotes',settings:'Configurações'};
  document.getElementById('hTitle').textContent = titles[p] || 'IncubaPro';
  var fns = {home:rHome,lots:rLots,calendar:rCal,ai:rAI,table:rTable,settings:rSettings};
  if (fns[p]) fns[p]();
  document.getElementById('mainArea').scrollTop = 0;
}

function rHome() {
  var pg = document.getElementById('page-home'), act = active(), h = '';
  if (!act) {
    h += '<div style="text-align:center;padding:2rem 0 1.5rem"><div style="width:5rem;height:5rem;border-radius:50%;background:#111;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem"><iconify-icon icon="lucide:egg" width="32" style="color:#404040"></iconify-icon></div><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Nenhum lote ativo</h2><p style="font-size:0.875rem;color:#737373;line-height:1.6;max-width:20rem;margin:0 auto 1.5rem">Crie seu primeiro lote para acompanhar toda a incubação.</p><button onclick="openCreateLot()" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C 0%,#E6B800 100%);color:#050505;font-size:0.875rem;font-weight:700;border:none;cursor:pointer;font-family:inherit"><iconify-icon icon="lucide:plus" width="18"></iconify-icon>Criar Lote</button></div>';
    h += '<div style="display:flex;flex-direction:column;gap:0.75rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Dicas Rápidas</h3>';
    for (var i=0; i<3; i++) {
      h += '<div style="display:flex;gap:0.75rem;padding:0.875rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><iconify-icon icon="lucide:lightbulb" width="16" style="color:#E6B800;flex-shrink:0;margin-top:2px"></iconify-icon><p style="font-size:0.75rem;color:#a3a3a3;line-height:1.5">'+TIPS[i]+'</p></div>';
    }
    h += '</div>';
  } else {
    var s = sp(act.species), dd = ds(act.startDate), td = parseInt(s.days), pct = Math.min(100,Math.round(dd/td*100)), isLock = dd>=td-3, isDone = dd>=td, na = nextAlarm(act.id);
    var sc = isDone?'color:#34d399':isLock?'color:#fbbf24':'color:#E6B800';
    var stx = isDone?'Eclosão!':isLock?'Lockdown':'Incubando';
    var sbg = isDone?'background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2)':isLock?'background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2)':'background:rgba(230,184,0,0.1);border:1px solid rgba(230,184,0,0.2)';
    h += '<div style="padding:1.25rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:1rem">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:1.125rem;font-weight:700">'+esc(act.name)+'</h2><p style="font-size:0.75rem;color:#737373;margin-top:2px">'+s.emoji+' '+act.species+' · '+act.eggs+' ovos · '+fmtDate(act.startDate)+'</p></div><div style="padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.625rem;font-weight:700;'+sbg+';'+sc+'">'+stx+'</div></div>';
    h += '<div><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.5rem"><span style="color:#737373">Dia <span style="color:white;font-weight:700">'+Math.min(dd+1,td)+'</span> de '+td+'</span><span style="color:#737373">'+pct+'%</span></div><div style="height:0.625rem;border-radius:9999px;background:#111;overflow:hidden"><div style="height:100%;border-radius:9999px;background:linear-gradient(135deg,#F2C94C,#E6B800);width:'+pct+'%;transition:width 0.7s"></div></div></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem">';
    h += '<div style="text-align:center;padding:0.75rem;border-radius:0.75rem;background:rgba(5,5,5,0.5)"><iconify-icon icon="lucide:thermometer" width="18" style="color:#fb923c;display:block;margin-bottom:4px"></iconify-icon><p style="font-size:0.625rem;color:#525252">Temperatura</p><p style="font-size:0.875rem;font-weight:700;margin-top:2px">'+s.temp+'°C</p></div>';
    h += '<div style="text-align:center;padding:0.75rem;border-radius:0.75rem;background:rgba(5,5,5,0.5)"><iconify-icon icon="lucide:droplets" width="18" style="color:#60a5fa;display:block;margin-bottom:4px"></iconify-icon><p style="font-size:0.625rem;color:#525252">Umidade</p><p style="font-size:0.875rem;font-weight:700;margin-top:2px">'+(isLock?s.humidLock:s.humid)+'%</p></div>';
    h += '<div style="text-align:center;padding:0.75rem;border-radius:0.75rem;background:rgba(5,5,5,0.5)"><iconify-icon icon="lucide:rotate-cw" width="18" style="color:#a78bfa;display:block;margin-bottom:4px"></iconify-icon><p style="font-size:0.625rem;color:#525252">Viragens</p><p style="font-size:0.875rem;font-weight:700;margin-top:2px">'+(isLock?'—':s.turns)+'</p></div>';
    h += '</div>';
    if (na) {
      var diff = new Date(na.time)-new Date(), hrs = Math.floor(diff/3600000), mins = Math.floor((diff%3600000)/60000), lbl = hrs>24 ? Math.floor(hrs/24)+'d '+hrs%24+'h' : hrs+'h '+mins+'m';
      h += '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:0.75rem;background:rgba(5,5,5,0.5);border:1px solid rgba(255,255,255,0.05)"><div style="width:2.25rem;height:2.25rem;border-radius:0.5rem;background:rgba(230,184,0,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="lucide:clock" width="18" style="color:#E6B800"></iconify-icon></div><div style="flex:1;min-width:0"><p style="font-size:0.75rem;font-weight:600;color:#d4d4d4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+na.title+'</p><p style="font-size:0.625rem;color:#525252;margin-top:2px">em '+lbl+'</p></div></div>';
    }
    if (isLock && !isDone) {
      h += '<div style="padding:0.875rem;border-radius:0.75rem;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.2);display:flex;gap:0.75rem"><iconify-icon icon="lucide:alert-triangle" width="18" style="color:#fbbf24;flex-shrink:0;margin-top:2px"></iconify-icon><div><p style="font-size:0.75rem;font-weight:700;color:#fcd34d">Período de Lockdown</p><p style="font-size:0.625rem;color:rgba(251,191,36,0.6);margin-top:2px;line-height:1.5">Não abra a incubadora. Umidade deve estar em '+s.humidLock+'%.</p></div></div>';
    }
    if (isDone) {
      h += '<div style="padding:0.875rem;border-radius:0.75rem;background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.2);display:flex;gap:0.75rem"><iconify-icon icon="lucide:party-popper" width="18" style="color:#34d399;flex-shrink:0;margin-top:2px"></iconify-icon><div><p style="font-size:0.75rem;font-weight:700;color:#6ee7b7">Dia da Eclosão!</p><p style="font-size:0.625rem;color:rgba(52,211,153,0.6);margin-top:2px;line-height:1.5">Acompanhe de perto. Não ajude o pintinho a sair do ovo.</p></div></div>';
    }
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem"><button onclick="openAddReading()" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.875rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font-size:0.875rem;font-weight:500;color:white;cursor:pointer;font-family:inherit"><iconify-icon icon="lucide:thermometer" width="16" style="color:#E6B800"></iconify-icon>Registrar Leitura</button><button onclick="nav(\'ai\')" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.875rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font-size:0.875rem;font-weight:500;color:white;cursor:pointer;font-family:inherit"><iconify-icon icon="lucide:bot" width="16" style="color:#E6B800"></iconify-icon>Perguntar à IA</button></div>';
    var tip = TIPS[Math.floor(Math.random()*TIPS.length)];
    h += '<div style="display:flex;gap:0.75rem;padding:0.875rem;border-radius:0.75rem;background:rgba(230,184,0,0.05);border:1px solid rgba(230,184,0,0.1)"><iconify-icon icon="lucide:lightbulb" width="16" style="color:#E6B800;flex-shrink:0;margin-top:2px"></iconify-icon><p style="font-size:0.75rem;color:#a3a3a3;line-height:1.5">'+tip+'</p></div>';
    if (S.lots.length > 1) {
      h += '<div style="display:flex;flex-direction:column;gap:0.5rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Outros Lotes</h3>';
      for (var i=0; i<S.lots.length; i++) {
        var l = S.lots[i]; if (l.id===S.activeLotId) continue;
        var s2 = sp(l.species), dd2 = ds(l.startDate), td2 = parseInt(s2.days), dn2 = dd2>=td2;
        h += '<div class="lot-card" style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);cursor:pointer" onclick="switchLot(\''+l.id+'\')"><div style="width:2.5rem;height:2.5rem;border-radius:0.5rem;'+(dn2?'background:rgba(52,211,153,0.1)':'background:rgba(255,255,255,0.03)')+';display:flex;align-items:center;justify-content:center;font-size:1.125rem">'+s2.emoji+'</div><div style="flex:1;min-width:0"><p style="font-size:0.875rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(l.name)+'</p><p style="font-size:0.625rem;color:#525252">'+l.species+' · '+l.eggs+' ovos</p></div><iconify-icon icon="lucide:chevron-right" width="16" style="color:#404040"></iconify-icon></div>';
      }
      h += '</div>';
    }
  }
  pg.innerHTML = h;
}

function openCreateLot() {
  var h = '<div style="background:#111;border-radius:1.5rem 1.5rem 0 0;padding:1.5rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;gap:1.25rem">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:1rem;font-weight:700">Novo Lote</h3><button onclick="closeModal()" style="background:none;border:none;color:#737373;cursor:pointer;padding:4px"><iconify-icon icon="lucide:x" width="20"></iconify-icon></button></div>';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Nome do Lote</label><input id="lotName" type="text" placeholder="Ex: Lote 01 - Galinha" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div>';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Espécie</label><select id="lotSpecies" onchange="toggleOutra()" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit;appearance:none">';
  for (var i=0; i<SPECIES.length; i++) {
    if (SPECIES[i].name === 'Outra') {
      h += '<option value="__outra__">'+SPECIES[i].emoji+' '+SPECIES[i].name+'</option>';
    } else {
      h += '<option value="'+SPECIES[i].name+'">'+SPECIES[i].emoji+' '+SPECIES[i].name+' ('+SPECIES[i].days+' dias)</option>';
    }
  }
  h += '</select></div>';
  h += '<div id="outraFields" style="display:none;flex-direction:column;gap:0.75rem">';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Nome da Espécie</label><input id="outraNome" type="text" placeholder="Ex: Calopsita" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem"><div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Dias de Incubação</label><input id="outraDias" type="number" min="1" max="120" placeholder="21" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div><div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Temperatura (°C)</label><input id="outraTemp" type="text" placeholder="37.5" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div></div></div>';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Quantidade de Ovos</label><input id="lotEggs" type="number" min="1" max="999" placeholder="Ex: 24" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div>';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Data de Início</label><input id="lotDate" type="date" value="'+new Date().toISOString().split('T')[0]+'" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit;color-scheme:dark"></div>';
  h += '<label style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);cursor:pointer"><input type="checkbox" id="lotAutoTurn" checked style="width:1rem;height:1rem;border-radius:4px;accent-color:#E6B800"><span style="font-size:0.75rem;color:#d4d4d4">Lembretes automáticos de viragem (3x/dia)</span></label>';
  h += '<button onclick="createLot()" style="width:100%;padding:0.875rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C,#E6B800);color:#050505;font-size:0.875rem;font-weight:700;border:none;cursor:pointer;font-family:inherit">Criar Lote</button>';
  h += '</div>';
  openModal(h);
}

function toggleOutra() {
  var sel = document.getElementById('lotSpecies');
  var f = document.getElementById('outraFields');
  f.style.display = sel.value === '__outra__' ? 'flex' : 'none';
}

function createLot() {
  var species = document.getElementById('lotSpecies').value;
  var name = document.getElementById('lotName').value.trim();
  var eggs = parseInt(document.getElementById('lotEggs').value);
  var date = document.getElementById('lotDate').value;
  var auto = document.getElementById('lotAutoTurn').checked;

  if (species === '__outra__') {
    var onome = document.getElementById('outraNome').value.trim();
    var odias = parseInt(document.getElementById('outraDias').value);
    var otemp = document.getElementById('outraTemp').value.trim();
    if (!onome) { toast('Digite o nome da espécie'); return; }
    if (!odias || odias < 1) { toast('Digite os dias de incubação'); return; }
    if (!otemp) { toast('Digite a temperatura'); return; }
    SPECIES.push({name:onome, days:odias, temp:otemp, humid:'55-60', humidLock:'65-70', turns:'3x/dia', emoji:'🥚'});
    species = onome;
  }

  if (!name) { toast('Digite um nome para o lote'); return; }
  if (!eggs || eggs<1) { toast('Digite a quantidade de ovos'); return; }
  if (!date) { toast('Selecione a data de início'); return; }

  var lot = {id:gid(), name:name, species:species, eggs:eggs, startDate:date, autoTurn:auto, createdAt:new Date().toISOString()};
  S.lots.push(lot); S.activeLotId = lot.id; schedAlarms(lot); save();
  closeModal(); toast('Lote criado com sucesso!');
  addN('Lote "'+name+'" criado — '+eggs+' ovos de '+species, 'success');
  nav('home');
}

function switchLot(id) { S.activeLotId = id; save(); nav('home'); }

function rLots() {
  var pg = document.getElementById('page-lots'), h = '';
  h += '<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font-size:1.125rem;font-weight:700">Meus Lotes</h2><button onclick="openCreateLot()" style="display:flex;align-items:center;gap:6px;padding:0.5rem 0.875rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C,#E6B800);color:#050505;font-size:0.75rem;font-weight:700;border:none;cursor:pointer;font-family:inherit"><iconify-icon icon="lucide:plus" width="14"></iconify-icon>Novo</button></div>';
  if (!S.lots.length) {
    h += '<div style="text-align:center;padding:4rem 0"><iconify-icon icon="lucide:layers" width="40" style="color:#262626;display:block;margin-bottom:0.75rem"></iconify-icon><p style="font-size:0.875rem;color:#525252">Nenhum lote criado ainda</p></div>';
  }
  for (var i=0; i<S.lots.length; i++) {
    var l = S.lots[i], s = sp(l.species), dd = ds(l.startDate), td = parseInt(s.days), pct = Math.min(100,Math.round(dd/td*100)), isLock = dd>=td-3, isDone = dd>=td, isActive = l.id===S.activeLotId;
    var sc = isDone?'color:#34d399':isLock?'color:#fbbf24':'color:#E6B800';
    var stx = isDone?'Eclosão':isLock?'Lockdown':'Dia '+Math.min(dd+1,td);
    var sb = isDone?'border-color:rgba(52,211,153,0.3)':isLock?'border-color:rgba(251,191,36,0.3)':isActive?'border-color:rgba(230,184,0,0.3)':'border-color:rgba(255,255,255,0.05)';
    var bg = isActive?'background:rgba(255,255,255,0.04)':'background:rgba(255,255,255,0.02)';
    h += '<div class="lot-card" style="padding:1rem;border-radius:1rem;'+bg+';border:1px solid;'+sb+';'+(isActive?'box-shadow:0 0 0 1px rgba(230,184,0,0.1)':'')+'">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem"><div style="display:flex;align-items:center;gap:0.75rem"><div style="width:2.75rem;height:2.75rem;border-radius:0.5rem;'+(isDone?'background:rgba(52,211,153,0.1)':isLock?'background:rgba(251,191,36,0.1)':'background:rgba(230,184,0,0.1)')+';display:flex;align-items:center;justify-content:center;font-size:1.25rem">'+s.emoji+'</div><div><p style="font-size:0.875rem;font-weight:700">'+esc(l.name)+(isActive?' <span style="font-size:0.5625rem;font-weight:700;padding:2px 6px;border-radius:9999px;background:rgba(230,184,0,0.15);color:#E6B800;margin-left:4px">ATIVO</span>':'')+'</p><p style="font-size:0.625rem;color:#525252;margin-top:2px">'+l.species+' · '+l.eggs+' ovos · '+fmtDate(l.startDate)+'</p></div></div><div style="display:flex;gap:4px"><button onclick="event.stopPropagation();switchLot(\''+l.id+'\')" style="width:2rem;height:2rem;border-radius:0.5rem;background:rgba(255,255,255,0.05);border:none;color:#737373;cursor:pointer;display:flex;align-items:center;justify-content:center"><iconify-icon icon="lucide:target" width="14"></iconify-icon></button><button onclick="event.stopPropagation();delLot(\''+l.id+'\',\''+esc(l.name)+'\')" style="width:2rem;height:2rem;border-radius:0.5rem;background:rgba(255,255,255,0.05);border:none;color:#737373;cursor:pointer;display:flex;align-items:center;justify-content:center"><iconify-icon icon="lucide:trash-2" width="14"></iconify-icon></button></div></div>';
    h += '<div style="display:flex;align-items:center;gap:0.75rem"><div style="flex:1;height:6px;border-radius:9999px;background:#111;overflow:hidden"><div style="height:100%;border-radius:9999px;'+(isDone?'background:#34d399':isLock?'background:#fbbf24':'background:linear-gradient(135deg,#F2C94C,#E6B800)')+';width:'+pct+'%;transition:width 0.7s"></div></div><span style="font-size:0.625rem;font-weight:700;'+sc+';flex-shrink:0">'+stx+'</span><span style="font-size:0.625rem;color:#404040">'+pct+'%</span></div>';
    h += '</div>';
  }
  pg.innerHTML = h;
}

function delLot(id, name) {
  showConf('Excluir Lote', 'Tem certeza que deseja excluir "'+name+'"? Todos os dados serão perdidos.', function() {
    S.lots = S.lots.filter(function(l){return l.id!==id;});
    S.alarms = S.alarms.filter(function(a){return a.lotId!==id;});
    S.readings = S.readings.filter(function(r){return r.lotId!==id;});
    if (S.activeLotId===id) S.activeLotId = S.lots.length ? S.lots[0].id : null;
    save(); toast('Lote excluído'); nav('lots');
  });
}

function openAddReading() {
  var act = active(); if (!act) { toast('Nenhum lote ativo'); return; }
  var h = '<div style="background:#111;border-radius:1.5rem 1.5rem 0 0;padding:1.5rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;gap:1.25rem">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:1rem;font-weight:700">Registrar Leitura</h3><button onclick="closeModal()" style="background:none;border:none;color:#737373;cursor:pointer;padding:4px"><iconify-icon icon="lucide:x" width="20"></iconify-icon></button></div>';
  h += '<p style="font-size:0.75rem;color:#737373">'+esc(act.name)+' — '+act.species+'</p>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem"><div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Temperatura (°C)</label><input id="rdTemp" type="number" step="0.1" placeholder="37.5" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div><div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Umidade (%)</label><input id="rdHumid" type="number" step="1" placeholder="60" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit"></div></div>';
  h += '<div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Observações (opcional)</label><textarea id="rdNote" rows="2" placeholder="Ex: Temperatura estável..." style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:#050505;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit;resize:none"></textarea></div>';
  h += '<button onclick="saveReading()" style="width:100%;padding:0.875rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C,#E6B800);color:#050505;font-size:0.875rem;font-weight:700;border:none;cursor:pointer;font-family:inherit">Salvar Leitura</button>';
  h += '</div>';
  openModal(h);
}

function saveReading() {
  var act = active(); if (!act) return;
  var t = parseFloat(document.getElementById('rdTemp').value);
  var hu = parseFloat(document.getElementById('rdHumid').value);
  var n = document.getElementById('rdNote').value.trim();
  if (isNaN(t)) { toast('Digite a temperatura'); return; }
  if (isNaN(hu)) { toast('Digite a umidade'); return; }
  S.readings.push({lotId:act.id, temp:t, humid:hu, note:n, time:new Date().toISOString()});
  save(); closeModal(); toast('Leitura registrada!');
  addN('Leitura: '+t+'°C / '+hu+'% — '+act.name, 'info');
  nav('home');
}

function rCal() {
  var pg = document.getElementById('page-calendar'), act = active(), h = '';
  h += '<h2 style="font-size:1.125rem;font-weight:700">Calendário</h2>';
  if (!act) { h += '<div style="text-align:center;padding:4rem 0"><iconify-icon icon="lucide:calendar" width="40" style="color:#262626;display:block;margin-bottom:0.75rem"></iconify-icon><p style="font-size:0.875rem;color:#525252">Ative um lote para ver o calendário</p></div>'; pg.innerHTML=h; return; }
  var s = sp(act.species), td = parseInt(s.days), y = S.calYear, m = S.calMonth;
  var fDay = (new Date(y,m,1).getDay()+6)%7, daysIn = new Date(y,m+1,0).getDate();
  var mNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var dNames = ['S','T','Q','Q','S','S','D'];
  h += '<div style="display:flex;justify-content:space-between;align-items:center"><button onclick="chCal(-1)" style="width:2.25rem;height:2.25rem;border-radius:0.75rem;background:rgba(255,255,255,0.05);border:none;color:#a3a3a3;cursor:pointer;display:flex;align-items:center;justify-content:center"><iconify-icon icon="lucide:chevron-left" width="18"></iconify-icon></button><span style="font-size:0.875rem;font-weight:700">'+mNames[m]+' '+y+'</span><button onclick="chCal(1)" style="width:2.25rem;height:2.25rem;border-radius:0.75rem;background:rgba(255,255,255,0.05);border:none;color:#a3a3a3;cursor:pointer;display:flex;align-items:center;justify-content:center"><iconify-icon icon="lucide:chevron-right" width="18"></iconify-icon></button></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-bottom:4px">';
  for (var i=0;i<7;i++) h += '<div style="font-size:0.625rem;font-weight:600;color:#525252;padding:4px 0">'+dNames[i]+'</div>';
  h += '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';
  for (var i=0;i<fDay;i++) h += '<div style="height:2.5rem"></div>';
  var startD=new Date(act.startDate); startD.setHours(0,0,0,0);
  var lockD=new Date(startD); lockD.setDate(lockD.getDate()+td-3);
  var hatchD=new Date(startD); hatchD.setDate(hatchD.getDate()+td);
  var ovo1=new Date(startD); ovo1.setDate(ovo1.getDate()+7);
  var ovo2=new Date(startD); ovo2.setDate(ovo2.getDate()+14);
  var today=new Date(); today.setHours(0,0,0,0);
  for (var d=1;d<=daysIn;d++) {
    var cur=new Date(y,m,d); cur.setHours(0,0,0,0);
    var isStart=cur.getTime()===startD.getTime(), isLock=cur>=lockD&&cur<hatchD, isHatch=cur.getTime()===hatchD.getTime(), isOvo1=cur.getTime()===ovo1.getTime(), isOvo2=cur.getTime()===ovo2.getTime(), isToday=cur.getTime()===today.getTime(), isRange=cur>=startD&&cur<=hatchD;
    var cls='height:2.5rem;border-radius:0.75rem;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.75rem;position:relative;';
    if (isHatch) cls+='background:rgba(230,184,0,0.2);color:#FFD369;font-weight:700';
    else if (isLock) cls+='background:rgba(251,191,36,0.1);color:#fcd34d';
    else if (isRange) cls+='background:rgba(255,255,255,0.04);color:#d4d4d4';
    else if (isToday) cls+='background:rgba(255,255,255,0.06);color:white;font-weight:700';
    else cls+='color:#525252';
    if (isToday&&isRange) cls+=';box-shadow:inset 0 0 0 1px rgba(230,184,0,0.4)';
    h += '<div style="'+cls+'"><span>'+d+'</span>';
    var dots=[];
    if (isStart) dots.push('#E6B800');
    if (isOvo1||isOvo2) dots.push('#60a5fa');
    if (isLock) dots.push('#fbbf24');
    if (isHatch) dots.push('#FFD369');
    if (dots.length) { h += '<div style="display:flex;gap:2px;margin-top:2px">'; for(var j=0;j<dots.length;j++) h+='<div style="width:4px;height:4px;border-radius:50%;background:'+dots[j]+'"></div>'; h+='</div>'; }
    h += '</div>';
  }
  h += '</div>';
  h += '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Marcadores</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem"><div style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="width:10px;height:10px;border-radius:50%;background:#E6B800"></div><span style="font-size:0.625rem;color:#a3a3a3">Início</span></div><div style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="width:10px;height:10px;border-radius:50%;background:#60a5fa"></div><span style="font-size:0.625rem;color:#a3a3a3">Ovoscopia D7/D14</span></div><div style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="width:10px;height:10px;border-radius:50%;background:#fbbf24"></div><span style="font-size:0.625rem;color:#a3a3a3">Lockdown D'+(td-2)+'-D'+td+'</span></div><div style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="width:10px;height:10px;border-radius:50%;background:#FFD369"></div><span style="font-size:0.625rem;color:#a3a3a3">Eclosão D'+td+'</span></div></div></div>';
  var readings = S.readings.filter(function(r){return r.lotId===act.id;});
  if (readings.length) {
    h += '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Últimas Leituras</h3>';
    var last = readings.slice(-5).reverse();
    for (var i=0;i<last.length;i++) {
      var r = last[i], dt = new Date(r.time);
      h += '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05)"><div style="width:2rem;height:2rem;border-radius:0.5rem;background:rgba(251,146,60,0.1);display:flex;align-items:center;justify-content:center"><iconify-icon icon="lucide:thermometer" width="14" style="color:#fb923c"></iconify-icon></div><div style="flex:1"><p style="font-size:0.75rem;font-weight:600">'+r.temp+'°C / '+r.humid+'%</p>'+(r.note?'<p style="font-size:0.625rem;color:#525252;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(r.note)+'</p>':'')+'</div><span style="font-size:0.625rem;color:#404040">'+dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+'</span></div>';
    }
    h += '</div>';
  }
  pg.innerHTML = h;
}

function chCal(dir) {
  S.calMonth += dir;
  if (S.calMonth>11) { S.calMonth=0; S.calYear++; }
  else if (S.calMonth<0) { S.calMonth=11; S.calYear--; }
  save(); rCal();
}

function rTable() {
  var pg = document.getElementById('page-table'), h = '';
  h += '<h2 style="font-size:1.125rem;font-weight:700">Tabela de Referência</h2><p style="font-size:0.75rem;color:#737373">Parâmetros ideais por espécie</p>';
  h += '<div style="display:flex;flex-direction:column;gap:0.5rem">';
  for (var i=0;i<SPECIES.length;i++) {
    if (SPECIES[i].name === 'Outra') continue;
    var s = SPECIES[i];
    h += '<div style="padding:1rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:0.75rem"><div style="display:flex;align-items:center;gap:0.75rem"><div style="width:2.75rem;height:2.75rem;border-radius:0.5rem;background:rgba(230,184,0,0.1);display:flex;align-items:center;justify-content:center;font-size:1.25rem">'+s.emoji+'</div><div><p style="font-size:0.875rem;font-weight:700">'+s.name+'</p><p style="font-size:0.625rem;color:#525252">Período: '+s.days+' dias</p></div></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem"><div style="padding:0.625rem;border-radius:0.5rem;background:rgba(5,5,5,0.6)"><p style="font-size:0.625rem;color:#525252;margin-bottom:2px">Temperatura</p><p style="font-size:0.75rem;font-weight:700;color:#fdba74">'+s.temp+'°C</p></div><div style="padding:0.625rem;border-radius:0.5rem;background:rgba(5,5,5,0.6)"><p style="font-size:0.625rem;color:#525252;margin-bottom:2px">Umidade</p><p style="font-size:0.75rem;font-weight:700;color:#93c5fd">'+s.humid+'%</p></div><div style="padding:0.625rem;border-radius:0.5rem;background:rgba(5,5,5,0.6)"><p style="font-size:0.625rem;color:#525252;margin-bottom:2px">Umidade Lock</p><p style="font-size:0.75rem;font-weight:700;color:#fcd34d">'+s.humidLock+'%</p></div><div style="padding:0.625rem;border-radius:0.5rem;background:rgba(5,5,5,0.6)"><p style="font-size:0.625rem;color:#525252;margin-bottom:2px">Viragens</p><p style="font-size:0.75rem;font-weight:700;color:#c4b5fd">'+s.turns+'</p></div></div>';
    var ld = parseInt(s.days)-3;
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap"><span style="font-size:0.5625rem;padding:2px 8px;border-radius:9999px;background:rgba(96,165,250,0.1);color:#60a5fa;border:1px solid rgba(96,165,250,0.2)">Ovoscopia D7</span><span style="font-size:0.5625rem;padding:2px 8px;border-radius:9999px;background:rgba(96,165,250,0.1);color:#60a5fa;border:1px solid rgba(96,165,250,0.2)">Ovoscopia D14</span><span style="font-size:0.5625rem;padding:2px 8px;border-radius:9999px;background:rgba(251,191,36,0.1);color:#fbbf24;border:1px solid rgba(251,191,36,0.2)">Lockdown D'+ld+'</span><span style="font-size:0.5625rem;padding:2px 8px;border-radius:9999px;background:rgba(230,184,0,0.1);color:#E6B800;border:1px solid rgba(230,184,0,0.2)">Eclosão D'+s.days+'</span></div>';
    h += '</div>';
  }
  h += '</div>';
  pg.innerHTML = h;
}

var aiBusy = false;

function rAI() {
  var pg = document.getElementById('page-ai'), h = '';
  if (!S.apiKey) {
    h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:1.5rem"><div class="float-anim" style="width:5rem;height:5rem;border-radius:50%;background:linear-gradient(135deg,#F2C94C,#E6B800);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;box-shadow:0 0 40px -5px rgba(242,201,76,0.4)"><iconify-icon icon="lucide:bot" width="32" style="color:#050505"></iconify-icon></div><h3 style="font-size:1.125rem;font-weight:700;margin-bottom:0.5rem">Assistente de Incubação</h3><p style="font-size:0.75rem;color:#737373;text-align:center;line-height:1.6;max-width:20rem;margin-bottom:2rem">Para usar o chat com IA, precisamos da sua chave da Groq. É gratuita e leva 1 minuto para criar.</p>';
    h += '<div style="width:100%;display:flex;flex-direction:column;gap:1rem"><div><label style="font-size:0.75rem;font-weight:600;color:#a3a3a3;display:block;margin-bottom:6px">Sua Chave API Groq</label><input id="groqKeyInput" type="password" placeholder="gsk_" style="width:100%;padding:0.875rem 1rem;border-radius:0.75rem;background:#111;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:monospace"></div>';
    h += '<a href="https://console.groq.com/keys" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);font-size:0.75rem;font-weight:500;color:#d4d4d4;text-decoration:none"><iconify-icon icon="lucide:external-link" width="14" style="color:#E6B800"></iconify-icon>Criar chave gratuita no site da Groq</a>';
    h += '<button onclick="saveGroqKey()" style="width:100%;padding:0.875rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C,#E6B800);color:#050505;font-size:0.875rem;font-weight:700;border:none;cursor:pointer;font-family:inherit">Salvar e Começar</button>';
    h += '<p style="font-size:0.625rem;color:#404040;text-align:center">Sua chave fica salva apenas no seu dispositivo.</p></div></div>';
    pg.innerHTML = h; return;
  }
  h += '<div style="display:flex;flex-direction:column;height:100%"><div id="chatContainer" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;padding:4px 4px 0.75rem">';
  if (!S.chatHistory.length) {
    h += '<div style="text-align:center;padding:2.5rem 0"><div style="width:4rem;height:4rem;border-radius:50%;background:linear-gradient(135deg,#F2C94C,#E6B800);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;box-shadow:0 0 30px -5px rgba(242,201,76,0.4)"><iconify-icon icon="lucide:bot" width="28" style="color:#050505"></iconify-icon></div><h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem">Assistente de Incubação</h3><p style="font-size:0.75rem;color:#737373;line-height:1.6;max-width:20rem;margin:0 auto 1.5rem">Pergunte sobre temperatura, umidade, ovoscopia, problemas na incubação e muito mais.</p>';
    h += '<div style="display:flex;flex-direction:column;gap:0.5rem;max-width:20rem;margin:0 auto"><button onclick="sendQ(\'Quais os parâmetros ideais para incubar ovos de galinha?\')" style="width:100%;text-align:left;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font-size:0.75rem;color:#a3a3a3;cursor:pointer;font-family:inherit">Quais os parâmetros ideais para galinha?</button><button onclick="sendQ(\'Como fazer ovoscopia corretamente?\')" style="width:100%;text-align:left;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font-size:0.75rem;color:#a3a3a3;cursor:pointer;font-family:inherit">Como fazer ovoscopia?</button><button onclick="sendQ(\'Meu ovo está trincado durante a incubação, o que faço?\')" style="width:100%;text-align:left;padding:0.75rem;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font-size:0.75rem;color:#a3a3a3;cursor:pointer;font-family:inherit">Ovo trincado, o que fazer?</button></div></div>';
  } else {
    for (var i=0; i<S.chatHistory.length; i++) {
      var m = S.chatHistory[i];
      if (m.role==='user') h += '<div class="msg" style="display:flex;justify-content:flex-end"><div style="max-width:80%;padding:0.625rem 1rem;border-radius:1rem 1rem 0.25rem 1rem;background:rgba(230,184,0,0.15);border:1px solid rgba(230,184,0,0.2);font-size:0.875rem;color:#FDEEbb;line-height:1.5">'+esc(m.content)+'</div></div>';
      else h += '<div class="msg" style="display:flex;gap:0.5rem"><div style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:linear-gradient(135deg,#F2C94C,#E6B800);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px"><iconify-icon icon="lucide:bot" width="14" style="color:#050505"></iconify-icon></div><div style="max-width:85%;padding:0.625rem 1rem;border-radius:1rem 1rem 1rem 0.25rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.05);font-size:0.875rem;color:#d4d4d4;line-height:1.5">'+formatAI(m.content)+'</div></div>';
    }
  }
  h += '</div>';
  h += '<div style="flex-shrink:0;padding-top:0.5rem;border-top:1px solid rgba(255,255,255,0.05)"><div style="display:flex;gap:0.5rem"><input id="aiInput" type="text" placeholder="Sua pergunta sobre incubação..." style="flex:1;padding:0.75rem 1rem;border-radius:0.75rem;background:#111;border:1px solid rgba(255,255,255,0.1);font-size:0.875rem;color:white;font-family:inherit" onkeydown="if(event.key===\'Enter\')sendAI()"><button onclick="sendAI()" id="aiSendBtn" style="width:2.75rem;height:2.75rem;border-radius:0.75rem;background:linear-gradient(135deg,#F2C94C,#E6B800);border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;box-shadow:0 0 20px -5px rgba(242,201,76,0.3)"><iconify-icon icon="lucide:send" width="16" style="color:#050505"></iconify-icon></button></div></div></div>';
  pg.innerHTML = h;
  var cc = document.getElementById('chatContainer'); if (cc) cc.scrollTop = cc.scrollHeight;
}

function saveGroqKey() {
  var k = document.getElementById('groqKeyInput').value.trim();
  if (!k || k.indexOf('gsk_')!==0) { toast('Cole uma chave válida começando com gsk_'); return; }
  S.apiKey = k; save(); toast('Chave salva!'); rAI();
}

function formatAI(t) { return esc(t).replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong style="color:white">$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>'); }
function sendQ(q) { var inp=document.getElementById('aiInput'); if(inp){inp.value=q;sendAI();} }

function sendAI() {
  if (aiBusy) return;
  var inp = document.getElementById('aiInput'); if (!inp) return;
  var q = inp.value.trim(); if (!q) return; inp.value = '';
  S.chatHistory.push({role:'user',content:q}); save(); renderChat();
  aiBusy = true;
  var btn = document.getElementById('aiSendBtn');
  if (btn) btn.innerHTML = '<iconify-icon icon="lucide:loader-2" width="16" style="color:#050505" class="animate-spin"></iconify-icon>';
  var cc = document.getElementById('chatContainer');
  var tip = document.createElement('div'); tip.id = 'aiTyping'; tip.className = 'msg';
  tip.style.cssText = 'display:flex;gap:0.5rem';
  tip.innerHTML = '<div style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:linear-gradient(135deg,#F2C94C,#E6B800);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px"><iconify-icon icon="lucide:bot" width="14" style="color:#050505"></iconify-icon></div><div style="padding:0.75rem 1rem;border-radius:1rem 1rem 1rem 0.25rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.05);display:flex;gap:4px"><div class="tp" style="width:8px;height:8px;border-radius:50%;background:#E6B800"></div><div class="tp" style="width:8px;height:8px;border-radius:50%;background:#E6B800"></div><div class="tp" style="width:8px;height:8px;border-radius:50%;background:#E6B800"></div></div>';
  cc.appendChild(tip); cc.scrollTop = cc.scrollHeight;
  var sys = 'Você é o IncubaPro AI, um assistente especialista em incubação de ovos de aves. Responda sempre em português do Brasil, de forma clara e objetiva. Use **negrito** para destacar valores importantes. ';
  var act = active();
  if (act) { var s=sp(act.species),dd=ds(act.startDate); sys+='Lote ativo: "'+act.name+'", espécie: '+act.species+', '+act.eggs+' ovos, dia '+Math.min(dd+1,parseInt(s.days))+' de '+s.days+', temperatura ideal: '+s.temp+'°C, umidade: '+s.humid+'%.'; }
  else { sys+='Nenhum lote ativo no momento.'; }
  sys+=' Dados de referência: '+JSON.stringify(SPECIES)+'. Seja prestativo mas conciso.';
  var msgs = [{role:'system',content:sys}];
  var hist = S.chatHistory.slice(-10);
  for (var i=0;i<hist.length;i++) msgs.push({role:hist[i].role,content:hist[i].content});
  fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+S.apiKey},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:msgs,max_tokens:600,temperature:0.6})}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){var tx=d.choices&&d.choices[0]&&d.choices[0].message?d.choices[0].message.content:'Desculpe, não consegui gerar uma resposta.';S.chatHistory.push({role:'assistant',content:tx});if(S.chatHistory.length>30)S.chatHistory=S.chatHistory.slice(-30);save();}).catch(function(e){if(e.message==='401'){S.apiKey='';save();S.chatHistory.push({role:'assistant',content:'Chave inválida. Por favor, insira uma chave válida da Groq.'});}else{S.chatHistory.push({role:'assistant',content:'Erro de conexão. Verifique sua internet e tente novamente.'});}save();}).finally(function(){aiBusy=false;var t=document.getElementById('aiTyping');if(t)t.remove();renderChat();if(btn)btn.innerHTML='<iconify-icon icon="lucide:send" width="16" style="color:#050505"></iconify-icon>';});
}

function renderChat() {
  var cc = document.getElementById('chatContainer'); if (!cc) return; var h = '';
  for (var i=0;i<S.chatHistory.length;i++) {
    var m = S.chatHistory[i];
    if (m.role==='user') h += '<div class="msg" style="display:flex;justify-content:flex-end"><div style="max-width:80%;padding:0.625rem 1rem;border-radius:1rem 1rem 0.25rem 1rem;background:rgba(230,184,0,0.15);border:1px solid rgba(230,184,0,0.2);font-size:0.875rem;color:#FDEEbb;line-height:1.5">'+esc(m.content)+'</div></div>';
    else h += '<div class="msg" style="display:flex;gap:0.5rem"><div style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:linear-gradient(135deg,#F2C94C,#E6B800);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px"><iconify-icon icon="lucide:bot" width="14" style="color:#050505"></iconify-icon></div><div style="max-width:85%;padding:0.625rem 1rem;border-radius:1rem 1rem 1rem 0.25rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.05);font-size:0.875rem;color:#d4d4d4;line-height:1.5">'+formatAI(m.content)+'</div></div>';
  }
  cc.innerHTML = h; cc.scrollTop = cc.scrollHeight;
}

function rSettings() {
  var pg = document.getElementById('page-settings'), h = '';
  h += '<h2 style="font-size:1.125rem;font-weight:700">Configurações</h2>';
  h += '<div style="display:flex;flex-direction:column;gap:0.75rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Dados</h3>';
  h += '<div style="padding:1rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:0.75rem"><div style="display:flex;justify-content:space-between;align-items:center"><p style="font-size:0.875rem;font-weight:500">Total de Lotes</p><span style="font-size:1.125rem;font-weight:700;color:#E6B800">'+S.lots.length+'</span></div><div style="display:flex;justify-content:space-between;align-items:center"><p style="font-size:0.875rem;font-weight:500">Total de Leituras</p><span style="font-size:1.125rem;font-weight:700;color:#E6B800">'+S.readings.length+'</span></div><div style="display:flex;justify-content:space-between;align-items:center"><p style="font-size:0.875rem;font-weight:500">Alarmes Ativos</p><span style="font-size:1.125rem;font-weight:700;color:#E6B800">'+S.alarms.filter(function(a){return!a.fired;}).length+'</span></div><div style="display:flex;justify-content:space-between;align-items:center"><p style="font-size:0.875rem;font-weight:500">Conversas IA</p><span style="font-size:1.125rem;font-weight:700;color:#E6B800">'+S.chatHistory.length+'</span></div></div></div>';
  h += '<div style="display:flex;flex-direction:column;gap:0.75rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Chave da IA</h3><div style="padding:1rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:0.75rem"><div style="display:flex;justify-content:space-between;align-items:center"><div><p style="font-size:0.875rem;font-weight:500">API Groq</p><p style="font-size:0.625rem;color:#525252">'+(S.apiKey?'Chave configurada':'Nenhuma chave salva')+'</p></div><div style="display:flex;align-items:center;gap:6px"><div style="width:8px;height:8px;border-radius:50%;'+(S.apiKey?'background:#34d399':'background:#404040')+'"></div><span style="font-size:0.625rem;'+(S.apiKey?'color:#34d399':'color:#525252')+'">'+(S.apiKey?'Ativa':'Inativa')+'</span></div></div>';
  if (S.apiKey) h += '<button onclick="removeKey()" style="width:100%;padding:0.625rem;border-radius:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.75rem;font-weight:500;color:#a3a3a3;cursor:pointer;font-family:inherit">Remover Chave</button>';
  else h += '<button onclick="nav(\'ai\')" style="width:100%;padding:0.625rem;border-radius:0.75rem;background:rgba(230,184,0,0.1);border:1px solid rgba(230,184,0,0.2);font-size:0.75rem;font-weight:700;color:#E6B800;cursor:pointer;font-family:inherit">Configurar Chave</button>';
  h += '</div></div>';
  h += '<div style="display:flex;flex-direction:column;gap:0.75rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Notificações</h3><div style="padding:1rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="display:flex;justify-content:space-between;align-items:center"><div><p style="font-size:0.875rem;font-weight:500">Notificações do Navegador</p><p style="font-size:0.625rem;color:#525252">Receba alertas mesmo fora do app</p></div><button onclick="reqNotif()" style="padding:0.375rem 0.75rem;border-radius:0.5rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.625rem;font-weight:500;color:#a3a3a3;cursor:pointer;font-family:inherit">'+('Notification'in window?(Notification.permission==='granted'?'Ativado':'Ativar'):'Indisponível')+'</button></div></div></div>';
  h += '<div style="display:flex;flex-direction:column;gap:0.75rem"><h3 style="font-size:0.75rem;font-weight:600;color:#525252;text-transform:uppercase;letter-spacing:0.05em">Perigo</h3><div style="padding:1rem;border-radius:1rem;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.1)"><p style="font-size:0.75rem;color:#a3a3a3;margin-bottom:0.75rem">Apagar todos os dados do aplicativo. Esta ação não pode ser desfeita.</p><button onclick="clearAll()" style="width:100%;padding:0.625rem;border-radius:0.75rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);font-size:0.75rem;font-weight:700;color:#f87171;cursor:pointer;font-family:inherit">Limpar Todos os Dados</button></div></div>';
  h += '<p style="text-align:center;padding:1rem 0 0.5rem;font-size:0.625rem;color:#262626">IncubaPro v1.0</p>';
  pg.innerHTML = h;
}

function removeKey() {
  showConf('Remover Chave', 'A chave da API será removida. Você precisará inserir novamente para usar a IA.', function(){ S.apiKey=''; S.chatHistory=[]; save(); toast('Chave removida'); rSettings(); }, 'Remover');
}

function reqNotif() {
  if ('Notification' in window) {
    Notification.requestPermission().then(function(p){ toast(p==='granted'?'Notificações ativadas!':'Permissão negada'); rSettings(); });
  }
}

function clearAll() {
  showConf('Limpar Tudo', 'Todos os lotes, leituras e configurações serão apagados permanentemente.', function(){
    localStorage.removeItem('incubapro_v11');
    S = {lots:[],activeLotId:null,readings:[],notifications:[],calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),chatHistory:[],alarms:[],checkedDays:{},apiKey:''};
    save(); toast('Dados limpos'); nav('home');
  }, 'Limpar');
}

if ('serviceWorker' in navigator) {
  var base = location.pathname.replace(/[^/]*$/, '');
  navigator.serviceWorker.register(base + 'sw.js', {scope: base}).catch(function(){});
}
updB();
nav('home');
