<?php

namespace App\Helpers;

class HouseHelper
{
    /**
     * Checks if a house is ticketing
     *
     * @param array $data
     *
     * @return bool
     */
    public static function ticketing($data)
    {
        $dataTicketing = (isset($data['ticketing']) ? (boolean)$data['ticketing'] : false);
        $posURL        = (isset($data['posURL']) ? $data['posURL'] : null);
        $posType       = (isset($data['posType']) ? $data['posType'] : null);
        
        //no ticketing as defailt
        $ticketing = false;
        
        //if any of these have values, they are ticketing
        if ($dataTicketing || $posURL) {
            $ticketing = true;
        }
        
        if ($posType == 'None') {
            $ticketing = false;
        } elseif ($posType) {
            $ticketing = true;
        }
        
        return $ticketing;
    }
}