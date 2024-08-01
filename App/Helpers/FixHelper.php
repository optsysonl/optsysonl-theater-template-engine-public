<?php

namespace App\Helpers;

class FixHelper
{
    /**
     * Fixes the movie_id by removing the decimal point and
     * any trailing values.
     *
     * @param $movie_id
     *
     * @return string $movie_id
     */
    public static function fix_movie_id($movie_id)
    {
        //get rid of decimal points in movie ID
        if (strpos($movie_id, '.') !== false) {
            $movie_id = substr($movie_id, 0, strpos($movie_id, '.'));
        }
        
        return $movie_id;
    }
    
    /**
     * Fixes movie names by prepending "The", "An", and "A"
     * and removing ", The", ", An", and ", A" respectively.
     *
     * @param $name
     *
     * @return string $name
     */
    public static function fix_movie_name($name)
    {
        //Move The, An, A to front of movie name
        if ((strrpos($name, ", The") > 0) && (strrpos($name, ", The") == (strlen($name) - 5))) {
            return "The " . trim(substr($name, 0, strrpos($name, ", The")));
        } else if ((strrpos($name, ", An") > 0) && (strrpos($name, ", An") == (strlen($name) - 4))) {
            return "An " . trim(substr($name, 0, strrpos($name, ", An")));
        } else if ((strrpos($name, ", A") > 0) && (strrpos($name, ", A") == (strlen($name) - 3))) {
            return "A " . trim(substr($name, 0, strrpos($name, ", A")));
        } else {
            return trim($name);
        }
    }
    
    /**
     * Fixes the runtime for display by formatting it as '# hr. ## min.'
     *
     * @param $runtime the 'runtime' field
     *
     * @return String $result a formatted runtime
     */
    public static function fix_movie_runtime($runtime)
    {
        $result = "";
        
        if (!empty($runtime)) {
            
            //if 00 for hour, hard code it
            if (substr($runtime, 0, 2) == "00") {
                $hour = 0;
            } else {
                $hour = (int)substr($runtime, 0, 2);
            }
            
            $min = (int)substr($runtime, 3, 2);
            
            $result = $hour . " hr. " . $min . " min.";
        } else {
            $result = '';
        }
        
        return trim($result);
    }
    
    /**
     * Fixes the mpaa for display
     *
     * @param string $mpaa
     * @param string $site_state
     *
     * @return string $mpaa a formatted runtime
     */
    public static function movieMpaa($mpaa, $site_state)
    {
        $site_country = config('fxp.site_country');
        
        $mpaa = trim($mpaa);
        
        if ($site_country == 'CAN') {
            if ($site_state) {
                $mpaa = PageHelper::getStateRating($mpaa, $site_state);
            } else {
                $mpaa = 'Ratings May Vary';
            }
        }
        
        return $mpaa;
    }
}