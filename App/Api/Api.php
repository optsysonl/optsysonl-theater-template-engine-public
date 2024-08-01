<?php

namespace App\Api;

use App\Core\Controller;
use App\Models\Configuration;
use Symfony\Component\HttpFoundation\Request;


abstract class Api extends Controller
{
    public function __construct(array $parameters)
    {
        $request = Request::createFromGlobals();
        $host = $request->getHost();

        $confApiKey  = config('fxp.api_key');
        $paramApiKey = (isset($parameters['api_key']) ? $parameters['api_key'] : null);
        if ($confApiKey) {
            if ($confApiKey != $paramApiKey) {
                $mConfig = new Configuration();
                $dbApiKey = $mConfig->getApiKey($host);
                if ($dbApiKey != $paramApiKey) {
                    die('Access to API is forbidden.');
                }
            }
        } else {
            die('Config api_key not found. API cannot be used.');
        }
        
        unset($parameters['api_key']);
        
        parent::__construct($parameters);
    }
}