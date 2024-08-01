<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/13/2018
 * Time: 12:11 PM
 */

use App\Core\Cache;

function mergeByParentIDFilter($movies){
    $new_movies = [];
    $cacheItem = Cache::getItem('getMergeByParentIDFilter_' . md5(serialize($movies)));
    if(!Cache::isHit($cacheItem)) {
        foreach ($movies as $id => $movie_data) {
            if ($movie_data['parent_id'] == 0) {
                array_push($new_movies, $movie_data);
            } elseif (array_key_exists($movie_data['parent_id'], $movies)) {
                // ignore the movie, we already have it
            } else {
                array_push($new_movies, $movie_data);
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($new_movies);
        Cache::save($cacheItem);
    }else{
        $new_movies = $cacheItem->get();
    }

    return $new_movies;
}

/**
 * @name groupByComment
 * @description Group time items by comment field.
 * @param {array} $times
 * @return array
 */
function groupByCommentFilter ($times){
    $results = [];
    $comments = [];

    $cacheItem = Cache::getItem('getGroupByCommentFilter_' . md5(serialize($times)));
    if(!Cache::isHit($cacheItem)) {
        foreach($times as $time){
            $comment = trim($time['details']['comment']) ? trim($time['details']['comment']) : '';
            if(!in_array($comment, $comments)){
                $comments[] = $comment;
            }
        }

        array_multisort(array_map('strlen', $comments), SORT_NUMERIC, SORT_ASC, $comments);

        foreach ($times as $time) {
            $results[trim($time['details']['comment'])][] = $time;
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}


function sortByReleaseDateFilter($movies){
    $results = [];
    $release = [];

    $cacheItem = Cache::getItem('getSortByReleaseDateFilter_' . md5(serialize($movies)));
    if(!Cache::isHit($cacheItem)) {
        foreach ($movies as $movie){
            $release[$movie['movie']['release']] = strtotime($movie['movie']['release']);
        }

        array_multisort($release, SORT_DESC, $release);

        foreach($release as $date => $val){
            foreach ($movies as $id => $movie){
                if($movie['movie']['release'] == $date){
                    $results[$id] = $movie;
                }
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}

function sortByReleaseDateRevFilter($movies){
    $results = [];
    $release = [];

    $cacheItem = Cache::getItem('getSortByReleaseDateRevFilter_' . md5(serialize($movies)));
    if(!Cache::isHit($cacheItem)) {
        foreach ($movies as $movie){
            $release[$movie['movie']['release']] = strtotime($movie['movie']['release']);
        }

        array_multisort($release, SORT_ASC, $release);

        foreach($release as $date => $val){
            foreach ($movies as $id => $movie){
                if($movie['movie']['release'] == $date){
                    $results[$id] = $movie;
                }
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}

function showtimesSortByTimeFilter($showtimes){
    $results = [];
    $times = [];

    $cacheItem = Cache::getItem('showtimesSortByTimeFilter_' . md5(serialize($showtimes)));
    if(!Cache::isHit($cacheItem)) {
        foreach($showtimes as $time_key => $time){
            $times[$time_key] = strtotime($time[0]['time']);
        }

        array_multisort($times, SORT_ASC, $times);

        foreach($times as $time){
            foreach($showtimes as $id => $val){
                if(strtotime($val[0]['time']) == $time){
                    $results[$id] = $val;
                }
            }
        }
        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}

/**
 * @name sortByAlphabetical
 * @description Sort houses by house name ASC
 * @param {array} $houses
 * @return array
 */
function sortByAlphabeticalFilter($houses){
    $results = [];
    $names = [];
    $names_arr = [];

    $cacheItem = Cache::getItem('getSortByAlphabeticalFilter_' . md5(serialize($houses)));
    if(!Cache::isHit($cacheItem)) {
        foreach($houses as $house){
            $names_arr[] = trim($house['name']);
            $names[trim($house['name'])] = $house;
        }
        array_multisort($names_arr, SORT_ASC, SORT_STRING);
        foreach($names_arr as $key => $name){
            $results[] = $names[$name];
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}




function colorDarker10Filter($color){
    return adjustColor($color, 10);
}

function colorDarker20Filter($color){
    return adjustColor($color, 20);
}

function colorDarker30Filter($color){
    return adjustColor($color, 30);
}

function colorDarker40Filter($color){
    return adjustColor($color, 40);
}

function colorDarker50Filter($color){
    return adjustColor($color, 50);
}

function colorDarker60Filter($color){
    return adjustColor($color, 60);
}

function colorDarker70Filter($color){
    return adjustColor($color, 70);
}

function colorDarker80Filter($color){
    return adjustColor($color, 80);
}

function colorDarker90Filter($color){
    return adjustColor($color, 90);
}



function adjustColor($color_code,$percentage_adjuster = 0) {
    $percentage_adjuster = round($percentage_adjuster/100,2);
    if(is_array($color_code)) {
        $r = $color_code["r"] - (round($color_code["r"])*$percentage_adjuster);
        $g = $color_code["g"] - (round($color_code["g"])*$percentage_adjuster);
        $b = $color_code["b"] - (round($color_code["b"])*$percentage_adjuster);

        return array("r"=> round(max(0,min(255,$r))),
                     "g"=> round(max(0,min(255,$g))),
                     "b"=> round(max(0,min(255,$b))));
    }
    else if(preg_match("/#/",$color_code)) {
        $hex = str_replace("#","",$color_code);
        $r = (strlen($hex) == 3)? hexdec(substr($hex,0,1).substr($hex,0,1)):hexdec(substr($hex,0,2));
        $g = (strlen($hex) == 3)? hexdec(substr($hex,1,1).substr($hex,1,1)):hexdec(substr($hex,2,2));
        $b = (strlen($hex) == 3)? hexdec(substr($hex,2,1).substr($hex,2,1)):hexdec(substr($hex,4,2));
        $r = round($r - ($r*$percentage_adjuster));
        $g = round($g - ($g*$percentage_adjuster));
        $b = round($b - ($b*$percentage_adjuster));

        return "#".str_pad(dechex( max(0,min(255,$r)) ),2,"0",STR_PAD_LEFT)
            .str_pad(dechex( max(0,min(255,$g)) ),2,"0",STR_PAD_LEFT)
            .str_pad(dechex( max(0,min(255,$b)) ),2,"0",STR_PAD_LEFT);

    }
}


function url_decodeFilter($url){
    return urldecode($url);
}



