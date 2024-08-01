<?php
/**
 * Database Connections
 * 
 * This file contains functionality for connecting and disconnecting
 * to the Cinema database with readonly or administrative privlages.
 * 
 * @package wwm_lib_php
 * @version 0.1
 * @author Rob Fonseca <rob@westworldmedia.com>
 * @copyright West World Media ©2013
 */
/*********************
Database Connections
Written by Rob Fonseca
West World Media ©2013
**********************/

//databse credentials
$db_location = "CinemaDB";
$db_username = 'readonly';
$db_username_admin = 'sa';
$db_password = 'readonly';
$db_password_admin = 'concur';
$db_name = 'Cinema';

/* Connect to databse using admin credentials */
function ConnDB() {

	//Get global variables for admin access
	global $db_location;
	global $db_username_admin;
	global $db_password_admin;
	global $db_name;
	
	//Connect
	try {
		global $db;
		$db = new PDO("sqlsrv:Server=$db_location;Database=$db_name", $db_username_admin, $db_password_admin);
	} catch(PDOException $e) {
		//Connection error
		die("Error Connecting to Database.");
	}
}

/* Connect to databse using read only credentials */
function DiscDB() {
	
	//Get the read only database object
	global $db;
	
	//Disconnect
	$db = null;
}
?>