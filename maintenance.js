// =======================================================
// === FUNGSI DAN LOGIKA UNTUK MODE MAINTENANCE ===
// =======================================================

function checkMaintenanceMode() {
    const maintenanceOverlay = document.getElementById('maintenance-overlay');
    // Jika elemen overlay tidak ada, hentikan fungsi
    if (!maintenanceOverlay) {
        console.error("Elemen 'maintenance-overlay' tidak ditemukan.");
        return;
    }
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Minggu, 5 = Jumat

    // Atur hari dan rentang waktu untuk mode maintenance
    const maintenanceDay = 5; // Jumat
    const startTotalMinutes = 6 * 60 + 11; // 06:12
    const endTotalMinutes = 8 * 60;   // 07:00
    
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // Periksa apakah hari ini adalah hari yang ditentukan DAN waktu saat ini berada dalam rentang
    const isMaintenanceTime = dayOfWeek === maintenanceDay && 
                              currentTotalMinutes >= startTotalMinutes && 
                              currentTotalMinutes <= endTotalMinutes;

    // Tampilkan atau sembunyikan overlay
    if (isMaintenanceTime) {
        if (!maintenanceOverlay.classList.contains('show')) {
            maintenanceOverlay.classList.add('show');
            document.body.classList.add('no-scroll');
        }
    } else {
        if (maintenanceOverlay.classList.contains('show')) {
            maintenanceOverlay.classList.remove('show');
            document.body.classList.remove('no-scroll');
        }
    }
}

// Inisialisasi pengecekan mode maintenance
document.addEventListener('DOMContentLoaded', () => {
    checkMaintenanceMode();
    // Periksa mode maintenance setiap menit
    setInterval(checkMaintenanceMode, 60 * 1000); 
});
