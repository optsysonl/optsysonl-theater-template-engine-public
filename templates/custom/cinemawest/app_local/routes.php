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

$routes['contact'] = ['GET', '/contact-us', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 11812,
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

$routes['covid'] = ['GET', '/covid-protocols', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id' => 14859
    ];
}];

return $routes;
