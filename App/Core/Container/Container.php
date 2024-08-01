<?php

namespace App\Core\Container;

class Container
{
    /**
     * The current globally available container (if any).
     *
     * @var static
     */
    protected static $instance;
    
    /**
     * The container's shared instances.
     *
     * @var array
     */
    protected $instances = [];
    
    /**
     * The registered type aliases.
     *
     * @var array
     */
    protected $aliases = [];
    
    /**
     * Set the globally available instance of the container.
     *
     * @return static
     */
    public static function getInstance()
    {
        return static::$instance;
    }
    
    /**
     * Set the shared instance of the container.
     *
     * @param self $container
     *
     * @return void
     */
    public static function setInstance(self $container)
    {
        static::$instance = $container;
    }
    
    /**
     * Register an existing instance as shared in the container.
     *
     * @param  string $abstract
     * @param  mixed  $instance
     *
     * @return void
     */
    public function instance($abstract, $instance)
    {
        $this->instances[$abstract] = $instance;
    }
    
    /**
     * Instantiate a concrete instance of the given type.
     *
     * @param string $abstract
     * @param array  $parameters
     *
     * @return mixed|object
     * @throws
     */
    public function build($abstract, array $parameters = [])
    {
        $alias = $this->getAlias($abstract);
        
        if (isset($this->instances[$alias])) {
            return $this->instances[$alias];
        }
        
        $reflector = new \ReflectionClass($abstract);
        
        $constructor  = $reflector->getConstructor();
        if ($constructor) {
            $dependencies = $constructor->getParameters();
            $parameters   = $this->keyParametersByArgument($dependencies, $parameters);
            $args         = $this->getReflectionParameters($dependencies, $parameters);
            $object       = $reflector->newInstanceArgs($args);
        } else {
            $object = $reflector->newInstance();
        }
        
        return $object;
    }
    
    /**
     * If extra parameters are passed by numeric ID, rekey them by argument name.
     *
     * @param  array  $dependencies
     * @param  array  $parameters
     * @return array
     */
    protected function keyParametersByArgument(array $dependencies, array $parameters)
    {
        foreach ($parameters as $key => $value) {
            if (is_numeric($key)) {
                unset($parameters[$key]);
                
                $parameters[$dependencies[$key]->name] = $value;
            }
        }
        
        return $parameters;
    }
    
    /**
     * @param  array $parameters
     * @param  array $primitives
     *
     * @return array
     * @throws \InvalidArgumentException
     */
    protected function getReflectionParameters(array $parameters, array $primitives = [])
    {
        $dependencies = [];
        foreach ($parameters as $parameter) {
            $parameter_name = $parameter->getName();
            if (array_key_exists($parameter_name, $primitives)) {
                $dependencies[] = $primitives[$parameter_name];
            } elseif (!$parameter->isOptional()) {
                throw new \InvalidArgumentException("Parameter '{$parameter_name}' not found!");
            }
        }
        
        return (array) $dependencies;
    }
    
    /**
     * Get the alias for an abstract if available.
     *
     * @param  string $abstract
     *
     * @return string
     */
    protected function getAlias($abstract)
    {
        if (!isset($this->aliases[$abstract])) {
            return $abstract;
        }
        
        return $this->getAlias($this->aliases[$abstract]);
    }
}