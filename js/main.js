(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Navbar on scrolling
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.navbar').fadeIn('slow').css('display', 'flex');
        } else {
            $('.navbar').fadeOut('slow').css('display', 'none');
        }
    });


    // Modal Video
    // The template had a video-modal flow triggered by .btn-play. We no longer use this flow
    // for the play button since we're repurposing it to start the auto-scroll. Keep the modal
    // markup in the HTML in case it's used elsewhere, but don't wire automatic src changes here.
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    // Sequential slow-scroll through sections when Explore More is clicked
    (function () {
        var autoScrollInProgress = false;
        var autoScrollAbort = false;
        // vars for abort handler shared across functions so we can unbind when finished
        var abortEvents;
        var abortHandler;

        function collectSections() {
            var sections = [];
            var start = $('.hero-header');
            if (!start.length) return sections;
            var next = start.next();
            // Collect next siblings until the site-footer (exclusive), include site-footer at end
            while (next.length && !next.is('#site-footer')) {
                // only consider element nodes that have visual height
                if (next.is(':visible') && next.outerHeight() > 50) {
                    sections.push(next);
                }
                next = next.next();
            }
            // add footer as final target if present
            var $footer = $('#site-footer');
            if ($footer.length) sections.push($footer);
            return sections;
        }

        function stopAutoScroll() {
            autoScrollAbort = true;
            autoScrollInProgress = false;
            // stop any ongoing jQuery animation
            $('html,body').stop(true);
        }

        function scrollSequence(seq, i) {
            if (autoScrollAbort || i >= seq.length) {
                autoScrollInProgress = false;
                // unbind any abort handler left bound
                try { if (abortEvents && abortHandler) $(window).off(abortEvents, abortHandler); } catch (e) {}
                console.log('Auto-scroll finished or aborted.');
                return;
            }
            var $el = seq[i];
            var top = $el.offset().top;
            console.log('Auto-scroll to section', i, $el.prop('tagName'), $el.attr('class'), 'top:', top);
            // longer durations for larger sections — base 1000ms + 400ms per step for a slow feel
            var duration = 1200;
            $('html,body').animate({ scrollTop: top }, duration, 'easeInOutExpo', function () {
                if (autoScrollAbort) {
                    autoScrollInProgress = false;
                    return;
                }
                // small pause between steps so user can perceive the sections
                setTimeout(function () {
                    scrollSequence(seq, i + 1);
                }, 600);
            });
        }

    // Start/stop handler (triggered by play button now)
    // Note: '#btn-explore' (hero "Contact Me") intentionally excluded so it can
    // perform a direct scroll to the contact form instead of starting auto-scroll.
    $('#btn-play-scroll').on('click', function (e) {
            e.preventDefault();
            // Toggle: if already running, stop on second click
            if (autoScrollInProgress) {
                stopAutoScroll();
                return false;
            }

            var seq = collectSections();
            if (!seq.length) return false;

            autoScrollAbort = false;
            autoScrollInProgress = true;


            // If user interacts (wheel/keydown/touch/mousedown), abort auto-scroll.
            // NOTE: do NOT listen for 'scroll' because programmatic scrolling triggers 'scroll' events
            // and would immediately cancel the animation.
            abortEvents = 'wheel DOMMouseScroll touchstart keydown mousedown';
            abortHandler = function () {
                console.log('Auto-scroll aborted by user interaction');
                stopAutoScroll();
                $(window).off(abortEvents, abortHandler);
            };
            $(window).on(abortEvents, abortHandler);

            // begin sequence (start from first collected section)
            // When the sequence completes (or aborts), ensure we unbind the abort handler
            var originalStop = stopAutoScroll;
            stopAutoScroll = function () {
                autoScrollAbort = true;
                autoScrollInProgress = false;
                $('html,body').stop(true);
                try { $(window).off(abortEvents, abortHandler); } catch (e) {}
                // restore original in case other code relied on it
                stopAutoScroll = originalStop;
            };

            console.log('Auto-scroll starting, steps:', seq.length);
            scrollSequence(seq, 0);
            return false;
        });
        
        // Hero 'Contact Me' button should smoothly scroll to the contact form
        $('#btn-explore').on('click', function (e) {
            e.preventDefault();
            var target = $('#contact');
            if (!target.length) return false;
            var navHeight = $('.navbar').outerHeight() || 72;
            var top = target.offset().top - navHeight + 1;
            $('html, body').animate({ scrollTop: top }, 800, 'easeInOutExpo', function () {
                // focus first field for accessibility
                try { $('#name').focus(); } catch (err) {}
            });
            // mark contact nav link active and collapse on mobile
            $('.navbar .nav-link').removeClass('active');
            $('.navbar .nav-link[href="#contact"]').addClass('active');
            $('.navbar-collapse').collapse('hide');
            return false;
        });
    })();

    // Smooth in-page navigation for navbar and dropdown items that use anchors
    $(document).on('click', '.navbar .nav-link, .dropdown-item', function (e) {
        var href = $(this).attr('href') || '';
        if (href.indexOf('#') === 0) {
            e.preventDefault();
            var target = $(href);
            if (target.length) {
                var navHeight = $('.navbar').outerHeight() || 72;
                var top = target.offset().top - navHeight + 1; // small offset
                $('html, body').animate({ scrollTop: top }, 800, 'easeInOutExpo');
                // update active class
                $('.navbar .nav-link').removeClass('active');
                $(this).addClass('active');
                // collapse navbar on mobile
                $('.navbar-collapse').collapse('hide');
            }
        }
    });

    // Contact form handler: open user's mail client with prefilled message to owner
    (function () {
        var $form = $('#contactForm');
        if (!$form.length) return;

        $form.on('submit', function (e) {
            e.preventDefault();
            var name = $.trim($('#name').val() || '');
            var email = $.trim($('#email').val() || '');
            var subject = $.trim($('#subject').val() || '');
            var message = $.trim($('#message').val() || '');
            var $alert = $('#contactAlert');

            // Basic required-field check
            if (!name || !email || !message) {
                $alert.removeClass('d-none alert-success alert-warning').addClass('alert-danger').text('Please fill in your name, email and a message before sending.').show();
                return false;
            }

            var recipient = 'vignesh86420@gmail.com';
            var mailSubject = subject ? subject : 'New contact from ' + name;

            var bodyLines = [];
            bodyLines.push('Name: ' + name);
            bodyLines.push('Email: ' + email);
            if (subject) bodyLines.push('Subject: ' + subject);
            bodyLines.push('');
            bodyLines.push('Message:');
            bodyLines.push(message);
            bodyLines.push('');
            bodyLines.push('---');
            bodyLines.push('Sent from: ' + window.location.href);

            var body = bodyLines.join('\n');
            var mailto = 'mailto:' + recipient + '?subject=' + encodeURIComponent(mailSubject) + '&body=' + encodeURIComponent(body);

            // Display a short message to the user
            if (mailto.length > 1900) {
                // Some mail clients have URL length limits
                $alert.removeClass('d-none alert-success').addClass('alert-warning').text('Your message is quite long — it may not open correctly in some mail clients. Consider shortening it or emailing directly.').show();
            } else {
                $alert.removeClass('d-none alert-danger alert-warning').addClass('alert-success').text('Opening your mail client. Please review the message and press Send to deliver.').show();
            }

            // Open the default mail client
            try {
                window.location.href = mailto;
            } catch (err) {
                // fallback to opening in new window
                window.open(mailto, '_blank');
            }

            return false;
        });
    })();
    
})(jQuery);

// Set current year in footer copyright
try {
    if (typeof jQuery !== 'undefined') {
        $('#copy-year').text(new Date().getFullYear());
    } else if (document.getElementById('copy-year')) {
        document.getElementById('copy-year').textContent = new Date().getFullYear();
    }
} catch (e) {
    // silent fail
}

