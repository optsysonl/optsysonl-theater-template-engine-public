<?php

namespace App\Core\Foundation;

use App\Core\Container\Container;
use App\Helpers\TimeZoneHelper;

class Application extends Container
{

	/**
	 * The database connection.
	 *
	 * @var \PDO
	 */
	protected $connection=false;

    /**
     * The base path.
     *
     * @var string
     */
    protected $basePath;
    
    /**
     * Create a new application instance.
     *
     * @param  string|null $basePath
     *
     * @throws \Exception
     */
    public function __construct($basePath = null)
    {
        // register application container
        $this->registerBaseBindings();
        
        // register aliases
        $this->registerCoreContainerAliases();
        
        if ($basePath) {
            $this->setBasePath($basePath);
        }
        
        // bootstrap
        $this->build('App\Core\Foundation\Bootstrap\LoadConfiguration')->bootstrap($this);
		$this->build('App\Core\Foundation\Bootstrap\LoadConfigurationDB')->bootstrap($this);
        $this->build('App\Core\Foundation\Bootstrap\LoadRoutes')->bootstrap($this);

        TimeZoneHelper::setTimezone(config('fxp.site_timezone', 'America/New_York'));
        mb_internal_encoding('UTF-8');
    }
    
    /**
     * Register the core class aliases in the container.
     *
     * @return void
     */
    public function registerCoreContainerAliases()
    {
        $aliases = [
            'app'    => 'App\Core\Foundation\Application',
            'cache'  => 'App\Core\Cache',
            'config' => 'App\Core\Config',
            'router' => 'App\Core\Router',
            'view'   => 'App\Core\View',
        ];
        
        foreach ($aliases as $key => $alias) {
            $this->alias($key, $alias);
        }
    }
    
    /**
     * Register the basic bindings into the container.
     *
     * @return void
     */
    protected function registerBaseBindings()
    {
        static::setInstance($this);
        
        $this->instance('app', $this);
        
        $this->instance('App\Core\Container\Container', $this);
    }
    
    /**
     * Set the base path for the application.
     *
     * @param  string $basePath
     *
     * @return $this
     */
    public function setBasePath($basePath)
    {
        $this->basePath = rtrim($basePath, '\/');
        
        return $this;
    }
    
    /**
     * Get the base path.
     *
     * @return string
     */
    public function basePath()
    {
        return $this->basePath;
    }
    
    /**
     * Get the path to the application "App" directory.
     *
     * @return string
     */
    public function path()
    {
        return $this->basePath . DIRECTORY_SEPARATOR . 'App';
    }
    
    /**
     * Get the path to the application configuration files.
     *
     * @return string
     */
    public function configPath()
    {
        return $this->path() . DIRECTORY_SEPARATOR . 'Config';
    }
    
    /**
     * Get the path to the application routes files.
     *
     * @return string
     */
    public function routesPath()
    {
        return $this->path() . DIRECTORY_SEPARATOR . 'routes.php';
    }
    
    /**
     * Get the path to the application view files.
     *
     * @return string
     */
    public function viewPath()
    {
        return $this->path() . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'templates';
    }
    
    /**
     * Create a new object instance
     *
     * @param object $object
     *
     * @return void
     */
    public function bootstrap(object $object)
    {
        $object->bootstrap($this);
    }
    
    /**
     * Alias a type to a different name.
     *
     * @param  string $abstract
     * @param  string $alias
     *
     * @return void
     */
    public function alias($abstract, $alias)
    {
        $this->aliases[$alias] = $abstract;
    }

	public function setConnection($connection)
	{
		$this->connection = $connection;
    }

	public function getConnection()
	{
		return $this->connection;
	}

}