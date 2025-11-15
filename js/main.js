(function ($) {
    "use strict";
    
    // Render login/logout controls in site navigation
    function renderAuthNav() {
        var $containers = $('.auth-links');

        if (!$containers.length) {
            return;
        }

        var token = null;

        try {
            token = localStorage.getItem('user_token');
        } catch (error) {
            token = null;
        }

        $containers.each(function () {
            var $container = $(this);

            $container.empty();
            $container.addClass('align-items-center');

            if (!token) {
                $container.append('<a href="login.html" class="btn btn-sm btn-outline-light mr-md-2 mb-2 mb-md-0">Login</a>');
                $container.append('<a href="register.html" class="btn btn-sm btn-success">Register</a>');
                return;
            }

            var payload;

            try {
                var parts = token.split('.');
                payload = parts.length === 3 ? JSON.parse(atob(parts[1])) : null;
            } catch (error) {
                payload = null;
            }

            if (!payload) {
                $container.append('<a href="login.html" class="btn btn-sm btn-outline-light mr-md-2 mb-2 mb-md-0">Login</a>');
                $container.append('<a href="register.html" class="btn btn-sm btn-success">Register</a>');
                return;
            }

            var username = payload.username || 'Account';
            var $label = $('<span class="navbar-text text-white pr-3 mb-2 mb-md-0"></span>').text('Hi, ' + username);
            var $logout = $('<button type="button" class="btn btn-sm btn-outline-light">Logout</button>');

            $logout.on('click', function () {
                localStorage.removeItem('user_token');
                // Redirect to index page and force reload
                if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                    window.location.reload();
                } else {
                    window.location.href = 'index.html';
                }
            });

            $container.append($label, $logout);
        });
    }
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 768) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
        renderAuthNav();
    });
    
    window.addEventListener('storage', function (event) {
        if (event.key === 'user_token') {
            renderAuthNav();
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    
    
    // Home page slider
    $('.main-slider').slick({
        autoplay: true,
        autoplaySpeed: 2000,
        dots: true,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
    });

    $('.cta-rotator').slick({
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        dots: true,
        fade: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
    });
    
    
    // Product Slider 4 Column
    $('.product-slider-4').slick({
        autoplay: true,
        infinite: true,
        dots: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
            },
        ]
    });
    
    
    // Product Slider 3 Column
    $('.product-slider-3').slick({
        autoplay: true,
        infinite: true,
        dots: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
            },
        ]
    });
    
    
    // Single Product Slider
    $('.product-slider-single').slick({
        infinite: true,
        dots: false,
        slidesToShow: 1,
        slidesToScroll: 1
    });
    
    
    // Brand Slider
    $('.brand-slider').slick({
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 1000,
        infinite: true,
        arrows: false,
        dots: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 300,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    });
    
    
    // Quantity
    $('.qty button').on('click', function () {
        var $button = $(this);
        var oldValue = $button.parent().find('input').val();
        if ($button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent().find('input').val(newVal);
    });
    
    
    // Shipping address show hide
    $('.checkout #shipto').change(function () {
        if($(this).is(':checked')) {
            $('.checkout .shipping-address').slideDown();
        } else {
            $('.checkout .shipping-address').slideUp();
        }
    });
    
    
    // Payment methods show hide
    $('.checkout .payment-method .custom-control-input').change(function () {
        if ($(this).prop('checked')) {
            var checkbox_id = $(this).attr('id');
            $('.checkout .payment-method .payment-content').slideUp();
            $('#' + checkbox_id + '-show').slideDown();
        }
    });
})(jQuery);

