<?php

$routes = [];

/// https://www.mjrtheatres.com/relay2?return=/api/startticketing/redirect/0008/25624&referer=https://booking.mjrtheatres.com/login/0008/25624


$routes['login'] = ['GET', '/login?[*:data]', function ($data) {

    return [
        'type'      => 'local_controller',
        'filename'  => 'loyalty',
        'action'   => 'index',
        'params'    => ['data'=>$data]
    ];
}];

$routes['login-post'] = ['POST', '/login/check_member', function () {

    return [
        'type'      => 'local_controller',
        'filename'  => 'loyalty',
        'action'   => 'check_member',
        'params'    => []
    ];
}];

return $routes;