<?php

namespace App\Controllers;

use App\Core\Cache;

use App\Helpers\DataHelper;

use App\Models\Movie;
use App\Models\Screen;

class MovieController
{
    public function index($movie_id)
    {
        $mMovie  = new Movie();
        $mScreen = new Screen();
    
        // Get Movie data
        $cacheItem = Cache::getItem('movie_' . $movie_id);
        if (!Cache::isHit($cacheItem)) {
            $movie = $mMovie->getDetails($movie_id);
            $movie = DataHelper::transformMovie($movie);
            
            $data['movie'] = $movie;

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME4HRS);
                $cacheItem->set($data['movie']);
                Cache::save($cacheItem);
            }
        } else {
            $data['movie'] = $cacheItem->get();
        }
        
        // Get Movie Showdates data
        $cacheItem = Cache::getItem('movie_' . $movie_id . '_showdates');
        if (!Cache::isHit($cacheItem)) {
            $showdates = $mScreen->getShowdates(null, $movie_id);
            
            $data['movie']['showdates'] = $showdates;

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME4HRS);
                $cacheItem->set($data['movie']['showdates']);
                Cache::save($cacheItem);
            }
        } else {
            $data['movie']['showdates'] = $cacheItem->get();
        }
        
        return $data;
    }
}