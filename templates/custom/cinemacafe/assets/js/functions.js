// JavaScript Document

//validate a form
function validate_form(myForm) {

    //loading image when form submitted
    $(myForm).submit(function() {

        //get form ID
        var form_id = "#"+this.id;

        //assume we are OK
        var isMissing = false;

        $(form_id+' .errmsg').text('');

        //loop through required fields
        $(form_id+' .required').each(function(){

            //remove the missing class
            $(this).removeClass("missing");

            //if blank, add the missing class back
            if ($(this).val() == "") {
                $(this).addClass("missing");
                $(form_id+' #err_' + this.id).text(' *Required');
                isMissing = true
            };

        });

        //make sure the card number is 14 digits if that field exists. IF not required or value is N/A, skip
        if ($(form_id+' #card_number').length != 0 && $(form_id+' #card_number').hasClass('required') && $(form_id+' #card_number').val() != 'N/A') {
            if ($(form_id+' #card_number').val().length != 14) {
                $(form_id+' #card_number').addClass("missing");
                $(form_id+' #err_card_number').text(' *Must be 14 digits');
                isMissing = true;
            }
        }

        //make sure the email address is valid!
        if ($(form_id+' #email_address').length != 0) {
            if (!validateEmail($(form_id+' #email_address').val())) {
                $(form_id+' #email_address').addClass("missing");
                $(form_id+' #err_email_address').text(' *Not a valid email');
                isMissing = true;
            }
        }

        //if there is a email confirm field, validate it matches the email field
        if ($(form_id+' #email_address_confirm').length != 0) {
            if ($(form_id+' #email_address_confirm').val() != $(form_id+' #email_address').val()) {
                $(form_id+' #email_address_confirm,'+form_id+' #email_address').addClass("missing");
                $(form_id+' #err_email_address,'+form_id+' #email_address_confirm').text(' *Emails must match');
                isMissing = true;
            }
        }

        //if there is a captcha field, validate it matches the captcha confirm field
        if ($(form_id+' #captcha').length != 0) {
            if ($(form_id+' #captcha_confirm').val() != $(form_id+' #captcha').val()) {
                $(form_id+' #captcha_confirm').addClass("missing");
                $(form_id+' #captcha_confirm').text(' *Verification code does not match');
                isMissing = true;
            }
        }

        //we want password that are at least 6 characters for security purposes
        if ($(form_id+' #password').length != 0 && $(form_id+' #password').hasClass('required')) {
            if ($(form_id+' #password').val().length < 6) {
                $(form_id+' #password_confirm,'+form_id+' #password').addClass("missing");
                $(form_id+' #err_password_confirm,'+form_id+' #err_password').text(" *Must be at least 6 characters");
                isMissing = true;
            }
        }

        //if there is a password confirm field, validate it matches the password field
        if ($(form_id+' #password_confirm').length != 0) {

            //check if password matches confirm password field
            if ($(form_id+' #password_confirm').val() != $('#password').val()) {
                $(form_id+' #password_confirm,'+form_id+' #password').addClass("missing");
                $(form_id+' #err_password_confirm,'+form_id+' #err_password').text(" *Passwords must match");
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
            //document.myForm.submit();
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

//jump to a url from <select> element
function select_link(type) {

    var url = $("#select-"+type).val();
    window.location.href = url;
}
function carouselSettings(varInfinite, varAuto){
    return {
        autoplay:     varAuto,
        arrows:          true,
        slidesToShow:       6,
        slidesToScroll:     6,
        css:         'linear',
        infinite: varInfinite,
        responsive: [
            {
                breakpoint: 480,
                settings: {
                    slidesToShow:3,
                    slidesToScroll:3,
                }

            },
            {
                breakpoint: 680,
                settings: {
                    slidesToShow:4,
                    slidesToScroll:4,
                }

            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow:5,
                    slidesToScroll:5,
                }

            },
        ]
    }
}

function openDate(this_date) {
    var i;
    var x = document.getElementsByClassName("location_date");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    $('#showtimes-container #this-date').text(this_date);
    document.getElementById(this_date).style.display = "block";

}

function mobileMenu(){
    // Menu Mobile submenu Open/Close
    if ($(window).width() <= 1024) {

        $('#top_nav').addClass('mobile');
        arrSubMenu = $('#top_nav ul > li > ul').parent('li');
        $.each(arrSubMenu, function (key, item) {
            $(item).children('a').off('click').on('click', function (e) {
                e.preventDefault();
                $(this).find('+ ul').slideToggle(700);
            });
        });

    } else {
        $('#top_nav').removeClass('mobile');
    }
}

//document ready
$(function () {

    //start trailer when button is pressed
    $("#play-trailer").fancybox({
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

    // Menu Mobile Open/Close
    $('#menu-icon a').click(function () {
        $('#top_nav').slideToggle(700);
    });


    //Initial Set-up
    mobileMenu();

    //On window resize
    $( window ).resize(mobileMenu);

    //various procedures for quick tickets feature
    $(".quick_tix").change(function() {

        //get dropdown id and value
        var id = $(this).attr("id");
        var loading = "<option value=''>Loading..</option>";

        //location dropdown?
        if (id == "location") {

            //disable other dropdowns as content has changed
            $('#movie,#date,#showtime').attr('disabled', true);

            //get the house_id
            var house_id = $(this).val();

            //get move list if not blank house id
            if ($('#'+id).val() != "") {
                //populate the movies dropdown
                $('#movie').attr('disabled', false).html(loading).load("/includes/load_data?t=movies&h="+house_id);
            }

        } else if (id == "movie" && $('#'+id).val() != "") {

            //get the house_id
            var house_id = $('#location').val();
            var movie_id = $(this).val();

            //get showdate for this movie
            $('#date').attr('disabled', false).html(loading).load("/includes/load_data?t=dates&h="+house_id+"&m="+movie_id);
        } else if (id == "date" && $('#'+id).val() != "") {

            //get the house_id
            var house_id = $('#location').val();
            var movie_id = $('#movie').val();
            var showdate = $(this).val();

            //get showdate for this movie
            //$('#showtime').attr('disabled', false).html(loading).load("/includes/load_data?t=showtimes&h="+house_id+"&m="+movie_id+"&d="+showdate);
        } else if (id == "showtime") {

            var url = $(this).val();
            window.location = url;
        }
    });

    //start trailer when button is pressed
    $(".play_trailer").fancybox({
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

});

