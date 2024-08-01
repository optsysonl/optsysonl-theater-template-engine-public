<?php

namespace App\Helpers;

class DateHelper
{
    public static function today()
    {
        $today = date('Y-m-d');
        
        if (config('developer.on')) {
            $today = config('developer.today', $today);
        }
        
        return $today;
    }

    public static function today_with_0_time()
    {
        $today = date('Y-m-d 00:00:00');

        if (config('developer.on')) {
            $today = config('developer.today', $today);
        }

        return $today;
    }
    
    public static function now()
    {
        $now = date('Y-m-d H:i:s');
        
        if (config('developer.on')) {
            $today = config('developer.today', $now);
            $now = $today . ' ' . date('H:i:s');
        }
        
        return $now;
    }
}