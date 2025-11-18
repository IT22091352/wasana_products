// Product Detail JavaScript
(function ($) {
    "use strict";
    
    // Product data
    const products = {
        'pure-white': {
            title: 'Pure White Medicine Envelopes',
            price: 'LKR 2,500',
            description: 'Premium quality white paper envelopes designed specifically for pharmacies and dispensaries. Made with high-quality paper to ensure durability and professional appearance. Each bundle contains 1000 envelopes.',
            image: 'img/product1.png',
            descTitle: 'Pure White Medicine Envelopes',
            descText: 'Our Pure White Medicine Envelopes are manufactured using premium quality paper to ensure durability and a professional appearance. These envelopes are specifically designed for use in pharmacies and dispensaries across Sri Lanka.'
        },
        'inside-printed': {
            title: 'Inside Printed Envelopes',
            price: 'LKR 3,000',
            description: 'White envelopes with printed text inside. Perfect for pharmacies that need to include medication instructions or branding. Made with quality paper and professional printing. Each bundle contains 1000 envelopes.',
            image: 'img/product2.png',
            descTitle: 'Inside Printed Envelopes',
            descText: 'These envelopes feature professional printing on the inside, making them ideal for pharmacies that want to include medication instructions, branding, or other information. Manufactured with high-quality paper and printing standards.'
        },
        'sealed-printed': {
            title: 'Sealed Printed Envelopes',
            price: 'LKR 3,500',
            description: 'Professional sealed envelopes with printing. These premium envelopes offer both functionality and branding opportunities. Each bundle contains 1000 envelopes.',
            image: 'img/product1.png',
            descTitle: 'Sealed Printed Envelopes',
            descText: 'Our Sealed Printed Envelopes are the premium option, featuring professional sealing and printing capabilities. These are ideal for pharmacies looking for the highest quality packaging solution with branding options.'
        }
    };
    
    // Get product from URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Load product data
    function loadProduct() {
        var productId = getUrlParameter('product') || 'pure-white';
        var product = products[productId] || products['pure-white'];
        
        // Update page content
        $('#product-title').text(product.title);
        $('#product-price').text(product.price);
        $('#product-description').html(product.description);
        $('#product-image').attr('src', product.image);
        $('#desc-title').text(product.descTitle);
        $('#desc-text').text(product.descText);
        
        $('#add-to-inquiry').data('product-id', productId);
    }
    
    function adjustQuantity(delta) {
        var $qty = $('#quantity');
        var current = Math.max(parseInt($qty.val(), 10) || 1, 1);
        var next = current + delta;
        if (next < 1) {
            next = 1;
        }
        $qty.val(next);
    }

    function showCartMessage(message, type) {
        var $alert = $('#cart-feedback');
        if (!$alert.length) {
            return;
        }
        var alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
        $alert.removeClass('alert-success alert-danger').addClass(alertClass).text(message).fadeIn();
        setTimeout(function () {
            $alert.fadeOut();
        }, 3000);
    }

    function addToCart() {
        // Check if user is logged in
        var token = localStorage.getItem('user_token');
        if (!token) {
            // Redirect immediately to login page
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }

        var productId = $('#add-to-inquiry').data('product-id') || getUrlParameter('product') || 'pure-white';
        var size = $('#product-size').val() || 'M';
        var quantity = Math.max(parseInt($('#quantity').val(), 10) || 1, 1);

        if (!window.CartStorage || typeof window.CartStorage.addItem !== 'function') {
            window.location.href = 'inquiry.html?product=' + productId + '&quantity=' + quantity + '&size=' + size;
            return;
        }

        window.CartStorage.addItem({
            product: productId,
            size: size,
            quantity: quantity
        });

        // Redirect to inquiry form after adding to cart
        window.location.href = 'inquiry.html';
    }
    
    // Initialize on page load
    $(document).ready(function() {
        loadProduct();

        $('.btn-plus').on('click', function (e) {
            e.preventDefault();
            adjustQuantity(1);
        });

        $('.btn-minus').on('click', function (e) {
            e.preventDefault();
            adjustQuantity(-1);
        });

        $('#add-to-inquiry').on('click', function (e) {
            e.preventDefault();
            addToCart();
        });
    });
    
})(jQuery);


