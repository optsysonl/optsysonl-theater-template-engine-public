<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/17/2018
 * Time: 10:28 AM
 */


$routes = [];


$routes['mobilemrdering1'] = ['GET', '/MobileOrdering', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15631,
    ];
}];

$routes['mobilemrdering2'] = ['GET', '/mobilemrdering', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15631,
    ];
}];


return $routes;
