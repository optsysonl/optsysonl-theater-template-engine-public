<?php

namespace App\Core\Http;

use App\Core\Support\Arr;
use App\Core\Support\Str;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class Request extends SymfonyRequest
{
    /**
     * Create a new HTTP request from server variables.
     *
     * @return \Symfony\Component\HttpFoundation\Request
     */
    public static function capture()
    {
        static::enableHttpMethodParameterOverride();
        
        return static::createFromBase(SymfonyRequest::createFromGlobals());
    }
    
    /**
     * Create an request from a Symfony instance.
     *
     * @param  \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \App\Core\Http\Request
     */
    public static function createFromBase(SymfonyRequest $request)
    {
        if ($request instanceof static) {
            return $request;
        }
        
        $content = $request->content;
        
        $request = (new static)->duplicate(
            
            $request->query->all(), $request->request->all(), $request->attributes->all(),
            
            $request->cookies->all(), $request->files->all(), $request->server->all());
        
        $request->content = $content;
        
        $request->request = $request->getInputSource();
        
        return $request;
    }
    
    /**
     * Get the input source for the request.
     *
     * @return \Symfony\Component\HttpFoundation\ParameterBag
     */
    protected function getInputSource()
    {
        if ($this->isJson()) {
            return $this->json();
        }
        
        return $this->getMethod() == 'GET' ? $this->query : $this->request;
    }
    
    /**
     * Determine if the request is sending JSON.
     *
     * @return bool
     */
    public function isJson()
    {
        return Str::contains($this->header('CONTENT_TYPE'), ['/json', '+json']);
    }
    
    /**
     * Get the JSON payload for the request.
     *
     * @param  string $key
     * @param  mixed  $default
     *
     * @return mixed
     */
    public function json($key = null, $default = null)
    {
        if (!isset($this->json)) {
            $this->json = new ParameterBag((array)json_decode($this->getContent(), true));
        }
        
        if (is_null($key)) {
            return $this->json;
        }
        
        return Arr::get($this->json->all(), $key, $default);
    }
    
    /**
     * Retrieve a header from the request.
     *
     * @param  string            $key
     * @param  string|array|null $default
     *
     * @return string|array
     */
    public function header($key = null, $default = null)
    {
        return $this->retrieveItem('headers', $key, $default);
    }
    
    /**
     * Retrieve a parameter item from a given source.
     *
     * @param  string            $source
     * @param  string            $key
     * @param  string|array|null $default
     *
     * @return string|array
     */
    protected function retrieveItem($source, $key, $default)
    {
        if (is_null($key)) {
            return $this->$source->all();
        }
        
        return $this->$source->get($key, $default, true);
    }
}