<?php

namespace App\Models;

use App\Core\Model;

class House extends Model
{
    public function getSiteHouse($site_id, $house_id)
    {
        $sql = '
            SELECT
                ISNULL(sh.name,ch.name) AS name,
                LTRIM(RTRIM(ISNULL(sh.slug, h.name))) AS slug,
                ISNULL(sh.address,ch.address1) AS address,
                ISNULL(sh.phone,ch.movieline) AS movieline,
                ISNULL(sh.phoneoffice,ch.phone1) AS office_phone,
                ISNULL(sh.city,ch.city) AS city,
                ISNULL(sh.state,ch.state) AS state,
                ISNULL(sh.zip, ch.zip) AS zip,
                sh.tagline,
                sh.PhotoUrl,
                sh.email,
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
                sh.map,
                sh.timezone,
                seo as seo,
                sh.theater_status as status
            FROM
                Cinema..Houses ch WITH(NOLOCK)
            INNER JOIN
                Websites..SiteHouses sh WITH(NOLOCK)
            ON
                ch.house_id = sh.house_id AND sh.siteid = :site_id
            WHERE
                ch.house_id = :house_id
        ';
        
        $params = [
            'site_id'  => $site_id,
            'house_id' => $house_id,
        ];
        
        $this->run($sql, $params);
        $result = $this->fetch();
        
        return $result;
    }
    
    public function getPrices($house_id)
    {
        $sql = '
            SELECT
                *
            FROM
                Websites..Prices p WITH(NOLOCK)
            WHERE
                p.house_id = :house_id
            ORDER BY
                price_id ASC
        ';
        
        $params = [
            'house_id' => $house_id,
        ];
        
        $this->run($sql, $params);
        $prices = $this->fetchAll();
        
        $dataprices = [];
        foreach ($prices as $p) {
            //setup variables
            $prices = [];
            $category = trim($p['price_daypart']);
            $category_times = trim($p['price_times']);

            //extract the price fields into an array
            for ($i=1; $i<=15; $i++) {
                if($p['price_cat'.$i] != ''){
                    $prices[$i]['name'] = trim($p['price_cat'.$i]);
                    $prices[$i]['value'] = trim($p['price_amount'.$i]);
                }
            }
            array_push($dataprices, ['cat'=>$category, 'times' => $category_times,'prices'=>$prices]);
        }
        
        return $dataprices;
    }
    
    /**
     * Moved from OLD Engine: inc.query chain_get_houses($site_id)
     *
     * Gets a two dimensional array of houses in the specified
     * chain and important data for each.
     *
     * @param integer $site_id (can be blank)
     *
     * @return array $houses[numeric][key] a two dimensional array0
     */
    function getHouses($site_id)
    {
        $sql = "
            SELECT
                h.house_id,
                LTRIM(RTRIM(ISNULL(sh.name,h.name))) AS name,
                LTRIM(RTRIM(ISNULL(sh.slug, h.name))) AS slug,
                LTRIM(RTRIM(ISNULL(sh.address,h.address1))) AS address,
                LTRIM(RTRIM(h.address2)) as address2,
                LTRIM(RTRIM(ISNULL(sh.city,h.city))) AS city,
                LTRIM(RTRIM(ISNULL(sh.state,h.state))) AS state,
                LTRIM(RTRIM(ISNULL(sh.zipcode,h.zip))) as zip,
                LTRIM(RTRIM(isnull(NULLIF(sh.phoneoffice, ''),h.phone1))) AS phone,
                LTRIM(RTRIM(ISNULL(sh.Phone,h.movieline))) AS movieline,
                LTRIM(RTRIM(sh.email)) as email,
                LTRIM(RTRIM(h.digital)) as digital,
                LTRIM(RTRIM(h.dolby)) as dolby,
                h.numscreens,
                h.seating,
                h.lat,
                h.lon,
                sh.PhotoUrl,                
                sh.tagline,
                sh.middleware_id,
                sh.posURL,
                LTRIM(RTRIM(sh.facebook)) as facebook,
                LTRIM(RTRIM(sh.twitter)) as twitter,
                LTRIM(RTRIM(sh.instagram)) as instagram,
                LTRIM(RTRIM(sh.pintrest)) as pintrest,
                LTRIM(RTRIM(sh.google)) as google,
                sh.amenities,
                sh.posType,                
                CASE WHEN p.Enabled = '1' THEN LTRIM(RTRIM(message_page)) ELSE '' END as message_page,
                policies,
                sh.map,
                LTRIM(RTRIM(sh.timezone)) as timezone,
                sh.seo as seo,
                sh.theater_status as status
            FROM Cinema..Houses h WITH(NOLOCK)
            INNER JOIN Websites..SiteHouses sh WITH(NOLOCK) ON h.house_id = sh.house_id AND sh.siteid = :site_id
            LEFT OUTER JOIN Websites..Pages p WITH(NOLOCK) ON p.PageId = sh.message_page
            ORDER BY state, NAME
        ";
        
        $params = [
            'site_id' => $site_id,
        ];
        
        $this->run($sql, $params);
        $houses = $this->fetchAll();
        
        return $houses;
    }
    
    /**
     * checks to see if location is a drive-in
     *
     * @param $house_id
     *
     * @return true if drive in, false if not
     */
    function checkDrivein($house_id)
    {
        $sql = "
            SELECT h.type
            FROM Cinema..Houses h WITH(NOLOCK)
            WHERE h.house_id = :house_id
        ";
        
        $params = [
            'house_id' => $house_id,
        ];
        
        $this->run($sql, $params);
        $type = $this->fetchValue();
        
        if (trim($type) == 'Drive-in/Outdoor' || $house_id == '4583') {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Gets an array of soldout showtimes for a house and date
     *
     * @param $house_id
     * @param $date YYYY-MM-DD
     *
     * @return array $showtimes[numeric]
     */
    function getPerfsSoldout($house_id, $date)
    {
        if (config('developer.on')) {
            $date = config('developer.today', $date);
        }

        $sql = "
            DECLARE @house_id INT SET @house_id = :house_id
            DECLARE @date DATETIME SET @date = :date
            SELECT p.house_id, p.movie_id, p.showdate, p.showtime, p.showcode, p.showtext, p.soldout
            FROM Cinema..Perfs AS p WITH(NOLOCK)
            WHERE p.soldout = 1
                AND p.house_id = @house_id
                AND p.showdate >= @date
            UNION
            SELECT p.house_id, p.movie_id, p.showdate, p.showtime, p.showcode, p.showtext, p.soldout
            FROM Cinema..PerfsLatest AS p WITH(NOLOCK)
            WHERE p.soldout = 1
                AND p.house_id = @house_id
                AND p.showdate >= @date
            ORDER BY p.movie_id ASC
        ";
        if ( !empty( config('fxp.template_options.perf')   ) ){
            switch (config('fxp.template_options.perf')){
                case 'perfs':
                    $sql = "
                        DECLARE @house_id INT SET @house_id = :house_id
                        DECLARE @date DATETIME SET @date = :date
                        SELECT p.house_id, p.movie_id, p.showdate, p.showtime, p.showcode, p.showtext, p.soldout
                        
                        FROM Cinema..Perfs AS p WITH(NOLOCK)
                        WHERE p.soldout = 1
                            AND p.house_id = @house_id
                            AND p.showdate >= @date
                        ORDER BY p.movie_id ASC
                    ";
                    break;
                case 'perfsLatest':
                    $sql = "
                        DECLARE @house_id INT SET @house_id = :house_id
                        DECLARE @date DATETIME SET @date = :date
                        SELECT p.house_id, p.movie_id, p.showdate, p.showtime, p.showcode, p.showtext, p.soldout
                        FROM Cinema..PerfsLatest AS p WITH(NOLOCK)
                        WHERE p.soldout = 1
                            AND p.house_id = @house_id
                            AND p.showdate >= @date
                        ORDER BY p.movie_id ASC
                    ";
                    break;
                default:
                    break;
            }
        }

        
        $params = [
            'house_id' => $house_id,
            'date'     => $date,
        ];
        
        $this->run($sql, $params);
        $soldOuts = $this->all();
        
        foreach ($soldOuts as $key => $soldOut) {
            $soldOuts[$key]['showdate'] = date('Y-m-d', strtotime($soldOut['showdate']));
        }
        
        return $soldOuts;
    }

}