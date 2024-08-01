<?php

$routes = [];

$routes['contact'] = ['GET', '/contact', function () {
    return [
        'type'     => 'page',
        'filename' => 'page',
        'page_id'  => 9070,
    ];
}];

$routes['mpaa'] = ['GET', '/mpaa', function () {
    return [
        'type'     => 'page',
        'filename' => 'mpaa',
    ];
}];

$routes[] = ['POST', '/data/[*:function]', function ($function) {
    return [
        'type'     => 'ajax',
        'filename' => 'data',
        'function' => $function,
    ];
}];

return $routes;
