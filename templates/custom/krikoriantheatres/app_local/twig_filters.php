<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 4/4/2018
 * Time: 5:39 PM
 */

/**
 * Groups movieShowtimes.
 *
 * @param array $arr
 *
 * @return array
 */
function groupMovieShowtimesFilter($movies)
{
    $new_movie_array = [];
    foreach ($movies as $movie_id => $movie) {

        if (array_key_exists($movie_id, $new_movie_array)) {
            // movie exists in new array... do nothing??

        } elseif (isset($movie['parent_id']) AND $movie['parent_id'] != '0') {
            // movie doesn't esists in new array and parent_id is defined/non-zero

            if (array_key_exists($movie['parent_id'], $new_movie_array)) {
                // check if parent_id existing in new array

                // it does => add showtimes to existing movie
                $new_movie_array[$movie['parent_id']]['showtimes'] = add_showtimes($new_movie_array[$movie['parent_id']]['showtimes'], $movie['showtimes']);
            } else {
                // id does not

                if (array_key_exists($movie['parent_id'], $movies)) {
                    // check if original movie exists further down in array

                    // it does ==> add original movie, then add showtimes
                    $new_movie_array[$movie['parent_id']] = $movies[$movie['parent_id']];
                    $new_movie_array[$movie['parent_id']]['showtimes'] = add_showtimes($new_movie_array[$movie['parent_id']]['showtimes'], $movie['showtimes']);
                } else {
                    $new_movie_array[$movie['id']] = $movie;
                }
            }
        } else {
            $new_movie_array[$movie_id] = $movie;
        }
    }

    return $new_movie_array;
}

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function NowPlayingComingSoonFilter($arr)
{

    $today = date('Y-m-d');
	if (config('developer.on')) {
		$today = config('developer.today', $today);
	}

	$result=['np'=>[],'cs'=>[]];
    foreach ($arr as $movie_id => $movie){
        if($movie['release'] <= $today){
            $result['np'][$movie_id] = $movie;
        }else{
            $result['cs'][$movie_id] = $movie;
        }
    }
    return $result;
}

/**
 * Combines 2 showtimes arrays and sort by time.
 *
 * @param array $to
 * @param array $from
 *
 * @return array
 */

function add_showtimes($to, $from)
{
    foreach ($to as $to_date => $to_showtime) {
        //array_push( $to[$date], $showtime);
        foreach ($from as $from_date => $from_showtime) {
            foreach ($from_showtime as $from_time => $from_time_data) {
                foreach ($from_time_data as $from_time_data_info) {
                    $to[$from_date][$from_time][] = $from_time_data_info;
                }
            }
        }
    }
    foreach ($to as $date => $times) {
        ksort($times);
        $to[$date] = $times;
    }

    return $to;
}

function mergeByParentIDFilter($movies){
    $new_movies = [];

    foreach($movies as $id => $movie_data){
        if( $movie_data['parent_id'] == 0 ) {
            array_push($new_movies, $movie_data);
        }elseif ( array_key_exists($movie_data['parent_id'], $movies) ){
            // ignore the movie, we already have it
        }else{
            array_push($new_movies, $movie_data);
        }
    }
    return $new_movies;
}

function sortByStateFilter($houses){

    $houses_state = [];
    $houses_new   = [];

    foreach ($houses as $h) {
        if (isset($state) && $state != $h["state_full"]) {
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
        $house_new['state']    = $state;
        array_push($houses_state, $house_new);
    }
    $this_state = ['state' => $state, 'houses' => $houses_state];
    array_push($houses_new, $this_state);

    return $houses_new;
}

function url_decodeFilter($url){
    return urldecode($url);
}