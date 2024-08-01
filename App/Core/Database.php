<?php

namespace App\Core;

class Database
{

	protected $debug = false;

	/**
	 * Database constructor.
	 */
	public function __construct()
	{
		$this->debug = config('developer.init.debug');
		//echo "Construct <br />";
		app()->setConnection($this->connect());
    }

	/**
	 * @return \PDO
	 */
	private function connect()
    {
        try {
            $host     = config('database.host');
            $database = config('database.name');
            $username = config('database.username');
            $password = config('database.password');

            $connection = new \PDO("sqlsrv:Server=$host;Database=$database", $username, $password);
            if ($this->debug) {
                $connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            }
            return $connection;
        } catch (\PDOException $e) {
            if ($this->debug) {
                die('Code: ' . $e->getCode() . ' | Message: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            } else {
                die('Error Connecting to Database.');
            }
        }
    }

	function __destruct() {
		//echo "Destruct <br />";
	}
}