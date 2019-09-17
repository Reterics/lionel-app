<?php
/**
 * Lionel-App: RequestManager for PHP servers
 * Author: Attila Reterics
 * Date: 2019. 09. 17.
 * Time: 16:11
 * License: GPL
 */


$json = file_get_contents('php://input');

if (!empty($json)) {
    $decoded = json_decode($json,true);
    $fileName = "default.file";
    $method = "none";
    switch (json_last_error()) {
        case JSON_ERROR_NONE:
            /*echo "Selected method: " . $decoded['method'] . PHP_EOL;*/
            $method = $decoded['method'];
            if (!empty($decoded['arguments'][0])){
                $fileName = $decoded['arguments'][0];
            }

            /*echo "Selected Argument: " . $decoded['arguments'][0] . PHP_EOL;*/
            break;
        case JSON_ERROR_DEPTH:
            echo ' - Maximum stack depth exceeded';
            die(" - Maximum stack depth exceeded");
            break;
        case JSON_ERROR_STATE_MISMATCH:
            echo ' - Underflow or the modes mismatch';
            die(" - Underflow or the modes mismatch");
            break;
        case JSON_ERROR_CTRL_CHAR:
            echo ' - Unexpected control character found';
            die(' - Unexpected control character found');
            break;
        case JSON_ERROR_SYNTAX:
            echo ' - Syntax error, malformed JSON';
            die(' - Syntax error, malformed JSON');
            break;
        case JSON_ERROR_UTF8:
            echo ' - Malformed UTF-8 characters, possibly incorrectly encoded';
            die(' - Malformed UTF-8 characters, possibly incorrectly encoded');
            break;
        default:
            echo ' - Unknown error';
            die(' - Unknown error');
            break;
    }


    if ($method == "__getPublicJS") {

        function getLib ($name) {
            if(file_exists("js/".$name.".js")) {
                $myfile = fopen("js/".$name.".js", "r") or die("");
                echo PHP_EOL.fread($myfile,filesize("js/".$name.".js"));
                fclose($myfile);
            } elseif (file_exists("".$name.".js")) {
                $myfile = fopen("".$name.".js", "r") or die("");
                echo PHP_EOL.fread($myfile,filesize("/".$name.".js"));
                fclose($myfile);
            } else {
                echo "";
            }
        }
        if(strpos($fileName, ';') !== false) {
            $parts = explode(";",$fileName);
            foreach ($parts as $part) {
                if(!empty($part)) {
                    getLib($part);
                }

            }
        } else {
            getLib($fileName);
        }
    } elseif ($method == "__getRenderedTemplate") {
        echo '{"error":" __getRenderedTemplate is only supported in the Lionel-App Javascript version", "result":"__getRenderedTemplate is only supported in the Lionel-App Javascript version"}';
    } elseif ($method === "none") {
        echo "Invalid POST/GET call";
    } else{
        echo '{"error":" LionelClient.call() methods is only supported in the Lionel-App Javascript version", "result":"LionelClient.call() methods is only supported in the Lionel-App Javascript version"}';
    }
}
