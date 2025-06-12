import mongoose from 'mongoose';

// MongoDB connection with your actual credentials
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Clean MongoDB schemas
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  instagramUsername: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  serviceName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Processing' }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true, unique: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rate: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  maxOrder: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  active: { type: Boolean, default: true }
});

const loginLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  loginCount: { type: Number, required: true }
}, { timestamps: true });

const referralSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredUserId: { type: String }, // Optional: Tracks who was referred by this code
  isCompleted: { type: Boolean, default: false } // Indicates if referral is complete (e.g., 5 referrals made)
});

const discountRewardSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  hasClaimedDiscount: { type: Boolean, default: false },
  claimedAt: { type: Date }
});

// Models
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Service = mongoose.model('Service', serviceSchema);
const LoginLog = mongoose.model('LoginLog', loginLogSchema);
const Referral = mongoose.model('Referral', referralSchema);
const DiscountReward = mongoose.model('DiscountReward', discountRewardSchema);

// Storage implementation
export class MongoStorage {
  private connected = false;

  async initializeDatabase(): Promise<void> {
    try {
      if (!this.connected) {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        this.connected = true;
        console.log('✅ MongoDB connected successfully');

        // Initialize services
        await this.initializeServices();
      }
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<any> {
    const user = await User.findById(id);
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed
    } : null;
  }

  async getUserByUsername(username: string): Promise<any> {
    const user = await User.findOne({ instagramUsername: username });
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed
    } : null;
  }

  async getUserByInstagramUsername(username: string): Promise<any> {
    return this.getUserByUsername(username);
  }

  async createUser(userData: any): Promise<any> {
    const user = new User(userData);
    const saved = await user.save();
    return { 
      id: saved._id.toString(), 
      uid: saved.uid, 
      instagramUsername: saved.instagramUsername,
      walletBalance: saved.walletBalance.toString(),
      bonusClaimed: saved.bonusClaimed
    };
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
  }

  async markBonusClaimed(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { bonusClaimed: true });
  }

  // Referral methods
  async getUserReferralData(userId: string): Promise<any> {
    return await Referral.findOne({ userId });
  }

  async createUserReferral(userId: string, referralCode: string): Promise<any> {
    const referral = new Referral({
      userId,
      referralCode,
      isCompleted: false,
    });
    await referral.save();
    return referral;
  }

  async getReferralCount(userId: string): Promise<number> {
    return await Referral.countDocuments({ 
      userId, 
      isCompleted: true 
    });
  }

  async hasClaimedDiscount(userId: string): Promise<boolean> {
    const reward = await DiscountReward.findOne({ userId });
    return reward ? reward.hasClaimedDiscount : false;
  }

  async claimDiscountReward(userId: string): Promise<void> {
    await DiscountReward.findOneAndUpdate(
      { userId },
      { 
        hasClaimedDiscount: true,
        claimedAt: new Date()
      },
      { upsert: true }
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<any> {
    const referral = await Referral.findOne({ referralCode });
    if (referral) {
      return await User.findById(referral.userId);
    }
    return null;
  }

  async createReferralRecord(referrerUserId: string, referredUserId: string, referralCode: string): Promise<void> {
    // Check if this referral already exists
    const existingReferral = await Referral.findOne({
      userId: referrerUserId,
      referredUserId: referredUserId
    });

    if (!existingReferral) {
      const referral = new Referral({
        userId: referrerUserId,
        referralCode,
        referredUserId,
        isCompleted: true,
      });
      await referral.save();
    }
  }

  async createOrder(orderData: any): Promise<any> {
    const order = new Order(orderData);
    const saved = await order.save();
    return {
      id: saved._id.toString(),
      orderId: saved.orderId,
      serviceName: saved.serviceName,
      quantity: saved.quantity,
      price: saved.price.toString(),
      status: saved.status,
      createdAt: saved.createdAt.toISOString()
    };
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map(order => ({
      id: order._id.toString(),
      orderId: order.orderId,
      serviceName: order.serviceName,
      instagramUsername: order.instagramUsername,
      quantity: order.quantity,
      price: order.price.toString(),
      status: order.status,
      createdAt: order.createdAt.toISOString()
    }));
  }

  async createPayment(paymentData: any): Promise<any> {
    const payment = new Payment(paymentData);
    const saved = await payment.save();
    return {
      id: saved._id.toString(),
      amount: saved.amount.toString(),
      utrNumber: saved.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: saved.status,
      createdAt: saved.createdAt.toISOString()
    };
  }

  async getUserPayments(userId: string): Promise<any[]> {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return payments.map(payment => ({
      id: payment._id.toString(),
      amount: payment.amount.toString(),
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt.toISOString()
    }));
  }

  async getPayment(id: string): Promise<any> {
    const payment = await Payment.findById(id);
    return payment ? {
      id: payment._id.toString(),
      userId: payment.userId,
      amount: payment.amount.toString(),
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt.toISOString()
    } : null;
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    await Payment.findByIdAndUpdate(id, { status });
  }

  async getServices(): Promise<any[]> {
    const services = await Service.find({ active: true }).sort({ category: 1, name: 1 });
    return services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      category: service.category,
      rate: service.rate.toString(),
      minOrder: service.minOrder,
      maxOrder: service.maxOrder,
      deliveryTime: service.deliveryTime,
      active: service.active
    }));
  }

  async initializeServices(): Promise<void> {
    try {
      const count = await Service.countDocuments();
      if (count === 0) {
        console.log('🔄 Initializing default services...');

        const defaultServices = [
          {
            name: "Instagram Followers - Indian",
            category: "Followers",
            rate: 4.00,
            minOrder: 100,
            maxOrder: 100000,
            deliveryTime: "0-2 hours",
            active: true
          },
          {
            name: "Instagram Followers - USA",
            category: "Followers",
            rate: 5.00,
            minOrder: 100,
            maxOrder: 50000,
            deliveryTime: "0-4 hours",
            active: true
          },
          {
            name: "Instagram Likes - Indian",
            category: "Likes",
            rate: 2.00,
            minOrder: 50,
            maxOrder: 50000,
            deliveryTime: "0-1 hour",
            active: true
          },
          {
            name: "Instagram Video Views",
            category: "Views",
            rate: 1.00,
            minOrder: 100,
            maxOrder: 1000000,
            deliveryTime: "0-30 minutes",
            active: true
          },
          {
            name: "Instagram Comments - Random",
            category: "Comments",
            rate: 8.00,
            minOrder: 10,
            maxOrder: 1000,
            deliveryTime: "1-6 hours",
            active: true
          }
        ];

        await Service.insertMany(defaultServices);
        console.log('✅ Default services initialized');
      } else {
        console.log(`✅ Services already exist (${count} services)`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
    }
  }

  async logUserLogin(userId: string, instagramUsername: string): Promise<number> {
    const count = await this.getUserLoginCount(userId);
    const newCount = count + 1;

    const loginLog = new LoginLog({
      userId,
      instagramUsername,
      loginCount: newCount
    });

    await loginLog.save();
    return newCount;
  }

  async getUserLoginCount(userId: string): Promise<number> {
    return await LoginLog.countDocuments({ userId });
  }
}

export const storage = new MongoStorage();