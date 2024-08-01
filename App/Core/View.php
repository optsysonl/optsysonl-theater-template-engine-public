<?php

namespace App\Core;

class View
{
    /**
     * The twig static object.
     * @var null|\Twig_Environment
     */
    private static $twig = null;
    
    /**
     * The name of the view.
     * @var string
     */
    protected $view;
    
    /**
     * The array of view data.
     * @var array
     */
    protected $data;
    
    /**
     * Create a new view instance.
     *
     * @param  string  $view
     * @param  array   $data
     * @return void
     */
    public function __construct($view, $data = [])
    {
        $this->view = $view;
        $this->data = $data;
    }
    
    /**
     * Render a view template using Twig
     *
     * @return string
     * @throws \Twig_Error_Loader
     * @throws \Twig_Error_Runtime
     * @throws \Twig_Error_Syntax
     */
    public function render()
    {
        $template = config('fxp.template_name', 'mm4');
        $debug    = config('fxp.debug', false);
        $view_dir = view_path($template) . DS . 'views';
        $view     = $this->view;
        
        if (self::$twig === null) {
            $loader = new \Twig_Loader_Filesystem($view_dir);
            self::$twig = new \Twig_Environment($loader, [
                'cache'            => Cache::getTemplateDir(),
                'debug'            => $debug,
                'auto_reload'      => $debug,
                'strict_variables' => $debug,
            ]);
            self::$twig->addExtension(new TwigExtension());
            if($debug){
                self::$twig->addExtension(new \Twig_Extension_Debug());
            }

            if(isset($this->data['data']['css'])) {
                $lexer = new \Twig_Lexer(self::$twig, [
                    'tag_comment' => ['{##', '##}'],
                ]);
                self::$twig->setLexer($lexer);
            }
        }
        
        if (!file_exists($view_dir . DS . $view)) {
            $view .= '.twig';
        }
        
        return self::$twig->render($view, $this->data);
    }
}