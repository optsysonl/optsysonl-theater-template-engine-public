<?php
//$CACHE_CSS_main = $cache->getItem($config->getConfig('site_id').'_css_main');

//if (!$CACHE_CSS_main->isHit()) {

	


//	$CACHE_CSS_main->expiresAfter($cache_time['7days']);
//	$CACHE_CSS_main->set($data['css']);
//	$cache->save($CACHE_CSS_main);
	
//}else{
//	$data['css'] = $CACHE_CSS_main->get();
//}


//$file = 'css/main.css';


class CSSMain
{
	private $file = '';
	private $dir = 'css/';
	
	
  // Class properties and methods go here
	public function __construct($file)
	{
		$this->file = $file.'.css';
	}	
	
	public function process(){
		global $twig, $config;
		
		$data['css'] = $this->get_data();
		$template = $twig->load($this->get_tpl());
		header("Content-type: text/css");
		echo $template->render(
			array(
				'config' => $config->getConfig(),
				'data' => $data,
			)
		);
	}
	
	public function get_data(){
		global $cache, $config;
		$CACHE_CSS_main = $cache->getItem($config->getConfig('site_id').'_css_main');
		if (!$CACHE_CSS_main->isHit()) {
			
			$data['css'] = $this->setup_variables();
			$CACHE_CSS_main->expiresAfter($cache_time['7days']);
			$CACHE_CSS_main->set($data['css']);
			$cache->save($CACHE_CSS_main);
		}else{
			$data['css'] = $CACHE_CSS_main->get();
		}
		
		return $data['css'];
	}
	public function get_tpl(){
		return $this->dir . $this->file;
	}
	
	
	private function setup_variables(){
		global $config;
		//set up some variables
		$data['background_color_1'] = $config->getConfig('bkg_color');
		$data['background_color_1_rgb'] = $this->hex2rgb($data['background_color_1']);
		$data['background_color_2'] = $config->getConfig('bkg_color2');
		$data['background_color_2_rgb'] = $this->hex2rgb($data['background_color_2']);
		$data['text_color'] = $config->getConfig('text_color');
		$data['text_color_rgb'] = $this->hex2rgb($data['text_color']);
		$data['text_color2'] = $config->getConfig('text_color2');
		$data['text_color_rgb_2'] = $this->hex2rgb($data['text_color2']);
		$data['link_color'] = $config->getConfig('text_color2');
		$data['link_color_rgb'] = $this->hex2rgb($data['link_color']);
		$data['font'] = $config->getConfig('font');
		$data['logo_image'] = $config->getConfig('header_img');
		$data['header_image'] = ($config->getConfig('site_header_img') != '') ? "background-image: url('" . build_image_url($config->getConfig('site_id'), $config->getConfig('site_header_img')) ."');" : "";
		$data['background_image'] = ($config->getConfig('background_img') != '') ? "background-image: url('" . build_image_url($config->getConfig('site_id'), $config->getConfig('background_img')) ."');" : "";
		$data['background_repeat'] = ($config->getConfig('background_repeat') == '1') ? "background-repeat: no-repeat;background-position: 50% 0%;background-attachment: fixed;" : "";
		$data['box_sizing'] = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-ms-box-sizing:border-box;box-sizing:border-box;";
		
		return $data;
	}
	
	
	/**
	 * Construct a RGB color from a hex color
	 */
	private function hex2rgb($hex) {
	   $hex = str_replace("#", "", $hex);
	
	   if(strlen($hex) == 3) {
		 $r = hexdec(substr($hex,0,1).substr($hex,0,1));
		 $g = hexdec(substr($hex,1,1).substr($hex,1,1));
		 $b = hexdec(substr($hex,2,1).substr($hex,2,1));
	   } else {
		 $r = hexdec(substr($hex,0,2));
		 $g = hexdec(substr($hex,2,2));
		 $b = hexdec(substr($hex,4,2));
	   }
	   $rgb = "$r, $g, $b";
	   
	   return $rgb; // returns an array with the rgb values
	}
}

