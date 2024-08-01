<?php


namespace templates\custom\funmoviegrill\app_local\Models;

use App\Core\Model;

class House extends Model {


    function get_house_from_location($search_q, $miles='10'){
        $site_id = config('fxp.site_id');
        $houses = array();

        try {
            $sql = "DECLARE @inzip varchar(10)
                DECLARE @miles int SET @miles = :miles
                DECLARE @inlat float /* Center lat */
                DECLARE @inlon float /* Center long */
                DECLARE @nlat float /* North bounding lat */
                DECLARE @slat float /* South bounding lat */
                DECLARE @elon float /* East bounding long */
                DECLARE @wlon float /* West bounding long */
                DECLARE @search varchar(250) SET @search = :search
                
                IF (ISNUMERIC(@search) = 1)
                    BEGIN
                        SET @inzip = @search
                    END
                ELSE
                    BEGIN
                        DECLARE @city varchar(100) SET @city = REPLACE(SUBSTRING(@search, 0, LEN(@search) - 2), ',', '')
                        DECLARE @state varchar(2) SET @state = SUBSTRING(@search, LEN(@search) - 1, 2)
                
                        SELECT TOP 1 @inzip = geo_zip
                        FROM Cinema..Geocode WITH(NOLOCK)
                        WHERE geo_country = 'USA' AND geo_city = @city AND geo_state = @state
                    END
                
                SELECT TOP 1 @inlat=geo_lat,@inlon=geo_long FROM Cinema..geocode WHERE geo_zip=@inzip ORDER BY geo_primary, geo_sequence
                SELECT @nlat = @inlat + @miles*(1.000000/(1.1352*60))
                SELECT @slat = @inlat - @miles*(1.000000/(1.1352*60))
                SELECT @elon = @inlon + ABS(@miles*(1/(1.1352*60*COS(RADIANS(@inlat)))) )
                SELECT @wlon = @inlon - ABS(@miles*(1/(1.1352*60*COS(RADIANS(@inlat)))) )
                
                SELECT DISTINCT 
                    sh.house_id as id,                     
                    distance = DEGREES(ACOS(
                                    SIN(RADIANS(h.lat))
                                    * SIN(RADIANS(@inlat))
                                    + COS(RADIANS(h.lat))
                                    * COS(RADIANS(@inlat))
                                    * COS(RADIANS(@inlon) - RADIANS(h.lon))))
                                * 60 * 1.1515
                FROM Cinema..Houses h WITH (NOLOCK)
                INNER JOIN Websites..SiteHouses sh WITH(NOLOCK) ON sh.SiteId = :siteid AND sh.house_id = h.house_id
                WHERE (h.lat <= @nlat
                    AND h.lat >= @slat
                    AND h.lon <= @elon
                    AND h.lon >= @wlon
                    AND h.shut = 0
                    AND ISNULL(h.closed, '') <> 'Y')
                    OR
                    (
						h.name LIKE '%'+@search+'%'
						OR sh.name LIKE '%'+@search+'%'
                    )
                ORDER BY distance ASC";

            $params = [
                'search'    => $search_q,
                'siteid'    => $site_id,
                'miles'     => $miles
            ];

            $this->run($sql, $params);
            $houses = $this->fetchAll();

        } catch (PDOException $e) {
            handle_exception($e);
        }

        return ['houses'=>$houses];

    }


}



