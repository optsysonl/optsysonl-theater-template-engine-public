<?php

namespace App\Helpers;


class SiteHelper
{
    /*
     *  Merge config data with local site config on server
     *
     * @return void
     */
    public static function mergeSiteConfig()
    {

        $site_id=config('fxp.site_id');
        $config_sites_ids = config('sites') ? array_keys( config('sites')) : [];

        if (in_array($site_id, $config_sites_ids)) {

            $local_site_conf = config('sites.'.$site_id);
            foreach($local_site_conf as $key=>$value ){
                $new_result = self::array_merge_recursive_ex(config($key), $value);
                config([$key=>$new_result]);
            }
        }
    }

    private function array_merge_recursive_ex(array $array1, array $array2)
    {
        $merged = $array1;

        foreach ($array2 as $key => & $value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = self::array_merge_recursive_ex($merged[$key], $value);
            } else if (is_numeric($key)) {
                if (!in_array($value, $merged)) {
                    $merged[] = $value;
                }
            } else {
                $merged[$key] = $value;
            }
        }

        return $merged;
    }
}