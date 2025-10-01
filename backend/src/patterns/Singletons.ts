import mongoose from 'mongoose';

/**
 * Singleton Pattern Implementation
 * Database Connection and Configuration Management
 */

// Database Connection Singleton
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: mongoose.Connection | null = null;
  private isConnected: boolean = false;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('⚡ Database already connected');
      return;
    }

    try {
      const mongoURI = process.env.MONGODB_URI as string;
      
      if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const conn = await mongoose.connect(mongoURI);
      this.connection = conn.connection;
      this.isConnected = true;

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events
      this.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      this.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.close();
      this.isConnected = false;
      console.log('📝 MongoDB connection closed');
    }
  }

  getConnection(): mongoose.Connection | null {
    return this.connection;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.connection?.readyState === 1;
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnectionActive()) {
      await this.connect();
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; details: any }> {
    if (!this.connection) {
      return {
        status: 'disconnected',
        details: { message: 'No database connection' }
      };
    }

    try {
      // Ping the database
      await this.connection?.db?.admin()?.ping();
      return {
        status: 'healthy',
        details: {
          host: this.connection.host,
          port: this.connection.port,
          name: this.connection.name,
          readyState: this.connection.readyState
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: (error as Error).message }
      };
    }
  }
}

// Configuration Manager Singleton
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: Map<string, any>;

  private constructor() {
    this.config = new Map();
    this.loadConfiguration();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadConfiguration(): void {
    // Load environment variables and default configurations
    this.config.set('PORT', process.env.PORT || 5001);
    this.config.set('NODE_ENV', process.env.NODE_ENV || 'development');
    this.config.set('MONGODB_URI', process.env.MONGODB_URI || '');
    this.config.set('JWT_SECRET', process.env.JWT_SECRET || 'your-secret-key');
    this.config.set('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN || '7d');
    
    // Email configuration
    this.config.set('EMAIL_SERVICE', process.env.EMAIL_SERVICE || 'gmail');
    this.config.set('EMAIL_USER', process.env.EMAIL_USER || '');
    this.config.set('EMAIL_PASS', process.env.EMAIL_PASS || '');
    
    // File upload configuration
    this.config.set('UPLOAD_MAX_SIZE', process.env.UPLOAD_MAX_SIZE || '5MB');
    this.config.set('UPLOAD_PATH', process.env.UPLOAD_PATH || './uploads');
    
    // Security configuration
    this.config.set('BCRYPT_ROUNDS', parseInt(process.env.BCRYPT_ROUNDS || '12'));
    this.config.set('RATE_LIMIT_WINDOW', parseInt(process.env.RATE_LIMIT_WINDOW || '900000')); // 15 minutes
    this.config.set('RATE_LIMIT_MAX', parseInt(process.env.RATE_LIMIT_MAX || '100'));
    
    // Business logic configuration
    this.config.set('DEFAULT_CONSULTATION_FEE', 50);
    this.config.set('MAX_APPOINTMENTS_PER_DAY', 10);
    this.config.set('APPOINTMENT_SLOTS', ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']);
    
    // Notification settings
    this.config.set('NOTIFICATION_EMAIL_ENABLED', process.env.NOTIFICATION_EMAIL_ENABLED === 'true');
    this.config.set('NOTIFICATION_PUSH_ENABLED', process.env.NOTIFICATION_PUSH_ENABLED === 'true');
    this.config.set('NOTIFICATION_SMS_ENABLED', process.env.NOTIFICATION_SMS_ENABLED === 'false');

    console.log('⚙️ Configuration loaded');
  }

  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  getAll(): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    this.config.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Get database configuration
  getDatabaseConfig(): {
    uri: string;
    options: mongoose.ConnectOptions;
  } {
    return {
      uri: this.get('MONGODB_URI'),
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    };
  }

  // Get JWT configuration
  getJWTConfig(): {
    secret: string;
    expiresIn: string;
    algorithm: string;
  } {
    return {
      secret: this.get('JWT_SECRET'),
      expiresIn: this.get('JWT_EXPIRES_IN'),
      algorithm: 'HS256'
    };
  }

  // Get email configuration
  getEmailConfig(): {
    service: string;
    user: string;
    pass: string;
    enabled: boolean;
  } {
    return {
      service: this.get('EMAIL_SERVICE'),
      user: this.get('EMAIL_USER'),
      pass: this.get('EMAIL_PASS'),
      enabled: this.get('NOTIFICATION_EMAIL_ENABLED')
    };
  }

  // Get security configuration
  getSecurityConfig(): {
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
  } {
    return {
      bcryptRounds: this.get('BCRYPT_ROUNDS'),
      rateLimitWindow: this.get('RATE_LIMIT_WINDOW'),
      rateLimitMax: this.get('RATE_LIMIT_MAX')
    };
  }

  // Get business configuration
  getBusinessConfig(): {
    defaultConsultationFee: number;
    maxAppointmentsPerDay: number;
    appointmentSlots: string[];
  } {
    return {
      defaultConsultationFee: this.get('DEFAULT_CONSULTATION_FEE'),
      maxAppointmentsPerDay: this.get('MAX_APPOINTMENTS_PER_DAY'),
      appointmentSlots: this.get('APPOINTMENT_SLOTS')
    };
  }

  // Validate required configuration
  validateConfiguration(): { isValid: boolean; missingKeys: string[] } {
    const requiredKeys = [
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    const missingKeys = requiredKeys.filter(key => !this.get(key) || this.get(key) === '');

    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }

  // Reload configuration (useful for hot reloading)
  reload(): void {
    this.config.clear();
    this.loadConfiguration();
    console.log('🔄 Configuration reloaded');
  }

  // Get environment-specific settings
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
}

// Application Context Singleton (manages global app state)
export class ApplicationContext {
  private static instance: ApplicationContext;
  private dbConnection: DatabaseConnection;
  private configManager: ConfigurationManager;
  private isInitialized: boolean = false;

  private constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
    this.configManager = ConfigurationManager.getInstance();
  }

  static getInstance(): ApplicationContext {
    if (!ApplicationContext.instance) {
      ApplicationContext.instance = new ApplicationContext();
    }
    return ApplicationContext.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚡ Application context already initialized');
      return;
    }

    try {
      // Validate configuration
      const configValidation = this.configManager.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Missing required configuration: ${configValidation.missingKeys.join(', ')}`);
      }

      // Initialize database connection
      await this.dbConnection.connect();

      this.isInitialized = true;
      console.log('🚀 Application context initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application context:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.dbConnection.disconnect();
      this.isInitialized = false;
      console.log('🛑 Application context shutdown complete');
    } catch (error) {
      console.error('❌ Error during application shutdown:', error);
      throw error;
    }
  }

  getDatabaseConnection(): DatabaseConnection {
    return this.dbConnection;
  }

  getConfiguration(): ConfigurationManager {
    return this.configManager;
  }

  isReady(): boolean {
    return this.isInitialized && this.dbConnection.isConnectionActive();
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      database: any;
      configuration: any;
      uptime: number;
    }
  }> {
    const dbHealth = await this.dbConnection.healthCheck();
    const configValidation = this.configManager.validateConfiguration();

    const isHealthy = this.isReady() && 
                     dbHealth.status === 'healthy' && 
                     configValidation.isValid;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        database: dbHealth,
        configuration: {
          isValid: configValidation.isValid,
          missingKeys: configValidation.missingKeys,
          environment: this.configManager.get('NODE_ENV')
        },
        uptime: process.uptime()
      }
    };
  }
}

// Export singleton instances for easy access
export const dbConnection = DatabaseConnection.getInstance();
export const configManager = ConfigurationManager.getInstance();
export const appContext = ApplicationContext.getInstance();