<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 10/10/2018
 * Time: 8:00 AM
 */

$routes = [];



// Now Showing
$routes['now-showing'] = ['GET', '/now-showing', function () {
    return [
        'type'     => 'page',
        'filename' => 'nowplaying',
    ];
}];

// Playing Today
$routes['playing-today'] = ['GET', '/playing-today', function () {
    return [
        'type'     => 'page',
        'filename' => 'playingtoday',
    ];
}];

// Ticket Request
$routes['ticket-page'] = ['GET', '/ticket/[*:screen]/[*:time]', function($screen, $time) {
	$params['screen_id'] = $screen;
	$params['time'] = $time;
	return [
		'type'     => 'page',
		'filename' => 'ticket_request',
		'params'=> $params,
	];
}];

// Playing Today
$routes['coming-soon'] = ['GET', '/coming-soon', function () {
    return [
        'type'     => 'page',
        'filename' => 'comingsoon',
    ];
}];

// About Page
$routes['about'] = ['GET', '/about-us', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 5834,
    ];
}];

// Venue Hire Page
$routes['venuehire'] = ['GET', '/venue-hire', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 5835,
    ];
}];

// Contact Page
$routes['contact'] = ['GET', '/contact-us', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 5836,
    ];
}];

$routes['special-events'] = ['GET', '/special-events', function () {
	return [
		'type'     => 'page',
		'filename' => 'page',
		'page_id'  => 5833,
	];
}];


/*   Old Site URLS to new site */

$routes['redirect1'] = ['GET', '/session_times.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/now-showing',
    ];
}];

$routes['redirect2'] = ['GET', '/coming_soon.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/coming-soon',
    ];
}];

$routes['redirect3'] = ['GET', '/session_times_today.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/playing-today',
    ];
}];

$routes['redirect4'] = ['GET', '/page-about-us.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/about-us',
    ];
}];

$routes['redirect5'] = ['GET', '/page-venue-hire.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/venue-hire',
    ];
}];

$routes['redirect6'] = ['GET', '/page-contact-us.php', function () {
    return [
        'type'     => 'redirect',
        'filename' => '301',
        'action' => '/contact-us',
    ];
}];

$routes['redirect7'] = ['GET', '/page-special-events.php', function () {
	return [
		'type'     => 'redirect',
		'filename' => '301',
		'action' => '/special-events',
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

return $routes;