<?php

// For Reference: http://altorouter.com/usage/mapping-routes.html

$routes = [];

// page Home
$routes['home'] = ['GET', '/', function () {
    return [
        'type'     => 'page',
        'filename' => 'home',
    ];
}];

// page Locations
$routes[] = ['GET', '/locations', function () {
    return [
        'type'     => 'page',
        'filename' => 'locations',
    ];
}];

// page Location
$routes[] = ['GET', '/location/[i:id]/[*:cinema]', function($id, $cinema) {
    return [
        'type'     => 'page',
        'filename' => 'location',
        'house_id' => $id,
    ];
}];

// page Movies
$routes[] = ['GET', '/movies', function () {
    return [
        'type'     => 'page',
        'filename' => 'movies',
    ];
}];

// page Movie
$routes[] = ['GET', '/movie/[i:id]/[*:movie]?', function($id) {
    return [
        'type'     => 'page',
        'filename' => 'movie',
        'movie_id' => $id,
    ];
}];

// page Pages
$routes[] = ['GET', '/page/[i:id]/[*:page]?', function($id) {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => $id,
    ];
}];


// Mobile APP routes
$routes['app-prices'] = ['GET', '/app/prices/[i:id]', function($id) {
    return [
        'type'     => 'page',
        'filename' => 'app/prices',
        'house_id' => $id,
    ];
}];

$routes['app-middleware-prices'] = ['GET', '/app/prices/m-[i:mid]', function($mid) {
    return [
        'type'     => 'page',
        'filename' => 'app/prices',
        'params'    => array('middleware_id' => $mid),
    ];
}];

$routes['app-pages'] = ['GET', '/app/page/[i:id]', function ($id) {
    return [
        'type'     => 'page',
        'filename' => 'app/page',
        'page_id' => $id
    ];
}];

// xml page SiteMap
$routes['sitemap'] = ['GET', '/sitemap', function () {
    return [
        'type'      => 'xml',
        'filename'  => 'sitemap',
        'page'      => 'index',
    ];
}];

// xml page SiteMap
$routes['sitemaps-xml'] = ['GET', '/sitemap/[*:file].xml', function ($file) {
    return [
        'type'      => 'xml',
        'filename'  => 'sitemap',
        'page'      => $file,
    ];
}];

// xml page SiteMap
$routes['sitemaps-xsl'] = ['GET', '/sitemap/[*:file].xsl', function ($file) {
    return [
        'type'      => 'xml',
        'filename'  => 'sitemap',
        'page'      => $file,
    ];
}];

// CSS
$routes[] = ['GET', '/assets/css/[*:file].css', function($file) {
    return [
        'type'     => 'css',
        'filename' => $file,
    ];
}];

// Fonts
$routes[] = ['GET', '/assets/fonts/[*:file]', function($file) {
    return [
        'type'     => 'fonts',
        'filename' => $file,
    ];
}];

// JS
$routes[] = ['GET', '/assets/js/[*:file]', function ($file) {
    return [
        'type'     => 'js',
        'filename' => $file,
    ];
}];

// IMG
$routes[] = ['GET', '/assets/img/[*:file]', function ($file) {
    return [
        'type'     => 'img',
        'filename' => $file,
    ];
}];

// File
$routes[] = ['GET', '/assets/files/[*:file]', function ($file) {
    return [
        'type'     => 'file',
        'filename' => $file,
    ];
}];

$routes[] = ['GET', '/ajax_loader[/]?[*:class]?', function($class = null) {
    return [
        'type'     => 'ajax',
        'filename' => 'loader',
        'class'    => $class,
    ];
}];

$routes[] = ['GET', '/trailer/[*:file]', function($file) {
    return [
        'type'     => 'ajax',
        'filename' => 'trailer',
        'file'     => urldecode($file),
    ];
}];

$routes['robotsfile'] = ['GET', '/robots.txt', function(){
    return [
        'type'      => 'page',
        'filename'  => 'robots'
    ];
}];

$routes['adsfile'] = ['GET', '/ads.txt', function(){
    return [
        'type'      => 'file',
        'filename'  => 'ads.txt'
    ];
}];

// old Mobile Page
$routes['old-mobile'] = ['GET', '[*:path]?\/?\?mobile=false', function ($path='') {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => $path,
    ];
}];

/** API **/
// API Cache Clear
$routes[] = ['GET', '/api/cache/[clear|clearm:action]/[*:api_key]', function ($action, $api_key) {
    return [
        'type'     => 'api',
        'filename' => 'cache',
        'action'   => $action,
        'api_key'  => $api_key,
    ];
}];

return $routes;