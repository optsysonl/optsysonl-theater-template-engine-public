<?php

namespace App\Models;

use App\Core\Model;

use App\Helpers\DateHelper;

class Pages extends Model
{
    /**
     * Gets a two dimensional array of all pages for a website
     *
     * @return array $pages[numeric][key] a two dimensional array
     */
    function getAllPages()
    {
        $site_id = config('fxp.site_id');

        $today = DateHelper::today();

        $sql = "
            SELECT 
                  p.PageId, 
                  p.category_id,
                  LTRIM(RTRIM(p.SiteHeadline)) as SiteHeadline,
                  p.PageLink as PageLink,
                  p.URL as Url, 
                  p.PageType, 
                  p.NewWindow,
                  p.Thumbnail, 
                  p.house_ids,
                  p.short_desc,
                  p.byline,
                  p.PageStart, 
                  p.PageEnd, 
                  p.Priority,
                  p.EventTime, 
                  p.navTop, 
                  p.navBottom, 
                  p.NewWindow,
                  CASE 
                      WHEN IsNews = 1 THEN 'news' 
                      WHEN IsPress = 1 THEN 'press_release' 
                      WHEN IsEvent = 1 THEN 'event'
                      whEn IsLink = 1 THEN 'link'
                      WHEN IsMisc = 1 THEN 'misc'
                      WHEN isMessage = 1 THEN 'message'
                      WHEN IsSeries = 1 THEN 'series'
                      ELSE 'custom' 
                  END AS category,
                  CASE 
                      WHEN (LOWER(p.SiteHeadline) <> 'contact' AND 
                            LOWER(p.SiteHeadline) <> 'mpaa' AND 
                            LOWER(p.SiteHeadline) <> 'newsletter') 
                            THEN 'page' 
                      ELSE LOWER(p.SiteHeadline) 
                  END as [type],
                  seo as seo
            FROM Websites..Pages p WITH(NOLOCK)
            WHERE p.SiteId = :site_id
                AND (cast(p.PageStart AS DATETIME) <= '{$today}' OR p.PageStart IS NULL OR p.PageStart = '')
                AND (cast(p.PageEnd AS DATETIME) > '{$today}' OR p.PageEnd IS NULL OR p.PageEnd = '')
                AND p.Enabled = '1'
                ORDER BY p.Priority, p.PageType DESC, p.SiteHeadline
        ";

        $params = [
            'site_id' => $site_id,
        ];

        $this->run($sql, $params);
        $result = $this->fetchAll();

        return $result;
    }

}
