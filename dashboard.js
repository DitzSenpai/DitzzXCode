// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-container');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const inboxMessages = document.getElementById('inbox-messages');
    const passwordHelpLink = document.getElementById('password-help-link');
    const modalPasswordInput = document.getElementById('modal-password-input');
    const downloadModalBtn = document.getElementById('download-modal-btn');
    const downloadOptionsModal = document.getElementById('download-options-modal');
    const passwordNote = document.getElementById('modal-password-note');
    const apiModal = document.getElementById('api-modal');
    const partnerModal = document.getElementById('partner-owner-modal');
    const openPartnerModalBtn = document.getElementById('open-partner-modal');
    const inboxNotification = document.getElementById('inbox-notification');
    const messageDetailModal = document.getElementById('message-detail-modal');

    let passwords = {}; // Objek untuk menyimpan data password dari JSON

    // Fungsi untuk memuat data password dari file JSON
    async function loadPasswords() {
        try {
            const response = await fetch('passwords.json');
            if (!response.ok) {
                throw new Error('Gagal memuat passwords.json. Pastikan file ada.');
            }
            passwords = await response.json();
            console.log('Password berhasil dimuat.');
        } catch (error) {
            console.error('Error saat memuat password:', error);
            alert('Gagal memuat data password. Mohon hubungi admin.');
        }
    }

    loadPasswords(); // Panggil fungsi untuk memuat password saat halaman dimuat

    const INITIALIZED_FLAG_KEY = 'hasInitializedInbox';
    let localInboxData = [];

    // Fungsi untuk menampilkan halaman
    window.showPage = (pageId, element) => {
        document.querySelectorAll('.content-view').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';

        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        element.closest('li').classList.add('active');

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }

        if (pageId === 'inbox-view') {
            renderInboxMessages();
        }
    };

    // Fungsi untuk membuka modal
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('no-scroll');
        }
    };

    // Fungsi untuk menutup modal
    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.classList.remove('no-scroll');
            }, 300);
        }
    };

    // Toggle submenu
    window.toggleSubmenu = (element) => {
        element.classList.toggle('open');
        const submenu = element.querySelector('.submenu');
        if (element.classList.contains('open')) {
            submenu.style.maxHeight = submenu.scrollHeight + 'px';
        } else {
            submenu.style.maxHeight = '0';
        }
    };

    // Buka modal download
    window.openDownloadModal = (title, item, downloadLink, waLink) => {
        document.getElementById('download-modal-title').innerText = `Unduh ${title}`;
        modalPasswordInput.value = '';
        passwordNote.innerText = '';
        
        // Memeriksa apakah password sudah dimuat sebelum menggunakannya
        if (passwords[item]) {
            passwordHelpLink.href = waLink;
            downloadModalBtn.dataset.item = item;
            downloadModalBtn.dataset.downloadLink = downloadLink;
            openModal('download-options-modal');
        } else {
            alert('Data password belum dimuat. Mohon tunggu atau refresh halaman.');
        }
    };

    if (downloadModalBtn) {
        downloadModalBtn.addEventListener('click', () => {
            const item = downloadModalBtn.dataset.item;
            const downloadLink = downloadModalBtn.dataset.downloadLink;
            
            if (modalPasswordInput.value === passwords[item]) {
                window.location.href = downloadLink;
                closeModal('download-options-modal');
            } else {
                passwordNote.innerText = 'Password salah. Coba lagi.';
            }
        });
    }

    // Buka modal API
    window.openApiModal = (title, description) => {
        document.getElementById('api-modal-title').innerText = title;
        document.getElementById('api-modal-description').innerText = description;
        openModal('api-modal');
    };

    // Submit form API
    window.submitApiForm = () => {
        const input = document.getElementById('api-input').value;
        if (input.trim() !== '') {
            alert(`API untuk ${document.getElementById('api-modal-title').innerText} akan memproses input: ${input}`);
            closeModal('api-modal');
        } else {
            alert('Input tidak boleh kosong.');
        }
    };

    // Toggle sidebar di mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (sidebar.classList.contains('active')) {
                document.body.classList.add('no-scroll');
            } else {
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // Event listener untuk tombol close modal
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const modalId = e.target.closest('.modal').id;
            closeModal(modalId);
        });
    });

    const loaderWrapper = document.querySelector('.loader-wrapper');
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            loaderWrapper.classList.add('hidden');
        }
    });

    function initializeInbox() {
        const hasInitialized = localStorage.getItem(INITIALIZED_FLAG_KEY);
        if (!hasInitialized) {
            localInboxData = [
                {
                    title: 'Welcome!',
                    content: 'Selamat datang kembali di DitzMarketplace! Kami senang Anda berada di sini.',
                    date: new Date().toISOString()
                },
                {
                    title: 'Update APK',
                    content: 'Kami telah menambahkan APK mod baru. Cek halaman "Mod Apk" untuk mengunduhnya!',
                    date: new Date().toISOString()
                }
            ];
            saveInboxToLocalStorage();
            localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
        } else {
            loadInboxFromLocalStorage();
        }
    }

    function saveInboxToLocalStorage() {
        localStorage.setItem('inbox_messages', JSON.stringify(localInboxData));
    }

    function loadInboxFromLocalStorage() {
        const storedData = localStorage.getItem('inbox_messages');
        if (storedData) {
            localInboxData = JSON.parse(storedData);
        }
    }

    function renderInboxMessages() {
        if (!inboxMessages) return;
        inboxMessages.innerHTML = '';
        if (localInboxData.length === 0) {
            inboxMessages.innerHTML = '<p style="text-align: center; color: #888;">Tidak ada pesan di inbox.</p>';
            return;
        }
        localInboxData.forEach((msg, index) => {
            const messageItem = document.createElement('div');
            messageItem.classList.add('inbox-message-item');
            messageItem.innerHTML = `
                <h4>${msg.title}</h4>
                <p>${msg.content}</p>
                <div class="message-meta">
                    <span>${new Date(msg.date).toLocaleDateString()}</span>
                </div>
            `;
            messageItem.addEventListener('click', () => {
                document.getElementById('modal-message-title').innerText = msg.title;
                document.getElementById('modal-message-text').innerText = msg.content;
                openModal('message-detail-modal');
            });
            inboxMessages.appendChild(messageItem);
        });
    }

    function showInboxNotification() {
        if (!inboxNotification) return;
        inboxNotification.classList.add('show');
        setTimeout(() => {
            inboxNotification.classList.remove('show');
        }, 5000);
    }

    if (openPartnerModalBtn) {
        openPartnerModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('partner-owner-modal');
        });
    }

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeElement = document.getElementById('time-value');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    setInterval(updateTime, 1000);

    function fetchIpAddress() {
        fetch('https://api64.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const ipElement = document.getElementById('ip-address-value');
                if (ipElement) ipElement.textContent = data.ip;
            })
            .catch(() => {
                const ipElement = document.getElementById('ip-address-value');
                if (ipElement) ipElement.textContent = 'Tidak dapat memuat IP';
            });
    }
    fetchIpAddress();
    
    initializeInbox();
    renderInboxMessages();
    showPage('dashboard-view', document.querySelector(`.sidebar-menu a[onclick*="dashboard-view"]`));
});
