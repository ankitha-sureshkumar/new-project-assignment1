"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContext = exports.configManager = exports.dbConnection = exports.ApplicationContext = exports.ConfigurationManager = exports.DatabaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (this.isConnected) {
            console.log('⚡ Database already connected');
            return;
        }
        try {
            const mongoURI = process.env.MONGODB_URI;
            if (!mongoURI) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }
            const conn = await mongoose_1.default.connect(mongoURI);
            this.connection = conn.connection;
            this.isConnected = true;
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
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
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        }
        catch (error) {
            console.error('❌ Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (this.connection && this.isConnected) {
            await this.connection.close();
            this.isConnected = false;
            console.log('📝 MongoDB connection closed');
        }
    }
    getConnection() {
        return this.connection;
    }
    isConnectionActive() {
        return this.isConnected && this.connection?.readyState === 1;
    }
    async ensureConnection() {
        if (!this.isConnectionActive()) {
            await this.connect();
        }
    }
    async healthCheck() {
        if (!this.connection) {
            return {
                status: 'disconnected',
                details: { message: 'No database connection' }
            };
        }
        try {
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
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: { error: error.message }
            };
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
class ConfigurationManager {
    constructor() {
        this.config = new Map();
        this.loadConfiguration();
    }
    static getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }
    loadConfiguration() {
        this.config.set('PORT', process.env.PORT || 5001);
        this.config.set('NODE_ENV', process.env.NODE_ENV || 'development');
        this.config.set('MONGODB_URI', process.env.MONGODB_URI || '');
        this.config.set('JWT_SECRET', process.env.JWT_SECRET || 'your-secret-key');
        this.config.set('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN || '7d');
        this.config.set('EMAIL_SERVICE', process.env.EMAIL_SERVICE || 'gmail');
        this.config.set('EMAIL_USER', process.env.EMAIL_USER || '');
        this.config.set('EMAIL_PASS', process.env.EMAIL_PASS || '');
        this.config.set('UPLOAD_MAX_SIZE', process.env.UPLOAD_MAX_SIZE || '5MB');
        this.config.set('UPLOAD_PATH', process.env.UPLOAD_PATH || './uploads');
        this.config.set('BCRYPT_ROUNDS', parseInt(process.env.BCRYPT_ROUNDS || '12'));
        this.config.set('RATE_LIMIT_WINDOW', parseInt(process.env.RATE_LIMIT_WINDOW || '900000'));
        this.config.set('RATE_LIMIT_MAX', parseInt(process.env.RATE_LIMIT_MAX || '100'));
        this.config.set('DEFAULT_CONSULTATION_FEE', 50);
        this.config.set('MAX_APPOINTMENTS_PER_DAY', 10);
        this.config.set('APPOINTMENT_SLOTS', ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']);
        this.config.set('NOTIFICATION_EMAIL_ENABLED', process.env.NOTIFICATION_EMAIL_ENABLED === 'true');
        this.config.set('NOTIFICATION_PUSH_ENABLED', process.env.NOTIFICATION_PUSH_ENABLED === 'true');
        this.config.set('NOTIFICATION_SMS_ENABLED', process.env.NOTIFICATION_SMS_ENABLED === 'false');
        console.log('⚙️ Configuration loaded');
    }
    get(key) {
        return this.config.get(key);
    }
    set(key, value) {
        this.config.set(key, value);
    }
    has(key) {
        return this.config.has(key);
    }
    getAll() {
        const result = {};
        this.config.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    getDatabaseConfig() {
        return {
            uri: this.get('MONGODB_URI'),
            options: {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            }
        };
    }
    getJWTConfig() {
        return {
            secret: this.get('JWT_SECRET'),
            expiresIn: this.get('JWT_EXPIRES_IN'),
            algorithm: 'HS256'
        };
    }
    getEmailConfig() {
        return {
            service: this.get('EMAIL_SERVICE'),
            user: this.get('EMAIL_USER'),
            pass: this.get('EMAIL_PASS'),
            enabled: this.get('NOTIFICATION_EMAIL_ENABLED')
        };
    }
    getSecurityConfig() {
        return {
            bcryptRounds: this.get('BCRYPT_ROUNDS'),
            rateLimitWindow: this.get('RATE_LIMIT_WINDOW'),
            rateLimitMax: this.get('RATE_LIMIT_MAX')
        };
    }
    getBusinessConfig() {
        return {
            defaultConsultationFee: this.get('DEFAULT_CONSULTATION_FEE'),
            maxAppointmentsPerDay: this.get('MAX_APPOINTMENTS_PER_DAY'),
            appointmentSlots: this.get('APPOINTMENT_SLOTS')
        };
    }
    validateConfiguration() {
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
    reload() {
        this.config.clear();
        this.loadConfiguration();
        console.log('🔄 Configuration reloaded');
    }
    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }
    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }
    isTest() {
        return this.get('NODE_ENV') === 'test';
    }
}
exports.ConfigurationManager = ConfigurationManager;
class ApplicationContext {
    constructor() {
        this.isInitialized = false;
        this.dbConnection = DatabaseConnection.getInstance();
        this.configManager = ConfigurationManager.getInstance();
    }
    static getInstance() {
        if (!ApplicationContext.instance) {
            ApplicationContext.instance = new ApplicationContext();
        }
        return ApplicationContext.instance;
    }
    async initialize() {
        if (this.isInitialized) {
            console.log('⚡ Application context already initialized');
            return;
        }
        try {
            const configValidation = this.configManager.validateConfiguration();
            if (!configValidation.isValid) {
                throw new Error(`Missing required configuration: ${configValidation.missingKeys.join(', ')}`);
            }
            await this.dbConnection.connect();
            this.isInitialized = true;
            console.log('🚀 Application context initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize application context:', error);
            throw error;
        }
    }
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            await this.dbConnection.disconnect();
            this.isInitialized = false;
            console.log('🛑 Application context shutdown complete');
        }
        catch (error) {
            console.error('❌ Error during application shutdown:', error);
            throw error;
        }
    }
    getDatabaseConnection() {
        return this.dbConnection;
    }
    getConfiguration() {
        return this.configManager;
    }
    isReady() {
        return this.isInitialized && this.dbConnection.isConnectionActive();
    }
    async healthCheck() {
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
exports.ApplicationContext = ApplicationContext;
exports.dbConnection = DatabaseConnection.getInstance();
exports.configManager = ConfigurationManager.getInstance();
exports.appContext = ApplicationContext.getInstance();
//# sourceMappingURL=Singletons.js.map