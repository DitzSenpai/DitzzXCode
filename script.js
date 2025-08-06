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

// --- LOGIKA BARU: COOLDOWN TOMBOL ---
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 menit dalam milidetik
const storageKey = 'communityButtonCooldown';
const COOLDOWN_MESSAGE = 'Anda Sudah Mengirim Dan Mengisi Formulir ini Tunggu Sampai Admin/Owner Balas dan anda Akan Mendapatkan link Komunitas.';

function cooldownButton() {
    const btn = document.getElementById('join-community-btn');
    if (!btn) return;
    
    // Nonaktifkan tombol dan tambahkan class untuk warna merah
    btn.disabled = true;
    btn.classList.add('btn-cooldown-active');
    
    // Ganti teks tombol
    btn.textContent = COOLDOWN_MESSAGE;
    
    // Simpan timestamp cooldown
    const cooldownEnds = Date.now() + COOLDOWN_TIME;
    localStorage.setItem(storageKey, cooldownEnds);
    
    // Set timer untuk mengembalikan tombol setelah cooldown selesai
    setTimeout(() => {
        btn.textContent = 'Gabung Komunitas →';
        btn.disabled = false;
        btn.classList.remove('btn-cooldown-active');
        localStorage.removeItem(storageKey);
    }, COOLDOWN_TIME);
}
// --- AKHIR LOGIKA BARU ---

document.addEventListener('DOMContentLoaded', () => {
    const joinCommunityBtn = document.getElementById('join-community-btn');
    if (joinCommunityBtn) {
        const cooldownEnds = localStorage.getItem(storageKey);
        if (cooldownEnds && Date.now() < parseInt(cooldownEnds)) {
            cooldownButton();
        }
        
        joinCommunityBtn.addEventListener('click', (event) => {
            event.preventDefault();
            
            if (!joinCommunityBtn.disabled) {
                openModal('join-community-modal');
                // Panggil cooldownButton di sini agar aktif setelah modal dibuka
                cooldownButton();
            }
        });
    }
});
