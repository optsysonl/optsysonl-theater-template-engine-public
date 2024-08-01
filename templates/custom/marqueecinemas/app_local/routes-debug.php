<?php

$routes = [];

// The Theatre Page
$routes['about'] = ['GET', '/about', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10264,
    ];
}];

// ADVERTISING
$routes['advertising'] = ['GET', '/advertising', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10267,
    ];
}];

$routes['flashback_cinema'] = ['GET', '/flashback-cinema', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10269,
    ];
}];


$routes['rentals'] = ['GET', '/rentals[*]', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10261,
    ];
}];
$routes['rentals2'] = ['GET', '/rentals', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10261,
    ];
}];


// RATING
$routes['ratings'] = ['GET', '/ratings', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10265,
    ];
}];


$routes['moviemagic'] = ['GET', '/moviemagic', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10262,
    ];
}];

$routes['employment'] = ['GET', '/employment', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10266,
    ];
}];


return $routes;