export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  formattedPrice?: string;
  image: string;
  fabric?: string;
  color?: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'bamas_cart';

export const cart = {
  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): CartItem[] {
    const items = this.getItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ ...item, quantity });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('bamas_cart_updated'));
    }
    return items;
  },

  updateQuantity(id: string, quantity: number): CartItem[] {
    let items = this.getItems();
    if (quantity <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const item = items.find((i) => i.id === id);
      if (item) item.quantity = quantity;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('bamas_cart_updated'));
    }
    return items;
  },

  removeItem(id: string): CartItem[] {
    const items = this.getItems().filter((i) => i.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('bamas_cart_updated'));
    }
    return items;
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
      window.dispatchEvent(new Event('bamas_cart_updated'));
    }
  },

  getCount(): number {
    return this.getItems().reduce((acc, item) => acc + item.quantity, 0);
  },

  getSubtotal(): number {
    return this.getItems().reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  },
};
