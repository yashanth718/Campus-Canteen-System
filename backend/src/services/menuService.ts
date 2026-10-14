import { db } from '../config/firebase';
import { MenuItem, Category } from '../types/menu';

export class MenuService {
  private menuCollection = db.collection('menuItems');
  private categoryCollection = db.collection('categories');

  // Categories
  async getCategories(): Promise<Category[]> {
    const snapshot = await this.categoryCollection.orderBy('displayOrder', 'asc').get();
    return snapshot.docs.map((doc) => doc.data() as Category);
  }

  async createCategory(categoryData: Omit<Category, 'createdAt'>): Promise<Category> {
    const docRef = this.categoryCollection.doc(categoryData.categoryId);
    const category: Category = {
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    await docRef.set(category);
    return category;
  }

  // Menu items
  async getMenuItems(filters?: { categoryId?: string; availableOnly?: boolean; search?: string }): Promise<MenuItem[]> {
    let query: FirebaseFirestore.Query = this.menuCollection;

    if (filters?.categoryId && filters.categoryId !== 'all') {
      query = query.where('categoryId', '==', filters.categoryId);
    }

    if (filters?.availableOnly) {
      query = query.where('available', '==', true);
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map((doc) => doc.data() as MenuItem);

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    // Sort by name
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMenuItemById(itemId: string): Promise<MenuItem | null> {
    const doc = await this.menuCollection.doc(itemId).get();
    if (!doc.exists) return null;
    return doc.data() as MenuItem;
  }

  async createMenuItem(data: Omit<MenuItem, 'itemId' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const docRef = this.menuCollection.doc();
    const now = new Date().toISOString();
    const newItem: MenuItem = {
      ...data,
      itemId: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newItem);
    return newItem;
  }

  async updateMenuItem(itemId: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const docRef = this.menuCollection.doc(itemId);
    const existing = await docRef.get();
    if (!existing.exists) {
      throw new Error(`Menu item with ID "${itemId}" not found.`);
    }

    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as MenuItem;
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    const docRef = this.menuCollection.doc(itemId);
    const existing = await docRef.get();
    if (!existing.exists) {
      throw new Error(`Menu item with ID "${itemId}" not found.`);
    }
    await docRef.delete();
  }

  async setAvailability(itemId: string, available: boolean): Promise<MenuItem> {
    return this.updateMenuItem(itemId, { available });
  }
}

export const menuService = new MenuService();
