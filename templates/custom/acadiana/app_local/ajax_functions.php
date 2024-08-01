<?php


function contactsAjax($data)
{

    $ajax = $data->get('message');

    $to = config('fxp.contact_email');

    $message = "";
    $g_response = "";

    foreach ($ajax as $key => $item) {
        if ($item['name'] == 'g-recaptcha-response') {
            $g_response = $item['value'];
        } else {
            $message .= '<p><strong>' . $item['name'] . ': </strong>' . $item['value'] . '</p>';
        }
    }

    $g_data = [
        'secret'   => '6LfU8k4UAAAAAFnSU1FDtD669vBZjKZN1rbmIi-9',
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
        $subject = config('fxp.title') . " Contact Form";

        $headers = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
        $headers .= 'From: ' . 'noreplay@movie-previews.com' . "\r\n";
        $send_res = @mail($to, $subject, $message, $headers);
    }

    if (!$send_res) {
        echo json_encode(['data' => 'Error Send', 'status' => 'error']);
    } else {
        echo json_encode(['data' => 'Thank you for contacting us, we will reply as soon as we can.', 'status' => 'success']);
    }

}