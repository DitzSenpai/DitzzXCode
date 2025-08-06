const { MongoClient, ServerApiVersion } = require('mongodb');

// GANTI DENGAN ALAMAT KONEKSI DARI .env atau langsung
const uri = process.env.MONGODB_URI || "mongodb+srv://DitzKun:DitzKun@cluster0.aqzksbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const collection = database.collection('submissions');

    // MENGUBAH LOGIKA: HANYA MENGAMBIL PESAN YANG BELUM DIHAPUS
    const submissions = await collection.find({ is_deleted_by_admin: { $ne: true } }).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  } finally {
    await client.close();
  }
};
