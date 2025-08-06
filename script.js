function toggleFaq(item) {
    item.classList.toggle('active');
}

// --- FUNGSI MODAL ---
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

// --- AKHIR FUNGSI MODAL ---

// --- LOGIKA COOLDOWN TOMBOL ---
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 menit dalam milidetik
const storageKey = 'communityButtonCooldown';
const COOLDOWN_MESSAGE = 'Anda Sudah Mengirim. Tunggu Balasan Dari Admin Dan Cek Gmail Anda, Biasanya 1 menit.';

function cooldownButton() {
    const btn = document.getElementById('join-community-btn');
    if (!btn) return;

    btn.disabled = true;
    btn.classList.add('btn-cooldown-active');
    btn.textContent = COOLDOWN_MESSAGE;
    
    const cooldownEnds = Date.now() + COOLDOWN_TIME;
    localStorage.setItem(storageKey, cooldownEnds);

    setTimeout(() => {
        btn.textContent = 'Gabung Komunitas →';
        btn.disabled = false;
        btn.classList.remove('btn-cooldown-active');
        localStorage.removeItem(storageKey);
    }, COOLDOWN_TIME);
}

// --- FUNGSI UNTUK CEK STATUS COOLDOWN SAAT HALAMAN DIMUAT ---
function checkCooldownStatus() {
    const btn = document.getElementById('join-community-btn');
    if (!btn) return;
    
    const cooldownEnds = localStorage.getItem(storageKey);
    if (cooldownEnds && Date.now() < parseInt(cooldownEnds)) {
        btn.disabled = true;
        btn.classList.add('btn-cooldown-active');
        btn.textContent = COOLDOWN_MESSAGE;

        setTimeout(() => {
            btn.textContent = 'Gabung Komunitas →';
            btn.disabled = false;
            btn.classList.remove('btn-cooldown-active');
            localStorage.removeItem(storageKey);
        }, parseInt(cooldownEnds) - Date.now());
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const joinCommunityBtn = document.getElementById('join-community-btn');
    const communityForm = document.querySelector('.community-form');
    
    // Panggil fungsi untuk memeriksa status cooldown
    checkCooldownStatus();

    // Event listener untuk tombol "Gabung Komunitas" (hanya membuka modal)
    if (joinCommunityBtn) {
        joinCommunityBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!joinCommunityBtn.disabled) {
                openModal('join-community-modal');
            }
        });
    }

    // Event listener untuk form submit (mengaktifkan cooldown setelah form terkirim)
    if (communityForm) {
        communityForm.addEventListener('submit', (event) => {
            // Formspree akan menangani submit, jadi tidak perlu event.preventDefault() di sini
            
            // Tutup modal
            closeModal('join-community-modal');
            
            // Aktifkan cooldown
            cooldownButton();
        });
    }
});
