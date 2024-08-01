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




//Document ready
$(document).ready(function(){
	
	var adcube_divs_featured = $('div[class^="adcube_image_bottom"]').hide(), c = 0;
	
	(function adcube_cycle_featured() { 
		var featured_num = adcube_divs_featured.length;
		//fade timer
		if (featured_num > 1) {
			adcube_divs_featured.eq(c).fadeIn(400).delay(5000).fadeOut(400, adcube_cycle_featured);
		} else {
			$('div[class^="adcube_image_bottom"]').show()
		}
		
		// increment c and reset to 0 when it equals divs.length
		c = ++c % adcube_divs_featured.length;
	})();
	setTimeout(function(){
		if($(window).width() >= 768){
			var scrollMax = $('#header').height() - 53;
			//console.log('scrollMax: ' + scrollMax);
			$('#header').css({'position':'relative'});
			$(window).on('scroll', function(){
				if ($(window).scrollTop() > scrollMax){
					//console.log('fire');
					$('#header').css({'position':'fixed','top':'-'+scrollMax+'px'});
				} else {
					//$('#header').removeAttr('style');
					$('#header').css({'position':'relative','top':'0'});
				}
				
			});
		}
	}, 500),
	
	setTimeout( function(){
		$('#background_wrap').css('top', $('#header').height() + 'px');
	},100);
		
	//lightbox
	$(".lightbox").fancybox({
		width		: 600,
		height		: 400,
		padding		: 0,
		margin		: 50,
		fitToView	: false,
		autoSize	: true,
		closeClick	: true,
		openEffect	: 'fade',
		closeEffect	: 'fade',
	});
	
	//lightbox
	$(".newsletter").fancybox({
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
	
	//start trailer when button is pressed
	$(".play-trailer").fancybox({
		autoscale : false,
		width : 800,
		height : 450,
		transitionIn : 'none',
		transitionOut : 'none',
		padding : 0,
		title : this.title,
		href : this.href,
		beforeShow: function(){
		  $(".fancybox-skin").css("backgroundColor","#000000");
		}
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
	
});