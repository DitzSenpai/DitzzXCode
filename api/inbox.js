const { MongoClient } = require('mongodb');

const uri = "Mongodb+srv://DitzKun:<db_password>@cluster0.aqzksbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    await client.connect();
    const database = client.db('ditz_marketplace');
    const notifications = database.collection('notifications');

    const allNotifications = await notifications.find({}).sort({ createdAt: -1 }).toArray();

    res.status(200).json({ success: true, data: allNotifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  } finally {
    await client.close();
  }
};
