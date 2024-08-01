<?php

$action = (isset($mapping['action']) ? $mapping['action'] : null);
$function_call = 'api_cache_' . $action;

if (function_exists($function_call)) {
    echo 'Start ' . $function_call;
    echo '<br />----------------------------<br /><br />';
    
    call_user_func($function_call);
    
    echo '<br /><br />----------------------------<br />';
    echo 'End ' . $function_call;
} else {
    die('API function "' . $function_call . '" not found.');
}

function api_cache_clear()
{
    global $config, $cache, $cache_tpl_dir;
    
    $cache_tpl_template_dir = $cache_tpl_dir . '/' . $config->getConfig('template');
    
    // Cache VAR clear
    $cache->clear();
    
    // Cache TPL clear (Clears the internal template cache. clearCacheFiles() deprecated)
    foreach (
        new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(
                $cache_tpl_template_dir),
            RecursiveIteratorIterator::LEAVES_ONLY
        ) as $file
    ) {
        if ($file->isFile()) {
            @unlink($file->getPathname());
        }
    }
    
    echo '>> Cache was cleared!';
}