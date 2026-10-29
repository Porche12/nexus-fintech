// Initialize Lucide Icons & AOS
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    if (window.AOS) AOS.init({ duration: 800, once: true });
    initCanvasBg();
    initCalculator();
    initDatabase();
});

// ================= Canvas Animated Background =================
function initCanvasBg() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ================= Interactive Resource Calculator =================
function initCalculator() {
    const nodesSlider = document.getElementById('nodes-slider');
    const ramSlider = document.getElementById('ram-slider');
    const nodesVal = document.getElementById('nodes-val');
    const ramVal = document.getElementById('ram-val');
    const rpsRes = document.getElementById('rps-res');
    const priceRes = document.getElementById('price-res');

    function updateCalc() {
        const nodes = parseInt(nodesSlider.value);
        const ram = parseInt(ramSlider.value);
        nodesVal.textContent = `${nodes} ${nodes === 1 ? 'узел' : 'узла(ов)'}`;
        ramVal.textContent = `${ram} GB`;

        const rps = nodes * 3200 + ram * 150;
        rpsRes.textContent = `${rps.toLocaleString('ru-RU')} RPS`;

        const price = (nodes * 9.5 + ram * 1.8).toFixed(2);
        priceRes.textContent = `$${price} / мес`;
    }

    if (nodesSlider && ramSlider) {
        nodesSlider.addEventListener('input', updateCalc);
        ramSlider.addEventListener('input', updateCalc);
        updateCalc();
    }
}

// ================= Dexie In-Browser Database =================
let db;
function initDatabase() {
    if (!window.Dexie) return;
    db = new Dexie('WebForgeAppDB');
    db.version(1).stores({
        records: '++id, operation, amount, timestamp'
    });

    loadDbRecords();
}

async function loadDbRecords() {
    if (!db) return;
    const records = await db.records.reverse().limit(10).toArray();
    const tbody = document.getElementById('db-records-body');
    if (!tbody) return;

    if (records.length === 0) {
        // Seed default records if empty
        await db.records.bulkAdd([
            { operation: 'Smart Contract Genesis Deployment', amount: 250, timestamp: new Date().toLocaleTimeString() },
            { operation: 'API Cluster Scale Event', amount: 120, timestamp: new Date().toLocaleTimeString() }
        ]);
        return loadDbRecords();
    }

    tbody.innerHTML = records.map(r => `
        <tr>
            <td><code>#${r.id}</code></td>
            <td><strong>${r.operation}</strong></td>
            <td><span class="badge" style="color: #38bdf8;">$${r.amount}</span></td>
            <td><small style="color: #94a3b8;">${r.timestamp}</small></td>
            <td><button class="delete-btn" onclick="deleteRecord(${r.id})"><i data-lucide="trash-2"></i></button></td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

async function addDbRecord() {
    const nameInp = document.getElementById('db-item-name');
    const amountInp = document.getElementById('db-item-amount');
    const name = nameInp.value.trim();
    const amount = parseFloat(amountInp.value) || 50;

    if (!name) {
        showToast('Введите название операции', 'warning');
        return;
    }

    await db.records.add({
        operation: name,
        amount: amount,
        timestamp: new Date().toLocaleTimeString()
    });

    nameInp.value = '';
    amountInp.value = '';
    showToast('Запись добавлена в локальную БД', 'success');
    loadDbRecords();
}

async function deleteRecord(id) {
    if (!db) return;
    await db.records.delete(id);
    showToast(`Запись #${id} удалена`, 'info');
    loadDbRecords();
}

// ================= Modal & Toast Utilities =================
function openModal() {
    document.getElementById('actionModal').classList.add('open');
}

function closeModal() {
    document.getElementById('actionModal').classList.remove('open');
}

function handleFormSubmit(e) {
    e.preventDefault();
    closeModal();

    // Trigger Confetti!
    if (window.confetti) {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
        });
    }

    showToast('Заявка принята! Узел успешно сконфигурирован.', 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
