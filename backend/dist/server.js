"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const Singletons_1 = require("./patterns/Singletons");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const veterinarians_1 = __importDefault(require("./routes/veterinarians"));
const admin_1 = __importDefault(require("./routes/admin"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});
exports.io = io;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use((0, cors_1.default)({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Oggy Pet Hospital API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/veterinarians', veterinarians_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/pets', petRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/availability', availabilityRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 User connected: ${socket.id}`);
    }
    socket.on('join', (userId) => {
        socket.join(userId);
        if (process.env.NODE_ENV === 'development') {
            console.log(`👤 User ${userId} joined their room`);
        }
    });
    socket.on('disconnect', () => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔌 User disconnected: ${socket.id}`);
        }
    });
});
global.socketIO = io;
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((error) => error.message);
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        res.status(400).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        });
        return;
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
        return;
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});
const PORT = process.env.PORT || 5000;
(async () => {
    try {
        const appContext = Singletons_1.ApplicationContext.getInstance();
        await appContext.initialize();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Socket.IO ready for real-time connections`);
        });
    }
    catch (err) {
        console.error('❌ Failed to initialize application context. Server not started.', err);
        process.exit(1);
    }
})();
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
//# sourceMappingURL=server.js.map