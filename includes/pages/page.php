<?php
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';

$class['body'] = 'fxp-page';

//get the page ID
$page_id = $mapping['page_id'];

$CACHE_page_details = $cache->getItem($config->getConfig('site_id').'_page_details_'.$page_id);

if (!$CACHE_page_details->isHit()) {	
	$data['page']['details'] = fxp_get_page_details($config->getConfig("site_id"), $page_id);
	
	$CACHE_page_details->expiresAfter($cache_time['1day']);
	$CACHE_page_details->set($data['page']['details']);
	$cache->save($CACHE_page_details);
	
}else{
	$data['page']['details'] = $CACHE_page_details->get();
}


$CACHE_page_type = $cache->getItem($config->getConfig('site_id').'_page_type_'.$page_id);
if (!$CACHE_page_type->isHit()) {	
switch (strtolower($data['page']['details']['SiteHeadline'])){
		case "contact":
			$data['page']['type'] = 'contact';
		break;
		case "mpaa":
			$data['page']['type'] = 'mpaa';
		break;
		case "newsletter":
			$data['page']['type'] = 'newsletter';
		break;
		default:
			$data['page']['type'] = 'page';
	}
	$CACHE_page_type->expiresAfter($cache_time['1day']);
	$CACHE_page_type->set($data['page']['type']);
	$cache->save($CACHE_page_type);
	
}else{
	$data['page']['type'] = $CACHE_page_type->get();
}


$CACHE_page_content = $cache->getItem($config->getConfig('site_id').'_page_content_'.$page_id);
if (!$CACHE_page_content->isHit()) {	
	
	$data['page']['content'] = fxp_get_page($config->getConfig("site_id"), $page_id);
	
	$CACHE_page_content->expiresAfter($cache_time['1day']);
	$CACHE_page_content->set($data['page']['content']);
	$cache->save($CACHE_page_content);
	
}else{
	$data['page']['content'] = $CACHE_page_content->get();
}

$CACHE_page_slides = $cache->getItem($config->getConfig('site_id').'_slides_page'.$page_id);

if (!$CACHE_page_slides->isHit()) {	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'Page-'.$page_id);
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
	
	$data['page']['slides'] = $sliders_new;
	$CACHE_page_slides->expiresAfter($cache_time['4hrs']);
	$CACHE_page_slides->set($data['page']['slides']);
	$cache->save($CACHE_page_slides);
	
}else{
	$data['page']['slides'] = $CACHE_page_slides->get();
}



$file = 'page.html'; 