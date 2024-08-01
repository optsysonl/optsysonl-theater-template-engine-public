<?php

use App\Core\Container\Container;
use App\Core\View;

if (! function_exists('app')) {
    /**
     * Get the available container instance.
     *
     * @param  string $build
     * @param  array  $parameters
     *
     * @return mixed|\App\Core\Foundation\Application
     */
    function app($build = null, array $parameters = [])
    {
        if (is_null($build)) {
            return Container::getInstance();
        }
        
        return Container::getInstance()->build($build, $parameters);
    }
}

if (!function_exists('view_path')) {
    /**
     * Get the path to the view folder.
     *
     * @param  string $template
     *
     * @return string
     */
    function view_path($template = 'mm4')
    {
        return app()->viewPath() . DIRECTORY_SEPARATOR . $template;
    }
}

if (!function_exists('config')) {
    /**
     * Get / set the specified configuration value.
     *
     * If an array is passed as the key, we will assume you want to set an array of values.
     *
     * @param  array|string $key
     * @param  mixed        $default
     *
     * @return mixed|\App\Core\Config
     */
    function config($key = null, $default = null)
    {
        if (is_null($key)) {
            return app('config');
        }
        
        if (is_array($key)) {
            return app('config')->set($key);
        }
        
        return app('config')->get($key, $default);
    }
}

if (!function_exists('view')) {
    /**
     * Get the evaluated view contents for the given view.
     *
     * @param  string $view
     * @param  array  $data
     *
     * @return \App\Core\View
     */
    function view($view, $data = [])
    {
        $params = [
            'view' => $view,
            'data' => $data
        ];
        
        return app(View::class, $params)->render();
    }
}