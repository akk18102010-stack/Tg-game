const tg = window.Telegram && window.Telegram.WebApp;
if (tg) { tg.expand(); }

let state = {
    balance: 50,
    tickets: 0,
    isDemo: false,
    selectedCase: 0,
    isSpinning: false,
    subChannel: false,
    subChat: false,
    inventory: [],
    completedTasks: []
};

const gemSvg = `<svg class="gem-icon" viewBox="0 0 24 24"><path fill="#38bdf8" d="M12 2L2 9l10 13L22 9 12 2z"/></svg>`;

const allGifts = {
    heart: { id: 'heart', name: 'Сердце', emoji: '💝', price: 15, nft: false },
    bear: { id: 'bear', name: 'Мишка', emoji: '🧸', price: 15, nft: false },
    gift: { id: 'gift', name: 'Подарок', emoji: '🎁', price: 25, nft: false },
    rose: { id: 'rose', name: 'Роза', emoji: '🌹', price: 25, nft: false },
    cake: { id: 'cake', name: 'Торт', emoji: '🎂', price: 50, nft: false },
    bouquet: { id: 'bouquet', name: 'Букет', emoji: '💐', price: 50, nft: false },
    rocket: { id: 'rocket', name: 'Ракета', emoji: '🚀', price: 50, nft: false },
    champagne: { id: 'champagne', name: 'Шампанское', emoji: '🍾', price: 50, nft: false },
    trophy: { id: 'trophy', name: 'Кубок', emoji: '🏆', price: 100, nft: true },
    ring: { id: 'ring', name: 'Кольцо', emoji: '💍', price: 100, nft: true },
    diamond: { id: 'diamond', name: 'Алмаз', emoji: '💎', price: 100, nft: true },
    pepe: { id: 'pepe', name: 'NFT Пепе', emoji: '🐸', price: 1000, nft: true }
};

const cases = [
    {
        id: 'free', tag: 'КЕЙС ДНЯ', name: 'FREE', price: 0, emoji: '💩',
        drops: [
            { item: allGifts.heart, chance: 45 },
            { item: allGifts.bear, chance: 40 },
            { item: allGifts.gift, chance: 10 },
            { item: allGifts.rose, chance: 4.5 },
            { item: allGifts.pepe, chance: 0.5 }
        ]
    },
    {
        id: 'starter', tag: 'МАЛЕНЬКАЯ', name: '25', price: 25, emoji: '🎁',
        drops: [
            { item: allGifts.heart, chance: 30 },
            { item: allGifts.bear, chance: 30 },
            { item: allGifts.gift, chance: 20 },
            { item: allGifts.rose, chance: 15 },
            { item: allGifts.cake, chance: 5 }
        ]
    },
    {
        id: 'mega', tag: 'МЕГА', name: '100', price: 100, emoji: '🚀',
        drops: [
            { item: allGifts.cake, chance: 25 },
            { item: allGifts.bouquet, chance: 25 },
            { item: allGifts.rocket, chance: 20 },
            { item: allGifts.champagne, chance: 15 },
            { item: allGifts.trophy, chance: 8 },
            { item: allGifts.ring, chance: 5 },
            { item: allGifts.diamond, chance: 2 }
        ]
    },
    {
        id: 'vip', tag: 'СУПЕР NFT', name: '300', price: 300, emoji: '👑',
        drops: [
            { item: allGifts.trophy, chance: 30 },
            { item: allGifts.ring, chance: 30 },
            { item: allGifts.diamond, chance: 30 },
            { item: allGifts.pepe, chance: 10 }
        ]
    }
];

const tasks = [
    { id: 'daily', title: 'Ежедневный вход в бота', reward: 1, type: 'instant' },
    { id: 'boost', title: 'Проголосовать (Boost) за канал', reward: 100, type: 'link', url: 'https://t.me' },
    { id: 'sub_ch', title: 'Подписаться на канал @VisamanNFT', reward: 15, type: 'link', url: 'https://t.me' },
    { id: 'sub_chat', title: 'Вступить в чат @VisamanNFTchat', reward: 15, type: 'link', url: 'https://t.mechat' }
];
window.onload = () => {
    let p = 0;
    const fill = document.getElementById('loaderFill');
    const iv = setInterval(() => {
        p += 25;
        fill.style.width = p + '%';
        if (p >= 100) {
            clearInterval(iv);
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 400);
            }, 200);
        }
    }, 150);

    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const u = tg.initDataUnsafe.user;
        document.getElementById('userName').innerText = u.first_name || 'Игрок';
        document.getElementById('userAvatar').innerText = (u.first_name || 'V')[0].toUpperCase();
    }

    renderCases();
    selectCase(0);
    renderTasks();
    updateUI();
    startLiveFeed();
};

function renderCases() {
    const el = document.getElementById('casesList');
    el.innerHTML = cases.map((c, idx) => `
        <div class="case-card ${state.selectedCase === idx ? 'active' : ''}" onclick="selectCase(${idx})">
            <div>
                <div class="case-tag">${c.tag}</div>
                <div class="case-price">${c.price === 0 ? 'FREE' : c.price + gemSvg}</div>
            </div>
            <div class="case-emoji">${c.emoji}</div>
        </div>
    `).join('');
}

function selectCase(idx) {
    if (state.isSpinning) return;
    state.selectedCase = idx;
    renderCases();
    const c = cases[idx];
    document.getElementById('spinCostBadge').innerHTML = c.price === 0 ? 'FREE' : `${c.price} 💎`;

    const preview = document.getElementById('dropsPreview');
    preview.innerHTML = c.drops.map(d => `
        <div class="drop-card">
            ${d.item.nft ? '<div class="nft-ribbon">NFT</div>' : ''}
            <div style="font-size:40px">${d.item.emoji}</div>
            <div class="drop-chance">✦ ${d.chance}%</div>
            <div class="drop-val">${d.item.price} ${gemSvg}</div>
        </div>
    `).join('');

    const track = document.getElementById('track');
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';
    let html = '';
    for (let i = 0; i < 40; i++) {
        const rand = c.drops[Math.floor(Math.random() * c.drops.length)].item;
        html += `<div class="roulette-item ${rand.nft ? 'nft-glow' : ''}"><div class="item-emoji-big">${rand.emoji}</div><div class="item-price-tag">${rand.price} ${gemSvg}</div></div>`;
    }
    track.innerHTML = html;
}

function toggleDemo() {
    state.isDemo = document.getElementById('demoToggle').checked;
    showAlert(state.isDemo ? 'Включён DEMO-режим: крутите бесплатно, но призы не сохраняются!' : 'Выключен DEMO-режим: игра на реальный баланс!');
}

function startSpin() {
    if (state.isSpinning) return;
    const c = cases[state.selectedCase];

    if (!state.isDemo) {
        if (c.price === 0 && (!state.subChannel || !state.subChat)) {
            document.getElementById('subModal').classList.add('open');
            return;
        }
        if (state.balance < c.price) {
            showAlert('Недостаточно кристаллов! Пополните баланс.');
            openDepositModal();
            return;
        }
        state.balance -= c.price;
        updateUI();
    }

    state.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    const r = Math.random() * 100;
    let acc = 0, won = c.drops[0].item;
    for (let d of c.drops) {
        acc += d.chance;
        if (r <= acc) { won = d.item; break; }
    }

    const track = document.getElementById('track');
    const wrapper = document.getElementById('wrapper');
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';

    const winIdx = 32;
    let html = '';
    for (let i = 0; i < 42; i++) {
        const it = (i === winIdx) ? won : c.drops[Math.floor(Math.random() * c.drops.length)].item;
        html += `<div class="roulette-item ${it.nft ? 'nft-glow' : ''}"><div class="item-emoji-big">${it.emoji}</div><div class="item-price-tag">${it.price} ${gemSvg}</div></div>`;
    }
    track.innerHTML = html;

    setTimeout(() => {
        const offset = (winIdx * 120) + 55 - (wrapper.offsetWidth / 2);
        track.style.transition = 'transform 4s cubic-bezier(0.12, 0.8, 0.15, 1)';
        track.style.transform = `translateX(-${offset}px)`;
    }, 50);

    setTimeout(() => {
        state.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        if (!state.isDemo) {
            state.inventory.push(won);
            updateUI();
            showAlert(`🎉 Вы выиграли: ${won.emoji} ${won.name} (${won.price} 💎)!`);
        } else {
            showAlert(`🎮 DEMO: выпал ${won.emoji} ${won.name}. Отключите DEMO, чтобы забирать призы!`);
        }
    }, 4150);
}

function markSub(type) {
    if (type === 'channel') state.subChannel = true;
    if (type === 'chat') state.subChat = true;
}

function verifySubAndSpin() {
    if (state.subChannel && state.subChat) {
        closeModal('subModal');
        startSpin();
    } else {
        showAlert('Пожалуйста, перейдите по обеим ссылкам и подпишитесь на канал и чат!');
    }
}

function sellGift(idx) {
    state.balance += state.inventory[idx].price;
    state.inventory.splice(idx, 1);
    updateUI();
}

function buyTicket() {
    if (state.balance < 10) return showAlert('Нужно 10 💎 для покупки билета!');
    state.balance -= 10;
    state.tickets += 1;
    updateUI();
}

function enterRaffle() {
    if (state.tickets <= 0) return showAlert('Сначала купите хотя бы 1 билет!');
    showAlert(`🎟️ Вы участвуете в розыгрыше с ${state.tickets} билетами (шанс ${(state.tickets * 0.1).toFixed(1)}%)!`);
}

function renderTasks() {
    const el = document.getElementById('tasksList');
    el.innerHTML = tasks.map(t => {
        const done = state.completedTasks.includes(t.id);
        return `
            <div class="task-item">
                <div>
                    <div style="font-weight:700;font-size:14px">${t.title}</div>
                    <div class="task-reward">+${t.reward} 💎</div>
                </div>
                <button class="task-btn ${done ? 'done' : ''}" onclick="doTask('${t.id}')">${done ? 'Готово' : 'Выполнить'}</button>
            </div>
        `;
    }).join('');
}

function doTask(id) {
    if (state.completedTasks.includes(id)) return;
    const t = tasks.find(x => x.id === id);
    if (t.url) window.open(t.url, '_blank');
    setTimeout(() => {
        state.completedTasks.push(id);
        state.balance += t.reward;
        renderTasks();
        updateUI();
        showAlert(`✅ Задание выполнено! Начислено +${t.reward} 💎`);
    }, 1000);
}

function openDepositModal() { document.getElementById('depositModal').classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function payStars() {
    const val = parseInt(document.getElementById('depAmount').value) || 0;
    if (val <= 0) return;
    state.balance += val;
    closeModal('depositModal');
    updateUI();
    showAlert(`⭐ Успешно пополнено на ${val} 💎 через Telegram Stars!`);
}

function payWallet() {
    const val = parseInt(document.getElementById('depAmount').value) || 0;
    if (val <= 0) return;
    state.balance += val;
    closeModal('depositModal');
    updateUI();
    showAlert(`👛 Кошелёк подключён! Начислено ${val} 💎.`);
}

function inviteFriend() {
    const link = 'https://t.me!';
    window.open(link, '_blank');
}

function switchTab(name, navEl) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    if (navEl) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        navEl.classList.add('active');
    }
}

function updateUI() {
    document.getElementById('balanceAmount').innerText = state.balance;
    document.getElementById('profileBalance').innerText = state.balance;
    document.getElementById('ticketCount').innerText = state.tickets;
    document.getElementById('raffleTickets').innerText = state.tickets;
    document.getElementById('raffleChance').innerText = (state.tickets * 0.1).toFixed(1) + '%';
    const remTasks = tasks.length - state.completedTasks.length;
    const badge = document.getElementById('taskBadge');
    badge.innerText = remTasks;
    badge.style.display = remTasks > 0 ? 'block' : 'none';

    const inv = document.getElementById('inventoryGrid');
    if (state.inventory.length === 0) {
        inv.innerHTML = '<div class="empty-inv">🔍 У вас ещё нет подарков</div>';
    } else {
        inv.innerHTML = state.inventory.map((g, i) => `
            <div class="inv-item">
                <div style="font-size:36px">${g.emoji}</div>
                <div style="font-size:12px;font-weight:700;margin-top:4px">${g.name}</div>
                <button class="sell-mini-btn" onclick="sellGift(${i})">Продать ${g.price} 💎</button>
            </div>
        `).join('');
    }
}

function startLiveFeed() {
    const names = ['Alex', 'Tony Stark', 'Dima', 'CryptoKing', 'VisaMan', 'Max'];
    const items = Object.values(allGifts);
    setInterval(() => {
        const n = names[Math.floor(Math.random() * names.length)];
        const it = items[Math.floor(Math.random() * items.length)];
        document.getElementById('liveText').innerText = `${n} выиграл ${it.emoji} ${it.name}`;
    }, 3500);
}

function showAlert(msg) {
    if (tg && tg.showAlert) tg.showAlert(msg);
    else alert(msg);
}
