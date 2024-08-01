<?php

namespace App\Core;

/**
 * Base controller
 */
abstract class Controller
{
    /**
     * The parameters from the matched route
     * @var array
     */
    protected $params;
    
    /**
     * The filename in template
     * @var string
     */
    protected $view;
    
    /**
     * @param string $view
     * @param array  $params
     */
    public function __construct($view, $params = [])
    {
        $this->view   = $view;
        $this->params = $params;
    }
}