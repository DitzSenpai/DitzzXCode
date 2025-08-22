document.addEventListener('DOMContentLoaded', () => {
    let inboxMessagesData = [];
    let notificationTimeout = null;
    let isInitialLoad = true; // Tambahkan flag untuk membedakan load awal dan polling

    // Fungsi untuk menampilkan halaman
    window.showPage = function(pageId, element) {
        document.querySelectorAll('.content-view').forEach(view => {
            view.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';

        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        if (element) {
            let parentLi = element.closest('li');
            if (parentLi) {
                parentLi.classList.add('active');
            }
        }
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    };
    
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    window.toggleSubmenu = function(li) {
        li.classList.toggle('open');
    };

    window.openModal = function(modalId) {
        document.getElementById(modalId).classList.add('show');
    };

    window.closeModal = function(modalId) {
        document.getElementById(modalId).classList.remove('show');
    };
    
    const openPartnerModalBtn = document.getElementById('open-partner-modal');
    if (openPartnerModalBtn) {
        openPartnerModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('partner-owner-modal');
        });
    }

    // --- LOGIKA UTAMA: IP ADDRESS & WAKTU ---
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('time-value').textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ip-address-value').textContent = data.ip;
        })
        .catch(error => {
            document.getElementById('ip-address-value').textContent = 'Error';
            console.error('Error fetching IP:', error);
        });

    // --- LOGIKA UNTUK INBOX & NOTIFIKASI ---
    
    // Fungsi utama untuk mengambil data dan memperbarui UI
    function fetchDataAndUpdate(isPolling = false) {
        fetch('inbox.json?' + new Date().getTime()) // Tambahkan cache-busting
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(newData => {
                const newMessages = newData.filter(newItem => 
                    !inboxMessagesData.some(oldItem => oldItem.id === newItem.id)
                );

                inboxMessagesData = newData; // Selalu perbarui data lokal
                renderInboxMessages();

                if (newMessages.length > 0) {
                    // Notifikasi pop-up hanya untuk pesan yang benar-benar baru
                    updateInboxNotification(true); 
                } else if (!isPolling) {
                    // Tampilkan notifikasi dot untuk pesan belum terbaca saat load awal
                    updateInboxNotification(false);
                }
            })
            .catch(error => console.error('Error fetching inbox data:', error));
    }
    
    // Fungsi untuk menampilkan pesan di DOM
    function renderInboxMessages() {
        const inboxContainer = document.getElementById('inbox-messages');
        if (!inboxContainer) {
            console.error("Elemen dengan ID 'inbox-messages' tidak ditemukan.");
            return;
        }
        
        inboxContainer.innerHTML = '';
        inboxMessagesData.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('inbox-message-item');
            if (!message.isRead) {
                messageElement.classList.add('unread');
            }
            messageElement.innerHTML = `
                <h4>${message.subject}</h4>
                <p>${message.content}</p>
                <div class="message-meta">
                    <span>Dari: ${message.sender}</span>
                    <span>${message.date}</span>
                </div>
            `;
            messageElement.addEventListener('click', () => showMessageDetail(message.id));
            inboxContainer.appendChild(messageElement);
        });
    }

    // Fungsi untuk menandai pesan sebagai sudah dibaca
    window.showMessageDetail = function(messageId) {
        const message = inboxMessagesData.find(msg => msg.id === messageId);
        if (message) {
            document.getElementById('modal-message-title').textContent = message.subject;
            document.getElementById('modal-message-text').textContent = message.content;
            openModal('message-detail-modal');
            
            if (!message.isRead) {
                message.isRead = true;
                renderInboxMessages();
                updateInboxNotification(false); // Jangan tampilkan pop-up
            }
        }
    };

    // Fungsi untuk memperbarui notifikasi dan titik merah
    // Parameter `isNewMessage` menentukan apakah pop-up notifikasi harus muncul
    function updateInboxNotification(isNewMessage) {
        const inboxNotification = document.getElementById('inbox-notification');
        const menuToggle = document.querySelector('.menu-toggle');
        const inboxMenuItem = document.querySelector('a[onclick="showPage(\'inbox-view\', this)"]').parentElement;
        
        const unreadCount = inboxMessagesData.filter(msg => !msg.isRead).length;

        if (unreadCount > 0) {
            if (menuToggle) {
                menuToggle.classList.add('has-notification');
            }
            if (inboxMenuItem) {
                inboxMenuItem.classList.add('has-notification');
            }

            if (isNewMessage) {
                if (inboxNotification) {
                    inboxNotification.classList.add('show');
                    if (notificationTimeout) clearTimeout(notificationTimeout);
                    notificationTimeout = setTimeout(() => {
                        inboxNotification.classList.add('animate');
                        setTimeout(() => {
                            inboxNotification.classList.remove('show', 'animate');
                        }, 2500); 
                    }, 100);
                }
            }
        } else {
            if (inboxNotification) {
                inboxNotification.classList.remove('show', 'animate');
            }
            if (menuToggle) {
                menuToggle.classList.remove('has-notification');
            }
            if (inboxMenuItem) {
                inboxMenuItem.classList.remove('has-notification');
            }
        }
    }
    
    // Panggil saat halaman dimuat
    fetchDataAndUpdate(false);
    
    // Polling setiap 10 detik untuk memeriksa pesan baru
    setInterval(() => {
        fetchDataAndUpdate(true);
    }, 10000); 

    // --- LOGIKA UNTUK MODAL DOWNLOAD DAN API ---
    let currentDownloadInfo = {};

    window.openDownloadModal = function(title, password, downloadUrl, helpLink) {
        document.getElementById('download-modal-title').textContent = title;
        document.getElementById('modal-password-input').value = '';
        document.getElementById('modal-password-note').textContent = '';
        document.getElementById('password-help-link').href = helpLink;

        currentDownloadInfo = {
            password: password,
            downloadUrl: downloadUrl
        };
        openModal('download-options-modal');
    };

    document.getElementById('download-modal-btn').addEventListener('click', () => {
        const inputPassword = document.getElementById('modal-password-input').value.toLowerCase();
        const note = document.getElementById('modal-password-note');

        if (inputPassword === currentDownloadInfo.password) {
            note.textContent = 'Password Benar! Mengalihkan ke halaman unduhan...';
            note.style.color = '#2ecc71';
            setTimeout(() => {
                window.open(currentDownloadInfo.downloadUrl, '_blank');
                closeModal('download-options-modal');
            }, 1500);
        } else {
            note.textContent = 'Password Salah!';
            note.style.color = '#e74c3c';
        }
    });

    window.openApiModal = function(title, description) {
        document.getElementById('api-modal-title').textContent = title;
        document.getElementById('api-modal-description').textContent = description;
        openModal('api-modal');
    };

    window.submitApiForm = function() {
        const input = document.getElementById('api-input').value;
        const title = document.getElementById('api-modal-title').textContent;
        alert(`API ${title} dengan input: "${input}" sedang diproses.`);
        closeModal('api-modal');
    };
});
