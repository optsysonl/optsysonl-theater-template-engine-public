<?php

class Config {
	private $site_url ='';
	public $config ='';
	
	
	public function __construct() {
		$this->setSiteURL();
		$conf_file = "http://filmsxpress.com/config/".$this->site_url. ".txt";
		
		//fetch the config
		$config = @file_get_contents($conf_file) ;
		//config empty? kill the page
		if ($config == "") {
			die("Website has not been configured properly.");
		} else {
			$config = json_decode($config, TRUE);
		}
		
		if( ($config['site_country'] == '') || is_null($config['site_country']) ){
			$config['site_country'] = "USA";
		}
		
		$config["analytics"] = trim($config["analytics"]);
		
		//ADD DATABASE CONNECTION configs
		//databse credentials
		$config["db_location"] = "CinemaDB";
		$config["db_username"] = 'readonly';
		$config["db_username_admin"] = 'sa';
		$config["db_password"] = 'readonly';
		$config["db_password_admin"] = 'concur';
		$config["db_name"] = 'Cinema';
		
		
		$this->config = $config;
	}
	
	function getConfig($var = null){
		if($var){
			return array_key_exists($var, $this->config) ? $this->config[$var] : null;
		}else{
			return $this->config;
		}	
	}
		
	function getSiteURL (){
		return $this->site_url;
	}
	
	function setSiteURL (){
		//get the requested URL and strip www.
		$this->site_url = str_ireplace("www.","",trim($_SERVER['SERVER_NAME']));
	}	
	
}