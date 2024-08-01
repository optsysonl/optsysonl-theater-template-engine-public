<?php
header("Content-type: text/css");

$CACHE_CSS_reset = $cache->getItem($config->getConfig('site_id').'_css_reset');

if (!$CACHE_CSS_reset->isHit()) {

	
	$CACHE_CSS_reset->expiresAfter($cache_time['7days']);
	$CACHE_CSS_reset->set($data['css']);
	$cache->save($CACHE_CSS_reset);
	
}else{
	$data['css'] = $CACHE_CSS_reset->get();
}


$file = 'css/reset.css';

