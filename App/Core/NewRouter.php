<?php

namespace App\Core;

use Symfony\Component\Routing\Router as SymfonyRouter;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

class NewRouter extends SymfonyRouter
{
    /**
     * @var \Symfony\Component\Routing\RouteCollection
     */
    private $routes = null;
    
    public function __construct(Request $request, RouteCollection $collection = null)
    {
        $this->routes = new RouteCollection;
        
        //        $test = new Route('/test');
        //        $context = new RequestContext();
        //        $context->fromRequest(Request::createFromGlobals());
        //        echo '<pre>' . print_r($context, true) . '</pre>'; exit;
        //        if (!$collection) {
        //            $this->routeCollection = new RouteCollection();
        //        } else {
        //            $this->routeCollection = $collection;
        //        }
    }
    
    public function addCollection(RouteCollection $collection)
    {
        $this->addCollection($collection);
    }
    
    /**
     * Add a route to the underlying route collection.
     *
     * @param  array|string $methods
     * @param  string       $uri
     * @param  array|string $action
     *
     * @return \Symfony\Component\Routing\Route
     */
    protected function addRoute($methods, $uri, $action)
    {
        return $this->routes->add($this->createRoute($methods, $uri, $action));
    }
    
    /**
     * Create a new route instance.
     *
     * @param  array|string $methods
     * @param  string       $uri
     * @param  mixed        $action
     *
     * @return \Symfony\Component\Routing\Route
     */
    protected function createRoute($methods, $uri, $action)
    {
        $route = $this->newRoute($methods, $uri, $action);
        
        return $route;
    }
    
    /**
     * Create a new Route object.
     *
     * @param  array|string $methods
     * @param  string       $uri
     * @param  mixed        $action
     *
     * @return \Illuminate\Routing\Route
     */
    protected function newRoute($methods, $uri, $action)
    {
        return (new Route($methods, $uri, $action))->setContainer($this->container);
    }
}