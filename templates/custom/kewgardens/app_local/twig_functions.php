<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/13/2018
 * Time: 12:11 PM
 */

use App\Helpers\MetaHelper;
use App\Core\Cache;

/**
 * @name getHousePagesFunction
 * @description Get active house pages
 * @param {integer|string} $house_id
 * @param {array} $pages
 * @return array
 */
function getHousePagesFunction($house_id, $pages)
{
    $results = [];
    $cacheItem = Cache::getItem('getHousePages_' . $house_id);
    if (!Cache::isHit($cacheItem)) {
        foreach ($pages as $page_id => $page) {
            $house_ids = (!empty($page['house_ids'])) ? explode(';', $page['house_ids']) : [];
            if (!in_array($house_id, $house_ids)) {
                continue;
            }
            if ($page['nav_top'] != 0 || $page['nav_bottom'] != 0) {
                continue;
            }
            $page['data_id'] = MetaHelper::url_name($page['site_headline']);
            $results[$page_id] = $page;
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    } else {
        $results = $cacheItem->get();
    }

    return $results;
}

/**
 * @name getMovieByIdFunction
 * @param {string|integer} $movie_id
 * @param {array} $movies
 * @param {string|integer} $house_id
 * @return array
 */
//function getMovieByIdFunction($movie_id, $movies, $house_id)
//{
//    $results = [];
//    $cacheItem = Cache::getItem('getMovieById_' . $movie_id . '_' . $house_id);
//    if (!Cache::isHit($cacheItem)) {
//        $_movie = $movies[$movie_id];
//        $results[$movie_id]['movie'] = $_movie;
//        $results[$movie_id]['children'][] = $_movie['id'];
//
//        foreach ($movies as $movie) {
//            if ($movie['parent_id'] != $movie_id) {
//                continue;
//            }
//            if (isset($movie['playing_at']) || !empty($movie['playing_at'])) {
//                if (!in_array($house_id, $movie['playing_at'])) {
//                    continue;
//                }
//            }
//            if (!in_array($movie['id'], $results[$movie_id]['children'])) {
//                $results[$movie_id]['children'][] = $movie['id'];
//            }
//        }
//        $cacheItem->expiresAfter(Cache::TIME1HR);
//        $cacheItem->set($results);
//        Cache::save($cacheItem);
//    } else {
//        $results = $cacheItem->get();
//    }
//
//    return $results;
//}

/**
 * @name getNextAvailableShowdate
 * @param {string} $date
 * @param {string} $max_date
 * @param {array} $showdates
 * @return int|string
 */
function getNextAvailableShowdateFunction($date, $max_date = '', $showdates)
{
    $result = '';
    $cacheItem = Cache::getItem('getNextAvailableShowdate_' . md5(serialize($date)) . '_' . md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        if (!array_key_exists($date, $showdates)) {
            foreach ($showdates as $key => $value) {

                if ($key > $date) {
                    if (!empty($result) && $result > $key) {
                        $result = $key;
                    } elseif (empty($result)) {
                        $result = $key;
                    }
                }
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

/**
 * @name getShowtimesAvailableDatesFunction
 * @param {int} $house_id
 * @param {array} $showdates
 * @return array
 */
//function getShowtimesAvailableDatesFunction($house_id = 0, $showdates = [], $movies = [])
//{
//    $results = [];
//    $cacheItem = Cache::getItem('getNextAvailableShowdate_' . $house_id . '_' . md5(json_encode($showdates)));
//    if (!Cache::isHit($cacheItem)) {
//        if (empty($house_id) || empty($showdates) || empty($movies)) {
//            return $results;
//        }
//// MOVIEs LOST bellow
//        $_movies = collectMoviesDataByHouseFunction($house_id, $movies);
//        $groupedData = mergeMoviesWithShowDatesFunction($_movies, $showdates, $house_id, false);
//
//
//        foreach ($groupedData as $movie) {
//            foreach ($movie['showdates'] as $key => $showdate) {
//                if (!in_array($key, $results)) {
//                    $results[] = $key;
//                }
//            }
//        }
//        $cacheItem->expiresAfter(Cache::TIME1HR);
//        $cacheItem->set($results);
//        Cache::save($cacheItem);
//    } else {
//        $results = $cacheItem->get();
//    }
//
//    return $results;
//}

function getShowtimesAvailableDatesFunction($house_id = 0, $showdates = [], $movies = [])
{
    $results = [];
    $cacheItem = Cache::getItem('getShowtimesAvailableDates_' . $house_id . '_' . md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        if (empty($house_id) || empty($showdates) || empty($movies)) {
            return $results;
        }

        $_movies = [];
        $newShowDates = array();
        foreach ($showdates as $showdate) {
            if ($house_id == $showdate['house_id']) {
                $newShowDates[$showdate['movie_id']][] = $showdate;
            }
        }

        foreach ($movies as $movie) {
            $item = [];
            $item_id = null;
            $item['movie'] = null;
            $item['showdates'] = [];

            if($movie['parent_id'] && $movie['orphan'] == 0){
                $item_id = $movie['parent_id'];
                $item['movie'] = (isset($movies[$item_id])) ? $movies[$item_id] : $movie;
            }else{
                $item_id = $movie['id'];
                if (!in_array($movie['id'], $results)) {
                    $item['movie'] = $movie;
                }
            }
            if(isset($newShowDates[$item_id])){
                $showdate_data = $newShowDates[$item_id];
                foreach($showdate_data as $data){
                    $item['showdates'][$data['date']][$data['details']['format']['value']][] = $data;
                    if (!in_array($data['date'], $results)) {
                        $results[] = $data['date'];
                    }
                }
            }

            $_movies[$item_id] = $item;
        }
        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    } else {
        $results = $cacheItem->get();
    }

    return $results;
}

function mergeSlidesFunction($arr1 = [], $arr2 = [])
{
    $cacheItem = Cache::getItem('mergeSlides_' . md5(serialize($arr1)) . '_' . md5(serialize($arr2)));
    if (!Cache::isHit($cacheItem)) {
        $arr1 = array_values($arr1);
        $arr2 = array_values($arr2);
        $myArray = array_merge($arr1, $arr2);

        usort($myArray, function($a, $b) {
            return $a['sort'] <=> $b['sort'];
        });
        $cacheItem->expiresAfter(Cache::TIME2HRS);
        $cacheItem->set($myArray);
        Cache::save($cacheItem);
    } else {
        $myArray = $cacheItem->get();
    }

    return $myArray;
}

/**
 * @name npcs_MoviesDataFunction
 * @description Home & Movies page
 * @param {integer} $active_house_id
 * @param {array} $movies
 * @param {array} $showdates
 * @return array|mixed
 */
function npcs_MoviesDataFunction($active_house_id, $movies, $showdates){
    $cacheItem = Cache::getItem('npcs_MoviesDataFunction_' . $active_house_id.'_'.md5(serialize($movies)).'_'.md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        $results = ['np' => [], 'cs' => [], 'adv' => [], 'filters'=>[] ];
        $today = date('Y-m-d');
        $temp_movies = showdatesPageMoviesDataFunction($active_house_id,$movies, $showdates);

        foreach ($temp_movies as $item_id => $item) {

            if (isset($item['movie']) ){

                if(isset($item['movie']['playing_at'][$active_house_id]['release_date'])){
                    if ($item['movie']['playing_at'][$active_house_id]['release_date'] <= $today) {
                        if( !empty($item['showdates']) ){
                            $results['np'][$item_id] = $item;
                        }
                    }else{
                        $results['cs'][$item_id] = $item;
                        if(!empty($item['showdates'])){
                            $results['adv'][$item_id] = $item;
                        }
                    }
                    continue;
                } elseif ($item['movie']['release'] <= $today) {
                    if( !empty($item['showdates']) ){
                        $results['np'][$item_id] = $item;
                    }
                } else {
                    if( !isset($item['movie']['playing_at']) ){
                        $results['cs'][$item_id] = $item;
                        if(!empty($item['showdates'])){
                            $results['adv'][$item_id] = $item;
                        }
                        continue;
                    }
                    if( isset($item['movie']['playing_at'][$active_house_id])){
                        $results['cs'][$item_id] = $item;
                        if(!empty($item['showdates'])){
                            $results['adv'][$item_id] = $item;
                        }
                    }
                }
                if(isset($item['movie']['categories'])){
                    foreach ($item['movie']['categories'] as $cat_id => $cat){
                        if (strpos($cat['cat_name'], "filter") === 0) {
                            $temp_res_name = 'filter_'.$cat_id;

                            if(!isset($results['filters'][$temp_res_name])){
                                $results['filters'][$temp_res_name] = array(
                                    'filter_id' => $temp_res_name,
                                    'filter_name' => str_replace(array( 'filter[', ']' ), '',  $cat['cat_name']) ,
                                    'items' => []
                                );
                            }

                            $results['filters'][$temp_res_name]['items'][$item_id]=$item;
                        }
                    }

                }

            }
        }
/*
 *      /// Alternative solution
        foreach ($movies as $movie_id => $movie){

            if ($movie['release'] <= $today) {
                $results['np'][$movie_id] = $movie;
            }else{
                if (isset($movie['playing_at']) || !empty($movie['playing_at'])) {
                    if (!in_array($active_house_id, $movie['playing_at'])) {
                        continue;
                    }
                }

                $temp_mmm = null;
                $temp_mmm = showdatesPageMoviesDataFunction($active_house_id,[$movie], $showdates);

                if (!empty($temp_mmm)){
                    $results['cs'] = array_merge($results['cs'], $temp_mmm);
                }else{
                    $results['cs'][$movie_id]['movie'] = $movie;
                    $results['cs'][$movie_id]['showdates'] = [];
                }
            }
        }

        $results['np'] = showdatesPageMoviesDataFunction($active_house_id,$results['np'], $showdates);
*/

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}

/**
 * @name showdatesPageMoviesDataFunction
 * @description Show Dates page
 * @param {integer} $active_house_id
 * @param {array} $movies
 * @param {array} $showdates
 * @return array|mixed
 */
function showdatesPageMoviesDataFunction($active_house_id, $movies, $showdates){
    $cacheItem = Cache::getItem('ShowdatesPageMoviesDataFunction_' . $active_house_id.'_'.md5(serialize($movies)).'_'.md5(serialize($showdates)));
    if (!Cache::isHit($cacheItem)) {
        $results = [];
        $newShowDates = array();
        foreach ($showdates as $showdate) {
            if ($active_house_id == $showdate['house_id']) {
                if($showdate['details']['allowpass'] == "N"){
                    $showdate['details']['comment'] = "No Passes; ". $showdate['details']['comment'];
                }
                $newShowDates[$showdate['movie_id']][] = $showdate;
            }
        }

        foreach ($movies as $movie) {
            $item = [];
            $main_id = null;
            $item['movie'] = null;
            $item['showdates'] = [];

            if($movie['parent_id'] && $movie['orphan'] == 0){
                $item['movie'] = (isset($movies[$movie['parent_id']])) ? $movies[$movie['parent_id']] : $movie;
            }else{
                if (!in_array($movie['id'], $results)) {
                    $item['movie'] = $movie;
                }
            }

            if(isset($newShowDates[$movie['id']])) {
                $results = add_showtimes_to_results($results, $item, $newShowDates[$movie['id']], $active_house_id);
            }else{
                $results = add_showtimes_to_results($results, $item, [], $active_house_id);
            }
        }

        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }

    return $results;
}

/**
 * @name showdatesPageMoviesDataDriveInFunction
 * @description Show Dates page
 * @param {array} $movies
 * @return array|mixed
 */
function showdatesPageMoviesDataDriveInFunction($movies){
    $results = [];
    $cacheItem = Cache::getItem('showdatesPageMoviesDataDriveInFunction_'.md5(serialize($movies)));
    if (!Cache::isHit($cacheItem)) {
        foreach ($movies as $movie) {
            $mm_id = $movie['movie']['id'];
            if($movie['movie']['parent_id'] && $movie['movie']['orphan'] == 0){
                $mm_id = $movie['movie']['parent_id'];
            }

            $results['movies'][$mm_id] =  $movie['movie'];
            $results['data']=[];

            $showdates = $movie['showdates'];
            foreach ($showdates as $date_key => $dates) {
                foreach ($dates as $format_key => $format) {
                    foreach ($format as $item) {
                        if ($item['details']['screen_id'] == 0) {
                            $results['data'][$mm_id]['showdates'][$date_key][$format_key][] = $item;
                        }else{
                            $results['data'][$date_key][$item['details']['screen_id']]['movies'][$mm_id] = $movie['movie']['name'];
                            $results['data'][$date_key][$item['details']['screen_id']]['showdates'][$format_key][$mm_id][] = $item;

                        }
                    }
                }
            }
        }
        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }
    return $results;
}


function add_showtimes_to_results($results = [], $item, $showdate_data, $active_house_id){
    $main_id = $item['movie']['id'];

    //CinemaWest hardcode
    $CW_houses = array(1220,1221,1239,1629,2113,2354,7482,7609,9628,10362,22405,31350,36413,43199,45070,46684,49047);
    //CW hardcode END

    if(empty($results)){
        $results[$main_id]['movie'] = $item['movie'];
        $results[$main_id]['showdates'] = [];
        foreach($showdate_data as $data) {

            //CinemaWest hardcode
            if( in_array($active_house_id, $CW_houses)  ) {
                $data['details']['comment'] = CinemaWest_Amenities($active_house_id, $data['details']['comment'], $data['details']['allowpass']);
            }
            //CW hardcode END

            $results[$main_id]['showdates'][$data['date']][$data['details']['format']['value']][] = $data;
        }
    }else{
        if (!in_array($main_id, array_keys($results) )){
            $results[$main_id]['movie'] = $item['movie'];
            $results[$main_id]['showdates'] = [];
        }
        foreach ($results as $key => $result){
            if($key == $main_id ){
                foreach($showdate_data as $data) {

                    //CinemaWest hardcode
                    if( in_array($active_house_id, $CW_houses)  ) {
                        $data['details']['comment'] = CinemaWest_Amenities($active_house_id, $data['details']['comment'], $data['details']['allowpass']);
                    }
                    //CW hardcode END

                    $results[$main_id]['showdates'][$data['date']][$data['details']['format']['value']][] = $data;
                }
            }
        }
    }
    return $results;
}


/**
 * @name moviePageMoviesDataFunction
 * @description Movie page
 * @param {integer} $house_id
 * @param {integer} $movie_id
 * @param {array} $movies
 * @param {array} $showdates
 * @return array|mixed
 */
function moviePageMoviesDataFunction($house_id, $movie_id, $movies, $showdates){
    $cacheItem = Cache::getItem('MoviePageMoviesDataFunction_' . $house_id .'_'.$movie_id);
    if (!Cache::isHit($cacheItem)) {
        $results = [];
        $results[$movie_id]['movie'] = $movies[$movie_id];
        $results[$movie_id]['showdates'] = [];
        $available_dates = array();
        foreach ($showdates as $key => $showdate) {
            if (
                $house_id == $showdate['house_id'] &&
                (
                    $showdate['movie_id'] == $movie_id ||
                    (
                        $showdate['parent_id'] == $movie_id  &&
                        $movies[$showdate['movie_id']]['orphan'] == 0
                    )
                )
            ) {
                if($showdate['details']['allowpass'] == "N"){
                    $showdate['details']['comment'] = "No Passes; ". $showdate['details']['comment'];
                }

                $results[$movie_id]['showdates'][$showdate['date']][$showdate['details']['format']['value']][] = $showdate;
                if (!in_array($showdate['date'], $available_dates)) {
                    $available_dates[] = $showdate['date'];
                }
            }
        }


        //CinemaWest hardcode
        $CW_houses = array(1220,1221,1239,1629,2113,2354,7482,7609,9628,10362,22405,31350,36413,43199,45070,46684,49047);
        if( in_array($house_id, $CW_houses)  ) {
            foreach ($results as $results_key => $result) {
                foreach ($result['showdates'] as $showdate_key => $showdate) {
                    foreach ($showdate as $format => $showdate_data) {
                        foreach ($showdate_data as $showdate_data_key => $row) {
                            $comment = CinemaWest_Amenities($house_id, $row['details']['comment'], $row['details']['allowpass']);
                            $results[$results_key]['showdates'][$showdate_key][$format][$showdate_data_key]['details']['comment'] = $comment;
                        }
                    }
                }
            }
        }
        //CW hardcode END

        $results_data = ['movie' => $results, 'available_dates' => $available_dates];

        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($results_data);
        Cache::save($cacheItem);
    }else{
        $results_data = $cacheItem->get();
    }

    return $results_data;
}

function getHouseIDFromMiddlewareFunction($houses, $mid){
    foreach ($houses as $house){
        if($house['middleware_id'] == $mid){
            $result = $house['house_id'];
        }
    }
    return $result;
}

//CinemaWest hardcode
function CinemaWest_Amenities($house_id = 0, $comment = '', $allowpass = '')
{
    $amenities = '{
  "1220": { 
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/ffc77b88c6d598933bb31fdbb43b0fe0.png",
    "REALD 3D": "//cms-assets.webediamovies.pro/production/147/c813cf5b4b697e4e37fd7ee133509071.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/b2b3cc71c72071a711bb0169269640d0.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/3c38ece30b0085d767c5f2dec17fd64a.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/ffc77b88c6d598933bb31fdbb43b0fe0.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/ffc77b88c6d598933bb31fdbb43b0fe0.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/3c38ece30b0085d767c5f2dec17fd64a.png",
    "RESERVED SEATING":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "1221": {
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/79126fabd72755ae58752ebd7b66287d.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/5bc24e28516c77eb9af52f543e5213ee.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/79126fabd72755ae58752ebd7b66287d.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/79126fabd72755ae58752ebd7b66287d.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/5bc24e28516c77eb9af52f543e5213ee.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "1239": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/046a024d188d5e6f16c292232cfad3fc.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "THREE D": "//cms-assets.webediamovies.pro/production/147/7d96170421fa89491624f59c834429ac.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/0f9923437405a0de9cbb6571ba925c01.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/38b4d9a126eaeb5c334d69e5fee4b65d.png",
    "LUXURY RECLINER SEATS": "//cms-assets.webediamovies.pro/production/147/389a73aede9d35262a0789cc84c52b9e.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/9e5278f3176fb955e0e30f846a9c882d.png",
    
    "LUXURY ELECTRIC RECLINERS":"//cms-assets.webediamovies.pro/production/147/389a73aede9d35262a0789cc84c52b9e.png",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "RESERVED SEATING":"",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/9e5278f3176fb955e0e30f846a9c882d.png",
    "DBOX":"//cms-assets.webediamovies.pro/production/147/046a024d188d5e6f16c292232cfad3fc.png",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/0f9923437405a0de9cbb6571ba925c01.png",
    "GRAND SCREEN":"//cms-assets.webediamovies.pro/production/147/38b4d9a126eaeb5c334d69e5fee4b65d.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "1629": {
    "LUXURY ELECTRIC RECLINERS":"//cms-assets.webediamovies.pro/production/147/389a73aede9d35262a0789cc84c52b9e.png",
    "Closed Captions": "//cms-assets.webediamovies.pro/production/2/0c910a6e53a2486e6b3d2d4dbcba2b0c.png",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "CC": "//cms-assets.webediamovies.pro/production/2/94270e5046f328c61765c9ba569603e8.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/0f9923437405a0de9cbb6571ba925c01.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/38b4d9a126eaeb5c334d69e5fee4b65d.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/9e5278f3176fb955e0e30f846a9c882d.png",
    "NO PASSES": "//cms-assets.webediamovies.pro/production/147/9e5278f3176fb955e0e30f846a9c882d.png",
    "Grand Auditorium": "//cms-assets.webediamovies.pro/production/147/edd4adbf93f6a483c7324b1bebcb3661.png",
    "DOLBY 7.1":"//cms-assets.webediamovies.pro/production/147/f6d0b55274b6274f90f390c20cdc2958.PNG",
    "Dolby Surround 7.1":"//cms-assets.webediamovies.pro/production/147/f6d0b55274b6274f90f390c20cdc2958.PNG",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },  
  "2113": {
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/115f20a923b088351405bfff38769527.png",
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/03f3cb784b6981c0b270c15f8ebb2c12.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/1a2899636f4c94f02086abe8ee2ca216.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/115f20a923b088351405bfff38769527.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/115f20a923b088351405bfff38769527.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/1a2899636f4c94f02086abe8ee2ca216.png",
    "RLD3D":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "2354": {
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/7a0270a6c258e9fc170c5430edd0ee3f.png",
    "REALD 3D": "//cms-assets.webediamovies.pro/production/147/89cc882ee91fe4af0c7c4a9f7c38b8e2.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/71db321a7b6e4497babb10f9a49efc55.png",
    "WHEELCHAIR ACCESSIBLE": "//cms-assets.webediamovies.pro/production/147/a8dba9ab6c7bd330766f06810e5fd6e4.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/4867368a30b4e24bd982c37f69e49724.png",
    
    "STADIUM SEATING":"",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/4867368a30b4e24bd982c37f69e49724.png",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/7a0270a6c258e9fc170c5430edd0ee3f.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/7a0270a6c258e9fc170c5430edd0ee3f.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "7482": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/997e61082187fbe168b6114d17f979e6.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/859ba1ec35ef9f805e1e5975335bcb66.png",
    "DOLBY 3D": "//cms-assets.webediamovies.pro/production/147/f76465f7386b208fc239771b0e66db43.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/1831d732b9faf1524b5e95171dc4a9c7.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/50124e1cf02a215caf96888154b448fd.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/385b6b7c69ddae964bbd491200fb42a9.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/859ba1ec35ef9f805e1e5975335bcb66.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/859ba1ec35ef9f805e1e5975335bcb66.png",
    "STADIUM SEATING":"",
    "RESERVED SEATING":"",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/1831d732b9faf1524b5e95171dc4a9c7.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/385b6b7c69ddae964bbd491200fb42a9.png",
    "OC-OPEN CAPTION":"",
    "OC":"",
    "OPEN CAPTION":"Open Caption",
    "DBOX":"//cms-assets.webediamovies.pro/production/147/997e61082187fbe168b6114d17f979e6.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "7609": {
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/06a926d05767e89e98fbb8519e7806d4.png",
    "Open Caption": null,
    "Wheelchair Accessible": "//cms-assets.webediamovies.pro/production/147/1d6a617d2a3286e9b2fa41627e5c0b58.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/7d47a8937a74bfcc902769b15f25efaa.png",
    "Audio Description & Closed Captions": "//cms-assets.webediamovies.pro/production/2/f29e41bb6346235285ecd971aedd7b01.png",
    
    "OPEN CAPTION": null,
    "AUDIO DESCRIPTION & CLOSED CAPTIONS": "//cms-assets.webediamovies.pro/production/2/f29e41bb6346235285ecd971aedd7b01.png",
    "AUDIO DESCRIPTION" : "//cms-assets.webediamovies.pro/production/2/f29e41bb6346235285ecd971aedd7b01.png",
    "CC": "//cms-assets.webediamovies.pro/production/2/f29e41bb6346235285ecd971aedd7b01.png",
    "CC-CLOSED CAPTION": "",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/7d47a8937a74bfcc902769b15f25efaa.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "9628": {
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/433d299a0bd1fc467619aad46fe0a176.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/03f2ee45f94fed7a060fd9847463ad36.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/38136aacaa9116fb81c7ded8fe73de97.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/4d2f0e590d2ff3988a5b538037146219.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/6603c56a1d213d356b69ca07df502aa8.png",
    "Closed Captions & Audio Description": "//cms-assets.webediamovies.pro/production/2/0c910a6e53a2486e6b3d2d4dbcba2b0c.png",
    
    "RESERVED SEATING": "",
    "AUDIO DESCRIPTION": "//cms-assets.webediamovies.pro/production/2/0c910a6e53a2486e6b3d2d4dbcba2b0c.png",
    "CC": "//cms-assets.webediamovies.pro/production/2/0c910a6e53a2486e6b3d2d4dbcba2b0c.png",
    "STADI":"",
    "ST":"",
    "CC-CLOSED CAPTION":"",
    "STADIUM SEATING": "",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/6603c56a1d213d356b69ca07df502aa8.png",
    "REALD 3D": "//cms-assets.webediamovies.pro/production/147/433d299a0bd1fc467619aad46fe0a176.png",
    "GS": "//cms-assets.webediamovies.pro/production/147/38136aacaa9116fb81c7ded8fe73de97.png",
    "AT": "//cms-assets.webediamovies.pro/production/147/03f2ee45f94fed7a060fd9847463ad36.png" ,
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "10362": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/672faf7dd0c3353a8554f8df4ccdacd9.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/02e2ea54d058b28b1c493263a1fc0ce5.png",
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/895edf16eff0ff939b3c50e48d0fd8bb.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/7b463735fd35d46516344915cb7e138e.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/904f55a9d89433c79f59c177e4449d2f.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/2b42e2d050076ab2aa852649700f8672.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/b378001448cc0ad4f2273a62f0f16084.png",
    
    "RESERVED SEATING":"",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/02e2ea54d058b28b1c493263a1fc0ce5.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/02e2ea54d058b28b1c493263a1fc0ce5.png",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/7b463735fd35d46516344915cb7e138e.png",
    "DBOX":"//cms-assets.webediamovies.pro/production/147/672faf7dd0c3353a8554f8df4ccdacd9.png",
    "STADIUM SEATING":"",
    "RLD3D":"//cms-assets.webediamovies.pro/production/147/895edf16eff0ff939b3c50e48d0fd8bb.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/b378001448cc0ad4f2273a62f0f16084.png",
    "GS":"//cms-assets.webediamovies.pro/production/147/904f55a9d89433c79f59c177e4449d2f.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "22405": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/823b8a2fefa8f7a5a33144e420f025a3.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/a6752d2ad98b06606750b2034b3ddbbb.png",
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/2ddffde19ef0b92b679999ca0e8c92dc.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/7d074b03fad6b297599b769846852f85.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/efb0180641a193d4ca1596c474e729eb.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/86c463befea0ed69fe1ca1a8943c5f93.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/415e8d64fc02fb52127bd58eea28044f.png",
    
    "RESERVED SEATING":"",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/a6752d2ad98b06606750b2034b3ddbbb.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/a6752d2ad98b06606750b2034b3ddbbb.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/415e8d64fc02fb52127bd58eea28044f.png",
    "ATMOS": "//cms-assets.webediamovies.pro/production/147/7d074b03fad6b297599b769846852f85.png",
    "AT": "",
    "AT GS": "",
    "GS":"",
    "DBOX":"//cms-assets.webediamovies.pro/production/147/823b8a2fefa8f7a5a33144e420f025a3.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "31350": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/555f805224467ae3903e085fef9eba1d.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/b218745a6d7a9979c30543747a83c7e7.png",
    "realD 3D": "//cms-assets.webediamovies.pro/production/147/6e68d696aac627729016d3450e6ba3c4.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/829f83aadc279f87e40c9485d08da47f.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/38d3d6e1693fcc39801f4099dc6ee744.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/0465b8d457edb89ee810e7e3f555b191.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/73a8c908a52779e94c57f41e337759b0.png",
    
    "CC-CLOSED CAPTION": "",
    "CC":"//cms-assets.webediamovies.pro/production/2/b218745a6d7a9979c30543747a83c7e7.png",
    "AUDIO DESCRIPTION": "//cms-assets.webediamovies.pro/production/2/b218745a6d7a9979c30543747a83c7e7.png",
    "ATMOS": "//cms-assets.webediamovies.pro/production/147/829f83aadc279f87e40c9485d08da47f.png",
    "RESERVED SEATING": "",
    "OC-OPEN CAPTION":"",
    "AT": "",
    "DBOX": "//cms-assets.webediamovies.pro/production/147/555f805224467ae3903e085fef9eba1d.png",
    "GS":"",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/73a8c908a52779e94c57f41e337759b0.png",
    "RESERVED SEAT":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "36413": {
    "D-Box": "//cms-assets.webediamovies.pro/production/147/ad69f2042dd7d210fe21991b803dcbcc.png",
    "VIP21": "//cms-assets.webediamovies.pro/production/147/405e616969ebcc339b3b93e6d66d1cec.png",
    "DINE-IN": "//cms-assets.webediamovies.pro/production/147/01b458370d28884adb8e34abfdbe85b7.png",
    "RealD 3D": "//cms-assets.webediamovies.pro/production/147/c8ed7ce96832d3f5d105274f5862e91d.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/ec1c83994830af4ed084ff6830a247b5.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/f1fb2f981120ef62c6d8ef924eda0c47.png",
    "ELECTRIC LUXURY RECLINERS": "//cms-assets.webediamovies.pro/production/147/a27bd7049db4a5a6979ddfaf416f9f15.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/99a075d450bfd8d0b70d83c9c308f177.png",
    "Audio Description & Closed Captions": "//cms-assets.webediamovies.pro/production/2/e9c8c812c8953b7f4d28ff724d5f0619.png",
    
    "LUXURY ELECTRIC RECLINERS":"//cms-assets.webediamovies.pro/production/147/a27bd7049db4a5a6979ddfaf416f9f15.png",
    "RESERVED SEATING":"",
    "AUDIO DESCRIPTION": "//cms-assets.webediamovies.pro/production/2/b218745a6d7a9979c30543747a83c7e7.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/e9c8c812c8953b7f4d28ff724d5f0619.png",
    "CC-CLOSED CAPTIONING":"",
    "CLOSED CAPTION":"",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/ec1c83994830af4ed084ff6830a247b5.png",
    "DBOX":"//cms-assets.webediamovies.pro/production/147/ad69f2042dd7d210fe21991b803dcbcc.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/99a075d450bfd8d0b70d83c9c308f177.png",
    "VIP":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "43199": {
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/9c3e20ab1614424337fd37afe2232fe9.png",
    "21+ ONLY": "//cms-assets.webediamovies.pro/production/147/20e2b04e3c897f914a18e6c4612fda51.png",
    "Dine-In Service": "//cms-assets.webediamovies.pro/production/147/83b687e933841e149d18d73092362c15.png",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/3f70c7b618c031f82fc8eb0fab62a07d.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/f3eae4bd2ffbf594699a0f796254c880.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/9c3e20ab1614424337fd37afe2232fe9.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/9c3e20ab1614424337fd37afe2232fe9.png",
    "RESERVED SEATING":"",
    "ADULTS ONLY":"//cms-assets.webediamovies.pro/production/147/20e2b04e3c897f914a18e6c4612fda51.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/f3eae4bd2ffbf594699a0f796254c880.png",
    "+21":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "45070": {
    "3D": "//cms-assets.webediamovies.pro/production/147/4015411fc4a72ca2134e2ba5ca740e38.png",
    "CC & AD": "//cms-assets.webediamovies.pro/production/2/e46595ef7d66b9ac135885c2d564798f.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/317ffd84c096c5cd8d4f2bb713208690.png",
    "Grand Auditorium": "//cms-assets.webediamovies.pro/production/147/6575baeba7f3d57247aede4d2b11566c.png",
    "Dolby Surround 7.1": "//cms-assets.webediamovies.pro/production/147/e8c7468774e2b456a1b22408f6e8e66c.PNG",
    "LUXURY ELECTRIC RECLINERS": "//cms-assets.webediamovies.pro/production/147/bf9617a61654fa3a9c4be11732400aa4.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/67b30f9f71e3cc332fc0e30d9996564a.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/e46595ef7d66b9ac135885c2d564798f.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/e46595ef7d66b9ac135885c2d564798f.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/67b30f9f71e3cc332fc0e30d9996564a.png",
    "DOLBY 7.1":"//cms-assets.webediamovies.pro/production/147/e8c7468774e2b456a1b22408f6e8e66c.PNG",
    "DF":"",
    "RESERVED SEATING":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "46684": {
    "IMAX": "//cms-assets.webediamovies.pro/production/2/93d5b9f5dde482860380013e7fb3b588.png",
    "Three D": "//cms-assets.webediamovies.pro/production/147/12053dab251854b9b09ca250f239f936.png",
    "DOLBY ATMOST": "//cms-assets.webediamovies.pro/production/147/065069dc2002ac8a77a03991bfdfeb37.png",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/065069dc2002ac8a77a03991bfdfeb37.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/3d8096a2dde9192e402904ca3832ab1d.png",
    "DINE-IN SERVICE": "//cms-assets.webediamovies.pro/production/147/ccda351de114ab16a19c3e80bb5b089d.png",
    "LUXURY ELECTRIC RECLINER": "//cms-assets.webediamovies.pro/production/147/05ee23397f92e687763be720148f5db3.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/e0380bb2c5799362af49532c8715f5f2.png",
    "Audio Description & Closed Captions": "//cms-assets.webediamovies.pro/production/2/6ec526256fdf9b4f4ec2199a96c2cc4f.png",
    
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/2/6ec526256fdf9b4f4ec2199a96c2cc4f.png",
    "CC":"//cms-assets.webediamovies.pro/production/2/6ec526256fdf9b4f4ec2199a96c2cc4f.png",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/065069dc2002ac8a77a03991bfdfeb37.png",
    "RESERVED SEATING":"",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/e0380bb2c5799362af49532c8715f5f2.png",
    "LUXURY ELECTRIC RECLINERS":"//cms-assets.webediamovies.pro/production/147/05ee23397f92e687763be720148f5db3.png",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  },
  "49047": {
    "REALD 3D": "//cms-assets.webediamovies.pro/production/147/5a1d8e3b0700f5d5bafa68e3ce3d5ea4.png",
    "DOLBY 7.1": "//cms-assets.webediamovies.pro/production/147/9ea7247c244a02b4e014d378c88368b1.PNG",
    "DOLBY ATMOS": "//cms-assets.webediamovies.pro/production/147/4d6c381591938c9ab936a1f9f9872122.png",
    "GIANT SCREEN": "//cms-assets.webediamovies.pro/production/147/cdba432f1fff7e44ceffc53601010dec.png",
    "Combined CC/AD amenity": "//cms-assets.webediamovies.pro/production/147/621c47942d3de569c24fc69514e4d7d1.png",
    "LUXURY ELECTRIC RECLINER": "//cms-assets.webediamovies.pro/production/147/b5cb74af4e290eb4af0a36b3f6fdb91b.png",
    "NO PASSES ALLOWED FOR THIS FEATURE": "//cms-assets.webediamovies.pro/production/147/06d74e676325adfba6c3760f9ff99b72.png",
    
    "LUXURY ELECTRIC RECLINERS":"//cms-assets.webediamovies.pro/production/147/b5cb74af4e290eb4af0a36b3f6fdb91b.png",
    "DOLBY SURROUND 7.1":"//cms-assets.webediamovies.pro/production/147/9ea7247c244a02b4e014d378c88368b1.PNG",
    "AUDIO DESCRIPTION":"//cms-assets.webediamovies.pro/production/147/621c47942d3de569c24fc69514e4d7d1.png",
    "CC":"//cms-assets.webediamovies.pro/production/147/621c47942d3de569c24fc69514e4d7d1.png",
    "RESERVED SEATING":"",
    "ATMOS":"//cms-assets.webediamovies.pro/production/147/4d6c381591938c9ab936a1f9f9872122.png",
    "AT GS":"//cms-assets.webediamovies.pro/production/147/cdba432f1fff7e44ceffc53601010dec.png",
    "NO PASSES":"//cms-assets.webediamovies.pro/production/147/06d74e676325adfba6c3760f9ff99b72.png",
    "SURROUND":"",
    "Dubbed in English":"Dubbed in English",
    "Subtitled in English":"Subtitled in English"
  }
}';

    $new_comment = '';
    $amenities = json_decode($amenities, true);
    foreach ($amenities as $house => $amenities_list) {
        $amenities[$house] = array_change_key_case($amenities_list, CASE_UPPER);
    }

    if ($comment != "") {
        $added_icons = array(); // To check for duplicates a little later

        $comment = explode(';', $comment);

        if (stripos('N', $allowpass) !== false) {
            array_push($comment, 'NO PASSES');
        }

        foreach ($comment as $part_comment) {
            $part_comment = strtoupper(trim($part_comment));
            if (isset($amenities[$house_id][$part_comment])) {
                // Can't use ;   (semicolon)
                if($amenities[$house_id][$part_comment] != "" && !in_array($amenities[$house_id][$part_comment], $added_icons)){
                    $added_icons[] = $amenities[$house_id][$part_comment];
                    if (substr($amenities[$house_id][$part_comment], 0, 1) == '/' || substr($amenities[$house_id][$part_comment], 0, 4) == 'http' ) {
                        $new_comment .= '<img src="'.$amenities[$house_id][$part_comment].'" title="'.$part_comment.'" alt="'.$part_comment.'" class="comments_icons" />';
                    } else {
                        $new_comment .= '<span class="comments_icons" >' . $amenities[$house_id][$part_comment] . '</span>';
                    }
                }
            }else{
                // $new_comment .= '['.$part_comment.']';
                // var_dump($house_id,$part_comment);
            }
        }
    }

    return $new_comment;
}
//CinemaWest hardcode END