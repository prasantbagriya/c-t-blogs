<?php
$zipFile = '../nodejs/chatwiz_upload_lite.zip';
$extractPath = '../nodejs/';

if (!file_exists($zipFile)) {
    die("Zip file not found at $zipFile");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();
    echo "Successfully extracted to $extractPath\n";
    
    // Now trigger nodejs restart!
    $restartFile = '../nodejs/tmp/restart.txt';
    if (!file_exists('../nodejs/tmp')) {
        mkdir('../nodejs/tmp', 0755, true);
    }
    file_put_contents($restartFile, time());
    echo "Restart requested!\n";
} else {
    echo "Failed to open the zip file\n";
}
?>
