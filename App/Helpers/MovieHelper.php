<?php

namespace App\Helpers;

use App\Core\Support\Str;
use App\Enums\MovieFormatEnum;

class MovieHelper
{
    /**
     * Fixes movie names by prepending "The", "An", and "A"
     * and removing ", The", ", An", and ", A" respectively.
     *
     * @param $name
     *
     * @return string $name
     */
    public static function name($name)
    {

        if (isset($name) && $name != '') {
            $name = $name;
        } else{
            $name = 'NO NAME';
        }

        //Move The, An, A to front of movie name
        if (strrpos($name, ", The") > 0) {
            return "The " . trim(substr($name, 0, strrpos($name, ", The")));
        } else if (strrpos($name, ", An") > 0) {
            return "An " . trim(substr($name, 0, strrpos($name, ", An")));
        } else if (strrpos($name, ", A") > 0) {
            return "A " . trim(substr($name, 0, strrpos($name, ", A")));
        } else {
            return trim($name);
        }
    }
    
    public static function url($id, $name)
    {
        return '/movie/' . $id . '/' . Str::slug($name);
    }
    
    /**
     * Fixes the mpaa for display
     *
     * @param string $mpaa
     * @param string $state
     *
     * @return string $mpaa a formatted runtime
     */
    public static function mpaa($mpaa, $state = null)
    {
        $site_country = config('fxp.site_country');
        
        $mpaa = trim($mpaa);
        
        if ($site_country == 'CAN') {
            $mpaa = PageHelper::getStateRating($mpaa, $state);
        }
        
        return $mpaa;
    }
    
    /**
     * Builds a movie trailer URL but checks if it exists
     * based on either the 'videos' or 'flv_high' fields.
     *
     * @param integer $id
     * @param array   $data
     * @param array   $stills
     *
     * @return array $trailer a trailer URL and Image
     */
    public static function trailer($id, $data, $stills = [])
    {
        $trailer = ['url' => '', 'image' => ''];

        $videos = (isset($data['videos']) ? $data['videos'] : false);
        $flv_high = (isset($data['flv_high']) ? $data['flv_high'] : false);
        $csTrailer = (isset($data['csTrailer']) ? $data['csTrailer'] : '');

        if ($csTrailer) {
            $trailer['url'] = str_replace('http:', '', str_replace('https:', '', $csTrailer));
        }elseif ($videos || $flv_high) {
            $trailer['url'] = "//m.boxoffice.media/mp4/{$id}_high.mp4";
        }
        
        if (strpos($trailer['url'], 'youtube') !== false) {
            if (strpos($trailer['url'], 'watch?v=')) {
                parse_str(parse_url($trailer['url'], PHP_URL_QUERY), $link_array);
                $thumb = $link_array['v'];
                
                $trailer['image'] = "//img.youtube.com/vi/{$thumb}/hqdefault.jpg";
            } elseif (strpos($trailer['url'], 'embed/')) {
                $thumb = substr(strrchr($trailer['url'], '/'), 1);
                
                $trailer['image'] =  "//img.youtube.com/vi/{$thumb}/hqdefault.jpg";
            }
        } elseif (isset($stills[0])) {
            $trailer['image'] = $stills[0];
        } else {
            $trailer['image'] = "//www.movienewsletters.net/photos/000000H2.jpg";
        }
        $trailer['url'] = urlencode($trailer['url']);

        return $trailer;
    }
    
    /**
     * Get poster URL.
     *
     * @param integer $id
     * @param array   $data
     *
     * @return string $url a poster
     */
    public static function poster($id, $data)
    {
        $site_id      = config('fxp.site_id');
        $site_country = config('fxp.site_country');
        $image_quality= config('fxp.template_options.image_quality');

        $posterImage = (isset($data['posterImage']) ? $data['posterImage'] : null);
        $ip_filename = (isset($data['ip_filename']) ? $data['ip_filename'] : null);
        
        if ($posterImage) {
            $poster = BuildHelper::fxp_build_poster_url($site_id, $posterImage);
        } else {
            $poster = BuildHelper::build_poster_url($id, $image_quality, $site_country, $ip_filename);
        }
        
        return $poster;
    }
    
    /**
     * In string is trying found format movie.
     *
     * @param $title - movie name.
     *
     * @return string
     */
    public static function format($title)
    {
        $title = Str::upper($title);
        if (Str::contains($title, MovieFormatEnum::format_imax_3d)) {
            $format = MovieFormatEnum::getValueName(MovieFormatEnum::format_imax_3d);
        } elseif (Str::contains($title, MovieFormatEnum::format_imax)) {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_imax);
        } elseif (Str::contains($title, MovieFormatEnum::format_3d)) {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_3d);
        } elseif (Str::contains($title, MovieFormatEnum::format_35mm)) {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_35mm);
        } elseif (Str::contains($title, MovieFormatEnum::format_70mm)) {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_70mm);
        } elseif (Str::contains($title, MovieFormatEnum::format_hfr)) {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_hfr);
        } else {
            $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_2d);
        }
        
        $format = [
            'name'  => $format,
            'value' => MovieFormatEnum::getNameValue($format)
        ];
        
        return $format;
    }
}