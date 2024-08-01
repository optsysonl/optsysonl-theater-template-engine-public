<?php

namespace templates\custom\kewgardens\app_local\Controllers;

use App\Controllers;
use App\Helpers\PageHelper;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class LocationsController{

    protected $resp;

    function __construct()
    {
        $this->resp = new Response();
    }


    public function redirect($params){
        $houses = (new Controllers\LocationsController())->index();

        $this->resp = new RedirectResponse('/');
        if(isset($params['house_id']) && array_key_exists($params['house_id'], $houses)){
            $this->setCookie($params['house_id']);
        }else{
            foreach ($houses as $house){
                if($house['slug'] == $params['houseslug']){
                    $this->setCookie($house['house_id']);
                    break;
                }
            }
        }
        $this->resp->send();
    }

    public function getlocations($params){
        $request = Request::createFromGlobals();

        if ($request->isMethod('post')) {
            $data = $request->request;
        }elseif ($request->isMethod('get')){
            $data = $request->query;
        }

        $sHouse = new House();
        $houses = $sHouse->get_house_from_location($data->get('search'), 20);
        header("Content-type:application/json");
        echo json_encode($houses);

    }

    public function getShowtimesByKeyword($params){

        $this->view = 'showtimes';
        $request = Request::createFromGlobals();
        $protocol = ($request->isSecure()) ? 'https://' : 'http://';

        $debug = config('fxp.debug', false);
        if (!$debug) {
            $baseurl = $protocol . config('fxp.site_domain');
        } else {
            $baseurl = $protocol . config('fxp.demourl');
        }
        $data = [];
        $houses = (new Controllers\LocationsController())->index();

        if(count($houses) == 1){
            $house = array_values($houses)[0];
            $house_id = $house['house_id'];
            $this->setCookie($house_id);
        }elseif(isset($params['house_id']) && array_key_exists($params['house_id'], $houses)){
            $this->resp = new Response();
            $house_id = $params['house_id'];
            $this->setCookie($house_id);
        }else{
            $this->resp = new RedirectResponse('/');
            $this->resp->send();
        }

        $movies = (new Controllers\MoviesController())->index();

        $showdates = (new ShowtimesController())->showtimesByKeyword($params['keywords']);
        $pages = (new Controllers\PagesController())->index();

        $data['site'] = [
            'baseurl' => $baseurl,
            'config'  => config('fxp'),
            'meta'    => PageHelper::getMetaData(),
            'cookie'  => isset($_COOKIE) ? $_COOKIE : null,
            'session' => isset($_SESSION) ? $_SESSION : null,
        ];

        $data['this_page'] = [
            'header'   => PageHelper::getHeaderData(),
            'class'    => ['body' => $this->view],
            'footer'   => PageHelper::getFooterData(),
            'movie_id' => 0,
            'house_id' => $house_id,
            'page_id'  => 0,
            'params'   => $params,
        ];

        $data['data'] = [
            'houses'    => $houses,
            'movies'    => $movies,
            'showdates' => $showdates,
            'pages'     => $pages,
            'heading_h1'=> $params['h1'],
        ];

        echo view($this->view, $data);
    }


    private function setCookie($house_id){
        $this->resp->headers->setCookie(
            new Cookie(
                'active-house',
                $house_id,
                $expire = 0,
                $path = '/',
                $domain = null,
                $secure = false,
                $httpOnly = false)
        );
    }

    private function getCookies(){
        return $this->resp->headers->getCookies();
    }
}