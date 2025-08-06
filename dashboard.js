// File: dashboard.js (SALIN DAN GANTI KODE LAMA)

// =======================================================
// === Gabungan dan Perbaikan Seluruh Kode JavaScript ===
// =======================================================

// Fungsi untuk FAQ di index.html
function toggleFaq(element) {
    element.classList.toggle('active');
}

// Fungsi untuk dashboard.html
async function fetchIpAddress() {
    const ipElement = document.getElementById('ip-address-value');
    if (!ipElement) return;
    
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipElement.textContent = data.ip;
    } catch (error) {
        console.error('Gagal mengambil IP Address:', error);
        ipElement.textContent = 'Gagal memuat IP';
    }
}

function updateTime() {
    const timeElement = document.getElementById('time-value');
    if (!timeElement) return;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        body.classList.add('no-scroll');
    } else {
        body.classList.remove('no-scroll');
    }
}

function toggleSubmenu(item) {
    item.classList.toggle('open');
    const submenu = item.querySelector('.submenu');
    if (item.classList.contains('open')) {
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
    } else {
        submenu.style.maxHeight = '0';
    }
}

function showPage(pageId, link) {
    showLoader();

    setTimeout(() => {
        const allContent = document.querySelectorAll('.content-view');
        allContent.forEach(content => {
            content.style.display = 'none';
        });

        const selectedContent = document.getElementById(pageId);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }

        const allLinks = document.querySelectorAll('.sidebar-menu li');
        allLinks.forEach(item => {
            item.classList.remove('active');
        });
        if (link) {
            link.parentNode.classList.add('active');
        }

        if (pageId === 'inbox-view') {
            loadInboxSubmissions();
        }

        if (window.innerWidth <= 768) {
            toggleMenu();
        }
        
        hideLoader();
    }, 100);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('no-scroll');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
             document.body.classList.remove('no-scroll');
        }, 300);
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// --- FUNGSI INBOX BARU ---
async function loadInboxSubmissions() {
    const tableBody = document.getElementById('inbox-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="4">Memuat data...</td></tr>';

    try {
        const response = await fetch('/api/inbox');
        const data = await response.json();
        
        tableBody.innerHTML = '';
        if (data.success && data.data.length > 0) {
            data.data.forEach(submission => {
                const row = document.createElement('tr');
                const timestamp = new Date(submission.createdAt).toLocaleString();
                row.innerHTML = `
                    <td><strong>${submission.title}</strong></td>
                    <td>${submission.message}</td>
                    <td>${timestamp}</td>
                    <td>
                        <button class="delete-btn" data-id="${submission._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">Tidak ada pemberitahuan.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Gagal memuat data inbox.</td></tr>';
    }
    
    tableBody.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.currentTarget.dataset.id;
            if (confirm('Apakah Anda yakin ingin menghapus pemberitahuan ini?')) {
                deleteInboxItem(id);
            }
        });
    });
}

async function deleteInboxItem(id) {
    try {
        const response = await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        if (data.success) {
            alert('Pemberitahuan berhasil dihapus!');
            loadInboxSubmissions();
        } else {
            alert('Gagal menghapus pemberitahuan: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}
// END FUNGSI INBOX

// Fungsi untuk menampilkan loading screen
function showLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        loaderWrapper.classList.remove('hidden');
    }
}

// Fungsi untuk menyembunyikan loading screen
function hideLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        loaderWrapper.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-view')) {
        fetchIpAddress();
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    const partnerOwnerLink = document.getElementById('open-partner-modal');
    if (partnerOwnerLink) {
        partnerOwnerLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            openModal('partner-owner-modal');
        });
    }

    hideLoader(); 
});
