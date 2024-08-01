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

function sortByReleaseDateFilter($movies){
    $results = [];
    $release = [];
//var_dump($movies);die;
    foreach ($movies as $movie){
        $release[$movie['release']] = strtotime($movie['release']);
    }

    array_multisort($release, SORT_ASC, $release);

    foreach($release as $date => $val){
        foreach ($movies as $id => $movie){
            if($movie['release'] == $date){
                $results[$id] = $movie;
            }
        }
    }

    return $results;
}