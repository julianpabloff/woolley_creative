<?php

# SendGrid setup

require_once('../sendgrid/sendgrid-php.php');
$email = new \SendGrid\Mail\Mail();
$sendgrid = new \SendGrid(); # <-- API key goes here

# Get POST data & Decode the JSON into an object

$in = file_get_contents('php://input');
$json = json_decode($in);

# Configure SendGrid with POST data

$email->setFrom('hello@woolleycreative.com');
$email->addTo('thom@woolleycreative.com');
$email->setSubject($json->subject);
$email->addContent('text/html', $json->content);

# Send the email

try {
        $response = $sendgrid->send($email);
        print('success');
} catch (Exception $e) {
        echo 'Caught exception: '. $e->getMessage() . '\n';
        print('fail');
}
