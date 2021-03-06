<?php
namespace Craft;

/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2013, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

/**
 * ErrorHandler handles uncaught PHP errors and exceptions.
 *
 * It displays these errors using appropriate views based on the
 * nature of the error and the mode the application runs at.
 * It also chooses the most preferred language for displaying the error.
 *
 * ErrorHandler uses two sets of views:
 * <ul>
 * <li>development templates, named as <code>exception.php</code>;
 * <li>production templates, named as <code>error&lt;StatusCode&gt;.php</code>;
 * </ul>
 * where &lt;StatusCode&gt; stands for the HTTP error code (e.g. error500.php).
 * Localized templates are named similarly but located under a subdirectory
 * whose name is the language code (e.g. zh_cn/error500.php).
 *
 * Development templates are displayed when the application is in dev mode
 * (i.e. craft()->config->get('devMode') = true). Detailed error information with source code
 * are displayed in these templates. Production templates are meant to be shown
 * to end-users and are used when the application is in production mode.
 * For security reasons, they only display the error message without any
 * sensitive information.
 *
 * ErrorHandler looks for the templates from the following locations in order:
 * <ol>
 * <li><code>craft/templates/{siteHandle}/errors</code>: when a theme is active.</li>
 * <li><code>craft/app/templates/errors</code></li>
 * <li><code>craft/app/framework/views</code></li>
 * </ol>
 * If the template is not found in a directory, it will be looked for in the next directory.
 *
 * The property {@link maxSourceLines} can be changed to specify the number
 * of source code lines to be displayed in development views.
 *
 * ErrorHandler is a core application component that can be accessed via
 * {@link CApplication::getErrorHandler()}.
 *
 * @property array $error The error details. Null if there is no error.
 */
class ErrorHandler extends \CErrorHandler
{
	private $_error;

	/**
	 * Returns the stored error, if there is one.
	 *
	 * @return array|null
	 */
	public function getError()
	{
		if (isset($this->_error))
		{
			return $this->_error;
		}
		else
		{
			return parent::getError();
		}
	}

	/**
	 * Handles a thrown exception.  Will also log extra information if the exception happens to by a MySql deadlock.
	 *
	 * @access protected
	 * @param Exception $exception the exception captured
	 */
	protected function handleException($exception)
	{
		// Log MySQL deadlocks
		if ($exception instanceof \CDbException && strpos($exception->getMessage(), 'Deadlock') !== false)
		{
			$data = craft()->db->createCommand('SHOW ENGINE INNODB STATUS')->query();
			$info = $data->read();
			$info = serialize($info);

			Craft::log('Deadlock error, innodb status: '.$info, LogLevel::Error, 'system.db.CDbCommand');
		}

		// If this is a Twig Runtime exception, use the previous one instead
		if ($exception instanceof \Twig_Error_Runtime)
		{
			if ($previousException = $exception->getPrevious())
			{
				$exception = $previousException;
			}
		}

		// Special handling for Twig syntax errors
		if ($exception instanceof \Twig_Error_Syntax)
		{
			$this->handleTwigSyntaxError($exception);
		}
		else if ($exception instanceof DbConnectException)
		{
			$this->handleDbConnectionError($exception);
		}
		else
		{
			parent::handleException($exception);
		}
	}

	/**
	 * Handles Twig syntax errors.
	 *
	 * @access protected
	 * @param \Twig_Error $exception
	 */
	protected function handleTwigSyntaxError(\Twig_Error $exception)
	{
		$templateFile = $exception->getTemplateFile();

		try
		{
			$file = craft()->templates->findTemplate($templateFile);
		}
		catch (TemplateLoaderException $e)
		{
			$file = $templateFile;
		}

		$this->_error = $data = array(
			'code'      => 500,
			'type'      => Craft::t('Template Syntax Error'),
			'errorCode' => $exception->getCode(),
			'message'   => $exception->getRawMessage(),
			'file'      => $file,
			'line'      => $exception->getTemplateLine(),
			'trace'     => '',
			'traces'    => null,
		);

		if (!headers_sent())
		{
			header("HTTP/1.0 {$data['code']} ".$this->getHttpHeader($data['code'], get_class($exception)));
		}

		if ($exception instanceof \CHttpException || !YII_DEBUG)
		{
			$this->render('error', $data);
		}
		else
		{
			if ($this->isAjaxRequest())
			{
				craft()->displayException($exception);
			}
			else
			{
				$this->render('exception',$data);
			}
		}
	}

	/**
	 * Handles DB connection errors.
	 *
	 * @access protected
	 * @param DbConnectException $exception
	 */
	protected function handleDbConnectionError(DbConnectException $exception)
	{
		$this->_error = $data = array(
			'code'      => 'error',
			'type'      => get_class($exception),
			'errorCode' => null,
			'message'   => Craft::t('Craft can’t connect to the database with the credentials in craft/config/db.php.'),
			'file'      => null,
			'line'      => null,
			'trace'     => '',
			'traces'    => null,
		);

		if (!headers_sent())
		{
			header("HTTP/1.0 500} ".$this->getHttpHeader(500, get_class($exception)));
		}

		$this->render('error', $data);
	}

	/**
	 * Returns server version information.
	 * If the application is in production mode, empty string is returned.
	 *
	 * @return string server version information. Empty if in production mode.
	 */
	protected function getVersionInfo()
	{
		if (YII_DEBUG)
		{
			$version = '<a href="http://buildwithcraft.com/">Craft</a> '.CRAFT_VERSION.'.'.CRAFT_BUILD;

			if (isset($_SERVER['SERVER_SOFTWARE']))
			{
				$version = $_SERVER['SERVER_SOFTWARE'].' / '.$version;
			}
		}
		else
		{
			$version = '';
		}

		return $version;
	}
}
