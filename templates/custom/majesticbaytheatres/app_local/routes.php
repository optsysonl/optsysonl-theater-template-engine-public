<?php

$routes = [];

// page Movies Coming Soon
$routes[] = ['GET', '/coming-soon', function () {
    return [
        'type'     => 'page',
        'filename' => 'comingsoon',
    ];
}];

// The Theatre Page
$routes['about'] = ['GET', '/about', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 10104,
    ];
}];

// Gift Cards page
$routes['gift-cards'] = ['GET', '/gift-cards', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 2191,
    ];
}];

// Events & Promotions page
$routes['events-promotions'] = ['GET', '/events-promotions', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9662,
    ];
}];

// Private Screening Room page
$routes['private-screening'] = ['GET', '/private-screening', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9675,
    ];
}];

$routes[] = ['POST', '/data/[*:function]', function ($function) {
	return [
		'type'     => 'ajax',
		'filename' => 'data',
		'function' => $function,
	];
}];

return $routes;