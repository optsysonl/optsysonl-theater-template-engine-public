<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 11/26/2018
 * Time: 1:31 PM
 */

use App\Helpers\DateHelper;

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function nowPlayingComingSoonFunction($arr, $showdates)
{
    $today = DateHelper::today_with_0_time();
    $result=['np'=>[],'cs'=>[]];

    $showdate_movie = [];
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
    return $result;
}

function getMovieTimesFunction($showdates, $movie_id){

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

    return $data;
}


function getMovieTimesWeeklyFunction($showdates, $movie_id){
    $this_movie_dates = [];
    $this_movie_data = [];


    $showdates = sortDays($showdates);

    foreach ($showdates as $a_showdate) {
        if ($a_showdate['movie_id'] == $movie_id || $a_showdate['parent_id'] == $movie_id) {
            $date = $a_showdate["date"];
            $day = date('D', strtotime($a_showdate["date"]));
            $this_movie_dates[$date] = $date = dateFix($day, $date);

            $comment = $a_showdate['details']['comment'];
            if ($a_showdate['details']['format']['value'] != "2D") {
                $comment = $a_showdate['details']['format']['value'] . ($a_showdate['details']['comment'] != "" ? ", " : "") . $a_showdate['details']['comment'];
            }

            $this_movie_data[$date]['houses'][$a_showdate['house_id']][$day][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
        }
    }

    $this_movie_dates = array_unique($this_movie_dates, $sort_flags = SORT_STRING);
    sort($this_movie_dates);
    $data['dates'] = $this_movie_dates;
    $data['showtimes'] = $this_movie_data;

    return $data;
}


function getHouseTimesFunction($showdates, $house_id)
{

    $this_house_dates = [];
    $this_house_data = [];
    $movie_array = [];
    foreach ($showdates as $a_date){
        array_push( $movie_array, $a_date['movie_id']);
    }

    foreach ($showdates as $a_showdate) {
        if ($a_showdate['house_id'] == $house_id) {
            $this_house_dates[] = $a_showdate['date'];
            $main_movie_id = $a_showdate['movie_id'];
            if ($a_showdate['parent_id'] && in_array($a_showdate['parent_id'], $movie_array)) {
                $main_movie_id = $a_showdate['parent_id'];
            }

            $comment = $a_showdate['details']['comment'];
            if ($a_showdate['details']['format']['value'] != "2D") {
                $comment = $a_showdate['details']['format']['value'] . ($a_showdate['details']['comment'] != "" ? ", " : "") . $a_showdate['details']['comment'];
            }

            $this_house_data[$a_showdate['date']]['movies'][$main_movie_id][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
        }
    }
    $this_house_dates = array_unique($this_house_dates, $sort_flags = SORT_STRING);
    sort($this_house_dates);

    $data['dates'] = $this_house_dates;
    $data['showtimes'] = $this_house_data;

    return $data;
}



function sortDays($showdates){

    $day_order = ['Friday' => 1, 'Saturday' => 2,'Sunday' => 3,'Monday' => 4, 'Tuesday'=> 5, 'Wednesday' => 6, 'Thursday' => 7];

    usort($showdates, function($a, $b) use ($day_order) {
        return $day_order[date('l',strtotime($a['date']))] <  $day_order[date('l',strtotime($b['date']))] ? -1 : 1;
    });

    return $showdates;
}

function dateFix($day, $date) {
    return $day == 'Fri' ? date('Y-m-d', strtotime($date)) : date('Y-m-d', strtotime("$date last friday"));
}