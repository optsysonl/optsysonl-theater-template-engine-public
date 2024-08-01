<?php

// match current request url
$match = $router->match();

// call closure or throw 404 status
if ($match && is_callable($match['target'])) {
    $mapping = call_user_func_array($match['target'], $match['params']);
    
    switch ($mapping['type']) {
        case 'page':
            require_once $pages_dir . $mapping['filename'] . '.php';
            require_once $includes_dir . '/process.php';
            break;
        case 'css':
            //require_once $template_dir ."assets/css/". $mapping['filename'] .'.php';
            
            $loader = new Twig_Loader_Filesystem($views_dir);
            $twig   = new Twig_Environment($loader, [
                'cache'       => $cache_tpl_dir . '/' . $config->getConfig('template'),
                'debug'       => $config->getConfig('debug') ? true : false,
                'auto_reload' => $config->getConfig('debug') ? true : false,
            ]);
            $twig->addExtension(new Twig_Extension_Debug());
            
            require_once $template_dir . 'assets/css/main.php';
            $css = new CSSMain($mapping['filename']);
            
            $data['css'] = $css->get_data();
            $file        = $css->get_tpl();
            $css->process();
            //require_once $includes_dir.'/process.php';
            break;
        case 'js':
            require_once $template_dir . "assets/js/" . $mapping['filename'];
            break;
        case 'img':
            require_once $includes_dir . '/image.php';
            //require_once $template_dir ."assets/img/". $mapping['filename'];
            break;
        case 'package':
            //require_once $template_dir ."assets/package/". $mapping['filename'];
            require_once $includes_dir . '/package.php';
            break;
        case 'ajax':
            require_once $pages_dir . "ajax/" . $mapping['filename'] . '.php';
            require_once $includes_dir . '/process.php';
            break;
        case 'api':
            $confApiKey  = $config->getConfig('api_key');
            $paramApiKey = (isset($mapping['api_key']) ? $mapping['api_key'] : null);
            if ($confApiKey) {
                if ($confApiKey != $paramApiKey) {
                    die('Access to API is forbidden.');
                }
            } else {
                die('Config api_key not found. API cannot be used.');
            }
            require_once $pages_dir . 'api/' . $mapping['filename'] . '.php';
            break;
        default:
            // no route was matched
            require_once $pages_dir . '404.php';
            require_once $includes_dir . '/process.php';
    }
} else {
    // no route was matched
    header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
    require_once $pages_dir . '404.php';
    require_once $includes_dir . '/process.php';
}