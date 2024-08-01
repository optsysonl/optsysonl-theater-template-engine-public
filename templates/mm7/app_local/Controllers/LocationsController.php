<?php

namespace templates\mm7\app_local\Controllers;

use App\Controllers;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

use templates\mm7\app_local\Models\House;

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
}