(function ($) {
    "use strict";

    var PRODUCT_NAMES = {
        'pure-white': 'Pure White Medicine Envelopes',
        'inside-printed': 'Inside Printed Envelopes',
        'sealed-printed': 'Sealed Printed Envelopes'
    };

    function getCartItems() {
        if (window.CartStorage && typeof window.CartStorage.getItems === 'function') {
            return window.CartStorage.getItems();
        }
        return [];
    }

    function renderCart() {
        var items = getCartItems();
        var $tbody = $('#cart-items');
        var $proceedBtn = $('#proceed-to-inquiry');
        var $emptyMessage = $('#cart-empty-state');

        if (!$tbody.length) {
            return;
        }

        $tbody.empty();

        if (!items.length) {
            if ($emptyMessage.length) {
                $emptyMessage.show();
            } else {
                $tbody.append('<tr id="cart-empty-state"><td colspan="5" class="text-center text-muted" style="padding:40px 20px;">No products added yet. Browse our <a href="product-list.html">product range</a> and use "Add to Inquiry" to build your request.</td></tr>');
            }
            if ($proceedBtn.length) {
                $proceedBtn.prop('disabled', true).addClass('disabled');
            }
            return;
        }

        if ($emptyMessage.length) {
            $emptyMessage.remove();
        }

        if ($proceedBtn.length) {
            $proceedBtn.prop('disabled', false).removeClass('disabled');
        }

        items.forEach(function (item, index) {
            var productName = PRODUCT_NAMES[item.product] || item.product || 'Unknown Product';
            var sizeOptions = ['S', 'M', 'L'].map(function (size) {
                return '<option value="' + size + '"' + (item.size === size ? ' selected' : '') + '> ' + size + ' </option>';
            }).join('');

            var rowHtml = [
                '<tr data-index="' + index + '">',
                '<td>' + productName + '</td>',
                '<td>',
                '<select class="form-control cart-size">' + sizeOptions + '</select>',
                '</td>',
                '<td>',
                '<div class="input-group input-group-sm cart-quantity-group">',
                '<div class="input-group-prepend">',
                '<button class="btn btn-outline-secondary cart-minus" type="button"><i class="fa fa-minus"></i></button>',
                '</div>',
                '<input type="number" min="1" class="form-control cart-quantity" value="' + item.quantity + '">',
                '<div class="input-group-append">',
                '<button class="btn btn-outline-secondary cart-plus" type="button"><i class="fa fa-plus"></i></button>',
                '</div>',
                '</div>',
                '</td>',
                '<td><textarea class="form-control cart-notes" rows="1" placeholder="Optional notes">' + (item.notes || '') + '</textarea></td>',
                '<td class="text-center">',
                '<button class="btn btn-sm btn-outline-danger cart-remove" type="button" title="Remove"><i class="fa fa-trash"></i></button>',
                '</td>',
                '</tr>'
            ].join('');

            $tbody.append(rowHtml);
        });
    }

    function persistFromDom($row) {
        var index = parseInt($row.data('index'), 10);
        if (isNaN(index)) {
            return;
        }
        var size = $row.find('.cart-size').val() || 'M';
        var quantityInput = $row.find('.cart-quantity');
        var quantity = Math.max(parseInt(quantityInput.val(), 10) || 1, 1);
        quantityInput.val(quantity);
        var notes = $row.find('.cart-notes').val() || '';
        if (window.CartStorage && typeof window.CartStorage.updateItem === 'function') {
            window.CartStorage.updateItem(index, {
                size: size,
                quantity: quantity,
                notes: notes
            });
        }
        // Re-render to ensure indices stay correct
        renderCart();
    }

    function bindEvents() {
        var $tbody = $('#cart-items');

        $tbody.on('click', '.cart-minus', function () {
            var $row = $(this).closest('tr');
            var $qty = $row.find('.cart-quantity');
            var current = Math.max(parseInt($qty.val(), 10) || 1, 1);
            if (current > 1) {
                $qty.val(current - 1);
                persistFromDom($row);
            }
        });

        $tbody.on('click', '.cart-plus', function () {
            var $row = $(this).closest('tr');
            var $qty = $row.find('.cart-quantity');
            var current = Math.max(parseInt($qty.val(), 10) || 1, 1);
            $qty.val(current + 1);
            persistFromDom($row);
        });

        $tbody.on('change', '.cart-size', function () {
            var $row = $(this).closest('tr');
            persistFromDom($row);
        });

        $tbody.on('change blur', '.cart-quantity', function () {
            var $row = $(this).closest('tr');
            persistFromDom($row);
        });

        $tbody.on('blur', '.cart-notes', function () {
            var $row = $(this).closest('tr');
            persistFromDom($row);
        });

        $tbody.on('click', '.cart-remove', function () {
            var $row = $(this).closest('tr');
            var index = parseInt($row.data('index'), 10);
            if (window.CartStorage && typeof window.CartStorage.removeItem === 'function') {
                window.CartStorage.removeItem(index);
            }
            renderCart();
        });

        $('#clear-cart').on('click', function (e) {
            e.preventDefault();
            if (window.CartStorage && typeof window.CartStorage.clear === 'function') {
                window.CartStorage.clear();
            }
            renderCart();
        });
    }

    $(document).ready(function () {
        renderCart();
        bindEvents();
    });

})(jQuery);
