// File: dashboard.js (SALIN DAN GANTI KODE LAMA)

// =======================================================
// === Gabungan dan Perbaikan Seluruh Kode JavaScript ===
// =======================================================

// LOGIKA BARU: KUNCI API UNTUK HAPUS PERMANEN
// Ganti dengan kunci yang kamu set di Vercel
const HARD_DELETE_API_KEY = 'DitzKun';

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
    const inboxContainer = document.getElementById('inbox-messages');
    if (!inboxContainer) return;
    
    inboxContainer.innerHTML = '<p style="text-align: center; color: #888;">Memuat pesan...</p>';

    try {
        const response = await fetch('/api/inbox');
        const data = await response.json();
        
        inboxContainer.innerHTML = '';
        if (data.success && data.data.length > 0) {
            data.data.forEach(submission => {
                const messageItem = document.createElement('div');
                messageItem.classList.add('inbox-message-item');
                messageItem.dataset.title = submission.title;
                messageItem.dataset.message = submission.message;

                const timestamp = new Date(submission.createdAt).toLocaleString();
                
                messageItem.innerHTML = `
                    <h4>${submission.title}</h4>
                    <p>${submission.message}</p>
                    <div class="message-meta">
                        <span>${timestamp}</span>
                        <div class="delete-actions">
                            <button class="soft-delete-btn" data-id="${submission._id}">
                                <i class="fas fa-eye-slash"></i> Sembunyikan
                            </button>
                            <button class="hard-delete-btn" data-id="${submission._id}">
                                <i class="fas fa-trash"></i> Hapus Permanen
                            </button>
                        </div>
                    </div>
                `;
                inboxContainer.appendChild(messageItem);
            });

            // Tambahkan event listener ke setiap item pesan untuk modal
            inboxContainer.querySelectorAll('.inbox-message-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    // Hanya buka modal jika tidak mengklik tombol hapus
                    if (!e.target.closest('.delete-actions')) {
                        const title = item.dataset.title;
                        const message = item.dataset.message;
                        openMessageModal(title, message);
                    }
                });
            });

            // Tambahkan event listener untuk tombol soft delete
            inboxContainer.querySelectorAll('.soft-delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const id = event.currentTarget.dataset.id;
                    if (confirm('Apakah Anda yakin ingin menyembunyikan pemberitahuan ini?')) {
                        softDeleteInboxItem(id);
                    }
                });
            });

            // Tambahkan event listener untuk tombol hard delete
            inboxContainer.querySelectorAll('.hard-delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const id = event.currentTarget.dataset.id;
                    if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus pemberitahuan ini secara PERMANEN?')) {
                        hardDeleteInboxItem(id);
                    }
                });
            });

        } else {
            inboxContainer.innerHTML = '<p style="text-align: center; color: #888;">Tidak ada pemberitahuan.</p>';
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        inboxContainer.innerHTML = '<p style="text-align: center; color: #888;">Gagal memuat data inbox.</p>';
    }
}

// Fungsi untuk Soft Delete (menyembunyikan)
async function softDeleteInboxItem(id) {
    try {
        const response = await fetch('/api/delete', { // Endpoint ini melakukan update
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        if (data.success) {
            alert('Pemberitahuan berhasil disembunyikan!');
            loadInboxSubmissions();
        } else {
            alert('Gagal menyembunyikan pemberitahuan: ' + data.message);
        }
    } catch (error) {
        console.error('Error soft-deleting item:', error);
        alert('Terjadi kesalahan saat menyembunyikan data.');
    }
}

// Fungsi untuk Hard Delete (menghapus permanen)
async function hardDeleteInboxItem(id) {
    try {
        const response = await fetch('/api/hard-delete', { // Endpoint baru untuk menghapus permanen
            method: 'POST',
            // LOGIKA BARU: MENAMBAHKAN KUNCI API DI HEADER
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': HARD_DELETE_API_KEY
            },
            // AKHIR LOGIKA BARU
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        if (data.success) {
            alert('Pemberitahuan berhasil dihapus secara permanen!');
            loadInboxSubmissions();
        } else {
            // Menambahkan penanganan error untuk Unauthorized
            if (response.status === 401) {
                 alert('Error: Anda tidak memiliki izin untuk menghapus permanen. Kunci API tidak valid.');
            } else {
                 alert('Gagal menghapus permanen: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Error hard-deleting item:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}


// Fungsi baru untuk membuka modal pesan
function openMessageModal(title, message) {
    document.getElementById('modal-message-title').textContent = title;
    document.getElementById('modal-message-text').textContent = message;
    openModal('message-detail-modal');
}


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
