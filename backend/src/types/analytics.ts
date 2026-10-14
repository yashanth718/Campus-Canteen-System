export interface AnalyticsSummary {
  totalOrders: number;
  ordersToday: number;
  ordersPreparing: number;
  ordersReady: number;
  ordersCollected: number;
  totalRevenue: number;
  realizedRevenue: number;
  grossOrderValue: number;
  averageOrderValue: number;
  distinctStudents: number;
}

export interface DailyTrendPoint {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface HourlyDistributionPoint {
  hour: string; // "09:00", "10:00", etc.
  orderCount: number;
}

export interface CategorySalesPoint {
  category: string;
  revenue: number;
  itemCount: number;
}

export interface PopularFoodItem {
  itemId: string;
  name: string;
  imageUrl: string;
  category: string;
  quantityOrdered: number;
  orderCount: number;
  revenue: number;
}

export interface HighestOrderedFoodResponse {
  date: string;
  hasOrders: boolean;
  highestItems: PopularFoodItem[];
}

export interface EarningsBreakdown {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  averageOrderValue: number;
  realizedRevenue: number;
  grossRevenue: number;
  byCategory: Record<string, number>;
  byItem: { itemId: string; name: string; revenue: number; quantity: number }[];
}
