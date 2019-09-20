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
    } elseif ($method === "mysql") {
        $conn = false;
        try{
            $conn = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);
            if (mysqli_connect_errno())
            {
              echo "Failed to connect to MySQL: " . mysqli_connect_error();
            } else {
                if ($decoded['arguments'][0] == "type") {
                    echo "mysql";
                    mysqli_close($conn);
                    return;
                } elseif ($decoded['arguments'][0] === "query") {
                    $result = mysqli_query($conn, $decoded['arguments'][1]);
                } elseif ($decoded['arguments'][0] === "list") {
                    $result = mysqli_query($conn, 'show tables');
                } elseif ($decoded['arguments'][0] === "deleteTable") {
                    $result = mysqli_query($conn, 'DROP TABLE ' . $decoded['arguments'][1]);
                } elseif ($decoded['arguments'][0] === "listAllIn") {
                    $result = mysqli_query($conn, 'select * from ' . $decoded['arguments'][1]);
                } elseif ($decoded['arguments'][0] === "listIn") {
                    $queryData = $decoded['arguments'][1];
                    $result = mysqli_query($conn, 'select * from ' . $queryData['target'] . ' where ' . $queryData['filter']);
                } elseif ($decoded['arguments'][0] === "update") {
                    $queryData = $decoded['arguments'][1];
                    $result = mysqli_query($conn, 'update ' . $queryData['target'] . ' set ' . $queryData['data'] . ' where ' . $queryData['filter']);
                } elseif ($decoded['arguments'][0] === "listIn") {
                     $queryData = $decoded['arguments'][1];
                     $result = mysqli_query($conn, 'delete from ' . $queryData['target'] . ' where ' . $queryData['filter']);
                 } else {
                    echo "Invalid query";
                    mysqli_close($conn);
                    return;
                 }

                if (mysqli_num_rows($result) > 0) {
                    // output data of each row
                    $rows = array();
                    while($row = mysqli_fetch_assoc($result)) {
                        $rows[] = $row;
                    }
                    echo json_encode($rows);
                } else {
                    echo "[]";
                }
                mysqli_close($conn);
            }

        }catch (Exception $e){
            echo 'Error in MySQL call';
        }
    } else{
        echo '{"error":" LionelClient.call() methods is only supported in the Lionel-App Javascript version", "result":"LionelClient.call() methods is only supported in the Lionel-App Javascript version"}';
    }
}
