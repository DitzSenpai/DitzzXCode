// =======================================================
// === Kode Final: Perbaikan dan Optimalisasi Menyeluruh ===
// =======================================================

// Data pesan inbox lokal sebagai ganti database
let localInboxData = [];
const INBOX_STORAGE_KEY = 'dashboard_inbox_messages';
const INITIALIZED_FLAG_KEY = 'hasInitializedInbox';

let notificationTimeout;

const itemPasswords = {
    'Sc Terakomari-Md': 'DitzzGanteng',
    'Ultra Motion (Mod)': 'DitzzGanteng',
    'Pixellab (Mod)': 'DitzzGanteng',
};

function saveInboxToLocalStorage() {
    try {
        localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(localInboxData));
    } catch (error) {
        console.error('Gagal menyimpan inbox ke localStorage:', error);
    }
}

function loadInboxFromLocalStorage() {
    try {
        const storedData = localStorage.getItem(INBOX_STORAGE_KEY);
        if (storedData) {
            localInboxData = JSON.parse(storedData);
        } else {
            localInboxData = [];
        }
    } catch (error) {
        console.error('Gagal memuat inbox dari localStorage:', error);
        localInboxData = [];
    }
}

function initializeInbox() {
    const hasInitialized = localStorage.getItem(INITIALIZED_FLAG_KEY);

    if (!hasInitialized) {
        localInboxData = [
            {
                _id: '1',
                title: 'Selamat Datang di Dashboard!',
                message: 'Halo, ini adalah pesan pertama di inbox Anda. Silakan jelajahi fitur-fitur yang ada.',
                createdAt: new Date().toISOString()
            },
            {
                _id: '2',
                title: 'Pembaruan: Tampilan Inbox',
                message: 'Kami telah memperbarui tampilan inbox agar lebih modern, menarik, dan mudah digunakan.',
                createdAt: new Date().toISOString()
            },
            {
                _id: '3',
                title: 'Pemberitahuan: Maintenance Server',
                message: 'Server akan ditutup pada hari Jumat untuk pemeliharaan rutin. Mohon maaf atas ketidaknyamanan ini.',
                createdAt: new Date().toISOString()
            }
        ];
        saveInboxToLocalStorage();
        localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
    } else {
        loadInboxFromLocalStorage();
    }
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
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
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

// FUNGSI BARU UNTUK MODAL DOWNLOAD
function openDownloadModal(title, link, password) {
    const modal = document.getElementById('download-options-modal');
    if (!modal) {
        console.error("Modal dengan ID 'download-options-modal' tidak ditemukan.");
        return;
    }

    const modalTitle = document.getElementById('download-modal-title');
    const passwordInput = modal.querySelector('.password-input');
    const passwordNote = document.getElementById('modal-password-note');
    const submitBtn = modal.querySelector('.btn-submit');
    
    if (modalTitle) modalTitle.textContent = title;
    if (passwordInput) passwordInput.value = '';
    if (passwordNote) passwordNote.textContent = `Password: ${password}`;

    if (submitBtn) {
        submitBtn.setAttribute('data-link', link);
        // Hapus event listener lama jika ada dan tambahkan yang baru
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);
        newBtn.addEventListener('click', () => checkSinglePassword(newBtn));
    }
    
    openModal('download-options-modal');
}

// FUNGSI BARU UNTUK MEMERIKSA PASSWORD (VERSI TUNGGAL)
function checkSinglePassword(button) {
    const modal = document.getElementById('download-options-modal');
    const input = modal.querySelector('.password-input');
    const enteredPassword = input.value.trim();
    const correctPassword = modal.querySelector('#modal-password-note').textContent.replace('Password: ', '');
    
    if (enteredPassword === correctPassword) {
        const downloadLink = button.getAttribute('data-link');
        if (downloadLink) {
            window.open(downloadLink, '_blank');
            closeModal('download-options-modal');
        } else {
            alert('Link download tidak ditemukan.');
        }
    } else {
        alert('Password salah. Silakan coba lagi.');
        input.value = ''; // Kosongkan input
    }
}

function openApiModal(apiName, apiDescription) {
    const modalTitle = document.getElementById('api-modal-title');
    const modalDescription = document.getElementById('api-modal-description');
    
    if (modalTitle && modalDescription) {
        modalTitle.textContent = apiName;
        modalDescription.textContent = apiDescription;
        openModal('api-modal');
    }
}

function submitApiForm() {
    const apiInput = document.getElementById('api-input');
    if (apiInput.value.trim() === '') {
        alert('Input tidak boleh kosong!');
    } else {
        alert('Error: HTTP error! status: 500');
        
        apiInput.value = '';
        closeModal('api-modal');
    }
}

function initDashboard() {
    initializeInbox();
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

    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    hideLoader();

    // Pastikan halaman awal yang ditampilkan adalah dashboard secara permanen
    showPage('dashboard-view', document.querySelector(`.sidebar-menu a[onclick*="dashboard-view"]`));
}

document.addEventListener('DOMContentLoaded', initDashboard);

// Export fungsi ke window agar bisa diakses dari HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.openApiModal = openApiModal;
window.toggleSubmenu = toggleSubmenu;
window.openDownloadModal = openDownloadModal;
window.checkSinglePassword = checkSinglePassword;
