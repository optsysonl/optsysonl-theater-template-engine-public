<?php

$routes = [];

// page Home
$routes['home'] = ['GET', '/?[*]', function () {
    return [
        'type'     => 'page',
        'filename' => 'home',
    ];
}];

$routes['private-cinema-event'] = ['GET', '/privateevents', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 14894,
    ];
}];

$routes['page_menu'] = ['GET', '/menu', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 2722,
    ];
}];

$routes['page_pressroom'] = ['GET', '/press-room', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15171,
    ];
}];

$routes['page_ToGo_1'] = ['GET', '/ToGo', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 12750,
    ];
}];

$routes['page_ToGo_2'] = ['GET', '/togo', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 12750,
    ];
}];

$routes['page_classics_1'] = ['GET', '/Classics', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 14731,
    ];
}];

$routes['page_classics_2'] = ['GET', '/classics', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 14731,
    ];
}];

$routes['ThankATeacher_1'] = ['GET', '/ThankATeacher', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15315,
    ];
}];

$routes['ThankATeacher_2'] = ['GET', '/thankateacher', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15315,
    ];
}];

$routes['CinemaWeek-1'] = ['GET', '/CinemaWeek', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15415,
    ];
}];

$routes['CinemaWeek-2'] = ['GET', '/cinemaweek', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 15415,
    ];
}];


$routes['bestOf-1'] = ['GET', '/Best-Of-Contest', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 11552,
    ];
}];

$routes['bestOf-2'] = ['GET', '/best-of-contest', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 11552,
    ];
}];

return $routes;