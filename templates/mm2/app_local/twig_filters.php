<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 6/7/2018
 * Time: 2:58 PM
 */

function sortByStateFilter($houses){

    $houses_state = [];
    $houses_new   = [];

    foreach ($houses as $h) {
        if (isset($state) && $state != $h["state_full"]) {
            $this_state = ['state' => $state, 'houses' => $houses_state];
            array_push($houses_new, $this_state);
            $houses_state = [];
        }

        $state = $h["state_full"];
        $house_new = [];

        //setup variables
        $house_new['house_id'] = $h['house_id'];
        $house_new['name']     = $h['name'];
        $house_new['url']      = $h['url'];
        $house_new['state']    = $state;
        array_push($houses_state, $house_new);
    }
    $this_state = ['state' => $state, 'houses' => $houses_state];
    array_push($houses_new, $this_state);

    return $houses_new;
}

function url_decodeFilter($url){
    return urldecode($url);
}