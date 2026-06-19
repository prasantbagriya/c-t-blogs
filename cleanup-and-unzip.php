<?php
// 1. Clean up mistakenly deployed folders from public_html
function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
                    rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                else
                    unlink($dir. DIRECTORY_SEPARATOR .$object);
            }
        }
        rmdir($dir);
    }
}

$dirsToDelete = ['server', 'blog', 'PB-Creative-Studio', 'dist', 'Playbook', 'milkmaster', 'investmant', 'course'];
foreach ($dirsToDelete as $dir) {
    if (file_exists($dir)) {
        rrmdir($dir);
        echo "Deleted public_html/$dir\n";
    }
}

$filesToDelete = ['app.js', 'server.cjs', 'blog-state.js', 'package.json', 'package-lock.json', '.env'];
foreach ($filesToDelete as $file) {
    if (file_exists($file)) {
        unlink($file);
        echo "Deleted public_html/$file\n";
    }
}

// 2. Extract new deployment in nodejs folder
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
