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
        prevArrow    : '<div class="slick-prev-custom"><img src="../assets/img/icon-arrow-left.svg" onload="convertImgSvg($(this));" class="svg" alt="Left arrow" /></div>',
        nextArrow    : '<div class="slick-next-custom"><img src="../assets/img/icon-arrow-right.svg" onload="convertImgSvg($(this));" class="svg" alt="Right arrow" /></div>',
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
function carouselSettingsSecond(varInfinite, varAuto) {
    return {
        autoplay      : varAuto,
        arrows        : true,
        prevArrow    : '<div class="slick-prev-custom"><img src="../assets/img/button-arrow-left.png"  alt="Left arrow" /></div>',
        nextArrow    : '<div class="slick-next-custom"><img src="../assets/img/button-arrow.png"  alt="Right arrow" /></div>',
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
                }
            },
            {
                breakpoint: 481,
                settings  : {
                    slidesToShow  : 1,
                    slidesToScroll: 1,
                }
            }
        ]
    }
}

// slick only for mobile
function slick_only_mobile(slider, settings) {
    $(window).on('load resize', function() {
        if (screen.width > 961) {
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
    if(typeof(date) == 'undefined' || date == '') {
        return false;
    }

    let url = '/ajax_times'
        + '/house_id=' + house_id
        + '/date=' + date
        + '/state=' + state
    ;

    $('#showtimes').load('/ajax_loader').load(url, complete);
}

function changeMovieDate(movie_id, date, complete) {
    if(typeof(date) == 'undefined' || date == '') {
        var d = new Date();
        date = d.getFullYear();
    }

    let url = '/ajax_movie/'
        + 'movie_id=' + movie_id
        + '/date=' + date;
    $('#showtimes').load('/ajax_loader/small').load(url, complete);
}

function showtimesFilter(callback) {
    let $filter = $('#filter');
    
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

    // show/hide a movie block by showtimes
    $('#showtimes .showtimes-details').each(function () {
        var movieShowtimeLength = $(this).find('.showtimes .showtime:not(.filtered)').length;
        if (movieShowtimeLength) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
    if(typeof(callback) == 'function'){
        callback();
    }
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
function movies_trailer_lightbox(element) {
    $(element).fancybox({
        autoscale : false,
        width : 800,
        height : 450,
        transitionIn : 'none',
        transitionOut : 'none',
        padding : 0,
        scrolling  : 'no',
        title : $(this).title,
        href : this.href,
        beforeShow: function(){
            $(".fancybox-skin").css("backgroundColor","#000000");
        }
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

    //start trailer when button is pressed
    $("a.movie-trailer").fancybox({
        autoscale : false,
        width : 800,
        height : 450,
        transitionIn : 'none',
        transitionOut : 'none',
        padding : 0,
        scrolling  : 'no',
        title : $(this).title,
        href : this.href,
        beforeShow: function(){
            $(".fancybox-skin").css("backgroundColor","#000000");
        }
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
    
    $('#showdates').on('init breakpoint afterChange', function (event, slick) {
        let slides = slick.$slides;
        let $slider_last = $(slides[slides.length - 1]);
        if ($slider_last.hasClass('slick-active')) {
            $(this).addClass('slick-slider-last-active');
        } else {
            $(this).removeClass('slick-slider-last-active');
        }
    });

    $('.has-dropdown-menu').on('click', function(event){
        event.stopPropagation();
        if($(window).width() <= 768){
            $(this).find('.dropdown-menu').slideToggle();
        }
    });
    $('body').on('click', function(){
        if($(window).width() <= 768) {
            $(this).find('.dropdown-menu').slideUp();
        }
    });
    $(window).resize(function(){
        if($(window).width() > 768){
            $('.dropdown-menu').removeAttr('style');
        }
    });

    $('#movie-poster-and-trailer #play-trailer').on('click', function(event){
        event.preventDefault();
        event.stopPropagation();
        $(this).parents('#movie-poster-and-trailer').addClass('played');
        $('#movie-video').get(0).play();
    });

    $('#newsletter-form form').on('submit', function (e) {
        e.preventDefault();

        let id = $(this).find('input[name="cust_id"]').val();
        let email = $(this).find('input[name="txt_email_address"]').val();

        $('.newsletter-popup .error').hide();
        $('.newsletter-popup .success').hide();
        $('.newsletter-popup #newsletter-popup').show();
        $('.newsletter-popup').show();
        $('.newsletter-popup').find('#txt_email_address').val(email);
        $('.newsletter-popup').data('id', id);
    });
    $('.newsletter-popup,.newsletter-popup .close').on('click', function () {
        $('.newsletter-popup').hide();
    });
    $('.newsletter-popup .inner').on('click', function (e) {
        e.stopPropagation();
    });
    $('#newsletter-popup').on('submit', function (e) {
        e.preventDefault();
        sendSubscribe($(this));
    })
});

function page_times(){
    if($('#showtimes').length == 0){
        return false;
    }
    let options = {
        showtimesListName: 'showtimes',
        activeClassName: 'active',
    };
}
function image_instagram (){
    let options = {}
    main();
    function main(){
        options.container = $('#instafeed');
        options.images = options.container.find('.insta-item');
        setTimeout(function(){
            resize_items();
        },300)

        handlers();
    }
    function handlers(){
        $(window).resize(function(){
            resize_items();
        });
    }
    function resize_items(){
       options.images.each(function(){
            $(this).css({
                height: $(this).width()
            });
       });
    }
}

function movie_filter(){
    if($('#showdates').length == 0){
        return false;
    }

    let options = {
        selected_date: null
    }

    main();
    function main(){
        options.showdate = $('#showdates .showdate');
        options.viewContainer = $('#showtimes');
        options.selected_date = currentDate;

        handlers();
        prepare();
    }

    function handlers(){
        options.showdate.on('click', function(event){
            event.preventDefault();
            changeDate($(this));
        });
    }

    /**
     * @name changeDate
     * @description Change date filter
     * @param {string} _date
     */
    function changeDate(_date){
        options.selected_date = _date.data('date');
        options.showdate.removeClass('showdate-selected');
        _date.addClass('showdate-selected');
        $("#datepicker").datepicker( "setDate", options.selected_date );
        $('.showtimes .showtime.active').removeClass('active');
        $('.buy-button.active').removeClass('active');

        applyDateFilter();
    }

    /**
     * @name applyDateFilter
     * @description Show movies by date.
     */
    function applyDateFilter(){
        options.viewContainer.find('.active-showtime').removeClass('active-showtime');
        $('.'+options.selected_date).addClass('active-showtime');
    }

    /**
     * @name prepare
     * @param {function} callback
     * @returns {function}
     */
    function prepare(callback){
        changeDate($('#showdates .showdate[data-date="'+options.selected_date+'"]'));
        if(typeof(callback) == 'function'){
            setTimeout(function(){
                callback();
            },500);
        }
    }
    
}

function sendSubscribe(form) {
    var data = form.serializeArray();
    let result = validate_form(form);
    if (result) {
        $.ajax({
            url: '/data/newsletter',
            type: 'post',
            data: data,
            success: function (response) {
                try {
                    response = JSON.parse(response);
                    form.hide();
                    if (response.status == 'success') {
                        $('.success').show();
                    }
                    else {
                        $('.error').show();
                    }
                } catch (err) {

                }
            }
        });
    }
}

//validate a form
function validate_form(myForm) {

    //loading image when form submitted
    //assume we are OK
    var isMissing = false;

    $('.errmsg').text('');

    //loop through required fields
    $('.required').each(function () {
        //remove the missing class
        $(this).removeClass("missing");

        //if blank, add the missing class back
        if ($(this).val() == "") {
            $(this).addClass("missing");
            isMissing = true
        }
    });

    //make sure the email address is valid!
    if ($('#txt_email_address').length != 0) {
        if (!validateEmail($('#txt_email_address').val())) {
            $('#txt_email_address').addClass("missing");
            isMissing = true;
        }
    }
    return !isMissing;
}

//validate an email against a regular expression
function validateEmail($email) {

    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    if (!emailReg.test($email)) {
        return false;
    } else {
        return true;
    }
}
