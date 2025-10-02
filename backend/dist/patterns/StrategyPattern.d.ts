export interface DashboardData {
    userType: string;
    summary: any;
    quickActions: string[];
    notifications: any[];
    [key: string]: any;
}
export interface IDashboardStrategy {
    generateDashboard(userId: string, userRole: 'user' | 'veterinarian'): Promise<DashboardData>;
    getQuickActions(userRole: 'user' | 'veterinarian', userStatus?: any): string[];
    formatSummaryData(rawData: any): any;
}
export declare class PetParentDashboardStrategy implements IDashboardStrategy {
    generateDashboard(userId: string, userRole: 'user'): Promise<DashboardData>;
    getQuickActions(userRole: 'user', userData?: any): string[];
    formatSummaryData(rawData: any): any;
    private fetchUserData;
    private fetchUserAppointments;
    private fetchUserPets;
    private fetchUserNotifications;
    private getHealthReminders;
}
export declare class VeterinarianDashboardStrategy implements IDashboardStrategy {
    generateDashboard(userId: string, userRole: 'veterinarian'): Promise<DashboardData>;
    getQuickActions(userRole: 'veterinarian', vetData?: any): string[];
    formatSummaryData(rawData: any): any;
    private fetchVeterinarianData;
    private fetchVetAppointments;
    private fetchEarningsData;
    private fetchVetNotifications;
    private getRecentPatients;
    private isToday;
}
export declare class DashboardService {
    private strategy;
    constructor(strategy: IDashboardStrategy);
    setStrategy(strategy: IDashboardStrategy): void;
    generateDashboard(userId: string, userRole: 'user' | 'veterinarian'): Promise<DashboardData>;
}
export interface CostCalculation {
    baseCost: number;
    additionalFees: {
        [key: string]: number;
    };
    discounts: {
        [key: string]: number;
    };
    totalCost: number;
    breakdown: string[];
}
export interface ICostCalculationStrategy {
    calculateCost(basePrice: number, factors: any): CostCalculation;
    applyDiscounts(baseCost: number, discountFactors: any): number;
    addAdditionalFees(baseCost: number, feeFactors: any): number;
}
export declare class StandardConsultationPricing implements ICostCalculationStrategy {
    calculateCost(basePrice: number, factors: {
        isEmergency?: boolean;
        timeOfDay?: 'morning' | 'afternoon' | 'evening';
        duration?: number;
        followUp?: boolean;
        userDiscounts?: string[];
    }): CostCalculation;
    applyDiscounts(baseCost: number, discountFactors: any): number;
    addAdditionalFees(baseCost: number, feeFactors: any): number;
}
export declare class SurgeryPricing implements ICostCalculationStrategy {
    calculateCost(basePrice: number, factors: {
        complexity?: 'minor' | 'major' | 'critical';
        anesthesia?: boolean;
        hospitalization?: number;
        postOpCare?: boolean;
        insuranceCoverage?: number;
    }): CostCalculation;
    applyDiscounts(baseCost: number, discountFactors: any): number;
    addAdditionalFees(baseCost: number, feeFactors: any): number;
}
export declare class PricingService {
    private strategy;
    constructor(strategy: ICostCalculationStrategy);
    setStrategy(strategy: ICostCalculationStrategy): void;
    calculatePrice(basePrice: number, factors: any): CostCalculation;
}
export declare class StrategyFactory {
    static createDashboardStrategy(userRole: 'user' | 'veterinarian'): IDashboardStrategy;
    static createPricingStrategy(serviceType: 'consultation' | 'surgery'): ICostCalculationStrategy;
}
//# sourceMappingURL=StrategyPattern.d.ts.map