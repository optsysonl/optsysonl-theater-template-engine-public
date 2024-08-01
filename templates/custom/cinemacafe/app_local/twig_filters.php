<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 5/30/2018
 * Time: 7:54 PM
 */

use App\Core\Cache;

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function NowPlayingComingSoonFilter($arr)
{

    $cacheItem = Cache::getItem('NowPlayingComingSoon_' .md5(json_encode($arr)) );
    if (!Cache::isHit($cacheItem)) {

        $today = date('Y-m-d');
        $result['np'] = array();
        $result['cs'] = array();

        foreach ($arr as $movie_id => $movie){
            if($movie['release'] <= $today){
                $result['np'][$movie_id] = $movie;
            }else{
                $result['cs'][$movie_id] = $movie;
            }
        }

        $cacheItem->expiresAfter(Cache::TIME2HRS);
        $cacheItem->set($result);
        Cache::save($cacheItem);
    } else {
        $result = $cacheItem->get();
    }

    return $result;
}


function sortByStateFilter($houses){

    $houses_state = [];
    $houses_new   = [];

    foreach ($houses as $h) {
        if (isset($state) && $state != $h["state_short"]) {
            $this_state = ['state' => $state, 'houses' => $houses_state];
            array_push($houses_new, $this_state);
            $houses_state = [];
        }

        $state = $h["state_full"];
        $house_new = [];

        //setup variables
        $house_new['house_id'] = $h['house_id'];
        $house_new['name']     = $h['name'];
        $house_new['url']      = $h['url'];
        $house_new['city']     = $h['city'];
        $house_new['state']    = $state;
        array_push($houses_state, $house_new);
    }
    $this_state = ['state' => $state, 'houses' => $houses_state];
    array_push($houses_new, $this_state);

    return $houses_new;
}