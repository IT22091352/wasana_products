// Inquiry Form JavaScript
(function ($) {
    "use strict";
    
    // ============================================
    // TODO: EMAILJS CONFIGURATION
    // ============================================
    // Replace these values with your EmailJS credentials:
    // 1. Go to https://www.emailjs.com/
    // 2. Create an account and set up a service
    // 3. Create an email template
    // 4. Get your Public Key, Service ID, and Template ID
    // 5. Replace the values below:
    
    const EMAILJS_PUBLIC_KEY = 'Vi8r3F0cYN4DHKM6O'; // TODO: Replace with your EmailJS Public Key
    const EMAILJS_SERVICE_ID = 'service_6jxbgac'; // TODO: Replace with your EmailJS Service ID
    const EMAILJS_TEMPLATE_ID = 'template_2uczeyb'; // TODO: Replace with your EmailJS Template ID
    
    // ============================================
    
    // Product prices
    const productPrices = {
        'pure-white': 2500,
        'inside-printed': 3000,
        'sealed-printed': 3500
    };
    
    // Product names
    const productNames = {
        'pure-white': 'Pure White Medicine Envelopes',
        'inside-printed': 'Inside Printed Envelopes',
        'sealed-printed': 'Sealed Printed Envelopes'
    };
    
    // Initialize EmailJS
    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        } else {
            console.error('EmailJS library not loaded');
        }
    }
    
    // Update order summary
    function updateOrderSummary() {
        var product = $('#product').val();
        var size = $('#size').val();
        var quantity = parseInt($('#quantity').val()) || 0;
        
        if (product && quantity > 0) {
            var price = productPrices[product] || 0;
            var total = price * quantity;
            
            $('#summary-product').text(productNames[product] || '-');
            $('#summary-size').text(size || '-');
            $('#summary-quantity').text(quantity);
            $('#summary-price').text('LKR ' + price.toLocaleString());
            $('#summary-total').text('LKR ' + total.toLocaleString());
        } else {
            $('#summary-product').text('-');
            $('#summary-size').text('-');
            $('#summary-quantity').text('-');
            $('#summary-price').text('LKR 0');
            $('#summary-total').text('LKR 0');
        }
    }
    
    // Get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Handle form submission with EmailJS
    function handleFormSubmission(e) {
        e.preventDefault();
        
        // Check if EmailJS is configured
        // (Removed dummy check; these are the real IDs.)


        
        
        // Disable submit button to prevent double submission
        var $submitBtn = $('#inquiry-form button[type="submit"]');
        var originalText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Sending...');
        
        // Get form values
        var customerName = $('#customer_name').val();
        var phone = $('#phone').val();
        var email = $('#email').val();
        var address = $('#address').val();
        var city = $('#city').val();
        var deliveryMethod = $('#delivery_method').val();
        var product = $('#product').val();
        var productName = productNames[product] || product;
        var size = $('#size').val();
        var quantity = $('#quantity').val();
        var price = productPrices[product] || 0;
        var total = price * parseInt(quantity);
        
        // Prepare email template parameters
        var templateParams = {
            customer_name: customerName,
            phone: phone,
            email: email,
            address: address,
            city: city,
            delivery_method: deliveryMethod,
            product: productName,
            size: size,
            quantity: quantity,
            price_per_bundle: 'LKR ' + price.toLocaleString(),
            total_amount: 'LKR ' + total.toLocaleString(),
            // Formatted message for email body
            message: 'New Order Inquiry from Wasana Products Website\n\n' +
                    'Customer Information:\n' +
                    'Name: ' + customerName + '\n' +
                    'Phone: ' + phone + '\n' +
                    'Email: ' + email + '\n' +
                    'Address: ' + address + '\n' +
                    'City: ' + city + '\n' +
                    'Delivery Method: ' + deliveryMethod + '\n\n' +
                    'Product Information:\n' +
                    'Product: ' + productName + '\n' +
                    'Size: ' + size + '\n' +
                    'Quantity: ' + quantity + ' Bundle(s)\n' +
                    'Price per Bundle: LKR ' + price.toLocaleString() + '\n' +
                    'Total Amount: LKR ' + total.toLocaleString() + '\n\n' +
                    'Note: 1 Bundle = 1000 Envelopes',
            to_email: 'wasanaenvelopes@gmail.com'
        };
        
        // Option 1: Send to backend API (Recommended)
        // Uncomment the code below to use backend API instead of EmailJS
        
        /*
        const API_URL = window.location.origin + '/api/inquiries';
        
        $.ajax({
            url: API_URL,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                customer_name: customerName,
                phone: phone,
                email: email,
                address: address,
                city: city,
                delivery_method: deliveryMethod,
                product: product,
                size: size,
                quantity: quantity
            }),
            success: function(response) {
                if (response.success) {
                    // Show success message
                    alert('Thank you! Your inquiry has been submitted successfully. We will contact you shortly.');
                    
                    // Redirect to success page
                    window.location.href = 'inquiry-success.html';
                } else {
                    throw new Error(response.message || 'Submission failed');
                }
            },
            error: function(xhr) {
                // Re-enable submit button
                $submitBtn.prop('disabled', false).html(originalText);
                
                const errorMsg = xhr.responseJSON?.message || 'Error submitting inquiry';
                alert('Sorry, there was an error sending your inquiry: ' + errorMsg + '. Please try again or contact us directly via phone or WhatsApp.');
            }
        });
        */
        
        // Option 2: Send email using EmailJS (Current implementation)
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                // Success
                console.log('Email sent successfully!', response.status, response.text);
                
                // Show success message
                alert('Thank you! Your inquiry has been submitted successfully. We will contact you shortly.');
                
                // Redirect to success page
                window.location.href = 'inquiry-success.html';
            }, function(error) {
                // Error handling
                console.error('EmailJS error:', error);
                
                // Re-enable submit button
                $submitBtn.prop('disabled', false).html(originalText);
                
                // Show error alert
                alert('Sorry, there was an error sending your inquiry. Please try again or contact us directly via phone or WhatsApp.');
            });
    }
    
    // Load cart items and display as editable table
    function loadCartItemsTable() {
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        var cartItems = window.CartStorage.getItems();
        var $container = $('#cart-products-container');
        var $empty = $('#cart-products-empty');
        var $body = $('#cart-products-body');
        
        if (!cartItems || cartItems.length === 0) {
            $container.hide();
            $empty.show();
            loadCartItems(); // Update order summary
            return;
        }
        
        $container.show();
        $empty.hide();
        $body.empty();
        
        cartItems.forEach(function(item, index) {
            var productName = productNames[item.product] || item.product;
            var row = '<tr data-index="' + index + '">' +
                '<td>' +
                '<select class="form-control form-control-sm cart-product-select" data-index="' + index + '">' +
                '<option value="pure-white"' + (item.product === 'pure-white' ? ' selected' : '') + '>Pure White</option>' +
                '<option value="inside-printed"' + (item.product === 'inside-printed' ? ' selected' : '') + '>Inside Printed</option>' +
                '<option value="sealed-printed"' + (item.product === 'sealed-printed' ? ' selected' : '') + '>Sealed Printed</option>' +
                '</select>' +
                '</td>' +
                '<td>' +
                '<select class="form-control form-control-sm cart-size-select" data-index="' + index + '">' +
                '<option value="S"' + (item.size === 'S' ? ' selected' : '') + '>S</option>' +
                '<option value="M"' + (item.size === 'M' ? ' selected' : '') + '>M</option>' +
                '<option value="L"' + (item.size === 'L' ? ' selected' : '') + '>L</option>' +
                '</select>' +
                '</td>' +
                '<td>' +
                '<input type="number" class="form-control form-control-sm cart-quantity-input" data-index="' + index + '" value="' + item.quantity + '" min="1" style="width: 80px;">' +
                '</td>' +
                '<td>' +
                '<input type="text" class="form-control form-control-sm cart-notes-input" data-index="' + index + '" value="' + (item.notes || '') + '" placeholder="Optional notes">' +
                '</td>' +
                '<td class="text-center">' +
                '<button type="button" class="btn btn-sm btn-danger cart-remove-btn" data-index="' + index + '"><i class="fa fa-trash"></i></button>' +
                '</td>' +
                '</tr>';
            $body.append(row);
        });
        
        loadCartItems(); // Update order summary
    }
    
    // Update cart item
    function updateCartItem(index, field, value) {
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        var updates = {};
        updates[field] = value;
        window.CartStorage.updateItem(index, updates);
        loadCartItemsTable();
    }
    
    // Remove cart item
    function removeCartItem(index) {
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        window.CartStorage.removeItem(index);
        loadCartItemsTable();
    }
    
    // Clear all cart items
    function clearCartItems() {
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        if (confirm('Are you sure you want to clear all items from the cart?')) {
            window.CartStorage.clear();
            loadCartItemsTable();
        }
    }
    
    // Add single product to cart from form
    function addProductToCart() {
        var product = $('#product').val();
        var size = $('#size').val();
        var quantity = parseInt($('#quantity').val()) || 1;
        var notes = $('#single-notes').val() || '';
        
        if (!product) {
            alert('Please select a product');
            return;
        }
        
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        window.CartStorage.addItem({
            product: product,
            size: size,
            quantity: quantity,
            notes: notes
        });
        
        // Show feedback
        $('#direct-add-feedback').fadeIn().delay(2000).fadeOut();
        
        // Reset form
        $('#product').val('');
        $('#size').val('M');
        $('#quantity').val('1');
        $('#single-notes').val('');
        
        // Reload table
        loadCartItemsTable();
    }
    
    // Load cart items and display in order summary
    function loadCartItems() {
        if (typeof window.CartStorage === 'undefined') {
            return;
        }
        
        var cartItems = window.CartStorage.getItems();
        if (!cartItems || cartItems.length === 0) {
            $('#order-summary-cart').hide();
            $('#order-summary-single').show();
            return;
        }
        
        // Show cart summary, hide single product summary
        $('#order-summary-cart').show();
        $('#order-summary-single').hide();
        
        var $cartItemsContainer = $('#order-summary-cart-items');
        $cartItemsContainer.empty();
        
        // Group identical products (same product + size)
        var groupedItems = {};
        cartItems.forEach(function(item) {
            var key = item.product + '_' + item.size;
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    product: item.product,
                    size: item.size,
                    quantity: 0
                };
            }
            groupedItems[key].quantity += parseInt(item.quantity) || 1;
        });
        
        var grandTotal = 0;
        
        // Display grouped items
        Object.keys(groupedItems).forEach(function(key) {
            var item = groupedItems[key];
            var productName = productNames[item.product] || item.product;
            // Shorten product name for compact display
            var shortName = productName.replace('Medicine Envelopes', '').replace('Envelopes', '').trim();
            var price = productPrices[item.product] || 0;
            var quantity = item.quantity;
            var itemTotal = price * quantity;
            grandTotal += itemTotal;
            
            var itemHtml = '<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-size: 14px; color: #fff;"><strong>' + quantity + '×</strong> ' + shortName + ' (' + item.size + ')</span>' +
                '<span style="font-size: 14px; font-weight: 600; color: #fff;">LKR ' + itemTotal.toLocaleString() + '</span>' +
                '</div>' +
                '</div>';
            
            $cartItemsContainer.append(itemHtml);
        });
        
        $('#order-summary-cart-total').text('LKR ' + grandTotal.toLocaleString());
    }
    
    // Initialize on page load
    $(document).ready(function() {
        // Check if user is logged in
        var token = localStorage.getItem('user_token');
        var $loginPrompt = $('#inquiry-login-prompt');
        var $formWrapper = $('#inquiry-form-wrapper');
        
        if (!token) {
            // User not logged in - show prompt, hide form
            $loginPrompt.show();
            $formWrapper.hide();
            return;
        } else {
            // User logged in - show form, hide prompt
            $loginPrompt.hide();
            $formWrapper.show();
        }
        
        // Initialize EmailJS
        initEmailJS();
        
        // Load cart items into editable table
        loadCartItemsTable();
        
        // Handle cart item updates
        $(document).on('change', '.cart-product-select', function() {
            var index = $(this).data('index');
            var value = $(this).val();
            updateCartItem(index, 'product', value);
        });
        
        $(document).on('change', '.cart-size-select', function() {
            var index = $(this).data('index');
            var value = $(this).val();
            updateCartItem(index, 'size', value);
        });
        
        $(document).on('change', '.cart-quantity-input', function() {
            var index = $(this).data('index');
            var value = parseInt($(this).val()) || 1;
            updateCartItem(index, 'quantity', value);
        });
        
        $(document).on('blur', '.cart-notes-input', function() {
            var index = $(this).data('index');
            var value = $(this).val();
            updateCartItem(index, 'notes', value);
        });
        
        $(document).on('click', '.cart-remove-btn', function() {
            var index = $(this).data('index');
            removeCartItem(index);
        });
        
        $('#clear-cart-items').on('click', function() {
            clearCartItems();
        });
        
        $('#add-direct-product').on('click', function() {
            addProductToCart();
        });
        
        // Load product from URL if present
        var urlProduct = getUrlParameter('product');
        var urlQuantity = getUrlParameter('quantity');
        var urlSize = getUrlParameter('size');
        
        if (urlProduct) {
            $('#product').val(urlProduct);
        }
        if (urlQuantity) {
            $('#quantity').val(urlQuantity);
        }
        if (urlSize) {
            $('#size').val(urlSize);
        }
        
        // Update summary on load
        updateOrderSummary();
        
        // Update summary on change
        $('#product, #size, #quantity').on('change', updateOrderSummary);
        
        // Handle quantity buttons
        $('.btn-plus').on('click', function() {
            var $qty = $('#quantity');
            var val = parseInt($qty.val()) || 0;
            $qty.val(val + 1).trigger('change');
            updateOrderSummary();
        });
        
        $('.btn-minus').on('click', function() {
            var $qty = $('#quantity');
            var val = parseInt($qty.val()) || 1;
            if (val > 1) {
                $qty.val(val - 1).trigger('change');
                updateOrderSummary();
            }
        });
        
        // Handle form submission
        $('#inquiry-form').on('submit', handleFormSubmission);
    });
    
})(jQuery);

