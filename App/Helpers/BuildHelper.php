<?php

namespace App\Helpers;

use App\Core\Cache;

/**
 * Class BuildHelper
 * @package App\Helpers
 */
class BuildHelper
{
    /**
     * Builds the image URL for a FilmsXpress uploaded image.
     *
     * @param $site_id
     * @param $filename
     *
     * @return String a FilmsXpress image URL
     */
    public static function build_image_url($site_id, $filename)
    {
        return "//www.filmsxpress.com/userimages/" . $site_id . "/" . $filename;
    }
    
    /**
     * Builds the image URL for a FilmsXpress house.
     *
     * @param $site_id
     * @param $filename
     *
     * @return String a FilmsXpress image URL
     */
    public static function build_house_photo_url($site_id, $filename)
    {
        if ($filename != "") {
            return "//www.filmsxpress.com/images/theatres/" . $site_id . "/" . $filename;
        }
    }
    
    /**
     * Builds the image URL for a FilmsXpress carousel.
     *
     * @param $site_id
     * @param $filename
     *
     * @return String a FilmsXpress image URL
     */
    public static function build_carousel_photo_url($site_id, $filename)
    {
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
     *
     * @return String $url a valid image URL
     */
    public function build_poster_url($movie_id, $image_quality = 'R', $site_country = "", $ip_filename = "")
    {
        $url_def = "//www.movienewsletters.net/photos/000000H1.jpg"; // default

        // This is an international site
        if (!empty($ip_filename) && $site_country != 'USA') {
            $url = "//www.movienewsletters.net/photos/" . $ip_filename;
            if(BuildHelper::checkImage($url)){
                return $url;
            }else{
                return $url_def;
            }
        } else{
            //RAW poster?
            if ($image_quality == 'R') {
                $extension = "R1.jpg";
                $url = "//www.movienewsletters.net/photos/" . str_pad($movie_id, 6, '0', STR_PAD_LEFT) . $extension;

                if(BuildHelper::checkImage($url)){
                    return $url;
                }else{
                    $image_quality = 'H';
                }
            }

            if($image_quality == 'H') {
                $extension = "H1.jpg";
                $url = "//www.movienewsletters.net/photos/" . str_pad($movie_id, 6, '0', STR_PAD_LEFT) . $extension;

                if(BuildHelper::checkImage($url)){
                    return $url;
                }else{
                    return $url_def;
                }
            }
        }

        return $url_def;
    }

    /**
     * @param $image_url
     * @return bool
     */
    public static function checkImage($image_url){
        if(Cache::getCreateCache()) {
            $debug = config('fxp.debug', false);

            if (!$debug) {
                $headers = @get_headers("https:" . $image_url);
                if (!$headers || $headers[0] == 'HTTP/1.1 404 Not Found') {
                    return false;
                } else {
                    return $image_url;
                }
            } else {
                return $image_url;
            }
        }else{
            return $image_url;
        }

    }
    
    /**
     * Builds the custom poster URL for a FilmsXpress uploaded poster
     *
     * @param $site_id
     * @param $filename
     *
     * @return String a FilmsXpress image URL
     */
    public static function fxp_build_poster_url($site_id, $filename)
    {
        return "//www.filmsxpress.com/images/posters/{$site_id}/{$filename}";
    }
    
    /**
     * Builds a string of genres separated by a delimiter.
     *
     * @param array   $arr       a row of movie data from function: 'movie_get_data'
     * @param string  $delimiter the character(s) used to separate the genres
     * @param integer $number
     *
     * @return String $str a string of genres
     * @see function 'movie_get_data'
     */
    public static function build_genre_string($arr, $delimiter, $number)
    {
        $str = "";
        for ($i = 1; $i <= intval($number); $i++) {
            
            //only 3 generes max
            if ($number <= 3) {
                if ($i == 1 && $arr["genre"] != '') {
                    $str .= trim($arr["genre"]) . $delimiter;
                } else if ($arr["genre$i"] != '') {
                    $str .= trim($arr["genre$i"]) . $delimiter;
                }
            }
        }
        
        return substr($str, 0, strrpos($str, $delimiter));
    }
    
    /**
     * Builds a string of actor names separated by a delimiter.
     *
     * @param $arr       a row of movie data from function: 'movie_get_data'
     * @param $delimiter the character(s) used to separate the actor names
     *
     * @return String $str a string of actor names
     * @see function 'movie_get_data'
     */
    public static function build_actors_string($arr, $delimiter, $number)
    {
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
     * Builds a showtime URL for online ticketing.
     *
     * @param integer $house_id
     * @param integer $movie_id
     * @param string  $date the 'showtime' field
     * @param string  $time the 'time#' field
     * @param string $code
     * @param integer $screen
     *
     * @return string a valid ticketing URL
     */
    public static function build_showtime_url($house_id, $movie_id, $date, $time, $code = '', $screen = '')
    {
        $relay_url = config('server.relay', 'http://tix.mvtx.us');
        $time = date('H:i', strtotime($time));
        $date = date('mdY', strtotime($date));

        $url = $relay_url."?house_id={$house_id}&movie_id={$movie_id}&perfd={$date}&perft={$time}";
        if ($screen != '') {
            $url .= "&screen=$screen";
        }
        if ($code != '') {
          $url .= "&code={$code}";
        }
        if (stripos($relay_url, 'relay.mvtx') !== false) {
            $site_id = config('fxp.site_id');
            $url .= "&site=$site_id";
        }
        
        return $url;
    }
    
    /**
     * Builds a phone number formatted in ###-###-####
     *
     * @param $phone
     *
     * @return String phone formatted in ###-###-####
     */
    public static function build_phone_number($phone)
    {
        $phone = trim($phone);
        $phone = str_replace(" ", "", $phone);
        $phone = str_replace(")", "-", $phone);
        $phone = str_replace("(", "", $phone);
        
        return $phone;
    }
    
    /**
     * Builds a movie still URL based on a filename.
     *
     * @param $filename
     *
     * @return String a image URL
     */
    public static function build_still_url($filename)
    {
        return "//www.movienewsletters.net/photos/$filename";
    }

    /**
     * Builds a movie still URL based on a filename.
     *
     * @param $filename
     *
     * @return String a image URL
     */
    public static function build_custom_still_url($site_id, $filename)
    {
        return '//filmsxpress.com/images/stills/' . $site_id . '/' . $filename;
    }
    
    /**
     * Builds a URL for a FilmsXpress page.
     *
     * @param $site_id
     * @param $page_id
     *
     * @return String a FilmsXpress page URL
     */
    public static function fxp_build_page_url($site_id, $page_id)
    {
        return "http://www.filmsxpress.com/Content/$site_id/$page_id.txt";
    }

    /**
     * @param $image
     * @param string $mime
     * @return string
     */
    public static function build_DataURI($image, $mime = '')
    {
        if (file_exists($image)) {
            return 'data: ' . (function_exists('mime_content_type') ? mime_content_type($image) : $mime) . ';base64,' . base64_encode(file_get_contents($image));
        } else {
            return $image;
        }
    }
    
    /**
     * Builds the trailer thumbnail URL from a youtube trailer in the fXp edit movie page.
     *
     * @param $trailer
     * @param $still
     *
     * @return String a FilmsXpress image URL
     */
    public static function build_trailer_thumbnail($trailer, $still = '')
    {
        if (strpos($trailer, 'youtube') !== false) {
            if (strpos($trailer, 'watch?v=')) {
                parse_str(parse_url($trailer, PHP_URL_QUERY), $link_array);
                $thumb = $link_array['v'];
                
                return "http://img.youtube.com/vi/$thumb/hqdefault.jpg";
            } elseif (strpos($trailer, 'embed/')) {
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

	/**
	 * @return array
	 */
	public static function tokenizer($path) {
		$filters = [];
		$tokens = token_get_all(file_get_contents($path));
		$numTokens = count($tokens);

		for ($i = 0; $i < $numTokens; ++$i) {
			$token = $tokens[$i];

			if (is_array($token)) {
				if ($token[0] == T_FUNCTION) {
					$filters[] = $tokens[$i + 2][1];
					$i+=2;
				}
			}
		}
		return $filters;
	}

}