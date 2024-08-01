<?php

namespace templates\custom\acadiana\app_local\Models;

use App\Core\Model;

class Screen extends Model {

    /**
     * Gets a two dimensional array of showtime and certain movie data for the specified
     * house on the specified date. Extra whitespace is trimmed from certain values.
     *
     * @param string $date (YYYY-MM-DD)
     *
     * @return array $showtimes[numeric][key] a two dimensional array
     */
    function getShowtimesByFilter($date, $filter_id)
    {
        $site_id = config('fxp.site_id');
        $site_country = config('fxp.site_country');

        $params = [
            'site_id'      => $site_id,
            'site_country' => $site_country,
            'filter_id'   => $filter_id,
        ];

        $sql = "
            DECLARE @country varchar(10) SET @country = :site_country
            SELECT
                h.house_id,
                h.ticketing,
                sh.posURL,
                sh.posType,
                LTRIM(RTRIM(sh.timezone)) as timezone,
                CAST(m.movie_id AS int) AS movie_id,
                LTRIM(RTRIM(m.name)) as movie_name,
                m.parent_id,
                s.screen_id, 
                s.screens_id, 
                s.showdate,
                {$this->time_fields()}
                SUBSTRING(LTRIM(RTRIM(s.allowpass)),1,1) as allowpass, 
                LTRIM(RTRIM(s.comment)) as comment, 
                LTRIM(RTRIM(s.sneak)) as sneak,
                ISNULL(cs.release, ISNULL(i.release, m.release)) as release,
                CASE
                    WHEN
                    	cs.sort_order IS NULL
                    THEN 99999999
                    ELSE cs.sort_order
                END  AS custom_order
            FROM Cinema..Screens s WITH(NOLOCK)
            INNER JOIN Cinema..Movies m WITH(NOLOCK) ON m.movie_id = s.movie_id
            INNER JOIN Cinema..Houses h WITH(NOLOCK) ON h.house_id = s.house_id
            INNER JOIN Websites..SiteHouses sh WITH(NOLOCK) ON sh.house_id = h.house_id AND sh.SiteId = :site_id
            LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON s.movie_id = cs.movie_id AND cs.SiteId = sh.SiteId
            
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
            WHERE s.showdate = '{$date}'
            AND s.comment LIKE  (SELECT '%'+ REPLACE( REPLACE(sc.CHOICE,'filter[',''), ']','')+'%' FROM  Websites..SiteChoices sc WITH(NOLOCK) WHERE sc.CHOICEID = :filter_id )
            ORDER BY custom_order, release desc, m.parent_id, m.movie_id, m.name
        ";

        $this->run($sql, $params);
        $results = $this->all(true);

        return $results;
    }



    public function getFilterInfo($filter_id){

        $site_id = config('fxp.site_id');

        $sql="
            DECLARE @site_id varchar(10)    SET @site_id = :site_id
            DECLARE @filter_id varchar(10)    SET @filter_id = :filter_id
                        
            SELECT 
                sc.CHOICEID as id,
                sc.CHOICE as name
                
            FROM Websites..SiteChoices sc WITH(NOLOCK)
            WHERE sc.SITEID = @site_id AND sc.CHOICEID = @filter_id
        ";

        $params = [
            'site_id' => $site_id,
            'filter_id' => $filter_id,
        ];

        $this->run($sql, $params);
        $filter = $this->fetch();

        return $filter;

    }

    /**
     * Builds a string of 48 time fields.
     *
     * @return string comma seperated string of time fields
     */
    private function time_fields()
    {
        $fields = '';
        $itemCount = 48;

        for ($i = 1; $i <= $itemCount; $i++) {
            $fields .= "
                (
                    CASE
                        WHEN time{$i} != ''
                        THEN
                            (time{$i} + (CASE WHEN mer{$i} = 1 THEN ' AM' ELSE ' PM' END))
                    END
                ) AS time{$i},
             ";
        }

        return $fields;
    }
}