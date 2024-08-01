<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/17/2018
 * Time: 10:28 AM
 */


$routes = [];

$routes['showtimes'] = ['GET', '/showtimes', function () {
    return [
        'type'     => 'page',
        'filename' => 'showtimes',
    ];
}];

$routes['about'] = ['GET', '/about', function () {
    return [
        'type'     => 'page',
        'filename' => 'about'
    ];
}];

$routes['app-prices'] = ['GET', '/app/prices/[i:id]', function ($id) {
    return [
        'type'     => 'page',
        'filename' => 'app/prices',
        'house_id' => $id
    ];
}];

$routes['app-pages'] = ['GET', '/app/page/[i:id]', function ($id) {
    return [
        'type'     => 'page',
        'filename' => 'app/page',
        'page_id' => $id
    ];
}];

$routes['locations_id'] = ['GET', '/location/[*:i]/[*:houseslug]', function ($houseid, $houseslug) {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'redirect',
        'params'    => array('house_id' => $houseid, 'houseslug' => $houseslug)
    ];
}];

$routes['locations'] = ['GET', '/location/[*:houseslug]', function ($houseslug) {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'redirect',
        'params'    => array('houseslug' => $houseslug)
    ];
}];

$routes['policy-cookies'] = ['GET', '/cookies', function () {
    return [
        'type'     => 'page',
        'filename' => 'policy-cookies'
    ];
}];

$routes['api-location'] = ['POST', '/data/location', function () {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getlocations',
        'params' => array()
    ];
}];

$routes['bolshoy-ballet'] = ['GET', '/bolshoy-ballet', function() {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getShowtimesByKeyword',
        'params' => array(
            'keywords'=>['Bolshoi Ballet'],
            'h1' => 'Bolshoi Ballet',
            'special_page_id' => '1'
        )
    ];
}];

$routes['royal-opera'] = ['GET', '/royal-opera', function() {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getShowtimesByKeyword',
        'params' => array(
            'keywords'=>['Royal Opera House', 'Royal Ballet'],
            'h1' => 'Royal Ballet',
            'special_page_id' => '2'
        )
    ];
}];

$routes['national-theatre'] = ['GET', '/national-theatre', function() {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getShowtimesByKeyword',
        'params' => array(
            'keywords'=>['National Theatre Live', 'NT Live'],
            'h1' => 'National Theatre Live',
            'special_page_id' => '3'
        )
    ];
}];

$routes['exhibition-on-screen'] = ['GET', '/exhibition-on-screen', function() {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getShowtimesByKeyword',
        'params' => array(
            'keywords'=>['Exhibition On Screen'],
            'h1' => 'Exhibition On Screen',
            'special_page_id' => '4'
        )
    ];
}];


return $routes;
