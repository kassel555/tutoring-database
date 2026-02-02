// Tutoring Database Application - Hours-Based Management System
// Customized for package-based hours tracking with HST

// ============================================================================
// Initialize Supabase Client
// ============================================================================

const { createClient } = supabase;
const supabaseClient = createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);

// ============================================================================
// Global State
// ============================================================================

let clients = [];
let payments = [];
let lessons = [];
let currentClientId = null;
let clientSummaries = {}; // Cache for calculated client data

// ============================================================================
// Authentication Check
// ============================================================================

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        // Not logged in - redirect to login page
        window.location.href = 'login.html';
        return null;
    }

    return session;
}

function displayUserInfo(user) {
    const header = document.querySelector('header');
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span>👤 ${user.email}</span>
        <button id="sign-out-btn" class="btn-secondary">Sign Out</button>
    `;
    header.appendChild(userInfo);

    document.getElementById('sign-out-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    });
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const session = await checkAuth();
    if (!session) return; // Redirecting to login

    // Continue with normal app initialization
    setupTabNavigation();
    setTodayAsDefault();
    await loadAllData();

    // Show user info in header
    displayUserInfo(session.user);
});

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Update reports when switching to reports tab
    if (tabName === 'reports') {
        updateReports();
    }
}

function setTodayAsDefault() {
    const today = new Date().toISOString().split('T')[0];
    const paymentDate = document.getElementById('payment-date');
    const lessonDate = document.getElementById('lesson-date');
    const paymentYear = document.getElementById('payment-year');

    if (paymentDate) paymentDate.value = today;
    if (lessonDate) lessonDate.value = today;
    if (paymentYear) paymentYear.value = new Date().getFullYear();
}

// ============================================================================
// Data Loading
// ============================================================================

async function loadAllData() {
    showLoading(true);
    try {
        await Promise.all([
            loadClients(),
            loadPayments(),
            loadLessons()
        ]);
        calculateClientSummaries();
        populateClientDropdowns();
        populateTeacherFilter();
        showSuccess('Data loaded successfully');
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function loadClients() {
    const { data, error } = await supabaseClient
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });

    if (error) throw error;
    clients = data || [];
    renderClients();
}

async function loadPayments() {
    const { data, error } = await supabaseClient
        .from('payments')
        .select('*, clients(uid, full_name)')
        .order('payment_date', { ascending: false });

    if (error) throw error;
    payments = data || [];
    renderPayments();
    updatePaymentSummary();
}

async function loadLessons() {
    const { data, error } = await supabaseClient
        .from('lessons')
        .select('*, clients(uid, full_name)')
        .order('lesson_date', { ascending: false });

    if (error) throw error;
    lessons = data || [];
    renderLessons();
    updateLessonSummary();
}

// ============================================================================
// Calculate Client Summaries (Hours Balance)
// ============================================================================

function calculateClientSummaries() {
    clientSummaries = {};

    clients.forEach(client => {
        const clientPayments = payments.filter(p => p.client_id === client.id);
        const clientLessons = lessons.filter(l => l.client_id === client.id);

        const totalPurchased = clientPayments.reduce((sum, p) =>
            sum + (parseFloat(p.hours_purchased) || 0), 0);
        const totalUsed = clientLessons.reduce((sum, l) =>
            sum + (parseFloat(l.hours_taught) || 0), 0);
        const lastLesson = clientLessons.length > 0 ?
            clientLessons[0].lesson_date : null;

        clientSummaries[client.id] = {
            totalPurchased,
            totalUsed,
            remaining: totalPurchased - totalUsed,
            lastLesson,
            paymentCount: clientPayments.length,
            lessonCount: clientLessons.length
        };
    });
}

// ============================================================================
// Client Management
// ============================================================================

function renderClients() {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No clients found. Add your first client!</td></tr>';
        return;
    }

    tbody.innerHTML = clients.map(client => {
        const summary = clientSummaries[client.id] || {
            totalPurchased: 0, totalUsed: 0, remaining: 0, lastLesson: null
        };

        const remainingClass = summary.remaining < 0 ? 'text-error' :
                              summary.remaining > 0 ? 'text-success' : '';

        return `
            <tr>
                <td><strong>${escapeHtml(client.uid)}</strong></td>
                <td>${escapeHtml(client.full_name)}</td>
                <td><span class="status-badge status-${client.status}">${client.status}</span></td>
                <td>${summary.totalPurchased.toFixed(1)}h</td>
                <td>${summary.totalUsed.toFixed(1)}h</td>
                <td class="${remainingClass}"><strong>${summary.remaining.toFixed(1)}h</strong></td>
                <td>${formatDate(summary.lastLesson)}</td>
                <td>${escapeHtml(client.teacher || '-')}</td>
                <td>
                    <button class="btn-icon" onclick="editClient(${client.id})" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteClient(${client.id})" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddClientForm() {
    document.getElementById('client-form').classList.remove('hidden');
    document.getElementById('client-form-title').textContent = 'Add New Client';
    document.getElementById('client-form-element').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('client-teacher').value = 'Rahul';
    currentClientId = null;
}

function hideClientForm() {
    document.getElementById('client-form').classList.add('hidden');
    document.getElementById('client-form-element').reset();
    currentClientId = null;
}

async function saveClient(event) {
    event.preventDefault();
    showLoading(true);

    const clientData = {
        uid: document.getElementById('client-uid').value.toUpperCase(),
        full_name: document.getElementById('client-full-name').value,
        email: document.getElementById('client-email').value || null,
        telephone: document.getElementById('client-telephone').value || null,
        status: document.getElementById('client-status').value,
        teacher: document.getElementById('client-teacher').value || null,
        lead_source: document.getElementById('client-lead-source').value || null,
        notes: document.getElementById('client-notes').value || null
    };

    try {
        if (currentClientId) {
            // Update existing client
            const { error } = await supabaseClient
                .from('clients')
                .update(clientData)
                .eq('id', currentClientId);
            if (error) throw error;
            showSuccess('Client updated successfully');
        } else {
            // Insert new client
            const { error } = await supabaseClient
                .from('clients')
                .insert([clientData]);
            if (error) throw error;
            showSuccess('Client added successfully');
        }

        hideClientForm();
        await loadAllData();
    } catch (error) {
        showError('Failed to save client: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentClientId = clientId;
    document.getElementById('client-form-title').textContent = 'Edit Client';
    document.getElementById('client-id').value = clientId;
    document.getElementById('client-uid').value = client.uid;
    document.getElementById('client-full-name').value = client.full_name;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-telephone').value = client.telephone || '';
    document.getElementById('client-status').value = client.status;
    document.getElementById('client-teacher').value = client.teacher || '';
    document.getElementById('client-lead-source').value = client.lead_source || '';
    document.getElementById('client-notes').value = client.notes || '';
    document.getElementById('client-form').classList.remove('hidden');
}

async function deleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const summary = clientSummaries[clientId] || {};
    const message = `Delete "${client.full_name}" (${client.uid})?\n\nThis will also delete:\n- ${summary.paymentCount || 0} payment(s)\n- ${summary.lessonCount || 0} lesson(s)`;

    if (!confirm(message)) return;

    showLoading(true);
    try {
        const { error } = await supabaseClient
            .from('clients')
            .delete()
            .eq('id', clientId);

        if (error) throw error;
        showSuccess('Client deleted successfully');
        await loadAllData();
    } catch (error) {
        showError('Failed to delete client: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function filterClients() {
    const searchTerm = document.getElementById('client-search').value.toLowerCase();
    const statusFilter = document.getElementById('client-status-filter').value;
    const teacherFilter = document.getElementById('client-teacher-filter').value;

    const filtered = clients.filter(client => {
        const matchesSearch = !searchTerm ||
            client.full_name.toLowerCase().includes(searchTerm) ||
            client.uid.toLowerCase().includes(searchTerm) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.telephone && client.telephone.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || client.status === statusFilter;
        const matchesTeacher = !teacherFilter || client.teacher === teacherFilter;

        return matchesSearch && matchesStatus && matchesTeacher;
    });

    const originalClients = clients;
    clients = filtered;
    renderClients();
    clients = originalClients;
}

// ============================================================================
// Payment Management
// ============================================================================

function renderPayments() {
    const tbody = document.getElementById('payments-tbody');
    if (!tbody) return;

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No payments recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${formatDate(payment.payment_date)}</td>
            <td>${escapeHtml(payment.clients?.full_name || 'Unknown')} (${escapeHtml(payment.clients?.uid || '')})</td>
            <td>${escapeHtml(payment.package_type || '-')}</td>
            <td><strong>${parseFloat(payment.hours_purchased || 0).toFixed(1)}h</strong></td>
            <td>${payment.amount_paid ? '$' + parseFloat(payment.amount_paid).toFixed(2) : '-'}</td>
            <td>${payment.hst_amount ? '$' + parseFloat(payment.hst_amount).toFixed(2) : '-'}</td>
            <td><strong>${payment.total_payment ? '$' + parseFloat(payment.total_payment).toFixed(2) : '-'}</strong></td>
            <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
            <td>
                <button class="btn-icon" onclick="deletePayment(${payment.id})" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showAddPaymentForm() {
    document.getElementById('payment-form').classList.remove('hidden');
    document.getElementById('payment-form-element').reset();
    setTodayAsDefault();
}

function hidePaymentForm() {
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('payment-form-element').reset();
}

function calculateTax() {
    const applyTax = document.getElementById('payment-apply-tax').checked;
    const amountPaid = parseFloat(document.getElementById('payment-amount-paid').value) || 0;

    if (applyTax && amountPaid > 0) {
        const hst = amountPaid * 0.13;
        document.getElementById('payment-hst-amount').value = hst.toFixed(2);
        document.getElementById('payment-total').value = (amountPaid + hst).toFixed(2);
    } else {
        document.getElementById('payment-hst-amount').value = '0.00';
        document.getElementById('payment-total').value = amountPaid.toFixed(2);
    }
}

// Auto-calculate total when amount changes
document.addEventListener('DOMContentLoaded', () => {
    const amountPaidInput = document.getElementById('payment-amount-paid');
    if (amountPaidInput) {
        amountPaidInput.addEventListener('input', calculateTax);
    }
});

async function savePayment(event) {
    event.preventDefault();
    showLoading(true);

    const paymentData = {
        client_id: parseInt(document.getElementById('payment-client').value),
        payment_date: document.getElementById('payment-date').value,
        package_type: document.getElementById('payment-package-type').value || null,
        hours_purchased: parseFloat(document.getElementById('payment-hours-purchased').value),
        amount_paid: parseFloat(document.getElementById('payment-amount-paid').value) || null,
        hourly_rate: parseFloat(document.getElementById('payment-hourly-rate').value) || null,
        apply_tax: document.getElementById('payment-apply-tax').checked,
        hst_amount: parseFloat(document.getElementById('payment-hst-amount').value) || 0,
        total_payment: parseFloat(document.getElementById('payment-total').value) || null,
        status: document.getElementById('payment-status').value,
        payment_method: document.getElementById('payment-method').value || null,
        year: parseInt(document.getElementById('payment-year').value),
        notes: document.getElementById('payment-notes').value || null
    };

    try {
        const { error } = await supabaseClient
            .from('payments')
            .insert([paymentData]);

        if (error) throw error;
        showSuccess('Payment added successfully');
        hidePaymentForm();
        await loadAllData();
    } catch (error) {
        showError('Failed to save payment: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function deletePayment(paymentId) {
    if (!confirm('Delete this payment?')) return;

    showLoading(true);
    try {
        const { error } = await supabaseClient
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;
        showSuccess('Payment deleted successfully');
        await loadAllData();
    } catch (error) {
        showError('Failed to delete payment: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function updatePaymentSummary() {
    const totalRevenue = payments.reduce((sum, p) =>
        sum + (parseFloat(p.total_payment) || 0), 0);
    const totalHours = payments.reduce((sum, p) =>
        sum + (parseFloat(p.hours_purchased) || 0), 0);
    const outstanding = payments
        .filter(p => p.status === 'owing')
        .reduce((sum, p) => sum + (parseFloat(p.total_payment) || 0), 0);

    document.getElementById('payment-total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('payment-total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('payment-outstanding').textContent = `$${outstanding.toFixed(2)}`;
}

// ============================================================================
// Lesson Management
// ============================================================================

function renderLessons() {
    const tbody = document.getElementById('lessons-tbody');
    if (!tbody) return;

    if (lessons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No lessons recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = lessons.map(lesson => `
        <tr>
            <td>${formatDate(lesson.lesson_date)}</td>
            <td>${escapeHtml(lesson.clients?.full_name || 'Unknown')} (${escapeHtml(lesson.clients?.uid || '')})</td>
            <td><strong>${parseFloat(lesson.hours_taught).toFixed(1)}h</strong></td>
            <td>${escapeHtml(lesson.lesson_topic)}</td>
            <td>${escapeHtml(lesson.teacher)}</td>
            <td>${escapeHtml(lesson.paid_or_probono || 'paid')}</td>
            <td>${formatDate(lesson.paid_teacher)}</td>
            <td>
                <button class="btn-icon" onclick="deleteLesson(${lesson.id})" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showAddLessonForm() {
    document.getElementById('lesson-form').classList.remove('hidden');
    document.getElementById('lesson-form-element').reset();
    setTodayAsDefault();
    document.getElementById('lesson-teacher').value = 'Rahul';
}

function hideLessonForm() {
    document.getElementById('lesson-form').classList.add('hidden');
    document.getElementById('lesson-form-element').reset();
}

async function saveLesson(event) {
    event.preventDefault();
    showLoading(true);

    const lessonData = {
        client_id: parseInt(document.getElementById('lesson-client').value),
        lesson_date: document.getElementById('lesson-date').value,
        hours_taught: parseFloat(document.getElementById('lesson-hours-taught').value),
        teacher: document.getElementById('lesson-teacher').value,
        lesson_topic: document.getElementById('lesson-topic').value,
        paid_or_probono: document.getElementById('lesson-paid-or-probono').value,
        paid_teacher: document.getElementById('lesson-paid-teacher').value || null,
        notes: document.getElementById('lesson-notes').value || null
    };

    try {
        const { error } = await supabaseClient
            .from('lessons')
            .insert([lessonData]);

        if (error) throw error;
        showSuccess('Lesson added successfully');
        hideLessonForm();
        await loadAllData();
    } catch (error) {
        showError('Failed to save lesson: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function deleteLesson(lessonId) {
    if (!confirm('Delete this lesson?')) return;

    showLoading(true);
    try {
        const { error } = await supabaseClient
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (error) throw error;
        showSuccess('Lesson deleted successfully');
        await loadAllData();
    } catch (error) {
        showError('Failed to delete lesson: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function updateLessonSummary() {
    const totalHours = lessons.reduce((sum, l) =>
        sum + (parseFloat(l.hours_taught) || 0), 0);

    document.getElementById('lesson-count').textContent = lessons.length;
    document.getElementById('lesson-total-hours').textContent = totalHours.toFixed(1);
}

// ============================================================================
// Reports & Analytics
// ============================================================================

function updateReports() {
    // Overall stats
    const activeClients = clients.filter(c => c.status === 'active').length;
    const totalPurchased = Object.values(clientSummaries).reduce((sum, s) => sum + s.totalPurchased, 0);
    const totalUsed = Object.values(clientSummaries).reduce((sum, s) => sum + s.totalUsed, 0);
    const totalRemaining = totalPurchased - totalUsed;

    document.getElementById('report-active-clients').textContent = activeClients;
    document.getElementById('report-hours-purchased').textContent = totalPurchased.toFixed(1);
    document.getElementById('report-hours-used').textContent = totalUsed.toFixed(1);
    document.getElementById('report-hours-remaining').textContent = totalRemaining.toFixed(1);

    // Clients with hours remaining
    renderHoursReport();
    renderPackagesReport();
    renderLessonHeatmap(3); // Default to 3 months
}

function renderHoursReport() {
    const tbody = document.getElementById('report-hours-tbody');
    if (!tbody) return;

    const clientsWithHours = clients
        .map(c => ({
            ...c,
            ...clientSummaries[c.id]
        }))
        .filter(c => c.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining);

    if (clientsWithHours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No clients with hours remaining</td></tr>';
        return;
    }

    tbody.innerHTML = clientsWithHours.map(client => `
        <tr>
            <td><strong>${escapeHtml(client.uid)}</strong></td>
            <td>${escapeHtml(client.full_name)}</td>
            <td>${client.totalPurchased.toFixed(1)}h</td>
            <td>${client.totalUsed.toFixed(1)}h</td>
            <td class="text-success"><strong>${client.remaining.toFixed(1)}h</strong></td>
            <td>${formatDate(client.lastLesson)}</td>
        </tr>
    `).join('');
}

function renderPackagesReport() {
    const tbody = document.getElementById('report-packages-tbody');
    if (!tbody) return;

    // Group payments by package type
    const packageStats = {};
    payments.forEach(p => {
        const pkg = p.package_type || 'Unspecified';
        if (!packageStats[pkg]) {
            packageStats[pkg] = { count: 0, hours: 0, revenue: 0 };
        }
        packageStats[pkg].count++;
        packageStats[pkg].hours += parseFloat(p.hours_purchased) || 0;
        packageStats[pkg].revenue += parseFloat(p.total_payment) || 0;
    });

    const packages = Object.entries(packageStats)
        .sort((a, b) => b[1].revenue - a[1].revenue);

    if (packages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No payment data available</td></tr>';
        return;
    }

    tbody.innerHTML = packages.map(([pkg, stats]) => `
        <tr>
            <td><strong>${escapeHtml(pkg)}</strong></td>
            <td>${stats.count}</td>
            <td>${stats.hours.toFixed(1)}h</td>
            <td><strong>$${stats.revenue.toFixed(2)}</strong></td>
        </tr>
    `).join('');
}

// ============================================================================
// Lesson Activity Heatmap
// ============================================================================

let currentHeatmapMonths = 3;

// Setup heatmap range button listeners
document.addEventListener('DOMContentLoaded', () => {
    const rangeButtons = document.querySelectorAll('.heatmap-range-btn');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const months = parseInt(btn.dataset.months);
            currentHeatmapMonths = months;

            // Update active button
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render heatmap
            renderLessonHeatmap(months);
        });
    });
});

function renderLessonHeatmap(months = 3) {
    const container = document.getElementById('lesson-heatmap');
    if (!container) return;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Aggregate lessons by date
    const lessonsByDate = {};
    lessons.forEach(lesson => {
        const date = lesson.lesson_date.split('T')[0]; // YYYY-MM-DD format
        lessonsByDate[date] = (lessonsByDate[date] || 0) + 1;
    });

    // Generate heatmap grid
    const heatmapData = generateHeatmapData(startDate, endDate, lessonsByDate);

    // Render HTML
    container.innerHTML = renderHeatmapHTML(heatmapData, lessonsByDate);

    // Add hover tooltips
    addHeatmapTooltips();
}

function generateHeatmapData(startDate, endDate, lessonsByDate) {
    const data = [];
    let currentDate = new Date(startDate);

    // Move to the start of the week (Sunday)
    const dayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - dayOfWeek);

    while (currentDate <= endDate) {
        const week = [];

        // Generate 7 days for the week
        for (let i = 0; i < 7; i++) {
            const dateStr = formatDateString(currentDate);
            const count = lessonsByDate[dateStr] || 0;
            const level = getActivityLevel(count);

            week.push({
                date: new Date(currentDate),
                dateStr,
                count,
                level,
                isInRange: currentDate >= startDate && currentDate <= endDate
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        data.push(week);
    }

    return data;
}

function renderHeatmapHTML(heatmapData, lessonsByDate) {
    // Group by month for labeling
    const monthGroups = {};
    heatmapData.forEach((week, weekIndex) => {
        const monthKey = `${week[0].date.getFullYear()}-${week[0].date.getMonth()}`;
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = [];
        }
        monthGroups[monthKey].push({ week, weekIndex });
    });

    let html = '';

    // Render weeks
    heatmapData.forEach((week, weekIndex) => {
        html += '<div class="heatmap-week">';
        week.forEach(day => {
            if (day.isInRange) {
                html += `<div class="heatmap-cell"
                    data-level="${day.level}"
                    data-date="${day.dateStr}"
                    data-count="${day.count}"
                    title="${formatDateDisplay(day.date)}: ${day.count} lesson${day.count !== 1 ? 's' : ''}"></div>`;
            } else {
                html += '<div class="heatmap-cell" data-level="0" style="opacity: 0.3;"></div>';
            }
        });
        html += '</div>';
    });

    return html;
}

function getActivityLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4; // 4+ lessons
}

function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function addHeatmapTooltips() {
    const cells = document.querySelectorAll('.heatmap-cell[data-date]');
    let tooltip = document.querySelector('.heatmap-tooltip');

    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        document.body.appendChild(tooltip);
    }

    cells.forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            const date = cell.dataset.date;
            const count = cell.dataset.count;
            const dateObj = new Date(date + 'T00:00:00');

            tooltip.textContent = `${formatDateDisplay(dateObj)}: ${count} lesson${count !== '1' ? 's' : ''}`;
            tooltip.classList.add('show');

            const rect = cell.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + window.scrollY + 'px';
        });

        cell.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

function populateClientDropdowns() {
    const dropdowns = [
        'payment-client',
        'lesson-client'
    ];

    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Select a client...</option>';

        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.full_name} (${client.uid})`;
            select.appendChild(option);
        });

        if (currentValue) select.value = currentValue;
    });
}

function populateTeacherFilter() {
    const select = document.getElementById('client-teacher-filter');
    if (!select) return;

    const teachers = [...new Set(clients.map(c => c.teacher).filter(t => t))];
    select.innerHTML = '<option value="">All Teachers</option>';

    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher;
        option.textContent = teacher;
        select.appendChild(option);
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => successDiv.classList.add('hidden'), 3000);
}
