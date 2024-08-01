<?php
//Get Querystring
$movie_id = (isset($mapping['movie_id'])) ? $mapping['movie_id'] : '';
$date = $mapping['date'];
$ticketing = $mapping['ticketing'];

$CACHE_ajax_movie = $cache->getItem($config->getConfig('site_id').'_ajax_movie_'.$movie_id."_".$date);
if (!$CACHE_ajax_movie->isHit()) {


	//set up other variables
	$weekly = (trim($config->getConfig("timestype")) == "weekly") ? true : false;
	
	$time_fields = showtime_fields();
	
	if ($weekly){
		$friday = (date('w', strtotime($date)) == 5) ? $date : date('Y-m-d', strtotime('last friday '. $date));
		$thursday = date('Y-m-d', strtotime('this thursday ' . $friday));
		$date_range = "AND s.showdate > '".$friday."' AND s.showdate <= '".$thursday."'";
	} else {
		$date_range = "AND s.showdate = '".$date."'";
	}
	
	try {
		$sql = "SELECT sh.house_id, s.house_id as show_house_id, ISNULL(sh.name,h.name) as name, m.name as movie_name, 
				s.movie_id, s.showdate, s.comment, s.allowpass, ".$time_fields.", sh.posType, sh.posURL, h.ticketing, cs.custom_text
				FROM Websites..SiteHouses sh WITH(NOLOCK) 
				JOIN Cinema..Movies m WITH(NOLOCK) ON m.movie_id = :movie_id OR m.parent_id = :parent_id
				JOIN Cinema..Screens s WITH(NOLOCK) ON s.house_id = sh.house_id and s.movie_id = m.movie_id ".$date_range."
				JOIN Cinema..Houses h WITH(NOLOCK) ON h.house_id = sh.house_id 
				LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.SiteId = sh.SiteId AND cs.movie_id = s.movie_id
				WHERE sh.siteid = :site_id 
				ORDER BY name, movie_name ASC ";
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $config->getConfig('site_id'), ':movie_id' => $movie_id, ':parent_id' => $movie_id));
		$showtimes = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	$houses = array();
	foreach ($showtimes as $h) {
		$a_house['house_id'] = $h["house_id"];
		$a_house['name'] = trim($h['name']);
		$movie_name = $h['movie_name'];
		$a_house['url'] = url_name($a_house['name']) . "-Showtimes";
		//$a_house['showdate'] = $h['showdate'];
		$comment = '';
		$a_house['custom_text'] = ($h['custom_text'] != '') ? '<span id="custom-text">' . $h['custom_text'] . '</span>' : '';
		$ticketing =  get_ticketing($h);	
		$timezone_temp = get_site_house_timezone($h["house_id"], $config->getConfig('site_id'));
		if ($timezone_temp != date_default_timezone_get()){
			date_default_timezone_set($timezone_temp);
		}
		$soldouts = house_get_perfs_soldout($h["house_id"], $date);
		if ($weekly){
			$day = date('D, F j', strtotime($h['showdate']));
		}
		$times = array();
		$cur_time = date('H:i', strtotime("now")); 
		$cur_date = date('mdY', strtotime("today"));
		$showdate = date('mdY', strtotime("$date"));
		$week_showdate = date('mdY', strtotime($h['showdate']));
		//determine if ticketing or not
		if ($ticketing) {
			//$times = build_showtimes_string(build_showtimes_ticketing($house_id, $st, $date, $soldouts), $delimeter);
			
			for ($i = 1; $i < 49; $i++) {				
				//make sure the time field is not blank
				if (strlen(trim($h["time$i"])) !== 0) {
	
					//format the showtime and ticketing URL
					//$time['time'] = build_showtime($arr["time$i"], $arr["mer$i"]);
					$link = build_showtime_url($a_house['house_id'], fix_movie_id($h['movie_id']), $h['showdate'], $h["time$i"], $h["mer$i"]);
					
					//we need to figure out if the time is past 'Now'
					$showtime = build_military_time($h["time$i"], $h["mer$i"]);
					//print_r($showtime ."-". $cur_time . "-".$showdate . "-".$week_showdate);die;
					//add the disabled style if the showdate and current date are the same and we are past the showtime			
					if (($showtime < $cur_time) && ($cur_date == $showdate) && ($cur_date == $week_showdate)) {
						$times[] = array('time'=> build_showtime($h["time$i"],$h["mer$i"]) , 'class'=>'showtime expired');
					} else { 
						if (isSoldOut($soldouts, $a_house['house_id'], fix_movie_id($arr['movie_id']), $arr['showdate'], $showtime, $arr['comment'])) {
							$times[] = array('time'=> build_showtime($h["time$i"],$h["mer$i"]) , 'class'=>'showtime', 'soldout'=> true);
						} else {
							$times[] = array('time'=> build_showtime($h["time$i"],$h["mer$i"]) , 'class'=>'showtime hvr-sweep-to-right', 'link'=>$link);
						}
					}
				}
			}
			$a_house['times'] = $times;
		} else {
			//$times = build_showtimes_string(build_showtimes($house_id, $st, $date), $delimeter);
	
			// $house_id, $arr, $showdate
			for ($i = 1; $i < 49; $i++) {
				if (strlen(trim($h["time$i"])) !== 0) {					
					//we need to figure out if the time is past 'Now'
					$showtime = build_military_time($h["time$i"], $h["mer$i"]);					
					//give teh showtime an 'expired' class if it is past 'now'
					if (($showtime < $cur_time) && ($cur_date == $showdate)) {
						$times[] = array('time'=> build_showtime($h["time$i"], $h["mer$i"]) , 'class'=>'showtime expired');
					} else {
						$times[] = array('time'=> build_showtime($h["time$i"], $h["mer$i"]) , 'class'=>'showtime');
					}
					
				}
			}
			$a_house['times'] = $times;
			
		}
		if (strpos($h['movie_name'], 'IMAX 3D') !== false){
			$a_house['videoFormat'] = 'IMAX 3D';
		} elseif (strpos($h['movie_name'], 'IMAX') !== false){
			$a_house['videoFormat'] = 'IMAX';
		} elseif (strpos($h['movie_name'], '3D') !== false){
			$a_house['videoFormat'] = '3D';
		}else{
			$a_house['videoFormat'] = null;
		}
		
		//store some variables
		$i++;
		array_push($houses, $a_house);
		
	}
	$data['moviehouses'] = $houses;
	$CACHE_ajax_movie->expiresAfter($cache_time['5min']);
	$CACHE_ajax_movie->set($data['moviehouses']);
    $cache->save($CACHE_ajax_movie);	
}else{
	$data['moviehouses'] = $CACHE_ajax_movie->get();
}
$file = 'ajax/movie.html';