<?php

/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2013, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

return CMap::mergeArray(
	$commonConfig,

	array(
		'basePath'    => CRAFT_APP_PATH,
		'runtimePath' => CRAFT_STORAGE_PATH.'runtime/',
		'name'        => 'Craft',

		// autoloading model and component classes
		'import' => array(
			'application.lib.*',
		),

		'params' => array(
			'generalConfig'        => $generalConfig,
			'requiredPhpVersion'   => '5.3.0',
			'requiredMysqlVersion' => '5.1.0'
		),
	)
);
