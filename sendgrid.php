<?php

require_once('../sendgrid/sendgrid-php.php');

$email = new \SendGrid\Mail\Mail();

# Test - replace with Sendgrid code

$in = file_get_contents('php://input'); # Get POST data
$json = json_decode($in); # Decode JSON into an object

# Dump parts of the object

print '<div>from=' . $json->from . '</div>';
print '<div>subject=' . $json->subject . '</div>';

# Print the raw data

print '<h1>Raw data</h1>';
print nl2br(print_r($json, true));
