import { db } from '../src/config/firebase';
import { Category, MenuItem } from '../src/types/menu';
import { Order } from '../src/types/order';

const categories: Category[] = [
  {
    categoryId: 'breakfast',
    name: 'Breakfast',
    description: 'Freshly prepared morning breakfast items & South Indian delights',
    displayOrder: 1,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    categoryId: 'lunch',
    name: 'Lunch',
    description: 'Wholesome rice dishes, thalis, combo meals & curries',
    displayOrder: 2,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    categoryId: 'snacks',
    name: 'Snacks',
    description: 'Crispy samosas, chaats, sandwiches & quick bites',
    displayOrder: 3,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    categoryId: 'beverages',
    name: 'Beverages',
    description: 'Masala chai, filter coffee, milkshakes & fresh fruit juices',
    displayOrder: 4,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    categoryId: 'desserts',
    name: 'Desserts',
    description: 'Traditional sweets, brownies & ice cream treats',
    displayOrder: 5,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const menuItems: Omit<MenuItem, 'createdAt' | 'updatedAt'>[] = [
  // Breakfast
  {
    itemId: 'item-dosa',
    name: 'Crispy Masala Dosa',
    description: 'Golden fermented rice crepe with spiced potato filling, coconut chutney & hot sambar.',
    categoryId: 'breakfast',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 10,
  },
  {
    itemId: 'item-idli-vada',
    name: 'Idli Vada Combo',
    description: 'Two fluffy steamed rice cakes & one crispy medu vada served with chutney and sambar.',
    categoryId: 'breakfast',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 8,
  },
  {
    itemId: 'item-poori',
    name: 'Poori Bhaji (3 pcs)',
    description: 'Puffy deep-fried whole wheat bread served with mildly spiced potato masala curry.',
    categoryId: 'breakfast',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 12,
  },

  // Lunch
  {
    itemId: 'item-biryani',
    name: 'Hyderabadi Veg Biryani',
    description: 'Fragrant basmati rice layered with garden vegetables, saffron & aromatic spices. Served with raita.',
    categoryId: 'lunch',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 15,
  },
  {
    itemId: 'item-paneer-meal',
    name: 'Paneer Butter Masala with Butter Naan',
    description: 'Rich cottage cheese in a buttery tomato gravy paired with two tandoor-baked butter naans.',
    categoryId: 'lunch',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 18,
  },
  {
    itemId: 'item-thali',
    name: 'Executive South Indian Thali',
    description: 'Steamed rice, dal tadka, dry veg poriyal, sambar, rasam, curd, appalam & sweet gulab jamun.',
    categoryId: 'lunch',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 10,
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
  },

  // Snacks
  {
    itemId: 'item-samosa',
    name: 'Crispy Samosa (2 pcs)',
    description: 'Crisp pastry triangles stuffed with spiced potatoes and peas, served with sweet tamarind and mint chutney.',
    categoryId: 'snacks',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 5,
  },
  {
    itemId: 'item-pav-bhaji',
    name: 'Butter Pav Bhaji',
    description: 'Mashed spiced vegetable gravy loaded with butter, served with two soft toasted pav buns and lemon.',
    categoryId: 'snacks',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 10,
  },
  {
    itemId: 'item-paneer-roll',
    name: 'Tandoori Paneer Kathi Roll',
    description: 'Marinated cottage cheese, crunchy bell peppers, onions and mint mayo wrapped in a flaky paratha.',
    categoryId: 'snacks',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 10,
  },

  // Beverages
  {
    itemId: 'item-masala-chai',
    name: 'Special Masala Chai',
    description: 'Hot brewed Assam tea infused with crushed cardamom, ginger, cloves and milk.',
    categoryId: 'beverages',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 5,
  },
  {
    itemId: 'item-filter-coffee',
    name: 'South Indian Filter Coffee',
    description: 'Strong, frothy decoction blended with hot frothed milk in the traditional brass tumbler & davarah.',
    categoryId: 'beverages',
    price: 20,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 5,
  },
  {
    itemId: 'item-cold-coffee',
    name: 'Cold Coffee with Ice Cream',
    description: 'Chilled blended creamy coffee shake topped with a rich scoop of vanilla ice cream & cocoa.',
    categoryId: 'beverages',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 6,
  },

  // Desserts
  {
    itemId: 'item-gulab-jamun',
    name: 'Warm Gulab Jamun (2 pcs)',
    description: 'Soft melt-in-mouth milk-solid dumplings soaked in rose and cardamom scented sugar syrup.',
    categoryId: 'desserts',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 5,
  },
  {
    itemId: 'item-brownie',
    name: 'Sizzling Chocolate Brownie',
    description: 'Fudgy Dutch cocoa brownie served warm with a scoop of vanilla bean ice cream and chocolate drizzle.',
    categoryId: 'desserts',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTimeMinutes: 7,
  },
];

export async function runSeed() {
  console.log('[Seed] Starting database seeding for Campus Cloud Canteen...');

  // 1. Seed Categories
  for (const cat of categories) {
    await db.collection('categories').doc(cat.categoryId).set(cat);
  }
  console.log(`[Seed] Seeded ${categories.length} categories.`);

  // 2. Seed Menu Items
  const now = new Date().toISOString();
  for (const item of menuItems) {
    await db.collection('menuItems').doc(item.itemId).set({
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`[Seed] Seeded ${menuItems.length} menu items.`);

  // 3. Seed Default Test Users
  const testUsers = [
    {
      uid: 'dev-admin-1',
      displayName: 'Campus Admin',
      email: 'admin@canteen.edu',
      role: 'admin',
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
      uid: 'dev-student-1',
      displayName: 'Aarav Sharma (Student)',
      email: 'student@canteen.edu',
      role: 'student',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const u of testUsers) {
    await db.collection('users').doc(u.uid).set(u);
  }
  console.log(`[Seed] Seeded ${testUsers.length} test accounts (Admin, Staff, Student).`);

  // 4. Seed Realistic Historical & Today Orders for Analytics & Recharts
  const sampleOrders: Order[] = [];
  const baseDate = new Date();

  // Create orders across the past 7 days and today
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const orderDate = new Date(baseDate);
    orderDate.setDate(orderDate.getDate() - daysAgo);

    // Number of orders per day varies realistically between 4 and 10
    const ordersTodayCount = daysAgo === 0 ? 6 : Math.floor(4 + Math.random() * 6);

    for (let i = 0; i < ordersTodayCount; i++) {
      const hour = Math.floor(9 + Math.random() * 9); // between 9 AM and 6 PM
      const minute = Math.floor(Math.random() * 60);
      orderDate.setHours(hour, minute, 0, 0);

      const dateStr = orderDate.toISOString();
      const datePrefix = dateStr.slice(0, 10).replace(/-/g, '');
      const orderId = `ORD-${datePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Pick 1 to 3 items
      // Bias towards Masala Dosa and Biryani for popularity demo
      const randomItems = [
        {
          itemId: 'item-dosa',
          name: 'Crispy Masala Dosa',
          price: 60,
          quantity: Math.floor(1 + Math.random() * 2),
          subtotal: 60,
        },
        {
          itemId: 'item-masala-chai',
          name: 'Special Masala Chai',
          price: 15,
          quantity: Math.floor(1 + Math.random() * 3),
          subtotal: 15,
        },
      ];
      randomItems[0].subtotal = randomItems[0].price * randomItems[0].quantity;
      randomItems[1].subtotal = randomItems[1].price * randomItems[1].quantity;

      const subtotal = randomItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const total = subtotal;

      // In the past days, orders are mostly collected and paid
      // On day 0 (today), let some be 'preparing', 'ready', 'placed', and 'collected'
      let status: any = 'collected';
      if (daysAgo === 0) {
        if (i === 0) status = 'placed';
        else if (i === 1) status = 'accepted';
        else if (i === 2) status = 'preparing';
        else if (i === 3) status = 'ready';
        else status = 'collected';
      }

      sampleOrders.push({
        orderId,
        studentId: 'dev-student-1',
        studentName: 'Aarav Sharma',
        studentEmail: 'student@canteen.edu',
        items: randomItems,
        instructions: i % 2 === 0 ? 'Less spicy chutney please' : '',
        subtotal,
        tax: 0,
        total,
        paymentMethod: 'test_mode',
        paymentStatus: status === 'placed' ? 'pending' : 'paid',
        status,
        statusHistory: [
          {
            status: 'placed',
            timestamp: dateStr,
            actorUid: 'dev-student-1',
            actorRole: 'student',
          },
          ...(status !== 'placed'
            ? [
                {
                  status,
                  timestamp: dateStr,
                  actorUid: 'dev-staff-1',
                  actorRole: 'staff',
                },
              ]
            : []),
        ],
        createdAt: dateStr,
        updatedAt: dateStr,
        collectedAt: status === 'collected' ? dateStr : null,
      });
    }
  }

  for (const ord of sampleOrders) {
    await db.collection('orders').doc(ord.orderId).set(ord);
  }
  console.log(`[Seed] Seeded ${sampleOrders.length} realistic orders for analytics & Recharts visualization.`);

  console.log('[Seed] Database seeding completed successfully! ✨');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
