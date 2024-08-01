<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 9/26/2018
 * Time: 1:58 PM
 */

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

function NowPlayingFilter($arr)
{
	$today = date('Y-m-d');
	if (config('developer.on')) {
		$today = config('developer.today', $today);
	}
	$today = date('Y-m-d', strtotime($today. ' + 7 days'));
	$result=[];
	foreach ($arr as $movie_id => $movie){
		if($movie['release'] <= $today){
			$result[$movie_id] = $movie;
		}
	}
	return $result;
}

function TodayFilter($movies, $showdates)
{
	$today = date('Y-m-d');
	if (config('developer.on')) {
		$today = config('developer.today', $today);
	}

	$result=[];
	foreach ($showdates as $showdate) {
		if($showdate['date'] == $today) {
			$result[$showdate['movie_id']]['showtimes'][$showdate['time']] = $showdate;
			ksort($result[$showdate['movie_id']]['showtimes']);
		}
	}

	foreach ($movies as $movie_id => $movie){
		if(array_key_exists ($movie_id, $result)){
			$result[$movie_id]['movie'] = $movie;
		}
	}
	return $result;
}

function ComingSoonFilter($arr)
{
    $today = date('Y-m-d');
    if (config('developer.on')) {
        $today = config('developer.today', $today);
    }

    $result=[];
    foreach ($arr as $movie_id => $movie){
        if($movie['release'] > $today){
            $result[$movie_id] = $movie;
        }
    }
    return $result;
}