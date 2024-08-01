<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/13/2018
 * Time: 12:11 PM
 */

use App\Helpers\MetaHelper;
use App\Core\Cache;
use App\Helpers\DateHelper;

use Symfony\Component\HttpClient\HttpClient;

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

        $cacheItem->expiresAfter(Cache::TIME2HRS);
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
        $cacheItem->expiresAfter(Cache::TIME2HRS);
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
        $cacheItem->expiresAfter(Cache::TIME2HRS);
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
        $today = DateHelper::today_with_0_time();
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

        $cacheItem->expiresAfter(Cache::TIME2HRS);
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
        $use_boapp_attrs = config('fxp.template_options.boapp_attrs', 0);
        foreach ($showdates as $showdate) {
            if ($active_house_id == $showdate['house_id']) {
                if( !$use_boapp_attrs && $showdate['details']['allowpass'] == "N"){
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

        $cacheItem->expiresAfter(Cache::TIME20MIN);
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
        $results['data']=[];
        $results['movies'] = [];
        foreach ($movies as $movie) {
            $mm_id = $movie['movie']['id'];
            if($movie['movie']['parent_id'] && $movie['movie']['orphan'] == 0){
                $mm_id = $movie['movie']['parent_id'];
            }

            $results['movies'][$mm_id] =  $movie['movie'];

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
        $cacheItem->expiresAfter(Cache::TIME20MIN);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    }else{
        $results = $cacheItem->get();
    }
    return $results;
}


function add_showtimes_to_results($results = [], $item, $showdate_data, $active_house_id){
    $main_id = $item['movie']['id'];

    $use_boapp_attrs = config('fxp.template_options.boapp_attrs', 0);
    if(empty($results)){
        $results[$main_id]['movie'] = $item['movie'];
        $results[$main_id]['showdates'] = [];
        foreach($showdate_data as $data) {

            //CinemaWest hardcode
            if( $use_boapp_attrs ) {
                $data['details']['comment'] = AppDot_Amenities($active_house_id, $data['details']['comment'], $data['details']['allowpass']);
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
                    if( false  ) {
                        $data['details']['comment'] = AppDot_Amenities($active_house_id, $data['details']['comment'], $data['details']['allowpass']);
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
        $use_boapp_attrs = config('fxp.template_options.boapp_attrs', 0);
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

        if( $use_boapp_attrs ) {
            foreach ($results as $results_key => $result) {
                foreach ($result['showdates'] as $showdate_key => $showdate) {
                    foreach ($showdate as $format => $showdate_data) {
                        foreach ($showdate_data as $showdate_data_key => $row) {
                            $comment = AppDot_Amenities($house_id, $row['details']['comment'], $row['details']['allowpass']);
                            $results[$results_key]['showdates'][$showdate_key][$format][$showdate_data_key]['details']['comment'] = $comment;
                        }
                    }
                }
            }
        }
        //CW hardcode END

        $results_data = ['movie' => $results, 'available_dates' => $available_dates];

        $cacheItem->expiresAfter(Cache::TIME20MIN);
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

function AppDot_Amenities($house_id = 0, $comment = '', $allowpass = '')
{
    //return "abs";
    //https://babelfish.filmsxpress.com/attributes/1239?status=active
    $req_link = 'http://babelfish.filmsxpress.com/attributes/'.$house_id;
    $bearerToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoicmlkZ2VmaWVsZCIsImlhdCI6MTU4OTgxNTE2NiwiZXhwIjoxNzYyNjE1MTY2fQ.T8eiCfGfLl2W2S_MY81wjEX5a8AuMU4piOaaBYNrsIo';

    $cacheItem = Cache::getItem('houses_'.$house_id);
    if (!Cache::isHit($cacheItem)) {
        $attr_arr = [];

        $client = HttpClient::create(['auth_bearer' => $bearerToken]);
        $response = $client->request('GET', $req_link, [
            'query' => [
                'status' => 'active',
            ],
        ]);
        $statusCode = $response->getStatusCode();

        if ($statusCode == '200') {
            //$content = $response->getContent();
            $content = $response->toArray();
        }

        foreach ($content as $cnt_part) {
            $label = $cnt_part['label'];
            $path = (isset($cnt_part['logo']['path']) ? $cnt_part['logo']['path'] : '');
            $description = ( !empty($cnt_part['description'])  ? $cnt_part['description'] : $label  );
            $attr_arr[strtoupper($label)]['label']= $label;
            $attr_arr[strtoupper($label)]['path'] = $path;
            $attr_arr[strtoupper($label)]['desc'] = $description;
        }

        $cacheItem->expiresAfter(Cache::TIME4HRS);
        $cacheItem->set($attr_arr);
        Cache::save($cacheItem);
    } else {
        $attr_arr = $cacheItem->get();
    }
    $new_comment = '';

    $cacheItem_comm = Cache::getItem('comment_'.$house_id.'_'.md5(serialize($comment)).'_allowpass_'.md5(serialize($allowpass)));
    if (!Cache::isHit($cacheItem_comm)) {
        if ($comment != "" || stripos('N', $allowpass) !== false) {
            $added_icons = array(); // To check for duplicates a little later

            $comment = explode(';', $comment);
            if (stripos('N', $allowpass) !== false) {
                array_push($comment, 'NO PASSES');
            }

            foreach ($comment as $part_comment) {
                $part_comment = strtoupper(trim($part_comment));
                if (isset($attr_arr[$part_comment])) {
                    if ($attr_arr[$part_comment]['label'] != "" && !in_array($attr_arr[$part_comment]['label'], $added_icons)) {
                        $added_icons[] = $attr_arr[$part_comment]['label'];
                        if (substr($attr_arr[$part_comment]['path'], 0, 1) == '/' || substr($attr_arr[$part_comment]['path'], 0, 4) == 'http') {
                            $new_comment .= '<img src="' . $attr_arr[$part_comment]['path'] . '" title="' . $attr_arr[$part_comment]['desc'] . '" alt="' . $attr_arr[$part_comment]['desc'] . '" class="comments_icons" />';
                        } else {
                            $new_comment .= ';<span class="comments_icons" >' . $attr_arr[$part_comment]['desc'] . '</span>';
                        }
                    }
                } else {
                    if (!in_array($part_comment, $added_icons)) {
                        if ($part_comment == 'NO PASSES') {
                            foreach ($attr_arr as $attr_key => $attr) {
                                if (stripos($attr_key, 'no passes') !== false) {
                                    $added_icons[] = $part_comment;
                                    $new_comment .= '<img src="' . $attr['path'] . '" title="' . $attr['desc'] . '" alt="' . $attr['desc'] . '" class="comments_icons" />';
                                }
                            }
                        }else{
                            $added_icons[] = $part_comment;
                            //$new_comment .= '['.$part_comment.']';
                            $new_comment .= ';<span class="comments_icons" >' . $part_comment . '</span>';
                        }
                    }
                }
            }
        }

        if(Cache::getCreateCache()) {
        $cacheItem_comm->expiresAfter(rand(Cache::TIME30MIN, Cache::TIME1HR));
        $cacheItem_comm->set($new_comment);
        Cache::save($cacheItem_comm);
    }
    }else{
        $new_comment = $cacheItem_comm->get();
    }

    return $new_comment;
}