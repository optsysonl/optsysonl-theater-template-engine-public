<?php 

 /** Required Files **/
require_once $includes_dir.'/inc.config.php';
$config = new Config();

if( @$config->getConfig('debug') ) {
    error_reporting(E_ALL & ~E_NOTICE);
    ini_set('display_errors', 1);
}

require_once $includes_dir.'/inc.meta.php';
require_once $includes_dir.'/inc.build.php';
require_once $includes_dir.'/inc.fix.php';
require_once $includes_dir.'/inc.router.php';
$router = new Router();
require_once $includes_dir.'/inc.db.php';
ConnDB();
require_once $includes_dir.'/vendor/autoload.php';
require_once $includes_dir.'/inc.query.php';

//require_once $includes_dir.'/inc.lib.validation.php';
//require_once $includes_dir.'/inc.lib.mail.php';

setTimezone($config->getConfig('site_timezone'));

//helpful variables
$today = setTodayDate();

$ticketing = true;
$data=array();

if( @$config->getConfig('debug') ){
    // Set all CACHE to 20 sec
    $cache_time['5min']		= 20;
    $cache_time['1hr'] 		= 20;
    $cache_time['4hrs'] 	= 20;
    $cache_time['6hrs'] 	= 20;
    $cache_time['12hrs'] 	= 20;
    $cache_time['1day'] 	= 20;
    $cache_time['7day'] 	= 20;
}else{
    $cache_time['5min']		= 60*5;
    $cache_time['1hr'] 		= 60*60;
    $cache_time['4hrs'] 	= 60*60 * 4;
    $cache_time['6hrs'] 	= 60*60 * 6;
    $cache_time['12hrs'] 	= 60*60 * 12;
    $cache_time['1day'] 	= 60*60 * 24;
    $cache_time['7day'] 	= 60*60 * 24 *7;
}
