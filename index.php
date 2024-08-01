<?php

die('Close Old Engine');

//error_reporting(E_ALL);
//ini_set('display_errors', 1);

//start the session
session_start();

// Script start
$rustart = getrusage();

//Initialize

$includes_dir = dirname(__FILE__) . '/includes/';
require_once $includes_dir . 'autoload.php';


$template_dir = dirname(__FILE__) . '/templates/' . $config->getConfig('template') . '/';

$pages_dir = $includes_dir . "/pages/";

$views_dir = dirname(__FILE__) . '/templates/' . $config->getConfig('template') . '/views/';

$cache_dir = dirname(__FILE__) . '/cache';
$cache_var_dir = $cache_dir . '/var';
$cache_tpl_dir = $cache_dir . '/tpl';


use Symfony\Component\Cache\Adapter\FilesystemAdapter;
$cache = new FilesystemAdapter($config->getSiteURL(), 600, $cache_var_dir);

/******** MAP THE PAGES **********/
require_once $includes_dir . 'mapping.php';
require_once $includes_dir . 'mapping-run.php';
/******** MAP THE PAGES(end) **********/



// Script end
discDB();

if( @$config->getConfig('debug') ) {
    $ru = getrusage();
    function rutime($ru, $rus, $index) {
        return ($ru["ru_$index.tv_sec"]*1000 + intval($ru["ru_$index.tv_usec"]/1000))
            -  ($rus["ru_$index.tv_sec"]*1000 + intval($rus["ru_$index.tv_usec"]/1000));
    }

    echo "<!-- " . $config->getConfig('template') . " -->\n";
    echo "<!-- This process used " . rutime($ru, $rustart, "utime") . " ms for its computations-->\n";
    echo "<!-- It spent " . rutime($ru, $rustart, "stime") . " ms in system calls-->\n";
}

