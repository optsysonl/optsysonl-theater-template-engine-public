<?php

//error_reporting(E_ALL);
//ini_set('display_errors', 1);
//$rustart = getrusage();
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_DIR', dirname(dirname(__FILE__)));
define('CACHE_TIMEOUT', 5.5);
/**
 * Composer
 */
require_once ROOT_DIR . DS . 'includes' . DS . 'vendor' . DS . 'autoload.php';

/**
 * Cache
 */
App\Core\Cache::init();

/**
 * Application
 */
$app = new App\Core\Foundation\Application(ROOT_DIR);


/**
 * Cache Template Variables
 */
App\Core\Cache::initTemplVariables();

use Symfony\Component\Debug\Debug;

$debug    = config('fxp.debug', false);
if ( $debug ) {
    Debug::enable();
}

/**
 * Routing
 */
$app->build('router')->run();

//$ru = getrusage();
//echo "<!-- This process used " . rutime($ru, $rustart, "utime") . " ms for its computations-->\n";
//echo "<!-- It spent " . rutime($ru, $rustart, "stime") .  " ms in system calls-->\n";
function rutime($ru, $rus, $index) {
    return ($ru["ru_$index.tv_sec"]*1000 + intval($ru["ru_$index.tv_usec"]/1000))
        -  ($rus["ru_$index.tv_sec"]*1000 + intval($rus["ru_$index.tv_usec"]/1000));
}