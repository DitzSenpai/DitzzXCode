const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://DitzKun:DitzKun@cluster0.aqzksbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, message: 'ID tidak boleh kosong.' });
    return;
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const notifications = database.collection('notifications');

    const result = await notifications.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ success: true, message: 'Pemberitahuan berhasil dihapus.' });
    } else {
      res.status(404).json({ success: false, message: 'Pemberitahuan tidak ditemukan.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  } finally {
    await client.close();
  }
};
