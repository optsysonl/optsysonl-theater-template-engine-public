<?php

function newsletterAjax($data)
{
	$site_id = config('fxp.site_id');
	$dir = $_SERVER['DOCUMENT_ROOT'] . DS ."customer_data" . DS . $site_id;
	$file_name = $dir. DS . "subscribers.csv";

	if (!file_exists($dir)) {
		if (!mkdir($dir)) {
			echo json_encode(['status' => 'error']);
			die;
		}
	}
	$file = fopen($file_name,"a");
	if (!$file) {
		echo json_encode(['status' => 'error']);
		die;
	}
	fputcsv($file, array_values($data->all()));
	fclose($file);

	echo json_encode(['status' => 'success']);

}