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
 * Tag model class
 */
class TagModel extends BaseElementModel
{
	protected $elementType = ElementType::Tag;

	/**
	 * Use the tag name as its string representation.
	 *
	 * @return string
	 */
	function __toString()
	{
		return $this->name;
	}

	/**
	 * @access protected
	 * @return array
	 */
	protected function defineAttributes()
	{
		return array_merge(parent::defineAttributes(), array(
			'setId' => AttributeType::Number,
			'name'  => AttributeType::String,
		));
	}

	/**
	 * Returns the tag's set.
	 *
	 * @return TagSetModel|null
	 */
	public function getSet()
	{
		if ($this->setId)
		{
			return craft()->tags->getTagSetById($this->setId);
		}
	}
}
