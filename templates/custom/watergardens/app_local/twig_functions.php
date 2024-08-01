<?php

function getShowdatesMovieFunction($house_id, $movie_id, $showdates)
{
    $results = [];
    $movie_showdates = [];
    foreach ($showdates as $showdate) {
        if ($showdate['house_id'] != $house_id || $showdate['movie_id'] != $movie_id) continue;
        array_push($movie_showdates, $showdate['date']);
        $results[$showdate['date']]['times'][$showdate['time']] = $showdate['details'];
    }
    $results['showdates'] = join(array_unique($movie_showdates), " ");
    return $results;
}

function collectMovieDataFunction($house_id, $showdates, $movies)
{
    $results = [];
    $np_showdates = [];
    foreach ($showdates as $showdate) {
        if ($showdate['house_id'] != $house_id) continue;
        $results['np'][$showdate['movie_id']]['movie'] = $movies[$showdate['movie_id']];
        $results['np'][$showdate['movie_id']][$showdate['date']]['times'][$showdate['time']] = $showdate['details'];
        array_push($np_showdates, $showdate['date']);
    }
    foreach ($movies as $movie_id => $movie) {
        if ($movie['release'] > date("Y-m-d")) {
            $results['cs'][$movie_id]['movie'] = $movie;
        }
    }

    $results['np']['showdates'] = join(array_unique($np_showdates), " ");
    return $results;
}
