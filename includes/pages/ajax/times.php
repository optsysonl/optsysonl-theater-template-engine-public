<?php

//Get Querystring
$house_id = (isset($mapping['house_id'])) ? $mapping['house_id'] : '';
$date = $mapping['date'];
$ticketing =  $mapping["ticketing"];
$state = (isset($mapping["state"])) ?  $mapping["state"] : '';

$CACHE_ajax_times = $cache->getItem($config->getConfig('site_id').'_ajax_times_'.$house_id."_".$date);
if (!$CACHE_ajax_times->isHit()) {
	//set up other variables
	$weekly = (trim($config->getConfig("timestype")) == "weekly") ? true : false;
	$drive_in = (check_drivein($house_id)) ? true : false;

	//set default date if none passed in
	if ($date == "") {
		$date = date("Y-m-d");
	}
	if ($house_id != ""){
		
		$i = 0;
		$DATA_house_get_showtimes = house_get_showtimes($house_id, $config->getConfig("site_id"), $date, $config->getConfig("site_country"), $weekly, $drive_in);
		
		// If they want to display sold out information, retrieve from perfs
		$soldouts = house_get_perfs_soldout($house_id, $date);
		$movies = array();
		//start the first div
		foreach ($DATA_house_get_showtimes as $st) {
		
			//set some variables
			$a_movie['movie_id'] = fix_movie_id($st["movie_id"]);
			$a_movie['name'] = fix_movie_name($st["name"]);
			$a_movie['actors'] = trim($st["actor1"]).", ".trim($st["actor2"]);
			$a_movie['runtime'] = fix_movie_runtime($st["runtime"]);
			$a_movie['poster'] = ($st['posterImage'] != '') 
						? fxp_build_poster_url($config->getConfig("site_id"), $st['posterImage']) 
						: build_poster_url($a_movie['movie_id'], $st["hiphotos"], '', $site_country, $st['ip_filename']);
			$a_movie['url'] = "/movie/". $a_movie['movie_id'] . "/" . url_name($a_movie['name']) . "-Trailer-and-Info";;
			$a_movie['trailer'] = build_trailer_url($a_movie['movie_id'], $st['flv_high']);
			
			if ($config->getConfig("site_country") == 'CAN'){
				$a_movie['mpaa'] = get_province_rating($st["mpaa"], $state);
			}else{
				$a_movie['mpaa'] = $st["mpaa"];
			}

			if ($weekly){
				$a_movie['day'] = date('D, F j', strtotime($st['showdate']));
			}
		
			if (strpos($st['movie_name'], 'IMAX 3D') !== false){
				$a_movie['videoFormat'] .= 'IMAX 3D';
			} elseif (strpos($st['movie_name'], 'IMAX') !== false){
				$a_movie['videoFormat'] .= 'IMAX';
			} elseif (strpos($st['movie_name'], '3D') !== false){
				$a_movie['videoFormat'] .= '3D';
			}else{
				$a_movie['videoFormat'] = null;
			}
			
			$times = array();
			$cur_time = date('H:i', strtotime("now")); 
			$cur_date = date('mdY', strtotime("today"));
			$showdate = date('mdY', strtotime("$date"));
			$week_showdate = date('mdY', strtotime($st['showdate']));
			//build a string of showtiems with ticketing if this house has online ticketing
			if ($ticketing) {
				//$times = build_showtimes_string(build_showtimes_ticketing($house_id, $st, $date, $soldouts), $delimeter);
				
				for ($i = 1; $i < 49; $i++) {				
					//make sure the time field is not blank
					if (strlen(trim($st["time$i"])) !== 0) {
	
						//format the showtime and ticketing URL
						//$time['time'] = build_showtime($arr["time$i"], $arr["mer$i"]);
						$link = build_showtime_url($house_id, fix_movie_id($st['movie_id']), $st['showdate'], $st["time$i"], $st["mer$i"]);
						
						//we need to figure out if the time is past 'Now'
						$showtime = build_military_time($st["time$i"], $st["mer$i"]);
						//print_r($showtime ."-". $cur_time . "-".$showdate . "-".$week_showdate);die;
						//add the disabled style if the showdate and current date are the same and we are past the showtime			
						if (($showtime < $cur_time) && ($cur_date == $showdate) && ($cur_date == $week_showdate)) {
							$times[] = array('time'=> build_showtime($st["time$i"],$st["mer$i"]) , 'class'=>'showtime expired');
						} else { 
							if (isSoldOut($soldouts, $house_id, fix_movie_id($arr['movie_id']), $arr['showdate'], $showtime, $arr['comment'])) {
								$times[] = array('time'=> build_showtime($st["time$i"],$st["mer$i"]) , 'class'=>'showtime', 'soldout'=> true);
							} else {
								$times[] = array('time'=> build_showtime($st["time$i"],$st["mer$i"]) , 'class'=>'showtime hvr-sweep-to-right', 'link'=>$link);
							}
						}
					}
				}
				$a_movie['times'] = $times;
			} else {
				//$times = build_showtimes_string(build_showtimes($house_id, $st, $date), $delimeter);
		
				// $house_id, $arr, $showdate
				for ($i = 1; $i < 49; $i++) {
					if (strlen(trim($st["time$i"])) !== 0) {					
						//we need to figure out if the time is past 'Now'
						$showtime = build_military_time($st["time$i"], $st["mer$i"]);					
						//give teh showtime an 'expired' class if it is past 'now'
						if (($showtime < $cur_time) && ($cur_date == $showdate)) {
							$times[] = array('time'=> build_showtime($st["time$i"], $st["mer$i"]) , 'class'=>'showtime expired');
						} else {
							$times[] = array('time'=> build_showtime($st["time$i"], $st["mer$i"]) , 'class'=>'showtime');
						}
						
					}
				}
				$a_movie['times'] = $times;
				
			}
		
			//store some variables
			$i++;
			array_push($movies, $a_movie);
		}
		
	}
	$data['house_showtimes']= $movies;
	$CACHE_ajax_times->expiresAfter($cache_time['5min']);
	$CACHE_ajax_times->set($data['house_showtimes']);
    $cache->save($CACHE_ajax_times);	
}else{
	$data['house_showtimes'] = $CACHE_ajax_times->get();
}


$file = 'ajax/times.html';