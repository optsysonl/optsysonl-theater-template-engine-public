<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 4/25/2018
 * Time: 7:08 PM
 */

namespace App\Controllers;

use App\Core\Cache;

use App\Models\Website;

class SlidesController {
    public function index()
    {
        $mWebsite = new Website();

        $data = [];

        $cacheItem = Cache::getItem('slides');
        if (!Cache::isHit($cacheItem)) {
            $data['slides'] = $mWebsite->getCarousel();

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME2HRS);
                $cacheItem->set($data['slides']);
                Cache::save($cacheItem);
            }
        } else {
            $data['slides'] = $cacheItem->get();
        }

        return $data;
    }
}