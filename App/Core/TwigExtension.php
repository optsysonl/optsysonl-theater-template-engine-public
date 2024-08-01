<?php

namespace App\Core;

use App\Core\Support\Str;
use App\Helpers\BuildHelper;

class TwigExtension extends \Twig_Extension
{
    const FILTERS_FILE = "twig_filters.php";
    const FUNCTIONS_FILE = "twig_functions.php";

    protected $custom_filters = [];
    protected $custom_functions = [];

    /**
     * AppTwigExtension constructor.
     */
    public function __construct()
    {
        $template     = config('fxp.template_name');
        $tmpl_filter = view_path($template) . DS . 'app_local' . DS . self::FILTERS_FILE;
        if (file_exists($tmpl_filter)) {
            require_once $tmpl_filter;
            $this->custom_filters = BuildHelper::tokenizer($tmpl_filter);
        }

        $tmpl_function = view_path($template) . DS . 'app_local' . DS . self::FUNCTIONS_FILE;
        if (file_exists($tmpl_function)) {
            require_once $tmpl_function;
            $this->custom_functions = BuildHelper::tokenizer($tmpl_function);
        }
    }

    /**
     * @return array|\Twig_Filter[]
     */
    public function getFilters()
    {
        $filters = [];
        foreach ($this->custom_filters as $filter) {
            if (Str::endsWith($filter, 'Filter')) {
                $filters[] = new \Twig_Filter(str_replace('Filter', '', $filter), $filter);
            }
        }

        return $filters;
    }

    /**
     * @return array|\Twig_Filter[]
     */
    public function getFunctions()
    {
        $functions = [];
        foreach ($this->custom_functions as $function) {
            if (Str::endsWith($function, 'Function')) {
                $functions[] = new \Twig_Function(str_replace('Function', '', $function), $function);
            }
        }

        return $functions;
    }
}
