import mongoose from 'mongoose';
export declare class DatabaseConnection {
    private static instance;
    private connection;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnection(): mongoose.Connection | null;
    isConnectionActive(): boolean;
    ensureConnection(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
export declare class ConfigurationManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigurationManager;
    private loadConfiguration;
    get(key: string): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    getAll(): {
        [key: string]: any;
    };
    getDatabaseConfig(): {
        uri: string;
        options: mongoose.ConnectOptions;
    };
    getJWTConfig(): {
        secret: string;
        expiresIn: string;
        algorithm: string;
    };
    getEmailConfig(): {
        service: string;
        user: string;
        pass: string;
        enabled: boolean;
    };
    getSecurityConfig(): {
        bcryptRounds: number;
        rateLimitWindow: number;
        rateLimitMax: number;
    };
    getBusinessConfig(): {
        defaultConsultationFee: number;
        maxAppointmentsPerDay: number;
        appointmentSlots: string[];
    };
    validateConfiguration(): {
        isValid: boolean;
        missingKeys: string[];
    };
    reload(): void;
    isDevelopment(): boolean;
    isProduction(): boolean;
    isTest(): boolean;
}
export declare class ApplicationContext {
    private static instance;
    private dbConnection;
    private configManager;
    private isInitialized;
    private constructor();
    static getInstance(): ApplicationContext;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getDatabaseConnection(): DatabaseConnection;
    getConfiguration(): ConfigurationManager;
    isReady(): boolean;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: {
            database: any;
            configuration: any;
            uptime: number;
        };
    }>;
}
export declare const dbConnection: DatabaseConnection;
export declare const configManager: ConfigurationManager;
export declare const appContext: ApplicationContext;
//# sourceMappingURL=Singletons.d.ts.map