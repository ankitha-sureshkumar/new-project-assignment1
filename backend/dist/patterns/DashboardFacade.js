"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardFacade = void 0;
const StrategyPattern_1 = require("./StrategyPattern");
const NotificationObserver_1 = require("./NotificationObserver");
const AccessProxy_1 = require("./AccessProxy");
class UserDataService {
    constructor() {
        this.secureDataService = new AccessProxy_1.SecureDataService();
    }
    async getUserProfile(userId) {
        const User = require('../models/User').default;
        const user = await User.findById(userId).select('-password');
        return user ? user.toObject() : null;
    }
    async getUserStats(userId) {
        const Pet = require('../models/Pet').default;
        const Appointment = require('../models/Appointment').default;
        const [totalPets, appointments] = await Promise.all([
            Pet.countDocuments({ owner: userId, isActive: true }),
            Appointment.find({ user: userId }).select('status veterinarian createdAt')
                .populate('veterinarian', 'name')
        ]);
        const now = new Date();
        const completedAppointments = appointments.filter((apt) => apt.status === 'COMPLETED').length;
        const upcomingAppointments = appointments.filter((apt) => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(apt.status)).length;
        const vetCounts = appointments
            .filter((apt) => apt.status === 'COMPLETED')
            .reduce((acc, apt) => {
            const vetName = apt.veterinarian?.name || 'Unknown';
            acc[vetName] = (acc[vetName] || 0) + 1;
            return acc;
        }, {});
        const favoriteVets = Object.entries(vetCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name]) => name);
        const user = await this.getUserProfile(userId);
        return {
            totalPets,
            totalAppointments: appointments.length,
            completedAppointments,
            upcomingAppointments,
            favoriteVets,
            joinedDate: user?.createdAt || new Date(),
            lastActivity: user?.updatedAt || new Date()
        };
    }
}
class AppointmentDataService {
    async getUserAppointments(userId, role) {
        const Appointment = require('../models/Appointment').default;
        const appointments = await Appointment.find({ user: userId })
            .populate('veterinarian', 'name specialization')
            .populate('pet', 'name type breed')
            .sort({ date: -1 })
            .limit(10);
        return appointments.map((apt) => ({
            id: apt._id,
            date: apt.date,
            time: apt.time,
            veterinarian: {
                id: apt.veterinarian._id,
                name: apt.veterinarian.name,
                specialization: apt.veterinarian.specialization
            },
            pet: {
                id: apt.pet._id,
                name: apt.pet.name,
                type: apt.pet.type
            },
            status: apt.status.toLowerCase(),
            reason: apt.reason,
            consultationFee: apt.consultationFee
        }));
    }
    async getVetAppointments(vetId) {
        const Appointment = require('../models/Appointment').default;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointments = await Appointment.find({
            veterinarian: vetId,
            date: { $gte: today, $lt: tomorrow },
            status: { $in: ['CONFIRMED', 'APPROVED'] }
        })
            .populate('user', 'name contact')
            .populate('pet', 'name type breed age medicalHistory allergies')
            .sort({ time: 1 });
        return appointments.map((apt) => ({
            id: apt._id,
            date: apt.date,
            time: apt.time,
            user: {
                id: apt.user._id,
                name: apt.user.name,
                contact: apt.user.contact
            },
            pet: {
                id: apt.pet._id,
                name: apt.pet.name,
                type: apt.pet.type,
                breed: apt.pet.breed,
                age: apt.pet.age,
                medicalHistory: apt.pet.medicalHistory,
                allergies: apt.pet.allergies
            },
            status: apt.status.toLowerCase(),
            reason: apt.reason,
            consultationFee: apt.consultationFee
        }));
    }
    async getAppointmentStats(userId, role) {
        const Appointment = require('../models/Appointment').default;
        const filter = role === 'veterinarian'
            ? { veterinarian: userId }
            : { user: userId };
        const appointments = await Appointment.find(filter);
        if (role === 'veterinarian') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const todayAppointments = appointments.filter((apt) => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === today.getTime();
            });
            const thisWeekAppointments = appointments.filter((apt) => apt.date >= thisWeekStart && apt.date < new Date());
            const thisMonthAppointments = appointments.filter((apt) => apt.date >= thisMonthStart && apt.date < new Date());
            const completed = appointments.filter((apt) => apt.status === 'COMPLETED');
            const cancelled = appointments.filter((apt) => apt.status === 'CANCELLED');
            const ratedAppointments = completed.filter((apt) => apt.rating);
            const averageRating = ratedAppointments.length > 0
                ? ratedAppointments.reduce((sum, apt) => sum + apt.rating, 0) / ratedAppointments.length
                : 0;
            return {
                today: todayAppointments.length,
                thisWeek: thisWeekAppointments.length,
                thisMonth: thisMonthAppointments.length,
                completed: completed.length,
                cancelled: cancelled.length,
                averageRating: Math.round(averageRating * 10) / 10
            };
        }
        else {
            const completed = appointments.filter((apt) => apt.status === 'COMPLETED');
            const upcoming = appointments.filter((apt) => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(apt.status));
            const cancelled = appointments.filter((apt) => apt.status === 'CANCELLED');
            return {
                total: appointments.length,
                completed: completed.length,
                upcoming: upcoming.length,
                cancelled: cancelled.length
            };
        }
    }
}
class NotificationDataService {
    constructor() {
        this.notificationManager = new NotificationObserver_1.NotificationManager();
    }
    async getUserNotifications(userId, limit = 10) {
        const Notification = require('../models/Notification').default;
        try {
            const notifications = await Notification.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .limit(limit);
            return notifications.map((notif) => ({
                id: notif._id.toString(),
                title: notif.title,
                message: notif.message,
                type: this.mapNotificationType(notif.type),
                timestamp: notif.createdAt,
                read: notif.read,
                priority: notif.priority || 'medium',
                action: notif.relatedAppointment ? 'view_appointment' : undefined
            }));
        }
        catch (error) {
            const Appointment = require('../models/Appointment').default;
            const recentAppointments = await Appointment.find({ user: userId })
                .sort({ updatedAt: -1 })
                .limit(5)
                .populate('veterinarian', 'name');
            return recentAppointments.map((apt, index) => ({
                id: `apt-notif-${apt._id}`,
                title: this.generateAppointmentNotificationTitle(apt.status),
                message: this.generateAppointmentNotificationMessage(apt),
                type: this.mapAppointmentStatusToNotificationType(apt.status),
                timestamp: apt.updatedAt,
                read: index >= 2,
                priority: apt.status === 'PENDING' ? 'high' : 'medium',
                action: 'view_appointment'
            }));
        }
    }
    mapNotificationType(type) {
        const mapping = {
            'user_registered': 'info',
            'appointment_created': 'info',
            'appointment_approved': 'success',
            'appointment_confirmed': 'success',
            'appointment_completed': 'success',
            'appointment_cancelled': 'warning',
            'appointment_rejected': 'error',
            'veterinarian_approved': 'success',
            'system_alert': 'warning'
        };
        return mapping[type] || 'info';
    }
    generateAppointmentNotificationTitle(status) {
        const titles = {
            'PENDING': 'Appointment Request Sent',
            'APPROVED': 'Appointment Approved',
            'CONFIRMED': 'Appointment Confirmed',
            'COMPLETED': 'Appointment Completed',
            'CANCELLED': 'Appointment Cancelled',
            'REJECTED': 'Appointment Rejected'
        };
        return titles[status] || 'Appointment Update';
    }
    generateAppointmentNotificationMessage(apt) {
        const vetName = apt.veterinarian?.name || 'the veterinarian';
        const date = apt.date.toLocaleDateString();
        const messages = {
            'PENDING': `Your appointment request with ${vetName} for ${date} is pending approval`,
            'APPROVED': `Your appointment with ${vetName} for ${date} has been approved. Please confirm to proceed.`,
            'CONFIRMED': `Your appointment with ${vetName} is confirmed for ${date} at ${apt.time}`,
            'COMPLETED': `Your appointment with ${vetName} has been completed`,
            'CANCELLED': `Your appointment with ${vetName} for ${date} has been cancelled`,
            'REJECTED': `Your appointment request with ${vetName} for ${date} has been rejected`
        };
        return messages[apt.status] || `Appointment status: ${apt.status}`;
    }
    mapAppointmentStatusToNotificationType(status) {
        const mapping = {
            'PENDING': 'info',
            'APPROVED': 'success',
            'CONFIRMED': 'success',
            'COMPLETED': 'success',
            'CANCELLED': 'warning',
            'REJECTED': 'error'
        };
        return mapping[status] || 'info';
    }
}
class ActivityTrackingService {
    async getRecentActivity(userId, role, limit = 10) {
        const activities = [];
        try {
            if (role === 'user') {
                const Appointment = require('../models/Appointment').default;
                const Pet = require('../models/Pet').default;
                const [recentAppointments, recentPets] = await Promise.all([
                    Appointment.find({ user: userId })
                        .sort({ updatedAt: -1 })
                        .limit(5)
                        .populate('veterinarian', 'name')
                        .populate('pet', 'name'),
                    Pet.find({ owner: userId, isActive: true })
                        .sort({ updatedAt: -1 })
                        .limit(3)
                ]);
                recentAppointments.forEach((apt) => {
                    activities.push({
                        id: `apt-${apt._id}`,
                        title: this.getAppointmentActivityTitle(apt.status),
                        description: `${apt.status === 'COMPLETED' ? 'Completed' : 'Booked'} appointment with ${apt.veterinarian?.name || 'Veterinarian'} for ${apt.pet?.name || 'Pet'}`,
                        timestamp: apt.updatedAt,
                        type: 'appointment',
                        icon: 'calendar',
                        status: apt.status.toLowerCase()
                    });
                });
                recentPets.forEach((pet) => {
                    const isNew = Math.abs(pet.createdAt.getTime() - pet.updatedAt.getTime()) < 1000;
                    activities.push({
                        id: `pet-${isNew ? 'new' : 'update'}-${pet._id}`,
                        title: isNew ? 'Pet Added' : 'Pet Updated',
                        description: isNew ? `Added ${pet.name} to your pets` : `Updated ${pet.name}'s information`,
                        timestamp: isNew ? pet.createdAt : pet.updatedAt,
                        type: isNew ? 'registration' : 'system',
                        icon: 'heart',
                        status: 'completed'
                    });
                });
            }
            else if (role === 'veterinarian') {
                const Appointment = require('../models/Appointment').default;
                const recentAppointments = await Appointment.find({ veterinarian: userId })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .populate('user', 'name')
                    .populate('pet', 'name type');
                recentAppointments.forEach((apt) => {
                    activities.push({
                        id: `vet-apt-${apt._id}`,
                        title: this.getVetAppointmentActivityTitle(apt.status),
                        description: `${this.getVetActionDescription(apt.status)} for ${apt.pet?.name || 'Pet'} (${apt.pet?.type || 'Animal'}) - ${apt.user?.name || 'Owner'}`,
                        timestamp: apt.updatedAt,
                        type: 'appointment',
                        icon: 'stethoscope',
                        status: apt.status.toLowerCase()
                    });
                });
            }
            return activities
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, limit);
        }
        catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    }
    getAppointmentActivityTitle(status) {
        const titles = {
            'PENDING': 'Appointment Requested',
            'APPROVED': 'Appointment Approved',
            'CONFIRMED': 'Appointment Confirmed',
            'COMPLETED': 'Appointment Completed',
            'CANCELLED': 'Appointment Cancelled',
            'REJECTED': 'Appointment Rejected'
        };
        return titles[status] || 'Appointment Updated';
    }
    getVetAppointmentActivityTitle(status) {
        const titles = {
            'PENDING': 'New Appointment Request',
            'APPROVED': 'Appointment Approved',
            'CONFIRMED': 'Upcoming Appointment',
            'COMPLETED': 'Consultation Completed',
            'CANCELLED': 'Appointment Cancelled',
            'REJECTED': 'Request Declined'
        };
        return titles[status] || 'Appointment Activity';
    }
    getVetActionDescription(status) {
        const descriptions = {
            'PENDING': 'New request received',
            'APPROVED': 'Approved appointment',
            'CONFIRMED': 'Confirmed consultation',
            'COMPLETED': 'Completed consultation',
            'CANCELLED': 'Appointment cancelled',
            'REJECTED': 'Request declined'
        };
        return descriptions[status] || 'Managed appointment';
    }
}
class EarningsService {
    async getVetEarnings(vetId) {
        try {
            const Appointment = require('../models/Appointment').default;
            const completedAppointments = await Appointment.find({
                veterinarian: vetId,
                status: 'COMPLETED',
                consultationFee: { $exists: true, $ne: null }
            }).select('consultationFee date createdAt');
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            const lastWeekStart = new Date(thisWeekStart);
            lastWeekStart.setDate(thisWeekStart.getDate() - 7);
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            const todayEarnings = completedAppointments
                .filter((apt) => apt.date >= today)
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const thisWeekEarnings = completedAppointments
                .filter((apt) => apt.date >= thisWeekStart)
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const lastWeekEarnings = completedAppointments
                .filter((apt) => apt.date >= lastWeekStart && apt.date < thisWeekStart)
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const thisMonthEarnings = completedAppointments
                .filter((apt) => apt.date >= thisMonthStart)
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const lastMonthEarnings = completedAppointments
                .filter((apt) => apt.date >= lastMonthStart && apt.date <= lastMonthEnd)
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const totalEarnings = completedAppointments
                .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
            const weeklyTrend = lastWeekEarnings > 0
                ? ((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100
                : 0;
            const monthlyTrend = lastMonthEarnings > 0
                ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
                : 0;
            return {
                today: Math.round(todayEarnings * 100) / 100,
                thisWeek: Math.round(thisWeekEarnings * 100) / 100,
                thisMonth: Math.round(thisMonthEarnings * 100) / 100,
                total: Math.round(totalEarnings * 100) / 100,
                currency: 'USD',
                trends: {
                    weekly: Math.round(weeklyTrend * 10) / 10,
                    monthly: Math.round(monthlyTrend * 10) / 10
                }
            };
        }
        catch (error) {
            console.error('Error calculating vet earnings:', error);
            return {
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                total: 0,
                currency: 'USD',
                trends: {
                    weekly: 0,
                    monthly: 0
                }
            };
        }
    }
}
class SystemHealthService {
    async getHealthChecks() {
        const healthChecks = [];
        try {
            const mongoose = require('mongoose');
            const isConnected = mongoose.connection.readyState === 1;
            healthChecks.push({
                category: 'Database',
                status: isConnected ? 'healthy' : 'error',
                message: isConnected ? 'All database connections are operational' : 'Database connection failed',
                lastChecked: new Date()
            });
        }
        catch (error) {
            healthChecks.push({
                category: 'Database',
                status: 'error',
                message: `Database connection error: ${error}`,
                lastChecked: new Date()
            });
        }
        try {
            const User = require('../models/User').default;
            const Appointment = require('../models/Appointment').default;
            const Pet = require('../models/Pet').default;
            const userCount = await User.countDocuments();
            const appointmentCount = await Appointment.countDocuments();
            const petCount = await Pet.countDocuments();
            healthChecks.push({
                category: 'Data Models',
                status: 'healthy',
                message: `System has ${userCount} users, ${appointmentCount} appointments, ${petCount} pets`,
                lastChecked: new Date()
            });
        }
        catch (error) {
            healthChecks.push({
                category: 'Data Models',
                status: 'error',
                message: `Model access error: ${error}`,
                lastChecked: new Date()
            });
        }
        try {
            const Appointment = require('../models/Appointment').default;
            const recentAppointments = await Appointment.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });
            healthChecks.push({
                category: 'System Activity',
                status: recentAppointments > 0 ? 'healthy' : 'warning',
                message: `${recentAppointments} new appointments in last 24 hours`,
                lastChecked: new Date()
            });
        }
        catch (error) {
            healthChecks.push({
                category: 'System Activity',
                status: 'error',
                message: `Activity check failed: ${error}`,
                lastChecked: new Date()
            });
        }
        return healthChecks;
    }
}
class DashboardFacade {
    constructor() {
        this.userDataService = new UserDataService();
        this.appointmentDataService = new AppointmentDataService();
        this.notificationDataService = new NotificationDataService();
        this.activityTrackingService = new ActivityTrackingService();
        this.earningsService = new EarningsService();
        this.systemHealthService = new SystemHealthService();
        this.dashboardService = new StrategyPattern_1.DashboardService(StrategyPattern_1.StrategyFactory.createDashboardStrategy('user'));
    }
    async generateCompleteDashboard(user) {
        try {
            console.log(`🏗️ Generating complete dashboard for ${user.getRole()}: ${user.email}`);
            const strategy = StrategyPattern_1.StrategyFactory.createDashboardStrategy(user.getRole());
            this.dashboardService.setStrategy(strategy);
            const [userProfile, userStats, appointmentStats, notifications, recentActivity, strategicDashboardData] = await Promise.allSettled([
                this.userDataService.getUserProfile(user.id),
                this.userDataService.getUserStats(user.id),
                this.appointmentDataService.getAppointmentStats(user.id, user.getRole()),
                this.notificationDataService.getUserNotifications(user.id),
                this.activityTrackingService.getRecentActivity(user.id, user.getRole()),
                this.dashboardService.generateDashboard(user.id, user.getRole())
            ]);
            let earnings;
            let healthChecks;
            if (user.getRole() === 'veterinarian') {
                const earningsResult = await this.earningsService.getVetEarnings(user.id);
                earnings = earningsResult;
            }
            const dashboard = {
                userInfo: this.buildUserInfo(user, this.getResult(userProfile)),
                metrics: this.buildMetrics(user.getRole(), this.getResult(userStats), this.getResult(appointmentStats), earnings),
                quickActions: this.buildQuickActions(user, this.getResult(strategicDashboardData)),
                notifications: this.getResult(notifications) || [],
                recentActivity: this.getResult(recentActivity) || [],
                upcomingEvents: await this.buildUpcomingEvents(user.id, user.getRole()),
                healthChecks,
                earnings
            };
            console.log(`✅ Dashboard generated successfully for ${user.email}`);
            return dashboard;
        }
        catch (error) {
            console.error('❌ Failed to generate dashboard:', error);
            throw new Error('Failed to generate dashboard data');
        }
    }
    async getDashboardSummary(user) {
        const appointmentStats = await this.appointmentDataService.getAppointmentStats(user.id, user.getRole());
        const userStats = await this.userDataService.getUserStats(user.id);
        const earnings = user.getRole() === 'veterinarian'
            ? await this.earningsService.getVetEarnings(user.id)
            : undefined;
        return {
            metrics: this.buildMetrics(user.getRole(), userStats, appointmentStats, earnings).primary
        };
    }
    async getNotifications(userId, limit) {
        return await this.notificationDataService.getUserNotifications(userId, limit);
    }
    async getUserDashboard(userId) {
        try {
            console.log(`🏗️ Generating user dashboard for: ${userId}`);
            const strategy = StrategyPattern_1.StrategyFactory.createDashboardStrategy('user');
            this.dashboardService.setStrategy(strategy);
            const [appointmentStats, notifications, recentActivity, strategicDashboardData] = await Promise.allSettled([
                this.appointmentDataService.getAppointmentStats(userId, 'user'),
                this.notificationDataService.getUserNotifications(userId),
                this.activityTrackingService.getRecentActivity(userId, 'user'),
                this.dashboardService.generateDashboard(userId, 'user')
            ]);
            const dashboard = {
                userInfo: {
                    id: userId,
                    name: 'User',
                    role: 'user',
                    status: 'active'
                },
                metrics: this.buildMetrics('user', {}, this.getResult(appointmentStats)),
                quickActions: this.buildQuickActions({ getRole: () => 'user' }, this.getResult(strategicDashboardData)),
                notifications: this.getResult(notifications) || [],
                recentActivity: this.getResult(recentActivity) || [],
                upcomingEvents: await this.buildUpcomingEvents(userId, 'user')
            };
            console.log(`✅ User dashboard generated successfully for ${userId}`);
            return dashboard;
        }
        catch (error) {
            console.error('❌ Failed to generate user dashboard:', error);
            throw new Error('Failed to generate user dashboard data');
        }
    }
    async getVeterinarianDashboard(vetId) {
        try {
            console.log(`🏗️ Generating veterinarian dashboard for: ${vetId}`);
            const strategy = StrategyPattern_1.StrategyFactory.createDashboardStrategy('veterinarian');
            this.dashboardService.setStrategy(strategy);
            const [appointmentStats, notifications, recentActivity, earnings, strategicDashboardData] = await Promise.allSettled([
                this.appointmentDataService.getAppointmentStats(vetId, 'veterinarian'),
                this.notificationDataService.getUserNotifications(vetId),
                this.activityTrackingService.getRecentActivity(vetId, 'veterinarian'),
                this.earningsService.getVetEarnings(vetId),
                this.dashboardService.generateDashboard(vetId, 'veterinarian')
            ]);
            const dashboard = {
                userInfo: {
                    id: vetId,
                    name: 'Dr. Veterinarian',
                    role: 'veterinarian',
                    status: 'active'
                },
                metrics: this.buildMetrics('veterinarian', {}, this.getResult(appointmentStats), this.getResult(earnings) || undefined),
                quickActions: this.buildQuickActions({ getRole: () => 'veterinarian' }, this.getResult(strategicDashboardData)),
                notifications: this.getResult(notifications) || [],
                recentActivity: this.getResult(recentActivity) || [],
                upcomingEvents: await this.buildUpcomingEvents(vetId, 'veterinarian'),
                earnings: this.getResult(earnings) || undefined
            };
            console.log(`✅ Veterinarian dashboard generated successfully for ${vetId}`);
            return dashboard;
        }
        catch (error) {
            console.error('❌ Failed to generate veterinarian dashboard:', error);
            throw new Error('Failed to generate veterinarian dashboard data');
        }
    }
    async getAdminDashboard(adminId) {
        try {
            console.log(`🏗️ Generating admin dashboard for: ${adminId}`);
            const strategy = StrategyPattern_1.StrategyFactory.createDashboardStrategy('user');
            this.dashboardService.setStrategy(strategy);
            const [healthChecks, notifications, recentActivity, strategicDashboardData] = await Promise.allSettled([
                this.systemHealthService.getHealthChecks(),
                this.notificationDataService.getUserNotifications(adminId),
                this.activityTrackingService.getRecentActivity(adminId, 'admin'),
                this.dashboardService.generateDashboard(adminId, 'user')
            ]);
            const dashboard = {
                userInfo: {
                    id: adminId,
                    name: 'Administrator',
                    role: 'admin',
                    status: 'active'
                },
                metrics: this.buildMetrics('admin', {}, {}),
                quickActions: this.buildQuickActions({ getRole: () => 'admin' }, this.getResult(strategicDashboardData)),
                notifications: this.getResult(notifications) || [],
                recentActivity: this.getResult(recentActivity) || [],
                upcomingEvents: await this.buildUpcomingEvents(adminId, 'admin'),
                healthChecks: this.getResult(healthChecks) || undefined
            };
            console.log(`✅ Admin dashboard generated successfully for ${adminId}`);
            return dashboard;
        }
        catch (error) {
            console.error('❌ Failed to generate admin dashboard:', error);
            throw new Error('Failed to generate admin dashboard data');
        }
    }
    async getSystemHealthMetrics(adminId) {
        try {
            console.log(`🏗️ Getting system health metrics for admin: ${adminId}`);
            const healthChecks = await this.systemHealthService.getHealthChecks();
            return {
                status: 'healthy',
                checks: healthChecks,
                timestamp: new Date(),
                checkedBy: adminId
            };
        }
        catch (error) {
            console.error('❌ Failed to get system health metrics:', error);
            throw new Error('Failed to get system health metrics');
        }
    }
    buildUserInfo(user, profile) {
        return {
            id: user.id,
            name: user.displayName,
            role: user.getRole(),
            profilePicture: user.profilePicture,
            status: user.isBlocked ? 'blocked' : 'active'
        };
    }
    buildMetrics(role, userStats, appointmentStats, earnings) {
        const primary = [];
        const secondary = [];
        if (role === 'user') {
            primary.push({
                id: 'total_pets',
                title: 'My Pets',
                value: userStats?.totalPets || 0,
                icon: 'heart',
                color: 'blue',
                clickable: true,
                action: 'view_pets'
            }, {
                id: 'upcoming_appointments',
                title: 'Upcoming Visits',
                value: appointmentStats?.upcoming || 0,
                icon: 'calendar',
                color: 'green',
                clickable: true,
                action: 'view_appointments'
            });
            secondary.push({
                id: 'completed_appointments',
                title: 'Completed Visits',
                value: appointmentStats?.completed || 0,
                icon: 'check-circle',
                color: 'purple',
                clickable: true,
                action: 'view_history'
            });
        }
        else if (role === 'veterinarian') {
            primary.push({
                id: 'todays_appointments',
                title: "Today's Appointments",
                value: appointmentStats?.today || 0,
                icon: 'calendar-day',
                color: 'blue',
                clickable: true,
                action: 'view_schedule'
            }, {
                id: 'this_week_earnings',
                title: 'This Week',
                value: earnings ? `$${earnings.thisWeek}` : '$0',
                icon: 'dollar-sign',
                color: 'green',
                trend: earnings?.trends.weekly ? {
                    direction: earnings.trends.weekly > 0 ? 'up' : 'down',
                    percentage: Math.abs(earnings.trends.weekly),
                    period: 'vs last week'
                } : undefined
            });
            secondary.push({
                id: 'average_rating',
                title: 'Average Rating',
                value: appointmentStats?.averageRating || 0,
                subtitle: '/5.0',
                icon: 'star',
                color: 'yellow'
            });
        }
        return { primary, secondary };
    }
    buildQuickActions(user, strategicData) {
        const baseActions = [
            {
                id: 'update_profile',
                title: 'Update Profile',
                description: 'Edit your account information',
                icon: 'user',
                color: 'blue',
                priority: 'low',
                action: 'edit_profile',
                enabled: !user.isBlocked
            }
        ];
        if (strategicData?.quickActions) {
            strategicData.quickActions.forEach((action, index) => {
                baseActions.unshift({
                    id: `strategic_${index}`,
                    title: action,
                    description: `Quick access to ${action.toLowerCase()}`,
                    icon: this.getIconForAction(action),
                    color: 'primary',
                    priority: 'medium',
                    action: this.getActionForTitle(action),
                    enabled: !user.isBlocked,
                    badge: this.getBadgeForAction(action, user.getRole())
                });
            });
        }
        return baseActions;
    }
    async buildUpcomingEvents(userId, role) {
        const appointments = role === 'veterinarian'
            ? await this.appointmentDataService.getVetAppointments(userId)
            : await this.appointmentDataService.getUserAppointments(userId, role);
        return appointments
            .filter(apt => new Date(apt.date) > new Date())
            .slice(0, 5)
            .map(apt => ({
            id: apt.id,
            title: `${apt.type} Appointment`,
            description: role === 'veterinarian'
                ? `${apt.user.name} with ${apt.pet.name}`
                : `With ${apt.veterinarian.name} for ${apt.pet.name}`,
            datetime: new Date(`${apt.date} ${apt.time}`),
            type: 'appointment',
            participants: role === 'veterinarian'
                ? [apt.user.name, apt.pet.name]
                : [apt.veterinarian.name, apt.pet.name],
            status: apt.status === 'confirmed' ? 'scheduled' : apt.status
        }));
    }
    getResult(settled) {
        return settled.status === 'fulfilled' ? settled.value : null;
    }
    getIconForAction(action) {
        const iconMap = {
            'Schedule New Appointment': 'calendar-plus',
            'View Medical Records': 'file-medical',
            'Update Pet Information': 'heart',
            'Emergency Contacts': 'phone',
            'View Appointments': 'calendar',
            'Update Availability': 'clock',
            'Patient Records': 'clipboard',
            'Complete Profile Setup': 'user-plus'
        };
        return iconMap[action] || 'circle';
    }
    getActionForTitle(title) {
        return title.toLowerCase().replace(/\s+/g, '_');
    }
    getBadgeForAction(action, role) {
        if (action.includes('New') || action.includes('Schedule'))
            return 'new';
        if (action.includes('Emergency'))
            return 'urgent';
        if (role === 'veterinarian' && action.includes('Profile'))
            return 'setup';
        return undefined;
    }
}
exports.DashboardFacade = DashboardFacade;
//# sourceMappingURL=DashboardFacade.js.map