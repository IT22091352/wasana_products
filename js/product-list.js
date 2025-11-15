(function ($) {
    "use strict";

    var DEFAULT_SIZE = 'M';
    var DEFAULT_QUANTITY = 1;

    var productNames = {
        'pure-white': 'Pure White Medicine Envelopes',
        'inside-printed': 'Inside Printed Envelopes',
        'sealed-printed': 'Sealed Printed Envelopes'
    };

    function showFeedback(message, type) {
        var $feedback = $('#product-list-feedback');
        if (!$feedback.length) {
            return;
        }
        var alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
        $feedback
            .removeClass('alert-success alert-danger')
            .addClass(alertClass)
            .text(message)
            .stop(true, true)
            .fadeIn();

        var existingTimeout = $feedback.data('timeoutId');
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        var timeoutId = setTimeout(function () {
            $feedback.fadeOut();
        }, 3000);
        $feedback.data('timeoutId', timeoutId);
    }

    function addItemToCart(productId) {
        // Check if user is logged in
        var token = localStorage.getItem('user_token');
        if (!token) {
            // Redirect to login page with current page as redirect
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }

        if (!productId) {
            return;
        }
        if (!window.CartStorage || typeof window.CartStorage.addItem !== 'function') {
            window.location.href = 'product-detail.html?product=' + encodeURIComponent(productId);
            return;
        }
        window.CartStorage.addItem({
            product: productId,
            size: DEFAULT_SIZE,
            quantity: DEFAULT_QUANTITY
        });

        var message = productNames[productId]
            ? productNames[productId] + ' added to your inquiry cart.'
            : 'Item added to your inquiry cart.';
        showFeedback(message, 'success');
    }

    $(document).ready(function () {
        $('.product-card-add').on('click', function (event) {
            event.preventDefault();
            var productId = $(this).data('productId');
            addItemToCart(productId);
        });
    });
})(jQuery);
