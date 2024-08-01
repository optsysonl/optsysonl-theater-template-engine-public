<?php

$meta_cache = $cache->getItem($config->getConfig('site_id').'_meta');
if (!$meta_cache->isHit()) {
    // do some heavy computation
	
    $meta['icon'] =  build_image_url($config->getConfig("site_id"), $config->getConfig("Favicon"));
	$meta['android_icon'] = build_image_url($config->getConfig("site_id"), $config->getConfig("Favicon"));
	$meta['apple_icon'] =  build_image_url($config->getConfig("site_id"), $config->getConfig("Favicon"));
	$meta['apple_icon_precomposed'] =  build_image_url($config->getConfig("site_id"), $config->getConfig("Favicon"));
	$meta['shortcut_icon'] =  build_image_url($config->getConfig("site_id"), $config->getConfig("Favicon"));
	
	$meta['google_fonts'] = get_google_font($config->getConfig("font"));
	
	$meta['analytics'] = $config->getConfig("analytics");
	
	$meta_cache->expiresAfter($cache_time['7day']);
	$meta_cache->set($meta);
    $cache->save($meta_cache);
}else{
    $meta = $meta_cache->get();
}





