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
}

// Create and export the storage instance
export const mongoStorage = new MongoDBStorage();
