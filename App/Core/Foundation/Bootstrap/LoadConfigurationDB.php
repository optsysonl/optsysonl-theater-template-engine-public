<?php

namespace App\Core\Foundation\Bootstrap;

use App\Core\Config;
use App\Core\Foundation\Application;
use Symfony\Component\HttpFoundation\Request;
use App\Models\Configuration;
use App\Core\Cache;
use App\Helpers\SiteHelper;

class LoadConfigurationDB
{
    /**
     * Bootstrap the given application.
     *
     * @param Application $app
     *
     * @return void
     * @throws \Exception
     */
    public function bootstrap(Application $app)
    {
        $items = config()->all();

        $app->instance('config', $config = new Config($items));

        $this->loadFxpConfigurationDatabase($app, $config);
    }

    /**
     * Load the configuration items from all of the database.
     *
     * @param  Application $app
     * @param  Config      $config
     *
     * @return void
     * @throws \Exception
     */
    protected function loadFxpConfigurationDatabase(Application $app, Config $config)
    {
        $request = Request::createFromGlobals();
        $host = $request->getHost();

        // developer test data
        if (config('developer.init.on')) {
            $this->loadDevelopConfig($config, $request);
            return;
        }

        $cacheItem = Cache::getItem('configuration');
        if (!Cache::isHit($cacheItem)) {
            $mConfig = new Configuration();
            $configData = $mConfig->getConfigData($host);

            $configData['site_timezone'] = $mConfig->getTimezone($configData['site_id']);
            $configData['site_language'] = $mConfig->getLanguage($configData['language_id']);
            $configData['debug'] = false;

            if($configData['demourl'] == $host){
                $configData['debug'] = true;
                $cacheItem->expiresAfter(Cache::TIME20SEC);
            }else{
                $cacheItem->expiresAfter(Cache::TIME7DAY);
            }

            $cacheItem->set($configData);
            Cache::save($cacheItem);
        } else {
            $configData = $cacheItem->get();
        }

        if ($configData) {
            $config->set('fxp', $configData);
            SiteHelper::mergeSiteConfig();
        } else {
            throw new \Exception('Website has not been configured properly.');
        }
    }

    protected function loadDevelopConfig(Config $config, $request) {
        $configName = config('developer.init.config');
        $configPath = config('developer.init.path') . "config-{$configName}.json";

        $developer = array_merge(['on' => true], config("developer.{$configName}", []));
        $config->set('developer', $developer);
        //fetch the config
        $configData = @file_get_contents($configPath);
        if ($configData) {
            $configData = json_decode($configData, true);
            $configData['site_url'] = $request->getHost();
            $config->set('fxp', $configData);
        } else {
            throw new \Exception('Website has not been configured properly.');
        }
    }
}