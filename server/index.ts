import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

export async function updateServicePrices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('📦 Connected to MongoDB');

    const db = client.db('instaboost');
    const services = db.collection('services');

    const followersUpdate = await services.updateMany(
      { category: { $regex: /followers/i } },
      { $inc: { rate: 20 } }
    );
    console.log(`✅ Updated ${followersUpdate.modifiedCount} followers services`);

    const othersUpdate = await services.updateMany(
      { category: { $regex: /(likes|comments|views)/i } },
      { $inc: { rate: 10 } }
    );
    console.log(`✅ Updated ${othersUpdate.modifiedCount} likes/comments/views services`);

    const updated = await services.find({}).toArray();
    console.log('📊 Updated Services:\n');
    updated.forEach((service) =>
      console.log(`${service.name} (${service.category}) → ₹${service.rate}`)
    );
  } catch (err) {
    console.error('❌ Error updating service prices:', err);
  } finally {
    await client.close();
  }
}
