// JavaScript Document

//validate a form
function validate_form(myForm)
{

    //loading image when form submitted
    $(myForm).submit(function() {

        //assume we are OK
        var isMissing = false;

        $('.errmsg').text('');

        //loop through required fields
        $('.required').each(function(){

            //remove the missing class
            $(this).removeClass("missing");

            //if blank, add the missing class back
            if ($(this).val() == "") {
                $(this).addClass("missing");
                $('#err_' + this.id).text(' *Required');
                isMissing = true
            };

        });

        //if resume was uploaded, check extension
        if ($('#resume').val() != "" && $('#resume').length == 1) {

            //get the extension and verify against allowed extensions
            var ext = $('#resume').val().split('.').pop().toLowerCase();

            //compare against valid extensions
            if($.inArray(ext, ['doc','docx','pdf','txt']) == -1) {
                $('#err_resume').text(' *Invalid file extension');
                isMissing = true
            }
        }

        //make sure the card number is 14 digits if that field exists. IF not required or value is N/A, skip
        if ($('#card_number').length != 0 && $('#card_number').hasClass('required') && $('#card_number').val() != 'N/A') {
            if ($('#card_number').val().length != 14) {
                $('#card_number').addClass("missing");
                $('#err_card_number').text(' *Must be 14 digits');
                isMissing = true;
            }
        }

        //make sure the email address is valid!
        if ($('#email_address').length != 0) {
            if (!validateEmail($('#email_address').val())) {
                $('#email_address').addClass("missing");
                $('#err_email_address').text(' *Not a valid email');
                isMissing = true;
            }
        }

        //if there is a email confirm field, validate it matches the email field
        if ($('#email_address_confirm').length != 0) {
            if ($('#email_address_confirm').val() != $('#email_address').val()) {
                $('#email_address_confirm,#email_address').addClass("missing");
                $('#err_email_address,#email_address_confirm').text(' *Emails must match');
                isMissing = true;
            }
        }

        //if there is a captcha field, validate it matches the captcha confirm field
        if ($('#captcha').length != 0) {
            if ($('#captcha_confirm').val() != $('#captcha').val()) {
                $('#captcha_confirm').addClass("missing");
                $('#err_captcha_confirm').text("*Code does not match");
                isMissing = true;
            }
        }

        //we want password that are at least 6 characters for security purposes
        if ($('#password').length != 0 && $('#password').hasClass('required')) {
            if ($('#password').val().length < 6) {
                $('#password_confirm,#password').addClass("missing");
                $('#err_password_confirm,#err_password').text(" *Must be at least 6 characters");
                isMissing = true;
            }
        }

        //if there is a password confirm field, validate it matches the password field
        if ($('#password_confirm').length != 0) {

            //check if password matches confirm password field
            if ($('#password_confirm').val() != $('#password').val()) {
                $('#password_confirm,#password').addClass("missing");
                $('#err_password_confirm,#err_password').text(" *Passwords must match");
                isMissing = true;
            }
        }

        if (!isMissing) {

            if ($('#loading').length != 0) {
                $('#loading').show(); // show animation
            }

            if ($('#registering').length != 0) {
                $('#registering').show(); // show different animation
            }
            return true;
            document.myForm.submit();
        } else {
            return false;
        }
    });
}

//validate an email against a regular expression
function validateEmail($email) {

    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    if( !emailReg.test( $email ) ) {
        return false;
    } else {
        return true;
    }
}

//get a querystring variable
function getQueryString(name) {

    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);

    if(results == null) {
        return "";
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

//verify gift card fields
function beforeSubmit(){
    cardAmount = document.getElementById('txtAmount').value;
    if (document.getElementById('varAmount').checked == true){
        if (cardAmount > 0.00){
            if ((cardAmount >= 10.00) && (cardAmount <= 500.00)){
                document.getElementById('varAmount').value = cardAmount;
                document.forms["paypalForm"].submit();
            } else {
                alert("Please enter a number between 10 and 500");
                return false;
            }
        } else {
            if (document.getElementById('varAmount').checked == false){
                document.forms["paypalForm"].submit();
            } else {
                alert("Please enter a number between 10 and 500");
                return false;
            }
        }
    } else {
        document.forms["paypalForm"].submit();
    }
}

//document ready
$(function () {

    //remove wowslider watermark
    $("a:contains('WOWSlider.com')").css('display','none');

    //various procedures for quick tickets feature

    function quickTickets(ch_item){
        //get dropdown id and value
        var id = ch_item.attr("id");

        //location dropdown?
        if (id == "location") {

            //disable other dropdowns as content has changed
            $('#movie,#date,#showtime').attr('disabled', true);

            //get the house_id
            var house_id = ch_item.val();

            //get move list if not blank house id
            if (ch_item.val() != "") {
                //populate the movies dropdown
                window.header_showdates = {};
                $('#movie').empty().append('<option value="">Select a Movie</option>');
                $.each(movies[house_id], function( key, value ) {
                    $('#movie').append('<option value="'+key+'">'+key+'</option>');
                    header_showdates[key] = value;
                });
                $('#movie').attr('disabled', false);
            }

        } else if (id == "movie" && ch_item.val() != "") {

            //get the house_id
            var movie = ch_item.val();
            window.header_showtimes = {};

            //get showdate for this movie
            $('#date').empty().append('<option value="">Select a Date</option>');
            $.each(header_showdates[movie], function( key, value ) {
                $('#date').append('<option value="'+key+'">'+key+'</option>>');
                header_showtimes[key] = value;
            });
            $('#date').attr('disabled', false);
            $('#showtime').attr('disabled', true);
        } else if (id == "date" && $('#'+id).val() != "") {

            var showdate = ch_item.val();

            //get showdate for this movie
            $('#showtime').empty().append('<option value="">Select a Time</option>');
            $.each(header_showtimes[showdate], function( key, value ) {
                $('#showtime').append('<option value="'+value+'">'+key+'</option>>');
            });
            $('#showtime').attr('disabled', false);
        } else if (id == "showtime") {

            var url = ch_item.val();
            window.location = url;
        }
    }
    $(".quick_tix").on('change', function(){
        quickTickets($(this));
    })

    quickTickets($('#location') );

    function movieData(ch_item){
        //get dropdown id and value
        var id = ch_item.attr("id");

        if (id == "location-data") {

            //disable other dropdowns as content has changed
            $('#date-data').attr('disabled', true);
            $('#showtime-data').empty();

            //get the house_id
            var house_id = ch_item.val();

            //get showdate list if not blank house id
            if (ch_item.val() != "") {
                window.showdates = {};
                $('#date-data').empty().append('<option value="">Select a Date</option>');
                $.each(movie_data[house_id], function( key, value ) {
                    $('#date-data').append('<option value="'+key+'">'+key+'</option>');
                    showdates[key] = value;
                });
                $('#date-data').attr('disabled', false);
            }
        } else if (id == "date-data") {

            var showdate = ch_item.val();
            $('#showtime-data').empty();

            //get showtime for this movie
            var comment_index = 0;
            $.each(showdates[showdate], function( format, comments ) {
                comment_index++;
                $.each(comments, function( a_comment, value ) {
                    $('#showtime-data').append('<span class="comments"><span title="">' + format + ' ' + a_comment + '</span></span><span class="times comment-'+comment_index+'">');
                    $.each(value, function( time, value1 ) {
                        if (value1.expired == '') {
                            $('#showtime-data .times.comment-'+comment_index).append('<a class="showtime " href="' + value1.link + '" target="_blank">' + time + '</a>');
                        }
                        else {
                            $('#showtime-data .times.comment-'+comment_index).append('<span class="showtime expired">' + time + '</span>');
                        }
                    });

                });

            });
        }
    }

    $(".movie-data").on('change', function(){
        movieData($(this));
    });

    movieData($('#location-data') );

    //count images in left and right promo divs
    var promo_divs_right = $('div[id^="promo_right"] img').hide(), c = 0;
    var promo_divs_left = $('div[id^="promo_left"] img').hide(), d = 0;
    var featured_divs = $('div[id^="featured"] a').hide(), e = 0;

    //start right promo div
    (function promo_cycle_right() {

        //count the number of promo divs
        var right_divs = promo_divs_right.length;

        //fade timer, but only if more than 1
        if (right_divs > 1) {
            promo_divs_right.eq(c).fadeIn(400).delay(5000).fadeOut(400, promo_cycle_right);

            // increment c and reset to 0 when it equals divs.length
            c = ++c % promo_divs_right.length;
        } else {
            $('div[id^="promo_right"] img').show();
        }

    })();

    //start left promo div
    (function promo_cycle_left() {

        //count the number of promo divs
        var left_divs = promo_divs_left.length;

        //fade timer, but only if more than 1
        if (left_divs > 1) {
            promo_divs_left.eq(d).fadeIn(400).delay(5000).fadeOut(400, promo_cycle_left);

            // increment c and reset to 0 when it equals divs.length
            d = ++d % promo_divs_left.length;
        } else {
            $('div[id^="promo_left"] img').show();
        }
    })();

    //start right promo div
    (function featured_divs_cycle() {

        //count the number of promo divs
        var featured_num = featured_divs.length;

        //fade timer, but only if more than 1
        if (featured_num > 1) {
            featured_divs.eq(c).fadeIn(400).delay(5000).fadeOut(400, featured_divs_cycle);

            // increment c and reset to 0 when it equals divs.length
            c = ++c % featured_divs.length;
        } else {
            $('div[id^="featured"] a').show();
        }

    })();

    //lightbox for newsletter sign-up
    $(".signup").fancybox({
        width		: 640,
        height		: 1000,
        padding		: 0,
        margin		: 0,
        fitToView	: false,
        autoSize	: false,
        closeClick	: true,
        openEffect	: 'fade',
        closeEffect	: 'fade'
    });

    //lightbox for newsletter sign-up
    $(".info").fancybox({
        width		: 640,
        height		: 600,
        padding		: 0,
        margin		: 0,
        fitToView	: false,
        autoSize	: false,
        closeClick	: true,
        openEffect	: 'fade',
        closeEffect	: 'fade'
    });


    //start trailer when button is pressed
    $(".play_trailer").fancybox({
        autoscale : false,
        width : 800,
        height : 450,
        transitionIn : 'none',
        transitionOut : 'none',
        scrolling  : 'no',
        padding : 0,
        title : $(this).title,
        href : this.href,
        beforeShow: function(){
            $(".fancybox-skin").css("backgroundColor","#000000");
        }
    });
});