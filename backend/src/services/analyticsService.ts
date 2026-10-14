import { db } from '../config/firebase';
import { Order } from '../types/order';
import {
  AnalyticsSummary,
  DailyTrendPoint,
  HourlyDistributionPoint,
  CategorySalesPoint,
  PopularFoodItem,
  HighestOrderedFoodResponse,
  EarningsBreakdown,
} from '../types/analytics';
import { menuService } from './menuService';

export class AnalyticsService {
  private ordersCollection = db.collection('orders');

  /**
   * Helper to format a Date into YYYY-MM-DD in Asia/Kolkata or configured local timezone
   */
  private formatDateInTimezone(date: Date, timeZone: string = 'Asia/Kolkata'): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // outputs "YYYY-MM-DD"
  }

  /**
   * Helper to extract the hour string ("HH:00") in Asia/Kolkata
   */
  private formatHourInTimezone(isoString: string, timeZone: string = 'Asia/Kolkata'): string {
    const d = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      hour12: false,
    });
    const hour = formatter.format(d);
    return `${hour}:00`;
  }

  async getSummaryKPIs(dateRange: { startDate?: string; endDate?: string }): Promise<AnalyticsSummary> {
    const snapshot = await this.ordersCollection.get();
    const allOrders = snapshot.docs.map((doc) => doc.data() as Order);

    const todayStr = this.formatDateInTimezone(new Date());

    let filteredOrders = allOrders;
    if (dateRange.startDate || dateRange.endDate) {
      filteredOrders = allOrders.filter((o) => {
        const orderDateStr = this.formatDateInTimezone(new Date(o.createdAt));
        if (dateRange.startDate && orderDateStr < dateRange.startDate) return false;
        if (dateRange.endDate && orderDateStr > dateRange.endDate) return false;
        return true;
      });
    }

    const todayOrders = allOrders.filter(
      (o) => this.formatDateInTimezone(new Date(o.createdAt)) === todayStr
    );

    const preparingOrders = allOrders.filter((o) => o.status === 'preparing');
    const readyOrders = allOrders.filter((o) => o.status === 'ready');
    const collectedOrders = filteredOrders.filter((o) => o.status === 'collected');

    // Realized revenue: Count paid orders only (excluding cancelled/failed)
    let realizedRevenue = 0;
    let grossOrderValue = 0;
    const distinctStudentSet = new Set<string>();

    filteredOrders.forEach((o) => {
      distinctStudentSet.add(o.studentId);
      grossOrderValue += o.total;
      if (o.paymentStatus === 'paid' && o.status !== 'cancelled') {
        realizedRevenue += o.total;
      }
    });

    const averageOrderValue =
      filteredOrders.length > 0 ? Math.round((grossOrderValue / filteredOrders.length) * 100) / 100 : 0;

    return {
      totalOrders: filteredOrders.length,
      ordersToday: todayOrders.length,
      ordersPreparing: preparingOrders.length,
      ordersReady: readyOrders.length,
      ordersCollected: collectedOrders.length,
      totalRevenue: realizedRevenue,
      realizedRevenue,
      grossOrderValue,
      averageOrderValue,
      distinctStudents: distinctStudentSet.size,
    };
  }

  async getChartAnalytics(dateRange: { startDate: string; endDate: string }) {
    const snapshot = await this.ordersCollection.get();
    const allOrders = snapshot.docs.map((doc) => doc.data() as Order);
    const menuItems = await menuService.getMenuItems();
    const itemMap = new Map(menuItems.map((m) => [m.itemId, m]));

    // Filter within range
    const orders = allOrders.filter((o) => {
      const orderDate = this.formatDateInTimezone(new Date(o.createdAt));
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });

    // 1. Daily trends (Order count and Revenue)
    const dailyMap = new Map<string, { orderCount: number; revenue: number }>();

    // Pre-populate days in range so empty days display with 0
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dayKey = this.formatDateInTimezone(dt);
      dailyMap.set(dayKey, { orderCount: 0, revenue: 0 });
    }

    orders.forEach((o) => {
      const dayKey = this.formatDateInTimezone(new Date(o.createdAt));
      const entry = dailyMap.get(dayKey) || { orderCount: 0, revenue: 0 };
      entry.orderCount += 1;
      if (o.paymentStatus === 'paid' && o.status !== 'cancelled') {
        entry.revenue += o.total;
      }
      dailyMap.set(dayKey, entry);
    });

    const dailyTrends: DailyTrendPoint[] = Array.from(dailyMap.entries())
      .map(([date, val]) => ({
        date,
        orderCount: val.orderCount,
        revenue: val.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Hourly distribution
    const hourlyMap = new Map<string, number>();
    for (let h = 8; h <= 21; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      hourlyMap.set(hourStr, 0);
    }
    orders.forEach((o) => {
      const hStr = this.formatHourInTimezone(o.createdAt);
      hourlyMap.set(hStr, (hourlyMap.get(hStr) || 0) + 1);
    });
    const hourlyDistribution: HourlyDistributionPoint[] = Array.from(hourlyMap.entries()).map(
      ([hour, count]) => ({ hour, orderCount: count })
    );

    // 3. Category sales & Item Popularity
    const categoryMap = new Map<string, { revenue: number; itemCount: number }>();
    const itemPopularityMap = new Map<
      string,
      {
        itemId: string;
        name: string;
        imageUrl: string;
        category: string;
        quantityOrdered: number;
        orderCount: number;
        revenue: number;
      }
    >();

    orders.forEach((o) => {
      const isPaid = o.paymentStatus === 'paid' && o.status !== 'cancelled';
      const seenItemsInOrder = new Set<string>();

      o.items.forEach((item) => {
        const menuItem = itemMap.get(item.itemId);
        const category = menuItem?.categoryId || 'Other';

        // Update category stats
        const catEntry = categoryMap.get(category) || { revenue: 0, itemCount: 0 };
        catEntry.itemCount += item.quantity;
        if (isPaid) {
          catEntry.revenue += item.subtotal;
        }
        categoryMap.set(category, catEntry);

        // Update item stats
        const pop = itemPopularityMap.get(item.itemId) || {
          itemId: item.itemId,
          name: item.name,
          imageUrl: menuItem?.imageUrl || '',
          category,
          quantityOrdered: 0,
          orderCount: 0,
          revenue: 0,
        };

        pop.quantityOrdered += item.quantity;
        if (isPaid) {
          pop.revenue += item.subtotal;
        }
        if (!seenItemsInOrder.has(item.itemId)) {
          pop.orderCount += 1;
          seenItemsInOrder.add(item.itemId);
        }
        itemPopularityMap.set(item.itemId, pop);
      });
    });

    const categorySales: CategorySalesPoint[] = Array.from(categoryMap.entries()).map(
      ([cat, data]) => ({
        category: cat.toUpperCase(),
        revenue: data.revenue,
        itemCount: data.itemCount,
      })
    );

    const popularItems: PopularFoodItem[] = Array.from(itemPopularityMap.values()).sort(
      (a, b) => b.quantityOrdered - a.quantityOrdered
    );

    // 4. Status distribution
    const statusCounts: Record<string, number> = {
      placed: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      collected: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    return {
      dailyTrends,
      hourlyDistribution,
      categorySales,
      popularItems: popularItems.slice(0, 10),
      statusDistribution,
    };
  }

  async getHighestOrderedFoodOfDay(dateStr?: string): Promise<HighestOrderedFoodResponse> {
    const targetDate = dateStr || this.formatDateInTimezone(new Date());

    const snapshot = await this.ordersCollection.get();
    const allOrders = snapshot.docs.map((doc) => doc.data() as Order);
    const menuItems = await menuService.getMenuItems();
    const itemMap = new Map(menuItems.map((m) => [m.itemId, m]));

    // Filter orders on that specific calendar day in Asia/Kolkata
    const dayOrders = allOrders.filter(
      (o) =>
        this.formatDateInTimezone(new Date(o.createdAt)) === targetDate &&
        o.status !== 'cancelled'
    );

    if (dayOrders.length === 0) {
      return {
        date: targetDate,
        hasOrders: false,
        highestItems: [],
      };
    }

    const itemTotals = new Map<
      string,
      {
        itemId: string;
        name: string;
        imageUrl: string;
        category: string;
        quantityOrdered: number;
        orderCount: number;
        revenue: number;
      }
    >();

    dayOrders.forEach((o) => {
      const seenInThisOrder = new Set<string>();
      o.items.forEach((item) => {
        const menuItem = itemMap.get(item.itemId);
        const existing = itemTotals.get(item.itemId) || {
          itemId: item.itemId,
          name: item.name,
          imageUrl: menuItem?.imageUrl || '',
          category: menuItem?.categoryId || 'general',
          quantityOrdered: 0,
          orderCount: 0,
          revenue: 0,
        };

        existing.quantityOrdered += item.quantity;
        existing.revenue += item.subtotal;
        if (!seenInThisOrder.has(item.itemId)) {
          existing.orderCount += 1;
          seenInThisOrder.add(item.itemId);
        }
        itemTotals.set(item.itemId, existing);
      });
    });

    const itemsArray = Array.from(itemTotals.values());
    if (itemsArray.length === 0) {
      return { date: targetDate, hasOrders: false, highestItems: [] };
    }

    // Find highest quantity
    const maxQuantity = Math.max(...itemsArray.map((i) => i.quantityOrdered));

    // Handle ties by including all items matching maxQuantity
    const highestItems = itemsArray.filter((i) => i.quantityOrdered === maxQuantity);

    return {
      date: targetDate,
      hasOrders: true,
      highestItems,
    };
  }

  async getEarningsBreakdown(): Promise<EarningsBreakdown> {
    const snapshot = await this.ordersCollection.get();
    const orders = snapshot.docs.map((doc) => doc.data() as Order);

    const now = new Date();
    const todayStr = this.formatDateInTimezone(now);

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = this.formatDateInTimezone(yesterdayDate);

    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 7);
    const d7Str = this.formatDateInTimezone(d7);

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);
    const d30Str = this.formatDateInTimezone(d30);

    let todayRev = 0;
    let yestRev = 0;
    let l7Rev = 0;
    let l30Rev = 0;
    let realizedRev = 0;
    let grossRev = 0;

    const byCategory: Record<string, number> = {};
    const itemMap = new Map<string, { itemId: string; name: string; revenue: number; quantity: number }>();

    orders.forEach((o) => {
      grossRev += o.total;
      const isPaid = o.paymentStatus === 'paid' && o.status !== 'cancelled';
      if (!isPaid) return;

      realizedRev += o.total;
      const orderDateStr = this.formatDateInTimezone(new Date(o.createdAt));

      if (orderDateStr === todayStr) todayRev += o.total;
      if (orderDateStr === yesterdayStr) yestRev += o.total;
      if (orderDateStr >= d7Str) l7Rev += o.total;
      if (orderDateStr >= d30Str) l30Rev += o.total;

      o.items.forEach((it) => {
        const itemEntry = itemMap.get(it.itemId) || {
          itemId: it.itemId,
          name: it.name,
          revenue: 0,
          quantity: 0,
        };
        itemEntry.revenue += it.subtotal;
        itemEntry.quantity += it.quantity;
        itemMap.set(it.itemId, itemEntry);
      });
    });

    const averageOrderValue = orders.length > 0 ? Math.round((realizedRev / orders.length) * 100) / 100 : 0;

    return {
      today: todayRev,
      yesterday: yestRev,
      last7Days: l7Rev,
      last30Days: l30Rev,
      averageOrderValue,
      realizedRevenue: realizedRev,
      grossRevenue: grossRev,
      byCategory,
      byItem: Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue),
    };
  }
}

export const analyticsService = new AnalyticsService();
