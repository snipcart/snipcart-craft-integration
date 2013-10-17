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
 * Multi-select option field data class
 */
class MultiOptionsFieldData extends \ArrayObject
{
	public $options;

	/**
	 * @param mixed $value
	 * @return bool
	 */
	public function contains($value)
	{
		$value = (string) $value;

		foreach ($this as $selectedValue)
		{
			if ($value == $selectedValue->value)
			{
				return true;
			}
		}

		return false;
	}
}
