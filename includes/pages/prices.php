<?php

$house_id = $mapping['house_id'];

$CACHE_location_house = $cache->getItem($config->getConfig('site_id') . '_prices_' . $house_id);
if (!$CACHE_location_house->isHit()) {
    $hs_pr = [];
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
        $q   = $db->prepare($sql);
        $q->execute([':house_id' => $house_id]);
        $hs_pr = $q->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        handle_exception($e);
    }
    
    $dataprices = [];
    foreach ($hs_pr as $p) {
        //setup variables
        $prices   = [];
        $category = trim($p['price_daypart']);
        
        //extract the price fields into an array
        for ($i = 1; $i <= 6; $i++) {
            if ($p['price_cat' . $i] != '') {
                $prices[$i]['name']  = trim($p['price_cat' . $i]);
                $prices[$i]['value'] = trim($p['price_amount' . $i]);
            }
        }
        
        array_push($dataprices, ['cat' => $category, 'prices' => $prices]);
    }
    $data['house']['prices'] = $dataprices;
    
    $CACHE_location_house->expiresAfter($cache_time['4hrs']);
    $CACHE_location_house->set($data['house']);
    $cache->save($CACHE_location_house);
} else {
    $data['house'] = $CACHE_location_house->get();
}

$file = 'prices.html';