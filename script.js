/* ==========================================================================
   COFFEE & WATER TRACKER - CORE APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // APP STATE
    let activeMainTab = 'coffee'; // 'coffee' or 'water'
    
    let coffees = [];
    let waters = [];

    const BOTTLE_SIZE_ML = 750; // Standard bottle size requested by user (750 ml)

    // Coffee chart states
    let activeCoffeeMetric = 'consumo'; // 'consumo' or 'gasto'
    let activeCoffeeTimeframe = 'dia'; // 'dia', 'dia-semana', 'mes', 'ano'
    
    // Water chart states
    let activeWaterUnit = 'liters'; // 'liters', 'ml', 'bottles'
    let activeWaterTimeframe = 'dia'; // 'dia', 'dia-semana', 'mes', 'ano'

    let currentRating = 4;
    let selectedPeopleMode = '1';

    // Chart instances
    let primaryChart = null;
    let homeVsOutsideChart = null;
    let ratingsChart = null;
    let waterPrimaryChart = null;

    // DOM ELEMENTS - GENERAL & TABS
    const tabBtnCoffee = document.getElementById('tab-btn-coffee');
    const tabBtnWater = document.getElementById('tab-btn-water');
    const viewCoffee = document.getElementById('view-coffee');
    const viewWater = document.getElementById('view-water');

    const ctaCoffee = document.querySelector('.cta-coffee');
    const ctaWater = document.querySelector('.cta-water');
    const brandIcon = document.getElementById('brand-main-icon');

    // DOM ELEMENTS - COFFEE MODAL
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const formCafe = document.getElementById('form-cafe');
    const modalTitle = document.getElementById('modal-title');
    const editIdInput = document.getElementById('edit-id');
    
    const btnAddCoffee = document.getElementById('adicionar-caffeina');
    const btnCloseModal = document.getElementById('fechar-modal');
    const btnCancelModal = document.getElementById('btn-cancelar');
    const btnExportData = document.getElementById('btn-export-data');

    const tipoForaRadio = document.getElementById('tipo-fora');
    const tipoCasaRadio = document.getElementById('tipo-casa');
    const homeBrewSection = document.getElementById('home-brew-section');
    const moidoSimRadio = document.getElementById('moido-sim');
    const moidoNaoRadio = document.getElementById('moido-nao');
    const grauMoagemBox = document.getElementById('grau-moagem-box');

    const starPicker = document.getElementById('star-picker');
    const avaliacaoInput = document.getElementById('avaliacao');
    const ratingLabelText = document.getElementById('rating-label-text');
    const btnZeroStar = document.getElementById('btn-zero-star');

    const btnSolo = document.getElementById('btn-solo');
    const btnGroup = document.getElementById('btn-group');
    const groupCountBox = document.getElementById('group-count-box');
    const numPessoasInput = document.getElementById('num-pessoas');
    const btnDecPessoas = document.getElementById('btn-dec-pessoas');
    const btnIncPessoas = document.getElementById('btn-inc-pessoas');

    const searchHistoryInput = document.getElementById('search-history');
    const filterTypeSelect = document.getElementById('filter-type');
    const coffeeListContainer = document.getElementById('coffee-list');
    const historyCounter = document.getElementById('history-counter');

    // DOM ELEMENTS - WATER MODAL & ACTIONS
    const modalWater = document.getElementById('modal-water');
    const modalWaterOverlay = document.getElementById('modal-water-overlay');
    const formWater = document.getElementById('form-water');
    const modalWaterTitle = document.getElementById('modal-water-title');
    const editWaterIdInput = document.getElementById('edit-water-id');
    const waterMlInput = document.getElementById('water-ml');
    const waterDataHoraInput = document.getElementById('water-data-hora');
    const waterCalcPreview = document.getElementById('water-calc-preview');

    const btnAddWater = document.getElementById('adicionar-agua');
    const btnCloseWaterModal = document.getElementById('fechar-modal-water');
    const btnCancelWaterModal = document.getElementById('btn-cancelar-water');
    const waterListContainer = document.getElementById('water-list');
    const waterHistoryCounter = document.getElementById('water-history-counter');

    // DOM ELEMENTS - EXPORT MODAL
    const modalExport = document.getElementById('modal-export');
    const modalExportOverlay = document.getElementById('modal-export-overlay');
    const btnCloseExport = document.getElementById('fechar-modal-export');
    const btnDownloadJson = document.getElementById('btn-download-json');
    const inputImportJson = document.getElementById('input-import-json');

    /* ==========================================================================
       INITIAL DATA (Empty start for user)
       ========================================================================== */
    const DEMO_COFFEES = [];
    const DEMO_WATERS = [];

    /* ==========================================================================
       API CLIENT & SERVER STORAGE
       ========================================================================== */
    const api = {
        async getData() {
            const res = await fetch('/api/data', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async addCoffee(coffee) {
            const res = await fetch('/api/coffees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coffee)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async updateCoffee(id, coffee) {
            const res = await fetch(`/api/coffees/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coffee)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async deleteCoffee(id) {
            const res = await fetch(`/api/coffees/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async addWater(water) {
            const res = await fetch('/api/waters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(water)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async updateWater(id, water) {
            const res = await fetch(`/api/waters/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(water)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async deleteWater(id) {
            const res = await fetch(`/api/waters/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async syncData(payload) {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        },
        async importData(payload) {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        }
    };

    // Current local time as "YYYY-MM-DDTHH:mm" (toISOString() alone gives UTC, wrong hour/day)
    function localNowStr() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    function setServerStatus(status, details = '') {
        const pill = document.getElementById('server-status-pill');
        if (!pill) return;
        if (status === 'online') {
            pill.className = 'server-pill online';
            pill.innerHTML = '<span class="status-dot"></span> <span class="status-text">Servidor</span>';
            pill.title = 'Sincronizado em tempo real com a base de dados no servidor' + (details ? ` (${details})` : '');
        } else if (status === 'saving') {
            pill.className = 'server-pill saving';
            pill.innerHTML = '<span class="status-dot"></span> <span class="status-text">A gravar...</span>';
            pill.title = 'A enviar alterações para o servidor...';
        } else if (status === 'offline') {
            pill.className = 'server-pill offline';
            pill.innerHTML = '<span class="status-dot"></span> <span class="status-text">Offline</span>';
            pill.title = 'Não foi possível ligar ao servidor. A utilizar cópia local.';
        }
    }

    function saveLocalBackup() {
        try {
            localStorage.setItem('coffee_tracker_data', JSON.stringify(coffees));
            localStorage.setItem('water_tracker_data', JSON.stringify(waters));
        } catch (e) {
            console.warn('[Cache] Erro ao gravar cache local:', e);
        }
    }

    /* ==========================================================================
       INITIALIZATION & STORAGE
       ========================================================================== */
    async function initApp() {
        startClock();
        setupEventListeners();
        await loadData();
        updateUI();
        setInterval(pollServerUpdates, 15000);
    }

    async function loadData() {
        setServerStatus('saving');
        try {
            const data = await api.getData();
            
            // Check legacy localStorage for migration if server is empty
            const storedCoffee = localStorage.getItem('coffee_tracker_data');
            const storedWater = localStorage.getItem('water_tracker_data');
            let localCoffees = [];
            let localWaters = [];
            try { if (storedCoffee) localCoffees = JSON.parse(storedCoffee); } catch (e) {}
            try { if (storedWater) localWaters = JSON.parse(storedWater); } catch (e) {}

            const serverEmpty = (!data.coffees || data.coffees.length === 0) && (!data.waters || data.waters.length === 0);
            const localHasData = (localCoffees.length > 0 || localWaters.length > 0);

            if (serverEmpty && localHasData) {
                console.log('[Sync] Migrando dados do localStorage para o servidor...');
                await api.syncData({ coffees: localCoffees, waters: localWaters });
                coffees = localCoffees;
                waters = localWaters;
            } else {
                coffees = Array.isArray(data.coffees) ? data.coffees : [];
                waters = Array.isArray(data.waters) ? data.waters : [];
            }

            saveLocalBackup();
            setServerStatus('online');
        } catch (err) {
            console.warn('[Sync] Falha ao comunicar com servidor. A usar cópia de segurança local:', err);
            setServerStatus('offline');
            const storedCoffee = localStorage.getItem('coffee_tracker_data');
            if (storedCoffee) {
                try { coffees = JSON.parse(storedCoffee); } catch (e) { coffees = []; }
            } else { coffees = []; }

            const storedWater = localStorage.getItem('water_tracker_data');
            if (storedWater) {
                try { waters = JSON.parse(storedWater); } catch (e) { waters = []; }
            } else { waters = []; }
        }
    }

    let isPolling = false;
    async function pollServerUpdates() {
        if (isPolling) return;
        isPolling = true;
        try {
            const data = await api.getData();
            setServerStatus('online');
            
            const serverCoffeesJson = JSON.stringify(data.coffees || []);
            const serverWatersJson = JSON.stringify(data.waters || []);
            const currentCoffeesJson = JSON.stringify(coffees);
            const currentWatersJson = JSON.stringify(waters);

            if (serverCoffeesJson !== currentCoffeesJson || serverWatersJson !== currentWatersJson) {
                coffees = Array.isArray(data.coffees) ? data.coffees : [];
                waters = Array.isArray(data.waters) ? data.waters : [];
                saveLocalBackup();
                updateUI();
            }
        } catch (err) {
            setServerStatus('offline');
        } finally {
            isPolling = false;
        }
    }

    /* ==========================================================================
       CLOCK (LOCAL TIME)
       ========================================================================== */
    function startClock() {
        const clockEl = document.getElementById('app-clock');
        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (clockEl) clockEl.textContent = timeStr;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ==========================================================================
       MAIN TAB NAVIGATION SWITCHING
       ========================================================================== */
    function switchTab(tab) {
        activeMainTab = tab;
        if (tab === 'coffee') {
            tabBtnCoffee.classList.add('active');
            tabBtnWater.classList.remove('active');
            viewCoffee.classList.remove('hidden');
            viewWater.classList.add('hidden');

            ctaCoffee.classList.remove('hidden');
            ctaWater.classList.add('hidden');
            if (brandIcon) brandIcon.className = 'fa-solid fa-mug-hot';
        } else {
            tabBtnWater.classList.add('active');
            tabBtnCoffee.classList.remove('active');
            viewWater.classList.remove('hidden');
            viewCoffee.classList.add('hidden');

            ctaWater.classList.remove('hidden');
            ctaCoffee.classList.add('hidden');
            if (brandIcon) brandIcon.className = 'fa-solid fa-droplet';
        }
        updateUI();
    }

    /* ==========================================================================
       UPDATE UI FOR ACTIVE VIEW
       ========================================================================== */
    function updateUI() {
        if (activeMainTab === 'coffee') {
            renderCoffeeStats();
            renderCoffeeCharts();
            renderCoffeeHistory();
        } else {
            renderWaterStats();
            renderWaterCharts();
            renderWaterHistory();
        }
    }

    /* ==========================================================================
       COFFEE STATS (SEM GRÁFICO)
       ========================================================================== */
    function renderCoffeeStats() {
        if (!coffees || coffees.length === 0) {
            setStatText('stat-cafe-preferido', '--');
            setStatText('stat-cafe-preferido-sub', 'Sem registos');
            setStatText('stat-horario-pico', '--');
            setStatText('stat-dia-semana-pico', '--');
            setStatText('stat-media-cafes-dia', '0.0');
            setStatText('stat-total-cafes', '0 cafés registados');
            setStatText('stat-media-gasto-dia', '0,00 €');
            setStatText('stat-total-gasto', 'Total: 0,00 €');
            setStatText('stat-cafe-mais-caro-preco', '0,00 €');
            setStatText('stat-cafe-mais-caro-info', '--');
            setStatText('stat-cafe-mais-barato-preco', '0,00 €');
            setStatText('stat-cafe-mais-barato-info', '--');
            setStatText('stat-media-pessoas', '0.0 pessoas');
            setStatText('stat-sozinho-vs-pessoas', '0 vs 0');
            setStatText('stat-sozinho-pct', '0% Sozinho | 0% Acompanhado');
            return;
        }

        const countsByBebida = {};
        const ratingSumByBebida = {};
        const ratedCountByBebida = {};
        coffees.forEach(c => {
            countsByBebida[c.bebida] = (countsByBebida[c.bebida] || 0) + 1;
            if (c.avaliacao > 0) {
                ratingSumByBebida[c.bebida] = (ratingSumByBebida[c.bebida] || 0) + Number(c.avaliacao);
                ratedCountByBebida[c.bebida] = (ratedCountByBebida[c.bebida] || 0) + 1;
            }
        });

        let prefName = '--';
        let maxScore = -1;
        Object.keys(countsByBebida).forEach(b => {
            const count = countsByBebida[b];
            // unrated drinks get a neutral 4.0 instead of being divided by all entries
            const avgRating = ratedCountByBebida[b] ? ratingSumByBebida[b] / ratedCountByBebida[b] : 4;
            const score = count * 2 + avgRating;
            if (score > maxScore) { maxScore = score; prefName = b; }
        });
        const prefCount = countsByBebida[prefName] || 0;
        setStatText('stat-cafe-preferido', prefName);
        setStatText('stat-cafe-preferido-sub', `Consumido ${prefCount}x • Média de avaliação alta`);

        const hourBins = { 'Manhã (07h-11h)': 0, 'Almoço (11h-14h)': 0, 'Tarde (14h-18h)': 0, 'Noite (18h-23h)': 0 };
        coffees.forEach(c => {
            const h = new Date(c.dataHora).getHours();
            if (h >= 7 && h < 11) hourBins['Manhã (07h-11h)']++;
            else if (h >= 11 && h < 14) hourBins['Almoço (11h-14h)']++;
            else if (h >= 14 && h < 18) hourBins['Tarde (14h-18h)']++;
            else hourBins['Noite (18h-23h)']++;
        });

        let picoHorario = '--';
        let maxHCount = -1;
        Object.keys(hourBins).forEach(bin => {
            if (hourBins[bin] > maxHCount) { maxHCount = hourBins[bin]; picoHorario = bin; }
        });
        setStatText('stat-horario-pico', picoHorario);
        setStatText('stat-horario-pico-sub', `${maxHCount} cafés consumidos nesta faixa`);

        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const countByDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
        coffees.forEach(c => {
            const d = new Date(c.dataHora).getDay();
            countByDayOfWeek[d]++;
        });
        let maxDayIdx = 0;
        countByDayOfWeek.forEach((cnt, idx) => { if (cnt > countByDayOfWeek[maxDayIdx]) maxDayIdx = idx; });
        setStatText('stat-dia-semana-pico', diasSemana[maxDayIdx]);
        setStatText('stat-dia-semana-pico-sub', `${countByDayOfWeek[maxDayIdx]} cafés aos ${diasSemana[maxDayIdx]}s`);

        const distinctDates = new Set(coffees.map(c => c.dataHora.split('T')[0]));
        const numDays = Math.max(distinctDates.size, 1);
        const totalCafes = coffees.length;
        const totalGasto = coffees.reduce((acc, c) => acc + Number(c.preco || 0), 0);

        setStatText('stat-media-cafes-dia', `${(totalCafes / numDays).toFixed(1)} / dia`);
        setStatText('stat-total-cafes', `${totalCafes} cafés em ${numDays} dias ativos`);

        setStatText('stat-media-gasto-dia', `${formatEuro(totalGasto / numDays)} / dia`);
        setStatText('stat-total-gasto', `Total investido: ${formatEuro(totalGasto)}`);

        let cafeMaisCaro = coffees[0];
        let cafeMaisBarato = coffees[0];
        coffees.forEach(c => {
            if (Number(c.preco) > Number(cafeMaisCaro.preco)) cafeMaisCaro = c;
            if (Number(c.preco) < Number(cafeMaisBarato.preco)) cafeMaisBarato = c;
        });

        setStatText('stat-cafe-mais-caro-preco', formatEuro(cafeMaisCaro.preco));
        setStatText('stat-cafe-mais-caro-info', `${cafeMaisCaro.bebida} @ ${cafeMaisCaro.lugar || 'Sem local'}`);

        setStatText('stat-cafe-mais-barato-preco', formatEuro(cafeMaisBarato.preco));
        setStatText('stat-cafe-mais-barato-info', `${cafeMaisBarato.bebida} @ ${cafeMaisBarato.lugar || 'Sem local'}`);

        const totalPessoasSum = coffees.reduce((acc, c) => acc + Number(c.pessoas || 1), 0);
        setStatText('stat-media-pessoas', `${(totalPessoasSum / totalCafes).toFixed(1)} pessoas`);

        const soloCount = coffees.filter(c => Number(c.pessoas || 1) <= 1).length;
        const groupCount = totalCafes - soloCount;
        const soloPct = Math.round((soloCount / totalCafes) * 100);
        setStatText('stat-sozinho-vs-pessoas', `${soloCount} Sozinho vs ${groupCount} Acompanhado`);
        setStatText('stat-sozinho-pct', `${soloPct}% Sozinho • ${100 - soloPct}% Com Pessoas`);
    }

    /* ==========================================================================
       WATER STATS & 750ml BOTTLE CALCULATIONS
       ========================================================================== */
    function renderWaterStats() {
        if (!waters || waters.length === 0) {
            setStatText('stat-water-total-liters', '0,0 L');
            setStatText('stat-water-total-ml', '0 ml registados');
            setStatText('stat-water-total-bottles', '0.0 garrafas');
            setStatText('stat-water-daily-avg', '0,0 L / dia');
            setStatText('stat-water-daily-bottles', '0.0 garrafas de 750 ml/dia');
            setStatText('stat-water-peak-hour', '--');
            setStatText('stat-water-peak-day', '--');
            setStatText('stat-water-entries-count', '0 registos');
            return;
        }

        const totalMl = waters.reduce((acc, w) => acc + Number(w.ml || 0), 0);
        const totalLiters = (totalMl / 1000).toFixed(2);
        const totalBottles = (totalMl / BOTTLE_SIZE_ML).toFixed(1);

        setStatText('stat-water-total-liters', `${totalLiters.replace('.', ',')} L`);
        setStatText('stat-water-total-ml', `${totalMl.toLocaleString('pt-PT')} ml registados`);
        setStatText('stat-water-total-bottles', `${totalBottles} garrafas (750 ml)`);

        const distinctDates = new Set(waters.map(w => w.dataHora.split('T')[0]));
        const numDays = Math.max(distinctDates.size, 1);
        const dailyAvgMl = totalMl / numDays;
        const dailyAvgLiters = (dailyAvgMl / 1000).toFixed(2);
        const dailyAvgBottles = (dailyAvgMl / BOTTLE_SIZE_ML).toFixed(1);

        setStatText('stat-water-daily-avg', `${dailyAvgLiters.replace('.', ',')} L / dia`);
        setStatText('stat-water-daily-bottles', `~${dailyAvgBottles} garrafas (750ml) por dia em ${numDays} dias`);

        // Peak hour for water
        const hourBins = { 'Manhã (07h-11h)': 0, 'Almoço (11h-14h)': 0, 'Tarde (14h-18h)': 0, 'Noite (18h-23h)': 0 };
        waters.forEach(w => {
            const h = new Date(w.dataHora).getHours();
            if (h >= 7 && h < 11) hourBins['Manhã (07h-11h)'] += Number(w.ml);
            else if (h >= 11 && h < 14) hourBins['Almoço (11h-14h)'] += Number(w.ml);
            else if (h >= 14 && h < 18) hourBins['Tarde (14h-18h)'] += Number(w.ml);
            else hourBins['Noite (18h-23h)'] += Number(w.ml);
        });

        let peakHourStr = '--';
        let maxVolume = -1;
        Object.keys(hourBins).forEach(bin => {
            if (hourBins[bin] > maxVolume) { maxVolume = hourBins[bin]; peakHourStr = bin; }
        });
        setStatText('stat-water-peak-hour', peakHourStr);
        setStatText('stat-water-peak-hour-sub', `Maior consumo acumulado nesta faixa`);

        // Peak day of week for water
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const mlByDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
        waters.forEach(w => {
            const d = new Date(w.dataHora).getDay();
            mlByDayOfWeek[d] += Number(w.ml);
        });
        let maxDayIdx = 0;
        mlByDayOfWeek.forEach((val, idx) => { if (val > mlByDayOfWeek[maxDayIdx]) maxDayIdx = idx; });
        setStatText('stat-water-peak-day', diasSemana[maxDayIdx]);
        setStatText('stat-water-peak-day-sub', `${(mlByDayOfWeek[maxDayIdx] / 1000).toFixed(1)} L tomados aos ${diasSemana[maxDayIdx]}s`);

        setStatText('stat-water-entries-count', `${waters.length} registos`);
    }

    function setStatText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function formatEuro(val) {
        const num = Number(val || 0);
        return num.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }

    /* ==========================================================================
       CHARTS RENDERING
       ========================================================================== */
    function renderCoffeeCharts() {
        if (!window.Chart) return;

        if (primaryChart) primaryChart.destroy();
        if (homeVsOutsideChart) homeVsOutsideChart.destroy();
        if (ratingsChart) ratingsChart.destroy();

        const primaryCtx = document.getElementById('primaryChart').getContext('2d');
        const chartData = processCoffeeChartData(activeCoffeeMetric, activeCoffeeTimeframe);

        const isGasto = activeCoffeeMetric === 'gasto';
        const labelText = isGasto ? 'Valor Gasto em Euros (€)' : 'Quantidade de Cafés';

        const gradient = primaryCtx.createLinearGradient(0, 0, 0, 300);
        if (isGasto) {
            gradient.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
            gradient.addColorStop(1, 'rgba(217, 119, 6, 0.15)');
        } else {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
            gradient.addColorStop(1, 'rgba(120, 53, 15, 0.15)');
        }

        primaryChart = new Chart(primaryCtx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: labelText,
                    data: chartData.values,
                    backgroundColor: gradient,
                    borderColor: isGasto ? '#fbbf24' : '#f59e0b',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#141b27',
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let val = context.raw;
                                return isGasto ? ` Total Gasto: ${formatEuro(val)}` : ` Cafés: ${val}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // Doughnuts
        const homeVsCtx = document.getElementById('homeVsOutsideChart').getContext('2d');
        const homeCount = coffees.filter(c => c.tipo === 'casa').length;
        homeVsOutsideChart = new Chart(homeVsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Feito em Casa 🏠', 'Cafeterias ☕'],
                datasets: [{ data: [homeCount, coffees.length - homeCount], backgroundColor: ['#10b981', '#d97706'], borderWidth: 2, borderColor: '#141b27' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }, cutout: '70%' }
        });

        const ratingsCtx = document.getElementById('ratingsChart').getContext('2d');
        const ratingBins = [0, 0, 0, 0, 0, 0];
        coffees.forEach(c => { const r = Math.round(c.avaliacao || 0); if (r >= 0 && r <= 5) ratingBins[r]++; });
        ratingsChart = new Chart(ratingsCtx, {
            type: 'bar',
            data: {
                labels: ['Pendente', '1★', '2★', '3★', '4★', '5★'],
                datasets: [{ label: 'Cafés', data: ratingBins, backgroundColor: ['#64748b', '#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981'], borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
        });
    }

    function processCoffeeChartData(metric, timeframe) {
        const sorted = [...coffees].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
        const labels = []; const values = [];
        const isGasto = metric === 'gasto';

        if (timeframe === 'dia') {
            const map = {};
            sorted.forEach(c => {
                const k = c.dataHora.split('T')[0];
                map[k] = (map[k] || 0) + (isGasto ? Number(c.preco) : 1);
            });
            Object.keys(map).forEach(k => {
                const p = k.split('-');
                labels.push(`${p[2]}/${p[1]}`);
                values.push(Number(map[k].toFixed(2)));
            });
        } else if (timeframe === 'dia-semana') {
            const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const map = [0, 0, 0, 0, 0, 0, 0];
            sorted.forEach(c => { map[new Date(c.dataHora).getDay()] += (isGasto ? Number(c.preco) : 1); });
            dias.forEach((d, i) => { labels.push(d); values.push(Number(map[i].toFixed(2))); });
        } else if (timeframe === 'mes') {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const map = {};
            sorted.forEach(c => {
                const d = new Date(c.dataHora);
                const k = `${d.getFullYear()}-${d.getMonth()}`;
                map[k] = (map[k] || 0) + (isGasto ? Number(c.preco) : 1);
            });
            Object.keys(map).forEach(k => {
                const [yr, mIdx] = k.split('-');
                labels.push(`${meses[mIdx]} ${yr}`);
                values.push(Number(map[k].toFixed(2)));
            });
        } else if (timeframe === 'ano') {
            const map = {};
            sorted.forEach(c => {
                const yr = new Date(c.dataHora).getFullYear();
                map[yr] = (map[yr] || 0) + (isGasto ? Number(c.preco) : 1);
            });
            Object.keys(map).forEach(yr => { labels.push(yr); values.push(Number(map[yr].toFixed(2))); });
        }
        return { labels, values };
    }

    function renderWaterCharts() {
        if (!window.Chart) return;
        if (waterPrimaryChart) waterPrimaryChart.destroy();

        const canvas = document.getElementById('waterPrimaryChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const chartData = processWaterChartData(activeWaterUnit, activeWaterTimeframe);

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

        let labelText = 'Consumo em Litros (L)';
        if (activeWaterUnit === 'ml') labelText = 'Consumo em Mililitros (ml)';
        else if (activeWaterUnit === 'bottles') labelText = 'Garrafas de 750 ml';

        waterPrimaryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: labelText,
                    data: chartData.values,
                    backgroundColor: gradient,
                    borderColor: '#22d3ee',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#162030',
                        borderColor: 'rgba(6, 182, 212, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                if (activeWaterUnit === 'liters') {
                                    const bottles = (val * 1000 / BOTTLE_SIZE_ML).toFixed(1);
                                    return ` Consumo: ${val} L (~${bottles} garrafas de 750ml)`;
                                } else if (activeWaterUnit === 'ml') {
                                    const bottles = (val / BOTTLE_SIZE_ML).toFixed(1);
                                    return ` Consumo: ${val} ml (~${bottles} garrafas de 750ml)`;
                                } else {
                                    const liters = (val * BOTTLE_SIZE_ML / 1000).toFixed(2);
                                    return ` Garrafas (750ml): ${val} (~${liters} L)`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    function processWaterChartData(unit, timeframe) {
        const sorted = [...waters].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
        const labels = []; const values = [];

        function convertVal(ml) {
            if (unit === 'liters') return Number((ml / 1000).toFixed(2));
            if (unit === 'bottles') return Number((ml / BOTTLE_SIZE_ML).toFixed(1));
            return ml;
        }

        if (timeframe === 'dia') {
            const map = {};
            sorted.forEach(w => {
                const k = w.dataHora.split('T')[0];
                map[k] = (map[k] || 0) + Number(w.ml);
            });
            Object.keys(map).forEach(k => {
                const p = k.split('-');
                labels.push(`${p[2]}/${p[1]}`);
                values.push(convertVal(map[k]));
            });
        } else if (timeframe === 'dia-semana') {
            const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const map = [0, 0, 0, 0, 0, 0, 0];
            sorted.forEach(w => { map[new Date(w.dataHora).getDay()] += Number(w.ml); });
            dias.forEach((d, i) => { labels.push(d); values.push(convertVal(map[i])); });
        } else if (timeframe === 'mes') {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const map = {};
            sorted.forEach(w => {
                const d = new Date(w.dataHora);
                const k = `${d.getFullYear()}-${d.getMonth()}`;
                map[k] = (map[k] || 0) + Number(w.ml);
            });
            Object.keys(map).forEach(k => {
                const [yr, mIdx] = k.split('-');
                labels.push(`${meses[mIdx]} ${yr}`);
                values.push(convertVal(map[k]));
            });
        } else if (timeframe === 'ano') {
            const map = {};
            sorted.forEach(w => {
                const yr = new Date(w.dataHora).getFullYear();
                map[yr] = (map[yr] || 0) + Number(w.ml);
            });
            Object.keys(map).forEach(yr => { labels.push(yr); values.push(convertVal(map[yr])); });
        }
        return { labels, values };
    }

    /* ==========================================================================
       HISTORY LISTINGS
       ========================================================================== */
    function renderCoffeeHistory() {
        if (!coffeeListContainer) return;
        const searchTerm = (searchHistoryInput.value || '').toLowerCase();
        const filterType = filterTypeSelect.value;

        let filtered = coffees.filter(c => {
            const matchSearch = String(c.bebida || '').toLowerCase().includes(searchTerm) || 
                                (c.lugar && c.lugar.toLowerCase().includes(searchTerm));
            let matchType = true;
            if (filterType === 'casa') matchType = c.tipo === 'casa';
            else if (filterType === 'fora') matchType = c.tipo === 'fora';
            else if (filterType === 'pendente') matchType = Number(c.avaliacao || 0) === 0;
            return matchSearch && matchType;
        });

        filtered.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        if (historyCounter) historyCounter.textContent = `${filtered.length} de ${coffees.length} registos`;

        if (filtered.length === 0) {
            coffeeListContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-mug-hot"></i><p>Nenhum café encontrado.</p></div>`;
            return;
        }

        coffeeListContainer.innerHTML = filtered.map(c => renderCoffeeCardHTML(c)).join('');

        document.querySelectorAll('.btn-delete-coffee').forEach(btn => {
            btn.addEventListener('click', (e) => deleteCoffee(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-edit-coffee').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-quick-rate').forEach(btn => {
            btn.addEventListener('click', (e) => openQuickRateModal(e.currentTarget.getAttribute('data-id')));
        });
    }

    function renderCoffeeCardHTML(c) {
        const isHome = c.tipo === 'casa';
        const iconClass = isHome ? 'fa-house-chimney type-home' : 'fa-store type-outside';
        const badgeType = isHome ? '<span class="badge badge-home">Em Casa</span>' : '<span class="badge badge-outside">Cafeteria</span>';

        const formattedDate = new Date(c.dataHora).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let starsHTML = '';
        const rating = Number(c.avaliacao || 0);
        if (rating === 0) {
            starsHTML = `<button type="button" class="btn-rate-badge btn-quick-rate" data-id="${escapeHTML(c.id)}"><i class="fa-solid fa-star"></i> Avaliar Agora</button>`;
        } else {
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) starsHTML += `<i class="fa-solid fa-star"></i>`;
                else if (i - 0.5 <= rating) starsHTML += `<i class="fa-solid fa-star-half-stroke"></i>`;
                else starsHTML += `<i class="fa-regular fa-star star-empty"></i>`;
            }
        }

        const companionsText = Number(c.pessoas || 1) <= 1 ? '<i class="fa-solid fa-user"></i> Sozinho' : `<i class="fa-solid fa-users"></i> Com ${escapeHTML(c.pessoas)} pessoas`;

        let homeSpecsHTML = '';
        if (isHome) {
            const parts = [];
            if (c.peso) parts.push(`<strong>Peso:</strong> ${escapeHTML(c.peso)}g`);
            if (c.marcaGrao) parts.push(`<strong>Grão:</strong> ${escapeHTML(c.marcaGrao)}`);
            if (c.moido !== undefined) parts.push(`<strong>Moído:</strong> ${c.moido ? 'Sim' : 'Não'}${c.grauMoagem ? ' (' + escapeHTML(c.grauMoagem) + ')' : ''}`);
            if (c.tempoGasto) parts.push(`<strong>Tempo:</strong> ${escapeHTML(c.tempoGasto)}`);
            if (c.quantidadeFeita) parts.push(`<strong>Qtd:</strong> ${escapeHTML(c.quantidadeFeita)}`);
            if (parts.length > 0) homeSpecsHTML = `<div class="coffee-home-specs">${parts.join(' • ')}</div>`;
        }

        return `
            <div class="coffee-card" id="card-${escapeHTML(c.id)}">
                <div class="coffee-main-info">
                    <div class="coffee-type-icon ${isHome ? 'type-home' : 'type-outside'}">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="coffee-details">
                        <div class="coffee-title-line">
                            <span class="coffee-name">${escapeHTML(c.bebida)}</span>
                            ${badgeType}
                        </div>
                        <div class="coffee-meta">
                            <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(c.lugar || 'Sem local')}</span>
                            <span><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
                            <span>${companionsText}</span>
                        </div>
                        ${homeSpecsHTML}
                    </div>
                </div>

                <div class="coffee-right-info">
                    <div class="coffee-price-tag">${formatEuro(c.preco)}</div>
                    <div class="coffee-rating-stars">${starsHTML}</div>
                    <div class="coffee-actions">
                        <button class="btn-action btn-edit-coffee" data-id="${escapeHTML(c.id)}" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-action btn-delete btn-delete-coffee" data-id="${escapeHTML(c.id)}" title="Apagar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderWaterHistory() {
        if (!waterListContainer) return;
        const sorted = [...waters].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

        if (waterHistoryCounter) waterHistoryCounter.textContent = `${sorted.length} registos`;

        if (sorted.length === 0) {
            waterListContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-droplet"></i><p>Nenhum registo de água ainda.</p></div>`;
            return;
        }

        waterListContainer.innerHTML = sorted.map(w => renderWaterCardHTML(w)).join('');

        document.querySelectorAll('.btn-delete-water').forEach(btn => {
            btn.addEventListener('click', (e) => deleteWater(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-edit-water').forEach(btn => {
            btn.addEventListener('click', (e) => openEditWaterModal(e.currentTarget.getAttribute('data-id')));
        });
    }

    function renderWaterCardHTML(w) {
        const formattedDate = new Date(w.dataHora).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const liters = (w.ml / 1000).toFixed(2);
        const bottles = (w.ml / BOTTLE_SIZE_ML).toFixed(1);

        return `
            <div class="coffee-card" id="card-w-${escapeHTML(w.id)}">
                <div class="coffee-main-info">
                    <div class="coffee-type-icon type-water">
                        <i class="fa-solid fa-bottle-water"></i>
                    </div>
                    <div class="coffee-details">
                        <div class="coffee-title-line">
                            <span class="coffee-name">${escapeHTML(w.ml)} ml de Água</span>
                            <span class="badge badge-cyan">${bottles} garrafa(s) de 750ml</span>
                        </div>
                        <div class="coffee-meta">
                            <span><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
                            <span><i class="fa-solid fa-droplet"></i> ${liters.replace('.', ',')} Litros</span>
                        </div>
                    </div>
                </div>

                <div class="coffee-right-info">
                    <div class="water-amount-tag">${escapeHTML(w.ml)} ml</div>
                    <div class="coffee-actions">
                        <button class="btn-action btn-edit-water" data-id="${escapeHTML(w.id)}" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-action btn-delete btn-delete-water" data-id="${escapeHTML(w.id)}" title="Apagar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    /* ==========================================================================
       EVENTS & MODAL HANDLERS
       ========================================================================== */
    function setupEventListeners() {
        // Tab switching
        tabBtnCoffee.addEventListener('click', () => switchTab('coffee'));
        tabBtnWater.addEventListener('click', () => switchTab('water'));

        // Open modals
        btnAddCoffee.addEventListener('click', () => openAddModal());
        btnAddWater.addEventListener('click', () => openAddWaterModal());

        // Close coffee modal
        btnCloseModal.addEventListener('click', closeModal);
        btnCancelModal.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);

        // Close water modal
        btnCloseWaterModal.addEventListener('click', closeWaterModal);
        btnCancelWaterModal.addEventListener('click', closeWaterModal);
        modalWaterOverlay.addEventListener('click', closeWaterModal);

        // Quick water buttons in banner
        document.querySelectorAll('.btn-quick-water').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ml = parseInt(e.currentTarget.getAttribute('data-ml'));
                const label = e.currentTarget.getAttribute('data-label');
                quickAddWater(ml, label);
            });
        });

        // Water form presets chips
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ml = parseInt(e.currentTarget.getAttribute('data-ml'));
                waterMlInput.value = ml;
                updateWaterCalcPreview();
            });
        });

        waterMlInput.addEventListener('input', updateWaterCalcPreview);

        // Form submits
        formCafe.addEventListener('submit', handleCoffeeSubmit);
        formWater.addEventListener('submit', handleWaterSubmit);

        // Coffee origin radio
        tipoForaRadio.addEventListener('change', toggleOriginFields);
        tipoCasaRadio.addEventListener('change', toggleOriginFields);
        moidoSimRadio.addEventListener('change', toggleMoidoBox);
        moidoNaoRadio.addEventListener('change', toggleMoidoBox);

        setupStarPicker();
        setupPeopleCounter();

        // Chart controls - Coffee
        document.querySelectorAll('#chart-metric-group .btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#chart-metric-group .btn-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeCoffeeMetric = e.currentTarget.getAttribute('data-metric');
                renderCoffeeCharts();
            });
        });

        document.querySelectorAll('#chart-timeframe-group .btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#chart-timeframe-group .btn-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeCoffeeTimeframe = e.currentTarget.getAttribute('data-timeframe');
                renderCoffeeCharts();
            });
        });

        // Chart controls - Water
        document.querySelectorAll('#water-chart-unit-group .btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#water-chart-unit-group .btn-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeWaterUnit = e.currentTarget.getAttribute('data-unit');
                renderWaterCharts();
            });
        });

        document.querySelectorAll('#water-chart-timeframe-group .btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#water-chart-timeframe-group .btn-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeWaterTimeframe = e.currentTarget.getAttribute('data-timeframe');
                renderWaterCharts();
            });
        });

        // Search & filter
        searchHistoryInput.addEventListener('input', renderCoffeeHistory);
        filterTypeSelect.addEventListener('change', renderCoffeeHistory);

        // Export/Import
        btnExportData.addEventListener('click', () => modalExport.classList.remove('escondido'));
        btnCloseExport.addEventListener('click', () => modalExport.classList.add('escondido'));
        modalExportOverlay.addEventListener('click', () => modalExport.classList.add('escondido'));
        btnDownloadJson.addEventListener('click', exportJSON);
        inputImportJson.addEventListener('change', importJSON);

        setupQuickRateModal();
    }

    /* WATER QUICK ADD & FORM */
    async function quickAddWater(ml, label) {
        const nowStr = localNowStr();
        const newWater = { id: 'w_' + Date.now(), ml: Number(ml), dataHora: nowStr };
        setServerStatus('saving');
        try {
            const res = await api.addWater(newWater);
            waters.unshift(res.water || newWater);
            setServerStatus('online');
        } catch (err) {
            console.warn('[Water] Erro ao gravar no servidor:', err);
            waters.unshift(newWater);
            setServerStatus('offline');
        }
        saveLocalBackup();
        updateUI();
        const bottles = (ml / BOTTLE_SIZE_ML).toFixed(1);
        showToast(`+${ml} ml de Água (${bottles} garrafa de 750ml) guardados no servidor! 💧`);
    }

    function openAddWaterModal() {
        formWater.reset();
        editWaterIdInput.value = '';
        modalWaterTitle.textContent = 'Registar Consumo de Água';
        waterMlInput.value = 750;

        waterDataHoraInput.value = localNowStr();

        updateWaterCalcPreview();
        modalWater.classList.remove('escondido');
    }

    function openEditWaterModal(id) {
        const item = waters.find(w => w.id === id);
        if (!item) return;

        editWaterIdInput.value = item.id;
        modalWaterTitle.textContent = 'Editar Registo de Água';
        waterMlInput.value = item.ml;
        waterDataHoraInput.value = item.dataHora || '';

        updateWaterCalcPreview();
        modalWater.classList.remove('escondido');
    }

    function closeWaterModal() {
        modalWater.classList.add('escondido');
    }

    function updateWaterCalcPreview() {
        const ml = parseInt(waterMlInput.value || 0);
        const liters = (ml / 1000).toFixed(2);
        const bottles = (ml / BOTTLE_SIZE_ML).toFixed(1);
        if (waterCalcPreview) {
            waterCalcPreview.textContent = `= ${liters.replace('.', ',')} L (${bottles} garrafa(s) de 750 ml)`;
        }
    }

    async function handleWaterSubmit(e) {
        e.preventDefault();
        const ml = parseInt(waterMlInput.value);
        const dataHora = waterDataHoraInput.value || localNowStr();
        if (isNaN(ml) || ml <= 0) {
            alert('Por favor introduza uma quantidade válida de água em ml.');
            return;
        }

        const editId = editWaterIdInput.value;
        const newWaterData = { id: editId || 'w_' + Date.now(), ml, dataHora };
        setServerStatus('saving');

        if (editId) {
            try {
                const res = await api.updateWater(editId, newWaterData);
                const index = waters.findIndex(w => w.id === editId);
                if (index !== -1) waters[index] = res.water || newWaterData;
                setServerStatus('online');
            } catch (err) {
                console.warn('[Water] Erro ao atualizar no servidor:', err);
                const index = waters.findIndex(w => w.id === editId);
                if (index !== -1) waters[index] = newWaterData;
                setServerStatus('offline');
            }
            showToast('Registo de água atualizado no servidor! 💧');
        } else {
            try {
                const res = await api.addWater(newWaterData);
                waters.unshift(res.water || newWaterData);
                setServerStatus('online');
            } catch (err) {
                console.warn('[Water] Erro ao gravar no servidor:', err);
                waters.unshift(newWaterData);
                setServerStatus('offline');
            }
            showToast(`+${ml} ml de água guardados no servidor! 💧`);
        }

        saveLocalBackup();
        closeWaterModal();
        updateUI();
    }

    async function deleteWater(id) {
        if (!confirm('Tem a certeza que deseja apagar este registo de água?')) return;
        setServerStatus('saving');
        try {
            await api.deleteWater(id);
            waters = waters.filter(w => w.id !== id);
            setServerStatus('online');
        } catch (err) {
            console.warn('[Water] Erro ao remover do servidor:', err);
            waters = waters.filter(w => w.id !== id);
            setServerStatus('offline');
        }
        saveLocalBackup();
        updateUI();
        showToast('Registo de água removido do servidor.');
    }

    /* COFFEE MODAL & SUBMIT */
    function openAddModal() {
        formCafe.reset();
        editIdInput.value = '';
        modalTitle.textContent = 'Registar Novo Café';
        
        document.getElementById('data-hora').value = localNowStr();

        tipoForaRadio.checked = true;
        toggleOriginFields();
        setRating(4);
        setPeopleMode('1', 1);
        modal.classList.remove('escondido');
    }

    function openEditModal(id) {
        const item = coffees.find(c => c.id === id);
        if (!item) return;

        editIdInput.value = item.id;
        modalTitle.textContent = 'Editar Registo de Café';

        document.getElementById('bebida').value = item.bebida || '';
        document.getElementById('preco').value = item.preco || '';
        document.getElementById('lugar-input').value = item.lugar || '';
        document.getElementById('data-hora').value = item.dataHora || '';

        if (item.tipo === 'casa') {
            tipoCasaRadio.checked = true;
            document.getElementById('peso-cafe').value = item.peso || '';
            document.getElementById('marca-grao').value = item.marcaGrao || '';
            if (item.moido === false) moidoNaoRadio.checked = true;
            else moidoSimRadio.checked = true;
            document.getElementById('grau-moagem').value = item.grauMoagem || '';
            document.getElementById('tempo-gasto').value = item.tempoGasto || '';
            document.getElementById('quantidade-feita').value = item.quantidadeFeita || '';
        } else {
            tipoForaRadio.checked = true;
        }

        toggleOriginFields();
        setRating(item.avaliacao || 0);

        const count = Number(item.pessoas || 1);
        if (count > 1) setPeopleMode('group', count);
        else setPeopleMode('1', 1);

        modal.classList.remove('escondido');
    }

    function closeModal() { modal.classList.add('escondido'); }
    function toggleOriginFields() { if (tipoCasaRadio.checked) homeBrewSection.classList.remove('hidden'); else homeBrewSection.classList.add('hidden'); }
    function toggleMoidoBox() { if (moidoNaoRadio.checked) grauMoagemBox.classList.add('hidden'); else grauMoagemBox.classList.remove('hidden'); }

    function setupStarPicker() {
        const stars = starPicker.querySelectorAll('.star-btn');
        stars.forEach(star => {
            star.addEventListener('mouseover', (e) => highlightStars(Number(e.currentTarget.getAttribute('data-value'))));
            star.addEventListener('mouseleave', () => highlightStars(currentRating));
            star.addEventListener('click', (e) => setRating(Number(e.currentTarget.getAttribute('data-value'))));
        });
        btnZeroStar.addEventListener('click', () => setRating(0));
    }

    function highlightStars(val) {
        starPicker.querySelectorAll('.star-btn').forEach((s, idx) => {
            if (idx < val) s.classList.add('active'); else s.classList.remove('active');
        });
    }

    function setRating(val) {
        currentRating = val;
        avaliacaoInput.value = val;
        highlightStars(val);
        if (val === 0) { ratingLabelText.textContent = 'Pendente de Avaliação'; }
        else { ratingLabelText.textContent = `${val}.0 / 5.0 Estrelas`; }
    }

    function setupPeopleCounter() {
        btnSolo.addEventListener('click', () => setPeopleMode('1', 1));
        btnGroup.addEventListener('click', () => setPeopleMode('group', Number(numPessoasInput.value || 2)));
        btnDecPessoas.addEventListener('click', () => {
            let val = parseInt(numPessoasInput.value || 2);
            if (val > 2) numPessoasInput.value = val - 1;
        });
        btnIncPessoas.addEventListener('click', () => {
            let val = parseInt(numPessoasInput.value || 2);
            numPessoasInput.value = val + 1;
        });
    }

    function setPeopleMode(mode, count) {
        selectedPeopleMode = mode;
        if (mode === '1') {
            btnSolo.classList.add('active');
            btnGroup.classList.remove('active');
            groupCountBox.classList.add('hidden');
            numPessoasInput.value = 1;
            numPessoasInput.disabled = true;
        } else {
            btnGroup.classList.add('active');
            btnSolo.classList.remove('active');
            groupCountBox.classList.remove('hidden');
            numPessoasInput.disabled = false;
            numPessoasInput.value = Math.max(count || 2, 2);
        }
    }

    async function handleCoffeeSubmit(e) {
        e.preventDefault();
        const bebida = document.getElementById('bebida').value.trim();
        const preco = parseFloat(document.getElementById('preco').value);
        const dataHora = document.getElementById('data-hora').value || localNowStr();
        const lugar = document.getElementById('lugar-input').value.trim();
        const tipo = tipoCasaRadio.checked ? 'casa' : 'fora';
        const avaliacao = parseFloat(avaliacaoInput.value || 0);

        let pessoas = 1;
        if (selectedPeopleMode === 'group') pessoas = parseInt(numPessoasInput.value || 2);

        if (!bebida || isNaN(preco)) {
            alert('Por favor preencha os campos obrigatórios (Nome do Café e Preço).');
            return;
        }

        const editId = editIdInput.value;
        const newCoffeeData = {
            id: editId || 'c_' + Date.now(),
            bebida,
            preco: Number(preco.toFixed(2)),
            avaliacao,
            lugar: lugar || (tipo === 'casa' ? 'Casa' : ''),
            dataHora,
            pessoas,
            tipo
        };

        if (tipo === 'casa') {
            newCoffeeData.peso = parseFloat(document.getElementById('peso-cafe').value) || null;
            newCoffeeData.marcaGrao = document.getElementById('marca-grao').value.trim() || null;
            newCoffeeData.moido = moidoSimRadio.checked;
            newCoffeeData.grauMoagem = document.getElementById('grau-moagem').value.trim() || null;
            newCoffeeData.tempoGasto = document.getElementById('tempo-gasto').value.trim() || null;
            newCoffeeData.quantidadeFeita = document.getElementById('quantidade-feita').value.trim() || null;
        }

        setServerStatus('saving');

        if (editId) {
            try {
                const res = await api.updateCoffee(editId, newCoffeeData);
                const index = coffees.findIndex(c => c.id === editId);
                if (index !== -1) coffees[index] = res.coffee || newCoffeeData;
                setServerStatus('online');
            } catch (err) {
                console.warn('[Coffee] Erro ao atualizar no servidor:', err);
                const index = coffees.findIndex(c => c.id === editId);
                if (index !== -1) coffees[index] = newCoffeeData;
                setServerStatus('offline');
            }
            showToast('Registo de café atualizado no servidor! ☕');
        } else {
            try {
                const res = await api.addCoffee(newCoffeeData);
                coffees.unshift(res.coffee || newCoffeeData);
                setServerStatus('online');
            } catch (err) {
                console.warn('[Coffee] Erro ao gravar no servidor:', err);
                coffees.unshift(newCoffeeData);
                setServerStatus('offline');
            }
            showToast('Novo café guardado no servidor! ☕');
        }

        saveLocalBackup();
        closeModal();
        updateUI();
    }

    async function deleteCoffee(id) {
        if (!confirm('Tem a certeza que deseja apagar este registo de café?')) return;
        setServerStatus('saving');
        try {
            await api.deleteCoffee(id);
            coffees = coffees.filter(c => c.id !== id);
            setServerStatus('online');
        } catch (err) {
            console.warn('[Coffee] Erro ao remover do servidor:', err);
            coffees = coffees.filter(c => c.id !== id);
            setServerStatus('offline');
        }
        saveLocalBackup();
        updateUI();
        showToast('Registo de café removido do servidor.');
    }

    /* EXPORT / IMPORT JSON */
    function exportJSON() {
        const payload = { coffees, waters };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `coffee_and_water_tracker_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    async function importJSON(e) {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = ''; // allow re-importing the same file later
        const reader = new FileReader();
        reader.onload = async function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                let importedCoffees = [];
                let importedWaters = [];
                if (Array.isArray(parsed)) {
                    importedCoffees = parsed;
                } else if (parsed && (Array.isArray(parsed.coffees) || Array.isArray(parsed.waters))) {
                    importedCoffees = Array.isArray(parsed.coffees) ? parsed.coffees : [];
                    importedWaters = Array.isArray(parsed.waters) ? parsed.waters : [];
                } else {
                    throw new Error('formato não reconhecido (esperado {"coffees": [], "waters": []}).');
                }

                // Each record needs id + dataHora, otherwise edit/delete and charts break
                const stamp = Date.now();
                importedCoffees = importedCoffees.filter(c => c && typeof c === 'object').map((c, i) => ({
                    ...c, id: c.id || `c_${stamp}_${i}`, dataHora: c.dataHora || localNowStr()
                }));
                importedWaters = importedWaters.filter(w => w && typeof w === 'object').map((w, i) => ({
                    ...w, id: w.id || `w_${stamp}_${i}`, dataHora: w.dataHora || localNowStr()
                }));

                if (!confirm(`Importar ${importedCoffees.length} cafés e ${importedWaters.length} registos de água? Isto substitui todos os dados atuais.`)) return;

                setServerStatus('saving');
                try {
                    const result = await api.importData({ coffees: importedCoffees, waters: importedWaters });
                    coffees = result.coffees || importedCoffees;
                    waters = result.waters || importedWaters;
                    setServerStatus('online');
                } catch (err) {
                    console.warn('[Import] Erro no servidor, a aplicar localmente:', err);
                    coffees = importedCoffees;
                    waters = importedWaters;
                    setServerStatus('offline');
                }

                saveLocalBackup();
                updateUI();
                modalExport.classList.add('escondido');
                showToast('Dados importados e guardados no servidor com sucesso! ☕💧');
            } catch (err) {
                alert('Erro ao ler o ficheiro JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    /* TOAST NOTIFICATION */
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* QUICK RATE MODAL */
    let currentQuickRateId = null;
    let currentQuickRatingValue = 5;
    const modalQuickRate = document.getElementById('modal-quick-rate');
    const modalQuickRateOverlay = document.getElementById('modal-quick-rate-overlay');
    const btnCloseQuickRate = document.getElementById('fechar-modal-quick-rate');
    const btnCancelQuickRate = document.getElementById('btn-cancel-quick-rate');
    const btnSaveQuickRate = document.getElementById('btn-save-quick-rate');
    const quickStarPicker = document.getElementById('quick-star-picker');
    const quickRatingLabel = document.getElementById('quick-rating-label');

    function setupQuickRateModal() {
        if (!modalQuickRate || !quickStarPicker) return;
        quickStarPicker.querySelectorAll('.star-btn').forEach(star => {
            star.addEventListener('mouseover', (e) => highlightQuickStars(Number(e.currentTarget.getAttribute('data-value'))));
            star.addEventListener('mouseleave', () => highlightQuickStars(currentQuickRatingValue));
            star.addEventListener('click', (e) => setQuickRating(Number(e.currentTarget.getAttribute('data-value'))));
        });
        if (btnCloseQuickRate) btnCloseQuickRate.addEventListener('click', closeQuickRateModal);
        if (btnCancelQuickRate) btnCancelQuickRate.addEventListener('click', closeQuickRateModal);
        if (modalQuickRateOverlay) modalQuickRateOverlay.addEventListener('click', closeQuickRateModal);
        if (btnSaveQuickRate) btnSaveQuickRate.addEventListener('click', saveQuickRating);
    }

    function openQuickRateModal(id) {
        const item = coffees.find(c => c.id === id);
        if (!item) return;
        currentQuickRateId = id;
        document.getElementById('quick-rate-coffee-title').textContent = item.bebida;
        document.getElementById('quick-rate-coffee-meta').textContent = `${formatEuro(item.preco)} • ${item.lugar || 'Sem local'}`;
        setQuickRating(item.avaliacao > 0 ? item.avaliacao : 5);
        modalQuickRate.classList.remove('escondido');
    }

    function closeQuickRateModal() {
        if (modalQuickRate) modalQuickRate.classList.add('escondido');
        currentQuickRateId = null;
    }

    function highlightQuickStars(val) {
        if (!quickStarPicker) return;
        quickStarPicker.querySelectorAll('.star-btn').forEach((s, idx) => {
            if (idx < val) s.classList.add('active'); else s.classList.remove('active');
        });
    }

    function setQuickRating(val) {
        currentQuickRatingValue = val;
        highlightQuickStars(val);
        if (quickRatingLabel) quickRatingLabel.textContent = `${val}.0 Estrelas ⭐`;
    }

    async function saveQuickRating() {
        if (!currentQuickRateId) return;
        const index = coffees.findIndex(c => c.id === currentQuickRateId);
        if (index === -1) return;
        const updatedRating = currentQuickRatingValue;
        setServerStatus('saving');
        try {
            await api.updateCoffee(currentQuickRateId, { avaliacao: updatedRating });
            coffees[index].avaliacao = updatedRating;
            setServerStatus('online');
        } catch (err) {
            console.warn('[Rate] Erro ao atualizar nota no servidor:', err);
            coffees[index].avaliacao = updatedRating;
            setServerStatus('offline');
        }
        saveLocalBackup();
        updateUI();
        closeQuickRateModal();
        showToast(`Avaliação de ${updatedRating}.0★ guardada no servidor! ☕`);
    }

    // Run app!
    initApp();
});
