<?php

$loader = new Twig_Loader_Filesystem($views_dir);
$twig = new Twig_Environment($loader, array(
    'cache' => $cache_tpl_dir.'/'.$config->getConfig('template'),
    'debug' => $config->getConfig('debug') ? true : false,
    'auto_reload' => $config->getConfig('debug') ? true : false,
));
$twig->addExtension(new Twig_Extension_Debug());
$template = $twig->load($file);

echo $template->render(
    array(
        'config' => $config->getConfig(),
        'meta' => $meta,
        'class' => $class,
        'header' => $header,
        'data' => $data,
        'footer' => $footer
    )
);