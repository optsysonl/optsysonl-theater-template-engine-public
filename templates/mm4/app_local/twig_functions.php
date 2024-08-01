<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 4/27/2018
 * Time: 10:47 AM
 */

use App\Core\Cache;
use App\Helpers\DateHelper;

function getHouseTimesFunction($showdates, $house_id, $movies){
    $data = ['dates' => [],'showtimes' => []];

    $cacheItem = Cache::getItem('getHouseTimes_' . $house_id . '_' . md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        if (empty($house_id) || empty($showdates)) {
            return $data;
        }

        $this_house_dates = [];
        $this_house_data = [];

        foreach($showdates as $a_showdate){
            if($a_showdate['house_id'] == $house_id){
                $this_house_dates[] =  $a_showdate['date'];
                $main_movie_id = $a_showdate['movie_id'];
                if ($a_showdate['parent_id']) {
                    if (isset($movies[$main_movie_id]) && $movies[$main_movie_id]['orphan'] != 0 ){
                    }else {
                        $main_movie_id = $a_showdate['parent_id'];
                    }
                }

                $comment = formatCommentFunction($a_showdate['details']['comment']);

                if ($a_showdate['details']['format']['value'] != "2D"){
                    $comment = $a_showdate['details']['format']['value']. ($comment != "" ? ", " : ""). $comment;
                }

                $this_house_data[$a_showdate['date']]['movies'][$main_movie_id][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] =  $a_showdate['details'];
            }
        }
        $this_house_dates = array_unique($this_house_dates,  $sort_flags = SORT_STRING);
        ksort($this_house_dates);

        $data['dates'] = $this_house_dates;
        $data['showtimes'] = $this_house_data;

        $cacheItem->expiresAfter(Cache::TIME15MIN);
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

                $comment = formatCommentFunction($a_showdate['details']['comment']);

                if ($a_showdate['details']['format']['value'] != "2D"){
                    $comment = $a_showdate['details']['format']['value']. ($comment != "" ? ", " : ""). $comment;
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

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function nowPlayingComingSoonFunction($arr, $showdates=[])
{
    $result=['np'=>[],'cs'=>[]];

    $cacheItem = Cache::getItem('nowPlayingComingSoon_' . md5(serialize($arr)) . '_' . md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        $today = DateHelper::today_with_0_time();
        $showdate_movie = [];

        if(empty($showdates)){$showdates=[];}
        foreach ($showdates as $showdate) {
            $showdate_movie[$showdate['movie_id']] = '';
        }

        foreach ($arr as $movie_id => $movie){
            if($movie['release'] <= $today){
                if (array_key_exists($movie_id, $showdate_movie)) {
                    $result['np'][$movie_id] = $movie;
                }
            }else{
                $result['cs'][$movie_id] = $movie;
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($result);
        Cache::save($cacheItem);
    } else {
        $result = $cacheItem->get();
    }

    return $result;
}

function formatCommentFunction($comment){
    $conv_comment = strtolower(trim($comment));
    if ($conv_comment == 'reserved'){
        return "Reserved Seating";
    }else{
        return $comment;
    }

}