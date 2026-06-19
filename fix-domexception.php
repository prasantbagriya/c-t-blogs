<?php
$dir = '../nodejs/node_modules/node-domexception';
if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
}

// Write package.json
$pkg = '{
  "name": "node-domexception",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module"
}';
file_put_contents("$dir/package.json", $pkg);

// Write index.js
$js = '
export default class DOMException extends Error {
    constructor(message, name) {
        super(message);
        this.name = name || "DOMException";
    }
}
';
file_put_contents("$dir/index.js", $js);

echo "Fixed node-domexception directly in node_modules! Restarting nodejs...\n";

// Trigger nodejs restart
$restartFile = '../nodejs/tmp/restart.txt';
if (!file_exists('../nodejs/tmp')) {
    mkdir('../nodejs/tmp', 0755, true);
}
file_put_contents($restartFile, time());
echo "Restart requested.\n";
?>
