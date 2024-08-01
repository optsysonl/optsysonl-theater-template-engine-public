<?php

namespace App\Controllers;

use App\Core\Cache;
use App\Core\Controller as BaseController;

use App\Helpers\PageHelper;
use App\Helpers\SiteHelper;

use Symfony\Component\HttpFoundation\Request;

class Controller extends BaseController
{
    public function run()
    {
        Cache::setStartTime(microtime(true));
        $request = Request::createFromGlobals();
        $protocol = ($request->isSecure()) ? 'https://' : 'http://';

        $debug = config('fxp.debug', false);
        if (!$debug) {
            $baseurl = $protocol . config('fxp.site_domain');
        } else {
            $baseurl = $protocol . config('fxp.demourl');
        }

        $house_id = (isset($this->params['house_id']) ? $this->params['house_id'] : null);
        $movie_id = (isset($this->params['movie_id']) ? $this->params['movie_id'] : null);
        $page_id = (isset($this->params['page_id']) ? $this->params['page_id'] : null);
        $params = (isset($this->params['params']) ? $this->params['params'] : null);

        $data = [];
        $data['debug'] = [];

        $data['site'] = [
            'baseurl' => $baseurl,
            'config'  => config('fxp'),
            'meta'    => PageHelper::getMetaData(),
			'cookie'  => isset($_COOKIE) ? $_COOKIE : null,
			'session' => isset($_SESSION) ? $_SESSION : null
        ];

        $data['this_page'] = [
            'header'   => PageHelper::getHeaderData(),
            'class'    => ['body' => $this->view],
            'footer'   => PageHelper::getFooterData(),
            'movie_id' => $movie_id,
            'house_id' => $house_id,
            'page_id'  => $page_id,
			'params'   => $params,
        ];
        if ($debug) {
            $time_bc = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- BeforeControllers: " . $time_bc . " ms for its computations-->";
        }

        $slides = (new SlidesController())->index();
        if ($debug) {
            $time_sl = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- Slides: " . $time_sl . " ms for its computations-->";
        }

        $houses = (new LocationsController())->index();
        if ($debug) {
            $time_ho = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- Houses: " . $time_ho . " ms for its computations-->";
        }

        $movies = (new MoviesController())->index();
        if ($debug) {
            $time_mo = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- Movies: " . $time_mo . " ms for its computations-->";
        }

        $showdates = (new ShowtimesController())->index();
        $showdates1 = (new ShowtimesController())->virtualcinema($movies, $houses);
        $showdates = array_merge($showdates, $showdates1);
        if ($debug) {
            $time_sh = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- Showdates: " . $time_sh . " ms for its computations-->";
        }

        $pages = (new PagesController())->index();
        if ($debug) {
            $time_pa = microtime(true) - Cache::getStartTime();
            $data['debug']['header'][] = "<!-- Pages: " . $time_pa . " ms for its computations-->";
        }

        $data['data'] = [
            'slides'    => $slides,
            'houses'    => $houses,
            'movies'    => $movies,
            'showdates' => $showdates,
            'pages'     => $pages,
        ];

        $data['debug']['footer'][]  = "<!-- TE: " . config('fxp.template_name') . " -->";
        $data['debug']['footer'][]  = "<!-- TE: ". config('server.name') ."/". config('server.env') ." -->";
        if(!Cache::getCreateCache()) {
            $time_av = microtime(true) - Cache::getStartTime();
            $data['debug']['footer'][]  = "<!-- TE: Cache ". $time_av ." -->";
        }
        if ($debug) {$data['debug']['footer'][]  = "<!-- TE: Debug: True -->";}

        echo view($this->view, $data);
        /*if ($debug) {
            $time_av = microtime(true) - Cache::getStartTime();
            echo "<!-- Render: " . $time_av . " ms for its computations-->\n";
        }*/
    }
}