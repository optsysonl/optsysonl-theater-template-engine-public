(function ($) {
		$.fn.castFormatter = function() {
			//The ugliest solution possible, but still a solution :)
			var originalCastString = this.text();

			var div = new $("<div>").css({width: this.width() + "px", display: 'none', position: "absolute"});
			div.text(originalCastString);
			$("body").append(div);
			
			var textActualHeight = div.height();

			var newCast = "";

			var myHeight = this.height() > 0 ? this.height() : parseInt(this.css('height'));

			if(textActualHeight > myHeight )
			{
				div.text("");
				for(var i = 0; i < originalCastString.length; (i += 5))
				{
					var temp = newCast + originalCastString.substring(i, i + 5);
					div.text(temp);
					if(div.height() > myHeight)
						break;
					newCast = temp;
				}
			}
			else
				newCast = originalCastString;

		    div.remove();
			var castArr = $.trim(newCast).split(',');
			
			newCast = "";
			for (var i = 0 ; i < castArr.length - 1; i++) {
				newCast += castArr[i] + ", ";
			}

			newCast = newCast.substring(0, newCast.length - 2);
			this.text(newCast);
		
  };
	})( jQuery );