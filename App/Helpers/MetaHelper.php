<?php

namespace App\Helpers;

class MetaHelper
{
    /**
     * Construct a Google Font URL
     */
    public static function get_google_font($font)
    {
        $google_font = "";
        //create Google font URLs
        if (stripos($font, 'maven')) {
            $google_font = "<link href='//fonts.googleapis.com/css?family=Maven+Pro:400,500,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'roboto')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Roboto:400,500,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'oswald')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Oswald:400,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'volkhov')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Volkhov:400,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'expletus')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Expletus+Sans:400,500,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'overlock')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Overlock:400,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'josefin')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Josefin+Slab:400,700' rel='stylesheet' type='text/css'>";
        } elseif (stripos($font, 'alegreya')) {
            $google_font = "<link href='http://fonts.googleapis.com/css?family=Alegreya+Sans:400,700' rel='stylesheet' type='text/css'>";
        }
        
        if ($google_font != "") {
            return "<!-- Google Font -->\r$google_font\r";
        }
    }
    
    /**
     * Checks if a house is ticketing
     */
    public static function get_ticketing($posType)
    {
        
        //no ticketing as defailt
        $ticketing = false;

        if ($posType != '' && $posType != "None") {
            $ticketing = true;
        } elseif ($posType == "None") {
            $ticketing = false;
        }
        
        return $ticketing;
    }
    
    /**
     * Builds a string of 48 showtime fields.
     *
     * @return string comma seperated string of time fields
     */
    public static function showtime_fields()
    {
        $fields = "";
        
        //showtimes fields
        for ($i = 1; $i <= 48; $i++) {
            $fields .= "time" . $i . ",";
        }
        
        //AM/PM fields
        for ($i = 1; $i <= 48; $i++) {
            $fields .= "mer" . $i . ",";
        }
        
        //bargain fields
        for ($i = 1; $i <= 48; $i++) {
            $fields .= "bargain" . $i . ",";
        }
        
        //hack off last comma and return string
        return substr($fields, 0, -1);
    }
    
    /**
     * checks whether screen is showing double or triple feature
     *
     * @param $arr       array of all showtimes
     * @param $screen_id of current screen
     *
     * @return integer $count
     */
    public static function feature_count($arr, $screen_id)
    {
        $count = 0;
        
        foreach ($arr as $a) {
            if ($a['screen_id'] == $screen_id) {
                $count++;
            }
        }
        
        return $count;
    }
    
    /*
    * isSoldOut - return true if specified showtime is marked soldout in perfs
    *  $soldouts - array of performances
    *  $house_id - house
    *  $movie_id - movie
    *  $showdate = date
    *  $showtime - tome
    *  $comment - filter specific comments
    *  @return - true or false
    */
    public static function isSoldOut($soldouts, $house_id, $movie_id, $showdate, $showtime, $comment='')
    {
        // Nothing is sold out, or don't care
        if ($soldouts == null) {
            return (false);
        }
        
        foreach ($soldouts as $soldrow) {
            if ($soldrow['house_id'] == $house_id
                && $soldrow['movie_id'] == $movie_id
                && $soldrow['showtime'] == $showtime
                && $soldrow['showdate'] == $showdate
                && $soldrow['showcode'] == $comment) {
                    return true;
            }
        }
        
        // Not found, assume not sold out
        return false;
    }
    
    /**
     * Returns a state's full name based on passed in abbreviation
     *
     * @param $state_abbr
     *
     * @return string $state_name
     */
    public static function get_state_name($state_abbr)
    {
        //array of state names and abbreviations
        $state_list = self::get_state_list();
        
        //set a variable to the full state name
        $state_name = array_key_exists($state_abbr, $state_list ) ? $state_list[$state_abbr] : $state_abbr;
        
        //clear the array and return the state name
        $state_list = null;
        
        return $state_name;
    }
    
    /**
     * Returns an array of states
     *
     * @return array $state_name
     */
    public static function get_state_list()
    {
        //array of state names and abbreviations
        return [
            'AL' => "Alabama",
            'AK' => "Alaska",
            'AZ' => "Arizona",
            'AR' => "Arkansas",
            'CA' => "California",
            'CO' => "Colorado",
            'CT' => "Connecticut",
            'DE' => "Delaware",
            'DC' => "District Of Columbia",
            'FL' => "Florida",
            'GA' => "Georgia",
            'HI' => "Hawaii",
            'ID' => "Idaho",
            'IL' => "Illinois",
            'IN' => "Indiana",
            'IA' => "Iowa",
            'KS' => "Kansas",
            'KY' => "Kentucky",
            'LA' => "Louisiana",
            'ME' => "Maine",
            'MD' => "Maryland",
            'MA' => "Massachusetts",
            'MI' => "Michigan",
            'MN' => "Minnesota",
            'MS' => "Mississippi",
            'MO' => "Missouri",
            'MT' => "Montana",
            'NE' => "Nebraska",
            'NV' => "Nevada",
            'NH' => "New Hampshire",
            'NJ' => "New Jersey",
            'NM' => "New Mexico",
            'NY' => "New York",
            'NC' => "North Carolina",
            'ND' => "North Dakota",
            'OH' => "Ohio",
            'OK' => "Oklahoma",
            'OR' => "Oregon",
            'PA' => "Pennsylvania",
            'RI' => "Rhode Island",
            'SC' => "South Carolina",
            'SD' => "South Dakota",
            'TN' => "Tennessee",
            'TX' => "Texas",
            'UT' => "Utah",
            'VT' => "Vermont",
            'VA' => "Virginia",
            'WA' => "Washington",
            'WV' => "West Virginia",
            'WI' => "Wisconsin",
            'WY' => "Wyoming",
        ];
    }
    
    /**
     * Adds dashes and converts charcters for friendly URLs
     * and SEO optimization.
     *
     * @param $name
     *
     * @return String $name
     */
    public static function url_name($name)
    {
        $name = str_replace("-", "-", $name);
        $name = str_replace("?", "", $name);
        $name = str_replace(" ", "-", $name);
        $name = str_replace("/", "-", $name);
        $name = str_replace("&", "and", $name);
        $name = str_replace(":", "", $name);
        $name = str_replace(",", "", $name);
        $name = str_replace("+", "-", $name);
        $name = str_replace("'", "", $name);
        $name = str_replace("!", "", $name);
        
        $name = str_replace("---", "-", $name);
        $name = str_replace("--", "-", $name);
        
        return $name;
    }
    
    public static function my_mime_type($filename)
    {
        
        $mime_types = [
            
            'txt'  => 'text/plain',
            'htm'  => 'text/html',
            'html' => 'text/html',
            'php'  => 'text/html',
            'css'  => 'text/css',
            'js'   => 'application/javascript',
            'json' => 'application/json',
            'xml'  => 'application/xml',
            'swf'  => 'application/x-shockwave-flash',
            'flv'  => 'video/x-flv',
            
            // images
            'png'  => 'image/png',
            'jpe'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'jpg'  => 'image/jpeg',
            'gif'  => 'image/gif',
            'bmp'  => 'image/bmp',
            'ico'  => 'image/vnd.microsoft.icon',
            'tiff' => 'image/tiff',
            'tif'  => 'image/tiff',
            'svg'  => 'image/svg+xml',
            'svgz' => 'image/svg+xml',
            
            // archives
            'zip'  => 'application/zip',
            'rar'  => 'application/x-rar-compressed',
            'exe'  => 'application/x-msdownload',
            'msi'  => 'application/x-msdownload',
            'cab'  => 'application/vnd.ms-cab-compressed',
            
            // audio/video
            'mp3'  => 'audio/mpeg',
            'qt'   => 'video/quicktime',
            'mov'  => 'video/quicktime',
            
            // adobe
            'pdf'  => 'application/pdf',
            'psd'  => 'image/vnd.adobe.photoshop',
            'ai'   => 'application/postscript',
            'eps'  => 'application/postscript',
            'ps'   => 'application/postscript',
            
            // ms office
            'doc'  => 'application/msword',
            'rtf'  => 'application/rtf',
            'xls'  => 'application/vnd.ms-excel',
            'ppt'  => 'application/vnd.ms-powerpoint',
            
            // open office
            'odt'  => 'application/vnd.oasis.opendocument.text',
            'ods'  => 'application/vnd.oasis.opendocument.spreadsheet',

            // fonts
            'eot'  => 'application/vnd.ms-fontobject',
            'woff'  => 'application/font-woff',
            'woff2'  => 'application/font-woff2',
            'otf'  => 'application/x-font-opentype',
            'ttf'  => 'application/x-font-truetype',
        ];
        
        $ext = @strtolower(array_pop(explode('.', $filename)));
        if (array_key_exists($ext, $mime_types)) {
            return $mime_types[$ext];
        } elseif (function_exists('finfo_open')) {
            $finfo    = finfo_open(FILEINFO_MIME);
            $mimetype = finfo_file($finfo, $filename);
            finfo_close($finfo);
            
            return $mimetype;
        } else {
            return 'application/octet-stream';
        }
    }

    public function meta_seo($data){
        $raw_data =  (!empty($data) ?  json_decode($data, true) : []);
        $result['title']           = (isset($raw_data['title']) ? $raw_data['title'] : null );
        $result['h1']              = (isset($raw_data['h1']) ? $raw_data['h1'] : null);
        $result['indexed']         = (isset($raw_data['indexed']) ? $raw_data['indexed'] : null);
        $result['description']     = (isset($raw_data['meta']['description']) ? $raw_data['meta']['description'] : null);
        $result['keywords']        = (isset($raw_data['meta']['keywords']) ? $raw_data['meta']['keywords'] : null);
        $result['canonical']       = (isset($raw_data['meta']['canonical']) ? $raw_data['meta']['canonical'] : null);
        $result['og_image']        = (isset($raw_data['og']['image']) ? $raw_data['og']['image'] : null);

        return $result;
    }
}