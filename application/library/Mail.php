<?php

/**
 * TIRIEN WRAP CLASS FOR PHPMAILER 
 * 
 * Class is using tiriendev@gmail.com SMTP 
 * for sending test mails from development environment
 * 
 * Dependency: PHPMailer
 * 
 * Use: Mail::send($options);
 * Names are not obligatory.
 * 
 * @param array $options(array $to, $subject, $body, [array $from]) mandatory fields for PHPMailer Class
 * @return boolan
 */

class Mail {

    static function send($options) {
		$_config = parse_ini_file( 'application/configs/application.ini', true );

		$mailer = new PHPMailer;
		$mailer->CharSet = 'UTF-8';

		$local_env = $_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == 'svn';

		if ( $local_env && !empty($_config['application']['send_emails_in_dev']) ) {
			$mailer->isSMTP();
			$mailer->Host       = "smtp.gmail.com";
			$mailer->SMTPSecure = "tls";
			$mailer->SMTPAuth   = true;
			$mailer->Port       = 587;
			$mailer->Username   = "tiriendev@gmail.com";
			$mailer->Password   = "devtirien011";
			$mailer->setFrom('tiriendev@gmail.com', 'Development');
		}
		
		$mailer->Subject = $options['subject'];
		$mailer->msgHTML($options['body']);

		foreach ($options['to'] as $to) {
			$mailer->AddAddress( $local_env ? $_config['application']['dev_email'] : $to['email'], empty($to['name']) ? '' : $to['name']);
		}

		if (isset($options['from'])) {
			$mailer->setFrom( $options['from']['email'], $options['from']['name'] );
		}
		
		if(!empty($options['attachments'])){
			foreach ($options['attachments'] as $a) {
				$mailer->AddAttachment($a["tmp_name"], $a["name"]);
			}
		}

		$send = $mailer->send();

		if(!$send) {
			error_log(date("Y-m-d H:i:s").' ::: '.$mailer->ErrorInfo.PHP_EOL, 3, 'Mail_errors.log');
		}

		return $send;

    }

}

?>