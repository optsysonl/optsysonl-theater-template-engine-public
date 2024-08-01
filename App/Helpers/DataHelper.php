<?php

namespace App\Helpers;

use App\Core\Support\Str;

use App\Models\House;
use App\Models\Movie;

use App\Enums\MovieFormatEnum;

class DataHelper
{
    /**
     * Transform result function Screen::Showtimes
     *
     * @param array   $data
     * @param string  $date
     * @param string  $state
     *
     * @return array
     */
    public static function transformScreenShowtimes($data, $date, $house_arr)
    {

        $now = DateHelper::now();

        $mHouse = new House();

        $ticketing = HouseHelper::ticketing($house_arr);
        // If they want to display sold out information, retrieve from perfs
        $soldouts = $mHouse->getPerfsSoldout($house_arr['house_id'], $date);

        foreach ($data['movies'] as $movie_id => $movie) {
            //$newMovie = self::transformMovie($movie_id, $movie, ['state' => $state]);
            $movie_times = $movie['showtimes'][$date];
            $newMovie = [];
            foreach ($movie_times as $time => $time_items) {
                foreach ($time_items as $key => $time_item) {
                    $newMovie['showtimes'][$time][$key] = $time_item;
                    $showtimeDateTime = date('Y-m-d', strtotime($date)) . ' ' . date('H:i:s', strtotime($time));
                    if ($showtimeDateTime > $now) {
                        $newMovie['showtimes'][$time][$key]['expired'] = false;
                    } else {
                        $newMovie['showtimes'][$time][$key]['expired'] = true;
                    }

                    if ($ticketing) {
                        // format the showtime and ticketing URL
                        $link = BuildHelper::build_showtime_url($house_arr['house_id'], $movie_id, $date, $time);
                        if (MetaHelper::isSoldOut($soldouts, $house_arr['house_id'], $movie_id, $date, $time, $time_item['comment'])) {
                            $newMovie['showtimes'][$time][$key]['soldout'] = true;
                        } else {
                            $newMovie['showtimes'][$time][$key]['link'] = $link;
                        }
                    }
                }
            }

            $data['movies'][$movie_id] = $newMovie;
        }

        return $data;
    }

    /**
     * Transform Movie data received of SQL
     *
     * @param integer $movie_id
     * @param array $data
     * @param array $addition
     *
     * @return array
     */
    public static function transformMovie($data, $addition = [])
    {
        $movie_id = $data['movie_id'];
        $state = (isset($addition['state']) ? $addition['state'] : null);
        $image_quality = config('fxp.template_options.image_quality');
        $show_movie_trailer = config('fxp.template_options.show_movie_trailer', true);
        $mMovie = new Movie();

        $data_new = [];
        $data_new['id']             = $data['movie_id'];
        $data_new['name']           = MovieHelper::name($data['name']);
        $data_new['stills']         = $mMovie->getStills($movie_id, $image_quality);
        $data_new['stills_custom']  = $mMovie->getCustomStills($movie_id);
        $data_new['slug']           = Str::slug($data_new['name']);
        $data_new['url']            = MovieHelper::url($movie_id, $data_new['name']);
        $data_new['poster']         = MovieHelper::poster($movie_id, $data);
        $data_new['trailer']        = ($show_movie_trailer) ? MovieHelper::trailer($movie_id, $data, $data_new['stills_custom']+$data_new['stills']) : ['url' => '', 'image' => ''];
        $data_new['mpaa']           = (isset($data['mpaa']) ? MovieHelper::mpaa($data['mpaa'], $state) : null);
        $data_new['runtime']        = ((isset($data['runtime']) && ($data['runtime'] != '0')) ? $data['runtime'] : null);
        $data_new['release']        = (isset($data['release']) ? date('Y-m-d', strtotime($data['release'])) : null);
        $data_new['director']       = (isset($data['director']) ? $data['director'] : null);
        $data_new['writer']         = (isset($data['writer']) ? $data['writer'] : null);
        $data_new['studio']         = (isset($data['distrib']) ? $data['distrib'] : null);
        $data_new['advisory']       = (isset($data['advisory']) ? $data['advisory'] : null);
        $data_new['synopsis']       = (isset($data['synopsis']) ? $data['synopsis'] : null);
        $data_new['synopsis_short'] = (isset($data['synopsis_short']) ? $data['synopsis_short'] : null);
        $data_new['custom_text']    = (isset($data['custom_text']) ? $data['custom_text'] : null);
        $data_new['parent_id']      = (isset($data['parent_id']) ? $data['parent_id'] : null);
		$data_new['sort_order']     = (isset($data['sort_order']) ? $data['sort_order'] : null);
        $data_new['orphan']         = (isset($data['orphan']) ? $data['orphan'] : 0);
        $data_new['virtual_cinema'] = (isset($data['virtual_cinema']) ? json_decode($data['virtual_cinema'], true)['sessions'][0] : 0);
        $data_new['seo']            = MetaHelper::meta_seo($data['seo']);

        if (isset($data['categories'])) {
            $choices_array = array_filter( explode(';', $data['categories']) );

            foreach($choices_array as $a_choice){
                $a_choice_array = array_filter(explode('///',$a_choice));

                $key = $a_choice_array[0];
                $cat_name = $a_choice_array[1];
                array_splice($a_choice_array, 0, 2);

                $new_choice_array[$key] = array(
                                            'cat_id' => $key,
                                            'cat_name' => str_replace(array( '(', ')' ), '', $cat_name),
                                            'events' => $a_choice_array
                                        );
            }
            $data_new['categories'] =  $new_choice_array;
        }

        if(isset($data['csGenre']) && $data['csGenre'] != ''){
            $data_new['genres'][] = $data['csGenre'];
        }else{
            if (isset($data['genre'])) {
                $data_new['genres'][] = $data['genre'];
            }
            for ($i = 2; isset($data["genre{$i}"]); $i++) {
                $data_new['genres'][] = $data["genre{$i}"];
            }
        }

        if(isset($data['csActors']) && $data['csActors'] != ''){
            $data_new['actors'][] = $data['csActors'];
        }else{
            for ($i = 1; isset($data["actor{$i}"]); $i++) {
                $data_new['actors'][] = $data["actor{$i}"];
            }
        }

        return $data_new;
    }

    /**
     * Create Showtimes for Virtual Cinemas
     *
     * @param array $houseIds
     * @param array $date_ran
     * @param integer $movie_id
     *
     * @return array
     */
    public static function createVirtualShowtimes($houseIds, $date_ran, $movie_id, $link, $button_txt)
    {
        $showtimes = [];
        foreach ($houseIds as $h_id){
            foreach ($date_ran as $range){
                $begin = new \DateTime($range['start']);
                $end = new \DateTime($range['end']);

                $interval = \DateInterval::createFromDateString('1 day');
                $period = new \DatePeriod($begin, $interval, $end);

                $format =  MovieFormatEnum::getValueName(MovieFormatEnum::format_virtual);
                $format = [
                    'name'  => $format,
                    'value' => MovieFormatEnum::getNameValue($format)
                ];

                $details = [
                    'link'      => $link,
                    'expired'   => false,
                    'format'    => $format,
                    'allowpass' => false,
                    'comment'   => '',
                    'button'    => $button_txt
                ];

                foreach ($period as $dt) {
                    $showtimes[] = array(
                        'house_id'  => $h_id,
                        'movie_id'  => $movie_id,
                        'parent_id' => '',
                        'date'      => $dt->format('Y-m-d'),
                        'time'      => $dt->format('Y-m-d 00:00:00'),
                        'details'   => $details,

                    );
                }
            }
        }
        return $showtimes;
    }

}