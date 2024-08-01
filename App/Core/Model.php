<?php

namespace App\Core;

use App\Core\Database;

abstract class Model
{
	protected $_statement;

    /**
     * Get all cols and rows
     *
     * @param int $mode
     *
     * @return array
     */
    public function fetchAll($mode = \PDO::FETCH_ASSOC)
    {
        return $this->_statement ? $this->_statement->fetchAll($mode) : [];
    }
    
    /**
     * Get row
     *
     * @param int $mode
     *
     * @return array
     */
    public function fetch($mode = \PDO::FETCH_ASSOC)
    {
        return $this->_statement ? $this->_statement->fetch($mode) : [];
    }
    
    /**
     * Get first column
     *
     * @return array
     */
    public function fetchColumn()
    {
        return $this->_statement ? $this->_statement->fetchAll(\PDO::FETCH_COLUMN) : [];
    }
    
    /**
     * Get value
     *
     * @return null|integer|string
     */
    public function fetchValue()
    {
        return $this->_statement ? $this->_statement->fetchColumn() : null;
    }
    
    /**
     * Get all data in array or object
     *
     * @param bool $object
     * @param bool $unique
     * @param bool $group
     *
     * @return array
     */
    public function all($object = false, $unique = false, $group = false)
    {
        if ($object) {
            $fetchArg = \PDO::FETCH_CLASS;
        } else {
            $fetchArg = \PDO::FETCH_ASSOC;
        }
        
        if ($group) {
            $fetchArg = $fetchArg|\PDO::FETCH_GROUP;
        }
        
        if ($unique) {
            $fetchArg = $fetchArg|\PDO::FETCH_UNIQUE;
        }
        
        return $this->fetchAll($fetchArg);
    }
    
    /**
     * Get value.
     *
     * @return int|null|string
     */
    public function value()
    {
        return $this->fetchValue();
    }

	protected function run($sql, $params = [])
	{
		if(!app()->getConnection()) {
			new Database();
		}

		$this->_statement = app()->getConnection()->prepare($sql);
		$result = $this->_statement->execute($params);

		return $result;
	}
}