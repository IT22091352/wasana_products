(function (window) {
    "use strict";

    var STORAGE_KEY = 'inquiry_cart';

    function readCart() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed.map(function (item) {
                return {
                    product: item.product,
                    size: item.size || 'M',
                    quantity: Math.max(parseInt(item.quantity, 10) || 1, 1),
                    notes: item.notes || ''
                };
            });
        } catch (error) {
            console.error('Failed to read inquiry cart from storage', error);
            return [];
        }
    }

    function writeCart(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to persist inquiry cart', error);
        }
    }

    function getItems() {
        return readCart();
    }

    function addItem(item) {
        if (!item || !item.product) {
            return;
        }
        var items = readCart();
        items.push({
            product: item.product,
            size: item.size || 'M',
            quantity: Math.max(parseInt(item.quantity, 10) || 1, 1),
            notes: item.notes || ''
        });
        writeCart(items);
        return items;
    }

    function updateItem(index, updates) {
        var items = readCart();
        if (index < 0 || index >= items.length) {
            return items;
        }
        var current = items[index];
        items[index] = {
            product: updates.product || current.product,
            size: updates.size || current.size,
            quantity: Math.max(parseInt(updates.quantity, 10) || current.quantity || 1, 1),
            notes: typeof updates.notes === 'string' ? updates.notes : current.notes
        };
        writeCart(items);
        return items;
    }

    function removeItem(index) {
        var items = readCart();
        if (index < 0 || index >= items.length) {
            return items;
        }
        items.splice(index, 1);
        writeCart(items);
        return items;
    }

    function clear() {
        writeCart([]);
    }

    window.CartStorage = {
        STORAGE_KEY: STORAGE_KEY,
        getItems: getItems,
        addItem: addItem,
        updateItem: updateItem,
        removeItem: removeItem,
        clear: clear
    };
})(window);
