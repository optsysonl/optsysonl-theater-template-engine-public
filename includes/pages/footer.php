<?php


$CACHE_bottom_nav = $cache->getItem($config->getConfig('site_id').'_bottom_nav');

if (!$CACHE_bottom_nav->isHit()){ 
	
	$ps = fxp_get_created_pages($config->getConfig('site_id'), 'bottom', $today);
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
	
	$footer['bottom_nav'] = $page_nav_new;
	$CACHE_bottom_nav->expiresAfter($cache_time['4hrs']);
	$cache->save($CACHE_bottom_nav->set($footer['bottom_nav']));
}else{
	$footer['bottom_nav'] = $CACHE_bottom_nav->get();
}



