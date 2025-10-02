import { BaseUser } from '../classes/BaseUser';
export interface DashboardSummary {
    userInfo: {
        id: string;
        name: string;
        role: string;
        profilePicture?: string;
        status: string;
    };
    metrics: {
        primary: MetricCard[];
        secondary: MetricCard[];
    };
    quickActions: ActionItem[];
    notifications: NotificationItem[];
    recentActivity: ActivityItem[];
    upcomingEvents: EventItem[];
    healthChecks?: HealthCheckItem[];
    earnings?: EarningsData;
}
export interface MetricCard {
    id: string;
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: {
        direction: 'up' | 'down' | 'stable';
        percentage: number;
        period: string;
    };
    clickable?: boolean;
    action?: string;
}
export interface ActionItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
    enabled: boolean;
    badge?: string;
}
export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    action?: string;
}
export interface ActivityItem {
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    type: 'appointment' | 'registration' | 'payment' | 'system';
    icon: string;
    status?: string;
}
export interface EventItem {
    id: string;
    title: string;
    description: string;
    datetime: Date;
    type: 'appointment' | 'reminder' | 'meeting';
    participants?: string[];
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
export interface HealthCheckItem {
    category: string;
    status: 'healthy' | 'warning' | 'critical' | 'error';
    message: string;
    lastChecked: Date;
    details?: any;
}
export interface EarningsData {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    currency: string;
    trends: {
        weekly: number;
        monthly: number;
    };
}
export declare class DashboardFacade {
    private userDataService;
    private appointmentDataService;
    private notificationDataService;
    private activityTrackingService;
    private earningsService;
    private systemHealthService;
    private dashboardService;
    constructor();
    generateCompleteDashboard(user: BaseUser): Promise<DashboardSummary>;
    getDashboardSummary(user: BaseUser): Promise<{
        metrics: MetricCard[];
    }>;
    getNotifications(userId: string, limit?: number): Promise<NotificationItem[]>;
    getUserDashboard(userId: string): Promise<DashboardSummary>;
    getVeterinarianDashboard(vetId: string): Promise<DashboardSummary>;
    getAdminDashboard(adminId: string): Promise<DashboardSummary>;
    getSystemHealthMetrics(adminId: string): Promise<any>;
    private buildUserInfo;
    private buildMetrics;
    private buildQuickActions;
    private buildUpcomingEvents;
    private getResult;
    private getIconForAction;
    private getActionForTitle;
    private getBadgeForAction;
}
//# sourceMappingURL=DashboardFacade.d.ts.map