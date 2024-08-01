<?php

namespace App\Models;

use App\Core\Model;

use App\Core\Support\Str;

use App\Helpers\DateHelper;


class Page extends Model
{
    /**
     * Gets a two dimensional array of all pages for a website
     *
     * @param string $type
     *
     * @return array $pages[numeric][key] a two dimensional array
     */
    function getCreatedPages($type)
    {
        $site_id = config('fxp.site_id');
        
        $today = DateHelper::today();
        
        $filter = '';
        // was a type passed in?
        if ($type == 'top') {
            $filter = 'AND p.navTop = 1';
        } elseif ($type == 'bottom') {
            $filter = 'AND p.navBottom = 1';
        }
        
        $sql = "
            SELECT p.PageId, p.SiteHeadline, p.URL, p.PageType, p.NewWindow, p.Thumbnail, seo as seo
            FROM Websites..Pages p WITH(NOLOCK)
            WHERE p.SiteId = :site_id
                {$filter}
                AND (cast(p.PageStart AS DATETIME) <= '{$today}' OR p.PageStart IS NULL OR p.PageStart = '')
                AND (cast(p.PageEnd AS DATETIME) > '{$today}' OR p.PageEnd IS NULL OR p.PageEnd = '')
                AND (p.IsMessage IS NULL OR p.IsMessage = 0)
            ORDER BY p.Priority, p.PageType DESC, p.SiteHeadline
        ";
        
        $params = [
            'site_id' => $site_id,
        ];
        
        $this->run($sql, $params);
        $pages = $this->fetchAll();
        
        $navigation = [];
        foreach ($pages as $page) {
            $type = Str::slug($page['PageType']);
            
            $item = [
                'id'     => $page['PageId'],
                'name'   => trim($page['SiteHeadline']),
                'url'    => ($page['URL'] !='' ? $page['URL'] : '/page/' . $page['PageId'] . '/' . Str::slug($page['SiteHeadline'])),
                'target' => (($page['NewWindow'] == 1) ? "target='_blank'" : ''),
                'icon'   => str_replace_array('http[s]?:', ['', ''], $page['Thumbnail']),
            ];
            
            if ($type) {
                if (!isset($navigation[$type])) {
                    $navigation[$type] = ['name' => '', 'icon' => ''];
                }
                
                $navigation[$type]['name'] = $page['PageType'];
                $navigation[$type]['icon'] = ($item['icon'] ? $item['icon'] : $navigation[$type]['icon']);
                $navigation[$type]['sub_nav'][] = $item;
            } else {
                $navigation[] = $item;
            }
        }
        
        return $navigation;
    }
}
