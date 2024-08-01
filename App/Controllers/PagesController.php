<?php

namespace App\Controllers;

use App\Core\Cache;
use App\Core\Support\Str;
use App\Models\Pages;
use App\Helpers\PageHelper;
use App\Helpers\MetaHelper;

class PagesController
{
    public function index()
    {
        $mPages    = new Pages();
        $site_id = config('fxp.site_id');

        $cacheItem = Cache::getItem('pages_'.$site_id);
        if (!Cache::isHit($cacheItem)) {
            $data = $mPages->getAllPages();

            $result = [];
            foreach ($data as $page) {

                $page['PageType'] = Str::slug($page['PageType']);
                $p_id = $page['PageId'];

                $cacheItemSingle = Cache::getItem('pages_'.$site_id."_page_".$p_id);

                if (!Cache::isHit($cacheItemSingle)) {

                    $result[$p_id] = $this->makeDetails($page);
                    $result[$p_id]['seo'] = MetaHelper::meta_seo($page['seo']);

                    $result_page = [
                        'p_id' => $result[$p_id],
                        'p_id_seo' => $result[$p_id]['seo']
                    ];
                    if(Cache::getCreateCache()) {
                        $cacheItemSingle->expiresAfter(rand(Cache::TIME12HRS, Cache::TIME1DAY)  );
                        $cacheItemSingle->set($result_page);
                        Cache::save($cacheItemSingle);
                    }else{
                        //var_dump($p_id);die;
                    }
                }else {
                    $result_page = $cacheItemSingle->get();

                    $result[$p_id] = $result_page['p_id'];
                    $result[$p_id]['seo'] = $result_page['p_id_seo'];
                }

            }

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME1DAY);
                $cacheItem->set($result);
                Cache::save($cacheItem);
            }
        } else {
            $result = $cacheItem->get();
        }

        return $result;
    }

    private function makeDetails($page) {
        $details = [];

        foreach ($page as $key => $field) {
            $details = array_merge($details, [Str::snake($key) => $field]);
        }

        $details['url'] = ($details['url'] !='' ? $details['url'] : '/page/' . $details['page_id'] . '/' . Str::slug($details['site_headline']));
        $details['icon'] = str_replace_array('http[s]?:', ['', ''], $details['thumbnail']);
        $details['content'] = PageHelper::getFxpPageContent($details['page_id']);
        // TODO navigations?
        return $details;
    }

    public function error404()
    {
        header($_SERVER["SERVER_PROTOCOL"] . "  404 Not Found");

        $data['site'] = [
            'config' => config('fxp'),
            'meta'   => PageHelper::getMetaData(),
            'header' => PageHelper::getHeaderData(),
            'footer' => PageHelper::getFooterData(),
            'class'  => ['body' => 'error-404'],
        ];
        $data['this_page'] = [
            'header'    => PageHelper::getHeaderData(),
            'footer'    => PageHelper::getFooterData(),
            'class' => ['body' => 'error-404'],
            'movie_id'  => null,
            'house_id'  => null,
            'page_id'   => null,

        ];

        $houses    = (new LocationsController())->index();
        $movies    = (new MoviesController())->index();
        $pages     = (new PagesController())->index();

        $data['data'] = [
            'slides'    => '',
            'houses'    => $houses,
            'movies'    => $movies,
            'showdates' => '',
            'pages'     => $pages,
        ];

        echo view('404', $data);
    }

}