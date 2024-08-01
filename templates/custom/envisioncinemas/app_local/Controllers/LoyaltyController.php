<?php

namespace templates\custom\envisioncinemas\app_local\Controllers;

use App\Helpers\PageHelper;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

use templates\custom\envisioncinemas\app_local\Models\Loyalty;


class LoyaltyController
{

    protected $resp;
    protected $middleware_id = '60';

    function __construct()
    {
        $this->resp = new Response();
    }


    public function index($params)
    {

        /// https://www.mjrtheatres.com/relay2?return=/api/startticketing/redirect/0008/25624&referer=https://booking.mjrtheatres.com/login/0008/25624
        ///
        $this->view = 'login';
        $request = Request::createFromGlobals();
        $protocol = ($request->isSecure()) ? 'https://' : 'http://';

        $debug = config('fxp.debug', false);
        if (!$debug) {
            $baseurl = $protocol . config('fxp.site_domain');
        } else {
            $baseurl = $protocol . config('fxp.demourl');
        }

        if(substr($params['data'], 0, 1) == '?' ){
            $params['data'] = substr($params['data'], 1);
        }

        $data = explode('&', $params['data']);
        $n_data = [];
        foreach ($data as $item){
            $n_item = explode('=', $item);
            $n_data[$n_item[0]] = $n_item[1];
        }

        if (isset($n_data['referer']) && $n_data['referer'] != ''){
            $referer = $n_data['referer'];
        }elseif(isset($_SERVER['HTTP_REFERER'])){
            $referer = $_SERVER['HTTP_REFERER'];
        }else{
            die('Problem');
        }

        preg_match('/(?<=\/\/)(.*?)(?=\/)/', $referer, $domains);

        $params['login_path'] = 'https://' . $domains[0] . $n_data['return'];
        $params['guest_path'] = str_ireplace('login', 'tickets', $referer);

        preg_match('/login\/([0-9]+)\/([0-9]+)/', $referer, $matches);
        $ext_id = $matches[1];
        $ext_schedule_id = $matches[2];

        $params['session'] = $this->build_middleware_session($ext_id, $ext_schedule_id);

        $data = [];

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
            'house_id' => 0,
            'page_id'  => 0,
            'params'   => $params,
        ];

        echo view($this->view, $data);
    }

    private function build_middleware_session($external_id, $external_schedule_id)
    {
        $session = array();

        $session['Cinema'] = $this->build_middleware_cinema($external_id);
        $session['Times'] = $this->build_middleware_schedule($session['Cinema']['CinemaId'], $external_schedule_id);
        $session['Film'] = $this->build_middleware_film($session['Times']['FilmId']);
        return $session;
    }

    private function build_middleware_cinema($external_id)
    {
        $cinema = array();
        $cinemas = $this->middleware_moapi_request('/cinemas/' . $this->middleware_id);

        foreach ($cinemas as $middleware_cinema) {
            if ($external_id == $middleware_cinema['CinemaExternalId']) {
                $cinema = $middleware_cinema;
            }
        }

        $mHouse = new Loyalty();
        $house = $mHouse->get_house_by_altid($cinema['CinemaId']);

        if ($house['name'] != '') {
            $cinema['CinemaName'] = $house['name'];
        }

        return $cinema;
    }

    private function build_middleware_schedule($cinema_id, $external_schedule_id) {
        $schedule = [
            'FilmId'    =>  null,
            'Date'      =>  null,
        ];
        $data = $this->middleware_moapi_request('/movies/GetFilmsByCinema/' . $this->middleware_id .'/' . $cinema_id);

        foreach ($data as $film) {
            foreach ($film['Sessions'] as $film_session) {
                foreach ($film_session['Times'] as $time) {
                    if ($time['ExternalScheduleId'] == $external_schedule_id) {
                        $schedule = $time;
                        $schedule['FilmId'] = $film['FilmId'];
                        $schedule['Date'] = $film_session['NewDate'];
                    }
                }
            }
        }
        return $schedule;
    }

    function build_middleware_film($film_id) {
        $film = null;
        $films = $this->middleware_moapi_request('/movies/' . $this->middleware_id);

        foreach ($films as $middleware_film) {
            if ($film_id == $middleware_film['FilmId']) {
                $film = $middleware_film;
            }
        }

        return $film;
    }



    /**
     * Makes request to middleware movies api
     *
     * @param string $call api call
     * @return array $result
     */
    private function middleware_moapi_request($call)
    {
        $result = array();

        $context = stream_context_create(
            array(
                "http" => array(
                    "method" => "GET",
                    "header" => "Authorization: Basic m6VpZWEpYYRlc8W1sGE1MYcwqtA=\r\n",
                ),
            )
        );
        $json = @file_get_contents('https://moapi.mvtx.me' . $call, false, $context);
        $data = json_decode($json, true);
        $result = $data['Result'];

        return $result;
    }




    /**
     * Log In User
     *
     * @param string $middleware_id circuit id
     * @param array $post form submit data
     * @return array $data
     */
    public function check_member($params)
    {
        /*
         *
         * var userData = {
          username: $('input[name="username"]').val(),
          password: $('input[name="password"]').val()
        }
         */
        $request = Request::createFromGlobals();
        //$request->request->get('category', 'default category');
        $content = $request->getContent();
        var_dump($content);die;

        //$member = middleware_request('Member/Login?circuitid=' . $peach_id, 'post', $post);
        $member = $this->middleware_moapi_request('Member/Login?circuitid=' . $this->middleware_id, 'post', $post);

        if ($member['MemberDetails'] == null) {
            switch ($member['ClientErrorMessage']) {
                case 'Your member details where not found':
                    $error = 'Username not found';
                    break;
                case 'Your member details are invalid':
                    $error = 'Password incorrect';
                    break;
                default:
                    $error = trim($member['ClientErrorMessage']);
                    break;
            }

            return array('apiError' => $error);
        }

        $data = $member['MemberDetails'];
        $data['TotalPoints'] = 0;
        $data['TotalPremierDollars'] = 0;
        foreach ($data['Balances'] as $balance) {
            if ($balance['Name'] == 'Prem Points') {
                $data['TotalPoints'] = $balance['Total'];
            }
            if ($balance['Name'] == 'Prem Dollars') {
                $data['TotalPremierDollars'] = $balance['Total'];
            }
        }

        $password = (string)$post['Password'];
        $password = trim($password);
        $data['Password'] = $this->dti_encrypt($password);
        $data['Refresh'] = (time() + (60 * 30));
        $data['DateOfBirthYMD'] = (stripos($data['DateOfBirth'], 'T') !== false) ? substr($data['DateOfBirth'], 0, stripos($data['DateOfBirth'], 'T')) : $data['DateOfBirth'];

        setcookie('member', json_encode($data), time() + (60 * 60 * 24 * 30), '/');

        return $data;
    }

    private function dti_encrypt($plaintext, $method = 'aes-256-cbc', $key = '100a87736b4d5c92f5791c87960f22bb') {
        $iv = openssl_random_pseudo_bytes(16);
        $encrypted = openssl_encrypt($plaintext, $method, $key, 0, $iv);
        $payload = base64_encode($iv) . $encrypted;
        return $payload;
    }

}