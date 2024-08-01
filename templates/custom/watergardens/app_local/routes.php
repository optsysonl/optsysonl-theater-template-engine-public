<?php

$routes = [];

// The Theatre Page
$routes['about'] = ['GET', '/about', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9783,
    ];
}];

// Gift Cards page
$routes['gift-cards'] = ['GET', '/gift-cards', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9803,
    ];
}];

// employment page
$routes['employment'] = ['GET', '/employment', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9675,
    ];
}];

$routes[] = ['GET', '/data/[*:function]', function($function) {
	return [
		'type'     => 'ajax',
		'filename' => 'data',
		'function'	=> $function,
	];
}];


/*   Old Site URLS to new site */

$routes['redirect'] = ['GET', '/pleasantgrove/loc_pleasantgrove.asp', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/',
    ];
}];


return $routes;