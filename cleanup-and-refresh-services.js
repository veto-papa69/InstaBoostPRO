import mongoose from 'mongoose';

async function cleanupAndRefreshServices() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define the Service schema
    const serviceSchema = new mongoose.Schema({
      name: { type: String, required: true },
      category: { type: String, required: true },
      rate: { type: Number, required: true },
      minOrder: { type: Number, required: true },
      maxOrder: { type: Number, required: true },
      deliveryTime: { type: String, required: true },
      active: { type: Boolean, default: true }
    });

    const Service = mongoose.model('Service', serviceSchema);

    // Clear existing services
    console.log('🔄 Clearing existing services...');
    await Service.deleteMany({});
    console.log('✅ Existing services cleared');

    // Add new services with your pricing
    console.log('🔄 Adding new services with updated pricing...');
    
    const newServices = [
      // Followers Services
      {
        name: "Instagram Followers - Indian",
        category: "Followers",
        rate: 6.00,
        minOrder: 100,
        maxOrder: 100000,
        deliveryTime: "0-6 hours",
        active: true
      },
      {
        name: "Instagram Followers - USA",
        category: "Followers", 
        rate: 7.00,
        minOrder: 100,
        maxOrder: 50000,
        deliveryTime: "0-12 hours",
        active: true
      },
      {
        name: "Instagram Followers - HQ Non Drop",
        category: "Followers",
        rate: 11.00,
        minOrder: 100,
        maxOrder: 25000,
        deliveryTime: "0-24 hours",
        active: true
      },
      {
        name: "Instagram Followers - Global Mix",
        category: "Followers",
        rate: 4.50,
        minOrder: 100,
        maxOrder: 200000,
        deliveryTime: "0-6 hours", 
        active: true
      },
      
      // Likes Services
      {
        name: "Instagram Likes - Bot Likes",
        category: "Likes",
        rate: 2.00,
        minOrder: 50,
        maxOrder: 100000,
        deliveryTime: "0-1 hour",
        active: true
      },
      {
        name: "Instagram Likes - Non Drop",
        category: "Likes",
        rate: 4.50,
        minOrder: 50,
        maxOrder: 50000,
        deliveryTime: "0-3 hours",
        active: true
      },
      {
        name: "Instagram Likes - Only Girl Accounts",
        category: "Likes",
        rate: 6.00,
        minOrder: 50,
        maxOrder: 25000,
        deliveryTime: "0-6 hours",
        active: true
      },
      {
        name: "Instagram Likes - Indian Real",
        category: "Likes",
        rate: 3.50,
        minOrder: 50,
        maxOrder: 30000,
        deliveryTime: "0-2 hours",
        active: true
      },
      
      // Views Services
      {
        name: "Instagram Video Views - Fast",
        category: "Views",
        rate: 1.20,
        minOrder: 100,
        maxOrder: 1000000,
        deliveryTime: "0-30 minutes",
        active: true
      },
      {
        name: "Instagram Story Views - Premium",
        category: "Views",
        rate: 2.80,
        minOrder: 100,
        maxOrder: 50000,
        deliveryTime: "0-2 hours",
        active: true
      },
      {
        name: "Instagram Reel Views - High Quality",
        category: "Views",
        rate: 1.50,
        minOrder: 100,
        maxOrder: 500000,
        deliveryTime: "0-1 hour",
        active: true
      },
      
      // Comments Services
      {
        name: "Instagram Comments - Random Positive",
        category: "Comments",
        rate: 8.00,
        minOrder: 5,
        maxOrder: 1000,
        deliveryTime: "1-6 hours",
        active: true
      },
      {
        name: "Instagram Comments - Custom Text",
        category: "Comments",
        rate: 15.00,
        minOrder: 5,
        maxOrder: 500,
        deliveryTime: "2-24 hours",
        active: true
      },
      {
        name: "Instagram Comments - Emoji Only",
        category: "Comments",
        rate: 5.00,
        minOrder: 10,
        maxOrder: 2000,
        deliveryTime: "0-3 hours",
        active: true
      }
    ];

    await Service.insertMany(newServices);
    console.log(`✅ Successfully added ${newServices.length} services`);

    // Verify the services
    const serviceCount = await Service.countDocuments();
    console.log(`✅ Total services in database: ${serviceCount}`);

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    console.log('🎉 Services refresh completed successfully!');

  } catch (error) {
    console.error('❌ Error refreshing services:', error);
    process.exit(1);
  }
}

cleanupAndRefreshServices();