const { MongoClient, ObjectId } = require('mongodb');

// GANTI DENGAN ALAMAT KONEKSI DARI .env atau langsung
const uri = "mongodb+srv://DitzKun:DitzKun@cluster0.aqzksbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // LOGIKA BARU: MEMERIKSA KUNCI API
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.HARD_DELETE_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
  }
  // AKHIR LOGIKA BARU

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID is required' });
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const collection = database.collection('submissions');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 1) {
      res.status(200).json({ success: true, message: 'Submission permanently deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Submission not found' });
    }
  } catch (error) {
    console.error('Error hard-deleting submission:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  } finally {
    await client.close();
  }
};
