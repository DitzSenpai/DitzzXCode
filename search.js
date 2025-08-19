document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-box input');
    
    if (!searchInput) {
        console.error("Error: Search input element not found.");
        return;
    }

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Cek jika kolom pencarian kosong
        if (searchTerm.trim() === '') {
            // Jika kosong, reset tampilan ke halaman Dashboard
            showPage('dashboard-view', null);
            return;
        }

        // Sembunyikan semua halaman konten
        const allContentViews = document.querySelectorAll('.content-view');
        allContentViews.forEach(view => {
            view.style.display = 'none';
        });

        // Cari semua kartu produk dan filter
        const allCards = document.querySelectorAll('.apk-card, .product-card');
        let hasMatch = false;

        allCards.forEach(card => {
            const titleElement = card.querySelector('h4');
            const descElement = card.querySelector('.apk-desc, .product-desc');
            
            const title = titleElement ? titleElement.textContent.toLowerCase() : '';
            const description = descElement ? descElement.textContent.toLowerCase() : '';

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                // Tampilkan kartu jika cocok
                card.style.display = 'block'; 
                // Temukan parent container (sc-bot-view, apk-mod-view, atau store-view)
                const parentView = card.closest('.content-view');
                if (parentView) {
                    parentView.style.display = 'block';
                    hasMatch = true;
                }
            } else {
                // Sembunyikan kartu jika tidak cocok
                card.style.display = 'none';
            }
        });
        
        // Opsional: Beri tahu pengguna jika tidak ada hasil
        if (!hasMatch) {
            alert('Tidak ada hasil yang ditemukan untuk "' + searchTerm + '".');
        }
    });
    
    // Fungsi untuk menampilkan halaman, agar bisa dipanggil dari search.js
    function showPage(pageId) {
        const allContent = document.querySelectorAll('.content-view');
        allContent.forEach(content => {
            content.style.display = 'none';
        });

        const selectedContent = document.getElementById(pageId);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }

        // Opsional: Hapus kelas aktif dari menu sidebar
        const allLinks = document.querySelectorAll('.sidebar-menu li');
        allLinks.forEach(item => {
            item.classList.remove('active');
        });
        // Tambahkan kelas aktif ke menu yang relevan jika ada
        const sidebarLink = document.querySelector(`[onclick*="showPage('${pageId}')"]`);
        if (sidebarLink && sidebarLink.parentNode) {
            sidebarLink.parentNode.classList.add('active');
        }
    }
});
