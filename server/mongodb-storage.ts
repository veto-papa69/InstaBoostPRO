import { 
  User, 
  Order, 
  Payment, 
  Service, 
  LoginLog,
  connectMongoDB,
  type IUser,
  type IOrder,
  type IPayment,
  type IService,
  type ILoginLog
} from "./mongodb";

export interface IMongoStorage {
  // Database initialization
  initializeDatabase(): Promise<void>;

  // User operations
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByInstagramUsername(username: string): Promise<IUser | null>;
  createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser>;
  updateUserBalance(userId: string, newBalance: number): Promise<void>;
  markBonusClaimed(userId: string): Promise<void>;

  // Order operations
  createOrder(orderData: Omit<IOrder, '_id' | 'createdAt'>): Promise<IOrder>;
  getUserOrders(userId: string): Promise<IOrder[]>;

  // Payment operations
  createPayment(paymentData: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment>;
  getUserPayments(userId: string): Promise<IPayment[]>;
  getPayment(id: string): Promise<IPayment | null>;
  updatePaymentStatus(id: string, status: string): Promise<void>;

  // Service operations
  getServices(): Promise<IService[]>;
  initializeServices(): Promise<void>;

  // Login tracking operations
  logUserLogin(userId: string, instagramUsername: string): Promise<number>;
  getUserLoginCount(userId: string): Promise<number>;

  // Referral methods
  getUserReferralData(userId: string): Promise<any>;
  getReferralCount(userId: string): Promise<number>;
}

export class MongoDBStorage implements IMongoStorage {
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing MongoDB database...');
      await connectMongoDB();
      console.log('✅ MongoDB database initialization completed');
    } catch (error) {
      console.error('❌ MongoDB database initialization failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ instagramUsername: username }).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async getUserByInstagramUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ instagramUsername: username }).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by Instagram username:', error);
      return null;
    }
  }

  async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return {
        ...savedUser.toObject(),
        _id: savedUser._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async markBonusClaimed(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { bonusClaimed: true });
    } catch (error) {
      console.error('Error marking bonus claimed:', error);
      throw error;
    }
  }

  async createOrder(orderData: Omit<IOrder, '_id' | 'createdAt'>): Promise<IOrder> {
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      return savedOrder.toObject() as IOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    try {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
      return orders as IOrder[];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  async createPayment(paymentData: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment> {
    try {
      const payment = new Payment(paymentData);
      const savedPayment = await payment.save();
      return savedPayment.toObject() as IPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getUserPayments(userId: string): Promise<IPayment[]> {
    try {
      const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).lean();
      return payments as IPayment[];
    } catch (error) {
      console.error('Error getting user payments:', error);
      return [];
    }
  }

  async getPayment(id: string): Promise<IPayment | null> {
    try {
      const payment = await Payment.findById(id).lean();
      return payment as IPayment | null;
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    try {
      await Payment.findByIdAndUpdate(id, { status });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getServices(): Promise<IService[]> {
    try {
      const services = await Service.find({ active: true }).sort({ category: 1, name: 1 }).lean();
      return services as IService[];
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  }

  async initializeServices(): Promise<void> {
    try {
      // Services are automatically initialized in the MongoDB connection
      console.log('✅ Services initialization completed (handled by MongoDB connection)');
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  async logUserLogin(userId: string, instagramUsername: string): Promise<number> {
    try {
      const currentCount = await this.getUserLoginCount(userId);
      const newCount = currentCount + 1;

      const loginLog = new LoginLog({
        userId,
        instagramUsername,
        loginCount: newCount
      });

      await loginLog.save();
      return newCount;
    } catch (error) {
      console.error('Error logging user login:', error);
      return 1;
    }
  }

  async getUserLoginCount(userId: string): Promise<number> {
    try {
      const count = await LoginLog.countDocuments({ userId });
      return count;
    } catch (error) {
      console.error('Error getting user login count:', error);
      return 0;
    }
  }

  // Referral methods
  async getUserReferralData(userId: string): Promise<any> {
    try {
      await this.initializeDatabase(); // Ensure DB is connected
      const { Referral } = await import('./mongodb');

      console.log('🔍 Getting referral data for userId:', userId);

      // First check if user has any referral code (as referrer) - only check for main referral code, not used ones
      let referral = await Referral.findOne({ 
        userId, 
        referredUserId: { $exists: false }
      }).lean();

      console.log('📋 Found existing referral:', referral);

      if (!referral) {
        // If no referral found, create one automatically
        const user = await this.getUser(userId);
        if (user) {
          const referralCode = `REF-${user.uid}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          console.log('🎯 Creating new referral code:', referralCode);

          const newReferral = new Referral({
            userId,
            referralCode,
            isCompleted: false
          });
          await newReferral.save();
          referral = newReferral.toObject();
          console.log('✅ New referral created successfully');
        }
      }

      const result = referral ? {
        id: referral._id.toString(),
        userId: referral.userId,
        referralCode: referral.referralCode,
        referredUserId: referral.referredUserId,
        isCompleted: referral.isCompleted
      } : null;

      console.log('📤 Returning referral data:', result);
      return result;
    } catch (error) {
      console.error('Error getting user referral data:', error);
      return null;
    }
  }

  async createUserReferral(userId: string, referralCode: string): Promise<any> {
    try {
      await this.initializeDatabase(); // Ensure DB is connected
      const { Referral } = await import('./mongodb');

      // Check if referral code already exists
      const existingReferral = await Referral.findOne({ referralCode });
      if (existingReferral) {
        throw new Error('Referral code already exists');
      }

      const referral = new Referral({
        userId,
        referralCode,
        isCompleted: false
      });
      await referral.save();
      return {
        id: referral._id.toString(),
        userId: referral.userId,
        referralCode: referral.referralCode,
        referredUserId: referral.referredUserId,
        isCompleted: referral.isCompleted
      };
    } catch (error) {
      console.error('Error creating user referral:', error);
      throw error;
    }
  }

  async getReferralCount(userId: string): Promise<number> {
    try {
      await this.initializeDatabase(); // Ensure DB is connected
      const { Referral } = await import('./mongodb');

      console.log('🔍 Getting referral count for userId:', userId);

      // Count referrals where this user referred others (has referredUserId)
      const count = await Referral.countDocuments({ 
        userId,
        referredUserId: { $exists: true, $ne: null }
      });

      console.log('📊 Referral count:', count);
      return count || 0;
    } catch (error) {
      console.error('❌ Error getting referral count:', error);
      return 0;
    }
  }

  async getReferralByCode(referralCode: string): Promise<any> {
    try {
      await this.initializeDatabase(); // Ensure DB is connected
      const { Referral } = await import('./mongodb');

      console.log('🔍 Looking for referral code:', referralCode);

      // Only find main referral codes (not used ones) and that are valid format
      const referral = await Referral.findOne({ 
        referralCode,
        referredUserId: { $exists: false }
      }).lean();

      console.log('📋 Found referral:', referral);

      return referral ? {
        id: referral._id.toString(),
        userId: referral.userId.toString(),
        referralCode: referral.referralCode,
        referredUserId: referral.referredUserId ? referral.referredUserId.toString() : null,
        isCompleted: referral.isCompleted
      } : null;
    } catch (error) {
      console.error('Error getting referral by code:', error);
      return null;
    }
  }

  async createReferralRecord(referrerId: string, referredUserId: string, referralCode: string): Promise<void> {
    try {
      await this.initializeDatabase(); // Ensure DB is connected
      const { Referral } = await import('./mongodb');

      console.log('🎯 Creating referral record:', { referrerId, referredUserId, referralCode });

      // Create a new referral record for the successful referral
      const referral = new Referral({
        userId: referrerId,
        referralCode: `USED-${referralCode}-${Date.now()}`, // Create unique code for this referral instance
        referredUserId,
        isCompleted: true
      });
      await referral.save();

      console.log('✅ Referral record created successfully');
    } catch (error) {
      console.error('Error creating referral record:', error);
      throw error;
    }
  }

  async updateUserDiscountStatus(userId: string, hasClaimedDiscount: boolean): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { hasClaimedDiscount });
    } catch (error) {
      console.error('Error updating user discount status:', error);
      throw error;
    }
  }
}

// Create and export the storage instance
export const mongoStorage = new MongoDBStorage();
