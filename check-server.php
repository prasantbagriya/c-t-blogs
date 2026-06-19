<?php
$output = shell_exec('cd ../nodejs && ls -la node_modules/node-domexception');
echo "<pre>$output</pre>";

$output2 = shell_exec('cd ../nodejs && node -v && npm -v');
echo "<pre>Node version:\n$output2</pre>";
?>
