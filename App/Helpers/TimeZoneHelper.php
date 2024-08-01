<?php

namespace App\Helpers;

class TimeZoneHelper
{
    public static function getTimezoneOffset($remote_tz, $origin_tz = null)
    {
        if ($origin_tz === null) {
            if (!is_string($origin_tz = date_default_timezone_get())) {
                return false; // A UTC timestamp was returned -- bail out!
            }
        }
        $origin_dtz = new \DateTimeZone($origin_tz);
        $remote_dtz = new \DateTimeZone($remote_tz);
        $origin_dt = new \DateTime("now", $origin_dtz);
        $remote_dt = new \DateTime("now", $remote_dtz);
        $offset = $origin_dtz->getOffset($origin_dt) - $remote_dtz->getOffset($remote_dt);

        return $offset;
    }

    public static function getPhpTimezone($timezone)
    {
        switch ($timezone) {
            case 'EST5EDT':
                $php_timezone = 'America/New_York';
                break;
            case 'EST':
                $php_timezone = 'EST';
                break;
            case 'CST6CDT':
                $php_timezone = 'America/Chicago';
                break;
            case 'CST':
                $php_timezone = 'Canada/Saskatchewan';
                break;
            case 'MST7MDT':
                $php_timezone = 'America/Denver';
                break;
            case 'MST':
                $php_timezone = 'America/Phoenix';
                break;
            case 'PST8PDT':
                $php_timezone = 'America/Los_Angeles';
                break;
            case 'PST':
                $php_timezone = 'America/Dawson_Creek';
                break;
            case 'AKST9AKDT':
                $php_timezone = 'America/Anchorage';
                break;
            case 'NZST-12NZDT':
                $php_timezone = 'Pacific/Auckland';
                break;
            case 'AEST':
                $php_timezone = 'Australia/Brisbane';
                break;
            case 'AEST-10AEDT':
                $php_timezone = 'Australia/Sydney';
                break;
            case 'ACST':
                $php_timezone = 'Australia/Darwin';
                break;
            case 'ACST-930ACDT':
                $php_timezone = 'Australia/Adelaide';
                break;
            case 'AWST':
                $php_timezone = 'Australia/Perth';
                break;
            case 'PGT':
                $php_timezone = 'Pacific/Port_Moresby';
                break;
            case 'FJT':
                $php_timezone = 'Pacific/Fiji';
                break;
            default:
                $php_timezone = $timezone;
                break;
        }

        return $php_timezone;
    }

    public static function setTimezone($zone = null)
    {
        if (is_null($zone) || $zone == '') {
            $zone = config('fxp.site_timezone');
        }

        $zone = self::getPhpTimezone($zone);
        date_default_timezone_set($zone);
    }

}