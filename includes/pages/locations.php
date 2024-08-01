<?php
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';
$class['body'] = 'locations';


$CACHE_locations_houses = $cache->getItem($config->getConfig('site_id').'_locations_houses');

if (!$CACHE_locations_houses->isHit()) {

	$hs = chain_get_houses($config->getConfig('site_id'));
	$houses_new =array();
	foreach ($hs as $h) {
		
		//setup variables
		$house['house_id'] = fix_movie_id($h['house_id']);
		$house['name'] = trim($h["name"]);
		$house['url'] = url_name($house['name']) . "-Showtimes";
		$house['photo'] = build_house_photo_url($config->getConfig('site_id'), $h["PhotoUrl"]);
		$house['address'] = trim($h["address"]); 
		$house['city'] = trim($h["city"]);
		$house['state_short'] =  trim($h["state"]);
		$house['state_full'] =  get_state_name(trim($h["state"]));
		$house['zip'] = trim($h["zip"]);
		
		//trim($h["address"]) . "<br>" . trim($h["city"]) . ", " . trim($h["state"]) . " " . trim($h["zip"]);
		$house['phone'] = build_phone_number(trim($h["phone"]));
		$house['movieline'] = build_phone_number(trim($h["movieline"]));
		$house['email'] = strtolower(trim($h["email"]));
			
	
		array_push($houses_new, $house);
	}
	
	$data['houses'] = $houses_new;
	$CACHE_locations_houses->set($data['houses']);
}else{
	$data['houses'] = $CACHE_locations_houses->get();
}

$file = 'locations.html';
