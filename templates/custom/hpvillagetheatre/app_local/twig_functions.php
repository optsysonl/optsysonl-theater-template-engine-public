<?php

use App\Core\Cache;

function collectTodayMoviesDataFunction($house_id, $showdates, $movies)
{
    $cacheItem = Cache::getItem('collectTodayMoviesData_' . $house_id . '_' . md5(json_encode($showdates)). '_' . md5(json_encode($movies)) );
    if (!Cache::isHit($cacheItem)) {
        $results = ['movies'=>[], 'showdates'=>[]];
        foreach ($showdates as $showdate) {
            if ($showdate['house_id'] != $house_id) continue;
            $main_movie_id = $showdate['movie_id'];
            if ($showdate['parent_id']) {
                $main_movie_id = $showdate['parent_id'];
            }
            if ($showdate['date'] == date("Y-m-d")) {
                $results['movies'][$showdate['movie_id']]['movie'] = $movies[$main_movie_id];
                $results['movies'][$showdate['movie_id']]['movie']['format'] = $showdate['details']['format']['value'];
                $results['movies'][$showdate['movie_id']][$showdate['date']]['times'][$showdate['time']] = $showdate['details'];
            }
        }
        $results['showdates'] = [date("Y-m-d")];

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    } else {
        $results = $cacheItem->get();
    }
    return $results;
}

function collectMoviesDataFunction($house_id, $showdates, $movies)
{
    $movies_showdates = [];
    $results = ['movies'=>[], 'showdates'=>[]];

    $cacheItem = Cache::getItem('collectMoviesData_' . $house_id . '_' . md5(json_encode($showdates)). '_' . md5(json_encode($movies)) );
    if (!Cache::isHit($cacheItem)) {

        foreach ($showdates as $showdate) {
            if ($showdate['house_id'] != $house_id) continue;
            $main_movie_id = $showdate['movie_id'];
            if ($showdate['parent_id']) {
                $main_movie_id = $showdate['parent_id'];
            }
            $results['movies'][$showdate['movie_id']]['movie'] = $movies[$main_movie_id];
            $results['movies'][$showdate['movie_id']]['movie']['format'] = $showdate['details']['format']['value'];
            $results['movies'][$showdate['movie_id']][$showdate['date']]['times'][$showdate['time']] = $showdate['details'];
            array_push($movies_showdates, $showdate['date']);
        }
        $results['showdates'] = join(array_unique($movies_showdates), " ");

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    } else {
        $results = $cacheItem->get();
    }
    return $results;
}