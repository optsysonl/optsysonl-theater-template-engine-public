<?php


function balanceAjax($data)
{
	$rts_id = 43620;
	$card_num = $data->get('giftcard_number');
	$card = rts_get_card($rts_id, $card_num);
    $balance =  rts_get_balance($card);
    if ($balance == "") {
        echo json_encode(['data' => '', 'status' => 'error']);
    }else{
        echo json_encode(['data' => $balance, 'status' => 'success']);
    }
}

/**
 * Get the gift card balance from the $doc returned
 * from function rts_get_card.
 *
 * @param $doc - DOMDocument returned from function 'rts_get_card'
 * @return current balance or false if unable to retrieve
 */
function rts_get_balance($doc) {
	$arr = rts_extract_field($doc, 'DebitRemain');
	if (!empty($arr)) {
		return $arr[0];
	}
	return false;
}

/**
 * Get an array of nodeValue(s) from element(s) in a DOMDocument
 * matching the specified tag name. This is an easy way to
 * extract any text from the XML.
 *
 * @param $doc
 * @param $tag
 * @return Array
 */
function rts_extract_field($doc, $tag) {
	$nodeValues = array();
	if ($doc !== false) {
		$nodeList = $doc->getElementsByTagName($tag);
		for ($i = 0; $i < $nodeList->length; $i++) {
			$nodeValues[] = $nodeList->item($i)->nodeValue;
		}
	}
	return $nodeValues;
}

/**
 * Get the all of the information about the card from
 * RTS. Used for checking balance, if its registered,
 * rewards, etc. Use other functions with the DOMdocument
 * returned from this function to extract data.
 *
 * @param $rts_id
 * @param $card_number - gift card/loyalty card number
 * @return DOMDocument
 */
function rts_get_card($rts_id, $card_number) {
	$xml = "
		<Request>
		<Version>1</Version>
		<Command>GiftInformation</Command>
		<Data>
		<Packet>
		<GiftCards>
			<GiftCard>$card_number</GiftCard>
		</GiftCards>
		</Packet>
		</Data>
		</Request>
	";
	return rts_request($rts_id, $xml);
}

/**
 * Sends an XML packet and returns the response XML as a DOMDocument.
 *
 * @param $rts_id
 * @param $xml
 * @return DOMDocument $doc on success
 * @return Boolean false on failure
 */
function rts_request($rts_id, $xml) {

    // Build the variable for the connection string - RTS test server
    $host = "tls://$rts_id.formovietickets.com";
    $port = "2235";
    $file = "Data.asp";

    /*******************************************
     *****                  	    *****
     ***	 RTS LOGIN CREDENTIALS   ***
     *                             *
     *******************************************/

    $username = "webedia";
    $password = "eJ5lROXip%%&";

    /*******************************************
     *                             *
     ***	 RTS LOGIN CREDENTIALS   ***
     *****                         *****
     *******************************************/

    // Initial headers
    $headers = array (
        'Content-Length: ' . strlen($xml),
        'Host: tls://' . $rts_id . '.formovietickets.com:2235',
        'Expect: 100-continue',
        'Content-Type: text/xml'
    );

    // Perform initial call to RTS API
    $curl = curl_init('https://' . $rts_id . '.formovietickets.com:' . $port . '/Data.asp');
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($curl, CURLOPT_VERBOSE, 1);
    curl_setopt($curl, CURLOPT_HEADER, 1);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($curl);
    $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
    curl_close($curl);

    // Pull headers off 401 response
    $header = substr($response, 0, $header_size);

    // Split headers into array
    $header_arr = explode("\r", $header);
    $auth = '';

    // Find WWW-Authenticate header
    foreach ($header_arr as $ha) {
        if (stripos($ha, 'www-auth') !== false) {
            $auth = $ha;
        }
    }
    $auth = str_ireplace('WWW-Authenticate: ', '', $auth);

    // Split WWW-Authenticate value into array
    $auth_exploded = explode(',', $auth);
    $auth_array = array();
    // Parse array down further
    foreach ($auth_exploded as $ae) {
        $split = explode('=', $ae);
        $split[1] = str_replace('"', '', $split[1]);
        $auth_array[trim($split[0])] = trim($split[1]);
    }

    // Pull some auth values
    $nonce = $auth_array['nonce'];
    $opaque = $auth_array['opaque'];
    $drealm = $auth_array['Digest realm'];
    $cnonce = "sausages";

    // calculate the hashes of A1 and A2 as described in RFC 2617
    $a1 = "$username:$drealm:$password";
    $a2 = "POST:/$file";
    $ha1 = md5($a1);
    $ha2 = md5($a2);
    $concat = $ha1 . ':' . $nonce . ':00000001:' . $cnonce . ':auth:' . $ha2;
    $response = md5($concat);

    // New Authorization header
    $headers[] = 'Authorization: Digest username="' . $username .'", realm="' . $drealm . '", nonce="' . $nonce . '", uri="/' . $file . '", algorithm="MD5", qop=auth, nc=00000001, cnonce="' . $cnonce . '", response="' . $response . '", opaque="' . $opaque . '"';

    // Perform authorized API call
    $curl = curl_init('https://' . $rts_id . '.formovietickets.com:' . $port . '/Data.asp');
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($curl, CURLOPT_VERBOSE, 1);
    curl_setopt($curl, CURLOPT_HEADER, 1);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    $results = curl_exec($curl);
    curl_close($curl);

    // Find positions for XML response
    $start = strpos($results, "<Response>");
    $end = strrpos($results, "</Response>");

    // XML
    $doc = new DOMDocument();
    $doc->loadXML(substr($results, $start, $end));

    return $doc;
}
