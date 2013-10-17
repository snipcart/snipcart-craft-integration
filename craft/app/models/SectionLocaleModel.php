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
 * Section locale model class
 */
class SectionLocaleModel extends BaseModel
{
	/**
	 * @access protected
	 * @return array
	 */
	protected function defineAttributes()
	{
		return array(
			'id'              => AttributeType::Number,
			'sectionId'       => AttributeType::Number,
			'locale'          => AttributeType::Locale,
			'urlFormat'       => AttributeType::String,
			'nestedUrlFormat' => AttributeType::String,
		);
	}
}
