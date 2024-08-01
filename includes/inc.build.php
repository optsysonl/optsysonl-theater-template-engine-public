<?php

/**
 * Builds the image URL for a FilmsXpress uploaded image.
 * 
 * @param $site_id
 * @param $filename
 * @return String a FilmsXpress image URL
 */
function build_image_url($site_id, $filename) {
	return "//www.filmsxpress.com/userimages/".$site_id."/".$filename;
}

/**
 * Builds the image URL for a FilmsXpress house.
 * 
 * @param $site_id
 * @param $filename
 * @return String a FilmsXpress image URL
 */
function build_house_photo_url($site_id, $filename) {
	if ($filename != "") {
		return "//www.filmsxpress.com/images/theatres/".$site_id."/".$filename;
	}
}

/**
 * Builds the image URL for a FilmsXpress carousel.
 * 
 * @param $site_id
 * @param $filename
 * @return String a FilmsXpress image URL
 */
function build_carousel_photo_url($site_id, $filename) {
	if ($filename != "") {
		return "//www.filmsxpress.com/images/Carousel/$site_id/$filename";
	}
}
	
/**
* Builds a movie poster URL based on movie_id and the 
* 'hiphotos' field to check if it exists.
* 
* @param $movie_id
* @param $hiphotos the 'hiphotos' field
* @return String $url a valid image URL
*/
function build_poster_url($movie_id, $hiphotos, $hd = 'no', $site_country = "", $ip_filename = "" ) {
$url = "//www.movienewsletters.net/photos/000000H1.jpg"; // default

// This is an international site 
if (!empty($ip_filename) && $site_country != 'USA') {
    $url = "//www.movienewsletters.net/photos/".$ip_filename;
} elseif ( empty($ip_filename) && !empty($hiphotos) ){
	//HD poster?
	if ($hd == 'HD') { 
		$extension = "X1.jpg";
	} else { 
		$extension = "H1.jpg"; 
	}
	$url = "//www.movienewsletters.net/photos/".str_pad($movie_id,6,'0', STR_PAD_LEFT).$extension;
} 

return $url;
}

/**
* Builds the custom poster URL for a FilmsXpress uploaded poster
* 
* @param $site_id
* @param $filename
* @return String a FilmsXpress image URL
*/
function fxp_build_poster_url($site_id, $filename) {
	return "//www.filmsxpress.com/images/posters/$site_id/$filename";
}

/** 
* Builds a string of genres separated by a delimiter.
* 
* @param $arr a row of movie data from function: 'movie_get_data'
* @param $delimiter the character(s) used to separate the genres
* @return String $str a string of genres
* @see function 'movie_get_data'
*/
function build_genre_string($arr, $delimiter, $number) {
$str = "";
for ($i = 1; $i <= intval($number); $i++) {
	
	//only 3 generes max
	if ($number <= 3) {
		if ($i == 1 && $arr["genre"] != '') {
			$str .= $arr["genre"] . $delimiter;
		} else if ($arr["genre$i"] != '') {
			$str .= $arr["genre$i"] . $delimiter;
		}
	}
}

return substr($str, 0, strrpos($str, $delimiter));
}

/** 
* Builds a string of actor names separated by a delimiter.
* 
* @param $arr a row of movie data from function: 'movie_get_data'
* @param $delimiter the character(s) used to separate the actor names
* @return String $str a string of actor names
* @see function 'movie_get_data'
*/
function build_actors_string($arr, $delimiter, $number) {
$str = "";
for ($i = 1; $i <= intval($number); $i++) {
	
	//only 10 actors max
	if ($number <= 10) {
		if ($arr["actor$i"] != '') {
			$str .= trim($arr["actor$i"]) . $delimiter;
		}
	}
}

return substr($str, 0, strrpos($str, $delimiter));
}


/**
* Builds a movie trailer URL but checks if it exists
* based on either the 'videos' or 'flv_high' fields.
* 
* @TODO figure out if it's videos or flv_high.
* @param $movie_id
* @param $videos the videos or flv_high field
* @return String $url a trailer URL if it exists
*/
function build_trailer_url($movie_id, $videos) {
$url = "";
if (!empty($videos)) {
	$url = "media.westworldmedia.com/mp4/".$movie_id."_high.mp4";
}
return $url;
}

/** 
* Builds a string from showtimes. WILL NOT WORK if
* used with function: 'build_showtimes_ticketing'.
* 
* @param $arr an array of showtimes
* @param $delimiter the character(s) used to separate the times
* @return String a string of showtimes
*/
function build_showtimes_string($arr, $delimiter) {
    return implode($delimiter, $arr);
}

/**
* Gets a two dimensional array with an associative second index
* with 'time' and 'url' keys. This Should only be used if the theater 
* uses online ticketing.
* 
* @param $house_id 
* @param $arr a row of showtime data from function: 'house_get_showtimes'
* @return Array $times[numeric][key] a two dimensional array
* @see function 'house_get_showtimes'
* @see function 'build_showtime'
* @see function 'build_showtime_url''
*/
function build_showtimes_ticketing($house_id, $arr, $showdate, $soldouts) {
$times = array();
$cur_time = date('H:i', strtotime("now"));
$cur_date = date('mdY', strtotime("today"));
$showdate = date('mdY', strtotime("$showdate"));
$week_showdate = date('mdY', strtotime($arr['showdate']));
for ($i = 1; $i < 49; $i++) {
	
	//make sure the time field is not blank
	if (strlen(trim($arr["time$i"])) !== 0) {
		
		//format the showtime and ticketing URL
		$time['time'] = build_showtime($arr["time$i"], $arr["mer$i"]);
		$time['url'] = build_showtime_url($house_id, fix_movie_id($arr['movie_id']), $arr['showdate'], $arr["time$i"], $arr["mer$i"]);
		
		//we need to figure out if the time is past 'Now'
		$showtime = build_military_time($arr["time$i"], $arr["mer$i"]);
		
		//add the disabled style if the showdate and current date are the same and we are past the showtime
		/*echo "<script>console.log('cur date : $cur_date | showdate : $showdate  | arr date: ".$arr['showdate']."' )</script>";*/
		
		if (($showtime < $cur_time) && ($cur_date == $showdate) && ($cur_date == $week_showdate)) {
			$times[] = '<span class="showtime expired">'.$time['time'].'</span>';
		} else { 
			if (isSoldOut($soldouts, $house_id, fix_movie_id($arr['movie_id']), $arr['showdate'], $showtime, $arr['comment']))
				$times[] = '<span class="showtime">Sold Out<span class="showtime-soldout">'.$time['time'].'</span></span>';
			else
				$times[] = '<a class="showtime hvr-sweep-to-right" href="'.$time['url'].'" target="_blank">'.$time['time'].'</a>';
		}
	}
}

//return the times string
return $times;
}

/**
* Builds and formats a time for display to the user.
* 
* @param $time the 'time#' field
* @param $mer the 'mer#' field
* @return String $time a formatted time
*/
function build_showtime($time, $mer) {

//add AM or PM before time conversion
if ($mer == '1') {
	$time .= "am";
} else {
	$time .= "pm";
}

//convert time
$time = date("g:i", strtotime($time));

//if AM, add am text after showtime
if ($mer == '1') {
	$time .= "am";
} else {
	$time .= "pm";
}

//return the showtime
return $time;
}

/**
* Builds a showtime URL for online ticketing.
* 
* @param $house_id
* @param $movie_id
* @param $date the 'showtime' field
* @param $time the 'time#' field
* @param $mer the 'mer#' field
* @return String a valid ticketing URL
*/
function build_showtime_url($house_id, $movie_id, $date, $time, $mer) {
$time = build_military_time($time, $mer);
$date = date('mdY', strtotime($date));
return "http://tix.mvtx.us?house_id=$house_id&movie_id=$movie_id&perfd=$date&perft=$time";
}

/**
* Builds a time formatted in miltary time
* 
* @param $time the 'time#' field
* @param $mer the 'mer#' field
* @return String miltary formatted time
*/
function build_military_time($time, $mer) {

//convert 12:00 AM (midnight) to 24:00 instead of 12:00
if ($mer === '1' && substr($time,0,2) == "12") {
	$time = str_replace('12:','24:',$time);
}

//normal time
if ($mer !== '1') {
	$time = date('G:i', strtotime($time . " pm"));
}

//return the showtime in military time
return $time;
}

/**
* Builds a phone number formatted in ###-###-####
* 
* @param $phone
* @return String phone formatted in ###-###-####
*/
function build_phone_number($phone) {
$phone = trim($phone);
$phone = str_replace(" ", "",$phone);
$phone = str_replace(")", "-",$phone);
$phone = str_replace("(", "",$phone);
return $phone;
}

/**
* Builds a movie still URL based on a filename.
* 
* @param $filename
* @return String a image URL
*/
function build_still_url($filename) {
return "//www.movienewsletters.net/photos/$filename";
}

/**
* Builds a URL for a FilmsXpress page.
* 
* @param $site_id
* @param $page_id
* @return String a FilmsXpress page URL
*/
function fxp_build_page_url($site_id, $page_id) {
return "//www.filmsxpress.com/Content/$site_id/$page_id.txt";
}

function build_DataURI($image, $mime = '') {
	return 'data: '.(function_exists('mime_content_type') ? mime_content_type($image) : $mime).';base64,'.base64_encode(file_get_contents($image));
}

/**
 * Builds the trailer thumbnail URL from a youtube trailer in the fXp edit movie page.
 *
 * @param $site_id
 * @param $filename
 * @return String a FilmsXpress image URL
 */
function build_trailer_thumbnail($trailer, $still = ''){
    if (strpos($trailer, 'youtube') !== false){
        if (strpos($trailer, 'watch?v=')){
            parse_str( parse_url( $trailer, PHP_URL_QUERY ), $link_array );
            $thumb = $link_array['v'];
            return "http://img.youtube.com/vi/$thumb/hqdefault.jpg";
        }
        elseif (strpos($trailer, 'embed/')){
            $thumb = substr(strrchr($trailer, '/'), 1);
            return "http://img.youtube.com/vi/$thumb/hqdefault.jpg";
        }
    } elseif ($still != '') {
        return $still;
    } else {
        return "/assets/images/icoNoTrailer.png";
        //return "http://www.movienewsletters.net/photos/000000H2.jpg"
    }
}