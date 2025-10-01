"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetHospitalServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const Singletons_1 = require("../patterns/Singletons");
const NotificationObserver_1 = require("../patterns/NotificationObserver");
const DashboardFacade_1 = require("../patterns/DashboardFacade");
const auth_1 = __importDefault(require("../routes/auth"));
const users_1 = __importDefault(require("../routes/users"));
const veterinarians_1 = __importDefault(require("../routes/refactored/veterinarians"));
const admin_1 = __importDefault(require("../routes/admin"));
class PetHospitalServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.dashboardFacade = new DashboardFacade_1.DashboardFacade();
    }
    setupSecurity() {
        const securityConfig = Singletons_1.configManager.getSecurityConfig();
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: Singletons_1.configManager.isProduction(),
            hsts: Singletons_1.configManager.isProduction()
        }));
        this.app.use((0, cors_1.default)({
            origin: Singletons_1.configManager.isDevelopment()
                ? ['http://localhost:3000', 'http://localhost:3001']
                : Singletons_1.configManager.get('FRONTEND_URL') || 'https://your-frontend-domain.com',
            credentials: true
        }));
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: securityConfig.rateLimitWindow,
            max: securityConfig.rateLimitMax,
            message: {
                success: false,
                message: 'Too many requests from this IP, please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false
        }));
        console.log(`🔒 Security middleware configured for ${Singletons_1.configManager.get('NODE_ENV')} environment`);
    }
    setupMiddleware() {
        this.app.use(express_1.default.json({
            limit: Singletons_1.configManager.get('UPLOAD_MAX_SIZE') || '5MB'
        }));
        this.app.use(express_1.default.urlencoded({
            extended: true,
            limit: Singletons_1.configManager.get('UPLOAD_MAX_SIZE') || '5MB'
        }));
        const uploadsPath = path_1.default.join(__dirname, '../../uploads');
        this.app.use('/uploads', express_1.default.static(uploadsPath));
        if (Singletons_1.configManager.isDevelopment()) {
            this.app.use((req, res, next) => {
                console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
                next();
            });
        }
        console.log('⚙️ Express middleware configured');
    }
    setupRoutes() {
        const apiVersion = '/api/v1';
        this.app.use(`${apiVersion}/auth`, auth_1.default);
        this.app.use(`${apiVersion}/users`, users_1.default);
        this.app.use(`${apiVersion}/veterinarians`, veterinarians_1.default);
        this.app.use(`${apiVersion}/admin`, admin_1.default);
        this.app.get('/health', async (req, res) => {
            try {
                const healthStatus = await Singletons_1.appContext.healthCheck();
                res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
                    success: healthStatus.status === 'healthy',
                    status: healthStatus.status,
                    timestamp: new Date().toISOString(),
                    details: healthStatus.details
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    status: 'error',
                    message: 'Health check failed',
                    timestamp: new Date().toISOString()
                });
            }
        });
        this.app.get('/system-info', async (req, res) => {
            try {
                res.json({
                    success: true,
                    data: {
                        environment: Singletons_1.configManager.get('NODE_ENV'),
                        version: process.env.npm_package_version || '1.0.0',
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        platform: process.platform,
                        nodeVersion: process.version,
                        configuration: {
                            port: Singletons_1.configManager.get('PORT'),
                            database: Singletons_1.configManager.getDatabaseConfig().uri ? 'Connected' : 'Not configured',
                            notifications: {
                                email: Singletons_1.configManager.get('NOTIFICATION_EMAIL_ENABLED'),
                                push: Singletons_1.configManager.get('NOTIFICATION_PUSH_ENABLED')
                            }
                        }
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get system information'
                });
            }
        });
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
                timestamp: new Date().toISOString()
            });
        });
        console.log('🛣️ API routes configured');
    }
    setupErrorHandling() {
        this.app.use((error, req, res, next) => {
            console.error('🚨 Global Error Handler:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation Error',
                    errors: Object.values(error.errors).map((err) => err.message)
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate entry - resource already exists'
                });
            }
            const statusCode = error.statusCode || error.status || 500;
            const message = Singletons_1.configManager.isProduction()
                ? 'Internal Server Error'
                : error.message || 'Something went wrong';
            return res.status(statusCode).json({
                success: false,
                message,
                timestamp: new Date().toISOString(),
                ...(Singletons_1.configManager.isDevelopment() && { stack: error.stack })
            });
        });
        console.log('🚨 Error handling configured');
    }
    async initializeServices() {
        console.log('🚀 Initializing application services...');
        try {
            await Singletons_1.appContext.initialize();
            console.log('📧 Setting up notification system...');
            console.log('📊 Setting up dashboard services...');
            console.log('✅ All services initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize services:', error);
            throw error;
        }
    }
    async start() {
        try {
            console.log('🎯 Starting Pet Hospital Server...');
            console.log(`📝 Environment: ${Singletons_1.configManager.get('NODE_ENV')}`);
            await this.initializeServices();
            this.setupSecurity();
            this.setupMiddleware();
            this.setupRoutes();
            this.setupErrorHandling();
            const port = Singletons_1.configManager.get('PORT');
            this.app.listen(port, () => {
                console.log('\n🎉 Pet Hospital Server is running!');
                console.log(`📡 Server listening on port ${port}`);
                console.log(`🌐 Environment: ${Singletons_1.configManager.get('NODE_ENV')}`);
                console.log(`🗄️ Database: ${Singletons_1.dbConnection.isConnectionActive() ? 'Connected' : 'Disconnected'}`);
                console.log(`📧 Notifications: ${Singletons_1.configManager.get('NOTIFICATION_EMAIL_ENABLED') ? 'Enabled' : 'Disabled'}`);
                console.log(`🔒 Security: Enhanced middleware active`);
                console.log(`⚡ Health Check: http://localhost:${port}/health`);
                console.log('='.repeat(50));
                if (Singletons_1.configManager.isDevelopment()) {
                    console.log('\n🛠️ Development Mode Features:');
                    console.log(`📊 System Info: http://localhost:${port}/system-info`);
                    console.log(`🔍 Debug logging: Active`);
                }
            });
        }
        catch (error) {
            console.error('💥 Failed to start server:', error);
            await this.shutdown();
            process.exit(1);
        }
    }
    async shutdown() {
        console.log('\n🛑 Shutting down Pet Hospital Server...');
        try {
            await Singletons_1.appContext.shutdown();
            console.log('✅ Server shutdown complete');
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
    getApp() {
        return this.app;
    }
}
exports.PetHospitalServer = PetHospitalServer;
const server = new PetHospitalServer();
process.on('SIGTERM', async () => {
    console.log('\n📡 SIGTERM received');
    await server.shutdown();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('\n📡 SIGINT received (Ctrl+C)');
    await server.shutdown();
    process.exit(0);
});
process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await server.shutdown();
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await server.shutdown();
    process.exit(1);
});
if (require.main === module) {
    server.start().catch((error) => {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    });
}
exports.default = server;
//# sourceMappingURL=server.js.map