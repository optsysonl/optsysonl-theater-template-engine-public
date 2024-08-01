<?php

/**
 * @param $string
 * @param $number
 * @return string
 */
function cropStringFilter($string, $limit)
{
    $break=".";
    $pad="...";

    // return with no change if string is shorter than $limit
    if(strlen($string) <= $limit) return $string;

    // is $break present between $limit and the end of the string?
    $breakpoint1 = strpos($string, ",", $limit) ? strpos($string, ",", $limit) : strlen($string);
    $breakpoint2 = strpos($string, ".", $limit) ? strpos($string, ".", $limit) : strlen($string);
    $breakpoint3 = strpos($string, ";", $limit) ? strpos($string, ";", $limit) : strlen($string);

    $breakpoint = min($breakpoint1, $breakpoint2, $breakpoint3);

    if( ($breakpoint - $limit) > 30 ){
        $breakpoint = strpos($string, " ", $limit) ? strpos($string, " ", $limit) : strlen($string);
    }

    if($breakpoint < strlen($string) - 1) {
        $string = substr($string, 0, $breakpoint) . $pad;
    }

    return $string;
}

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

function url_decodeFilter($url){
    return urldecode($url);
}

function shortenFilter($url, $qr=NULL){
    $ch = curl_init();
    $timeout = 5;
    curl_setopt($ch,CURLOPT_URL,'http://tinyurl.com/api-create.php?url='.$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}
