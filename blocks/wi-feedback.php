<?php
/* wi-feedback - v 0.4.002 */

// Action
switch ($_REQUEST['action']) {
    case 'feedback':
        fbSendMail();
        break;
    case 'upload';
        fbUploadFile();
        break;
    default:
        exit('Not allowed');
}

// Mail
function fbSendMail() {
    
    include('wi-feedback-conf.php');
    
    $mail_headers = "MIME-Version: 1.0\r\n";
    $mail_headers .= "Content-Type: text/plain; charset=UTF-8;\r\n";
    $mail_headers .= $mail_from ? "From: ".$mail_from."\r\n" : '';

    $result = false;
    $fieldsNum = 0;

    if (isset($_REQUEST['fields']) and count($_REQUEST['fields']) > 0) {
        foreach ($_REQUEST['fields'] as $field) {
            $value = clearFields($field['value']);
            $name = clearFields($field['name']);
            if (!empty($value)) {
                $mail_text .= $name.": ".$value."\n";
                $fieldsNum++;
            } else {
                $mail_text .= $name.": значение не указано\n";
            }
            if ($field['replyTo']) {
                $mail_headers .= "Reply-To: ".$field['value']."\r\n";
            }
        }
    }
    
    if ($recaptcha_secret != '') {
        require_once('recaptcha/autoload.php');
        $recaptcha = new \ReCaptcha\ReCaptcha($recaptcha_secret);
        $resp = $recaptcha->verify($_REQUEST['rct']);
        $recaptchaPassed = $resp->isSuccess();
        $mail_text .= "reCAPTCHA: ".($recaptchaPassed ? 'пройдено' : 'не пройдено')."\n";
    }
    
    file_put_contents(__DIR__.'/wi-feedback.log', date('Y.m.d H:i:s')."\n".$mail_text."\r\n", FILE_APPEND);
    
    if (isset($recaptcha) and !$recaptchaPassed) {
        echo 'reCAPTCHA failed';
        return;
    }

    echo mail($mail_addr, '=?UTF-8?B?'.base64_encode($mail_topic).'?=', $mail_text, $mail_headers);
}

// File
function fbUploadFile() {

    $result = array();

    if (isset($_FILES['file'])) {
        if ($_FILES['file']['size'] > 0) {
            if ($_FILES['file']['size'] <= 5242880) {
                $fileName = $_FILES['file']['name'];
                $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
                if (in_array($fileExt, array('zip', 'rar', 'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'svg'))) {
                    $destinationDir = __DIR__.'/uploads/';
                    $destinationName = 'attachment_'.date('Ymd_His').'.'.$fileExt;
                    if (!is_dir($destinationDir)) {
                        mkdir($destinationDir);         
                    }
                    if (copy($_FILES['file']['tmp_name'], $destinationDir.$destinationName)) {
                        $result['status'] = true;
                        $result['statusText'] = $fileName;
                        $result['fileName'] = $destinationName;
                    } else {
                        $result['status'] = false;
                        $result['statusText'] = 'При обработке файла произошла ошибка';
                    }
                } else {
                    $result['status'] = false;
                    $result['statusText'] = 'Данный тип файла не разрешен для загрузки';
                }
            } else {
                $result['status'] = false;
                $result['statusText'] = 'Размер файла превышает 5Mb';
            }
        } else {
            $result['status'] = false;
            $result['statusText'] = 'Переданы данные нулевой длины';
        }
    } else {
        $result['status'] = false;
        $result['statusText'] = 'Файл не выбран';
    }

    header('Content-Type: application/json');
    print_r(json_encode($result, JSON_UNESCAPED_UNICODE));
}

// Sanitize
function clearFields($str = '') {
	$str = trim($str);
	$str = strip_tags($str);
	$str = htmlspecialchars($str);
	return $str;
}

?>
