// =======================================================
// === Gabungan dan Perbaikan Seluruh Kode JavaScript ===
// =======================================================

// Data pesan inbox lokal sebagai ganti database
let localInboxData = [];
const INBOX_STORAGE_KEY = 'dashboard_inbox_messages';

let notificationTimeout;

// FUNGSI UNTUK MENYIMPAN INBOX KE LOCALSTORAGE
function saveInboxToLocalStorage() {
    try {
        localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(localInboxData));
    } catch (error) {
        console.error('Gagal menyimpan inbox ke localStorage:', error);
    }
}

// FUNGSI UNTUK MEMUAT INBOX DARI LOCALSTORAGE
function loadInboxFromLocalStorage() {
    try {
        const storedData = localStorage.getItem(INBOX_STORAGE_KEY);
        if (storedData) {
            localInboxData = JSON.parse(storedData);
        } else {
            localInboxData = [];
        }

        if (localInboxData.length === 0) {
            console.log("Inbox kosong, menambahkan pesan default...");
            addDefaultMessages();
        }

    } catch (error) {
        console.error('Gagal memuat inbox dari localStorage:', error);
        localInboxData = [];
    }
}

// FUNGSI UNTUK MENAMBAHKAN SEMUA PESAN DEFAULT
function addDefaultMessages() {
    // --- KODE PERBAIKAN DI SINI ---
    // Gunakan fungsi addNewMessage() untuk memicu notifikasi
    addNewMessage('Selamat Datang di Dashboard!', 'Halo, ini adalah pesan pertama di inbox Anda. Silakan jelajahi fitur-fitur yang ada.');
    addNewMessage('Pembaruan: Tampilan Inbox', 'Kami telah memperbarui tampilan inbox agar lebih modern, menarik, dan mudah digunakan.');
    addNewMessage('Pemberitahuan: Maintenance Server', 'Server akan ditutup pada hari Jumat untuk pemeliharaan rutin. Mohon maaf atas ketidaknyamanan ini.');
    // --- AKHIR KODE PERBAIKAN ---
}

function toggleFaq(element) {
    element.classList.toggle('active');
}

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

// FUNGSI UNTUK MEMUNCULKAN DAN MENYEMBUNYIKAN SIDEBAR
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

function showNewMessageNotification() {
    const notification = document.getElementById('inbox-notification');
    if (notification) {
        clearTimeout(notificationTimeout);
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.add('animate');
        }, 100);
        
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('animate');
        }, 5000);
    }
}

function addNewMessage(title, message) {
    const newId = (localInboxData.length + 1).toString();
    const newMessage = {
        _id: newId,
        title: title,
        message: message,
        createdAt: new Date().toISOString()
    };
    
    localInboxData.push(newMessage);
    showNewMessageNotification();
    saveInboxToLocalStorage();
    
    if (document.getElementById('inbox-view').style.display === 'block') {
        loadInboxSubmissions();
    }
}

function loadInboxSubmissions() {
    const inboxContainer = document.getElementById('inbox-messages');
    if (!inboxContainer) return;

    inboxContainer.innerHTML = '';
    
    if (localInboxData.length > 0) {
        localInboxData.forEach(submission => {
            const messageItem = document.createElement('div');
            messageItem.classList.add('inbox-message-item');
            messageItem.dataset.id = submission._id;

            const timestamp = new Date(submission.createdAt).toLocaleString();

            messageItem.innerHTML = `
                <div class="message-content">
                    <h4>${submission.title}</h4>
                    <p>${submission.message}</p>
                    <div class="message-meta">
                        <span>${timestamp}</span>
                    </div>
                </div>
                <div class="message-actions">
                    <button class="delete-btn" data-id="${submission._id}">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                </div>
            `;
            inboxContainer.appendChild(messageItem);
        });

        inboxContainer.querySelectorAll('.message-content').forEach(item => {
            item.addEventListener('click', () => {
                const parentItem = item.closest('.inbox-message-item');
                const title = parentItem.querySelector('h4').textContent;
                const message = parentItem.querySelector('p').textContent;
                openMessageModal(title, message);
            });
        });

        inboxContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                if (confirm('Apakah Anda yakin ingin menghapus pemberitahuan ini?')) {
                    deleteInboxItem(id);
                }
            });
        });

    } else {
        inboxContainer.innerHTML = '<p style="text-align: center; color: #888;">Tidak ada pemberitahuan.</p>';
    }
}

function deleteInboxItem(id) {
    localInboxData = localInboxData.filter(item => item._id !== id);
    saveInboxToLocalStorage();
    loadInboxSubmissions();
}

function openMessageModal(title, message) {
    document.getElementById('modal-message-title').textContent = title;
    document.getElementById('modal-message-text').textContent = message;
    openModal('message-detail-modal');
}


function showLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        loaderWrapper.classList.remove('hidden');
    }
}

function hideLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        loaderWrapper.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    loadInboxFromLocalStorage();
    loadInboxSubmissions();
    
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
