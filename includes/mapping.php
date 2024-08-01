<?php

// map homepage
$router->map('GET', '/', function() {
	return array(
		"type" => "page", 
		"filename" => 'home',
		);	
});

// map locations
$router->map('GET', '/locations', function() {
	return array(
		"type" => "page", 
		"filename" => 'locations',
		);	
});
$router->map('GET', '/location/[i:id]/[*:cinema]', function($id, $cinema) {
	return array(
		"type" => "page", 
		"filename" => 'location',
		"house_id"=>$id);
});


// map movies
$router->map('GET', '/movies', function() {
	return array(
		"type" => "page", 
		"filename" => 'movies',
		);	
});
$router->map('GET', '/movie/[i:id]', function($id) {
    return array(
        "type" 		=> 'page',
        "filename" 	=> 'movie',
        "movie_id" 	=> $id
    );
});
$router->map('GET', '/movie/[i:id]/[*:movie]', function($id, $movie) {
	return array(
		"type" 		=> 'page', 
		"filename" 	=> 'movie',
		"movie_id" 	=> $id
		);	
});
// map Page
$router->map('GET', '/page/[i:id]/[*:page]', function($id, $page) {
	return array(
		"type" 		=> 'page', 
		"filename" 	=> 'page',
		"page_id" 	=> $id
		);	
});

$router->map('GET', '/app/prices/[i:id]', function($id) {
    return array(
        'type'     => 'page',
        'filename' => 'prices',
        'house_id' => $id,
    );
});

// map CSS
$router->map('GET', '/assets/css/[*:file].css', function($file) {
	return array("type" => "css", "filename" => $file);
});

// map JS
$router->map('GET', '/assets/js/[*:file]', function($file) {
	return array("type" => "js", "filename" => $file);
});
// map IMG
$router->map('GET', '/assets/img/[*:file]', function($file) {
	return array("type" => "img", "filename" => $file);
});

// Package
$router->map('GET', '/assets/package/[*:file]', function($file) {
    return array("type" => "package", "filename" => $file);
});

//AJAX  ajax_times?house_id="+house_id+"&date="+date+"&ticketing="+ticketing+"&state="+state
$router->map('GET', '/ajax_times/house_id=[i:house_id]/date=[*:date]/ticketing=[i:ticketing]/state=[a:state]', function($house_id, $date, $ticketing, $state) {
	return array(
		"type" 		=> "ajax",
		"filename" 	=> 'times', 
		"house_id"	=> $house_id, 
		"date" 		=> $date, 
		"ticketing"	=> $ticketing, 
		"state"		=> $state
		);
});
$router->map('GET', '/ajax_movie/movie_id=[i:movie_id]/date=[*:date]/ticketing=[i:ticketing]', function($movie_id, $date, $ticketing) {
	return array(
		"type" 		=> "ajax",
		"filename" 	=> 'movie', 
		"movie_id"	=> $movie_id, 
		"date" 		=> $date, 
		"ticketing"	=> $ticketing
		);
});
$router->map('GET', '/ajax_loc/movie=[i:movie_id]/date=[*:date]', function($movie_id, $date) {
	return array(
		"type" 		=> "ajax",
		"filename" 	=> 'loc', 
		"movie_id"	=> $movie_id, 
		"date" 		=> $date,
		);
});
$router->map('GET', '/ajax_loader', function() {
	return array(
		"type" 		=> "ajax",
		"filename" 	=> 'loader', 
		);
});
$router->map('GET', '/trailer/[*:file]', function($file) {
	return array(
		"type" 		=> "ajax",
		"filename" 	=> 'trailer', 
		"file"		=> $file,
		);
});

/** API **/
// API Cache Clear
$router->map('GET', '/api/cache/[clear:action]/[*:api_key]', function ($action, $api_key) {
    return [
        'type'     => 'api',
        'filename' => 'cache',
        'action'   => $action,
        'api_key'  => $api_key,
    ];
});