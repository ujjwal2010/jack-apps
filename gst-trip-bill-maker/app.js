// State
let items = [];
let savedInvoices = [];
let companySettings = {
    name: 'Honeymoon Trip Planner',
    address: '',
    gstin: ''
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadInvoices();
    setupTabs();
    initNewInvoice();
    updateBusinessNameDisplay();

    // Event Listeners for invoice form
    document.getElementById('add-item-btn').addEventListener('click', addItemRow);
    document.getElementById('gst-type').addEventListener('change', calculateTotals);
    document.getElementById('gst-rate').addEventListener('change', calculateTotals);
    document.getElementById('save-invoice-btn').addEventListener('click', saveInvoice);

    // Preview & Print listeners
    document.getElementById('preview-btn').addEventListener('click', () => previewInvoice());
    document.getElementById('back-to-edit-btn').addEventListener('click', () => {
        document.getElementById('invoice-preview').classList.add('hidden');
        document.getElementById('new-invoice').classList.remove('hidden');
    });
    document.getElementById('print-btn').addEventListener('click', () => window.print());

    // Settings listeners
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.getElementById('backup-btn').addEventListener('click', exportBackup);
    document.getElementById('restore-file').addEventListener('change', importBackup);
});

// Number to Words Converter
function numberToWords(num) {
    if (num === 0) return 'Zero Rupees Only';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;

    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim() + ' Rupees Only';
}

// Dynamic Items Logic
function addItemRow() {
    const item = { id: Date.now(), desc: '', rate: 0, qty: 1, amount: 0 };
    items.push(item);
    renderItems();
}

function removeItemRow(id) {
    if (items.length <= 1) return; // Keep at least one row
    items = items.filter(item => item.id !== id);
    renderItems();
    calculateTotals();
}

function updateItem(id, field, value) {
    const item = items.find(i => i.id === id);
    if (item) {
        if (field === 'rate' || field === 'qty') {
            item[field] = parseFloat(value) || 0;
            if (item[field] < 0) item[field] = 0;
            item.amount = item.rate * item.qty;
        } else {
            item[field] = value;
        }

        // Update amount display in row
        const amountEl = document.querySelector(`.item-row[data-id="${id}"] .item-amount`);
        if (amountEl) {
            amountEl.textContent = `₹ ${item.amount.toFixed(2)}`;
        }

        calculateTotals();
    }
}

function renderItems() {
    const tbody = document.getElementById('items-body');
    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'item-row';
        tr.dataset.id = item.id;

        tr.innerHTML = `
            <td><input type="text" class="item-desc" placeholder="Package/Add-on name" value="${item.desc}" onchange="updateItem(${item.id}, 'desc', this.value)"></td>
            <td><input type="number" min="0" step="0.01" placeholder="0.00" value="${item.rate || ''}" oninput="updateItem(${item.id}, 'rate', this.value)"></td>
            <td><input type="number" min="1" step="1" placeholder="1" value="${item.qty}" oninput="updateItem(${item.id}, 'qty', this.value)"></td>
            <td class="item-amount">₹ ${item.amount.toFixed(2)}</td>
            <td><button type="button" class="btn danger btn-small" onclick="removeItemRow(${item.id})">❌</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Calculation Logic
function calculateTotals() {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstType = document.getElementById('gst-type').value;
    const gstRate = parseFloat(document.getElementById('gst-rate').value) || 0;

    let cgst = 0, sgst = 0, igst = 0;

    if (gstType === 'cgst-sgst') {
        cgst = subtotal * (gstRate / 2) / 100;
        sgst = subtotal * (gstRate / 2) / 100;
        document.getElementById('cgst-row').classList.remove('hidden');
        document.getElementById('sgst-row').classList.remove('hidden');
        document.getElementById('igst-row').classList.add('hidden');
    } else {
        igst = subtotal * (gstRate / 100);
        document.getElementById('cgst-row').classList.add('hidden');
        document.getElementById('sgst-row').classList.add('hidden');
        document.getElementById('igst-row').classList.remove('hidden');
    }

    const total = subtotal + cgst + sgst + igst;

    // Update display
    document.getElementById('subtotal-display').textContent = `₹ ${subtotal.toFixed(2)}`;
    document.getElementById('cgst-display').textContent = `₹ ${cgst.toFixed(2)}`;
    document.getElementById('sgst-display').textContent = `₹ ${sgst.toFixed(2)}`;
    document.getElementById('igst-display').textContent = `₹ ${igst.toFixed(2)}`;
    document.getElementById('total-display').textContent = `₹ ${Math.round(total).toFixed(2)}`;
}

// Save Invoice Logic
function saveInvoice() {
    // Basic validation
    const clientName = document.getElementById('client-name').value.trim();
    if (!clientName) {
        alert('Please enter client name');
        return;
    }
    if (items.length === 0 || items.every(i => !i.desc && i.amount === 0)) {
        alert('Please add at least one item');
        return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstType = document.getElementById('gst-type').value;
    const gstRate = parseFloat(document.getElementById('gst-rate').value) || 0;

    let cgst = 0, sgst = 0, igst = 0;
    if (gstType === 'cgst-sgst') {
        cgst = subtotal * (gstRate / 2) / 100;
        sgst = subtotal * (gstRate / 2) / 100;
    } else {
        igst = subtotal * (gstRate / 100);
    }
    const total = Math.round(subtotal + cgst + sgst + igst);

    const invoiceData = {
        id: Date.now().toString(),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: document.getElementById('invoice-date').value,
        clientName: clientName,
        clientAddress: document.getElementById('client-address').value,
        destination: document.getElementById('destination').value,
        items: JSON.parse(JSON.stringify(items)),
        gstType: gstType,
        gstRate: gstRate,
        subtotal: subtotal,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        total: total
    };

    savedInvoices.push(invoiceData);
    localStorage.setItem('gstTripInvoices', JSON.stringify(savedInvoices));

    alert('Invoice saved successfully!');

    // Switch to saved invoices tab
    document.querySelector('[data-tab="saved-invoices"]').click();
}

function renderSavedInvoices() {
    const list = document.getElementById('saved-invoices-list');
    list.innerHTML = '';

    if (savedInvoices.length === 0) {
        list.innerHTML = '<p class="empty-state">No saved invoices yet.</p>';
        return;
    }

    // Sort descending by date
    const sorted = [...savedInvoices].sort((a, b) => b.id - a.id);

    sorted.forEach(inv => {
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.innerHTML = `
            <div class="saved-item-info">
                <strong>${inv.clientName} - ${inv.invoiceNumber}</strong>
                <span class="text-muted">Date: ${inv.date} | Total: ₹${inv.total.toFixed(2)}</span>
            </div>
            <div>
                <button type="button" class="btn primary btn-small" onclick="viewSavedInvoice('${inv.id}')">View/Print</button>
                <button type="button" class="btn danger" onclick="deleteInvoice('${inv.id}')">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        savedInvoices = savedInvoices.filter(inv => inv.id !== id);
        localStorage.setItem('gstTripInvoices', JSON.stringify(savedInvoices));
        renderSavedInvoices();
    }
}

// Preview and Print Logic
function previewInvoice(invoiceData = null) {
    let data;
    if (invoiceData) {
        data = invoiceData;
    } else {
        // Collect current form data
        const clientName = document.getElementById('client-name').value.trim() || 'Client Name';
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const gstType = document.getElementById('gst-type').value;
        const gstRate = parseFloat(document.getElementById('gst-rate').value) || 0;

        let cgst = 0, sgst = 0, igst = 0;
        if (gstType === 'cgst-sgst') {
            cgst = subtotal * (gstRate / 2) / 100;
            sgst = subtotal * (gstRate / 2) / 100;
        } else {
            igst = subtotal * (gstRate / 100);
        }

        data = {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            date: document.getElementById('invoice-date').value,
            clientName: clientName,
            clientAddress: document.getElementById('client-address').value,
            destination: document.getElementById('destination').value,
            items: items.filter(i => i.desc || i.amount > 0),
            gstType: gstType,
            gstRate: gstRate,
            subtotal: subtotal,
            cgst: cgst,
            sgst: sgst,
            igst: igst,
            total: Math.round(subtotal + cgst + sgst + igst)
        };
    }

    // Populate Print UI
    document.getElementById('print-company-name').textContent = companySettings.name;
    document.getElementById('print-company-address').textContent = companySettings.address;
    document.getElementById('print-company-gstin').textContent = companySettings.gstin;
    document.getElementById('print-sign-company').textContent = companySettings.name;

    document.getElementById('print-invoice-date').textContent = data.date;
    document.getElementById('print-invoice-number').textContent = data.invoiceNumber;
    document.getElementById('print-client-name').textContent = data.clientName;
    document.getElementById('print-client-address').textContent = data.clientAddress;
    document.getElementById('print-destination').textContent = data.destination;

    const printItemsBody = document.getElementById('print-items-body');
    printItemsBody.innerHTML = '';
    data.items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.desc}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>${item.amount.toFixed(2)}</td>
        `;
        printItemsBody.appendChild(tr);
    });

    document.getElementById('print-subtotal').textContent = `₹ ${data.subtotal.toFixed(2)}`;

    if (data.gstType === 'cgst-sgst') {
        document.getElementById('print-cgst-row').classList.remove('hidden');
        document.getElementById('print-sgst-row').classList.remove('hidden');
        document.getElementById('print-igst-row').classList.add('hidden');

        document.getElementById('print-cgst-rate').textContent = data.gstRate / 2;
        document.getElementById('print-sgst-rate').textContent = data.gstRate / 2;

        document.getElementById('print-cgst').textContent = `₹ ${data.cgst.toFixed(2)}`;
        document.getElementById('print-sgst').textContent = `₹ ${data.sgst.toFixed(2)}`;
    } else {
        document.getElementById('print-cgst-row').classList.add('hidden');
        document.getElementById('print-sgst-row').classList.add('hidden');
        document.getElementById('print-igst-row').classList.remove('hidden');

        document.getElementById('print-igst-rate').textContent = data.gstRate;
        document.getElementById('print-igst').textContent = `₹ ${data.igst.toFixed(2)}`;
    }

    document.getElementById('print-total').textContent = `₹ ${data.total.toFixed(2)}`;
    document.getElementById('print-amount-words').textContent = numberToWords(data.total);

    // Show Preview Section
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('invoice-preview').classList.remove('hidden');
}

function viewSavedInvoice(id) {
    const inv = savedInvoices.find(i => i.id === id);
    if (inv) {
        previewInvoice(inv);
        // Switch context so back button takes us to saved invoices
        document.getElementById('back-to-edit-btn').onclick = () => {
            document.getElementById('invoice-preview').classList.add('hidden');
            document.querySelector('[data-tab="saved-invoices"]').click();
        };
    }
}

// Settings and Backup Logic
function loadSettings() {
    const settings = localStorage.getItem('gstTripSettings');
    if (settings) {
        companySettings = JSON.parse(settings);
    }
    // Populate settings form
    document.getElementById('company-name').value = companySettings.name;
    document.getElementById('company-address').value = companySettings.address;
    document.getElementById('company-gstin').value = companySettings.gstin;
}

function loadInvoices() {
    const invoices = localStorage.getItem('gstTripInvoices');
    if (invoices) {
        savedInvoices = JSON.parse(invoices);
    }
}

function updateBusinessNameDisplay() {
    document.getElementById('display-business-name').textContent = companySettings.name;
}

function saveSettings(e) {
    e.preventDefault();
    companySettings.name = document.getElementById('company-name').value;
    companySettings.address = document.getElementById('company-address').value;
    companySettings.gstin = document.getElementById('company-gstin').value;

    localStorage.setItem('gstTripSettings', JSON.stringify(companySettings));
    updateBusinessNameDisplay();
    alert('Settings saved successfully!');
}

function exportBackup() {
    const backupData = {
        settings: companySettings,
        invoices: savedInvoices
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gst_trip_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.settings) {
                companySettings = data.settings;
                localStorage.setItem('gstTripSettings', JSON.stringify(companySettings));
                loadSettings();
                updateBusinessNameDisplay();
            }
            if (data.invoices && Array.isArray(data.invoices)) {
                savedInvoices = data.invoices;
                localStorage.setItem('gstTripInvoices', JSON.stringify(savedInvoices));
            }
            alert('Backup restored successfully!');
            e.target.value = ''; // reset input
        } catch (error) {
            alert('Invalid backup file. Restoration failed.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Hide preview if switching tabs
            document.getElementById('invoice-preview').classList.add('hidden');

            if (targetId === 'saved-invoices') {
                renderSavedInvoices();
            }
        });
    });
}

function initNewInvoice() {
    // Set today's date as default
    document.getElementById('invoice-date').valueAsDate = new Date();
    // Start with one empty item
    items = [];
    addItemRow();
}
