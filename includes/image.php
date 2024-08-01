<?php

$image = $template_dir ."assets/img/". $mapping['filename'];
if (file_exists($image)) {

    //Set the content-type header as appropriate
    $file_type =  my_mime_type($image);
    header("Content-Type: ". $file_type );

    // Set the content-length header
    header('Content-Length: ' . filesize($image));

    // Write the image bytes to the client
    readfile($image);

}