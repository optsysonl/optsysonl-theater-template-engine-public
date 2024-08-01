<?php

namespace templates\custom\envisioncinemas\app_local\Models;

use App\Core\Model;

class Loyalty extends Model {

    /**
     * param $altid
     *
     * @return Array $house
     */
    function get_house_by_altid($altid) {
        $site_id = config('fxp.site_id');

        $house = array();
        try {
            $sql = "
				SELECT DISTINCT h.house_id, ISNULL(sh.name, h.name) AS name
				FROM websites..sitehouses sh WITH(NOLOCK)
				INNER JOIN cinema..houses h WITH(NOLOCK) ON h.house_id = sh.house_id AND h.altid = :altid
				WHERE sh.siteid = :siteid
			";

            $params = [
                'siteid' => $site_id,
                'altid'   => $altid
            ];

            $this->run($sql, $params);
            $house = $this->value();

        } catch (PDOException $e) {
            handle_exception($e);
        }

        return $house;
    }
}