<?php

# SendGrid setup

require_once('../sendgrid/sendgrid-php.php');
# $email = new \SendGrid(getenv('SENDGRID_API_KEY');
 $email = new \SendGrid(getenv('SENDGRID_API_KEY'));

# Get POST data & Decode the JSON into an object

$in = file_get_contents('php://input');
$json = json_decode($in);

# Configure SendGrid with POST data

# $email->setFrom($json->from);
# $email->setSubject($json->subject);
# $email->addTo($json->to);
# $email->addContent('text/html', $json->content);

print print_r(getenv('SENDGRID_API_KEY'));

# Dump parts of the object

print '<div>from=' . $json->from . '</div>';
print '<div>subject=' . $json->subject . '</div>';

# Print the raw data

print '<h1>Raw data</h1>';
print nl2br(print_r($json, true));
