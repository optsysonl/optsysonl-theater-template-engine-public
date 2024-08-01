<?php

/**
 * Gets an message
 * 
 * @param $site_id
 * @param $house_id
 *
 * @return Array
 */
function fxp_get_message($site_id, $house_id){
	global $db;
	$page = array();
	$message_page = '';
	try {
		$sql = "
			SELECT 
				p.PageId 
			FROM 
				Websites..Pages p WITH(NOLOCK)
			JOIN 
				Websites..SiteHouses sh 
			ON 
				sh.house_id = :house_id
			WHERE 
				p.SiteId = :site_id 
				AND p.PageId = sh.message_page 
				AND p.Enabled = 1 
				AND p.IsMessage = 1";
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $site_id, ':house_id' => $house_id));
		$page = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	if (isset($page[0]['PageId'])){
		$message_page = fxp_get_page($site_id, $page[0]['PageId']);
	}
	//else {
	//	return $page;
	//}
	return $message_page;
}
/**
* Gets an array of showdates for the specified house 
* on the specified date. 
* 
* @param $db
* @param $house_id
* @param $date YYYY-MM-DD
* @return Array $dates[numeric]
*/
function house_get_showdates($house_id, $date, $weekly) {
global $db;
$i = 0;
$showdates = array();
$friday_old = '';

try {
	$sql = "
		SELECT 
			DISTINCT s.showdate 
		FROM 
			Cinema..Screens s WITH(NOLOCK) 
		WHERE 
			s.house_id = :house_id 
			AND s.showdate >= :date 
		ORDER BY 
			s.showdate ASC";
	$q = $db->prepare($sql);
	$q->execute(array(':house_id' => $house_id, ':date' => $date));
	$dates = $q->fetchAll(PDO::FETCH_ASSOC);
	
	//loop through array
	if (!empty($dates)) {
		foreach ($dates as $d) {
			if ($weekly){
				$friday = (date('w', strtotime($d['showdate'])) == 5) ? $d['showdate'] : date('Y-m-d', strtotime('last friday '. $d['showdate']));
				if ($friday == $friday_old){
					continue;
				} 
				
				$showdate = date('n/j/Y', strtotime($friday)); 
				$friday_old = date('Y-m-d', strtotime($friday));

			} else {
				//get the showdate
				$showdate = date('n/j/Y', strtotime($d["showdate"]));
			}
			//save the first date
			if ($i == 0) {
				$showdates["start_date"] = $showdate;
			}
			
			//add to the showdates sub array
			$showdates["showdates"][$i] = $showdate;
			$i++;
		}
	} else {
		$showdates["start_date"] = date('n/j/Y');
		$showdates["showdates"][0] = date('n/j/Y');
	}
} catch (PDOException $e) {
	handle_exception($e);
}
return $showdates;
}

/**
 * checks to see if location is a drive-in
 * 
 * @param $db
 * @param $house_id
 * @return true if drive in, false if not
 */
function check_drivein($house_id) {
	global $db;
	$type = array();
	try {
		$sql = "
			SELECT 
				h.type 
			FROM 
				Cinema..Houses h WITH(NOLOCK) 
			WHERE 
				h.house_id = :house_id";
		$q = $db->prepare($sql);
		$q->execute(array(':house_id' => $house_id));
		$type = $q->fetch(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}

	if (trim($type['type']) == 'Drive-in/Outdoor' || $house_id == '4583'){
		return true;
	} else {
		return false;
	}
}

/**
 * Gets an associative array of important data for the specified house with 
 * 
 * @param $db
 * @param $house_id
 * @param $site_id
 *
 * @return string
 */
function get_site_house_timezone($house_id, $site_id) {
	global $db;
	$timezone = array();

	try {
		$sql = "
			SELECT 
				timezone
			FROM 
				Websites..SiteHouses WITH(NOLOCK)
			WHERE 
				SiteId = :SiteId 
				AND house_id = :house_id";
		$q = $db->prepare($sql);
		$q->execute(array(':SiteId' => $site_id,':house_id' => $house_id));
		$timezone = $q->fetch(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}

    return $timezone['timezone'];
}

/**
* Gets a two dimensional array of showtime and certain movie data for the specified
* house on the specified date. Extra whitespace is trimmed from certain values.
* 
* @param $db
* @param $house_id
* @param $date YYYY-MM-DD
*
* @return Array $showtimes[numeric][key] a two dimensional array
*/
function house_get_showtimes($house_id, $site_id, $date, $site_country, $weekly, $drive_in) {
global $db;
$showtimes = array();
$time_fields = showtime_fields();
$date_range = '';
//$drive_in_filter = ($drive_in) ? 's.screen_id, ' : '';
//$weekly_filter = ($weekly) ? 's.showdate, ' : '';

if ($weekly){
	$order_filter = 'm.parent_id, m.movie_id, s.showdate, ';
} elseif ($drive_in){
	$order_filter = 's.screen_id, ';
} else {
	$order_filter = 'm.parent_id, m.movie_id, ';
}

$friday = '';
$thursday = '';
if ($weekly){
	$friday = (date('w', strtotime($date)) == 5) ? $date : date('Y-m-d', strtotime('last friday '. $date));
	$thursday = date('Y-m-d', strtotime('this thursday ' . $friday));
	$date_range = "AND s.showdate >= '$friday' AND s.showdate <= '$thursday'";
} else {
	$date_range = "AND s.showdate = '$date'";
}

try {
	$sql = "DECLARE @country varchar(10) SET @country = :country
			SELECT m.movie_id, m.name as movie_name, CASE WHEN m.parent_id = '0' THEN m.movie_id ELSE m.parent_id END as parent_id, s.screen_id, 
			ISNULL(cs.title,ISNULL(i.fname,m.name)) as name, s.showdate, m.runtime, m.actor1, m.actor2,
			m.actor3, m.actor4, m.actor5, m.genre, m.genre2, m.genre3, s.comment, s.sneak, m.hiphotos, 
			m.flv_high, s.allowpass, $time_fields, cs.posterImage, ISNULL(cs.release, ISNULL(i.release, m.release)) as release, ip.ip_filename,
			ISNULL(cs.csMpaa, CASE WHEN @country = 'USA' THEN m.mpaa  WHEN @country = '' THEN m.mpaa 
									WHEN @country = 'CAN' THEN 
									 'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') + ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') + ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') + 
									';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') + ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') + ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') + 
									';NS' + ISNULL(RTRIM(m.nsmpa), 'NR') ELSE i.cert END) as mpaa  
			FROM Cinema..Screens s WITH(NOLOCK) 
			INNER JOIN Cinema..Movies m WITH(NOLOCK) ON (m.movie_id = s.movie_id AND m.parent_id = '0')
			LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON s.movie_id = cs.movie_id AND cs.SiteId = :SiteId
			LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
			LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
			WHERE s.house_id = :house_id $date_range
			UNION
			SELECT m.movie_id, m.name as movie_name, CASE WHEN m.parent_id = '0' THEN m.movie_id ELSE m.parent_id END as parent_id, s.screen_id, 
			ISNULL(cs.title,ISNULL(i.fname,m.name)) as name, s.showdate, m.runtime, m.actor1, m.actor2,
			m.actor3, m.actor4, m.actor5, m.genre, m.genre2, m.genre3, s.comment, s.sneak, m.hiphotos, 
			m.flv_high, s.allowpass, $time_fields, cs.posterImage, ISNULL(cs.release, ISNULL(i.release, m.release)) as release, ip.ip_filename,
			ISNULL(cs.csMpaa, CASE WHEN @country = 'USA' THEN m.mpaa  WHEN @country = '' THEN m.mpaa 
									WHEN @country = 'CAN' THEN 
									 'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') + ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') + ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') + 
									';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') + ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') + ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') + 
									';NS' + ISNULL(RTRIM(m.nsmpa), 'NR') ELSE i.cert END) as mpaa  
			FROM Cinema..Screens s WITH(NOLOCK) 
			INNER JOIN Cinema..Movies m WITH(NOLOCK) ON (m.movie_id = s.movie_id AND m.parent_id IN
			(SELECT s.movie_id FROM Cinema..Screens s wITH(NOLOCK) WHERE s.house_id = :in_house $date_range) )
			LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON s.movie_id = cs.movie_id AND cs.SiteId = :SiteId2
			LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
			LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
			WHERE s.house_id = :house_id2 $date_range
			ORDER BY release desc, $order_filter movie_name";
			
	$q = $db->prepare($sql);
	$q->execute(array(':in_house' => $house_id, ':house_id' => $house_id, ':SiteId' => $site_id, ':country' => $site_country, ':house_id2' => $house_id,  ':SiteId2' => $site_id));
	$showtimes = $q->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}

return $showtimes;
}

/**
* Gets an array of soldout showtimes for a house and date
* 
* @param $db
* @param $house_id
* @param $date YYYY-MM-DD
* @return Array $showtimes[numeric]
*/
function house_get_perfs_soldout($house_id, $date) {
global $db;
$soldOuts = array();
try {
	$q = $db->prepare("
		SELECT house_id, movie_id,  showdate, showtime, showcode, showtext, soldout 
		FROM Perfs WITH (NOLOCK) 
		WHERE soldout=1 and house_id = :house_id AND showdate >= :date ORDER BY movie_id ASC
	");
	$q->execute(array(':house_id' => $house_id, ':date' => $date));
	$soldOuts = $q->fetchAll(PDO::FETCH_ASSOC);	
} catch (PDOException $e) {
	handle_exception($e);
}

return $soldOuts;
}

/**
* Gets a two dimensional array of houses in the specified
* chain and important data for each.
* 
* @param $db
* @param $site_id (can be blank)
* @return Array $houses[numeric][key] a two dimensional array
*/
function chain_get_houses($site_id) {
global $db;
$houses = array();
try {
		$sql = "SELECT 
					h.house_id, 
					ISNULL(sh.name,h.name) as name, 
					ISNULL(sh.address,h.address1) AS address, 
					h.address2, 
					ISNULL(sh.city,h.city) AS city, 
					ISNULL(sh.state,h.state) AS state, 
					h.zip, 
					RTRIM(isnull(NULLIF(sh.phoneoffice, ''),h.phone1)) as phone,
					ISNULL(sh.Phone,h.movieline) as movieline, 
					sh.email, 
					h.digital, 
					h.dolby, 
					h.numscreens, 
					h.seating, 
					h.lat, 
					h.lon, 
					sh.PhotoUrl  
				FROM Cinema..Houses h WITH(NOLOCK)
				INNER JOIN Websites..SiteHouses sh WITH(NOLOCK) ON h.house_id = sh.house_id AND sh.siteid = :site_id 
				ORDER BY state, name ";
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $site_id));
	$houses = $q->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}

return $houses;
}
/**
* Gets a two dimensional array of movies that are playing
* in the specified site on the specified date.
* 
* @param $db
* @param $site_id
* @param $date YYYY-MM-DD
*
* @return Array $movies[numeric][key] a two dimensional array
*/
function chain_get_now_playing($site_id, $date, $site_country) {
global $db;
$movies = array();
try {
	$sql = "SELECT DISTINCT 
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
	$q->execute(array(':site_id' => $site_id, ':country' => $site_country, ':date' => $date));
	$movies = $q->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}

return $movies;
}

/**
* Gets a two dimensional array of all movies coming soon 
* for the specified site based on FilmsXpress data.
* 
* @param $site_id
* @return Array $movies[numeric][key] a two dimensional array
* @see function 'sort_by_name'
*/
function fxp_get_coming_soon($site_id, $site_country, $limit=null) {
global $db;
$movies = array();

//if coming soon, add showdate field
if ($type == "cs") {
	$field = "";
	$join = "";
	$group = "";
}

if($limit) {$limit_sql = " TOP ".$limit;}


try {
	$sql = "SELECT". $limit_sql." 
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
		    FROM Websites..ComingSoon cs WITH(NOLOCK)
		    JOIN Cinema..Movies m WITH(NOLOCK) on m.movie_id = cs.movie_id AND m.parent_id = '0'
		    LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON r.movie_id = m.movie_id and r.sid = :sid 
		    LEFT OUTER JOIN Cinema..Screens s WITH(NOLOCK) on m.movie_id = s.movie_id and s.house_id in 
				(SELECT house_id from Websites..SiteHouses WITH(NOLOCK) where siteid = :site_id2)
			LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = cs.movie_id AND i.country = :country
			LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK) ON i.movie_id = ip.movie_id AND i.country = ip.ip_country
		    WHERE CAST(isnull(isnull(cs.release,m.release),getdate()+1) as DateTime) > getdate()
		    and cs.SiteId = :site_id ";
	//finish query
	$sql .=  " GROUP BY cs.movie_id, isnull(cs.release,ISNULL(i.release,m.release)), m.hiphotos, isnull(cs.title,ISNULL(i.fname,m.name)), m.mpaa, m.actor1, m.actor2, m.director,	m.runtime,m.videos, r.capsule,cs.posterImage,ip.ip_filename 
			   ORDER BY release, name";
	$q = $db->prepare($sql);
	$q->execute(array(':site_id' => $site_id, ':site_id2' => $site_id, ':sid' => 'HOME', ':country' => $site_country));
	$movies = $q->fetchAll(PDO::FETCH_ASSOC);
	for ($i = 0; $i < count($movies); $i++) {
		$movies[$i]['name'] = trim($movies[$i]['name']); // consistency
	}
} catch (PDOException $e) {
	handle_exception($e);
}
return $movies;
}

/**
* Gets an array of important data for the specified movie
* 
* @param $db PDO Object
* @param $movie_id
* @return Array $data an associative array of movie data
*/
function movie_get_data($movie_id, $site_id, $site_country) {
global $db;
$movie = array();
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
	$q->execute(array(':movie_id' => $movie_id, ':SiteId' => $site_id, ':country' => $site_country));
	$movie = $q->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}

return $movie;
}

/**
* Gets an array of movie still URLs for the specified movie,
* ignoring the first filename returned from the query because 
* it is a movie poster.
* 
* @param $db
* @param $movie_id
* @param $res ('low' or 'high')
* @return Array $stills[numeric] an array of valid image URLs
* @see function 'build_still_url'
*/
function movie_get_stills($movie_id, $res) {
global $db;
$stills = array();
try {
	$q = $db->prepare("EXEC cs_ListPhotos :movie_id");
	$q->execute(array(':movie_id' => $movie_id));
	$rs = $q->fetchAll(PDO::FETCH_ASSOC);
	
	// Ignore first still because it is a movie poster.
	for ($i = 1; $i < count($rs); $i++) {
		$still = build_still_url($rs[$i]['filename']);

		//we need to replace the 0(number).jpg with H(number).jpg for high res
		if ($res == 'high') {
			$still = substr_replace($still,'H',-6,1);
		}
		
		//add to the array
		$stills[] = $still;
	}
} catch (PDOException $e) {
	handle_exception($e);
}

return $stills;
$rs = NULL;
}
/**
* Gets an array of showdates for the specified chain and movie
* on the specified date. 
* 
* @param $db
* @param $site_id
* @param $movie_id
* @param $date YYYY-MM-DD
*
* @return Array $dates[numeric]
*/
function chain_get_movie_showdates($site_id, $movie_id, $date, $weekly) {
global $db;
$dates = array();
$showdates = array();
$i = 0;
$friday_old = '';
try {
	$sql = "SELECT distinct showdate 
		    FROM Screens WITH(NOLOCK) WHERE house_id in
				(SELECT house_id FROM Websites..SiteHouses WITH(NOLOCK)
				WHERE siteid = :siteid)
		    and showdate >= :showdate and movie_id = :movie_id 
		    ORDER BY showdate";
	$q = $db->prepare($sql);
	$q->execute(array(':siteid' => $site_id, ':showdate' => $date, ':movie_id' => $movie_id));
	$dates = $q->fetchAll(PDO::FETCH_ASSOC);

	//loop through array
	if (!empty($dates)) {
		foreach ($dates as $d) {
			if ($weekly){
				$friday = (date('w', strtotime($d['showdate'])) == 5) ? $d['showdate'] : date('Y-m-d', strtotime('last friday '. $d['showdate']));
				if ($friday == $friday_old){
					continue;
				}
				$showdate = date('n/j/Y', strtotime($friday)); 
				$friday_old = $friday;
				
				/*echo "<script>console.log('".$d['showdate']." $friday');</script>";*/
			} else {
			//get the showdate
				$showdate = date('n/j/Y', strtotime($d["showdate"]));
			}
			//save the first date
			if ($i == 0) {
				$showdates["start_date"] = $showdate;
			}
			
			//add to the showdates sub array
			$showdates["showdates"][$i] = $showdate;
			$i++;
		}
	} else {
		$showdates["start_date"] = date('n/j/Y');
		$showdates["showdates"][0] = date('n/j/Y');
	}
	$dates = NULL;	
} catch (PDOException $e) {
	handle_exception($e);
}

return $showdates;
}
/**
* Gets an array of showtime data for the specified movie at
* at all houses within the chain on the specified date.
* 
* @param $movie_id
* @param $date YYYY-MM-DD
* @return Array $showtimes[key] a array of showtime data
*/
function movie_get_showtimes_site($site_id, $movie_id, $date, $weekly) {
global $db;
$showtimes = array();
$time_fields = showtime_fields();

$friday = '';
$thursday = '';
if ($weekly){
	$friday = (date('w', strtotime($date)) == 5) ? $date : date('Y-m-d', strtotime('last friday '. $date));
	$thursday = date('Y-m-d', strtotime('this thursday ' . $friday));
	$date_range = "AND s.showdate > '$friday' AND s.showdate <= '$thursday'";
} else {
	$date_range = "AND s.showdate = '$date'";
}

try {
	$sql = "SELECT sh.house_id, s.house_id as show_house_id, ISNULL(sh.name,h.name) as name, m.name as movie_name, 
			s.movie_id, s.showdate, s.comment, s.allowpass, $time_fields, sh.posType, sh.posURL, h.ticketing, cs.custom_text
			FROM Websites..SiteHouses sh WITH(NOLOCK) 
			JOIN Cinema..Movies m WITH(NOLOCK) ON m.movie_id = :movie_id OR m.parent_id = :parent_id
			JOIN Cinema..Screens s WITH(NOLOCK) ON s.house_id = sh.house_id and s.movie_id = m.movie_id $date_range
			JOIN Cinema..Houses h WITH(NOLOCK) ON h.house_id = sh.house_id 
			LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.SiteId = sh.SiteId AND cs.movie_id = s.movie_id
			WHERE sh.siteid = :site_id 
			ORDER BY name, movie_name ASC ";
	$q = $db->prepare($sql);
	$q->execute(array(':site_id' => $site_id, ':movie_id' => $movie_id, ':parent_id' => $movie_id));
	$showtimes = $q->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}
return $showtimes;
}
/**
* Gets a array of details for a specific FXP page
* 
* @param $db
* @param $site_id
* @param $page_id
* @return Array $page[key] 
*/
function fxp_get_page_details($site_id, $page_id) {
global $db;
$pages = array();

try {
	$sql = "SELECT p.PageId, p.SiteHeadline, p.PageStart, p.PageEnd   
			FROM websites..pages p WITH(NOLOCK)
			WHERE p.SiteId = :site_id and p.PageId = :page_id";
	$q = $db->prepare($sql);
	$q->execute(array(':site_id' => $site_id, ':page_id' => $page_id));
	$page = $q->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	handle_exception($e);
}
return $page;
}

/**
* Gets the html content from the specified FilmsXpress page.
* 
* @param $site_id
* @param $page_id
* @return String the contents of a FilmsXpress page
* @see function 'fxp_build_page_url'
*/
function fxp_get_page($site_id, $page_id) {

//we want to make sure the file exists and handle the error if it doesn't
try {
	$html = @file_get_contents(fxp_build_page_url($site_id, $page_id));
} catch (PDOException $e) {
	$html = $e;
}

return $html;
}

/**
 * Gets a two dimensional array of all pages for a website
 * 
 * @param $db
 * @param $site_id
 * @param $today
 * @return Array $pages[numeric][key] a two dimensional array
 */
function fxp_get_created_pages($site_id, $type, $date) {
	global $db;
	$pages = array();
	$filter = "";
	
	//was a type passed in?
	if ($type == "top") {
		$filter = "AND p.navTop = 1";
	} elseif ($type == "bottom") {
		$filter = "AND p.navBottom = 1";
	}

	try {
		$sql = "SELECT p.PageId, p.SiteHeadline, p.PageType, p.NewWindow   
				FROM websites..pages p WITH(NOLOCK)
				WHERE p.SiteId = :site_id ".$filter ." 
				AND (cast(p.PageStart as datetime) <= '".$date."' or p.PageStart is null or p.PageStart = '')
				AND (cast(p.PageEnd as datetime) > '".$date."' or p.PageEnd is null or p.PageEnd = '')
				AND (p.IsMessage IS NULL OR p.IsMessage = 0)
				ORDER BY p.Priority, p.PageType DESC, p.SiteHeadline";
				
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $site_id));
		$pages = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	return $pages;
}


/**
 * Gets a two dimensional array of carousel items (url, caption, image) 
 * for the specified site based on from FilmsXpress data.
 * 
 * @param $db
 * @param $site_id
 * @return Array $items[numeric][key] a two dimensional array
 * @see function 'fxp_build_carousel_photo_url'
 */
function fxp_get_carousel($site_id, $category) {
	global $db;
	$items = array();
	
	if ($category != "") {
		$category_match = "and category = '$category' ";
	}
	
	try {
		$q = $db->prepare("SELECT * FROM websites..carousel WITH(NOLOCK) 
						   WHERE SiteID = :site_id AND (cast(expDate as datetime) >= :today or expDate is null or expDate = '') 
						   AND (cast(startDate as datetime) <= :today2 or startDate is null or startDate = '') $category_match
						   ORDER BY sort");
		$q->execute(array(':site_id' => $site_id, ':today' => date('m/d/Y'), ':today2' => date('m/d/Y')));
		$rs = $q->fetchAll(PDO::FETCH_ASSOC);
		foreach ($rs as $r) {
			$item = array();
			
			//fill in the $items array
			if (!empty($r['URL'])) {
				$item['url'] = $r['URL'];
			} else {
				$item['url'] = '#';
			}
			if ($r['targetURL'] == "1") {
				$item['target'] = "_blank";
			} else {
				$item['target'] = "_self";
			}
			if (!empty($r['imageTXT'])) {
				$item['caption'] = htmlspecialchars($r['imageTXT'], ENT_QUOTES);
			} else {
				$item['caption'] = '';
			}
			
			if (stripos($r['largeImage'], '//') !== false){
				$item['image'] = $r['largeImage'];
			} else {
				$item['image'] = build_carousel_photo_url($site_id, $r['largeImage']);
			}
			
			$items[] = $item;
		}
	} catch (PDOException $e) {
		handle_exception($e);
	}
	return $items;
}