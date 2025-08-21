const { Octokit } = require("@octokit/core");

// Variabel lingkungan (pastikan sudah diatur di Vercel)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "DitzSenpai"; // GANTI_INI dengan username GitHub Anda
const REPO_NAME = "DitzzXCode"; // GANTI_INI dengan nama repositori Anda
const FILE_PATH = "../data/comments.json"; // GANTI_INI jika path file Anda berbeda

// Inisialisasi Octokit
const octokit = new Octokit({ auth: GITHUB_TOKEN });

module.exports = async (req, res) => {
    // Tangani permintaan selain POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Ambil nama dan komentar dari body permintaan
        const { name, comment } = req.body;

        if (!name || !comment) {
            return res.status(400).json({ message: 'Nama dan komentar tidak boleh kosong.' });
        }

        // 1. Ambil isi file dan SHA-nya
        const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: FILE_PATH,
        });

        // 2. Dekode konten dan parse JSON
        const fileContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const comments = JSON.parse(fileContent);

        // 3. Tambahkan komentar baru
        const newComment = {
            id: comments.length + 1,
            name: name,
            comment: comment,
            timestamp: new Date().toISOString()
        };
        comments.push(newComment);

        // 4. Encode kembali konten ke base64 untuk dikirim ke GitHub
        const updatedContent = Buffer.from(JSON.stringify(comments, null, 2)).toString('base64');

        // 5. Update file di GitHub dengan SHA yang baru saja didapat
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: FILE_PATH,
            message: `Add new comment from ${name}`,
            content: updatedContent,
            sha: fileData.sha, // Kunci suksesnya ada di sini!
        });

        return res.status(200).json({ message: 'Komentar berhasil dikirim!' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Gagal mengirim komentar. Mohon coba lagi.' });
    }
};
            content: Buffer.from(JSON.stringify(existingComments, null, 2)).toString('base64'),
            // Anda juga perlu mendapatkan SHA dari file yang ingin diupdate
            // untuk memastikan tidak ada konflik
            sha: '...' 
        });

        res.status(200).json({ message: 'Komentar berhasil dikirim!' });

    } catch (error) {
        console.error('Error saat mengirim komentar:', error);
        res.status(500).json({ message: 'Gagal mengirim komentar.' });
    }
};
