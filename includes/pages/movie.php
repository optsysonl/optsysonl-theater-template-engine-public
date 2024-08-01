<?php 
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';


$class['body'] = 'movie';

$movie_id = $mapping['movie_id'];	

try {
	$sql = "DECLARE @country varchar(10) SET @country = :country
			SELECT m.movie_id, ISNULL(cs.title,ISNULL(i.fname,m.name)) as name, m.runtime, ISNULL(cs.csMpaa,ISNULL(i.cert,m.mpaa)) as mpaa, m.genre, 
			m.genre2, m.genre3, m.actor1, m.actor2, m.actor3, m.actor4, m.actor5, m.actor6, m.actor7, m.actor8, m.actor9, m.actor10, cs.csActors, 
			ISNULL(cs.csDirector,m.director) as director, ISNULL(cs.release,ISNULL(i.release,m.release)) as release, m.hiphotos, m.videos, m.url, 
			m.advisory, ISNULL(cs.csProducer,m.producer) as producer, m.distrib, m.flv_high, m.writer, cs.posterImage, cs.csTrailer, ip.ip_filename,
			CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r.capsule) END AS capsule,
			ISNULL(cs.csMpaa, CASE WHEN @country = 'USA' THEN m.mpaa 
								WHEN @country = '' THEN m.mpaa 
								WHEN @country = 'CAN' THEN 
													 'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') + 
													';SK' + ISNULL(RTRIM(m.skmpa), 'NR') + 
													';AB' + ISNULL(RTRIM(m.abmpa), 'NR') + 
													';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') + 
													';ON' + ISNULL(RTRIM(m.onmpa), 'NR') + 
													';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') + 
													';NS' + ISNULL(RTRIM(m.nsmpa), 'NR') 
								ELSE i.cert END) as mpaa  
			FROM Cinema..Movies m WITH(NOLOCK)
			LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.movie_id = m.movie_id AND cs.SiteId = :SiteId 
			LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid = 
				CASE 
					WHEN cs.synopsis_type = 'none' OR 
						 cs.synopsis_type = '' OR 
						 cs.synopsis_type IS NULL 
					THEN 'HOME' 
					ELSE cs.synopsis_type 
				END 
			LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
			LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
			WHERE m.movie_id = :movie_id";
	$q = $db->prepare($sql);
	$q->execute(array(':movie_id' => $movie_id, ':SiteId' => $config->getConfig("site_id"), ':country' => $config->getConfig("site_country")));
	$m = $q->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}

$data['movie']['id'] = $movie_id;
$data['movie']['name'] = fix_movie_name($m['name']);

$data['movie']['runtime'] = fix_movie_runtime($m["runtime"]);
$data['movie']['poster'] = ($m['posterImage'] != '') ? fxp_build_poster_url($site_id, $m['posterImage']) : build_poster_url($movie_id, $m['hiphotos'], '', $config->getConfig("site_country"), $m['ip_filename']);
$data['movie']['genres'] = build_genre_string($m, ", ",2);
$data['movie']['synopsis'] = $m['capsule'];
$data['movie']['cast'] = ($m['csActors'] != '' ) ? $m['csActors'] : build_actors_string($m, ', ', 5);
$data['movie']['director'] = $m['director'];
$data['movie']['ticketing'] =  1;
$data['movie']['mpaa'] = trim($m['mpaa']);
if ($data['movie']['mpaa'] == "PG-13"){
	$data['movie']['mpaa'] = "PG13";
}

if ($config->getConfig("site_country") == 'CAN'){
	if ($site_province != ''){
		$data['movie']['mpaa'] = get_province_rating($data['movie']['mpaa'], $site_province);
	} else {
		$data['movie']['mpaa'] = '<small>(Ratings May Vary)</small>';
	}
}
if ($m['advisory'] != '' && $config->getConfig("site_country") == 'USA'){
	$data['movie']['advisory'] = $m['advisory'];
}


if ($config->getConfig("site_country") == 'CAN'){
	try {
		$sql = "SELECT sh.house_id, sh.state
				FROM Websites..SiteHouses sh WITH(NOLOCK)
				WHERE sh.SiteId = :SiteId";
		$q = $db->prepare($sql);
		$q->execute(array(':SiteId' => $config->getConfig("site_id")));
		$site_houses = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	$site_province = $site_houses[0]['state'];
	
	if ($site_province != ''){
		$data['movie']['mpaa'] = get_province_rating($data['movie']['mpaa'], $site_province);
	} else {
		$data['movie']['mpaa'] = 'Ratings May Vary';
	}
}

$data['movie']['release'] = date('l, F jS', strtotime($m['release']));
if (date('Y-m-d', strtotime($m['release'])) > $today){
	$data['movie']['release'] = 'Opens ' . $data['movie']['release'];
} else {
	$data['movie']['release'] = 'Opened ' . $data['movie']['release'];
}

//loop through the stills array
$data['movie']['stills'] = movie_get_stills($movie_id,'high');

if ($m['csTrailer'] != ''){
	$trailer = 1;
	$data['movie']['trailer']['url'] = build_trailer_url($m['csTrailer']);
	$data['movie']['trailer']['image'] = build_trailer_thumbnail($data['movie']['trailer']['url'], $data['movie']['stills'][0]);
} elseif ($m['flv_high'] != ''){

	$data['movie']['trailer']['url'] = build_trailer_url($movie_id, trim($m['flv_high']));
	if (!empty($data['movie']['stills'][0])) {
		$data['movie']['trailer']['image'] = $data['movie']['stills'][array_rand($data['movie']['stills'],1)];
	} else {
		$data['movie']['trailer']['image'] = "/assets/img/no-still.jpg";
	}
} else {
	$data['movie']['trailer']['image'] = "/assets/img/no-trailer.png";	
}




try {
	$sql = "SELECT distinct showdate 
			FROM Screens WITH(NOLOCK) WHERE house_id in
				(SELECT house_id FROM Websites..SiteHouses WITH(NOLOCK)
				WHERE siteid = :siteid)
			and showdate >= :showdate and movie_id = :movie_id 
			ORDER BY showdate";
	$q = $db->prepare($sql);
	$q->execute(array(':siteid' => $config->getConfig("site_id"), ':showdate' => $today, ':movie_id' => $movie_id));
	$dates = $q->fetchAll(PDO::FETCH_ASSOC);
	
	//loop through array
	if (!empty($dates)) {
		foreach ($dates as $d) {				
			//add to the showdates sub array
			$showdate['value'] = date('Y-m-d', strtotime($d['showdate']));
			$showdate['name'] = date('l, F j', strtotime($d['showdate']));
			$data['movie']['showdates'][] = $showdate;
		}
	} else {
		$data['movie']['showdates'][0]['value'] = date('Y-m-d', $today);
		$data['movie']['showdates'][0]['name'] = date('l, F j', $today);
	}
} catch (PDOException $e) {
	handle_exception($e);
}













$file = 'movie.html';

