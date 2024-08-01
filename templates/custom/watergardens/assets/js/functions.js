// Check scrolling
$(document).on('scroll', function () {
    if ($(this).scrollTop() > 100) {
        $(this).find('body').addClass('scrolled');
    } else {
        $(this).find('body').removeClass('scrolled');
    }
});

$(document).ready(function () {

    $('img.svg').each(function () {
        convertImgSvg($(this));
    });

    //start trailer when button is pressed
    $(".movie-trailer").fancybox({
        autoscale: true,
        width: 800,
        height: 450,
        transitionIn: 'none',
        transitionOut: 'none',
        padding: 0,
        scrolling: 'no',
        title: $(this).title,
        href: this.href,
        beforeShow: function () {
            $(".fancybox-skin").css("backgroundColor", "#000000");
        }
    });
    $('body').on('click', function () {
        $('#ui-datepicker-div').removeClass('datepicker-opened');
    });
    $('#datepicker').on('click', function (event) {
        event.stopPropagation();
        let ui_datepicker = $('#ui-datepicker-div');
        if (ui_datepicker.is('.datepicker-opened')) {
            ui_datepicker.hide();
            ui_datepicker.removeClass('datepicker-opened');
        } else {
            ui_datepicker.show();
            ui_datepicker.addClass('datepicker-opened');
        }

    });


    // newsletter signup click or keydown
    $('#newsletter-form button').on('click keydown', function (e) {
        e.preventDefault();

        if (e.type === 'keydown' && e.keyCode !== 13) {
            return;
        }

        let $form = $(this).parent('form');
        let href = $form.attr('action') + '?' + $form.serialize();

        lightbox(href);
    });

    // gift-cart balance click or keydown
    $('#gift-card-form').on('submit', function (e) {
        e.preventDefault();
        let data = $(this).serialize();

        if($('#giftcard_number').val().trim() == '' ){
            return false;
        }

        $('#preloader').show();
        $('.balance-line').slideUp();
        $('.error-container').slideUp();

        $.ajax({
            url: '/data/balance',
            type: 'get',
            data: data,
            success: function (response) {
                try {
                    response = JSON.parse(response);

                    switch(response.status){
                        case 'success':
                            let price = response.data;
                            $('.balance-line').slideDown();
                            $('.balance-line .balance > span').text(price);
                            break;
                        case 'error':
                            $('.error-container').slideDown();
                            break;
                        default:
                            break;
                    }
                } catch (err) {
                    //console.log(err);
                }
                $('#preloader').hide();
            }
        })
    });

    $('#movie-poster-and-trailer #play-trailer').on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).parents('#movie-poster-and-trailer').addClass('played');
        $('#movie-video').get(0).play();
    });
    movie_filters();





    $('#CS > div ').slick({
        arrows: true,
        prevArrow: '<div class="slick-prev-custom"><img src="../assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow: '<div class="slick-next-custom"><img src="../assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
        slidesToShow: 5,
        slidesToScroll: 1,
        css: 'linear',
        infinite: true,
        accessibility: false,
        autoplay: true,
        responsive: [
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
        ]
    });

    $('#calendar-NP .inner').slick({
        arrows: true,
        prevArrow: '<div class="slick-prev-custom"><img src="../assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow: '<div class="slick-next-custom"><img src="../assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
        slidesToShow: 5,
        slidesToScroll: 1,
        css: 'linear',
        infinite: false,
        accessibility: false,
        responsive: [
            {
                breakpoint: 1100,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 481,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    });
    $('#movie #showdates').slick({
        arrows: true,
        prevArrow: '<div class="slick-prev-custom"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" class="svg replaced-svg"><polygon id="path-1" points="17 5.888 10.7864078 12 17 18.112 15.0906149 20 7 12 15.0906149 4"></polygon></svg></div>',
        nextArrow: '<div class="slick-next-custom"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" class="svg replaced-svg"><polygon id="path-1" points="7 5.888 13.2135922 12 7 18.112 8.90938511 20 17 12 8.90938511 4"></polygon></svg></div>',
        slidesToShow: 5,
        slidesToScroll: 1,
        css: 'linear',
        infinite: false,
        accessibility: false,
        responsive: [
            {
                breakpoint: 1100,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 481,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    });


    showDatesHomepage();


});

function showDatesHomepage() {
    let options = {};
    main();
    function main() {
        options.sliders = $('#calendar-NP .inner, #movie #showdates');
        handlers();
        getSliderState();
    }

    function handlers() {
        $(window).resize(function () {
            getSliderState();
        });
    }

    function getSliderState() {
        options.sliders.each(function () {
            let slider = $(this);
            if (slider.find('.slick-arrow').length !== 0) {
                slider.removeClass('custom-styles');
            } else {
                slider.addClass('custom-styles');
            }
        });
    }
}

function carouselSettings(varInfinite, varAuto) {
    return {
        autoplay: varAuto,
        arrows: true,
        prevArrow: '<div class="slick-prev-custom"><img src="/assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow: '<div class="slick-next-custom"><img src="/assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
        slidesToShow: 5,
        slidesToScroll: 1,
        css: 'linear',
        infinite: varInfinite,
        accessibility: false,
        responsive: [
            {
                breakpoint: 1246,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1100,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 970,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    // arrows: false
                }
            },
            {
                breakpoint: 481,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    // arrows: false
                }
            }
        ]
    }
}
function carouselSettingsSecond(varInfinite, varAuto) {
    return {
        autoplay: varAuto,
        arrows: true,
        prevArrow: '<div class="slick-prev-custom"><img src="../assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow: '<div class="slick-next-custom"><img src="../assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
        slidesToShow: 6,
        slidesToScroll: 1,
        css: 'linear',
        infinite: varInfinite,
        accessibility: false,
        responsive: [
            {
                breakpoint: 1100,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5
                }
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 481,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    }
}

function showtimesFilter(callback) {

    // defining show/hide for every a filter
    $filter.find('.filters .filter').map(function () {
        let name = $(this).data('name');
        let $showtimes = $('.showtimes .showtime.' + name);

        if ($showtimes.length) {
            $(this).addClass('show');
        } else {
            $(this).removeClass('show');
        }
    });

    // defining show/hide a filters block
    let $filterShow = $filter.find('.filters .filter.show');
    if ($filterShow.length <= 1) {
        $filter.removeClass('show');
        $filter.find('.filters .filter.show').addClass('active');
    } else {
        $filter.addClass('show');
    }

    // show/hide a showtimes by filters
    $filter.find('.filters .filter').map(function () {
        let name = $(this).data('name');
        let $showtimes = $('.showtimes .showtime.' + name);
        let active = $(this).hasClass('active');

        if (active) {
            $showtimes.removeClass('filtered');
        } else {
            $showtimes.addClass('filtered');
        }
    });
    if ($('#movie').length !== 0) {
        if ($('#movie .showtimes .showtime').length == 0) {
            $('#movie .button.buy-button').hide();
        } else {
            $('#movie .button.buy-button').show();
        }
    }
    // show/hide a movie block by showtimes
    $('#showtimes .showtimes-details').each(function () {
        var movieShowtimeLength = $(this).find('.showtimes .showtime:not(.filtered)').length;
        if (movieShowtimeLength) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
    if (typeof(callback) == 'function') {
        callback();
    }
}

//function lightbox(href, type = "iframe" ) {
function lightbox(href) {
    type = "iframe";
    $.fancybox({
        type: type,
        href: href,
        width: 600,
        height: 700,
        padding: 0,
        margin: 10,
        fitToView: true,
        autoSize: true,
        closeClick: true,
        openEffect: 'fade',
        closeEffect: 'fade'
    });
}
function movies_trailer_lightbox(element) {
    $(element).fancybox({
        autoscale: true,
        width: 800,
        height: 450,
        transitionIn: 'none',
        transitionOut: 'none',
        padding: 0,
        scrolling: 'no',
        title: $(this).title,
        href: this.href,
        beforeShow: function () {
            $(".fancybox-skin").css("backgroundColor", "#000000");
        }
    });
}

function convertImgSvg($img) {
    let imgID = $img.attr('id');
    let imgClass = $img.attr('class');
    let imgURL = $img.attr('src');

    $.get(imgURL, function (data) {
        // Get the SVG tag, ignore the rest
        let $svg = $(data).find('svg');
        let $defs = $svg.children('defs')

        // fix getting svg
        if ($defs.length) {
            $svg = $svg.html($defs.children());
        }

        // Add replaced image's ID to the new SVG
        if (typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if (typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass + ' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
        if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
            $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
        }

        // Replace image with new SVG
        $img.replaceWith($svg);
    }, 'xml');
}

function movie_filters() {
    var options = {
        inited_filter_index: 0,
        selected_date: '',
        currentFilter: '',
        availableDates: []
    };
    main();
    function main() {
        options.viewContainer = $('.showtimes-block');
        options.showdate = $('#showdates .showdate');
        options.selected_date = date;

        if ($('.movie-page-single').length == 0) {
            options.availableDates = availableDates_np;

            handlers();

            initDatepicker();
            prepare(function () {

                // initMoviesSlider();
                // $('.showtimes-block').cascadeSlider({
                //     itemClass: 'showtimes-details.active-showtime'
                // });
            });
        } else {
            handlers();
            prepare();
        }
        showdatesSliderFilter();
    }

    function initMoviesSlider() {
        $('.showtimes-block .filter-content.active .cs-slider-inner.single').removeClass('single');
        $('.showtimes-block .filter-content .cs-slider-inner').each(function(){
            if ($(this).hasClass('slick-initialized')) {
                $(this).slick('unslick');
            }
        });
        let single = ($('.showtimes-block .filter-content.active .cs-slider-inner > .active-showtime').length > 1) ? true : false;
        let settings = {
            centerMode: single,
            centerPadding: '45px',
            slidesToShow: 1,
            arrows: false,
            mobileFirst: true,
            slide: '.active-showtime',
            responsive: [
                {
                    breakpoint: 959,
                    settings: 'unslick'
                }
            ]
        };
        if(!single){
            $('.showtimes-block .filter-content.active .cs-slider-inner').addClass('single');
        }
        $('.showtimes-block .filter-content.active .cs-slider-inner').slick(settings);
    }

    /**
     * @name initDatepicker
     * @description Use for init datepicker
     */
    function initDatepicker() {
        let dates = options.availableDates;
        $('#datepicker').datepicker('destroy');
        $('#datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            beforeShowDay: function available(date) {
                var ymd = date.getFullYear() + '-' +
                    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
                    ('0' + date.getDate()).slice(-2);
                if ($.inArray(ymd, dates) != -1) {
                    return [true, '', 'Available'];
                } else {
                    return [false, '', 'unAvailable'];
                }
            },
            showButtonPanel: true,
            closeText: 'Close',
            onSelect: function (date, inst) {
                $('.showdate[data-date="' + date + '"]').click();
            }
        });
    }

    function showdatesSliderFilter() {
        if (!$('.showdates-list.active .inner').is('.slick-initialized')) {
            $('.showdates-list.active .inner').slick(carouselSettingsSecond(false, false));
        }
    }

    /**
     * @name handlers
     */
    function handlers() {
        options.showdate.on('click', function (event) {
            event.preventDefault();
            changeDate($(this));
        });
    }

    /**
     * @name changeDate
     * @description Change date filter
     * @param {DOM element} _date
     */
    function changeDate(_date) {
        options.selected_date = _date.data('date');
        $('#datepicker').datepicker("setDate", options.selected_date);
        applyDateFilter();
    }

    /**
     * @name changeFilters
     * @param filter
     */
    function changeFilters(filter) {
        let name = filter.data('name');
        options.currentFilter = name;

        options.filters.removeClass('active');
        filter.addClass('active');
        options.filter_content.removeClass('active');
        $('#' + options.currentFilter).addClass('active');
        initMoviesSlider()

        $('#showdates .showdates-list').removeClass('active');
        $('#calendar-' + options.currentFilter).addClass('active');
        if ($('.showdates-list.active .inner').is('.slick-initialized')) {
            $('.showdates-list.active .inner').slick('refresh');
        }
    }


    /**
     * @name prepare
     * @returns {boolean}
     */
    function prepare(callback) {
        $('.showdate[data-date="' + options.selected_date + '"]').trigger('click');
        if (options.filters) {
            options.filters.eq(options.inited_filter_index).trigger('click');
        }

        if (typeof(callback) == 'function') {
            setTimeout(function () {
                callback();
            }, 500);
        }
    }

    /**
     * @name applyDateFilter
     * @description Show movies by date.
     */
    function applyDateFilter() {
        $('#movie .active-showtime, #calendar-NP .active-showtime, #NP .active-showtime').removeClass('active-showtime');
        $('.' + options.selected_date).addClass('active-showtime');
        initMoviesSlider();
    }
}