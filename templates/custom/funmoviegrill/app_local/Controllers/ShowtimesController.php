<?php

namespace templates\custom\funmoviegrill\app_local\Controllers;

use App\Core\Cache;

use App\Helpers\DateHelper;
use App\Helpers\MovieHelper;
use App\Helpers\BuildHelper;
use App\Helpers\MetaHelper;

use App\Helpers\TimeZoneHelper;
use App\Models\House;
use App\Models\Screen as CoreScreen;

use templates\custom\funmoviegrill\app_local\Models\Screen;

class ShowtimesController
{

    public function showtimesByFilter($filter_id){
        $site_id = config('fxp.site_id');

        $cacheItem = Cache::getItem('showtimesByFilter_site_' . $site_id.'_filter_'.$filter_id);
        if (!Cache::isHit($cacheItem)) {

            $coreScreen = new CoreScreen();
            $localScreen = new Screen();

            $showtimes = [];
            $showdates = $coreScreen->getShowdates();

            foreach ($showdates as $a_date) {
                $cacheItem_date = Cache::getItem('showtimesByFilter_site_' . $site_id.'_filter_'.$filter_id.'_date_'.$a_date);
                if (!Cache::isHit($cacheItem_date)) {
                    $showtimes_date = [];

                    $showtimes_results = $localScreen->getShowtimesByFilter($a_date, $filter_id);

                    foreach ($showtimes_results as $result) {
                        // Set timezone of house
                        TimeZoneHelper::setTimezone($result->timezone);
                        $now = DateHelper::now();

                        $house_id = $result->house_id;
                        $movie_id = $result->movie_id;
                        $showdate = $result->showdate;

                        $mHouse = new House();
                        $movie_name = $result->movie_name;

                        $ticketing = MetaHelper::get_ticketing($result->posType);

                        // If they want to display sold out information, retrieve from perfs
                        $soldouts = $mHouse->getPerfsSoldout($house_id, $a_date);

                        // showtimes array building
                        $showdate = date('Y-m-d', strtotime($showdate));
                        for ($i = 1; $i <= 48; $i++) {
                            if (isset($result->{"time{$i}"})) {
                                $showtime = date('H:i', strtotime($result->{"time{$i}"}));

                                $showtimeDateTime = date('Y-m-d', strtotime($a_date)) . ' ' . date('H:i:s', strtotime($showtime));

                                $timeData = [];
                                $timeData['screens_id'] = $result->screens_id;
                                $timeData['screen_id'] = $result->screen_id;
                                $timeData['format'] = MovieHelper::format($movie_name);
                                $timeData['allowpass'] = $result->allowpass;
                                $timeData['comment'] = $result->comment;
                                $timeData['sneak'] = $result->sneak;

                                if ($showtimeDateTime > $now) {
                                    $timeData['expired'] = false;
                                } else {
                                    $timeData['expired'] = true;
                                }

                                if ($ticketing) {
                                    // create comment to send to relay
                                    $showcode = '';
                                    $screen = '';
                                    if (stripos($timeData['comment'], 'mxc') !== false) {
                                        $showcode = 'mxc';
                                    }
                                    if (stripos($timeData['comment'], 'dbox') !== false) {
                                        $showcode = 'dbox';
                                    }
                                    if (stripos($timeData['comment'], 'VIP') !== false) {
                                        $showcode = 'vip';
                                    }
                                    if (stripos($timeData['comment'], 'luxury') !== false) {
                                        $showcode = 'luxury';
                                    }
                                    preg_match('/screen_(?P<screen>\d+)/', $timeData['comment'],$matches );
                                    if(!empty($matches)){
                                        $screen = $matches['screen'];
                                    }

                                    if (MetaHelper::isSoldOut($soldouts, $house_id, $movie_id, $a_date, $showtime)) {
                                        $timeData['soldout'] = true;
                                    } else {
                                        // format the showtime and ticketing URL
                                        $timeData['link'] = BuildHelper::build_showtime_url($house_id, $movie_id, $a_date, $showtime, $showcode, $screen);
                                    }
                                }

                                $result_line = array(
                                    'house_id'  => $house_id,
                                    'movie_id'  => $movie_id,
                                    'parent_id' => ($result->parent_id) ? $result->parent_id : '',
                                    'date'      => $showdate,
                                    'time'      => $showtime,
                                    'details'   => $timeData,
                                );
                                array_push($showtimes_date, $result_line);

                            }
                        }
                    }

                    if(Cache::getCreateCache()) {
                        $cacheItem_date->expiresAfter(rand( Cache::TIME15MIN, Cache::TIME1HR ));
                        $cacheItem_date->set($showtimes_date);
                        Cache::save($cacheItem_date);
                    }
                    $showtimes = array_merge($showtimes, $showtimes_date);
                }else{
                    $showtimes_date = $cacheItem_date->get();
                    $showtimes = array_merge($showtimes, $showtimes_date);
                }
            }

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME10MIN);
                $cacheItem->set($showtimes);
                Cache::save($cacheItem);
            }
        } else {
            $showtimes = $cacheItem->get();
        }

        return $showtimes;
    }
}