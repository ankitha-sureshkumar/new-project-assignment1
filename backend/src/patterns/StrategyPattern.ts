/**
 * Strategy Pattern Implementation
 * Different strategies for dashboard rendering and cost calculation
 */

// ===== DASHBOARD STRATEGY PATTERN =====

export interface DashboardData {
  userType: string;
  summary: any;
  quickActions: string[];
  notifications: any[];
  [key: string]: any;
}

// Strategy interface for dashboard rendering
export interface IDashboardStrategy {
  generateDashboard(userId: string, userRole: 'user' | 'veterinarian'): Promise<DashboardData>;
  getQuickActions(userRole: 'user' | 'veterinarian', userStatus?: any): string[];
  formatSummaryData(rawData: any): any;
}

// Concrete strategy for User (Pet Parent) dashboard
export class PetParentDashboardStrategy implements IDashboardStrategy {
  async generateDashboard(userId: string, userRole: 'user'): Promise<DashboardData> {
    // Fetch user-specific data
    const userData = await this.fetchUserData(userId);
    const appointments = await this.fetchUserAppointments(userId);
    const pets = await this.fetchUserPets(userId);
    const notifications = await this.fetchUserNotifications(userId);

    return {
      userType: 'Pet Parent',
      summary: this.formatSummaryData({
        totalPets: pets.length,
        upcomingAppointments: appointments.filter(a => a.status === 'APPROVED' && new Date(a.date) > new Date()).length,
        completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
        recentActivity: appointments.slice(0, 5)
      }),
      quickActions: this.getQuickActions(userRole, userData),
      notifications,
      pets: pets.slice(0, 3), // Show top 3 pets
      upcomingAppointments: appointments
        .filter(a => a.status === 'APPROVED' && new Date(a.date) > new Date())
        .slice(0, 3),
      healthReminders: await this.getHealthReminders(pets)
    };
  }

  getQuickActions(userRole: 'user', userData?: any): string[] {
    const baseActions = [
      'Schedule New Appointment',
      'View Medical Records',
      'Update Pet Information',
      'Emergency Contacts'
    ];

    // Add conditional actions based on user status
    if (userData?.pets?.length === 0) {
      baseActions.unshift('Add Your First Pet');
    }

    if (userData?.hasUpcomingAppointments) {
      baseActions.push('View Upcoming Appointments');
    }

    return baseActions;
  }

  formatSummaryData(rawData: any): any {
    return {
      totalPets: {
        value: rawData.totalPets || 0,
        label: 'Registered Pets',
        icon: 'pets',
        color: 'blue'
      },
      upcomingAppointments: {
        value: rawData.upcomingAppointments || 0,
        label: 'Upcoming Visits',
        icon: 'calendar',
        color: 'green'
      },
      completedAppointments: {
        value: rawData.completedAppointments || 0,
        label: 'Completed Visits',
        icon: 'check-circle',
        color: 'purple'
      }
    };
  }

  // Private helper methods
  private async fetchUserData(userId: string): Promise<any> {
    // Implementation would query User model
    return { pets: [], hasUpcomingAppointments: false };
  }

  private async fetchUserAppointments(userId: string): Promise<any[]> {
    const { CachedAppointmentRepository } = await import('../repositories/decorators/CachedAppointmentRepository');
    const repo = new CachedAppointmentRepository();
    return repo.findByUser(userId);
  }

  private async fetchUserPets(userId: string): Promise<any[]> {
    const { CachedPetRepository } = await import('../repositories/decorators/CachedPetRepository');
    const repo = new CachedPetRepository();
    return repo.listByOwner(userId);
  }

  private async fetchUserNotifications(userId: string): Promise<any[]> {
    try {
      const Notification = (await import('../models/Notification')).default;
      const notifs = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10);
      return notifs.map((n: any) => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt,
        read: n.read
      }));
    } catch (e) {
      return [];
    }
  }

  private async getHealthReminders(pets: any[]): Promise<any[]> {
    // Generate health reminders based on pet data
    return [];
  }
}

// Concrete strategy for Veterinarian dashboard
export class VeterinarianDashboardStrategy implements IDashboardStrategy {
  async generateDashboard(userId: string, userRole: 'veterinarian'): Promise<DashboardData> {
    // Fetch veterinarian-specific data
    const vetData = await this.fetchVeterinarianData(userId);
    const appointments = await this.fetchVetAppointments(userId);
    const earnings = await this.fetchEarningsData(userId);
    const notifications = await this.fetchVetNotifications(userId);

    return {
      userType: 'Veterinarian',
      approvalStatus: vetData.approvalStatus,
      summary: this.formatSummaryData({
        todaysAppointments: appointments.filter(a => this.isToday(a.date)).length,
        upcomingAppointments: appointments.filter(a => a.status === 'APPROVED' && new Date(a.date) > new Date()).length,
        completedToday: appointments.filter(a => a.status === 'COMPLETED' && this.isToday(a.date)).length,
        totalEarnings: earnings.total,
        monthlyEarnings: earnings.thisMonth,
        averageRating: vetData.rating || 0
      }),
      quickActions: this.getQuickActions(userRole, vetData),
      notifications,
      todaysSchedule: appointments.filter(a => this.isToday(a.date)),
      earnings: vetData.isApproved ? earnings : null,
      patients: await this.getRecentPatients(userId)
    };
  }

  getQuickActions(userRole: 'veterinarian', vetData?: any): string[] {
    if (!vetData?.isApproved) {
      return [
        'Complete Profile Setup',
        'Upload Required Documents',
        'Contact Administrator',
        'View Application Status'
      ];
    }

    const approvedActions = [
      'View Today\'s Schedule',
      'Manage Appointments',
      'Update Availability',
      'Patient Records',
      'Prescription History'
    ];

    if (vetData?.hasNewAppointmentRequests) {
      approvedActions.unshift('Review New Requests');
    }

    return approvedActions;
  }

  formatSummaryData(rawData: any): any {
    return {
      todaysAppointments: {
        value: rawData.todaysAppointments || 0,
        label: 'Today\'s Appointments',
        icon: 'calendar-day',
        color: 'blue'
      },
      completedToday: {
        value: rawData.completedToday || 0,
        label: 'Completed Today',
        icon: 'check-circle',
        color: 'green'
      },
      monthlyEarnings: {
        value: `$${rawData.monthlyEarnings || 0}`,
        label: 'This Month\'s Earnings',
        icon: 'dollar-sign',
        color: 'yellow'
      },
      averageRating: {
        value: rawData.averageRating || 0,
        label: 'Average Rating',
        icon: 'star',
        color: 'purple',
        suffix: '/5'
      }
    };
  }

  // Private helper methods
  private async fetchVeterinarianData(vetId: string): Promise<any> {
    // Implementation would query Veterinarian model
    return { isApproved: true, rating: 4.5, approvalStatus: 'approved' };
  }

  private async fetchVetAppointments(vetId: string): Promise<any[]> {
    const { CachedAppointmentRepository } = await import('../repositories/decorators/CachedAppointmentRepository');
    const repo = new CachedAppointmentRepository();
    return repo.findByVeterinarian(vetId);
  }

  private async fetchEarningsData(vetId: string): Promise<any> {
    const Appointment = (await import('../models/Appointment')).default;
    const all = await Appointment.find({ veterinarian: vetId, status: 'COMPLETED' }).select('date consultationFee');
    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = all.reduce((s: number, a: any) => s + (a.consultationFee || 0), 0);
    const thisMonth = all.filter((a: any) => a.date >= startOfMonth && a.date <= now).reduce((s: number, a: any) => s + (a.consultationFee || 0), 0);
    const thisWeek = all.filter((a: any) => a.date >= startOfWeek && a.date <= now).reduce((s: number, a: any) => s + (a.consultationFee || 0), 0);

    return { total, thisMonth, thisWeek };
  }

  private async fetchVetNotifications(vetId: string): Promise<any[]> {
    // Implementation would query Notification model
    return [];
  }

  private async getRecentPatients(vetId: string): Promise<any[]> {
    // Implementation would query recent patients
    return [];
  }

  private isToday(date: Date | string): boolean {
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
  }
}

// Context class that uses the strategy
export class DashboardService {
  private strategy: IDashboardStrategy;

  constructor(strategy: IDashboardStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IDashboardStrategy): void {
    this.strategy = strategy;
  }

  async generateDashboard(userId: string, userRole: 'user' | 'veterinarian'): Promise<DashboardData> {
    return await this.strategy.generateDashboard(userId, userRole);
  }
}

// ===== COST CALCULATION STRATEGY PATTERN =====

export interface CostCalculation {
  baseCost: number;
  additionalFees: { [key: string]: number };
  discounts: { [key: string]: number };
  totalCost: number;
  breakdown: string[];
}

// Strategy interface for cost calculation
export interface ICostCalculationStrategy {
  calculateCost(basePrice: number, factors: any): CostCalculation;
  applyDiscounts(baseCost: number, discountFactors: any): number;
  addAdditionalFees(baseCost: number, feeFactors: any): number;
}

// Concrete strategy for standard consultation pricing
export class StandardConsultationPricing implements ICostCalculationStrategy {
  calculateCost(basePrice: number, factors: {
    isEmergency?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    duration?: number; // in minutes
    followUp?: boolean;
    userDiscounts?: string[];
  }): CostCalculation {
    let totalCost = basePrice;
    const additionalFees: { [key: string]: number } = {};
    const discounts: { [key: string]: number } = {};
    const breakdown: string[] = [`Base consultation: $${basePrice}`];

    // Apply additional fees
    if (factors.isEmergency) {
      const emergencyFee = basePrice * 0.5; // 50% surcharge
      additionalFees['Emergency Fee'] = emergencyFee;
      totalCost += emergencyFee;
      breakdown.push(`Emergency surcharge (50%): $${emergencyFee}`);
    }

    if (factors.timeOfDay === 'evening') {
      const eveningFee = 25;
      additionalFees['Evening Hours'] = eveningFee;
      totalCost += eveningFee;
      breakdown.push(`Evening hours fee: $${eveningFee}`);
    }

    if (factors.duration && factors.duration > 30) {
      const extendedTimeFee = Math.ceil((factors.duration - 30) / 15) * 15;
      additionalFees['Extended Time'] = extendedTimeFee;
      totalCost += extendedTimeFee;
      breakdown.push(`Extended consultation time: $${extendedTimeFee}`);
    }

    // Apply discounts
    if (factors.followUp) {
      const followUpDiscount = basePrice * 0.2; // 20% discount
      discounts['Follow-up Discount'] = followUpDiscount;
      totalCost -= followUpDiscount;
      breakdown.push(`Follow-up discount (20%): -$${followUpDiscount}`);
    }

    if (factors.userDiscounts?.includes('senior')) {
      const seniorDiscount = basePrice * 0.15; // 15% discount
      discounts['Senior Discount'] = seniorDiscount;
      totalCost -= seniorDiscount;
      breakdown.push(`Senior discount (15%): -$${seniorDiscount}`);
    }

    return {
      baseCost: basePrice,
      additionalFees,
      discounts,
      totalCost: Math.max(totalCost, basePrice * 0.5), // Minimum 50% of base price
      breakdown
    };
  }

  applyDiscounts(baseCost: number, discountFactors: any): number {
    // Implementation for applying discounts
    return baseCost;
  }

  addAdditionalFees(baseCost: number, feeFactors: any): number {
    // Implementation for adding fees
    return baseCost;
  }
}

// Concrete strategy for surgery pricing
export class SurgeryPricing implements ICostCalculationStrategy {
  calculateCost(basePrice: number, factors: {
    complexity?: 'minor' | 'major' | 'critical';
    anesthesia?: boolean;
    hospitalization?: number; // days
    postOpCare?: boolean;
    insuranceCoverage?: number; // percentage
  }): CostCalculation {
    let totalCost = basePrice;
    const additionalFees: { [key: string]: number } = {};
    const discounts: { [key: string]: number } = {};
    const breakdown: string[] = [`Base surgery cost: $${basePrice}`];

    // Apply complexity multiplier
    if (factors.complexity) {
      const multipliers = { minor: 1, major: 1.5, critical: 2.5 };
      const multiplier = multipliers[factors.complexity];
      const complexityFee = basePrice * (multiplier - 1);
      
      if (complexityFee > 0) {
        additionalFees['Complexity Fee'] = complexityFee;
        totalCost += complexityFee;
        breakdown.push(`${factors.complexity} surgery surcharge: $${complexityFee}`);
      }
    }

    // Add anesthesia cost
    if (factors.anesthesia) {
      const anesthesiaFee = 150;
      additionalFees['Anesthesia'] = anesthesiaFee;
      totalCost += anesthesiaFee;
      breakdown.push(`Anesthesia: $${anesthesiaFee}`);
    }

    // Add hospitalization cost
    if (factors.hospitalization && factors.hospitalization > 0) {
      const dailyRate = 75;
      const hospitalizationFee = dailyRate * factors.hospitalization;
      additionalFees['Hospitalization'] = hospitalizationFee;
      totalCost += hospitalizationFee;
      breakdown.push(`Hospitalization (${factors.hospitalization} days): $${hospitalizationFee}`);
    }

    // Add post-operative care
    if (factors.postOpCare) {
      const postOpFee = 100;
      additionalFees['Post-Op Care'] = postOpFee;
      totalCost += postOpFee;
      breakdown.push(`Post-operative care: $${postOpFee}`);
    }

    // Apply insurance discount
    if (factors.insuranceCoverage && factors.insuranceCoverage > 0) {
      const insuranceDiscount = totalCost * (factors.insuranceCoverage / 100);
      discounts['Insurance Coverage'] = insuranceDiscount;
      totalCost -= insuranceDiscount;
      breakdown.push(`Insurance coverage (${factors.insuranceCoverage}%): -$${insuranceDiscount}`);
    }

    return {
      baseCost: basePrice,
      additionalFees,
      discounts,
      totalCost: Math.max(totalCost, 0),
      breakdown
    };
  }

  applyDiscounts(baseCost: number, discountFactors: any): number {
    return baseCost;
  }

  addAdditionalFees(baseCost: number, feeFactors: any): number {
    return baseCost;
  }
}

// Context class for cost calculation
export class PricingService {
  private strategy: ICostCalculationStrategy;

  constructor(strategy: ICostCalculationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ICostCalculationStrategy): void {
    this.strategy = strategy;
  }

  calculatePrice(basePrice: number, factors: any): CostCalculation {
    return this.strategy.calculateCost(basePrice, factors);
  }
}

// Factory for creating appropriate strategies
export class StrategyFactory {
  static createDashboardStrategy(userRole: 'user' | 'veterinarian'): IDashboardStrategy {
    switch (userRole) {
      case 'user':
        return new PetParentDashboardStrategy();
      case 'veterinarian':
        return new VeterinarianDashboardStrategy();
      default:
        throw new Error(`Unknown user role: ${userRole}`);
    }
  }

  static createPricingStrategy(serviceType: 'consultation' | 'surgery'): ICostCalculationStrategy {
    switch (serviceType) {
      case 'consultation':
        return new StandardConsultationPricing();
      case 'surgery':
        return new SurgeryPricing();
      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
  }
}

// All classes are already individually exported above
