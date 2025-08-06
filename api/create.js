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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const collection = database.collection('submissions');

    const newSubmission = {
      title,
      message,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newSubmission);
    
    res.status(201).json({ success: true, message: 'Submission created successfully', submissionId: result.insertedId });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  } finally {
    await client.close();
  }
};
