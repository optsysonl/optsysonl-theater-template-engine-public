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
    if(false !== ($breakpoint = strpos($string, $break, $limit))) {
        if($breakpoint < strlen($string) - 1) {
            $string = substr($string, 0, $breakpoint) . $pad;
        }
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

/**
 * Groups an array by a common property.
 *
 * @param array  $arr
 *
 * @return array
 */
function groupByCommentFilter($arr)
{
    $temp_groups = array();
    $groups = array();
    $items = array();

        foreach($arr as $key => $sub_obj ) {
            $_comment = trim($sub_obj['comment']) ?  trim($sub_obj['comment']) : "";
            if($sub_obj['format']['value'] != '2D'){
                $value = $sub_obj['format']['value'] . ", ". $_comment;
            }else{
                $value = $_comment;
            }

            if (!array_search($value, $items)) {
                array_push($items, $value);
            }
            $temp_groups[$value][$key] = $sub_obj;
        }

        foreach($temp_groups as $key => $group){
            $key = str_replace(";", "; ", $key);
            $groups[$key]=$group;
        }
    return $groups;
}

function url_decodeFilter($url){
    return urldecode($url);
}