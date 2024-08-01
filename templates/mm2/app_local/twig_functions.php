<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 6/7/2018
 * Time: 8:28 PM
 */

use App\Core\Cache;
use App\Helpers\DateHelper;

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function NowPlayingComingSoonFunction($movies, $showdates)
{

    $movie_ids =  (!empty($showdates) ? array_column($showdates, 'movie_id') : [] );

    $today = DateHelper::today_with_0_time();
    $result['np'] = [];
    $result['cs'] = [];
    foreach ($movies as $movie_id => $movie){
        if($movie['release'] <= $today){
            if( is_int(array_search($movie_id, $movie_ids)) ){
                $result['np'][$movie_id] = $movie;
            }
        }else{
            $result['cs'][$movie_id] = $movie;
        }
    }
    return $result;
}

function getHouseTimesFunction($showdates, $house_id)
{
    $data = [];

    $cacheItem = Cache::getItem('getHouseTimes_' . $house_id);
    if (!Cache::isHit($cacheItem)) {
        if (empty($house_id) || empty($showdates)) {
            return $data;
        }

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

                if($a_showdate['details']['allowpass'] == "N"){
                    $comment = "No Passes; ". $comment;
                }

                $this_house_data[$a_showdate['date']]['movies'][$main_movie_id][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
            }
        }
        $this_house_dates = array_unique($this_house_dates, $sort_flags = SORT_STRING);
        sort($this_house_dates);

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


function getHouseTimesWeeklyFunction($showdates, $house_id)
{

    $this_house_dates = [];
    $this_house_data = [];

    $showdates = sortDays($showdates);
    foreach ($showdates as $a_date){
        array_push( $movie_array, $a_date['movie_id']);
    }

    foreach ($showdates as $a_showdate) {
        if ($a_showdate['house_id'] == $house_id) {


            $date = $a_showdate["date"];
            $day = date('D', strtotime($a_showdate["date"]));
			$this_movie_dates[$date] = $date = dateFix($day, $date);

            $main_movie_id = $a_showdate['movie_id'];
            if ($a_showdate['parent_id'] && in_array($a_showdate['parent_id'], $movie_array)) {
                $main_movie_id = $a_showdate['parent_id'];
            }

            $comment = $a_showdate['details']['comment'];
            if ($a_showdate['details']['format']['value'] != "2D") {
                $comment = $a_showdate['details']['format']['value'] . ($a_showdate['details']['comment'] != "" ? ", " : "") . $a_showdate['details']['comment'];
            }

            if($a_showdate['details']['allowpass'] == "N"){
                $comment = "No Passes; ". $comment;
            }

            $this_house_data[$date]['movies'][$main_movie_id][$day][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
        }
    }

    $this_house_dates = array_unique($this_house_dates, $sort_flags = SORT_STRING);
    sort($this_house_dates);
    $data['dates'] = $this_house_dates;
    $data['showtimes'] = $this_house_data;

    return $data;

}

function getShowdateWeeksFunction($showdates)
{
    $result = [];
    foreach ($showdates as $showdate) {
        $week_start = date('Y-m-d', strtotime("$showdate last friday"));
        if (!in_array($week_start, $result)) {
            array_push($result, $week_start);
        }
    }
    asort($result);

    return $result;
}

function getMovieTimesFunction($showdates, $movie_id)
{

    $this_movie_dates = [];
    $this_movie_data = [];
    $this_movie_houses = [];

    foreach ($showdates as $a_showdate) {
        if ($a_showdate['movie_id'] == $movie_id || $a_showdate['parent_id'] == $movie_id) {
            $this_movie_dates[] = $a_showdate['date'];

            $comment = $a_showdate['details']['comment'];
            if ($a_showdate['details']['format']['value'] != "2D") {
                $comment = $a_showdate['details']['format']['value'] . ($a_showdate['details']['comment'] != "" ? ", " : "") . $a_showdate['details']['comment'];
            }

            $this_movie_data[$a_showdate['date']]['houses'][$a_showdate['house_id']][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];

            if(!array_key_exists(intval($a_showdate['house_id']), $this_movie_houses)){
                $this_movie_houses[$a_showdate['house_id']] = [];
            }
            if(!in_array($a_showdate['date'],$this_movie_houses[$a_showdate['house_id']])) {
                $this_movie_houses[$a_showdate['house_id']][] = $a_showdate['date'];
            }
        }
    }
    $this_movie_dates = array_unique($this_movie_dates, $sort_flags = SORT_STRING);
    ksort($this_movie_dates);

    $data['dates'] = $this_movie_dates;
    $data['showtimes'] = $this_movie_data;
    $data['houses'] = $this_movie_houses;

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

function getShowdatesMovieFunction($showdates, $movie_id)
{
    $results = [];
    $movie_showdates = [];
    foreach ($showdates as $showdate) {
        if ($showdate['movie_id'] != $movie_id) continue;
        array_push($movie_showdates, $showdate['date']);
        $results[$showdate['date']]['times'][$showdate['time']] = $showdate['details'];
    }
    $results['showdates'] = join(array_unique($movie_showdates), " ");

    return $results;
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

function sortShowtimesByCommentLengthFunction($showtimes) {
	$comments = [];
    foreach ($showtimes as $format) {
        foreach ($format as $comment => $key) {
            $comments[] = $comment;
        }
    }
	array_multisort(array_map('strlen', $comments), SORT_NUMERIC, SORT_ASC, $comments);
	$sorted_showtimes = [];
	foreach ($comments as $comment1) {
		foreach ($showtimes as $format) {
            foreach ($format as $comment => $key) {
                if ($comment1 == $comment) {
                    $sorted_showtimes[key($format)][$comment1] = $key;
                }
            }
		}
	}
	return $sorted_showtimes;
}

function getMovieHousesFunction($houses, $showdates, $movie_id){
    $result = [];
    foreach ($houses as $house) {
        $tmp_dates = [];
        foreach ($showdates as $showdate) {
            if ($showdate['movie_id'] == $movie_id && $showdate['house_id'] == $house['house_id']) {
                $tmp_dates[] = $showdate['date'];
            }
        }
        if (!empty($tmp_dates)) {
            $result[$house['house_id']] = array_unique($tmp_dates);
        }
    }
    return $result;
}