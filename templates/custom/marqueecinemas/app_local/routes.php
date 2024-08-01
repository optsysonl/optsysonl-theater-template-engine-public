<?php

$routes = [];

// page Home
$routes['home'] = ['GET', '/?[*]', function () {
    return [
        'type'     => 'page',
        'filename' => 'home',
    ];
}];

// The Theatre Page
$routes['about'] = ['GET', '/about', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 1462,
    ];
}];

// ADVERTISING
$routes['advertising'] = ['GET', '/advertising', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10881,
    ];
}];

$routes['flashback_cinema'] = ['GET', '/flashback-cinema', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 3142,
    ];
}];


$routes['rentals'] = ['GET', '/rentals[*]', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10880,
    ];
}];
$routes['rentals2'] = ['GET', '/rentals', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10880,
    ];
}];


// RATING
$routes['ratings'] = ['GET', '/ratings', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10878,
    ];
}];

$routes['moviemagic'] = ['GET', '/moviemagic', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10879,
    ];
}];

$routes['employment'] = ['GET', '/employment', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10882,
    ];
}];

$routes['newlocations'] = ['GET', '/newlocations', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 1,
    ];
}];

$routes['contactus'] = ['GET', '/contactus', function () {
    return [
        'type'     => 'page',
        'filename' => 'contactus',
    ];
}];

$routes['donation'] = ['GET', '/donation', function () {
    return [
        'type'     => 'page',
        'filename' => 'donation',
    ];
}];

$routes['employeecomments'] = ['GET', '/employeecomments', function () {
    return [
        'type'     => 'page',
        'filename' => 'employeecomments',
    ];
}];


/*   Forms */
$routes[] = ['POST', '/data/[*:function]', function ($function) {
    return [
        'type'     => 'ajax',
        'filename' => 'data',
        'function' => $function,
    ];
}];


/*   Redirects */

$routes['redirect_giftcards'] = ['GET', '/giftcards', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action'   => 'https://marqueecinemas.cardfoundry.com/giftcards.php',
    ];
}];


// Ticketing Links
// /ticketing/#tickets/95133/9602/8053509f-f69f-4db4-ba94-a59c012f18b6
$routes['ticketing'] = ['GET', '/ticketing/[*:file]', function ($file) {
    return [
        'type'     => 'page',
        'filename' => 'ticketing',
    ];
}];

return $routes;