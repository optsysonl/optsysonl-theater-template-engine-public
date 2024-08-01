<?php

namespace App\Core\Foundation\Bootstrap;

use App\Core\Config;
use App\Core\Foundation\Application;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\HttpFoundation\Request;

class LoadConfiguration
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
        $items = [];
        
        $app->instance('config', $config = new Config($items));
        
        $this->loadConfigurationFiles($app, $config);
    }
    
    /**
     * Load the configuration items from all of the files.
     *
     * @param  Application $app
     * @param  Config      $config
     *
     * @return void
     */
    protected function loadConfigurationFiles(Application $app, Config $config)
    {
        foreach ($this->getConfigurationFiles($app) as $key => $path) {
            $config->set($key, require $path);
        }
    }
    
    /**
     * Get all of the configuration files for the application.
     *
     * @param  Application $app
     *
     * @return array
     */
    protected function getConfigurationFiles(Application $app)
    {
        $files = [];
        
        $configPath = realpath($app->configPath());
        
        foreach (Finder::create()->files()->name('*.php')->in($configPath) as $file) {
            $nesting = $this->getConfigurationNesting($file, $configPath);
            
            $files[$nesting . basename($file->getRealPath(), '.php')] = $file->getRealPath();
        }
        
        return $files;
    }
    
    /**
     * Get the configuration file nesting path.
     *
     * @param  SplFileInfo $file
     * @param  string      $configPath
     *
     * @return string
     */
    protected function getConfigurationNesting(SplFileInfo $file, $configPath)
    {
        $directory = dirname($file->getRealPath());
        
        if ($tree = trim(str_replace($configPath, '', $directory), DIRECTORY_SEPARATOR)) {
            $tree = str_replace(DIRECTORY_SEPARATOR, '.', $tree) . '.';
        }
        
        return $tree;
    }
    
    /**
     * Load the configuration items from all of the files.
     *
     * @param  Application $app
     * @param  Config $config
     *
     * @return void
     * @throws \Exception
     */
    protected function loadFxpConfigurationFile(Application $app, Config $config)
    {
        $request = Request::createFromGlobals();

        $configPath = 'http://filmsxpress.com/config/' . $request->getHost() . '.txt';

        // developer test data
        if (config('developer.init.on')) {
            $this->loadDevelopConfig($config, $request);
            return;
        }

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