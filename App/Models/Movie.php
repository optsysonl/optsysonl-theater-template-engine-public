<?php

namespace App\Models;

use App\Core\Model;
use App\Helpers\BuildHelper;
use App\Helpers\DateHelper;

/**
 * Class Movie
 * @package App\Models
 */
class Movie extends Model
{
    /**
     * Get movie detail data
     *
     * @param integer $id
     *
     * @return array
     */
    public function getDetails($id)
    {
        $site_id = config('fxp.site_id');
        $site_country = config('fxp.site_country');

        $sql = "
            DECLARE @country varchar(10) SET @country = :country
            SELECT
            m.movie_id,
            LTRIM(RTRIM(ISNULL(cs.title,ISNULL(i.fname,m.name)))) as name,
            LTRIM(RTRIM(ISNULL(cs.csRuntime,m.runtime))) as runtime, 
            LTRIM(RTRIM(m.genre)) as genre, 
            LTRIM(RTRIM(m.genre2)) as genre2, 
            LTRIM(RTRIM(m.genre3)) as genre3,
            LTRIM(RTRIM(m.actor1)) as actor1, 
            LTRIM(RTRIM(m.actor2)) as actor2, 
            LTRIM(RTRIM(m.actor3)) as actor3, 
            LTRIM(RTRIM(m.actor4)) as actor4, 
            LTRIM(RTRIM(m.actor5)) as actor5, 
            LTRIM(RTRIM(m.actor6)) as actor6, 
            LTRIM(RTRIM(m.actor7)) as actor7, 
            LTRIM(RTRIM(m.actor8)) as actor8, 
            LTRIM(RTRIM(m.actor9)) as actor9, 
            LTRIM(RTRIM(m.actor10)) as actor10,
            m.hiphotos, m.videos, m.url, 
            LTRIM(RTRIM(m.advisory)) as advisory, 
            m.distrib, m.flv_high, m.writer,
            ISNULL(cs.csDirector,m.director) as director,
            ISNULL(cs.release,ISNULL(i.release,m.release)) as release,
            ISNULL(cs.csProducer,m.producer) as producer,
            cs.csActors, cs.posterImage, cs.csTrailer, cs.seo AS seo, ip.ip_filename,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r.capsule) END AS synopsis,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r_short.capsule) END AS synopsis_short,
            ISNULL(cs.csMpaa, CASE
                                WHEN @country = 'USA' THEN m.mpaa
                                WHEN @country = '' THEN m.mpaa
                                WHEN @country = 'CAN' THEN
                                     'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') +
                                    ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') +
                                    ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') +
                                    ';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') +
                                    ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') +
                                    ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') +
                                    ';NS' + ISNULL(RTRIM(m.nsmpa), 'NR')
                                ELSE i.cert END) as mpaa
            FROM Cinema..Movies m WITH(NOLOCK)
            LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.movie_id = m.movie_id AND cs.SiteId = :SiteId
            LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'HOME' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Reviews r_short WITH(NOLOCK) ON m.movie_id = r_short.movie_id AND r_short.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'SYSYN' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
            WHERE m.movie_id = :movie_id
        ";

        $params = [
            'movie_id' => $id,
            'SiteId'   => $site_id,
            'country'  => $site_country,
        ];

        $this->run($sql, $params);
        $movie = $this->fetch();

        return $movie;
    }

    /**
     * Moved from OLD Engine: inc.query movie_get_stills($movie_id, $res)
     *
     * Gets an array of movie still URLs for the specified movie,
     * ignoring the first filename returned from the query because
     * it is a movie poster.
     *
     * @param integer $movie_id
     * @param string $image_quality ('least' or 'low' or 'high')
     * @return array $stills[numeric] an array of valid image URLs
     * @see function 'build_still_url'
     */
    function getStills($movie_id, $image_quality = 'R')
    {
        $stills = [];

        $sql = "EXEC cs_ListPhotos :movie_id";

        $params = [
            'movie_id' => (int)$movie_id,
        ];

        $this->run($sql, $params);
        $rs = $this->fetchAll();

        // Ignore first still because it is a movie poster.
        for ($i = 1; $i < count($rs); $i++) {
            $still = BuildHelper::build_still_url($rs[$i]['filename']);

            // we need to replace the 0(number).jpg with H(number).jpg for high res
            // least - width 150, low - width 300, high - width from 301 to 3000
            if ($image_quality == 'R') {
                $still = substr_replace($still, 'R', -6, 1);
            } else if ($image_quality == 'H') {
                $still = substr_replace($still, 'H', -6, 1);
            }
            if (BuildHelper::checkImage($still)) {
                $stills[] = $still;
            }
        }

        return $stills;
    }


    /**
     * @param $movie_id
     * @param string $image_quality
     * @return array
     */
    function getCustomStills($movie_id){
        $site_id = config('fxp.site_id');
        $stills = [];

        // Custom Skiders
        $sql =  "
            SELECT * 
            FROM Websites..Stills WITH(NOLOCK) 
            WHERE SiteId = :site_id AND movie_id = :movie_id";

        $params = [
            'site_id' => $site_id,
            'movie_id' => (int)$movie_id,
        ];

        $this->run($sql, $params);
        $cust_sliders = $this->fetchAll();

        for ($i = 0; $i < count($cust_sliders); $i++) {
            $still = BuildHelper::build_custom_still_url($site_id, $cust_sliders[$i]['file_name']);
            if (BuildHelper::checkImage($still)) {
                $stills[] = $still;
            }
        }

        return $stills;
    }
    /**
     * @param integer $id Movie id
     * @param string $date YYYY-MM-DD
     *
     * @return array
     */
    public function getSiteHouses($id, $date)
    {
        $site_id = config('fxp.site_id');

        $sql = "
            SELECT DISTINCT
                sh.state,
                sh.house_id,
                RTRIM(sh.name) + ', ' + sh.state AS name,
                s.showdate
            FROM Cinema..Screens s WITH(NOLOCK)
            JOIN Websites..SiteHouses sh WITH(NOLOCK) ON s.house_id = sh.house_id
            WHERE
                s.movie_id = :movie_id AND
                sh.siteid = :site_id AND
                s.showdate = :date
            ORDER BY name ASC
        ";

        $params = [
            ':movie_id' => $id,
            ':site_id'  => $site_id,
            ':date'     => $date,
        ];

        $this->run($sql, $params);
        $houses = $this->fetchAll();

        return $houses;
    }

    /**
     * Moved from OLD Engine: inc.query chain_get_now_playing($site_id, $date, $site_country)
     *
     * Gets a two dimensional array of movies that are playing
     * in the specified site on the specified date.
     *
     * @return array $movies[numeric][key] a two dimensional array
     */
    public function getNowPlaying()
    {
        $site_id = config('fxp.site_id');
        $site_country = config('fxp.site_country');
        $site_language = config('fxp.site_language')['iso3'];
        $today = DateHelper::today();

        if (config('developer.on')) {
            $today = config('developer.today', $today);
        }

        $sql = "
            DECLARE @country varchar(10)    SET @country = :country
            DECLARE @site_id varchar(10)    SET @site_id = :site_id
            SELECT DISTINCT
                
				CAST(m.movie_id AS int) AS movie_id,
                LTRIM(RTRIM(ISNULL(cs.title,ISNULL(i.fname,m.name)))) as name,
                m.parent_id,
                LTRIM(RTRIM(ISNULL(cs.csRuntime,m.runtime))) as runtime, 
                LTRIM(RTRIM(cs.csGenre)) as csGenre, 
                LTRIM(RTRIM(m.genre)) as genre, 
                LTRIM(RTRIM(m.genre2)) as genre2, 
                LTRIM(RTRIM(m.genre3)) as genre3,
                LTRIM(RTRIM(cs.csActors)) as csActors,
                LTRIM(RTRIM(m.actor1)) as actor1, 
                LTRIM(RTRIM(m.actor2)) as actor2, 
                LTRIM(RTRIM(m.actor3)) as actor3, 
                LTRIM(RTRIM(m.actor4)) as actor4, 
                LTRIM(RTRIM(m.actor5)) as actor5, 
                LTRIM(RTRIM(m.actor6)) as actor6, 
                LTRIM(RTRIM(m.actor7)) as actor7, 
                LTRIM(RTRIM(m.actor8)) as actor8, 
                LTRIM(RTRIM(m.actor9)) as actor9, 
                LTRIM(RTRIM(m.actor10)) as actor10,
                m.hiphotos, 
				m.videos, 
				m.url, 
				CASE WHEN cs.advisory IS NOT NULL AND cs.advisory <> '' THEN LTRIM(RTRIM(cs.advisory))
				    WHEN @country = 'USA' THEN LTRIM(RTRIM(m.advisory))
				    ELSE LTRIM(RTRIM(i.warning)) END AS advisory, 
				m.distrib, 
				m.flv_high, 
				LTRIM(RTRIM(m.writer)) as writer,
                LTRIM(RTRIM(ISNULL(cs.csDirector,m.director))) as director,
                ISNULL(cs.release,ISNULL(i.release,m.release)) as release,
                ISNULL(cs.csProducer,m.producer) as producer,
                LTRIM(RTRIM(cs.custom_text)) as custom_text,
                cs.csActors, 
				cs.posterImage, 
				cs.csTrailer,
				cs.seo AS seo, 
				ip.ip_filename,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r.capsule) END AS synopsis,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r_short.capsule) END AS synopsis_short,
            ISNULL(cs.csMpaa, CASE
                                WHEN @country = 'USA' THEN m.mpaa
                                WHEN @country = '' THEN m.mpaa
                                WHEN @country = 'CAN' THEN
                                     'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') +
                                    ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') +
                                    ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') +
                                    ';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') +
                                    ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') +
                                    ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') +
                                    ';NS' + ISNULL(RTRIM(m.nsmpa), 'NR')
                                ELSE i.cert END) as mpaa,
            LTRIM(RTRIM(( 
                SELECT 
                    CAST(scs.CHOICEID AS varchar(30)) + '///(' + 
                    CAST(sc.CHOICE AS VARCHAR(100)) + ')///' + 
                    CAST(
                        CASE
                            WHEN
                                EventDate IS NULL
                            THEN ''
                    		ELSE EventDate
                    	END
					    AS varchar(30)) 
				    + '///' + 
					    CASE
					        WHEN
					            EventDate2 IS NULL
                    		THEN '' 
                    		ELSE CAST(EventDate2 AS varchar(30)) 
                    	END
				    + '///' + 
                    	CASE
                    		WHEN
                    			EventDate3 IS NULL
                    		THEN ''
                    		ELSE CAST(EventDate3 AS varchar(30))
                    	END
					+  ';'
		        FROM Websites..SiteChoiceSelection scs WITH(NOLOCK) 
		        JOIN Websites..SiteChoices sc WITH(NOLOCK) ON sc.CHOICEID = scs.CHOICEID 
					 WHERE scs.SITEID = @site_id AND scs.CSID = cs.CsId
      		    FOR XML PATH('')
        		))) AS categories,
        		cs.sort_order,
        		cs.orphan as orphan,
        		cs.virtual_cinema as virtual_cinema
            FROM Websites..SiteHouses sh WITH(NOLOCK)
            INNER JOIN Cinema..Screens s WITH(NOLOCK) ON sh.house_id = s.house_id
            INNER JOIN Cinema..Movies m WITH(NOLOCK) ON s.movie_id = m.movie_id
            LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.movie_id = s.movie_id AND cs.SiteId = sh.SiteId
            LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'HOME' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Reviews r_short WITH(NOLOCK) ON m.movie_id = r_short.movie_id AND r_short.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'SYSYN' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = s.movie_id AND i.country = @country and i.lang= :lang
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
            WHERE sh.siteid = @site_id AND s.showdate >= :today
            ORDER BY release DESC, name
        ";

        $params = [
            'site_id' => $site_id,
            'country' => $site_country,
            'today'   => $today,
            'lang'    => $site_language,
        ];

        $this->run($sql, $params);
        $movies = $this->fetchAll();

        return $this->mergeWithLostMovies($movies, $site_country);
    }

    /**
     * Moved from OLD Engine: inc.query fxp_get_coming_soon($site_id, $site_country, $limit = null)
     *
     * Gets a two dimensional array of all movies coming soon
     * for the specified site based on FilmsXpress data.
     *
     * @param integer $limit
     *
     * @return array $movies[numeric][key] a two dimensional array
     * @see function 'sort_by_name'
     */
    function getComingSoon($limit = null)
    {
        $site_id = config('fxp.site_id');
        $site_country = config('fxp.site_country');
        $site_language = config('fxp.site_language')['iso3'];
        $today = DateHelper::today();

        if (config('developer.on')) {
            $today = config('developer.today', $today);
            $site_id = config('developer.fxp.site_id', $site_id);
        }

        $limit_sql = '';
        if ($limit) {
            $limit_sql = " TOP " . $limit;
        }

        $sql = "
            DECLARE @country varchar(10) SET @country = :country  
            DECLARE @site_id varchar(10) SET @site_id = :site_id
            SELECT 
            DISTINCT  {$limit_sql}
            CAST(m.movie_id AS int) AS movie_id,
            LTRIM(RTRIM(ISNULL(cs.title,ISNULL(i.fname,m.name)))) as name,
            m.parent_id,
            LTRIM(RTRIM(ISNULL(cs.csRuntime,m.runtime))) as runtime,
            LTRIM(RTRIM(cs.csGenre)) as csGenre,
            LTRIM(RTRIM(m.genre))  	as genre, 
            LTRIM(RTRIM(m.genre2)) 	as genre2, 
            LTRIM(RTRIM(m.genre3)) 	as genre3,
            LTRIM(RTRIM(cs.csActors)) as csActors,
            LTRIM(RTRIM(m.actor1)) 	as actor1, 
            LTRIM(RTRIM(m.actor2)) 	as actor2, 
            LTRIM(RTRIM(m.actor3)) 	as actor3, 
            LTRIM(RTRIM(m.actor4)) 	as actor4, 
            LTRIM(RTRIM(m.actor5)) 	as actor5, 
            LTRIM(RTRIM(m.actor6)) 	as actor6, 
            LTRIM(RTRIM(m.actor7)) 	as actor7, 
            LTRIM(RTRIM(m.actor8)) 	as actor8, 
            LTRIM(RTRIM(m.actor9)) 	as actor9, 
            LTRIM(RTRIM(m.actor10)) as actor10,
            m.hiphotos, 
			m.videos, 
			m.url, 
			CASE WHEN cs.advisory IS NOT NULL AND cs.advisory <> '' THEN LTRIM(RTRIM(cs.advisory))
			    WHEN @country = 'USA' THEN LTRIM(RTRIM(m.advisory))
				ELSE LTRIM(RTRIM(i.warning)) END AS advisory, 
			m.distrib, m.flv_high, 
			LTRIM(RTRIM(m.writer)) as writer,
            LTRIM(RTRIM(ISNULL(cs.csDirector,m.director))) as director,
            ISNULL(cs.release,ISNULL(i.release,m.release)) as release,
            LTRIM(RTRIM(cs.custom_text)) as custom_text,
            ISNULL(cs.csProducer,m.producer) as producer,
            cs.csActors, 
				cs.posterImage, 
				cs.csTrailer, 
				cs.seo AS seo,
				ip.ip_filename,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r.capsule) END AS synopsis,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r_short.capsule) END AS synopsis_short,
            ISNULL(cs.csMpaa, CASE
                                WHEN @country = 'USA' THEN m.mpaa
                                WHEN @country = '' THEN m.mpaa
                                WHEN @country = 'CAN' THEN
                                     'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') +
                                    ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') +
                                    ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') +
                                    ';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') +
                                    ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') +
                                    ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') +
                                    ';NS' + ISNULL(RTRIM(m.nsmpa), 'NR')
                                ELSE i.cert END) as mpaa,
            LTRIM(RTRIM(( 
                SELECT 
                    CAST(scs.CHOICEID AS varchar(30)) + '///(' + 
                    CAST(sc.CHOICE AS VARCHAR(100)) + ')///' + 
                    CAST(
                        CASE
                            WHEN
                                EventDate IS NULL
                            THEN ''
                    		ELSE EventDate
                    	END
					    AS varchar(30)) 
				    + '///' + 
					    CASE
					        WHEN
					            EventDate2 IS NULL
                    		THEN '' 
                    		ELSE CAST(EventDate2 AS varchar(30)) 
                    	END
				    + '///' + 
                    	CASE
                    		WHEN
                    			EventDate3 IS NULL
                    		THEN ''
                    		ELSE CAST(EventDate3 AS varchar(30))
                    	END
					+  ';'
		        FROM Websites..SiteChoiceSelection scs WITH(NOLOCK) 
		        JOIN Websites..SiteChoices sc WITH(NOLOCK) ON sc.CHOICEID = scs.CHOICEID 
					 WHERE scs.SITEID = @site_id AND scs.CSID = cs.CsId
      		    FOR XML PATH('')
        		))) AS categories,
        		cs.sort_order,
        		cs.orphan as orphan,
        		cs.virtual_cinema as virtual_cinema
            FROM Websites..ComingSoon cs WITH(NOLOCK)
            JOIN Cinema..Movies m WITH(NOLOCK) on m.movie_id = cs.movie_id
            LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'HOME' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Reviews r_short WITH(NOLOCK) ON m.movie_id = r_short.movie_id AND r_short.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'SYSYN' 
                    ELSE cs.synopsis_type
                END
            
            LEFT OUTER JOIN Cinema..Screens s WITH(NOLOCK) on m.movie_id = s.movie_id and s.house_id in
                (SELECT house_id from Websites..SiteHouses WITH(NOLOCK) where siteid = @site_id)
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = cs.movie_id AND i.country = @country and i.lang= :lang
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK) ON i.movie_id = ip.movie_id AND i.country = ip.ip_country
            WHERE cs.SiteId = @site_id            
            ORDER BY release, name
        ";

        $params = [
            'site_id' => $site_id,
            'country' => $site_country,
            'lang'    => $site_language,
        ];

        $this->run($sql, $params);
        $movies = $this->fetchAll();

        return $this->mergeWithLostMovies($movies, $site_country);
    }


    /**
     * Copy from getComingSoon
     *
     * Gets a two dimensional array of all movies from Category IDs
     * for the specified site based on FilmsXpress data.
     *
     * @param integer $limit
     *
     * @return array $movies[numeric][key] a two dimensional array
     * @see function 'sort_by_name'
     */
    function getCarouselMovies($limit = null)
    {
        $site_id = config('fxp.site_id');
        $site_country = config('fxp.site_country');
        $site_language = config('fxp.site_language')['iso3'];
        $today = DateHelper::today();


        if (config('developer.on')) {
            $today = config('developer.today', $today);
            $site_id = config('developer.fxp.site_id', $site_id);
        }

        $limit_sql = '';
        if ($limit) {
            $limit_sql = " TOP " . $limit;
        }

        $sql = "
            DECLARE @country varchar(10) SET @country = :country  
            DECLARE @site_id varchar(10) SET @site_id = :site_id
            SELECT 
            DISTINCT  {$limit_sql}
            
            CAST(m.movie_id AS int) AS movie_id,
            LTRIM(RTRIM(ISNULL(cs.title,ISNULL(i.fname,m.name)))) as name,
            m.parent_id,
            LTRIM(RTRIM(ISNULL(cs.csRuntime,m.runtime))) as runtime,
            LTRIM(RTRIM(cs.csGenre)) as csGenre,
            LTRIM(RTRIM(m.genre))  	as genre, 
            LTRIM(RTRIM(m.genre2)) 	as genre2, 
            LTRIM(RTRIM(m.genre3)) 	as genre3,
            LTRIM(RTRIM(cs.csActors)) as csActors,
            LTRIM(RTRIM(m.actor1)) 	as actor1, 
            LTRIM(RTRIM(m.actor2)) 	as actor2, 
            LTRIM(RTRIM(m.actor3)) 	as actor3, 
            LTRIM(RTRIM(m.actor4)) 	as actor4, 
            LTRIM(RTRIM(m.actor5)) 	as actor5, 
            LTRIM(RTRIM(m.actor6)) 	as actor6, 
            LTRIM(RTRIM(m.actor7)) 	as actor7, 
            LTRIM(RTRIM(m.actor8)) 	as actor8, 
            LTRIM(RTRIM(m.actor9)) 	as actor9, 
            LTRIM(RTRIM(m.actor10)) as actor10,
            m.hiphotos, 
			m.videos, 
			m.url, 
			CASE WHEN cs.advisory IS NOT NULL AND cs.advisory <> '' THEN LTRIM(RTRIM(cs.advisory))
			    WHEN @country = 'USA' THEN LTRIM(RTRIM(m.advisory))
				ELSE LTRIM(RTRIM(i.warning)) END AS advisory,     
			m.distrib, m.flv_high, 
			LTRIM(RTRIM(m.writer)) as writer,
            LTRIM(RTRIM(ISNULL(cs.csDirector,m.director))) as director,
            ISNULL(cs.release,ISNULL(i.release,m.release)) as release,
            LTRIM(RTRIM(cs.custom_text)) as custom_text,
            ISNULL(cs.csProducer,m.producer) as producer,
            cs.csActors, 
				cs.posterImage, 
				cs.csTrailer, 
				cs.seo AS seo,
				ip.ip_filename,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r.capsule) END AS synopsis,
            CASE WHEN cs.synopsis_type = 'Custom' THEN cs.custom_synopsis ELSE RTRIM(r_short.capsule) END AS synopsis_short,
            ISNULL(cs.csMpaa, CASE
                                WHEN @country = 'USA' THEN m.mpaa
                                WHEN @country = '' THEN m.mpaa
                                WHEN @country = 'CAN' THEN
                                     'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') +
                                    ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') +
                                    ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') +
                                    ';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') +
                                    ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') +
                                    ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') +
                                    ';NS' + ISNULL(RTRIM(m.nsmpa), 'NR')
                                ELSE i.cert END) as mpaa,
            LTRIM(RTRIM(( 
                SELECT 
                    CAST(scs.CHOICEID AS varchar(30)) + '///(' + 
                    CAST(sc.CHOICE AS VARCHAR(100)) + ')///' +  
                    CAST(
                        CASE
                            WHEN
                                EventDate IS NULL
                            THEN ''
                    		ELSE EventDate
                    	END
					    AS varchar(30)) 
				    + '///' + 
					    CASE
					        WHEN
					            EventDate2 IS NULL
                    		THEN '' 
                    		ELSE CAST(EventDate2 AS varchar(30)) 
                    	END
				    + '///' + 
                    	CASE
                    		WHEN
                    			EventDate3 IS NULL
                    		THEN ''
                    		ELSE CAST(EventDate3 AS varchar(30))
                    	END
					+  ';'
		        FROM Websites..SiteChoiceSelection scs WITH(NOLOCK) 
		        JOIN Websites..SiteChoices sc WITH(NOLOCK) ON sc.CHOICEID = scs.CHOICEID 
					 WHERE scs.SITEID = @site_id AND scs.CSID = cs.CsId
      		    FOR XML PATH('')
        		))) AS categories,
        		cs.sort_order,
        		cs.orphan as orphan,
        		cs.virtual_cinema as virtual_cinema
        	FROM Websites..Carousel c WITH(NOLOCK)
            JOIN Cinema..Movies m WITH(NOLOCK) on m.movie_id = c.movie_id
            LEFT OUTER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.movie_id = c.movie_id AND cs.SiteId = c. SiteID            
            LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'HOME' 
                    ELSE cs.synopsis_type
                END
            LEFT OUTER JOIN Cinema..Reviews r_short WITH(NOLOCK) ON m.movie_id = r_short.movie_id AND r_short.sid =
                CASE
                    WHEN cs.synopsis_type = 'none' OR
                         cs.synopsis_type = '' OR
                         cs.synopsis_type IS NULL
                    THEN 'SYSYN' 
                    ELSE cs.synopsis_type
                END
            
            LEFT OUTER JOIN Cinema..Screens s WITH(NOLOCK) on m.movie_id = s.movie_id and s.house_id in
                (SELECT house_id from Websites..SiteHouses WITH(NOLOCK) where siteid = @site_id)
            
            
            
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = cs.movie_id AND i.country = @country and i.lang= :lang
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK) ON i.movie_id = ip.movie_id AND i.country = ip.ip_country
            WHERE 
                c.SiteID = @site_id
                AND (cast(c.expDate as datetime) >= '{$today}' or c.expDate is null or c.expDate = '')
                AND (cast(c.startDate as datetime) <= '{$today}' or c.startDate is null or c.startDate = '')
            
            ORDER BY release, name            
        ";

        $params = [
            'site_id' => $site_id,
            'country' => $site_country,
            'lang'    => $site_language,
        ];

        $this->run($sql, $params);
        $movies = $this->fetchAll();

        return $this->mergeWithLostMovies($movies, $site_country);
    }

	/**
	 * @return array movie_id | house_id
	 */
	public function getComingSoonHouses()
	{
		$site_id = config('fxp.site_id');

		$sql = "
            DECLARE @site_id varchar(10)    SET @site_id = :site_id
            SELECT DISTINCT
	            movie_id, sh.house_id, csh.release
            FROM Websites..SiteHouses sh WITH(NOLOCK)
    	        INNER JOIN Websites..ComingSoonHouses csh WITH(NOLOCK) ON sh.house_id = csh.house_id
        	    INNER JOIN Websites..ComingSoon cs WITH(NOLOCK) ON cs.CsId = csh.CsId
            WHERE sh.siteid = @site_id
        ";

		$params = [
			'site_id' => $site_id,
		];

		$this->run($sql, $params);
		$data = $this->fetchAll();

		return $data;
	}

	/**
	 * @param array $movie_ids
	 * @param string $site_country
	 * @return array $movies[numeric][key] a two dimensional array
	 */
	private function getMoviesByIds($movie_ids, $site_country)
	{
        $lost_ids = implode(",",array_keys($movie_ids));

		$sql = "
		    DECLARE @country varchar(10)    SET @country = :country
            SELECT DISTINCT
                
				CAST(m.movie_id AS int) AS movie_id,
                LTRIM(RTRIM(ISNULL(i.fname,m.name))) as name,
                m.parent_id,
                LTRIM(RTRIM(m.runtime)) as runtime, 
                LTRIM(RTRIM(m.genre)) as genre, 
                LTRIM(RTRIM(m.genre2)) as genre2, 
                LTRIM(RTRIM(m.genre3)) as genre3,
                LTRIM(RTRIM(m.actor1)) as actor1, 
                LTRIM(RTRIM(m.actor2)) as actor2, 
                LTRIM(RTRIM(m.actor3)) as actor3, 
                LTRIM(RTRIM(m.actor4)) as actor4, 
                LTRIM(RTRIM(m.actor5)) as actor5, 
                LTRIM(RTRIM(m.actor6)) as actor6, 
                LTRIM(RTRIM(m.actor7)) as actor7, 
                LTRIM(RTRIM(m.actor8)) as actor8, 
                LTRIM(RTRIM(m.actor9)) as actor9, 
                LTRIM(RTRIM(m.actor10)) as actor10,
                m.hiphotos, 
				m.videos, 
				m.url, 
				LTRIM(RTRIM(m.advisory)) as advisory, 
				m.distrib, 
				m.flv_high, 
				LTRIM(RTRIM(m.writer)) as writer,
                LTRIM(RTRIM(m.director)) as director,
                ISNULL(i.release,m.release) as release,
                ISNULL(m.producer, '') as producer,
                null as custom_text,
                null as csActors, 
				null as posterImage, 
				null as csTrailer, 
				null as seo,
				ip.ip_filename,
				RTRIM(r.capsule) AS synopsis,
				RTRIM(r_short.capsule) AS synopsis_short,
            CASE
                                WHEN @country = 'USA' THEN m.mpaa
                                WHEN @country = '' THEN m.mpaa
                                WHEN @country = 'CAN' THEN
                                     'BC' + ISNULL(RTRIM(m.bcmpa), 'NR') +
                                    ';SK' + ISNULL(RTRIM(m.skmpa), 'NR') +
                                    ';AB' + ISNULL(RTRIM(m.abmpa), 'NR') +
                                    ';MB' + ISNULL(RTRIM(m.mbmpa), 'NR') +
                                    ';ON' + ISNULL(RTRIM(m.onmpa), 'NR') +
                                    ';QC' + ISNULL(RTRIM(m.pqmpa), 'NR') +
                                    ';NS' + ISNULL(RTRIM(m.nsmpa), 'NR')
                                ELSE i.cert END as mpaa,
			null AS categories,
        	null as sort_order,
        	0 as orphan
            FROM Cinema..Movies m WITH(NOLOCK)
            LEFT OUTER JOIN Cinema..Reviews r WITH(NOLOCK) ON m.movie_id = r.movie_id AND r.sid = 'HOME'
            LEFT OUTER JOIN Cinema..Reviews r_short WITH(NOLOCK) ON m.movie_id = r_short.movie_id AND r_short.sid = 'SYSYN'
            LEFT OUTER JOIN Cinema..Intl i WITH(NOLOCK) ON i.movie_id = m.movie_id AND i.country = @country
            LEFT OUTER JOIN Cinema..IntlPhotos ip WITH(NOLOCK)  ON ip.movie_id = i.movie_id AND ip.ip_country = i.country
            WHERE m.movie_id in (" . $lost_ids . ")
            ORDER BY release DESC, name
        ";

		$params = [
			'country' => $site_country,
		];

		$this->run($sql, $params);
		$data = $this->fetchAll();

		return $data;
	}

	/**
	 * @param array $movies
	 * @param string $site_country
	 *
	 * @return array $movies[numeric][key] a two dimensional array
	**/
	private function mergeWithLostMovies($movies, $site_country)
	{
		$movie_ids = $parent_ids = [];
		foreach ($movies as $movie) {
			if ($movie['parent_id'] != 0) {
				$parent_ids[$movie['parent_id']] = '';
			}
			$movie_ids[$movie['movie_id']] = '';
		}

		$lost_ids = array_diff_key($parent_ids, $movie_ids);
		if (empty($lost_ids)) {
			return $movies;
		}
		$lost_movies = $this->getMoviesByIds($lost_ids, $site_country);

		return array_merge($movies,$lost_movies);

	}
}