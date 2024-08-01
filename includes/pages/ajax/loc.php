<?php

//Get Querystring
$movie_id = $mapping['movie_id'];
$date = $mapping['date'];


$CACHE_ajax_loc = $cache->getItem($config->getConfig('site_id').'_ajax_loc_'.$movie_id."_".$date);
if (!$CACHE_ajax_loc->isHit()) {

	$houses = array();
		
	try {
		$q = $db->prepare("
			SELECT DISTINCT sh.state, sh.house_id,RTRIM(sh.name) + ', ' + sh.state AS name,s.showdate
			FROM Cinema..Screens s WITH(NOLOCK) 
			JOIN Websites..SiteHouses sh WITH(NOLOCK) ON s.house_id = sh.house_id
			WHERE s.movie_id = :movie_id and sh.siteid = :site_id
			AND s.showdate = :date 
			ORDER BY sh.name ASC
		");
		$q->execute(array(':movie_id' => $movie_id, ':site_id' => $config->getConfig("site_id"), ':date' => $date));
		$houses = $q->fetchAll(PDO::FETCH_ASSOC);
	
	} catch (PDOException $e) {
		handle_exception($e);
	}

	$data['ajax_loc']= $houses;
	$CACHE_ajax_loc->expiresAfter($cache_time['1hr']);
	$CACHE_ajax_loc->set($data['ajax_loc']);
    $cache->save($CACHE_ajax_loc);	
}else{
	$data['ajax_loc'] = $CACHE_ajax_loc->get();
}


$file = 'ajax/loc.html';