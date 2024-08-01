// JavaScript Document

//validate a form
function validate_form(myForm) {

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
				$('#captcha_confirm').text(' *Verification code does not match');
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

//used by datepicker function to parse JSON array availableDates and enable valid showdates
function available(date, availableDates) {
	
	//format date		
	mdy =   (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
    //valid or not?
	if ($.inArray(mdy, availableDates) != -1) {
		return [true, "","Available"];
	} else {
		return [false,"","unAvailable"];
	}
}

function openDate(this_class, this_date,timestype) {

    if (typeof this_date === 'undefined') {
        return;
    }
    var i;
    var x = document.getElementsByClassName(this_class);
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }

    var x = document.getElementsByClassName(this_date);
	
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "block";
    }

    if ( $( '#print-friendly' ).length ) {
        var print_link = $('#print-friendly'), a = print_link.attr('href').substring(-1, print_link.attr('href').length - 10);
        a = a + this_date;
        print_link.attr('href', a);
    }

	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var _date = new Date(this_date);
	var result = days[_date.getUTCDay()] + ', ' + months[_date.getUTCMonth()] + ' ' + _date.getUTCDate() + ', ' + _date.getFullYear();

	if(timestype == 'weekly') {
		$('.showtimes_selector h2').html('For the week of <br>'+result);
        $('#showtimes_wrapper h3').html('For the week of <br>'+result);
	}else{
		$('.showtimes_selector h2').text(result);
        $('#showtimes_wrapper h3').text(result+ ' SHOWTIMES');
	}
}

function movieShowtimesLogic(times_type){

	var options = {
		wrapper: null,
		title: null,
		select_locations: null,

		title_default_text: '',

		times_type: '',
		selected_date: null,
		selected_location: null,

		availableDates: [],
        datepicker_availableDates: [],

		datepicker: null,
		datepicker_settings: {
            minDate: '',
            dateFormat: 'yy-mm-dd',
            beforeShowDay: available,
            onSelect: function (date, inst) {
                options.selected_date = date;

				let display_date = new Date(date);
				let month = display_date.getUTCMonth() - 0 +1;
				let day = display_date.getUTCDate();
				let year = display_date.getFullYear();
				month = (month < 10)? '0'+month : month;
				day = (day < 10)? '0'+day : day;

                $(this).val(month +'-'+day+'-'+year);

                openDateLocationShowtimes();
            }
		}
	};

	main();
	function main(){
		options.wrapper = $('#showtimes_wrapper');
		options.title = options.wrapper.find('h3');
		options.select_locations = $('#movie-locations');

		options.title_default_text = 'Showtimes';

		options.times_type = times_type;
		options.detepicker = $('#datepicker');

		options.availableDates = availableDates;


        options.detepicker.datepicker('destroy').datepicker(options.datepicker_settings);
        prepare();
        handlers();
	}

	function handlers(){
        options.select_locations.on('change', function(){
            options.title.text(options.title_default_text);
            options.wrapper.find('.movie_date').hide();
            options.wrapper.find('.movie_date .theater').hide();
            options.detepicker.val('');

            options.selected_location = $(this).val();

            options.datepicker_availableDates = options.availableDates[options.selected_location];
            options.selected_date = options.datepicker_availableDates[0];

            options.datepicker_settings.minDate = options.datepicker_availableDates[0];
            options.detepicker.datepicker('destroy').datepicker(options.datepicker_settings);
            openDateLocationShowtimes();
		});
	}

	function prepare(){
        options.wrapper.find('.movie_date').hide();
        options.wrapper.find('.movie_date .theater').hide();
	}

    function available(date) {
        var ymd = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2);

        if ($.inArray(ymd, options.datepicker_availableDates) != -1) {
            return [true, "", "Available"];
        } else {
            return [false, "", "unAvailable"];
        }
    }

    function openDateLocationShowtimes(){
		if(options.selected_date == null || options.selected_location == null){
			return;
		}

        options.wrapper.find('.movie_date').hide();
        options.wrapper.find('.movie_date .theater').hide();

        let $selected_date = options.wrapper.find('.'+options.selected_date);
        $selected_date.show();
        $selected_date.find('.'+options.selected_location).show();

        if ( $( '#print-friendly' ).length ) {
            var print_link = $('#print-friendly'), a = print_link.attr('href').substring(-1, print_link.attr('href').length - 10);
            a = a + options.selected_date;
            print_link.attr('href', a);
        }

        $('#datepicker').val("Select Another Date");

        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var _date = new Date(options.selected_date);
        var result = days[_date.getUTCDay()] + ', ' + months[_date.getUTCMonth()] + ' ' + _date.getUTCDate() + ', ' + _date.getFullYear();
		if(options.times_type == 'weekly') {
			$('.showtimes_selector h2').html('For the week of <br>'+result);
			$('#showtimes_wrapper h3').html('For the week of <br>'+result);
		}else{
			$('.showtimes_selector h2').text(result);
			$('#showtimes_wrapper h3').text(result+ ' SHOWTIMES');
		}
	}
}

//document ready
$(function () {
	
	//remove wowslider watermark
    $("a:contains('WOWSlider.com')").css('display','none');
	
	//lightbox for newsletter sign-up
	$(".signup").fancybox({
		width		: 640,
		height		: 550,
		padding		: 0,
		margin		: 45,
		fitToView	: false,
		autoSize	: false,
		closeClick	: true,
		openEffect	: 'fade',
		closeEffect	: 'fade'
	});
	
	//start trailer when button is pressed
	$(".play_trailer").fancybox({
		autoscale : true,
		width : 800,
		// height : 450,
		transitionIn : 'none',
		transitionOut : 'none',
		scrolling : 'no',
		padding : 0,
		margin: 45,
		title : $(this).title,
		type: 'iframe',
		href : this.href,
		fitToView   : true,
		autoSize    : false,
		beforeShow: function(){
		  $(".fancybox-skin").css("backgroundColor","#000000");
		},
		afterShow: function () {
			updateTrailerHeight();
		},
	});
	$(window).on('resize',function(){
		updateTrailerHeight();
	});
	if($('.stills-slider').length != 0) {
		$('.stills-slider').slick({
			slidesToShow: 4,
			slidesToScroll: 1,
			infinite: true,
			speed: 500,
			autoplay: true,
			arrows: false,
			responsive: [
				{
					breakpoint: 1100,
					settings: {
						slidesToShow: 3
					}
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: 2
					}
				},
				{
					breakpoint: 480,
					settings: {
						slidesToShow: 1
					}
				}
			]
		});
	}
	if (($(window).width() < 768) && ($('body').attr('id') == 'index')){
		$('#leaderboard').prependTo('#main');
	}
});
function updateTrailerHeight(){
	$('.fancybox-inner').css({
		maxHeight: $('.fancybox-inner').width() * 9 / 16
	});
}