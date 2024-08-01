<?php

namespace App\Core;

use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\CacheItem;

use App\Core\Constants\Seconds;
use Symfony\Component\HttpFoundation\Request;

class Cache implements Seconds {
    private static $cache = null;
    private static $cache_item_key_prefix = null;
    private static $cache_var_dir = null;
    private static $cache_tpl_dir = null;
    private static $cache_create = true;
    private static $cache_starttime;

    /**
     * @param string $cache_dir
     */
    public static function init($cache_dir = 'cache')
    {
        $request = Request::createFromGlobals();
        $site_url = $request->getHost();

        if (!self::$cache) {
            self::$cache_item_key_prefix = md5($site_url) . '_';
            self::$cache_var_dir = ROOT_DIR . DS . $cache_dir . DS . 'var';
            self::$cache = new FilesystemAdapter($site_url, 600, self::$cache_var_dir);
        }
    }

    /**
     * @param string $cache_dir
     */
    public static function initTemplVariables($cache_dir = 'cache')
    {
        self::setCreateCache();
        if (self::$cache) {
            self::$cache_tpl_dir = ROOT_DIR . DS . $cache_dir . DS . 'tpl' . DS . config('fxp.template_name');
        }
    }
    /**
     * @param string $key
     *
     * @return CacheItem
     */
    public static function getItem($key)
    {
        $key = self::getItemKey($key);

        return self::$cache->getItem($key);
    }

    private static function getItemKey($key)
    {
        return self::$cache_item_key_prefix . $key;
    }
    
    public static function deleteItem($key)
    {
        $key = self::getItemKey($key);

        return self::$cache->deleteItem($key);
    }
    
    /**
     * @param CacheItem $cacheItem
     *
     * @return bool
     */
    public static function isHit(CacheItem $cacheItem)
    {
        $debug    = config('fxp.debug', false);
        if (!$debug) {
            return $cacheItem->isHit();
        }else{
            return false;
        }
    }
    
    public static function save(CacheItem $cacheItem)
    {
        self::$cache->save($cacheItem);
    }
    
    public static function getTemplateDir()
    {
        return self::$cache_tpl_dir;
    }
    
    public static function clear()
    {
        // Cache VAR clear
        self::$cache->clear();
        self::$cache->prune();

        // Cache TPL clear (Clears the internal template cache. clearCacheFiles() deprecated)
        foreach (
            new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator(
                    self::$cache_tpl_dir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            ) as $file
        ) {
            if ($file->isFile()) {
                @unlink($file->getPathname());
            }
        }
    }

    /**
     * @return null
     */
    public static function setCreateCache(Bool $val = true)
    {
        self::$cache_create = $val;
    }

    /**
     * @return cache_create
     */
    public static function getCreateCache()
    {
        $tmp_time = microtime(true) - self::getStartTime();
        if ($tmp_time > CACHE_TIMEOUT ){
            self::setCreateCache(false);
            return false;
        }else{
            return self::$cache_create;
        }
    }

    /**
     * @return null
     */
    public static function setStartTime($val)
    {
        self::$cache_starttime = $val;
    }

    /**
     * @return $cache_starttime
     */
    public static function getStartTime()
    {
        return self::$cache_starttime;
    }
}