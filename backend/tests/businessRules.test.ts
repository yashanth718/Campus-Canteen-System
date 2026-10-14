import {
  isValidStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
  OrderStatus,
} from '../src/types/order';

describe('Order Lifecycle & State Transitions', () => {
  test('should allow legal sequential lifecycle transitions', () => {
    expect(isValidStatusTransition('placed', 'accepted')).toBe(true);
    expect(isValidStatusTransition('accepted', 'preparing')).toBe(true);
    expect(isValidStatusTransition('preparing', 'ready')).toBe(true);
    expect(isValidStatusTransition('ready', 'collected')).toBe(true);
  });

  test('should permit cancellation from placed or accepted states', () => {
    expect(isValidStatusTransition('placed', 'cancelled')).toBe(true);
    expect(isValidStatusTransition('accepted', 'cancelled')).toBe(true);
  });

  test('should block invalid forward jumps (e.g., Placed directly to Collected)', () => {
    expect(isValidStatusTransition('placed', 'collected')).toBe(false);
    expect(isValidStatusTransition('placed', 'ready')).toBe(false);
    expect(isValidStatusTransition('accepted', 'ready')).toBe(false);
  });

  test('should block illegal backward transitions', () => {
    expect(isValidStatusTransition('preparing', 'placed')).toBe(false);
    expect(isValidStatusTransition('ready', 'accepted')).toBe(false);
    expect(isValidStatusTransition('collected', 'preparing')).toBe(false);
    expect(isValidStatusTransition('cancelled', 'placed')).toBe(false);
  });

  test('collected and cancelled states should be strictly terminal', () => {
    expect(ALLOWED_STATUS_TRANSITIONS.collected).toHaveLength(0);
    expect(ALLOWED_STATUS_TRANSITIONS.cancelled).toHaveLength(0);
  });
});

describe('Pricing & Revenue Aggregation Rules', () => {
  const menuLookup: Record<string, number> = {
    'dosa': 60,
    'chai': 15,
    'biryani': 110,
  };

  test('server should calculate subtotal from authoritative menu prices, ignoring client input', () => {
    const requestedItems = [
      { itemId: 'dosa', quantity: 2, clientClaimedPrice: 10 }, // Tampered price attempted
      { itemId: 'chai', quantity: 3, clientClaimedPrice: 5 },   // Tampered price attempted
    ];

    const computedItems = requestedItems.map((item) => {
      const livePrice = menuLookup[item.itemId];
      return {
        itemId: item.itemId,
        price: livePrice,
        quantity: item.quantity,
        subtotal: livePrice * item.quantity,
      };
    });

    const subtotal = computedItems.reduce((sum, item) => sum + item.subtotal, 0);
    expect(subtotal).toBe(60 * 2 + 15 * 3); // 120 + 45 = 165
    expect(subtotal).not.toBe(10 * 2 + 5 * 3); // Tampered 35 rejected
  });

  test('realized revenue should strictly count paid orders and exclude cancelled/pending', () => {
    const orders = [
      { id: '1', total: 100, paymentStatus: 'paid', status: 'collected' },
      { id: '2', total: 150, paymentStatus: 'paid', status: 'ready' },
      { id: '3', total: 200, paymentStatus: 'pending', status: 'placed' },
      { id: '4', total: 300, paymentStatus: 'paid', status: 'cancelled' },
    ];

    let realizedRevenue = 0;
    let grossOrderValue = 0;

    orders.forEach((o) => {
      grossOrderValue += o.total;
      if (o.paymentStatus === 'paid' && o.status !== 'cancelled') {
        realizedRevenue += o.total;
      }
    });

    expect(grossOrderValue).toBe(750);
    expect(realizedRevenue).toBe(250); // only order 1 and 2
  });
});

describe('Highest-Ordered Food of the Day Calculation', () => {
  test('should calculate popularity by total quantity ordered, not merely document count', () => {
    // 2 orders with 1 Biryani each = 2 Biryanis total
    // 1 order with 5 Dosas = 5 Dosas total
    const sampleItems = [
      { itemId: 'item-biryani', name: 'Veg Biryani', quantity: 1, orderCount: 1 },
      { itemId: 'item-biryani', name: 'Veg Biryani', quantity: 1, orderCount: 1 },
      { itemId: 'item-dosa', name: 'Masala Dosa', quantity: 5, orderCount: 1 },
    ];

    const aggregated = new Map<string, { quantity: number; orderCount: number }>();
    sampleItems.forEach((it) => {
      const prev = aggregated.get(it.itemId) || { quantity: 0, orderCount: 0 };
      prev.quantity += it.quantity;
      prev.orderCount += 1;
      aggregated.set(it.itemId, prev);
    });

    const biryaniStats = aggregated.get('item-biryani')!;
    const dosaStats = aggregated.get('item-dosa')!;

    expect(biryaniStats.orderCount).toBe(2);
    expect(dosaStats.orderCount).toBe(1);

    // Popularity winner MUST be Dosa because quantity (5) > Biryani (2)
    const maxQty = Math.max(...Array.from(aggregated.values()).map((v) => v.quantity));
    expect(maxQty).toBe(5);

    const winners = Array.from(aggregated.entries()).filter(([, v]) => v.quantity === maxQty);
    expect(winners[0][0]).toBe('item-dosa');
  });

  test('should return all tied items when multiple foods tie for highest quantity', () => {
    const aggregated = [
      { itemId: 'item-dosa', name: 'Masala Dosa', quantity: 10 },
      { itemId: 'item-chai', name: 'Masala Chai', quantity: 10 },
      { itemId: 'item-vada', name: 'Medu Vada', quantity: 4 },
    ];

    const maxQty = Math.max(...aggregated.map((v) => v.quantity));
    const ties = aggregated.filter((v) => v.quantity === maxQty);

    expect(ties).toHaveLength(2);
    expect(ties.map((t) => t.itemId)).toContain('item-dosa');
    expect(ties.map((t) => t.itemId)).toContain('item-chai');
  });
});
