<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 9/6/2017
 * Time: 11:23 AM
 */

$CACHE_sitemap = $cache->getItem($config->getConfig('site_id').'_sitemape');

if (!$CACHE_sitemap->isHit()) {
    $xml_pages = array();

    $default_pages = $config->getConfig('site_sitemap');
    foreach ($default_pages as $page){
        $thepage = array('url'=>$config->getConfig('site_domain') ."/". $page);
        array_push($xml_pages, $thepage);
    }


    $hs = chain_get_houses($config->getConfig('site_id'));
    $houses_new =array();
    foreach ($hs as $h) {
        $house['name'] = trim($h["name"]);
        $house['url'] = $config->getConfig('site_domain'). '/location/'. fix_movie_id($h['house_id']) . '/' . url_name($house['name']) . "-Showtimes";
        $house['photo'] = build_house_photo_url($config->getConfig('site_id'), $h["PhotoUrl"]);
        array_push($xml_pages, $house);
    }

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
				m.flv_high,
				cs.csTrailer,
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
        $a_movie['url'] = $config->getConfig('site_domain'). '/movie/'. fix_movie_id($n['movie_id']) . '/' . url_name($a_movie['name']) . "-Trailer-and-Info";
        $a_movie['poster'] = ($n['posterImage'] != '') ? fxp_build_poster_url($config->getConfig('site_id'), $n['posterImage']) : build_poster_url($a_movie['id'], $n['hiphotos'], '', $config->getConfig("site_country"), $n['ip_filename']);


        if ($n['csTrailer'] != ''){
            $trailer = 1;
            $a_movie['trailer']['url'] = fxp_build_trailer_url($n['csTrailer']);
        } elseif ($n['flv_high'] != ''){
            $a_movie['trailer']['url'] = build_trailer_url($a_movie['id'], trim($n['flv_high']));
        } else {

        }

        array_push($xml_pages, $a_movie);
    }


    $CACHE_sitemap->expiresAfter($cache_time['1day']);
    $CACHE_sitemap->set($xml_pages);
    $cache->save($CACHE_sitemap);
    $data['xml_pages'] = $xml_pages;
}else{
    $data['xml_pages'] = $CACHE_sitemap->get();
}


$file = 'sitemap.html';
header('Content-Type: application/xml; charset=utf-8');

