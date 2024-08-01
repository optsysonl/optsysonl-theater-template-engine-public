<?php

namespace App\Controllers;

use App\Core\Cache;
use App\Core\Support\Str;

use App\Helpers\BuildHelper;
use App\Helpers\FixHelper;
use App\Helpers\MetaHelper;

use App\Models\House;

class LocationsController
{
    public function index()
    {
        $site_id = config('fxp.site_id');
        $template = config('fxp.template_name');
        
        $mHouse = new House();

        $cacheItem = Cache::getItem('houses');
        if (!Cache::isHit($cacheItem)) {
            $hs = $mHouse->getHouses($site_id);
            $houses_new = [];
            foreach ($hs as $h) {
                if($h['status'] != 'disabled' ){
                    $house['house_id']          = FixHelper::fix_movie_id($h['house_id']);
                    $house['name']              = $h['name'];
                    $house['slug']              = Str::slug($h['slug']);
                    $house['address']           = $h['address'];
                    $house['address2']          = $h['address2'];
                    $house['city']              = $h['city'];
                    $house['state_short']       = $h['state'];
                    $house['state_full']        = MetaHelper::get_state_name($h['state']);
                    $house['zip']               = $h['zip'];
                    $house['map']['url']        = $h['map'];
                    $house['map']['address']    = str_replace(' ', '+', $house['address'] . " " . $house['city'] . ", " . $house['state_short'] . " " . $house['zip']);
                    $house['url']               = '/location/' . $house['house_id'] . '/' .MetaHelper::url_name($house['name']) . '-Showtimes';
                    $house['photo']             = BuildHelper::build_house_photo_url($site_id, $h['PhotoUrl']);
                    $house['phone']             = BuildHelper::build_phone_number($h['phone']);
                    $house['movieline']         = BuildHelper::build_phone_number($h['movieline']);
                    $house['email']             = strtolower($h['email']);
                    $house['amenities']         = ($h['amenities'] ? explode(';', $h['amenities']) : []);
                    $house['tagline']           = $h['tagline'];
                    $house['drivein']           = ($mHouse->checkDrivein($house['house_id']) ? $mHouse->checkDrivein($house['house_id']) : false );
                    $house['policies']          = $h['policies'];
                    $house['middleware_id']     = $h['middleware_id'];
                    $house['posType']           = $h['posType'];
                    $house['posURL']            = $h['posURL'];
                    $house['timezone']          = $h['timezone'];
                    $house['message_page_id']   = $h["message_page"];
                    $house['social_icons']      = [];
                    if( $h['facebook'] != ''){
                        $house['social_icons']['facebook']['link']         = $h['facebook'];
                        $house['social_icons']['facebook']['img']          = BuildHelper::build_DataURI(view_path($template) . '/assets/img/facebook.svg');
                    }
                    if( $h['twitter'] != '') {
                        $house['social_icons']['twitter']['link'] = $h['twitter'];
                        $house['social_icons']['twitter']['img'] = BuildHelper::build_DataURI(view_path($template) . '/assets/img/twitter.svg');
                    }
                    if( $h['instagram'] != '') {
                        $house['social_icons']['instagram']['link'] = $h['instagram'];
                        $house['social_icons']['instagram']['img'] = BuildHelper::build_DataURI(view_path($template) . '/assets/img/instagram.svg');
                    }
                    if( $h['pintrest'] != '') {
                        $house['social_icons']['pintrest']['link'] = $h['pintrest'];
                        $house['social_icons']['pintrest']['img'] = BuildHelper::build_DataURI(view_path($template) . '/assets/img/pinterest.svg');
                    }
                    if( $h['google'] != '') {
                        $house['social_icons']['google_plus']['link'] = $h['google'];
                        $house['social_icons']['google_plus']['img'] = BuildHelper::build_DataURI(view_path($template) . '/assets/img/google.svg');
                    }

                    $house['seo'] = MetaHelper::meta_seo($h['seo']);
                    $house['status'] = $h['status'];

                    $dataprices = $mHouse->getPrices($house['house_id']);

                    $house['prices']    = $dataprices;
                    $house['ticketing'] = MetaHelper::get_ticketing($house['posType']  );

                    $houses_new[$house['house_id']] = $house;
                }
            }
            
            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME4HRS);
                $cacheItem->set($houses_new);
                Cache::save($cacheItem);
            }
        } else {
            $houses_new = $cacheItem->get();
        }

        return $houses_new;
    }
}