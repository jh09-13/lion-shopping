const STORAGE_PREFIX = "shop:";

function readCollection(key) {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function writeCollection(key, items) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
}

function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function createResourceService(key) {
  return {
    getAll() {
      return readCollection(key);
    },
    getById(id) {
      return readCollection(key).find((item) => item.id === id) ?? null;
    },
    create(data) {
      const items = readCollection(key);
      const item = { id: generateId(), ...data };
      items.push(item);
      writeCollection(key, items);
      return item;
    },
    update(id, patch) {
      const items = readCollection(key);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...patch, id };
      writeCollection(key, items);
      return items[index];
    },
    remove(id) {
      const items = readCollection(key);
      const next = items.filter((item) => item.id !== id);
      writeCollection(key, next);
      return next.length !== items.length;
    },
  };
}

export const productService = createResourceService("products");

export const userService = createResourceService("users");

export const orderService = (() => {
  const base = createResourceService("orders");
  return {
    ...base,
    getByUser(userId) {
      return base.getAll().filter((order) => order.userId === userId);
    },
    updateStatus(id, status) {
      return base.update(id, { status });
    },
  };
})();

export const cartService = (() => {
  const base = createResourceService("cart");
  return {
    getItems: base.getAll,
    addItem(productId, quantity = 1) {
      const existing = base.getAll().find((item) => item.productId === productId);
      if (existing) {
        return base.update(existing.id, { quantity: existing.quantity + quantity });
      }
      return base.create({ productId, quantity });
    },
    updateItem(id, quantity) {
      return base.update(id, { quantity });
    },
    removeItem(id) {
      return base.remove(id);
    },
  };
})();
