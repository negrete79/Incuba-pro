/* ==========================================
   INCUBAPRO - WS.JS
   WebSocket e atualizações em tempo real
   ========================================== */

// ==========================================
// CONFIGURAÇÃO DO WEBSOCKET
// ==========================================

const WS_CONFIG = {
  url: 'wss://incubapro.example.com/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000
};

let ws = null;
let reconnectAttempts = 0;
let heartbeatTimer = null;
let isConnected = false;

// ==========================================
// CONEXÃO
// ==========================================

function connectWebSocket() {
  // Verifica se o navegador suporta WebSocket
  if (!('WebSocket' in window)) {
    console.log('[WS] WebSocket não suportado. Usando modo offline.');
    startOfflineSimulation();
    return;
  }

  try {
    ws = new WebSocket(WS_CONFIG.url);

    ws.onopen = function () {
      console.log('[WS] Conectado ao servidor');
      isConnected = true;
      reconnectAttempts = 0;
      startHeartbeat();
      updateConnectionStatus(true);
    };

    ws.onmessage = function (event) {
      handleWSMessage(event.data);
    };

    ws.onerror = function () {
      console.log('[WS] Erro na conexão');
    };

    ws.onclose = function () {
      console.log('[WS] Desconectado');
      isConnected = false;
      stopHeartbeat();
      updateConnectionStatus(false);
      attemptReconnect();
    };
  } catch (e) {
    console.log('[WS] Falha ao conectar:', e.message);
    startOfflineSimulation();
  }
}

function attemptReconnect() {
  if (reconnectAttempts >= WS_CONFIG.maxReconnectAttempts) {
    console.log('[WS] Máximo de tentativas atingido. Modo offline.');
    startOfflineSimulation();
    return;
  }

  reconnectAttempts++;
  console.log(`[WS] Reconectando... tentativa ${reconnectAttempts}/${WS_CONFIG.maxReconnectAttempts}`);

  setTimeout(() => {
    connectWebSocket();
  }, WS_CONFIG.reconnectInterval * reconnectAttempts);
}

// ==========================================
// HEARTBEAT
// ==========================================

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    }
  }, WS_CONFIG.heartbeatInterval);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// ==========================================
// TRATAMENTO DE MENSAGENS
// ==========================================

function handleWSMessage(data) {
  try {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case 'pong':
        // Heartbeat respondido, conexão OK
        break;

      case 'incubation_update':
        // Atualização de dados de incubação vindos do servidor
        if (msg.payload) {
          console.log('[WS] Atualização de incubação recebida');
        }
        break;

      case 'notification':
        // Notificação push do servidor
        if (msg.payload && msg.payload.message) {
          showWSNotification(msg.payload.message, msg.payload.level || 'info');
        }
        break;

      case 'temperature_alert':
        // Alerta de temperatura
        if (msg.payload) {
          const temp = msg.payload.temperature;
          const esp = msg.payload.species || 'sua incubação';
          if (temp > 0) {
            showWSNotification(
              `Alerta de temperatura para ${esp}: ${temp}°C. Verifique a chocadeira!`,
              'warning'
            );
          }
        }
        break;

      case 'tip':
        // Dica periódica do servidor
        if (msg.payload && msg.payload.text) {
          console.log('[WS] Dica recebida:', msg.payload.text);
        }
        break;

      default:
        console.log('[WS] Mensagem não reconhecida:', msg.type);
    }
  } catch (e) {
    console.log('[WS] Erro ao processar mensagem:', e.message);
  }
}

function showWSNotification(message, level) {
  if (typeof showToast === 'function') {
    showToast(message, level === 'warning' ? 'warning' : 'success');
  }
}

function updateConnectionStatus(connected) {
  // Atualiza indicador visual se existir
  const statusEl = document.getElementById('wsStatus');
  if (statusEl) {
    statusEl.textContent = connected ? 'Conectado' : 'Offline';
    statusEl.style.color = connected ? 'var(--green)' : 'var(--red)';
  }
}

// ==========================================
// SIMULAÇÃO OFFLINE
// ==========================================

let offlineTimer = null;

function startOfflineSimulation() {
  console.log('[WS] Iniciando simulação offline de atualizações');

  // Simula verificações periódicas de temperatura
  offlineTimer = setInterval(() => {
    simulateTemperatureCheck();
  }, 60000); // A cada 60 segundos

  // Primeira verificação após 10 segundos
  setTimeout(simulateTemperatureCheck, 10000);
}

function stopOfflineSimulation() {
  if (offlineTimer) {
    clearInterval(offlineTimer);
    offlineTimer = null;
  }
}

function simulateTemperatureCheck() {
  // Simula variação de temperatura para as incubações ativas
  if (typeof incubations === 'undefined') return;

  const ativas = incubations.filter(i => !i.concluida);
  if (ativas.length === 0) return;

  // Gera temperatura simulada com variação aleatória
  const baseTemps = {
    'codorna': 37.7,
    'codorna-jp': 37.7,
    'galinha': 37.8,
    'pato': 37.5,
    'marreco': 37.5,
    'peru': 37.5,
    'ganso': 37.5,
    'faisao': 37.8,
    'pomba': 38.0,
    'calopsita': 37.5,
    'periquito': 37.0,
    'avestruz': 36.5
  };

  ativas.forEach(inc => {
    const base = baseTemps[inc.especie] || 37.5;
    const variation = (Math.random() - 0.5) * 0.6; // ±0.3°C
    const currentTemp = (base + variation).toFixed(1);

    // Alerta se fora da faixa aceitável
    if (Math.abs(variation) > 0.25) {
      const esp = (typeof ESPECIES !== 'undefined')
        ? (ESPECIES.find(e => e.id === inc.especie) || {}).nome || 'Incubação'
        : 'Incubação';

      console.log(`[WS-SIM] ${esp}: ${currentTemp}°C (variação: ${variation > 0 ? '+' : ''}${variation.toFixed(2)}°C)`);
    }
  });
}

// ==========================================
// ENVIAR DADOS
// ==========================================

function wsSendIncubationUpdate(incubationData) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'incubation_update',
      payload: incubationData,
      timestamp: Date.now()
    }));
  }
}

function wsSendAction(action, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: action,
      payload: payload,
      timestamp: Date.now()
    }));
  }
}

// ==========================================
// INICIALIZAR
// ==========================================

// Tenta conectar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Pequeno delay para não competir com outros inicializadores
  setTimeout(() => {
    connectWebSocket();
  }, 1000);
});

// Limpar ao sair da página
window.addEventListener('beforeunload', () => {
  stopHeartbeat();
  stopOfflineSimulation();
  if (ws) ws.close();
});
