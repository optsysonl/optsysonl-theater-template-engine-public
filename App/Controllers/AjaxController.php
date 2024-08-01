<?php

namespace App\Controllers;

use App\Core\Controller;
use Symfony\Component\HttpFoundation\Request;

class AjaxController extends Controller
{
	const AJAX_FILE = "ajax_functions.php";

	public function __construct()
	{
		$template     = config('fxp.template_name');
		$ajax_functions = view_path($template) . DS . 'app_local' . DS . self::AJAX_FILE;
		if (file_exists($ajax_functions)) {
			require_once $ajax_functions;
		}
	}

    public function loader($class)
    {
        $data = [
            'class' => $class,
        ];
        
        echo view('ajax/loader', ['data' => $data]);
    }
    
    public function trailer($file)
    {
        $data['trailer'] = $file;
        
        echo view('ajax/trailer', ['data' => $data]);
    }

	public function data($function)
	{
		$request = Request::createFromGlobals();


        if ($request->isMethod('post')) {
            $data = $request->request;
        }elseif ($request->isMethod('get')){
            $data = $request->query;
        }

		if (function_exists($function . 'Ajax')) {
			call_user_func($function . 'Ajax', $data);
			die;
		}
	}
}