<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 12/17/2018
 * Time: 10:28 AM
 */


$routes = [];


$routes['locations_id_showtimes'] = ['GET', '/location/[i:houseid]/showtimes/[i:filterid]-[*:houseslug]', function ($houseid, $filterid, $filter_name) {
    return [
        'type'      => 'local_controller',
        'filename'  => 'locations',
        'action'   => 'getshowtimesfilter',
        'params'    => array('house_id' => $houseid, 'filter_id' => $filterid)
    ];
}];

return $routes;
