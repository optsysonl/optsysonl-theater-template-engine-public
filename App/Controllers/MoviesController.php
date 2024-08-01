<?php

namespace App\Controllers;

use App\Core\Cache;
use App\Models\Movie;
use App\Helpers\DataHelper;
use App\Enums\MovieFormatEnum;

class MoviesController
{
    public function index()
    {
        $mMovie = new Movie();
        $data = [];
        $data['movie_formats'] = MovieFormatEnum::toArray();

        // Get data (MOVIES)
        $cacheItem = Cache::getItem('movies');
        if (!Cache::isHit($cacheItem)) {
            $movies_np = [];
            $movies_cs = [];
            $movies_carousel = [];

            $movies_np_raw          = $mMovie->getNowPlaying();
            $movies_cs_raw          = $mMovie->getComingSoon();
            $movies_carousel_raw    = $mMovie->getCarouselMovies();
			$coming_soon_houses_raw = $mMovie->getComingSoonHouses();

            // Data Formatting - Now Playing
            foreach ($movies_np_raw as $m) {
                $cacheItem_m = Cache::getItem('movie_' . $m['movie_id']);
                if (!Cache::isHit($cacheItem_m)) {
                    $a_movie = DataHelper::transformMovie($m);

                    if(Cache::getCreateCache()) {
                        $cacheItem_m->expiresAfter(rand(Cache::TIME4HRS, Cache::TIME6HRS));
                        $cacheItem_m->set($a_movie);
                        Cache::save($cacheItem_m);
                    }
                } else {
                    $a_movie = $cacheItem_m->get();
                }

                $movies_np[$m['movie_id']] = $a_movie;
            }

            // Data Formatting - Coming Soon
            foreach ($movies_cs_raw as $m) {
                $cacheItem_m = Cache::getItem('movie_' . $m['movie_id']);
                if (!Cache::isHit($cacheItem_m)) {
                    $a_movie = DataHelper::transformMovie($m);

                    if(Cache::getCreateCache()) {
                        $cacheItem_m->expiresAfter(rand(Cache::TIME4HRS, Cache::TIME6HRS));
                        $cacheItem_m->set($a_movie);
                        Cache::save($cacheItem_m);
                    }
                } else {
                    $a_movie = $cacheItem_m->get();
                }

                $movies_cs[$m['movie_id']] = $a_movie;
            }

            //Combine NP & CS
            $movies = $movies_np + $movies_cs;

            // Data Formatting - Carousel movies
            foreach ($movies_carousel_raw as $m) {

                if( array_key_exists($m['movie_id'], $movies ) ) {
                    //ignore as we have the movie
                }else{
                    $cacheItem_m = Cache::getItem('movie_' . $m['movie_id']);
                    if (!Cache::isHit($cacheItem_m)) {
                        $a_movie = DataHelper::transformMovie($m);

                        if(Cache::getCreateCache()) {
                            $cacheItem_m->expiresAfter(rand(Cache::TIME4HRS, Cache::TIME6HRS));
                            $cacheItem_m->set($a_movie);
                            Cache::save($cacheItem_m);
                        }
                    } else {
                        $a_movie = $cacheItem_m->get();
                    }
                    $movies_carousel[$m['movie_id']] = $a_movie;
                }

            }

            $movies = $movies + $movies_carousel;

			// add to movies Coming Soon Houses
			foreach ($coming_soon_houses_raw as $row) {
				if (isset($movies[$row['movie_id']])) {
					$movies[$row['movie_id']]['playing_at'][$row['house_id']] = ['house_id' =>$row['house_id'], 'release_date'=>$row['release']];
				}
			}

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME2HRS);
                $cacheItem->set($movies);
                Cache::save($cacheItem);
            }
        } else {
            $movies = $cacheItem->get();
        }

        $data['movies'] = $movies;

        return $data;
    }
}