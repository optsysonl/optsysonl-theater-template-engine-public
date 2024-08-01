<?php

namespace App\Core;

use App\Controllers\Controller;
use App\Helpers\CSSMainHelper;
use App\Helpers\MetaHelper;

class Router
{
    /**
     * @var array Array of all routes (incl. named routes).
     */
    protected $routes = [];
    
    /**
     * @var array Array of all named routes.
     */
    protected $namedRoutes = [];
    
    /**
     * @var string Can be used to ignore leading part of the Request URL (if main file lives in subdirectory of host)
     */
    protected $basePath = '';
    
    /**
     * @var array Array of default match types (regex helpers)
     */
    protected $matchTypes = [
        'i'  => '[0-9]++',
        'a'  => '[0-9A-Za-z]++',
        'h'  => '[0-9A-Fa-f]++',
        '*'  => '.+?',
        '**' => '.++',
        ''   => '[^/\.]++',
    ];
    
    /**
     * Create router in one call from config.
     *
     * @param array  $routes
     * @param string $basePath
     * @param array  $matchTypes
     *
     * @throws \Exception
     */
    public function __construct($routes = [], $basePath = '', $matchTypes = [])
    {
        $this->addRoutes($routes);
        $this->setBasePath($basePath);
        $this->addMatchTypes($matchTypes);
    }
    
    /**
     * Retrieves all routes.
     * Useful if you want to process or display routes.
     * @return array All routes.
     */
    public function getRoutes()
    {
        return $this->routes;
    }
    
    /**
     * Add multiple routes at once from array in the following format:
     *
     *   $routes = array(
     *      array($method, $route, $target, $name)
     *   );
     *
     * @param array $routes
     *
     * @return void
     * @author Koen Punt
     * @throws \Exception
     */
    public function addRoutes($routes)
    {
        if (!is_array($routes) && !$routes instanceof \Traversable) {
            throw new \Exception('Routes should be an array or an instance of Traversable');
        }
        
        foreach ($routes as $route) {
            call_user_func_array([$this, 'map'], $route);
        }
    }
    
    /**
     * Set the base path.
     * Useful if you are running your application from a subdirectory.
     */
    public function setBasePath($basePath)
    {
        $this->basePath = $basePath;
    }
    
    /**
     * Add named match types. It uses array_merge so keys can be overwritten.
     *
     * @param array $matchTypes The key is the name and the value is the regex.
     */
    public function addMatchTypes($matchTypes)
    {
        $this->matchTypes = array_merge($this->matchTypes, $matchTypes);
    }
    
    /**
     * Map a route to a target
     *
     * @param string $method One of 5 HTTP Methods, or a pipe-separated list of multiple HTTP Methods (GET|POST|PATCH|PUT|DELETE)
     * @param string $route  The route regex, custom regex must start with an @. You can use multiple pre-set regex filters, like [i:id]
     * @param mixed  $target The target where this route should point to. Can be anything.
     * @param string $name   Optional name of this route. Supply if you want to reverse route this url in your application.
     *
     * @throws \Exception
     */
    public function map($method, $route, $target, $name = null)
    {
        $this->routes[] = [$method, $route, $target, $name];
        
        if ($name) {
            if (isset($this->namedRoutes[$name])) {
                throw new \Exception("Can not redeclare route '{$name}'");
            } else {
                $this->namedRoutes[$name] = $route;
            }
        }
        
        return;
    }
    
    /**
     * Reversed routing
     *
     * Generate the URL for a named route. Replace regexes with supplied parameters
     *
     * @param string $routeName The name of the route.
     * @param        array      @params Associative array of parameters to replace placeholders with.
     *
     * @return string The URL of the route with named parameters in place.
     * @throws \Exception
     */
    public function generate($routeName, array $params = [])
    {
        // Check if named route exists
        if (!isset($this->namedRoutes[$routeName])) {
            throw new \Exception("Route '{$routeName}' does not exist.");
        }
        
        // Replace named parameters
        $route = $this->namedRoutes[$routeName];
        
        // prepend base path to route url again
        $url = $this->basePath . $route;
        
        if (preg_match_all('`(/|\.|)\[([^:\]]*+)(?::([^:\]]*+))?\](\?|)`', $route, $matches, PREG_SET_ORDER)) {
            
            foreach ($matches as $match) {
                list($block, $pre, $type, $param, $optional) = $match;
                
                if ($pre) {
                    $block = substr($block, 1);
                }
                
                if (isset($params[$param])) {
                    $url = str_replace($block, $params[$param], $url);
                } elseif ($optional) {
                    $url = str_replace($pre . $block, '', $url);
                }
            }
        }
        
        return $url;
    }
    
    /**
     * Match a given Request Url against stored routes
     *
     * @param string $requestUrl
     * @param string $requestMethod
     *
     * @return array|boolean Array with route information on success, false on failure (no match).
     */
    public function match($requestUrl = null, $requestMethod = null)
    {
        $params = [];
        $match  = false;
        
        // set Request Url if it isn't passed as parameter
        if ($requestUrl === null) {
            $requestUrl = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
        }
        
        // strip base path from request url
        $requestUrl = substr($requestUrl, strlen($this->basePath));
        
        // Strip query string (?a=b) from Request Url
        //if (($strpos = strpos($requestUrl, '?')) !== false) {
        //    $requestUrl = substr($requestUrl, 0, $strpos);
        //}

        //Ignore query parameters that are not needed for operations (for example Anaylitics tags, AdWords tags, FB tags, etc)
        $ignore_query_vars=['fbclid', 'click_id', 'gclid', 'utm_[a-zA-Z0-9][^&#]*', '_ga' ];
        foreach ($ignore_query_vars as $variable) {
            $pattern = '/(?:'.$variable.')=([a-zA-Z0-9][^&#]*)/m';
            if(preg_match_all($pattern, $requestUrl, $matched_parts)){
                $remove = $matched_parts[0];
                $requestUrl = str_replace($remove, "", $requestUrl);
            }
        }

        if(substr($requestUrl, -1) == '&'){
            $requestUrl = str_replace('&', "", $requestUrl);
        }

        // if last character is "?" - igrnore it
        if(substr($requestUrl, -1) == '?'){
            $requestUrl = str_replace('?', "", $requestUrl);
        }

        // set Request Method if it isn't passed as a parameter
        if ($requestMethod === null) {
            $requestMethod = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
        }
        
        foreach ($this->routes as $handler) {
            list($methods, $route, $target, $name) = $handler;
            
            $method_match = (stripos($methods, $requestMethod) !== false);
            
            // Method did not match, continue to next route.
            if (!$method_match) {
                continue;
            }
            
            if ($route === '*') {
                // * wildcard (matches all)
                $match = true;
            } elseif (isset($route[0]) && $route[0] === '@') {
                // @ regex delimiter
                $pattern = '`' . substr($route, 1) . '`u';
                $match   = preg_match($pattern, $requestUrl, $params) === 1;
            } elseif (($position = strpos($route, '[')) === false) {
                // No params in url, do string comparison
                $match = strcmp($requestUrl, $route) === 0;
            } else {
                // Compare longest non-param string with url
                if (strncmp($requestUrl, $route, $position) !== 0) {
                    continue;
                }
                $regex = $this->compileRoute($route);
                $match = preg_match($regex, $requestUrl, $params) === 1;
            }
            
            if ($match) {
                if ($params) {
                    foreach ($params as $key => $value) {
                        if (is_numeric($key)) {
                            unset($params[$key]);
                        }
                    }
                }
                
                return [
                    'target' => $target,
                    'params' => $params,
                    'name'   => $name,
                ];
            }
        }
        
        return false;
    }
    
    /**
     * Compile the regex for a given route (EXPENSIVE)
     */
    private function compileRoute($route)
    {
        if (preg_match_all('`(/|\.|)\[([^:\]]*+)(?::([^:\]]*+))?\](\?|)`', $route, $matches, PREG_SET_ORDER)) {
            $matchTypes = $this->matchTypes;
            foreach ($matches as $match) {
                list($block, $pre, $type, $param, $optional) = $match;
                
                if (isset($matchTypes[$type])) {
                    $type = $matchTypes[$type];
                }
                if ($pre === '.') {
                    $pre = '\.';
                }
                
                //Older versions of PCRE require the 'P' in (?P<named>)
                $pattern = '(?:' . ($pre !== '' ? $pre : null) . '(' . ($param !== '' ? "?P<$param>" : null) . $type . '))' . ($optional !== '' ? '?' : null);
                
                $route = str_replace($block, $pattern, $route);
            }
        }

        return "`^$route$`u";
    }
    
    /**
     * Convert the string with hyphens to StudlyCaps,
     * e.g. post-authors => PostAuthors
     *
     * @param string $string The string to convert
     *
     * @return string
     */
    protected function convertToStudlyCaps($string)
    {
        return str_replace(' ', '', ucwords(str_replace('-', ' ', $string)));
    }
    
    /**
     * Convert the string with hyphens to camelCase,
     * e.g. add-new => addNew
     *
     * @param string $string The string to convert
     *
     * @return string
     */
    protected function convertToCamelCase($string)
    {
        return lcfirst($this->convertToStudlyCaps($string));
    }
    
    protected function getNamespace($namespaceType = 'controller')
    {
        switch ($namespaceType) {
            case 'api':
                $namespace = 'App\Api\\';
                break;
            case 'local':
                $template     = config('fxp.template_name');
                $file = view_path($template). DS . 'app_local' . DS . 'autoload.php';

                if (file_exists($file)) {
                    require_once $file;
                } else {
                    throw new \Exception("File:$file' not found");
                }

                $namespace = 'templates\\'.$template.'\app_local\Controllers\\';
                break;
            default:
                $namespace = 'App\Controllers\\';
        }
        
        return $namespace;
    }
    
    public function run()
    {
        $match = $this->match();
        if ($match && isset($match['target']) && is_callable($match['target'])) {
            $mapping  = call_user_func_array($match['target'], $match['params']);
//            echo '<pre>' . print_r($mapping, true) . '</pre>'; exit;
            $type     = (isset($mapping['type']) ? $mapping['type'] : null);
            $filename = (isset($mapping['filename']) ? $mapping['filename'] : null);
            $action   = (isset($mapping['action']) ? $mapping['action'] : 'index');
            unset($mapping['type'], $mapping['filename'], $mapping['action']);
            $params = $mapping;
            switch ($type) {
                case 'page':
                    $this->runPage($filename, $params);
//                    $this->handlerRoute('controller', $filename, $action, $params);
                    break;
                case 'ajax':
                    $this->handlerRoute('ajax', 'ajax', $filename, $params);
                    break;
                case 'api':
                    $this->handlerRoute('api', $filename, $action, $params);
                    break;
                case 'local_controller':
                    $this->handlerRoute('local', $filename, $action, $params);
                    break;
                case 'xml':
                    header( 'X-Robots-Tag: noindex, follow', true );
                    header('Content-Type: text/xml; charset=utf-8');
                    $this->handlerRoute('controller', $filename, $action, $params);
                    break;
                case 'css':
                    $this->handlerRouteTypeCss($filename);
                    break;
                case 'js':
                    $this->handlerRouteTypeJs($filename);
                    break;
                case 'img':
                    $this->handlerRouteTypeImg($filename);
                    break;
                case 'file':
                    $this->handlerRouteTypeFile($filename);
                    break;
                case 'fonts':
                    $this->handlerRouteTypeFonts($filename);
                    break;
                case 'redirect':
                    $this->handlerRouteRedirect($params, $action);
                    break;
                default:
                    // route type not handled
                    throw new \Exception('Route Type not undefined.', 404);
            }
        } else {
            // no matches in list routes
            $this->handlerRoute('controller', 'pages', 'error404');
        }
    }
    
    private function runPage($view, $params)
    {
        (new Controller($view, $params))->run();
    }
    
    private function handlerRoute($namespaceType, $controller, $action, $params = [])
    {
        $controller = $this->convertToStudlyCaps($controller);
        $controller = str_replace('/', '\\',$this->getNamespace($namespaceType)) . $controller . 'Controller';
        if (class_exists($controller)) {
            $objController = new $controller($params);
            $action = $this->convertToCamelCase($action);
            if (method_exists($objController, $action)) {
                // remove system param api_key
                unset($params['api_key']);
                
                $objController->{$action}(...array_values($params));
            } else {
                throw new \Exception("Method '{$action}' in controller '{$controller}' not found");
            }
        } else {
            throw new \Exception("Class '{$controller}' not found");
        }
    }
    
    private function handlerRouteTypeCss($filename)
    {
        $css = new CSSMainHelper($filename);
        $css->process();
    }
    
    private function handlerRouteTypeJs($filename)
    {
        $template     = config('fxp.template_name');
        require_once view_path($template) . DS . 'assets/js/' . $filename;
    }

    private function handlerRouteTypeImg($filename)
    {
        $template     = config('fxp.template_name');
        $image        = view_path($template) . DS . 'assets/img/' . $filename;
        if (file_exists($image)) {
            //Set the content-type header as appropriate
            $file_type = MetaHelper::my_mime_type($image);
            header('Content-Type: ' . $file_type);

            // Set the content-length header
            header('Content-Length: ' . filesize($image));

            // Write the image bytes to the client
            readfile($image);
        }
    }
    
    private function handlerRouteTypeFile($filename)
    {
        $template     = config('fxp.template_name');
        $file        = view_path($template) . DS . 'assets/files/' . $filename;
        if (file_exists($file)) {
            //Set the content-type header as appropriate
            $file_type = MetaHelper::my_mime_type($file);
            header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
            header("Cache-Control: public"); // needed for internet explorer
            header('Content-Type: ' . $file_type);
            header("Content-Transfer-Encoding: Binary");
            header("Content-Length:" . filesize($file));

            // Write the image bytes to the client
            readfile($file);
        }
    }

    private function handlerRouteTypeFonts($filename)
    {
        $template     = config('fxp.template_name');
        $font        = view_path($template) . DS . 'assets/fonts/' . $filename;
        if (file_exists($font)) {
            //Set the content-type header as appropriate
            $file_type = MetaHelper::my_mime_type($font);
            header('Content-Type: ' . $file_type);

            // Set the content-length header
            header('Content-Length: ' . filesize($font));

            // Write the font bytes to the client
            readfile($font);
        }
    }

    private function handlerRouteRedirect($filename, $action)
    {
        switch($filename){
            case '301':
                header('HTTP/1.1 301 Moved Permanently');
                break;
            case '302':
                header('HTTP/1.1 302 Found');
                break;
            default:
        }

        header('Location: '.$action);
    }
}
