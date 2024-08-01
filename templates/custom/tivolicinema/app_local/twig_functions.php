<?php

function getMovieTimesFunction($showdates, $movie_id){

	$this_movie_dates = [];
	$this_movie_data = [];

	foreach($showdates as $a_showdate){
		if($a_showdate['movie_id'] == $movie_id || $a_showdate['parent_id'] == $movie_id){
			$this_movie_dates[] =  $a_showdate['date'];

			$comment = $a_showdate['details']['comment'];
			if ($a_showdate['details']['format']['value'] != "2D"){
				$comment = $a_showdate['details']['format']['value']. ($a_showdate['details']['comment'] != "" ? ", " : ""). $a_showdate['details']['comment'];
			}

			$this_movie_data[$a_showdate['date']]['houses'][$a_showdate['house_id']][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] =  $a_showdate['details'];
		}
	}
	$this_movie_dates = array_unique($this_movie_dates,  $sort_flags = SORT_STRING);
	ksort($this_movie_dates);

	$data['dates'] = $this_movie_dates;
	$data['showtimes'] = $this_movie_data;

	return $data;
}

function getTicketRequestDataFunction($data, $screen_id, $time){
	if (!$time = timeValidation($time)) {
		//TODO do something
	}
	$showtime = [];
	$return = [];
	foreach ($data['showdates'] as $showdate) {
		if($showdate['details']['screens_id'] == $screen_id && $showdate['time'] == $time) {
			$showtime = [
				'id'	=> $showdate['movie_id'],
				'date'		=> $showdate['date'],
				'time'		=> $showdate['time'],
			];
			break;
		}
	}

	if(!empty($showdate)) {
		if(isset($data['movies']['movies'][$showtime['id']])) {
			$return = array_merge($data['movies']['movies'][$showtime['id']], $showtime);
		}
	}
	return $return;
}

function timeValidation($time) {
	$time = substr($time, 0, 2) . ":" . substr($time, 2, 4);

	if (preg_match("/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/", $time)) {
		return $time;
	}
	return false;
}

function getTicketRequestOptionsFunction() {
	$return = "";
	for ($i = 0; $i<11; $i++) {
		$return .= '<option label="' . $i . '" value="' . $i . '">' . $i . '</option>';
	}
	return $return;
}