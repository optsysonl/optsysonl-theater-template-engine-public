<?php

namespace App\Models;

use App\Core\Model;
use App\Helpers\TimeZoneHelper;

class Configuration extends Model
{
    public function getConfigData($host)
    {
        $sql = "
                DECLARE @website varchar(max) SET @website = :siteurl
                SELECT 
                    SiteId					        as		site_id,
                    SiteUrl					        as		site_domain,
                    DemoUrl                         as  	demourl,
                    apikey					        as		api_key,
                    SiteType				        as		template,
                    SiteTemplate			        as		template_name,
                    SiteTheme				        as		theme,
                    SiteTemplateOptions		        as		template_options,
                    SiteHeadline			        as		title,
                    cust_id					        as		cust_id,
                    MetaData				        as		keywords,
                    MetaData2				        as		description,
                    TimesType                       as      timestype,
                    FacebookUrl				        as		facebook,
                    TwitterUrl				        as		twitter,
                    InstagramUrl			        as		instagram,
                    YoutubeUrl				        as		youtube,
                    PintrestUrl				        as		pintrest,
                    GoogleUrl				        as		'google+',
                    SiteImage				        as		header_img,
                    SiteBackgroundImage		        as		background_img,
                    SiteHeaderImage			        as		site_header_img,
                    bkg_repeat				        as		background_repeat,
                    bkg_color				        as		bkg_color,
                    bkg_color2				        as		bkg_color2,
                    text_color				        as		text_color,
                    text_color2				        as		text_color2,
                    LTRIM(RTRIM(font))		        as		font,
                    LTRIM(RTRIM(google_adwords))	as		google_adwords_code,
                    'AIzaSyCHxrppAcmNfULIaTaFpAiLEFhxaEqQM5M'					as		google_map_api,
                    LTRIM(RTRIM(MiscData))	        as		misc_html,
                    SiteEmail				        as		contact_email,
                    SiteAnalytics       	        as		analytics,
                    RedirectURL				        as		redirect,
                    SiteSmartUrl			        as		mobile,
                    Favicon					        as		Favicon,
                    SiteCountry				        as		site_country,
                    SliderSpeed				        as		slider_speed,
                    @website                        as      site_url,
                    (case when s.demourl =  @website then 'true' else 'false' end) as debug,
                    site_language                   as      language_id,
                    seo                             as      seo,
                    apps                            as      apps
                FROM Websites..Sites s  WITH(NOLOCK)
                WHERE 
                  s.siteurl = @website
                  OR 
                  s.demourl = @website
                ";

        $params = [
            'siteurl' => $host
        ];

        //fetch the config
        $this->run($sql, $params);

        $result = $this->fetch();
        $result['template_options'] = json_decode($result['template_options'], true);
        $result['apps'] = json_decode($result['apps'], true);
        return $result;
    }

    public function getTimezone($site_id)
    {
        $timezone = '';
        $timezone_temp = '';

        $sql = 'SELECT DISTINCT sh.timezone
			FROM Websites..Sites s WITH(NOLOCK)
			LEFT OUTER JOIN Websites..SiteHouses sh WITH(NOLOCK) ON sh.SiteId = s.SiteId
			WHERE s.SiteId = :site_id';
        $params = [
            'site_id' => $site_id
        ];

        $this->run($sql, $params);

        $timezones = $this->fetchAll();

        if (count($timezones) == 1){
            $timezone = TimeZoneHelper::getPhpTimezone($timezones[0]['timezone']);
        } elseif (count($timezones) > 1){
            foreach ($timezones as $t){

                $tz = TimeZoneHelper::getPhpTimezone($t['timezone']);

                if ($tz == ''){
                    continue;
                } elseif (($tz != '') && ($timezone_temp == '')){
                    $timezone_temp = 'America/New_York';
                }

                if (TimeZoneHelper::getTimezoneOffset($tz, $timezone_temp) > 0){
                    $timezone_temp = $tz;

                }
            }
            $timezone = $timezone_temp;
        }

        if ($timezone == ''){
            $timezone = 'America/Los_Angeles';
        }

        return $timezone;
    }

    public function getLanguage($language_id)
    {
        $sql = "SELECT *
            FROM Websites..Language WITH(NOLOCK)
            WHERE lang_id = :lang_id";

        $params = [
            'lang_id' => $language_id
        ];

        $this->run($sql, $params);
        $result = $this->fetch();

        return $result;
    }

    public function getApiKey($host)
    {
        $sql = "
                DECLARE @website varchar(max) SET @website = :siteurl
                SELECT 
                    apikey as api_key
                FROM Websites..Sites s  WITH(NOLOCK)                  
                WHERE 
                  s.siteurl = @website OR s.demourl = @website
                ";

        $params = [
            'siteurl' => $host
        ];

        //fetch the config
        $this->run($sql, $params);

        $result = $this->fetch();
        return ($result ? $result['api_key'] : '');
    }
}