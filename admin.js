document.getElementById('notification-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const title = form.title.value;
    const message = form.message.value;
    const responseMessageDiv = document.getElementById('response-message');

    try {
        const response = await fetch('/api/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message })
        });

        const data = await response.json();

        if (data.success) {
            responseMessageDiv.textContent = 'Pemberitahuan berhasil dikirim!';
            responseMessageDiv.style.color = 'green';
            form.reset();
        } else {
            responseMessageDiv.textContent = 'Gagal mengirim pemberitahuan: ' + data.message;
            responseMessageDiv.style.color = 'red';
        }
    } catch (error) {
        responseMessageDiv.textContent = 'Terjadi kesalahan saat mengirim data.';
        responseMessageDiv.style.color = 'red';
        console.error('Error:', error);
    }
});
