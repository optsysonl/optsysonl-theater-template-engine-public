<?php

$CACHE_logo = $cache->getItem($config->getConfig('site_id').'_logo');
if (!$CACHE_logo->isHit()){
	$header['logo'] = build_image_url($config->getConfig('site_id'), $config->getConfig('header_img'));	

	$CACHE_logo->expiresAfter($cache_time['7day']);
	$cache->save($CACHE_logo->set($header['logo']));	
}else{
	$header['logo'] = $CACHE_logo->get();
}


$CACHE_social_icons = $cache->getItem($config->getConfig('site_id').'_social_icons');

if (!$CACHE_social_icons->isHit()){
	//require_once 
	$header['social_icons']['facebook']['link'] = trim($config->getConfig('facebook'));
	$header['social_icons']['facebook']['img'] = build_DataURI( $template_dir."assets/img/facebook.svg");
	$header['social_icons']['twitter']['link'] = trim($config->getConfig('twitter'));
	$header['social_icons']['twitter']['img'] = build_DataURI( $template_dir."assets/img/twitter.svg");
	$header['social_icons']['instagram']['link'] = trim($config->getConfig('instagram'));
	$header['social_icons']['instagram']['img'] = build_DataURI( $template_dir."assets/img/instagram.svg");
	$header['social_icons']['pintrest']['link'] = trim($config->getConfig('pintrest'));
	$header['social_icons']['pintrest']['img'] = build_DataURI( $template_dir."assets/img/pinterest.svg");
	$header['social_icons']['google_plus']['link'] = trim($config->getConfig('google'));
	$header['social_icons']['google_plus']['img'] = build_DataURI( $template_dir."assets/img/google.svg");
	$header['social_icons']['site_google_plus']['link'] = trim($config->getConfig('google+'));
	$header['social_icons']['site_google_plus']['img'] = build_DataURI( $template_dir."assets/img/google.svg");
	$header['social_icons']['cust_id']['link'] = trim($config->getConfig('cust_id'));
	$header['social_icons']['cust_id']['img'] = build_DataURI( $template_dir."assets/img/email.svg");
	
	
	$CACHE_social_icons->expiresAfter($cache_time['7day']);
	$cache->save($CACHE_social_icons->set($header['social_icons']));
}else{
	$header['social_icons'] = $CACHE_social_icons->get();
}



$CACHE_houses_nav = $cache->getItem($config->getConfig('site_id').'_houses_nav');

if (!$CACHE_houses_nav->isHit()){ 
	$houses = chain_get_houses($config->getConfig('site_id'));
	$houses_state = array();
	$houses_new = array();
	$house_new = array();
	foreach ($houses as $h) {

		if ( isset($state) && $state != get_state_name(trim($h["state"])) ) {				
			$this_state = array('state'=>$state, 'houses'=>$houses_state);
			array_push ($houses_new, $this_state);
			$houses_state = array();	
		}
		$state =  get_state_name(trim($h["state"]));
		$house_new = array();
		//setup variables
		$house_new['house_id'] = fix_movie_id($h['house_id']);
		$house_new['name'] = trim($h['name']);
		$house_new['url'] = '/location/'.$h['house_id'].'/'.url_name($h['name']) . '-Showtimes';
		array_push($houses_state, $house_new);
		
	}
	$this_state = array('state'=>$state, 'houses'=>$houses_state);
	array_push ($houses_new, $this_state);
	
	$header['houses_nav'] = $houses_new;

	$CACHE_houses_nav->expiresAfter($cache_time['4hrs']);
	$cache->save($CACHE_houses_nav->set($header['houses_nav']));
}else{
	$header['houses_nav'] = $CACHE_houses_nav->get();
}



$CACHE_top_nav = $cache->getItem($config->getConfig('site_id').'_top_nav');

if (!$CACHE_top_nav->isHit()){ 
	
	$ps = fxp_get_created_pages($config->getConfig('site_id'), 'top', $today);
	$page_nav_item_new = array();
	$page_nav_new = array();
	$pageTypeOld = null;
	$i = 0;
	$y = 0;
	foreach ($ps as $p) {
		//setup variables
		$next = $ps[$y + 1];
		
		if($p['PageType'] != ''){
						
			if( $p['PageType'] != $pageTypeOld ){

				$page_nav_item_new['name'] = trim($p['PageType']);
				$page_nav_item_new['url'] = '#';
				$subnav = array();
				$page_nav_item_new['sub_nav'] = array();
			}
					
			$subnav['page_id'] = $p['PageId'];
			$subnav['name'] = trim($p['SiteHeadline']);
			$subnav['url'] = url_name($p['SiteHeadline']);
			$subnav['target'] = ($p['NewWindow'] == 1) ? "target='_blank'" : "";

			array_push($page_nav_item_new['sub_nav'], $subnav);
			
			if ($next['PageType'] != $p['PageType'] ){
				array_push($page_nav_new, $page_nav_item_new);
			}
			$pageTypeOld = $p['PageType'];
		}else{
			
			$page_nav_item_new['page_id'] = $p['PageId'];
			$page_nav_item_new['name'] = trim($p['SiteHeadline']);
			$page_nav_item_new['url'] = url_name($p['SiteHeadline']);
			$page_nav_item_new['target'] = ($p['NewWindow'] == 1) ? "target='_blank'" : "";
			
			array_push($page_nav_new, $page_nav_item_new);
		}

		$y++;
	}
	
	$header['top_nav']=$page_nav_new;
	$CACHE_top_nav->expiresAfter($cache_time['4hrs']);
	$cache->save($CACHE_top_nav->set($header['top_nav']));
}else{
	$header['top_nav'] = $CACHE_top_nav->get();
}
		


$CACHE_movies_nav = $cache->getItem($config->getConfig('site_id').'_movies_nav');

if (!$CACHE_top_nav->isHit()){ 
	
	$ms = chain_get_now_playing($config->getConfig('site_id'), $today, $config->getConfig("site_country"));
	$movies_np_new = array();
	foreach ($ms as $m) {
		//setup variables
		$movie_np_new['movie_id'] = fix_movie_id($m['movie_id']);
		$movie_np_new['name'] = fix_movie_name($m['name']);
		$movie_np_new['url'] = url_name($movie_np_new['name']) . "-Trailer-and-Info";
		
		array_push($movies_np_new, $movie_np_new);
	}
	
	$movies_cs_new = array();
	$ms = fxp_get_coming_soon($config->getConfig('site_id'), $config->getConfig("site_country"), 5);
		$count = 0;
		foreach ($ms as $m) {

		$movie_cs_new['movie_id'] = fix_movie_id($m['movie_id']);
		$movie_cs_new['name'] = fix_movie_name($m['name']);
		$movie_cs_new['url'] = url_name($movie_cs_new['name']) . "-Trailer-and-Info";
		
		array_push($movies_cs_new, $movie_cs_new);
		}
	
	$movies_nav['np'] = $movies_np_new;
	$movies_nav['cs'] = $movies_cs_new;
	
	$header['movies_nav'] = $movies_nav;
	
	$CACHE_movies_nav->expiresAfter($cache_time['1day']);
	$cache->save($CACHE_movies_nav->set($header['movies_nav']));
	
}else{
	$header['movies_nav'] = $CACHE_movies_nav->get();
}
	
		
	