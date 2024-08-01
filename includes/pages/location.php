<?php
require_once $pages_dir . 'meta.php';
require_once $pages_dir . 'header.php';
require_once $pages_dir . 'footer.php';
$class['body'] = 'location';

$CACHE_location_house = $cache->getItem($config->getConfig('site_id').'_location_house_'.$mapping['house_id']);
if (!$CACHE_location_house->isHit()) {
	$data['house']['house_id'] = $mapping['house_id'];
	try {
		$sql = "
			SELECT 
				ISNULL(sh.name,ch.name) as name, 
				ISNULL(sh.address,ch.address1) as address, 
				ISNULL(sh.phone,ch.movieline) as movieline,
				ISNULL(sh.phoneoffice,ch.phone1) as office_phone, 
				ISNULL(sh.city,ch.city) AS city, 
				ISNULL(sh.state,ch.state) as state, 
				ch.zip,  
				sh.tagline, 
				sh.PhotoUrl, 
				sh.email,
				ch.ticketing,
				sh.posURL,
				sh.facebook, 
				sh.twitter, 
				sh.instagram, 
				sh.pintrest, 
				sh.google,
				sh.amenities,
				sh.posType,
				message_page,
				policies,
				sh.map
			FROM 
				Cinema..Houses ch WITH(NOLOCK)
			INNER JOIN 
				Websites..SiteHouses sh WITH(NOLOCK) 
			ON 
				ch.house_id = sh.house_id and sh.siteid = :site_id
			WHERE 
				ch.house_id = :house_id";
		$q = $db->prepare($sql);
		$q->execute(array(':site_id' => $config->getConfig("site_id"),':house_id' => $data['house']['house_id']));
		$house = $q->fetch(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}

	$data['house']['name'] = $house['name'];
    $data['house']['url'] = url_name($house['name']) . "-Showtimes";
	$data['house']['address'] = trim($house['address']);
	$data['house']['city'] = trim($house['city']);
	$data['house']['state_short'] = trim($house['state']);
	$data['house']['zip'] = trim($house['zip']);
    $data['house']['map']['url'] = $house['map'];
    $data['house']['map']['address'] = str_replace(' ', '+', trim($house['address']) . " " . trim($house['city']) . ", " . trim($house['state']) . " " . trim($house['zip']));

	$data['house']['main_phone'] = $house['office_phone'];
	$data['house']['movieline'] = $house['movieline'];
	$data['house']['email'] = $house['email'];
	$data['house']['amenities'] = explode(';', $house['amenities']) ;
	$data['house']['tagline'] = $house['tagline'];
	$data['house']['policies'] = $house['policies'];
	$data['house']['photo'] = build_house_photo_url($config->getConfig("site_id"), $house["PhotoUrl"]);
    $data['house']['message']['title'] = fxp_get_page_details( $config->getConfig("site_id"), trim($house["message_page"]))['SiteHeadline'];
    $data['house']['message']['text'] = fxp_get_message($config->getConfig("site_id"), trim($house["message_page"]));
	
	$data['house']['social_icons']['facebook']['link'] = trim($house['facebook']);
	$data['house']['social_icons']['facebook']['img'] = build_DataURI( $template_dir."assets/img/facebook.svg");
	$data['house']['social_icons']['twitter']['link'] = trim($house['twitter']);
	$data['house']['social_icons']['twitter']['img'] = build_DataURI( $template_dir."assets/img/twitter.svg");
	$data['house']['social_icons']['instagram']['link'] = trim($house['instagram']);
	$data['house']['social_icons']['instagram']['img'] = build_DataURI( $template_dir."assets/img/instagram.svg");
	$data['house']['social_icons']['pintrest']['link'] = trim($house['pintrest']);
	$data['house']['social_icons']['pintrest']['img'] = build_DataURI( $template_dir."assets/img/pinterest.svg");
	$data['house']['social_icons']['google_plus']['link'] = trim($house['google']);
	$data['house']['social_icons']['google_plus']['img'] = build_DataURI( $template_dir."assets/img/google.svg");

	try {
		$sql = "
			SELECT 
				* 
			FROM 
				Websites..Prices p WITH(NOLOCK) 
			WHERE 
				p.house_id = :house_id
			ORDER BY 
				price_daypart DESC";
		$q = $db->prepare($sql);
		$q->execute(array(':house_id' => $data['house']['house_id']));
		$hs_pr = $q->fetchAll(PDO::FETCH_ASSOC);
	} catch (PDOException $e) {
		handle_exception($e);
	}
	
	$dataprices = array();
	foreach ($hs_pr as $p) {
		//setup variables
		$prices = array();
		$category = trim($p["price_daypart"]);
		
		//extract the price fields into an array
		for ($i=1; $i<=6; $i++) {
			if($p["price_cat".$i] != ""){
				$prices[$i]['name'] = trim($p["price_cat".$i]);
				$prices[$i]['value'] = trim($p["price_amount".$i]);
			}
		}
		
		array_push($dataprices, array('cat'=>$category, 'prices'=>$prices ) );
		
	}
	$data['house']['prices'] = $dataprices;

	$data['house']['ticketing'] =  get_ticketing($house);	
	//$data['house']['message'] = fxp_get_message($config->getConfig("site_id"), $data['house']['house_id']);

	$CACHE_location_house->expiresAfter($cache_time['4hrs']);
	$CACHE_location_house->set($data['house']);
	$cache->save($CACHE_location_house);
	
}else{
	$data['house'] = $CACHE_location_house->get();
}


$CACHE_location_house_showdate = $cache->getItem($config->getConfig('site_id').'_location_house_'.$mapping['house_id'].'_showdates');
if (!$CACHE_location_house_showdate->isHit()) {
	
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
		$q->execute(array(':house_id' => $data['house']['house_id'], ':date' => $today));
		$dates = $q->fetchAll(PDO::FETCH_ASSOC);
		
		//loop through array
		if (!empty($dates)) {
			foreach ($dates as $d) {
								
				if($today == date('Y-m-d', strtotime($d["showdate"]) )){
					$title = "Today";
					
				}else{
					$title = date('D n/j', strtotime($d["showdate"]));
				}
				$this_date = date('Y-m-d', strtotime($d["showdate"]));
				//add to the showdates sub array
				$showdates['dates'][$i] = array('title'=>$title, 'date'=>$this_date);
				$i++;
			}
		} else {
			$showdates["start_date"] = date('n/j/Y');
			$showdates["showdates"][0] = date('n/j/Y');
		}
	} catch (PDOException $e) {
		handle_exception($e);
	}
	$data['house_showdate'] = $showdates;
	
	$CACHE_location_house_showdate->expiresAfter($cache_time['4hrs']);
	$CACHE_location_house_showdate->set($data['house_showdate']);
	$cache->save($CACHE_location_house_showdate);
	
}else{
	$data['house_showdate'] = $CACHE_location_house_showdate->get();
}


$CACHE_location_slides = $cache->getItem($config->getConfig('site_id').'_slides_location_'.$data['house']['house_id']);

if (!$CACHE_location_slides->isHit()) {	
	$sliders=fxp_get_carousel($config->getConfig("site_id"), 'Location-'.$data['house']['house_id']);
	$sliders_new = array();	
	foreach ($sliders as $s) {
		$a_slider_new = array();
		
		$a_slider_new['image'] = $s['image'];
		$a_slider_new['url'] = $s['url'];
		$a_slider_new['target'] = $s["target"];
		$a_slider_new['image_text'] = $s["caption"];
		
		if ($s['altTag'] != ""){
			$a_slider_new['altTag'] = $s['altTag'];
		} elseif (strlen(trim($s['url'])) > 1){
			$a_slider_new['altTag'] = substr($s['url'], (strrpos($s['url'], "/") +1), strlen($s['url']));
		} else{
			$a_slider_new['altTag'] = "Slider Image";
		}
		array_push ($sliders_new, $a_slider_new);
	}
	
	$data['house']['slides'] = $sliders_new;
	$CACHE_location_slides->expiresAfter($cache_time['4hrs']);
	$CACHE_location_slides->set($data['house']['slides']);
	$cache->save($CACHE_location_slides);
	
}else{
	$data['house']['slides'] = $CACHE_location_slides->get();
}


$file = 'location.html';