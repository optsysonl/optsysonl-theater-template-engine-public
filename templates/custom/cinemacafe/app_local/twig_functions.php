<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 5/31/2018
 * Time: 8:19 AM
 */

use App\Core\Cache;

function getHouseTimesFunction($showdates, $house_id, $movies=[]){

    $this_house_dates = [];
    $this_house_data = [];

    $cacheItem = Cache::getItem('getHouseTimes_' .md5(json_encode($showdates)). '_' . $house_id );

    if (!Cache::isHit($cacheItem)) {

        foreach($showdates as $a_showdate){
            $cacheItem_ind = Cache::getItem('getHouseTimes_ind_' . $house_id . '_' . md5(json_encode($a_showdate)));
            if (!Cache::isHit($cacheItem_ind)) {
                if($a_showdate['house_id'] == $house_id){
                    $this_house_dates[] =  $a_showdate['date'];
                    $main_movie_id = $a_showdate['movie_id'];

                    if ($a_showdate['parent_id']) {
                        if (isset($movies[$main_movie_id]) && $movies[$main_movie_id]['orphan'] != 0 ){
                        }else {
                            $main_movie_id = $a_showdate['parent_id'];
                        }
                    }

                    $comment = $a_showdate['details']['comment'];
                    if ($a_showdate['details']['format']['value'] != "2D"){
                        $comment = $a_showdate['details']['format']['value']. ($a_showdate['details']['comment'] != "" ? ", " : ""). $a_showdate['details']['comment'];
                    }

                    if ($a_showdate['details']['allowpass'] == "N"){
                        $comment = "No Passes" . ($a_showdate['details']['comment'] != "" ? " | " : ""). $a_showdate['details']['comment'];
                    }

                    $this_house_data[$a_showdate['date']]['movies'][$main_movie_id][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] =  $a_showdate['details'];
                }

                $to_cache_item['date']              = $a_showdate['date'];
                $to_cache_item['this_house_data']   = $this_house_data;

                $cacheItem_ind->expiresAfter(rand( Cache::TIME15MIN, Cache::TIME20MIN ));
                $cacheItem_ind->set($to_cache_item);
                Cache::save($cacheItem_ind);
            } else {
                $to_cache_item = $cacheItem_ind->get();

                $this_house_dates[] = $to_cache_item['date'];
                $this_house_data = $to_cache_item['this_house_data'];
            }
        }
        $this_house_dates = array_unique($this_house_dates,  $sort_flags = SORT_STRING);
        ksort($this_house_dates);

        $data['dates'] = $this_house_dates;
        $data['showtimes'] = $this_house_data;


        $cacheItem->expiresAfter(Cache::TIME10MIN);
        $cacheItem->set($data);
        Cache::save($cacheItem);
    } else {
        $data = $cacheItem->get();
    }

    return $data;
}

function getMovieTimesFunction($showdates, $movie_id){
    $data = ['dates' => [],'showtimes' => []];

    $cacheItem = Cache::getItem('getMovieTimes_' . $movie_id . '_' . md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        if (empty($movie_id) || empty($showdates)) {
            return $data;
        }

        $this_movie_dates = [];
        $this_movie_data = [];

        foreach($showdates as $a_showdate){
            if($a_showdate['movie_id'] == $movie_id || $a_showdate['parent_id'] == $movie_id){
                $this_movie_dates[] =  $a_showdate['date'];

                $comment = $a_showdate['details']['comment'];
                if ($a_showdate['details']['format']['value'] != "2D"){
                    $comment = $a_showdate['details']['format']['value']. ($a_showdate['details']['comment'] != "" ? ", " : ""). $a_showdate['details']['comment'];
                }

                $this_movie_data[$a_showdate['date']]['houses'][$a_showdate['house_id']][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] =  $a_showdate['details'];
            }
        }
        $this_movie_dates = array_unique($this_movie_dates,  $sort_flags = SORT_STRING);
        ksort($this_movie_dates);

        $data['dates'] = $this_movie_dates;
        $data['showtimes'] = $this_movie_data;

        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($data);
        Cache::save($cacheItem);
    } else {
        $data = $cacheItem->get();
    }

    return $data;
}