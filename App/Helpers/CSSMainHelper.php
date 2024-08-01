<?php

namespace App\Helpers;

use App\Core\Cache;

class CSSMainHelper
{
    private $file = '';
    private $dir  = 'css/';
    
    // Class properties and methods go here
    public function __construct($file)
    {
        $this->file = $file . '.css';
    }
    
    public function process()
    {
        $args = [
            'data' => [
                'config' => config('fxp'),
                'css'    => $this->get_data(),
            ]
        ];
        
        header('Content-type: text/css');
        echo view($this->get_tpl(), $args);
    }
    
    private function get_data()
    {
        $cacheItem = Cache::getItem('css_data');
        if (!Cache::isHit($cacheItem)) {
            $data = $this->setup_variables();
            
            $cacheItem->expiresAfter(Cache::TIME7DAY);
            $cacheItem->set($data);
            Cache::save($cacheItem);
        } else {
            $data = $cacheItem->get();
        }
        
        return $data;
    }
    
    private function get_tpl()
    {
        return $this->dir . $this->file;
    }
    
    private function setup_variables()
    {
        //set up some variables
        $data['background_color_1']     = trim(config('fxp.bkg_color'));
        $data['background_color_1_rgb'] = $this->hex2rgb($data['background_color_1']);
        $data['background_color_2']     = trim(config('fxp.bkg_color2'));
        $data['background_color_2_rgb'] = $this->hex2rgb($data['background_color_2']);
        $data['text_color']             = trim(config('fxp.text_color'));
        $data['text_color_rgb']         = $this->hex2rgb($data['text_color']);
        $data['link_color']             = trim(config('fxp.text_color2'));
        $data['link_color_rgb']         = $this->hex2rgb($data['link_color']);
        $data['font']                   = trim(config('fxp.font'));
        $data['logo_image']             = trim(config('fxp.header_img'));
        $data['header_image']           = (config('fxp.site_header_img') != '') ? "background-image: url('" . BuildHelper::build_image_url(config('fxp.site_id'), config('fxp.site_header_img')) . "');" : "";
        $data['background_image']       = (config('fxp.background_img') != '') ? "background-image: url('" . BuildHelper::build_image_url(config('fxp.site_id'), config('fxp.background_img')) . "');" : "";
        $data['background_repeat']      = (config('fxp.background_repeat') == '1') ? "background-repeat: repeat;" : "background-repeat: no-repeat;background-position: 50% 0%;";
        $data['box_sizing']             = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-ms-box-sizing:border-box;box-sizing:border-box;";
        
        return $data;
    }
    
    /**
     * Construct a RGB color from a hex color
     */
    private function hex2rgb($hex)
    {
        $hex = str_replace("#", "", $hex);
        
        if (strlen($hex) == 3) {
            $r = hexdec(substr($hex, 0, 1) . substr($hex, 0, 1));
            $g = hexdec(substr($hex, 1, 1) . substr($hex, 1, 1));
            $b = hexdec(substr($hex, 2, 1) . substr($hex, 2, 1));
        } else {
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
        }
        $rgb = "$r, $g, $b";
        
        return $rgb; // returns an array with the rgb values
    }
}