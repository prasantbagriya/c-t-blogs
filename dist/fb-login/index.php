<?php
/**
 * ChatWizs OAuth Callback Proxy (Subdirectory Version)
 * Bypasses Hostinger WAF 403 Forbidden on long 'code' query strings
 */

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';

if ($code) {
    // Set short cookie for 5 minutes
    setcookie('_oc', $code, time() + 300, "/", "", true, false);
    setcookie('_os', $state, time() + 300, "/", "", true, false);
}

// Redirect back to dashboard (parameter-free URL)
header("Location: /dashboard");
exit;
