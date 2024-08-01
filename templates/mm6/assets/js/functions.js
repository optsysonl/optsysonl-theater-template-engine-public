// Google Map
function gmGetCoordinates(address, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: address}, function (results, status) {
        if (status == 'OK') {
            var coordinates = results[0].geometry.location;
            callback({lat: coordinates.lat(), lng: coordinates.lng()});
        } else {
            console.error('Google Map custom function gmGetCoordinates not found coordinates!');
        }
    });
}

function gmInitMap(address, $map) {
    gmGetCoordinates(address, function (coordinates) {
        var map = new google.maps.Map($map, {
            center: coordinates,
            zoom: 16
        });
        var marker = new google.maps.Marker({
            map: map,
            position: coordinates,
            title: address
        });
    });
}

function carouselSettings(varInfinite, varAuto) {
    return {
        autoplay      : varAuto,
        arrows        : true,
        prevArrow    : '<div class="slick-prev-custom"><img src="/assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow    : '<div class="slick-next-custom"><img src="/assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
        slidesToShow  : 7,
        slidesToScroll: 7,
        css           : 'linear',
        infinite      : varInfinite,
        accessibility   : false,
        responsive    : [
            {
                breakpoint: 1246,
                settings  : {
                    slidesToShow  : 6,
                    slidesToScroll: 6
                }
            },
            {
                breakpoint: 1100,
                settings  : {
                    slidesToShow  : 5,
                    slidesToScroll: 5
                }
            },
            {
                breakpoint: 970,
                settings  : {
                    slidesToShow  : 4,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 769,
                settings  : {
                    slidesToShow  : 4,
                    slidesToScroll: 1,
                    arrows: false
                }
            },
            {
                breakpoint: 481,
                settings  : {
                    slidesToShow  : 3,
                    slidesToScroll: 1,
                    arrows: false
                }
            }
        ]
    }
}

// slick only for mobile
function slick_only_mobile(slider, settings) {
    $(window).on('load resize', function() {
        if (screen.width > 768) {
            if (slider.hasClass('slick-initialized')) {
                slider.slick('unslick');
            }
            return;
        }
        if (!slider.hasClass('slick-initialized')) {
            return slider.slick(settings);
        }
    });
}

function changeLocationDate(house_id, date, state, complete) {
    let url = '/ajax_times'
        + '/house_id=' + house_id
        + '/date=' + date
        + '/state=' + state
    ;
    
    $('#showtimes').load('/ajax_loader').load(url, complete);
}

function openDate(this_date, class_name) {
    var i;
    var x = document.getElementsByClassName(class_name);
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(this_date).style.display = "block";

}

function showtimesFilter() {
    let $filter = $('#filter');
    
    // defining show/hide for every a filter
    $filter.find('.filters .filter').map(function () {
        let name = $(this).data('name');
        let $showtimes = $('.showtimes .showtime.' + name);
        
        if ($showtimes.length) {
            $(this).addClass('show');
            $('.showtime_comment .format').addClass('show');
            $('.comments .format').addClass('show');


        } else {
            $(this).removeClass('show');
            $('.showtime_comment .format').removeClass('show');
            $('.comments .format').removeClass('show');
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

        let $commnet_div = $showtimes.parent().find(".comments");


        
        if (active) {
            $showtimes.removeClass('filtered');
            $commnet_div.removeClass('filtered');
        } else {
            $showtimes.addClass('filtered');
            $commnet_div.addClass('filtered');
        }
    });
    
    // show/hide a movie block by showtimes
    $('#showtimes .showtimes-details').each(function () {
        var movieShowtimeLength = $(this).find('.showtimes .showtime:not(.filtered)').length;
        if (movieShowtimeLength) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

//function lightbox(href, type = "iframe" ) {
function lightbox(href) {
    type = "iframe";
    $.fancybox({
        type       : type,
        href       : href,
        width      : 600,
        height     : 700,
        padding    : 0,
        margin     : 50,
        fitToView  : false,
        autoSize   : true,
        closeClick : true,
        openEffect : 'fade',
        closeEffect: 'fade'
    });
}

function convertImgSvg ($img) {
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

// Check scrolling
$(document).on('scroll', function() {
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
    
    // Navigation open/close sub-menu
    if (screen.width <= 768) {
        $('.sub-nav-container > a').on('click', function () {
            if (!$(this).hasClass('opened')) {
                $(this).toggleClass('opened');
                $(this).find('+ .sub-nav').toggle('slow');
            } else {
                $(this).find('+ .sub-nav').toggle('slow', function () {
                    $(this).parent().children('a').toggleClass('opened');
                });
            }
            return false;
        });
    }
    
    // Navigation (csn - C = logo Center; S = nav Split; N = No social;) find and mark center
    var $elNav = $('#site-header.csn #header-content #nav-block #top-nav > ul > li');
    $elNav.addBack().find('li:nth-child(' + Math.ceil($elNav.length / 2) + ')').addClass('csn-logo-after');
    
    // newsletter icon click
    $('.newsletter-svg').on('click', function (e) {
        e.preventDefault();
        
        lightbox($(this).attr('href'));
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
    
    $('#showdates').on('init breakpoint afterChange', function (event, slick) {
        let slides = slick.$slides;
        let $slider_last = $(slides[slides.length - 1]);
        if ($slider_last.hasClass('slick-active')) {
            $(this).addClass('slick-slider-last-active');
        } else {
            $(this).removeClass('slick-slider-last-active');
        }
    });
});