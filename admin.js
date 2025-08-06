// File: admin.js

document.getElementById('notification-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const message = document.getElementById('message').value;

    if (!title || !message) {
        alert('Judul dan isi pemberitahuan tidak boleh kosong!');
        return;
    }

    try {
        const response = await fetch('/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, message }),
        });

        const data = await response.json();
        if (data.success) {
            alert('Pemberitahuan berhasil dibuat!');
            document.getElementById('notification-form').reset();
        } else {
            alert('Gagal membuat pemberitahuan: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengirim pemberitahuan.');
    }
});
