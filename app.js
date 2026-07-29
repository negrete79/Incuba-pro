/* ==========================================
   INCUBAPRO - STYLE.CSS
   Design system completo
   ========================================== */

:root {
  --bg: #0F0F0F;
  --bg-card: #1A1A1A;
  --bg-elevated: #252525;
  --fg: #F5F0E8;
  --fg-muted: #8A8478;
  --fg-dim: #5A554D;
  --accent: #E8A838;
  --accent-glow: rgba(232, 168, 56, 0.15);
  --accent-soft: rgba(232, 168, 56, 0.08);
  --green: #4ADE80;
  --green-soft: rgba(74, 222, 128, 0.12);
  --red: #F87171;
  --red-soft: rgba(248, 113, 113, 0.12);
  --blue: #60A5FA;
  --border: rgba(255, 255, 255, 0.06);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-xs: 8px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* === App Container === */
.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background: var(--bg);
}

.app::before {
  content: '';
  position: fixed;
  top: -120px;
  right: -80px;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: floatBlob 8s ease-in-out infinite;
}

.app::after {
  content: '';
  position: fixed;
  bottom: 80px;
  left: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: floatBlob 10s ease-in-out infinite reverse;
}

@keyframes floatBlob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 30px) scale(1.1); }
}

/* === Páginas === */
.page {
  display: none;
  padding: 0 20px 100px;
  position: relative;
  z-index: 1;
  animation: pageIn 0.4s ease-out;
}

.page.active { display: block; }

@keyframes pageIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === Header === */
.page-header {
  padding: 20px 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-sub {
  font-size: 13px;
  color: var(--fg-muted);
  font-weight: 500;
}

/* === Botões de ícone === */
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--fg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 16px;
}

.icon-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--accent);
  color: var(--accent);
}

.icon-btn-sm {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--fg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 12px;
}

.icon-btn-sm:hover { border-color: var(--accent); color: var(--accent); }

/* === Círculo de ícone grande === */
.icon-circle-lg {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.accent-bg { background: var(--accent); color: #0F0F0F; }

/* === Cards === */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: var(--transition);
}

.card:hover { border-color: rgba(255, 255, 255, 0.1); }

.card-glow {
  position: relative;
  overflow: hidden;
}

.card-glow::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
}

/* === Texto auxiliar === */
.text-muted { font-size: 13px; color: var(--fg-muted); line-height: 1.7; }
.text-muted-sm { font-size: 12px; color: var(--fg-muted); }

/* === Botões === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: var(--accent);
  color: #0F0F0F;
}

.btn-primary:hover {
  background: #F0B848;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(232, 168, 56, 0.3);
}

.btn-primary:active { transform: translateY(0); }

.btn-outline {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.btn-full { width: 100%; }

/* === Badge === */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-green { background: var(--green-soft); color: var(--green); }
.badge-amber { background: var(--accent-soft); color: var(--accent); }
.badge-red { background: var(--red-soft); color: var(--red); }

/* === Progress Ring === */
.progress-ring-container {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
}

.progress-ring { transform: rotate(-90deg); }
.progress-ring-bg { fill: none; stroke: var(--bg-elevated); stroke-width: 8; }

.progress-ring-fill {
  fill: none;
  stroke: var(--accent);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease-out;
}

.progress-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-ring-text .pct {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  color: var(--accent);
}

.progress-ring-text .label {
  font-size: 11px;
  color: var(--fg-muted);
  margin-top: 4px;
}

/* === Stepper === */
.stepper { display: flex; flex-direction: column; gap: 0; }

.step-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.step-item:last-child { padding-bottom: 0; }

.step-line {
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: 0;
  width: 2px;
  background: var(--bg-elevated);
}

.step-item.completed .step-line { background: var(--accent); }
.step-item:last-child .step-line { display: none; }

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  background: var(--bg-elevated);
  color: var(--fg-dim);
  border: 2px solid var(--border);
  transition: var(--transition);
  position: relative;
  z-index: 1;
}

.step-item.active .step-number {
  background: var(--accent);
  color: #0F0F0F;
  border-color: var(--accent);
  box-shadow: 0 0 20px rgba(232, 168, 56, 0.4);
}

.step-item.completed .step-number {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.step-content { flex: 1; padding-top: 6px; }
.step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.step-content p { font-size: 13px; color: var(--fg-muted); line-height: 1.5; }
.step-item.active .step-content h4 { color: var(--accent); }

/* === Etapas Accordion (Estufa) === */
.etapa-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 12px;
  transition: var(--transition);
}

.etapa-card:hover { border-color: rgba(255, 255, 255, 0.1); }

.etapa-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  cursor: pointer;
  user-select: none;
}

.etapa-num {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.etapa-header h4 { flex: 1; font-size: 14px; font-weight: 700; line-height: 1.3; }
.etapa-chevron { color: var(--fg-dim); transition: var(--transition); font-size: 12px; }
.etapa-card.open .etapa-chevron { transform: rotate(180deg); }

.etapa-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
}

.etapa-card.open .etapa-body { max-height: 600px; padding: 0 18px 18px; }
.etapa-body p { font-size: 13px; line-height: 1.7; color: var(--fg-muted); }

.etapa-body ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.etapa-body ul li {
  font-size: 13px;
  line-height: 1.7;
  color: var(--fg-muted);
  padding-left: 18px;
  position: relative;
}

.etapa-body ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

/* === Stat Grid === */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 12px;
  text-align: center;
}

.stat-card .stat-icon { font-size: 18px; margin-bottom: 8px; }
.stat-card .stat-value { font-size: 22px; font-weight: 800; line-height: 1; }
.stat-card .stat-label { font-size: 11px; color: var(--fg-muted); margin-top: 4px; }

/* === Incubação Ativa === */
.incubation-active {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  margin-top: 14px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.incubation-active::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  border-radius: 0 4px 4px 0;
}

.inc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.inc-species { display: flex; align-items: center; gap: 10px; }

.inc-species .icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.inc-species .name { font-weight: 700; font-size: 15px; }
.inc-species .eggs { font-size: 12px; color: var(--fg-muted); }

.inc-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
  margin: 12px 0;
}

.inc-progress-bar .fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #F0C060);
  border-radius: 3px;
  transition: width 1s ease;
}

.inc-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--fg-muted);
}

.inc-meta span strong { color: var(--fg); }

.inc-tip {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--accent-soft);
  border-radius: var(--radius-xs);
  font-size: 12px;
  color: var(--accent);
  line-height: 1.5;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.inc-tip i { margin-top: 2px; flex-shrink: 0; }

.inc-details-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  color: var(--fg-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.inc-details-btn:hover { border-color: var(--accent); color: var(--accent); }

/* === Seção título === */
.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--fg-dim);
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

/* === Chat === */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 170px);
  min-height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-messages::-webkit-scrollbar { width: 3px; }
.chat-messages::-webkit-scrollbar-thumb { background: var(--fg-dim); border-radius: 3px; }

.chat-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  animation: bubbleIn 0.3s ease-out;
}

@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-bubble.bot {
  align-self: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.chat-bubble.user {
  align-self: flex-end;
  background: var(--accent);
  color: #0F0F0F;
  border-bottom-right-radius: 4px;
  font-weight: 500;
}

.chat-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.chat-quick-btn {
  padding: 8px 14px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--fg-muted);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-quick-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.chat-input-area {
  padding: 12px 0 4px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--fg);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: var(--transition);
}

.chat-input::placeholder { color: var(--fg-dim); }
.chat-input:focus { border-color: var(--accent); }

.chat-send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  color: #0F0F0F;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 16px;
  flex-shrink: 0;
}

.chat-send:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(232, 168, 56, 0.4);
}

/* === Status Online === */
.online-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--green);
  font-weight: 500;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
}

/* === Tabs === */
.tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin: 16px 0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--fg-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.tab-btn.active { background: var(--accent); color: #0F0F0F; }

.tab-content { display: none; animation: pageIn 0.3s ease; }
.tab-content.active { display: block; }

/* === Vídeo Card === */
.video-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 10px;
  transition: var(--transition);
  cursor: pointer;
}

.video-card:hover { border-color: rgba(255, 255, 255, 0.1); }

.video-thumb {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.play-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(232, 168, 56, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F0F0F;
  font-size: 20px;
  z-index: 1;
  transition: var(--transition);
  box-shadow: 0 4px 20px rgba(232, 168, 56, 0.4);
  position: absolute;
}

.video-card:hover .play-icon { transform: scale(1.1); }
.video-info { padding: 14px 16px; }
.video-info h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.video-info p { font-size: 12px; color: var(--fg-muted); }

/* === FAQ === */
.faq-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  overflow: hidden;
}

.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition);
}

.faq-q:hover { color: var(--accent); }
.faq-q i { font-size: 12px; color: var(--fg-dim); transition: var(--transition); }
.faq-item.open .faq-q i { transform: rotate(180deg); color: var(--accent); }

.faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.open .faq-a { max-height: 300px; }
.faq-a p { padding: 0 16px 14px; font-size: 13px; line-height: 1.7; color: var(--fg-muted); }

/* === Search === */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin: 12px 0;
  transition: var(--transition);
}

.search-box:focus-within { border-color: var(--accent); }
.search-box i { color: var(--fg-dim); font-size: 14px; }

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--fg);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.search-box input::placeholder { color: var(--fg-dim); }

/* === Manual Card === */
.manual-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 16px !important;
}

.manual-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.manual-body { flex: 1; }
.manual-body h4 { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.manual-body p { font-size: 12px; color: var(--fg-muted); }

/* === News Card === */
.news-card {
  display: flex;
  gap: 14px;
  cursor: pointer;
  padding: 14px !important;
}

.news-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.news-body { flex: 1; }
.news-body h4 { font-size: 14px; font-weight: 700; margin: 6px 0 4px; line-height: 1.3; }

/* === Temperature Display === */
.temp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  margin: 12px 0;
}

.temp-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--fg-dim);
  font-size: 12px;
}

.temp-arrow i { font-size: 18px; color: var(--accent); }

.temp-value {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
}

.temp-value span { font-size: 18px; font-weight: 500; }

/* === Alert Box === */
.alert-box {
  padding: 10px 12px;
  border-radius: var(--radius-xs);
  font-size: 12px;
  line-height: 1.6;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.alert-warn { background: var(--red-soft); color: var(--red); }
.alert-warn i { margin-top: 2px; flex-shrink: 0; }

/* === Bottom Nav === */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: rgba(15, 15, 15, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: var(--fg-dim);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border-radius: 10px;
  position: relative;
}

.nav-item i { font-size: 18px; transition: var(--transition); }
.nav-item.active { color: var(--accent); }

.nav-item.active::before {
  content: '';
  position: absolute;
  top: -8px;
  width: 20px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--accent);
}

.nav-item:hover { color: var(--fg-muted); }

/* === Toast === */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  max-width: 420px;
  width: calc(100% - 40px);
  padding: 14px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  z-index: 200;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow);
}

.toast.show { transform: translateX(-50%) translateY(0); }
.toast i { font-size: 18px; }
.toast.success i { color: var(--green); }
.toast.warning i { color: var(--accent); }

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 150;
  display: none;
  align-items: flex-end;
  justify-content: center;
}

.modal-overlay.show { display: flex; }

.modal-sheet {
  max-width: 480px;
  width: 100%;
  background: var(--bg);
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 40px;
  animation: sheetUp 0.4s ease-out;
  max-height: 85vh;
  overflow-y: auto;
}

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--fg-dim);
  margin: 0 auto 20px;
}

/* === Form === */
.form-group { margin-bottom: 16px; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-muted);
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--fg);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: var(--transition);
}

.form-group input:focus,
.form-group textarea:focus { border-color: var(--accent); }

.form-group textarea { resize: vertical; min-height: 100px; }

/* === Species Grid === */
.species-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.species-option {
  padding: 10px 6px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  background: var(--bg-card);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 11px;
  font-weight: 600;
  color: var(--fg-muted);
}

.species-option:hover { border-color: var(--accent); color: var(--fg); }

.species-option.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.species-option .sp-icon { font-size: 20px; display: block; margin-bottom: 4px; }

/* === Sub-page === */
.sub-page {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 120;
  background: var(--bg);
  max-width: 480px;
  margin: 0 auto;
  overflow-y: auto;
  padding: 0 20px 40px;
  animation: slideIn 0.35s ease-out;
}

.sub-page.show { display: block; }

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* === Calendário === */
.cal-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
  margin-bottom: 4px;
}

.cal-header span {
  font-size: 10px;
  color: var(--fg-dim);
  padding: 4px;
  font-weight: 600;
}

.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.cal-day {
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-muted);
  transition: var(--transition);
  cursor: default;
}

.cal-day.today {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}

.cal-day.active-inc {
  background: var(--accent);
  color: #0F0F0F;
  font-weight: 700;
  border-radius: 50%;
}

.cal-day.empty { visibility: hidden; }

/* === Stagger Animation === */
.stagger > * {
  opacity: 0;
  transform: translateY(12px);
  animation: staggerIn 0.4s ease-out forwards;
}

.stagger > *:nth-child(1) { animation-delay: 0.05s; }
.stagger > *:nth-child(2) { animation-delay: 0.1s; }
.stagger > *:nth-child(3) { animation-delay: 0.15s; }
.stagger > *:nth-child(4) { animation-delay: 0.2s; }
.stagger > *:nth-child(5) { animation-delay: 0.25s; }
.stagger > *:nth-child(6) { animation-delay: 0.3s; }
.stagger > *:nth-child(7) { animation-delay: 0.35s; }
.stagger > *:nth-child(8) { animation-delay: 0.4s; }
.stagger > *:nth-child(9) { animation-delay: 0.45s; }
.stagger > *:nth-child(10) { animation-delay: 0.5s; }
.stagger > *:nth-child(11) { animation-delay: 0.55s; }
.stagger > *:nth-child(12) { animation-delay: 0.6s; }
.stagger > *:nth-child(n+13) { animation-delay: 0.65s; }

@keyframes staggerIn {
  to { opacity: 1; transform: translateY(0); }
}

/* === Scrollbar === */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--fg-dim); border-radius: 4px; }

/* === Responsivo === */
@media (max-width: 380px) {
  .stat-grid { gap: 6px; }
  .stat-card { padding: 10px 6px; }
  .stat-card .stat-value { font-size: 18px; }
  .species-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-item { padding: 6px 4px; font-size: 9px; }
  .nav-item i { font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
