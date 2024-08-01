<?php

namespace App\Core\Foundation\Bootstrap;

use App\Core\Foundation\Application;
use App\Core\Router;

class LoadRoutes
{
    /**
     * Bootstrap the given application.
     *
     * @param \App\Core\Foundation\Application $app
     *
     * @return void
     * @throws \Exception
     */
    public function bootstrap(Application $app)
    {
        // TODO: load routes from cache
        
        $app->instance('router', $router = new Router());
        
        $this->loadRoutesFiles($app, $router);
    }
    
    /**
     * Load the configuration items from all of the files.
     *
     * @param  \App\Core\Foundation\Application $app
     * @param  \App\Core\Router                 $router
     *
     * @return void
     * @throws \Exception
     */
    protected function loadRoutesFiles(Application $app, Router $router)
    {
        $debug    = config('fxp.debug', false);
        if ($debug && $templ_routes2 = $this->loadTemplateRoutes('debug')){
            $router->addRoutes(require_once $templ_routes2);
        }

        if ($templ_routes = $this->loadTemplateRoutes()){
            $router->addRoutes(require_once $templ_routes);
        }

        $routesPath = realpath($app->routesPath());
        $router->addRoutes(require_once $routesPath);
    }

    /**
     * Load template specific routes
     *
     * @return string
     */
    protected function loadTemplateRoutes($name = 0) {
        $template     = config('fxp.template_name');
        $tmpl_routes = view_path($template) . DS . 'app_local' . DS . ($name ? 'routes-'.$name : 'routes') . '.php';
        if (file_exists($tmpl_routes)) {
            return $tmpl_routes;
        }
    }
}