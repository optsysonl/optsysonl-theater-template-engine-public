<?php

/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 8/28/2017
 * Time: 3:54 PM
 */
class Location
{
    /**
     * @var
     */
    private $house_id;

    /**
     * Location constructor.
     * @param $house_id
     */
    public function __construct($house_id)
    {
        $this->house_id = $house_id;

        $data['house']['house_id'] = $mapping['house_id'];
        try {
            $sql = "
			SELECT 
				ISNULL(sh.name,ch.name) as name, 
				ISNULL(sh.address,ch.address1) as address, 
				ISNULL(sh.phone,ch.movieline) as movieline,
				ISNULL(sh.phoneoffice,ch.phone1) as office_phone, 
				ch.city, 
				ISNULL(sh.state,ch.state) as state, 
				ch.zip,  
				sh.tagline, 
				sh.PhotoUrl, 
				sh.email,
				ch.ticketing,
				sh.posURL,
				sh.facebook, 
				sh.twitter, 
				sh.instagram, 
				sh.pintrest, 
				sh.google,
				sh.amenities,
				sh.posType,
				message_page,
				policies,
				sh.map
			FROM 
				Cinema..Houses ch WITH(NOLOCK)
			INNER JOIN 
				Websites..SiteHouses sh WITH(NOLOCK) 
			ON 
				ch.house_id = sh.house_id and sh.siteid = :site_id
			WHERE 
				ch.house_id = :house_id";
            $q = $db->prepare($sql);
            $q->execute(array(':site_id' => $config->getConfig("site_id"),':house_id' => $data['house']['house_id']));
            $house = $q->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            handle_exception($e);
        }






    }




    /*
     *
     *
     * $data['house']['name'] = $house['name'];
    $data['house']['url'] = url_name($house['name']) . "-Showtimes";
	$data['house']['address'] = trim($house['address']);
	$data['house']['city'] = trim($house['city']);
	$data['house']['state_short'] = trim($house['state']);
	$data['house']['zip'] = trim($house['zip']);
    $data['house']['map']['url'] = $house['map'];
    $data['house']['map']['address'] = str_replace(' ', '+', trim($house['address']) . " " . trim($house['city']) . ", " . trim($house['state']) . " " . trim($house['zip']));

	$data['house']['main_phone'] = $house['office_phone'];
	$data['house']['movieline'] = $house['movieline'];
	$data['house']['email'] = $house['email'];
	$data['house']['amenities'] = explode(';', $house['amenities']) ;
	$data['house']['tagline'] = $house['tagline'];
	$data['house']['policies'] = $house['policies'];
	$data['house']['photo'] = build_house_photo_url($config->getConfig("site_id"), $house["PhotoUrl"]);
    $data['house']['message']['title'] = fxp_get_page_details( $config->getConfig("site_id"), trim($house["message_page"]))['SiteHeadline'];
    $data['house']['message']['text'] = fxp_get_message($config->getConfig("site_id"), trim($house["message_page"]));

	$data['house']['social_icons']['facebook']['link'] = trim($config->getConfig('facebook'));
	$data['house']['social_icons']['facebook']['img'] = build_DataURI( $template_dir."assets/img/facebook.svg");
	$data['house']['social_icons']['twitter']['link'] = trim($config->getConfig('twitter'));
	$data['house']['social_icons']['twitter']['img'] = build_DataURI( $template_dir."assets/img/twitter.svg");
	$data['house']['social_icons']['instagram']['link'] = trim($config->getConfig('instagram'));
	$data['house']['social_icons']['instagram']['img'] = build_DataURI( $template_dir."assets/img/instagram.svg");
	$data['house']['social_icons']['pintrest']['link'] = trim($config->getConfig('pintrest'));
	$data['house']['social_icons']['pintrest']['img'] = build_DataURI( $template_dir."assets/img/pinterest.svg");
	$data['house']['social_icons']['google_plus']['link'] = trim($config->getConfig('google'));
	$data['house']['social_icons']['google_plus']['img'] = build_DataURI( $template_dir."assets/img/google.svg");
	$data['house']['social_icons']['site_google_plus']['link'] = trim($config->getConfig('google+'));
	$data['house']['social_icons']['site_google_plus']['img'] = build_DataURI( $template_dir."assets/img/google.svg");
	$data['house']['social_icons']['cust_id']['link'] = trim($config->getConfig('cust_id'));
	$data['house']['social_icons']['cust_id']['img'] = build_DataURI( $template_dir."assets/img/email.svg");

    $data['house']['prices'] = $dataprices;

	$data['house']['ticketing'] =  get_ticketing($house);
	$data['house']['message'] = fxp_get_message($config->getConfig("site_id"), $data['house']['house_id']);
     */








}