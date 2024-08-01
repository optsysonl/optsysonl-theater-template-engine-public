<?php

namespace App\Helpers;

use App\Core\Cache;
use App\Models\Page;
use App\Models\Website;

class PageHelper
{
    /**
     * Get meta data for view template
     *
     * @return array
     */
    public static function getMetaData()
    {
        $site_id   = config('fxp.site_id');
        $favicon   = config('fxp.Favicon');
        $font      = config('fxp.font');
        $analytics = config('fxp.analytics');
        $seo_data  = config('fxp.seo');

        // Meta
        $cacheItem = Cache::getItem('meta');
        if (!Cache::isHit($cacheItem)) {
            if($favicon) {
                $meta['icon'] = BuildHelper::build_image_url($site_id, $favicon);
                $meta['android_icon'] = BuildHelper::build_image_url($site_id, $favicon);
                $meta['apple_icon'] = BuildHelper::build_image_url($site_id, $favicon);
                $meta['apple_icon_precomposed'] = BuildHelper::build_image_url($site_id, $favicon);
                $meta['shortcut_icon'] = BuildHelper::build_image_url($site_id, $favicon);
            }
            $meta['google_fonts']           = MetaHelper::get_google_font($font);
            $meta['analytics']              = $analytics;

            $meta_seo = MetaHelper::meta_seo($seo_data);
            $meta = $meta + $meta_seo;

            if(Cache::getCreateCache()){
                $cacheItem->expiresAfter(Cache::TIME7DAY);
                $cacheItem->set($meta);
                Cache::save($cacheItem);
            }
        } else {
            $meta = $cacheItem->get();
        }

        return $meta;
    }

    /**
     * Get header data for view template
     *
     * @return array
     */
    public static function getHeaderData()
    {
        $site_id      = config('fxp.site_id');
        $site_country = config('fxp.site_country');
        $template     = config('fxp.template_name');

        // Logo
        $cacheItem = Cache::getItem('logo');
        if (!Cache::isHit($cacheItem)) {
            $header['logo']  = BuildHelper::build_image_url($site_id, config('fxp.header_img'));
            $header['logo2'] = BuildHelper::build_image_url($site_id, config('fxp.template_options.logo_alt'));


            $logo_array = array(
                'logo' => $header['logo'],
                'logo2' => $header['logo2'],
            );
            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME7DAY);
                $cacheItem->set($logo_array);
                Cache::save($cacheItem);
            }
        } else {
            $logo_array = $cacheItem->get();
            $header['logo'] = $logo_array['logo'];
            $header['logo2'] = $logo_array['logo2'];

        }

        // Social Icons
        $cacheItem = Cache::getItem('social_icons');
        if (!Cache::isHit($cacheItem)) {
            $header['social_icons'] = [];

            if (config('fxp.facebook')) {
                $header['social_icons']['facebook']['link'] = trim(config('fxp.facebook'));
                $header['social_icons']['facebook']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/facebook.svg');
            }
            if (config('fxp.twitter')) {
                $header['social_icons']['twitter']['link'] = trim(config('fxp.twitter'));
                $header['social_icons']['twitter']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/twitter.svg');
            }
            if (config('fxp.instagram')) {
                $header['social_icons']['instagram']['link'] = trim(config('fxp.instagram'));
                $header['social_icons']['instagram']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/instagram.svg');
            }
            if (config('fxp.youtube')) {
                $header['social_icons']['youtube']['link'] = trim(config('fxp.youtube'));
                $header['social_icons']['youtube']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/youtube.svg');
            }
            if (config('fxp.pintrest')) {
                $header['social_icons']['pintrest']['link'] = trim(config('fxp.pintrest'));
                $header['social_icons']['pintrest']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/pinterest.svg');
            }
            if (config('fxp.google')) {
                $header['social_icons']['google_plus']['link'] = trim(config('fxp.google'));
                $header['social_icons']['google_plus']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/google.svg');
            }
            if (config('fxp.google+')) {
                $header['social_icons']['site_google_plus']['link'] = trim(config('fxp.google+'));
                $header['social_icons']['site_google_plus']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/google.svg');
            }
            if (config('fxp.cust_id')) {
                $header['social_icons']['cust_id']['link'] = trim(config('fxp.cust_id'));
                $header['social_icons']['cust_id']['img']  = BuildHelper::build_DataURI(view_path($template) . '/assets/img/email.svg');
            }

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME7DAY);
                $cacheItem->set($header['social_icons']);
                Cache::save($cacheItem);
            }
        } else {
            $header['social_icons'] = $cacheItem->get();
        }

        // Top Navigation
        $cacheItem = Cache::getItem('top_nav');
        if (!Cache::isHit($cacheItem)) {
            $mPage = new Page;
            $navigation_top = $mPage->getCreatedPages('top');

            $header['top_nav'] = $navigation_top;

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME12HRS);
                $cacheItem->set($header['top_nav']);
                Cache::save($cacheItem);
            }
        } else {
            $header['top_nav'] = $cacheItem->get();
        }

        return $header;
    }

    /**
     * Get footer data for view template
     *
     * @return array
     */
    public static function getFooterData()
    {
        // Bottom Navigation
        $cacheItem = Cache::getItem('bottom_nav');
        if (!Cache::isHit($cacheItem)) {
            $mPage = new Page;
            $navigation_bottom = $mPage->getCreatedPages('bottom');

            $footer['bottom_nav'] = $navigation_bottom;

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME12HRS);
                $cacheItem->set($footer['bottom_nav']);
                Cache::save($cacheItem);
            }
        } else {
            $footer['bottom_nav'] = $cacheItem->get();
        }

        return $footer;
    }

    /**
     * Gets the html content from the specified FilmsXpress page.
     *
     * @param integer $page_id
     *
     * @return string the contents of a FilmsXpress page
     * @see function 'fxp_build_page_url'
     */
    public static function getFxpPageContent($page_id)
    {
        $site_id = config('fxp.site_id');

        $fileLink = BuildHelper::fxp_build_page_url($site_id, $page_id);

        //we want to make sure the file exists and handle the error if it doesn't
        try {
            $html = @file_get_contents($fileLink);
        } catch (\Exception $e) {
            $html = $e;
        }

        return trim($html);
    }

    /**
     * Get PHP friendly timezone
     *
     * @param $rating
     * @param $state
     *
     * @return bool|mixed|string
     */
    public static function getStateRating($rating, $state = null)
    {
        if (!$state) {
            $mWebsite = new Website();
            $state = $mWebsite->getState();
        }

        if (!$state) {
            $state = 'Ratings May Vary';
        }

        if (($state == 'NT') || ($state == 'NU')) {
            $target = 'AB';
        } else if (($state == 'YT')) {
            $target = 'BC';
        } else if (($state == 'NB') || ($state == 'NL') || ($state == 'PE')) {
            $target = 'NS';
        } else {
            $target = $state;
        }

        $target_pos = strpos($rating, $target);
        $target_end = strpos($rating, ';', $target_pos);
        if ($target_end == '') {
            $target_end = strlen($rating);
        }

        $province_rating = substr($rating, $target_pos, ($target_end - $target_pos));
        $province_rating = str_ireplace($target, '', $province_rating);

        return $province_rating;
    }
}