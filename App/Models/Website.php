<?php

namespace App\Models;

use App\Core\Model;
use App\Helpers\BuildHelper;
use App\Helpers\DateHelper;

class Website extends Model
{
    /**
     * Get the site state
     *
     * @return string
     */
    public function getState()
    {
        $site_id = config('fxp.site_id');

        $sql = "
            SELECT sh.state
            FROM Websites..SiteHouses sh WITH(NOLOCK)
            WHERE sh.SiteId = :site_id
        ";

        $params = [
            'site_id' => $site_id,
        ];

        $this->run($sql, $params);
        $state = $this->value();

        return $state;
    }

    /**
     * Gets a two dimensional array of carousel items (url, caption, image)
     * for the specified site based on from FilmsXpress data.
     *
     * @param string $category ('promotions_home', 'home', 'top', 'bottom', 'left', 'right' or other)
     *
     * @return array $items[numeric][key] a two dimensional array
     * @see function 'fxp_build_carousel_photo_url'
     */
    public function getCarousel()
    {
        $site_id = config('fxp.site_id');

        if (config('developer.on')) {
            $site_id = config('developer.fxp.site_id', $site_id);
        }

        $params = [
            'site_id' => $site_id,
            'today'   => DateHelper::today(),
            'today2'  => DateHelper::today(),
        ];

        $sql = "
            SELECT
              c.*,
              cc.description as category_name
            FROM Websites..Carousel c WITH(NOLOCK)
            LEFT OUTER JOIN Websites..CarouselCategories cc WITH(NOLOCK) ON c.category = cc.name AND c.SiteId = cc.SiteId
            WHERE
                c. SiteID = :site_id
                AND (cast(c.expDate as datetime) >= :today or c.expDate is null or c.expDate = '')
                AND (cast(c.startDate as datetime) <= :today2 or c.startDate is null or c.startDate = '')
            ORDER BY c.category, c.sort
        ";

        $this->run($sql, $params);
        $result = $this->fetchAll();

        $carousel = [];
        foreach ($result as $r) {
            $rCategory = $r['category'];
            $rCategoryName = $r['category_name'];

            $carousel[$rCategory]['name'] = $rCategoryName;

            $item = [];

            $item['image'] = ((stripos($r['largeImage'], '//') !== false) ? $r['largeImage'] : BuildHelper::build_carousel_photo_url($site_id, $r['largeImage']));
            $item['url'] = ($r['URL'] ? $r['URL'] : '#');
            $item['target'] = ($r['targetURL'] == 1 ? '_blank' : '_self');
            $item['image_text'] = ($r['imageTXT'] ? htmlspecialchars($r['imageTXT'], ENT_QUOTES) : '');
            $item['movie_id'] = ($r['movie_id'] ? $r['movie_id'] : '');
            $item['sort'] = ($r['sort'] ? $r['sort'] : '');

            if (isset($r['altTag']) && $r['altTag'] != '') {
                $item['altTag'] = $r['altTag'];
            } elseif (strlen(trim($item['url'])) > 1) {
                $item['altTag'] = substr($item['url'], (strrpos($item['url'], '/') + 1), strlen($item['url']));
            } else {
                $item['altTag'] = 'Slider Image';
            }

            $carousel[$rCategory]['images'][] = $item;
        }

        return $carousel;
    }
}