<?php
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';

$class['body'] = 'home';

$CACHE_slider_home = $cache->getItem($config->getConfig('site_id').'_slider_home');

if (!$CACHE_slider_home->isHit()) {
	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'home');
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	$data['slides']['home'] = $sliders_new;
	$CACHE_slider_home->expiresAfter($cache_time['4hrs']);
	$CACHE_slider_home->set($data['slides']['home']);
	$cache->save($CACHE_slider_home);
	
}else{
	$data['slides']['home'] = $CACHE_slider_home->get();
}

$CACHE_slider_top = $cache->getItem($config->getConfig('site_id').'_slider_top');

if (!$CACHE_slider_top->isHit()) {
	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'top');
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	$data['slides']['top'] = $sliders_new;
	$CACHE_slider_top->expiresAfter($cache_time['4hrs']);
	$CACHE_slider_top->set($data['slides']['top']);
	$cache->save($CACHE_slider_top);
	
}else{
	$data['slides']['top'] = $CACHE_slider_top->get();
}

$CACHE_slider_bottom = $cache->getItem($config->getConfig('site_id').'_slider_bottom');

if (!$CACHE_slider_bottom->isHit()) {
	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'bottom');
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	$data['slides']['bottom'] = $sliders_new;
	$CACHE_slider_bottom->expiresAfter($cache_time['4hrs']);
	$CACHE_slider_bottom->set($data['slides']['bottom']);
	$cache->save($CACHE_slider_bottom);
	
}else{
	$data['slides']['bottom'] = $CACHE_slider_bottom->get();
}


$CACHE_slider_left = $cache->getItem($config->getConfig('site_id').'_slider_left');

if (!$CACHE_slider_left->isHit()) {
	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'left');
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	
	$data['slides']['left'] = $sliders_new;	
	
	$CACHE_slider_left->expiresAfter($cache_time['4hrs']);
	$CACHE_slider_left->set($data['slides']['left']);
	$cache->save($CACHE_slider_left);
	
}else{
	$data['slides']['left'] = $CACHE_slider_left->get();
}


$CACHE_slider_right = $cache->getItem($config->getConfig('site_id').'_slider_right');

if (!$CACHE_slider_right->isHit()) {
	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'right');
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	$data['slides']['right'] = $sliders_new;
	
	$CACHE_slider_right->expiresAfter($cache_time['4hrs']);
	$CACHE_slider_right->set($data['slides']['right']);
	$cache->save($CACHE_slider_right);
	
}else{
	$data['slides']['right'] = $CACHE_slider_right->get();
}

//  CAROUSEL - Now Playing

$CACHE_carousel_np = $cache->getItem($config->getConfig('site_id').'_carousel_np');
if (!$CACHE_carousel_np->isHit()) {
	
	$ms = chain_get_now_playing($config->getConfig('site_id'), $today, $config->getConfig("site_country"));
	$ms_new = array();	
	foreach ($ms as $m) {
		
		//buildvariables
		$a_movie['name'] = fix_movie_name($m['name']);
		$a_movie['url'] = url_name($a_movie['name']) . "-Trailer-and-Info";
		$a_movie['mpaa'] = trim($m['mpaa']);
		$a_movie['id'] = fix_movie_id($m['movie_id']);
		$a_movie['cast'] = build_actors_string($m,', ', 2);
		$a_movie['runtime'] = fix_movie_runtime($m["runtime"]);
		$a_movie['director'] = trim($m["director"]);
		if ($a_movie['mpaa'] == "PG-13"){
			$a_movie['mpaa'] = "PG13";
		}
		if ($config->getConfig("site_country") == 'CAN'){
			if ($site_province != ''){
					$a_movie['mpaa'] = get_province_rating($a_movie['mpaa'], $site_province);
			} else {
					$a_movie['mpaa'] = '<small>(Ratings May Vary)</small>';
			}
		}
		$a_movie['poster'] = ($m['posterImage'] != '') ? fxp_build_poster_url($config->getConfig('site_id'), $m['posterImage']) : build_poster_url($a_movie['id'], $m['hiphotos'], '', $config->getConfig("site_country"), $m['ip_filename']);
		$a_movie['trailer_url'] = build_trailer_url($a_movie['id'], $m["videos"]);
 
		//write out carousel HTML
		array_push ($ms_new, $a_movie);
	}
	
	
	$data['carousel']['np'] = $ms_new;
	
	$CACHE_carousel_np->expiresAfter($cache_time['1day']);
	$CACHE_carousel_np->set($data['carousel']['np']);
	$cache->save($CACHE_carousel_np);
	
}else{
	$data['carousel']['np'] = $CACHE_carousel_np->get();
}


//  CAROUSEL - Coming Soon

$CACHE_carousel_cs = $cache->getItem($config->getConfig('site_id').'_carousel_cs');
if (!$CACHE_carousel_cs->isHit()) {
	
	$cs = fxp_get_coming_soon($config->getConfig('site_id'), $config->getConfig("site_country"));
	$cs_new = array();	
	foreach ($cs as $m) {
		
		//buildvariables
		$a_movie['name'] = fix_movie_name($m['name']);
		$a_movie['url'] = url_name($a_movie['name']) . "-Trailer-and-Info";
		$a_movie['mpaa'] = trim($m['mpaa']);
		$a_movie['id'] = fix_movie_id($m['movie_id']);
		$a_movie['cast'] = build_actors_string($m,', ', 2);
		$a_movie['runtime'] = fix_movie_runtime($m["runtime"]);
		$a_movie['director'] = trim($m["director"]);
		$a_movie['poster'] = ($m['posterImage'] != '') ? fxp_build_poster_url($config->getConfig('site_id'), $m['posterImage']) : build_poster_url($a_movie['id'], $m['hiphotos'], '', $config->getConfig("site_country"), $m['ip_filename']);
		$a_movie['trailer_url'] = build_trailer_url($a_movie['id'], $m["videos"]);
 		if ($a_movie['mpaa'] == " (PG-13)"){
			$a_movie['mpaa'] = " (PG13)";
		}
		if ($config->getConfig("site_country") == 'CAN'){
			if ($site_province != ''){
					$a_movie['mpaa'] = get_province_rating($a_movie['mpaa'], $site_province);
			} else {
					$a_movie['mpaa'] = '<small>(Ratings May Vary)</small>';
			}
		}
		
		//write out carousel HTML
		array_push ($cs_new, $a_movie);
	}
	
	
	$data['carousel']['cs'] = $cs_new;
	
	$CACHE_carousel_cs->expiresAfter($cache_time['1day']);
	$CACHE_carousel_cs->set($data['carousel']['cs']);
	$cache->save($CACHE_carousel_cs);
	
}else{
	$data['carousel']['cs'] = $CACHE_carousel_cs->get();
}




$file = 'home.html';

