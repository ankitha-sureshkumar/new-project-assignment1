"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyFactory = exports.PricingService = exports.SurgeryPricing = exports.StandardConsultationPricing = exports.DashboardService = exports.VeterinarianDashboardStrategy = exports.PetParentDashboardStrategy = void 0;
class PetParentDashboardStrategy {
    async generateDashboard(userId, userRole) {
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
            pets: pets.slice(0, 3),
            upcomingAppointments: appointments
                .filter(a => a.status === 'APPROVED' && new Date(a.date) > new Date())
                .slice(0, 3),
            healthReminders: await this.getHealthReminders(pets)
        };
    }
    getQuickActions(userRole, userData) {
        const baseActions = [
            'Schedule New Appointment',
            'View Medical Records',
            'Update Pet Information',
            'Emergency Contacts'
        ];
        if (userData?.pets?.length === 0) {
            baseActions.unshift('Add Your First Pet');
        }
        if (userData?.hasUpcomingAppointments) {
            baseActions.push('View Upcoming Appointments');
        }
        return baseActions;
    }
    formatSummaryData(rawData) {
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
    async fetchUserData(userId) {
        return { pets: [], hasUpcomingAppointments: false };
    }
    async fetchUserAppointments(userId) {
        return [];
    }
    async fetchUserPets(userId) {
        return [];
    }
    async fetchUserNotifications(userId) {
        return [];
    }
    async getHealthReminders(pets) {
        return [];
    }
}
exports.PetParentDashboardStrategy = PetParentDashboardStrategy;
class VeterinarianDashboardStrategy {
    async generateDashboard(userId, userRole) {
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
    getQuickActions(userRole, vetData) {
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
    formatSummaryData(rawData) {
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
    async fetchVeterinarianData(vetId) {
        return { isApproved: true, rating: 4.5, approvalStatus: 'approved' };
    }
    async fetchVetAppointments(vetId) {
        return [];
    }
    async fetchEarningsData(vetId) {
        return { total: 0, thisMonth: 0, thisWeek: 0 };
    }
    async fetchVetNotifications(vetId) {
        return [];
    }
    async getRecentPatients(vetId) {
        return [];
    }
    isToday(date) {
        const today = new Date();
        const compareDate = new Date(date);
        return today.toDateString() === compareDate.toDateString();
    }
}
exports.VeterinarianDashboardStrategy = VeterinarianDashboardStrategy;
class DashboardService {
    constructor(strategy) {
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    async generateDashboard(userId, userRole) {
        return await this.strategy.generateDashboard(userId, userRole);
    }
}
exports.DashboardService = DashboardService;
class StandardConsultationPricing {
    calculateCost(basePrice, factors) {
        let totalCost = basePrice;
        const additionalFees = {};
        const discounts = {};
        const breakdown = [`Base consultation: $${basePrice}`];
        if (factors.isEmergency) {
            const emergencyFee = basePrice * 0.5;
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
        if (factors.followUp) {
            const followUpDiscount = basePrice * 0.2;
            discounts['Follow-up Discount'] = followUpDiscount;
            totalCost -= followUpDiscount;
            breakdown.push(`Follow-up discount (20%): -$${followUpDiscount}`);
        }
        if (factors.userDiscounts?.includes('senior')) {
            const seniorDiscount = basePrice * 0.15;
            discounts['Senior Discount'] = seniorDiscount;
            totalCost -= seniorDiscount;
            breakdown.push(`Senior discount (15%): -$${seniorDiscount}`);
        }
        return {
            baseCost: basePrice,
            additionalFees,
            discounts,
            totalCost: Math.max(totalCost, basePrice * 0.5),
            breakdown
        };
    }
    applyDiscounts(baseCost, discountFactors) {
        return baseCost;
    }
    addAdditionalFees(baseCost, feeFactors) {
        return baseCost;
    }
}
exports.StandardConsultationPricing = StandardConsultationPricing;
class SurgeryPricing {
    calculateCost(basePrice, factors) {
        let totalCost = basePrice;
        const additionalFees = {};
        const discounts = {};
        const breakdown = [`Base surgery cost: $${basePrice}`];
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
        if (factors.anesthesia) {
            const anesthesiaFee = 150;
            additionalFees['Anesthesia'] = anesthesiaFee;
            totalCost += anesthesiaFee;
            breakdown.push(`Anesthesia: $${anesthesiaFee}`);
        }
        if (factors.hospitalization && factors.hospitalization > 0) {
            const dailyRate = 75;
            const hospitalizationFee = dailyRate * factors.hospitalization;
            additionalFees['Hospitalization'] = hospitalizationFee;
            totalCost += hospitalizationFee;
            breakdown.push(`Hospitalization (${factors.hospitalization} days): $${hospitalizationFee}`);
        }
        if (factors.postOpCare) {
            const postOpFee = 100;
            additionalFees['Post-Op Care'] = postOpFee;
            totalCost += postOpFee;
            breakdown.push(`Post-operative care: $${postOpFee}`);
        }
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
    applyDiscounts(baseCost, discountFactors) {
        return baseCost;
    }
    addAdditionalFees(baseCost, feeFactors) {
        return baseCost;
    }
}
exports.SurgeryPricing = SurgeryPricing;
class PricingService {
    constructor(strategy) {
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    calculatePrice(basePrice, factors) {
        return this.strategy.calculateCost(basePrice, factors);
    }
}
exports.PricingService = PricingService;
class StrategyFactory {
    static createDashboardStrategy(userRole) {
        switch (userRole) {
            case 'user':
                return new PetParentDashboardStrategy();
            case 'veterinarian':
                return new VeterinarianDashboardStrategy();
            default:
                throw new Error(`Unknown user role: ${userRole}`);
        }
    }
    static createPricingStrategy(serviceType) {
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
exports.StrategyFactory = StrategyFactory;
//# sourceMappingURL=StrategyPattern.js.map