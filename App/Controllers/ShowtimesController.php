<?php

namespace App\Controllers;

use App\Core\Cache;

use App\Helpers\DataHelper;
use App\Helpers\DateHelper;
use App\Helpers\MovieHelper;
use App\Helpers\BuildHelper;
use App\Helpers\MetaHelper;

use App\Helpers\TimeZoneHelper;
use App\Models\House;
use App\Models\Screen;

use Symfony\Component\HttpClient\HttpClient;


class ShowtimesController
{
    public function index()
    {
        $site_id = config('fxp.site_id');

        $cacheItem = Cache::getItem('showtimes_site_' . $site_id);
        if (!Cache::isHit($cacheItem)) {

            $mScreen = new Screen();

            $showtimes = [];
            $showdates = $mScreen->getShowdates();

            foreach ($showdates as $a_date) {
                $cacheItem_date = Cache::getItem('showtimes_site_' . $site_id.'_'.$a_date);
                if (!Cache::isHit($cacheItem_date)) {
                    $showtimes_date = [];

                    $showtimes_results = $mScreen->getShowtimes($a_date);

                    foreach ($showtimes_results as $result) {
                        // Set timezone of house
                        TimeZoneHelper::setTimezone($result->timezone);
                        $now = DateHelper::now();

                        $house_id = $result->house_id;
                        $movie_id = $result->movie_id;
                        $showdate = $result->showdate;

                        $mHouse = new House();
                        $movie_name = $result->movie_name;

                        $ticketing = MetaHelper::get_ticketing($result->posType);

                        // If they want to display sold out information, retrieve from perfs
                        $soldouts = $mHouse->getPerfsSoldout($house_id, $a_date);

                        // showtimes array building
                        $showdate = date('Y-m-d', strtotime($showdate));
                        $showtimes_date_temp = [];

                        for ($i = 1; $i <= 48; $i++) {
                            if (isset($result->{"time{$i}"})) {
                                $showtime = date('H:i', strtotime($result->{"time{$i}"}));

                                $showtimeDateTime = date('Y-m-d', strtotime($a_date)) . ' ' . date('H:i:s', strtotime($showtime));

                                if($showtime <= date('H:i',strtotime('03:00')) ){
                                    $showtimeDateTime = date('Y-m-d H:i', strtotime($showtimeDateTime. " +1 days"));
                                }

                                $timeData = [];
                                $timeData['screens_id'] = $result->screens_id;
								$timeData['screen_id'] = $result->screen_id;
                                $timeData['format'] = MovieHelper::format($movie_name);
                                $timeData['allowpass'] = $result->allowpass;
                                $timeData['comment'] = $result->comment;
                                $timeData['sneak'] = $result->sneak;

                                if ($showtimeDateTime > $now) {
                                    $timeData['expired'] = false;
                                } else {
                                    $timeData['expired'] = true;
                                }

                                if ($ticketing) {
                                    // create comment to send to relay
                                    $showcode = [];
                                    $screen = '';
                                    if (stripos($timeData['comment'], 'mxc') !== false) {
                                        $showcode[] = 'mxc';
                                    }
                                    if (stripos($timeData['comment'], 'dbox') !== false) {
                                        $showcode[] = 'dbox';
                                    }
                                    if (stripos($timeData['comment'], 'd-box') !== false) {
                                        $showcode[] = 'd-box';
                                    }
                                    if (stripos($timeData['comment'], 'VIP21') !== false) {
                                        $showcode[] = 'vip21';
                                    } elseif (stripos($timeData['comment'], 'VIP') !== false) {
                                        $showcode[] = 'vip';
                                    }
                                    if (stripos($timeData['comment'], 'luxury') !== false) {
                                        $showcode[] = 'luxury';
                                    }

                                    if (stripos($timeData['comment'], 'car') !== false) {
                                        $showcode[] = 'cars';
                                    }
                                    if (stripos($timeData['comment'], 'SUV') !== false) {
                                        $showcode[] = 'SUV';
                                    }
                                    if (stripos($timeData['comment'], 'Drive-In') !== false) {
                                        $showcode[] = 'drive-in';
                                    }

                                    $showcode = implode(";", $showcode);

                                    preg_match('/screen_(?P<screen>\d+)/', $timeData['comment'],$matches );
                                    if(!empty($matches)){
                                        $screen = $matches['screen'];
                                    }

                                    if (MetaHelper::isSoldOut($soldouts, $house_id, $movie_id, $a_date, $showtime, $timeData['comment'])) {
                                        $timeData['soldout'] = true;
                                    } else {
                                        $timeData['link'] = BuildHelper::build_showtime_url($house_id, $movie_id, $a_date, $showtime, $showcode, $screen);
                                    }
                                }

                                // Process Comments from Showtimes Manager
                                $use_boapp_attrs = config('fxp.template_options.boapp_attrs', 0);
                                if( $use_boapp_attrs ) {
                                    $attr_values = $this->AppDot_values($house_id);
                                    $timeData['comment'] = $this->check_AppDotAmenities($house_id, $timeData['comment'], $timeData['allowpass'], $attr_values);
                                }

                                $result_line = array(
                                    'house_id'  => $house_id,
                                    'movie_id'  => $movie_id,
                                    'parent_id' => ($result->parent_id) ? $result->parent_id : '',
                                    'date'      => $showdate,
                                    'time'      => $showtimeDateTime, //$showtime,
                                    'details'   => $timeData,
                                );
                                array_push($showtimes_date_temp, $result_line);
                            }
                        }
                        usort($showtimes_date_temp, function ($a, $b) {return strcmp($a['time'], $b['time']);});
                        $showtimes_date = array_merge($showtimes_date , $showtimes_date_temp);
                    }

                    if(Cache::getCreateCache()) {
                        $cacheItem_date->expiresAfter(rand( Cache::TIME20MIN, Cache::TIME30MIN ));
                        $cacheItem_date->set($showtimes_date);
                        Cache::save($cacheItem_date);
                    }
                    $showtimes = array_merge($showtimes, $showtimes_date);
                }else{
                    $showtimes_date = $cacheItem_date->get();
                    $showtimes = array_merge($showtimes, $showtimes_date);
                }
            }

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(rand( Cache::TIME15MIN, Cache::TIME30MIN ));
                $cacheItem->set($showtimes);
                Cache::save($cacheItem);
            }
        } else {
            $showtimes = $cacheItem->get();
        }

        return $showtimes;

    }


    public function check_AppDotAmenities($house_id = 0, $comment = '', $allowpass = '', $attr_arr = [])
    {

        $new_comment = '';

        $cacheItem_comm = Cache::getItem('comment_'.$house_id.'_'.md5(serialize($comment)).'_allowpass_'.md5(serialize($allowpass)));
        if (!Cache::isHit($cacheItem_comm)) {
            if ($comment != "" || stripos('N', $allowpass) !== false) {
                $added_icons = array(); // To check for duplicates a little later

                $comment = explode(';', $comment);
                if (stripos('N', $allowpass) !== false) {
                    array_push($comment, 'NO PASSES');
                }

                foreach ($comment as $part_comment) {
                    $part_comment = strtoupper(trim($part_comment));
                    if (isset($attr_arr[$part_comment])) {
                        if ($attr_arr[$part_comment]['label'] != "" && !in_array($attr_arr[$part_comment]['label'], $added_icons)) {
                            $added_icons[] = $attr_arr[$part_comment]['label'];
                            if (substr($attr_arr[$part_comment]['path'], 0, 1) == '/' || substr($attr_arr[$part_comment]['path'], 0, 4) == 'http') {
                                $new_comment .= '<img src="' . $attr_arr[$part_comment]['path'] . '" title="' . $attr_arr[$part_comment]['desc'] . '" alt="' . $attr_arr[$part_comment]['desc'] . '" class="comments_icons" />';
                            } else {
                                $new_comment .= ';<span class="comments_icons" >' . $attr_arr[$part_comment]['desc'] . '</span>';
                            }
                        }
                    } else {
                        if (!in_array($part_comment, $added_icons)) {
                            if ($part_comment == 'NO PASSES') {
                                foreach ($attr_arr as $attr_key => $attr) {
                                    if (stripos($attr_key, 'no passes') !== false) {
                                        $added_icons[] = $part_comment;
                                        $new_comment .= '<img src="' . $attr['path'] . '" title="' . $attr['desc'] . '" alt="' . $attr['desc'] . '" class="comments_icons" />';
                                    }
                                }
                            }else{
                                $added_icons[] = $part_comment;
                                //$new_comment .= '['.$part_comment.']';
                                $new_comment .= ';<span class="comments_icons" >' . $part_comment . '</span>';
                            }
                        }
                    }
                }
            }

            if(Cache::getCreateCache()) {
                $cacheItem_comm->expiresAfter(rand(Cache::TIME30MIN, Cache::TIME1HR));
                $cacheItem_comm->set($new_comment);
                Cache::save($cacheItem_comm);
            }
        }else{
            $new_comment = $cacheItem_comm->get();
        }

        return $new_comment;
    }

    private function AppDot_values($house_id){
        //return "abs";
        //https://babelfish.filmsxpress.com/attributes/1239?status=active
        $req_link = 'http://babelfish.filmsxpress.com/attributes/'.$house_id;
        $bearerToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoicmlkZ2VmaWVsZCIsImlhdCI6MTU4OTgxNTE2NiwiZXhwIjoxNzYyNjE1MTY2fQ.T8eiCfGfLl2W2S_MY81wjEX5a8AuMU4piOaaBYNrsIo';
        $attr_arr = [];

        $cacheItem = Cache::getItem('appdot_houses_'.$house_id);
        if (!Cache::isHit($cacheItem)) {

            $client = HttpClient::create(['auth_bearer' => $bearerToken]);
            $response = $client->request('GET', $req_link, [
                'query' => [
                    'status' => 'active',
                ],
            ]);
            $statusCode = $response->getStatusCode();

            if ($statusCode == '200') {
                //$content = $response->getContent();
                $content = $response->toArray();

                foreach ($content as $cnt_part) {
                    $label = $cnt_part['label'];
                    $path = (isset($cnt_part['logo']['path']) ? $cnt_part['logo']['path'] : '');
                    $description = ( !empty($cnt_part['description'])  ? $cnt_part['description'] : $label  );
                    $attr_arr[strtoupper($label)]['label']= $label;
                    $attr_arr[strtoupper($label)]['path'] = $path;
                    $attr_arr[strtoupper($label)]['desc'] = $description;
                }

                $cacheItem->expiresAfter(rand(Cache::TIME4HRS, Cache::TIME6HRS));
                $cacheItem->set($attr_arr);
                Cache::save($cacheItem);
            }
        } else {
            $attr_arr = $cacheItem->get();
        }
        return $attr_arr;
    }

    public function virtualcinema($movies, $houses)
    {
        $showtimes = [];
        $site_id = config('fxp.site_id');

        $cacheItem = Cache::getItem('virtualcinema_' . $site_id);
        if (!Cache::isHit($cacheItem)) {

            foreach ($movies['movies'] as $m) {
                if ($m['virtual_cinema']) {
                    $houseIds=null;
                    $locs = $m['virtual_cinema']['locations'];
                    $date_ran = $m['virtual_cinema']['dates'];
                    $movie_id = $m['id'];
                    $link = $m['virtual_cinema']['link'];
                    $button_txt = $m['virtual_cinema']['text'];

                    if ($locs[0]['house_id'] == '0') {
                        $houseIds = array_keys($houses);
                        $showtimes = DataHelper::createVirtualShowtimes($houseIds, $date_ran, $movie_id, $link, $button_txt);
                    } else {
                        foreach ($locs as $a_loc) {
                            $houseIds[] = $a_loc['house_id'];
                        }
                        $showtimes = DataHelper::createVirtualShowtimes($houseIds, $date_ran, $movie_id, $link, $button_txt);
                    }
                }
            }

            if(Cache::getCreateCache()) {
                $cacheItem->expiresAfter(Cache::TIME2HRS);
                $cacheItem->set($showtimes);
                Cache::save($cacheItem);
            }
        } else {
            $showtimes = $cacheItem->get();
        }

        return $showtimes;
    }



}