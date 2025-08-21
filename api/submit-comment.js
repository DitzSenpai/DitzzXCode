// Anda butuh library seperti Octokit untuk berinteraksi dengan GitHub API
const { Octokit } = require("@octokit/core");

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, comment } = req.body;
        
        // Baca file JSON yang sudah ada
        const existingComments = require('../data/comments.json');
        
        // Buat komentar baru
        const newComment = {
            id: existingComments.length + 1,
            name: name,
            comment: comment,
            timestamp: new Date().toISOString()
        };
        
        // Tambahkan komentar baru ke array
        existingComments.push(newComment);
        
        // Di sini Anda harus melakukan commit ke GitHub
        // Ini adalah bagian yang paling kompleks dan memerlukan
        // GitHub Personal Access Token yang memiliki izin 'repo'.
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        
        // Contoh: Mengupdate file comments.json di GitHub
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: 'DitzSenpai',
            repo: 'DitzzXCode',
            path: 'data/comments.json',
            message: `Add new comment from ${name}`,
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
