export interface Category {
  categoryId: string;
  name: string;
  description: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface MenuItem {
  itemId: string;
  name: string;
  description: string;
  categoryId: string;
  price: number; // in INR ₹
  imageUrl: string;
  available: boolean;
  preparationTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}
