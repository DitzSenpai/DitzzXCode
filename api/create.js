const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://DitzKun:DitzKun@cluster0.aqzksbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const { title, message } = req.body;

  if (!title || !message) {
    res.status(400).json({ success: false, message: 'Judul dan isi pemberitahuan wajib diisi.' });
    return;
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const notifications = database.collection('notifications');

    const result = await notifications.insertOne({
      title: title,
      message: message,
      createdAt: new Date()
    });

    res.status(200).json({ success: true, message: 'Pemberitahuan berhasil disimpan.', id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  } finally {
    await client.close();
  }
};
