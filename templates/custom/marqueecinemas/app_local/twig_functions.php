<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 4/27/2018
 * Time: 10:47 AM
 */

use App\Core\Cache;

function getHouseTimesFunction($showdates, $house_id){

    $cacheItem = Cache::getItem('getHouseTimes_' . md5(json_encode($showdates)).'_' . $house_id);
    if (!Cache::isHit($cacheItem)) {
        $this_house_dates = [];
        $this_house_data = [];

        foreach ($showdates as $a_showdate) {
            if ($a_showdate['house_id'] == $house_id) {
                $this_house_dates[] = $a_showdate['date'];
                $main_movie_id = $a_showdate['movie_id'];
                if ($a_showdate['parent_id']) {
                    $main_movie_id = $a_showdate['parent_id'];
                }

                $comment = $a_showdate['details']['comment'];

                $this_house_data[$a_showdate['date']]['movies'][$main_movie_id][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
            }
        }
        $this_house_dates = array_unique($this_house_dates, $sort_flags = SORT_STRING);
        ksort($this_house_dates);

        $data['dates'] = $this_house_dates;
        $data['showtimes'] = $this_house_data;

        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($data);
        Cache::save($cacheItem);
    } else {
        $data = $cacheItem->get();
    }

    return $data;
}

function getMovieTimesFunction($showdates, $movie_id){

    $cacheItem = Cache::getItem('getMovieTimes_' . md5(json_encode($showdates)).'_' . $movie_id);
    if (!Cache::isHit($cacheItem)) {
        $this_movie_dates = [];
        $this_movie_data = [];

        foreach ($showdates as $a_showdate) {
            if ($a_showdate['movie_id'] == $movie_id || $a_showdate['parent_id'] == $movie_id) {
                $this_movie_dates[] = $a_showdate['date'];

                $comment = $a_showdate['details']['comment'];

                $this_movie_data[$a_showdate['date']]['houses'][$a_showdate['house_id']][$a_showdate['details']['format']['value']][$comment][$a_showdate['time']]['details'] = $a_showdate['details'];
            }
        }
        $this_movie_dates = array_unique($this_movie_dates, $sort_flags = SORT_STRING);
        ksort($this_movie_dates);

        $data['dates'] = $this_movie_dates;
        $data['showtimes'] = $this_movie_data;

        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($data);
        Cache::save($cacheItem);
    } else {
        $data = $cacheItem->get();
    }

    return $data;
}

function removesWithOutShowdatesFunction($movies=[], $showdates=[]){

    $results = [];

    $cacheItem = Cache::getItem('removesWithOutShowdates_' . md5(json_encode($movies)).'_' . md5(json_encode($showdates)));
    if (!Cache::isHit($cacheItem)) {
        $showdates_movies = array_unique(array_column($showdates, 'movie_id'));

        foreach ($movies as $movie_id=>$movie){
            if(in_array($movie_id,$showdates_movies) ){
                array_push($results, $movie);
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($results);
        Cache::save($cacheItem);
    } else {
        $results = $cacheItem->get();
    }

    return $results;
}

function getMoviesFunction($showdates, $movies){

	$cacheItem = Cache::getItem('getMovies_' . md5(json_encode($movies)).'_' . md5(json_encode($showdates)));
    if (!Cache::isHit($cacheItem)) {
        $this_house_data = [];

        if (!empty($showdates)) {
            foreach($showdates as $a_showdate){
                if ($a_showdate['details']['expired'] == false && isset($a_showdate['details']['link'])) {
                    $this_house_dates[] =  $a_showdate['date'];
                    $main_movie_id = $a_showdate['movie_id'];
                    $date = date('l, F j', strtotime($a_showdate['date']));
                    $time = date('h:i A', strtotime($a_showdate['time']));
                    if(!empty($a_showdate['details']['comment'])){$time = $time."(".$a_showdate['details']['comment'].")";}
                    $this_house_data[$a_showdate['house_id']][$movies['movies'][$main_movie_id]['name']][$date][$time] = $a_showdate['details']['link'];
                }
            }
        }

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($this_house_data);
        Cache::save($cacheItem);
    } else {
        $this_house_data = $cacheItem->get();
    }

	return $this_house_data;
}

function getMovieDataFunction($data, $movie_id){

    $cacheItem = Cache::getItem('getMovies_' . md5(json_encode($data)).'_' . $movie_id);
    if (!Cache::isHit($cacheItem)) {
        $result = [];
        foreach ($data['showdates'] as $showdate) {

            if ($showdate['movie_id'] == $movie_id || $showdate['parent_id'] == $movie_id) {
                $house = $data['houses'][$showdate['house_id']];
                $house_name = str_replace("Marquee Cinemas - ", "", $house['name']) . " - " . $house['city'];

                $comment = $showdate['details']['comment'];

                $result[$house_name][date('l, F j', strtotime($showdate['date']))][$showdate['details']['format']['value']][$comment][date('g:iA', strtotime($showdate['time']))] = [
                    'link'    => $showdate['details']['link'],
                    'expired' => $showdate['details']['expired'] ? 'expired' : '',
                ];
            }
        }
        $cacheItem->expiresAfter(Cache::TIME15MIN);
        $cacheItem->set($result);
        Cache::save($cacheItem);
    } else {
        $result = $cacheItem->get();
    }
    return $result;
}

/**
 * Group by Now Playing & ComingSoon Movies
 *
 * @param array  $arr
 *
 * @return array
 */
function NowPlayingComingSoonFunction($movies, $showdates)
{
    $cacheItem = Cache::getItem('NowPlayingComingSoon_' . md5(json_encode($movies)).'_' . md5(json_encode($showdates)));
    if (!Cache::isHit($cacheItem)) {

        $today = date('Y-m-d');
        if (config('developer.on')) {
            $today = config('developer.today', $today);
        }

        $result=['np'=>[],'cs'=>[]];
        foreach ($movies as $movie_id => $movie){
            if($movie['release'] <= $today){
                $result['np'][$movie_id] = $movie;
            }else{
                $result['cs'][$movie_id] = $movie;
            }
        }
        $result['np']=removesWithOutShowdatesFunction($result['np'], $showdates);

        $cacheItem->expiresAfter(Cache::TIME1HR);
        $cacheItem->set($result);
        Cache::save($cacheItem);
    } else {
        $result = $cacheItem->get();
    }

    return $result;
}

function formatPricesFunction($prices) {
	$result = [];
	foreach ($prices as $price) {
		foreach ($price['prices'] as $key => $sub_price) {
			$type = $sub_price['name'];
			$type = explode(';',$type);
			if (strpos($sub_price['value'], ';') !== false) {
				$price_rez = explode(';', $sub_price['value']);
				$total = number_format($price_rez[0] + $price_rez[1], 2);
			}
			$result[$key][] = [
				'type' =>  isset($type[0]) ? $type[0] : '',
				'type1' => isset($type[1]) ? $type[1] : '',
				'total' => isset($total) ? $total : $sub_price['value'],
				'base'	=> isset($price_rez[0]) ? $price_rez[0] : '',
				'tax'	=> isset($price_rez[1]) ? $price_rez[1] : ''
			];
		}
	}

	return $result;
}

function getStateListFunction()
{
	//array of state names and abbreviations
	return [
		'AL' => "Alabama",
		'AK' => "Alaska",
		'AZ' => "Arizona",
		'AR' => "Arkansas",
		'CA' => "California",
		'CO' => "Colorado",
		'CT' => "Connecticut",
		'DE' => "Delaware",
		'DC' => "District Of Columbia",
		'FL' => "Florida",
		'GA' => "Georgia",
		'HI' => "Hawaii",
		'ID' => "Idaho",
		'IL' => "Illinois",
		'IN' => "Indiana",
		'IA' => "Iowa",
		'KS' => "Kansas",
		'KY' => "Kentucky",
		'LA' => "Louisiana",
		'ME' => "Maine",
		'MD' => "Maryland",
		'MA' => "Massachusetts",
		'MI' => "Michigan",
		'MN' => "Minnesota",
		'MS' => "Mississippi",
		'MO' => "Missouri",
		'MT' => "Montana",
		'NE' => "Nebraska",
		'NV' => "Nevada",
		'NH' => "New Hampshire",
		'NJ' => "New Jersey",
		'NM' => "New Mexico",
		'NY' => "New York",
		'NC' => "North Carolina",
		'ND' => "North Dakota",
		'OH' => "Ohio",
		'OK' => "Oklahoma",
		'OR' => "Oregon",
		'PA' => "Pennsylvania",
		'RI' => "Rhode Island",
		'SC' => "South Carolina",
		'SD' => "South Dakota",
		'TN' => "Tennessee",
		'TX' => "Texas",
		'UT' => "Utah",
		'VT' => "Vermont",
		'VA' => "Virginia",
		'WA' => "Washington",
		'WV' => "West Virginia",
		'WI' => "Wisconsin",
		'WY' => "Wyoming",
	];
}