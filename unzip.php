<?php
$zipFile = "chatwiz_upload_lite.zip";
$extractPath = "./";

if (!file_exists($zipFile)) {
    die("Error: ZIP file not found.");
}

$zip = new ZipArchive;
$res = $zip->open($zipFile);
if ($res === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();
    echo "Success: ZIP extracted successfully.";
    // Optional: Delete the zip and this script after extraction to clean up
    unlink($zipFile);
    unlink(__FILE__);
} else {
    echo "Error: Failed to extract ZIP file. Code: " . $res;
}
?>
