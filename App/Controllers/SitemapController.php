<?php

namespace App\Controllers;

use App\Core\Controller as BaseController;

use App\Helpers\PageHelper;

use Symfony\Component\HttpFoundation\Request;

class SitemapController extends BaseController
{
    public function index($file = 'index')
    {
        $request = Request::createFromGlobals();
        $protocol = ($request->isSecure()) ? 'https://' : 'http://';

        $debug    = config('fxp.debug', false);
        if (!$debug) {
            $baseurl = $protocol . config('fxp.site_domain');
        }else{
            $baseurl = $protocol . config('fxp.demourl');
        }

        $house_id = (isset($this->params['house_id']) ? $this->params['house_id'] : null);
        $movie_id = (isset($this->params['movie_id']) ? $this->params['movie_id'] : null);
        $page_id  = (isset($this->params['page_id']) ? $this->params['page_id'] : null);

        $data = [];

        $data['site'] = [
            'baseurl'   => $baseurl,
            'config'    => config('fxp'),
            'meta'      => PageHelper::getMetaData(),
        ];

        $data['this_page'] = [
            'header'    => PageHelper::getHeaderData(),
            'class'     => ['body' => $this->view],
            'footer'    => PageHelper::getFooterData(),
            'movie_id'  => $movie_id,
            'house_id'  => $house_id,
            'page_id'   => $page_id,
        ];

        $slides    = (new SlidesController())->index();
        $houses    = (new LocationsController())->index();
        $movies    = (new MoviesController())->index();
        $showdates = (new ShowtimesController())->index();
        $pages     = (new PagesController())->index();

        $data['data'] = [
            'slides'    => $slides,
            'houses'    => $houses,
            'movies'    => $movies,
            'showdates' => $showdates,
            'pages'     => $pages,
        ];
        
        echo view('sitemaps/'.$file, $data);
    }
}