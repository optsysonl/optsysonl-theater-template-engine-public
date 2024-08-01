<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 10/21/2020
 * Time: 11:49 AM
 */


$routes = [];


$routes[] = ['POST', '/data/[*:function]', function ($function) {
    return [
        'type'     => 'ajax',
        'filename' => 'data',
        'function' => $function,
    ];
}];

return $routes;
