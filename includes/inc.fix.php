<?php

/**
* Fixes the movie_id by removing the decimal point and 
* any trailing values.
* 
* @param $movie_id
* @return String $movie_id
*/
function fix_movie_id($movie_id) {

//get rid of decimal points in movie ID
if (strpos($movie_id, '.') !== false) {
	$movie_id = substr($movie_id, 0, strpos($movie_id, '.'));
}
return $movie_id;
}

/**
* Fixes movie names by prepending "The", "An", and "A" 
* and removing ", The", ", An", and ", A" respectively.
* 
* @param $name
* @return String $name
*/
function fix_movie_name($name) {

//Move The, An, A to front of movie name
if (strrpos($name, ", The") > 0) {
	return "The " . trim(substr($name, 0, strrpos($name, ", The")));
} else if (strrpos($name, ", An") > 0) {
	return "An " . trim(substr($name, 0, strrpos($name, ", An")));
} else if (strrpos($name, ", A") > 0) {
	return "A " . trim(substr($name, 0, strrpos($name, ", A")));
} else {
	return trim($name);
}
}

/**
* Fixes the runtime for display by formatting it as '# hr. ## min.'
* 
* @param $runtime the 'runtime' field
* @return String $result a formatted runtime
*/
function fix_movie_runtime($runtime) {
$result = "";

if (!empty($runtime)) {
	
	//if 00 for hour, hard code it
	if (substr($runtime, 0, 2) == "00") {
		$hour = 0;
	} else {
		$hour = (int)substr($runtime, 0, 2);
	}
	
	$min = (int)substr($runtime,3,2);
	
	$result = $hour . " hr. " . $min . " min.";
} 
else {
	$result = '';
}

return trim($result);
}