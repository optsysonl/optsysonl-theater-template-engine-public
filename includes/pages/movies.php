<?php
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';
$class['body'] = 'movies';



$data['movies']['np'] = NULL;
$data['movies']['cs'] = NULL;

$CACHE_movies_np = $cache->getItem($config->getConfig('site_id').'_movies_np');

if (!$CACHE_movies_np->isHit()) {
	$movies_np = array();
	try {
		$sql = "
			SELECT DISTINCT 
				m.movie_id, 
				ISNULL(cs.title,ISNULL(i.fname,m.name)) as name, 
				m.actor1, 
				m.actor2,
				m.director,
				m.mpaa,
				m.runtime,
				m.hiphotos, 
				m.videos, 
				ISNULL(cs.release,ISNULL(i.release,m.release)) as release, 
				cs.posterImage, 
				ip.ip_filename
			FROM Websites..SiteHouses sh WITH(NOLOCK)
			INNER JOIN Cinema..Screens s WITH(NOLOCK) ON sh.house_id = s.house_id 
			INNER JOIN Cinema..Movies m WITH(NOLOCK) ON s.movie_id = m.movie_id AND m.parent_id = '0'
			LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.movie_id = s.movie_id AND cs.SiteId = sh.SiteId
			LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = s.movie_id AND i.country = :country
			LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
			WHERE sh.siteid = :site_id AND s.showdate = :date 
			ORDER BY release desc, m.name";
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $config->getConfig('site_id'), ':country' => $config->getConfig("site_country"), ':date' => $today));
		$movies_np = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	$movies_np_new = array();
	foreach($movies_np as $n){
		$a_movie['id'] = fix_movie_id($n['movie_id']);
		$a_movie['name'] = fix_movie_name($n['name']);
		$a_movie['url'] = url_name($a_movie['name']) . "-Trailer-and-Info";
		$a_movie['poster'] = ($n['posterImage'] != '') ? fxp_build_poster_url($config->getConfig('site_id'), $n['posterImage']) : build_poster_url($a_movie['id'], $n['hiphotos'], '', $config->getConfig("site_country"), $n['ip_filename']);
		$a_movie['mpaa'] = trim($n['mpaa']);
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
		$a_movie['cast'] = build_actors_string($n,', ', 2);
		$a_movie['runtime'] = fix_movie_runtime($n["runtime"]);
		$a_movie['director'] = trim($n["director"]);
		
		
		array_push($movies_np_new, $a_movie);
	}
	
	$data['movies']['np'] = $movies_np_new;
	$CACHE_movies_np->expiresAfter($cache_time['6hrs']);
	$CACHE_movies_np->set($data['movies']['np'] );
	$cache->save($CACHE_movies_np);
	
}else{
	$data['movies']['np'] = $CACHE_movies_np->get();
}




$CACHE_movies_cs = $cache->getItem($config->getConfig('site_id').'_movies_cs');

if (!$CACHE_movies_cs->isHit()) {

	try {
	$sql = "
		SELECT 
			cs.movie_id, 
			isnull(cs.release,ISNULL(i.release,m.release)) as release, 
			m.hiphotos,
			isnull(cs.title,ISNULL(i.fname,m.name)) as name, 
			m.mpaa, 
			m.actor1, 
			m.actor2, 
			m.director,
			m.runtime,
			m.videos, 
			r.capsule, 
			MIN(s.showdate) as showdate, 
			cs.posterImage, 
			ip.ip_filename
		FROM 
			Websites..ComingSoon cs WITH(NOLOCK)
		JOIN 
			Cinema..Movies m WITH(NOLOCK) on m.movie_id = cs.movie_id AND m.parent_id = '0'
		LEFT OUTER JOIN 
			Cinema..Reviews r WITH(NOLOCK) ON r.movie_id = m.movie_id and r.sid = 'HOME' 
		LEFT OUTER JOIN 
			Cinema..Screens s WITH(NOLOCK) on m.movie_id = s.movie_id and s.house_id in 
				(SELECT house_id from Websites..SiteHouses WITH(NOLOCK) where siteid = :site_id2)
		LEFT OUTER JOIN 
			Cinema..Intl i WITH(NOLOCK) ON i.movie_id = cs.movie_id AND i.country = :country
		LEFT OUTER JOIN 
			Cinema..IntlPhotos ip WITH(NOLOCK) ON i.movie_id = ip.movie_id AND i.country = ip.ip_country
		WHERE 
			CAST(isnull(isnull(cs.release,m.release),getdate()+1) as DateTime) > getdate()
			AND cs.SiteId = :site_id 
		GROUP BY 
			cs.movie_id, 
			isnull(cs.release,ISNULL(i.release,m.release)), 
			m.hiphotos, 
			isnull(cs.title,ISNULL(i.fname,m.name)), 
			m.mpaa, 
			m.videos, 
			m.actor1, 
			m.actor2,
			m.runtime,
			m.director,
			r.capsule,
			cs.posterImage,
			ip.ip_filename  
		ORDER BY 
			release, 
			name";
	
	$q = $db->prepare($sql);
	$q->execute(array(':site_id' => $config->getConfig('site_id'), ':site_id2' => $config->getConfig('site_id'), ':country' => $config->getConfig("site_country")));
	$movies_cs = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	
	$movies_cs_new = array();
	foreach($movies_cs as $n){
		$a_movie['id'] = fix_movie_id($n['movie_id']);
		$a_movie['name'] = fix_movie_name($n['name']);
		$a_movie['url'] = url_name($a_movie['name']) . "-Trailer-and-Info";
		$a_movie['poster'] = ($n['posterImage'] != '') ? fxp_build_poster_url($config->getConfig('site_id'), $n['posterImage']) : build_poster_url($a_movie['id'], $n['hiphotos'], '', $config->getConfig("site_country"), $n['ip_filename']);
		$a_movie['mpaa'] = trim($n['mpaa']);
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
		$a_movie['cast'] = build_actors_string($n,', ', 2);
		$a_movie['runtime'] = fix_movie_runtime($n["runtime"]);
		$a_movie['director'] = trim($n["director"]);
		
		array_push($movies_cs_new, $a_movie);
	}
	$data['movies']['cs'] = $movies_cs_new;
	$CACHE_movies_cs->expiresAfter($cache_time['6hrs']);
	$CACHE_movies_cs->set($data['movies']['cs'] );
	$cache->save($CACHE_movies_cs);
	
}else{
	$data['movies']['cs'] = $CACHE_movies_cs->get();
}


$file = 'movies.html';

