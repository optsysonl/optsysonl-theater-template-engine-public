<?php
/**
 * Created by PhpStorm.
 * User: ooleshko
 * Date: 8/14/2017
 * Time: 10:43 AM
 */


$pck_file = $template_dir ."assets/package/". $mapping['filename'];



if (file_exists($pck_file)) {

    header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
    header("Cache-Control: public"); // needed for internet explorer
    //header("Content-Type: application/zip");
    header("Content-Type: ". my_mime_type( $pck_file ));
    header("Content-Transfer-Encoding: Binary");
    header("Content-Length:".filesize($pck_file));
    //header("Content-Disposition: attachment; filename=file.zip");
    readfile($pck_file);
    die();
} else {
    die("Error: File not found.");
}



