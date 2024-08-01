<?php


function infoAjax($data)
{

	$ajax = $data->get('message');

	$to = config('fxp.contact_email');

	$message = "";
	$g_response = $subject = $recipients = "";

	foreach ($ajax as $key => $item) {
		switch ($item['name']) {
			case $item['name'] == 'g-recaptcha-response':
				$g_response = $item['value'];
				break;
			case $item['name'] == '_subject':
				$subject = $item['value'];
				break;
			case $item['name'] == 'MAX_FILE_SIZE':
				break;
			case $item['name'] == '_recipients':
				$recipients = $item['value'];
				break;
			default :
				$message .= '<p><strong>' . $item['name'] . ': </strong>' . $item['value'] . '</p>';
		}
	}

	$g_data = [
		'secret'   => '6LcCWW0UAAAAAPu0D1BgwkDHFZXT3YEebabrGW0v',
		'response' => $g_response,
	];

	$verify = curl_init();
	curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
	curl_setopt($verify, CURLOPT_POST, true);
	curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($g_data));
	curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
	$response = json_decode(curl_exec($verify), true);

	$send_res = false;

	if ($response['success'] === true) {
		$subject = $subject != "" ? $subject : config('fxp.title') . " Contact Form";
		$to = $recipients != "" ? $to . "," . $recipients : $to;
		$headers = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
		$headers .= 'From: ' . 'noreply@movie-previews.com' . "\r\n";
		$send_res = @mail($to, $subject, $message, $headers);
	}else{
        echo json_encode(['data' => 'Error Captcha', 'status' => 'error']);
        die;
    }

	if (!$send_res) {
		echo json_encode(['data' => 'Error Send', 'status' => 'error']);
	} else {
		echo json_encode(['data' => 'Thank you for contacting us, we will reply as soon as we can.', 'status' => 'success']);
	}

}

function infoemAjax($data)
{
	$eol = "\r\n";
	$separator = md5(time());
	$ajax = $data->all();

	$resume = "";
	if($_FILES['resume'] && $_FILES['resume']['name'] != "") {
		$file_name = $_FILES['resume']['name'];
		$file_tmp = $_FILES['resume']['tmp_name'];

		$content = file_get_contents($file_tmp);
		$content = chunk_split(base64_encode($content));

		$resume .= "--" . $separator . $eol;
		$resume .= "Content-Type: application/octet-stream; name=\"" . $file_name . "\"" . $eol;
		$resume .= "Content-Transfer-Encoding: base64" . $eol;
		$resume .= "Content-Disposition: attachment" . $eol;
		$resume .= "filename=" . "\"" . $file_name . "\"" . $eol . $eol;
		$resume .= $content . $separator . $eol;
	}

	$g_response = "";

	$message = "This is a multi-part message in MIME format." . $eol;
	$message .= $eol . "--" . $separator . $eol;
	$message .= "Content-Type: text/html; charset=utf-8; format=flowed" . $eol;
	$message .= "Content-Transfer-Encoding: 7bit" . $eol. $eol;

	$house_email = '';

	foreach ($ajax as $item => $value) {
		if ($item == 'g-recaptcha-response') {
			$g_response = $value;
		} elseif ($item == 'empl_recipients') {
			$house_email = $value;
		} else {
			$message .= '<p><strong>' . $item . ': </strong>' . $value . '</p>';
		}
	}
	$message .= $eol . $eol;

	$g_data = [
		'secret'   => '6LcCWW0UAAAAAPu0D1BgwkDHFZXT3YEebabrGW0v',
		'response' => $g_response,
	];

	$verify = curl_init();
	curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
	curl_setopt($verify, CURLOPT_POST, true);
	curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($g_data));
	curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
	$response = json_decode(curl_exec($verify), true);

	$send_res = false;

	if ($response['success'] === true) {
		$subject = config('fxp.title') . " Employment Form";
		$to = $house_email != '' ? $house_email .', employment@marqueecinemas.com' : "employment@marqueecinemas.com" ;
		$headers = 'MIME-Version: 1.0' . $eol;
		$headers .= "Content-Type: multipart/mixed; boundary=\"" . $separator . "\"" . $eol;
		$headers .= 'From: ' . 'noreply@movie-previews.com' . $eol;
		$send_res = @mail($to, $subject, $message . $resume, $headers);
	}else{
        echo json_encode(['data' => 'Error Captcha', 'status' => 'error']);
        die;
    }

	if (!$send_res) {
		echo json_encode(['data' => 'Error Send', 'status' => 'error']);
	} else {
		echo json_encode(['data' => 'Thank you for contacting us, we will reply as soon as we can.', 'status' => 'success']);
	}

}