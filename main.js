/* ==========================================
   MAIN.JS — Fluton Quotes
   Space stars · Discord feed · 3D Planet
   ========================================== */

// ─── Space Canvas ──────────────────────────
function initSpaceCanvas() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        generateStars();
    }

    function generateStars() {
        stars = [];
        const count = Math.floor((W * H) / 2800);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.6 + 0.2,
                alpha: Math.random(),
                speed: Math.random() * 0.004 + 0.001,
                phase: Math.random() * Math.PI * 2,
                color: ['255,255,255', '200,210,255', '255,240,200', '180,200,255'][Math.floor(Math.random() * 4)]
            });
        }
    }

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        // Deep space BG
        const g = ctx.createRadialGradient(W * 0.25, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H));
        g.addColorStop(0, '#100b2e');
        g.addColorStop(0.45, '#060714');
        g.addColorStop(1, '#000005');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        frame++;
        stars.forEach(s => {
            const t = 0.3 + 0.7 * Math.abs(Math.sin(s.phase + frame * s.speed));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color},${t})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}

// ─── Shooting Stars ────────────────────────
function spawnShootingStar() {
    const el = document.createElement('div');
    el.className = 'shooting-star';
    const duration = 800 + Math.random() * 1400;
    el.style.cssText = `
        left: ${Math.random() * window.innerWidth * 0.6}px;
        top: ${Math.random() * window.innerHeight * 0.35}px;
        width: ${80 + Math.random() * 180}px;
        animation-duration: ${duration}ms;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration + 100);
}

function startShootingStars() {
    setTimeout(spawnShootingStar, 1800);
    setInterval(() => { if (Math.random() < 0.55) spawnShootingStar(); }, 3800);
}

// ─── Data ──────────────────────────────────
const CHANNEL_GENERAL    = '1323051039192252506';
const CHANNEL_RUSSIA     = '1471516611302395995';
const CHANNEL_INDIA      = '1464977218521403477';
const CHANNEL_INDONESIA  = '1464976455653134628';
const CHANNEL_VIETNAM    = '1469716246407811133';
const CHANNEL_NIGERIA    = '1465367210196205578';

const CHANNEL_MAP = {
    [CHANNEL_GENERAL]: 'general',
    [CHANNEL_RUSSIA]: 'russia',
    [CHANNEL_INDIA]: 'india',
    [CHANNEL_INDONESIA]: 'indonesia',
    [CHANNEL_VIETNAM]: 'vietnam',
    [CHANNEL_NIGERIA]: 'nigeria'
};

let allQuotes = [];      // flat array of quote objects
let currentTab = 'all';

async function fetchQuotes() {
    try {
        const r = await fetch('quotes_selected_only.json');
        if (!r.ok) throw new Error('fetch failed');
        const data = await r.json();
        // Flatten: each entry has selected_per_channel[] array of quote objects
        const flat = [];
        data.forEach(entry => {
            if (Array.isArray(entry.selected_per_channel)) {
                entry.selected_per_channel.forEach(q => flat.push(q));
            }
        });
        return flat;
    } catch (e) {
        console.error(e);
        return [];
    }
}

function filterQuotes(quotes, tab) {
    if (tab === 'general')   return quotes.filter(q => q.channel_id === CHANNEL_GENERAL);
    if (tab === 'russia')    return quotes.filter(q => q.channel_id === CHANNEL_RUSSIA);
    if (tab === 'india')     return quotes.filter(q => q.channel_id === CHANNEL_INDIA);
    if (tab === 'indonesia') return quotes.filter(q => q.channel_id === CHANNEL_INDONESIA);
    if (tab === 'vietnam')   return quotes.filter(q => q.channel_id === CHANNEL_VIETNAM);
    if (tab === 'nigeria')   return quotes.filter(q => q.channel_id === CHANNEL_NIGERIA);
    return quotes; // 'all'
}

// ─── Date helpers ──────────────────────────
function dayLabel(ts) {
    const qDate = new Date(ts);
    const qDateStr = qDate.toDateString();
    const today = new Date().toDateString();
    
    if (qDateStr === today) return 'Today';
    
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (qDateStr === yest.toDateString()) return 'Yesterday';
    
    return qDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtFull(ts) {
    return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Discord Message Card ──────────────────
// q is now a flat quote object (from selected_per_channel)
function createQuoteCard(q, index, showSep) {
    if (!q) return '';

    const sep = showSep
        ? `<div class="day-separator"><span>${dayLabel(q.timestamp)}</span></div>`
        : '';

    const isNew = index < 3;

    const linkBtn = q.link
        ? `<a href="${q.link}" target="_blank" class="action-btn link-btn" title="Open in Discord">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
            </a>`
        : '';

    const chanName = CHANNEL_MAP[q.channel_id] || 'unknown';

    return `
        ${sep}
        <article class="quote-card${isNew ? ' is-new' : ''}" style="animation-delay:${index * 0.055}s">
            <div class="message-actions">
                ${linkBtn}
                <button class="action-btn" title="Copy" onclick="copyQuote(this,${JSON.stringify(q.text)})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
            <div class="author-avatar-wrap">
                <img src="${q.author_avatar_url}" alt="${q.author_name}" class="author-avatar" onerror="this.src='media/maskot2.svg'">
                <div class="status-dot"></div>
            </div>
            <div class="message-body">
                <div class="message-header">
                    <span class="author-name">${q.author_name}</span>
                    <span class="message-time" title="${fmtFull(q.timestamp)}">${fmtTime(q.timestamp)} <span class="channel-label">(${chanName})</span></span>
                </div>
                <div class="quote-text">${q.text}</div>
            </div>
        </article>`;
}

// ─── Copy ──────────────────────────────────
window.copyQuote = function (btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.style.color = '#57F287';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
    });
};

// ─── Build Feed ────────────────────────────
// quotes = flat array of quote objects
function buildFeed(quotes, animate = false) {
    const grid = document.getElementById('quotes-grid');
    if (!grid) return;

    if (animate) {
        grid.classList.remove('tab-switching');
        void grid.offsetWidth; // reflow trigger
        grid.classList.add('tab-switching');
    }

    if (!quotes.length) {
        grid.innerHTML = '<div class="empty-state"><h2>🌌 Nothing here yet…</h2><p>No golden words found. Try again later.</p></div>';
        return;
    }
    // Strict numeric sort
    const sorted = [...quotes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    let html = '', lastDayStr = null;
    sorted.forEach((q, i) => {
        const currentDayStr = new Date(q.timestamp).toDateString();
        html += createQuoteCard(q, i, currentDayStr !== lastDayStr);
        lastDayStr = currentDayStr;
    });
    grid.innerHTML = html;
}

// ─── Tab logic ─────────────────────────────
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Filter and render
            currentTab = btn.dataset.tab;
            const filtered = filterQuotes(allQuotes, currentTab);
            buildFeed(filtered, true);

            // Update planet if built
            planetBuilt = false;
        });
    });
}

// ================================================================
//  3D PLANET MODE
// ================================================================

let planetRotX = 20;   // degrees
let planetRotY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let velX = 0;
let velY = 0;
let autoSpin = true;
let planetBuilt = false;
let rafId = null;

const SPHERE_RADIUS = 320;   // px  – distance of cards from center

/**
 * Distribute N cards evenly on a sphere using the Fibonacci / golden angle method.
 */
function fibonacciSphere(n, radius) {
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle in radians
    for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;          // -1 to 1
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        points.push({
            x: Math.cos(theta) * r * radius,
            y: y * radius,
            z: Math.sin(theta) * r * radius
        });
    }
    return points;
}

function buildPlanet(quotes) {
    const sphere = document.getElementById('planet-sphere');
    if (!sphere) return;
    sphere.innerHTML = '';

    const valid = quotes.slice(0, 60); // max 60 cards
    const points = fibonacciSphere(valid.length, SPHERE_RADIUS);

    valid.forEach((q, i) => {
        const { x, y, z } = points[i];

        const card = document.createElement('div');
        card.className = 'planet-card';

        // Color role for username (same cycling as feed)
        const nameColors = ['#ff8080','#7dd3fc','#86efac','#fbbf24','#c084fc','#fb923c'];
        const col = nameColors[i % nameColors.length];

        // Truncate text for compact card
        const shortText = q.text.length > 160 ? q.text.slice(0, 157) + '…' : q.text;

        card.innerHTML = `
            <div style="display:flex;align-items:center;margin-bottom:0.3rem;">
                <img src="${q.author_avatar_url}" class="pc-avatar" onerror="this.src='media/maskot2.svg'" alt="">
                <span class="pc-name" style="color:${col}">${q.author_name}</span>
            </div>
            <div class="pc-text">${shortText}</div>`;

        // Position card: translateZ brings it to sphere surface, then rotateY/X faces it outward
        // We compute the Euler angles that point from center to (x,y,z)
        const rotY = Math.atan2(x, z) * (180 / Math.PI);
        const rotX = -Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

        card.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(${SPHERE_RADIUS}px)`;

        if (q.link) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (!isDragging) window.open(q.link, '_blank');
            });
        }

        sphere.appendChild(card);
    });

    planetBuilt = true;
}

function applyPlanetRotation() {
    const sphere = document.getElementById('planet-sphere');
    if (sphere) {
        sphere.style.transform = `rotateX(${planetRotX}deg) rotateY(${planetRotY}deg)`;
    }
}

function planetLoop() {
    if (autoSpin && !isDragging) {
        planetRotY += 0.18;
        velY *= 0.95;
        velX *= 0.95;
    } else if (!isDragging) {
        // momentum decay
        planetRotY += velY;
        planetRotX += velX;
        velY *= 0.92;
        velX *= 0.92;
        // clamp X tilt
        planetRotX = Math.max(-60, Math.min(60, planetRotX));
    }
    applyPlanetRotation();
    rafId = requestAnimationFrame(planetLoop);
}

function startPlanetLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    planetLoop();
}

function stopPlanetLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// Drag handlers
function onPlanetMouseDown(e) {
    isDragging = true;
    autoSpin = false;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    velX = 0; velY = 0;
}

function onPlanetMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    velY = dx * 0.35;
    velX = dy * 0.35;
    planetRotY += velY;
    planetRotX += velX;
    planetRotX = Math.max(-70, Math.min(70, planetRotX));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    applyPlanetRotation();
}

function onPlanetMouseUp() {
    isDragging = false;
    // keep momentum, don't resume auto-spin immediately
    setTimeout(() => { autoSpin = true; }, 4000);
}

// Touch support
function onPlanetTouchStart(e) {
    isDragging = true;
    autoSpin = false;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    velX = 0; velY = 0;
}
function onPlanetTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastMouseX;
    const dy = e.touches[0].clientY - lastMouseY;
    velY = dx * 0.35; velX = dy * 0.35;
    planetRotY += velY; planetRotX += velX;
    planetRotX = Math.max(-70, Math.min(70, planetRotX));
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    applyPlanetRotation();
}
function onPlanetTouchEnd() { onPlanetMouseUp(); }

function initPlanetDrag() {
    const wrapper = document.getElementById('planet-wrapper');
    if (!wrapper) return;
    wrapper.addEventListener('mousedown', onPlanetMouseDown);
    window.addEventListener('mousemove', onPlanetMouseMove);
    window.addEventListener('mouseup', onPlanetMouseUp);
    wrapper.addEventListener('touchstart', onPlanetTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', onPlanetTouchMove, { passive: false });
    wrapper.addEventListener('touchend', onPlanetTouchEnd);
}

// ─── Mode switcher ─────────────────────────
function initModeToggle(data) {
    const toggle = document.getElementById('toggle3d');
    const feed = document.getElementById('main-feed');
    const planet = document.getElementById('planet-scene');
    const label = document.getElementById('mode-label-text');
    const footer = document.querySelector('.footer');
    if (!toggle) return;

    const restore = localStorage.getItem('fluton-3d');
    if (restore === 'true') {
        toggle.checked = true;
        switchTo3D();
    }

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            switchTo3D();
            localStorage.setItem('fluton-3d', 'true');
        } else {
            switchToFeed();
            localStorage.setItem('fluton-3d', 'false');
        }
    });

    function switchTo3D() {
        feed.style.display = 'none';
        planet.style.display = 'flex';
        footer.style.display = 'none';
        document.body.style.overflow = 'hidden';
        if (label) label.textContent = 'Planet ON';

        if (!planetBuilt) buildPlanet(filterQuotes(allQuotes, currentTab));
        startPlanetLoop();
    }

    function switchToFeed() {
        planet.style.display = 'none';
        feed.style.display = 'block';
        footer.style.display = '';
        document.body.style.overflow = '';
        if (label) label.textContent = '3D Planet';
        stopPlanetLoop();
    }
}

// ─── Bootstrap ────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initSpaceCanvas();
    startShootingStars();

    allQuotes = await fetchQuotes();

    buildFeed(allQuotes);
    initTabs();
    initPlanetDrag();
    initModeToggle(allQuotes);
});
