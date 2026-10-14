// In-memory Firestore compatibility layer for local development without Google Cloud credentials
export interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => any;
  ref: { id: string };
}

export interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
  empty: boolean;
  size: number;
}

class MockDocRef {
  constructor(private collectionName: string, public id: string, private store: LocalMemoryStore) {}

  async get(): Promise<MockDocSnapshot> {
    const data = this.store.getDoc(this.collectionName, this.id);
    return {
      id: this.id,
      exists: data !== undefined,
      data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
      ref: { id: this.id },
    };
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    this.store.setDoc(this.collectionName, this.id, data, options?.merge);
  }

  async update(data: any): Promise<void> {
    const existing = this.store.getDoc(this.collectionName, this.id);
    if (!existing) {
      throw new Error(`Document ${this.id} does not exist in ${this.collectionName}`);
    }
    this.store.setDoc(this.collectionName, this.id, { ...existing, ...data }, true);
  }

  async delete(): Promise<void> {
    this.store.deleteDoc(this.collectionName, this.id);
  }
}

class MockQuery {
  private filters: { field: string; op: string; val: any }[] = [];
  private orderField?: string;
  private orderDir?: 'asc' | 'desc';
  private limitCount?: number;

  constructor(private collectionName: string, private store: LocalMemoryStore) {}

  where(field: string, op: string, val: any): MockQuery {
    const q = new MockQuery(this.collectionName, this.store);
    q.filters = [...this.filters, { field, op, val }];
    q.orderField = this.orderField;
    q.orderDir = this.orderDir;
    q.limitCount = this.limitCount;
    return q;
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): MockQuery {
    const q = new MockQuery(this.collectionName, this.store);
    q.filters = [...this.filters];
    q.orderField = field;
    q.orderDir = dir;
    q.limitCount = this.limitCount;
    return q;
  }

  limit(count: number): MockQuery {
    const q = new MockQuery(this.collectionName, this.store);
    q.filters = [...this.filters];
    q.orderField = this.orderField;
    q.orderDir = this.orderDir;
    q.limitCount = count;
    return q;
  }

  async get(): Promise<MockQuerySnapshot> {
    let items = this.store.getAllDocs(this.collectionName);

    // Apply where filters
    for (const filter of this.filters) {
      items = items.filter((item) => {
        const itemVal = item[filter.field];
        switch (filter.op) {
          case '==':
            return itemVal === filter.val;
          case '!=':
            return itemVal !== filter.val;
          case '>':
            return itemVal > filter.val;
          case '>=':
            return itemVal >= filter.val;
          case '<':
            return itemVal < filter.val;
          case '<=':
            return itemVal <= filter.val;
          case 'in':
            return Array.isArray(filter.val) && filter.val.includes(itemVal);
          default:
            return true;
        }
      });
    }

    // Apply order
    if (this.orderField) {
      const field = this.orderField;
      const factor = this.orderDir === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return -1 * factor;
        if (valA > valB) return 1 * factor;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount && this.limitCount > 0) {
      items = items.slice(0, this.limitCount);
    }

    const docs: MockDocSnapshot[] = items.map((data) => ({
      id: data.itemId || data.orderId || data.categoryId || data.notificationId || data.paymentId || data.uid || 'id',
      exists: true,
      data: () => JSON.parse(JSON.stringify(data)),
      ref: { id: data.itemId || data.orderId || data.categoryId || data.notificationId || data.paymentId || data.uid },
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
    };
  }
}

class MockCollectionRef extends MockQuery {
  constructor(private name: string, private mStore: LocalMemoryStore) {
    super(name, mStore);
  }

  doc(id?: string): MockDocRef {
    const docId = id || `doc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return new MockDocRef(this.name, docId, this.mStore);
  }
}

class MockBatch {
  private operations: (() => void)[] = [];

  update(ref: any, data: any) {
    this.operations.push(() => ref.update(data));
    return this;
  }

  set(ref: any, data: any, options?: any) {
    this.operations.push(() => ref.set(data, options));
    return this;
  }

  delete(ref: any) {
    this.operations.push(() => ref.delete());
    return this;
  }

  async commit(): Promise<void> {
    for (const op of this.operations) {
      op();
    }
  }
}

export class LocalMemoryStore {
  private data: Record<string, Map<string, any>> = {};

  constructor() {
    this.data = {
      categories: new Map(),
      menuItems: new Map(),
      orders: new Map(),
      notifications: new Map(),
      users: new Map(),
      payments: new Map(),
    };
    this.populateInitialData();
  }

  collection(name: string): MockCollectionRef {
    if (!this.data[name]) {
      this.data[name] = new Map();
    }
    return new MockCollectionRef(name, this);
  }

  batch(): MockBatch {
    return new MockBatch();
  }

  getDoc(collection: string, id: string): any {
    return this.data[collection]?.get(id);
  }

  setDoc(collection: string, id: string, docData: any, merge: boolean = false): void {
    if (!this.data[collection]) {
      this.data[collection] = new Map();
    }
    if (merge && this.data[collection].has(id)) {
      const existing = this.data[collection].get(id);
      this.data[collection].set(id, { ...existing, ...docData });
    } else {
      this.data[collection].set(id, docData);
    }
  }

  deleteDoc(collection: string, id: string): void {
    this.data[collection]?.delete(id);
  }

  getAllDocs(collection: string): any[] {
    if (!this.data[collection]) return [];
    return Array.from(this.data[collection].values());
  }

  private populateInitialData() {
    const now = new Date().toISOString();

    // 1. Categories
    const categories = [
      { categoryId: 'breakfast', name: 'Breakfast', description: 'Fresh morning items', displayOrder: 1, active: true, createdAt: now },
      { categoryId: 'lunch', name: 'Lunch', description: 'Wholesome combo meals', displayOrder: 2, active: true, createdAt: now },
      { categoryId: 'snacks', name: 'Snacks', description: 'Crispy quick bites', displayOrder: 3, active: true, createdAt: now },
      { categoryId: 'beverages', name: 'Beverages', description: 'Chai, coffee & shakes', displayOrder: 4, active: true, createdAt: now },
      { categoryId: 'desserts', name: 'Desserts', description: 'Sweets & treats', displayOrder: 5, active: true, createdAt: now },
    ];
    categories.forEach((c) => this.setDoc('categories', c.categoryId, c));

    // 2. Menu Items
    const menuItems = [
      {
        itemId: 'item-dosa',
        name: 'Crispy Masala Dosa',
        description: 'Golden fermented rice crepe with spiced potato filling, coconut chutney & hot sambar.',
        categoryId: 'breakfast',
        price: 60,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-idli-vada',
        name: 'Idli Vada Combo',
        description: 'Two fluffy steamed rice cakes & one medu vada with chutney and sambar.',
        categoryId: 'breakfast',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 8,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-poori',
        name: 'Poori Bhaji (3 pcs)',
        description: 'Puffy deep-fried whole wheat bread with potato masala curry.',
        categoryId: 'breakfast',
        price: 55,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 12,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-biryani',
        name: 'Hyderabadi Veg Biryani',
        description: 'Fragrant basmati rice layered with garden vegetables, saffron & aromatic spices. Served with raita.',
        categoryId: 'lunch',
        price: 110,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-thali',
        name: 'Executive South Indian Thali',
        description: 'Steamed rice, dal tadka, poriyal, sambar, rasam, curd, appalam & sweet gulab jamun.',
        categoryId: 'lunch',
        price: 90,
        imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-paneer-meal',
        name: 'Paneer Butter Masala with 2 Naan',
        description: 'Rich cottage cheese in a buttery tomato gravy paired with two tandoor-baked butter naans.',
        categoryId: 'lunch',
        price: 140,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 18,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-chole-bhature',
        name: 'Amritsari Chole Bhature',
        description: 'Two fluffy bhature served with zesty spiced chickpea curry, pickled onions & green chilies.',
        categoryId: 'lunch',
        price: 80,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 12,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-samosa',
        name: 'Crispy Samosa (2 pcs)',
        description: 'Crisp pastry triangles stuffed with spiced potatoes and peas, served with sweet tamarind and mint chutney.',
        categoryId: 'snacks',
        price: 25,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-pav-bhaji',
        name: 'Butter Pav Bhaji',
        description: 'Mashed spiced vegetable gravy loaded with butter, served with two soft toasted pav buns.',
        categoryId: 'snacks',
        price: 70,
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-paneer-roll',
        name: 'Tandoori Paneer Kathi Roll',
        description: 'Marinated cottage cheese, bell peppers, onions and mint mayo wrapped in a flaky paratha.',
        categoryId: 'snacks',
        price: 75,
        imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-masala-chai',
        name: 'Special Masala Chai',
        description: 'Hot brewed Assam tea infused with crushed cardamom, ginger, cloves and milk.',
        categoryId: 'beverages',
        price: 15,
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-filter-coffee',
        name: 'South Indian Filter Coffee',
        description: 'Strong, frothy decoction blended with hot frothed milk in traditional brass tumbler.',
        categoryId: 'beverages',
        price: 20,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-cold-coffee',
        name: 'Cold Coffee with Ice Cream',
        description: 'Chilled blended creamy coffee shake topped with vanilla ice cream and chocolate cocoa.',
        categoryId: 'beverages',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 6,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-gulab-jamun',
        name: 'Warm Gulab Jamun (2 pcs)',
        description: 'Soft melt-in-mouth milk-solid dumplings soaked in rose and cardamom sugar syrup.',
        categoryId: 'desserts',
        price: 40,
        imageUrl: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        itemId: 'item-brownie',
        name: 'Sizzling Chocolate Brownie',
        description: 'Fudgy Dutch cocoa brownie served warm with a scoop of vanilla ice cream.',
        categoryId: 'desserts',
        price: 65,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
        available: true,
        preparationTimeMinutes: 7,
        createdAt: now,
        updatedAt: now,
      },
    ];
    menuItems.forEach((m) => this.setDoc('menuItems', m.itemId, m));

    // 3. Test Users
    const users = [
      {
        uid: 'dev-student-1',
        displayName: 'Aarav Sharma (Student)',
        email: 'student@canteen.edu',
        role: 'student',
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'dev-staff-1',
        displayName: 'Chef Ramesh (Staff)',
        email: 'staff@canteen.edu',
        role: 'staff',
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'dev-admin-1',
        displayName: 'Campus Admin',
        email: 'admin@canteen.edu',
        role: 'admin',
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    users.forEach((u) => this.setDoc('users', u.uid, u));

    // 4. Sample Realistic Orders
    const baseDate = new Date();
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const orderDate = new Date(baseDate);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      const ordersCount = daysAgo === 0 ? 5 : 4;

      for (let i = 0; i < ordersCount; i++) {
        orderDate.setHours(9 + i * 2, 15, 0, 0);
        const dateStr = orderDate.toISOString();
        const datePrefix = dateStr.slice(0, 10).replace(/-/g, '');
        const orderId = `ORD-${datePrefix}-${1000 + daysAgo * 10 + i}`;

        let status: any = 'collected';
        if (daysAgo === 0) {
          if (i === 0) status = 'placed';
          else if (i === 1) status = 'accepted';
          else if (i === 2) status = 'preparing';
          else if (i === 3) status = 'ready';
          else status = 'collected';
        }

        const items = [
          { itemId: 'item-dosa', name: 'Crispy Masala Dosa', price: 60, quantity: 2, subtotal: 120 },
          { itemId: 'item-masala-chai', name: 'Special Masala Chai', price: 15, quantity: 2, subtotal: 30 },
        ];
        const total = 150;

        const order = {
          orderId,
          studentId: 'dev-student-1',
          studentName: 'Aarav Sharma',
          studentEmail: 'student@canteen.edu',
          items,
          instructions: 'Extra chutney please',
          subtotal: total,
          tax: 0,
          total,
          paymentMethod: 'test_mode',
          paymentStatus: status === 'placed' ? 'pending' : 'paid',
          status,
          statusHistory: [
            { status: 'placed', timestamp: dateStr, actorUid: 'dev-student-1', actorRole: 'student' },
            ...(status !== 'placed'
              ? [{ status, timestamp: dateStr, actorUid: 'dev-staff-1', actorRole: 'staff' }]
              : []),
          ],
          createdAt: dateStr,
          updatedAt: dateStr,
          collectedAt: status === 'collected' ? dateStr : null,
        };

        this.setDoc('orders', orderId, order);
      }
    }
  }
}
