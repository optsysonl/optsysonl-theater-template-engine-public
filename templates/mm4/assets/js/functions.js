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

//used by datepicker function to parse JSON array availableDates and enable valid showdates
function available(date) {
	
	//format date		
	mdy =   (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
	console.log(mdy+' : '+($.inArray(mdy, availableDates)));
    
    //valid or not?
	if ($.inArray(mdy, availableDates) != -1) {
		return [true, "","Available"];
	} else {
		return [false,"","unAvailable"];
	}
}

function changeLocationDate(house_id, date) {
    var url = '/ajax_times'
        + '/house_id=' + house_id
        + '/date=' + date
    ;
    
    //$('#showtimes').load('/ajax_loader').load(url);
    $('#showtimes').load(url);
}

function changeMovieDate(movie_id, date) {
    var url = '/ajax_movie/'
        + 'movie_id=' + movie_id
        + '/date=' + date
    ;
    
    //$('#showtimes').load('/ajax_loader').load(url);
    $('#showtimes').load(url);
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
				breakpoint: 358,
				settings: {
					slidesToShow:3,
					slidesToScroll:3,
				}
				
			},
			{
				breakpoint: 478,
				settings: {
					slidesToShow:4,
					slidesToScroll:4,
				}
				
			},
			{
				breakpoint: 600,
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
    document.getElementById(this_date).style.display = "block";

}
function updateTrailerHeight(){
	$('.fancybox-inner').css({
		maxHeight: $('.fancybox-inner').width() * 9 / 16
	});
}
//document ready
$(document).ready(function(){
	//start trailer when button is pressed
	$("#play-trailer").fancybox({
		autoscale : true,
		fitToView   : true,
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
		},
		afterShow: function () {
			updateTrailerHeight();
		},
	});
	$(window).on('resize',function(){
		updateTrailerHeight();
	});

	$('.svg').each(function(){
		var img = jQuery(this);
		var imgID = img.attr('id');
		var imgClass = img.attr('class');
		var imgURL = img.attr('src');
		
		jQuery.get(imgURL, function(data) {
		// Get the SVG tag, ignore the rest
		var svg = jQuery(data).find('svg');
		
		// Add replaced image's ID to the new SVG
		if(typeof imgID !== 'undefined') {
			svg = svg.attr('id', imgID);
		}
		// Add replaced image's classes to the new SVG
		if(typeof imgClass !== 'undefined') {
			svg = svg.attr('class', imgClass+' replaced-svg');
		}
		
		// Remove any invalid XML tags as per http://validator.w3.org
		svg = svg.removeAttr('xmlns:a');
		
		// Replace image with new SVG
		img.replaceWith(svg);
		
		}, 'xml');
	});	
	
	//shrink header on scroll
	$(window).on('scroll', function(){
		var screenWidth = $(window).width();
		
		if(screenWidth >= 768){
			if ($(window).scrollTop() >= 110){
				$('#site-header').css({
					'position'       : 'fixed',
					'height'         : '70px',
					'padding'        : '10px 0 10px 10px',
				});
				$('#header-content').css({
					'height'         : '50px',
				});
				$('#header-logo').css({
					'margin-top'     : '0',
					'display'        : 'inline-block',
					'transform'      : 'scale(0.55)',
				});
				$('#top-nav').css({
					'height'         : '32px',
					'margin-top'     : '18px',
					'display'        : 'inline-block',
					'vertical-align' : 'top',
				});
				$('#site-social-icons').css({
					'display'        : 'none'
				})
				
				//only apply these following styles if screen width between 768 and 996
				//if (screenWidth < 996){
				//	$('#top-nav').css('width', '627px');
				//	$('#top-nav ul li').addClass('scroll-pseudo');
				//}
			} else if($(window).scrollTop() < 134){
				$('#site-header').removeAttr('style');
				$('#header-content').removeAttr('style');
				$('#header-logo').removeAttr('style');
				$('#top-nav').removeAttr('style');
				$('#site-social-icons').removeAttr('style');
			}
		}
		
		return false;
	});

	
	/*
	var headerHeight;
	headerHeight = $('#site-header').outerHeight();
	$('#wrapper').css('position', 'relative').css('top', (headerHeight) + 'px');
	*/
	if ($(window).width() < 768){
		$('.sub-nav-container #nav-locations, .sub-nav-container #nav-movies').removeAttr('href');
		$('.sub-nav-container').on('click', function(){
			$(this).find('.sub-nav').toggle('slow');
			return false;
		});
		
		$('.sub-nav li a').on('click', function(){
			console.log($(this).attr('href'));
			window.location.href = $(this).attr('href');
			return false;
		});			
	}

	window.setTimeout(function(){
		/*if ($(window).width() < 768){
			$('svg#hamburger').show();
		}
		$('svg#hamburger').on('click', function(){
			$('#top-nav').toggle('slow');
			return false;
		});*/		
		//lightbox
		$(".newsletter-svg").fancybox({
			width		: 600,
			height		: 800,
			padding		: 0,
			margin		: 50,
			fitToView	: false,
			autoSize	: true,
			closeClick	: true,
			openEffect	: 'fade',
			closeEffect	: 'fade',
		});
	},1000);			

});