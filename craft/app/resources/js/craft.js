/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2013, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

(function($){

if (typeof Craft == 'undefined')
{
	Craft = {};
}

$.extend(Craft, {

	navHeight: 48,

	/**
	 * Map of high-ASCII codes to their low-ASCII characters.
	 *
	 * @var object
	 */
	asciiCharMap: {
		'223':'ss', '224':'a',  '225':'a',  '226':'a',  '229':'a',  '227':'ae', '230':'ae', '228':'ae', '231':'c',  '232':'e',
		'233':'e',  '234':'e',  '235':'e',  '236':'i',  '237':'i',  '238':'i',  '239':'i',  '241':'n',  '242':'o',  '243':'o',
		'244':'o',  '245':'o',  '246':'oe', '249':'u',  '250':'u',  '251':'u',  '252':'ue', '255':'y',  '257':'aa', '269':'ch',
		'275':'ee', '291':'gj', '299':'ii', '311':'kj', '316':'lj', '326':'nj', '353':'sh', '363':'uu', '382':'zh', '256':'aa',
		'268':'ch', '274':'ee', '290':'gj', '298':'ii', '310':'kj', '315':'lj', '325':'nj', '352':'sh', '362':'uu', '381':'zh'
	},

	/**
	 * Get a translated message.
	 *
	 * @param string message
	 * @param object params
	 * @return string
	 */
	t: function(message, params)
	{
		if (typeof Craft.translations[message] != 'undefined')
			message = Craft.translations[message];

		if (params)
		{
			for (var key in params)
			{
				message = message.replace('{'+key+'}', params[key])
			}
		}

		return message;
	},

	/**
	 * Returns whether a package is included in this Craft build.
	 *
	 * @return bool
	 * @param pkg
	 */
	hasPackage: function(pkg)
	{
		return ($.inArray(pkg, Craft.packages) != -1);
	},

	/**
	 * @return string
	 * @param path
	 * @param params
	 */
	getUrl: function(path, params, baseUrl)
	{
		if (typeof path != 'string')
		{
			path = '';
		}

		// Return path if it appears to be an absolute URL.
		if (path.search('://') != -1 || path.substr(0, 2) == '//')
		{
			return path;
		}

		path = Craft.trim(path, '/');

		var anchor = '';

		// Normalize the params
		if ($.isPlainObject(params))
		{
			var aParams = [];

			for (var name in params)
			{
				var value = params[name];

				if (name == '#')
				{
					anchor = value;
				}
				else if (value !== null && value !== '')
				{
					aParams.push(name+'='+value);
				}
			}

			params = aParams;
		}

		if (Garnish.isArray(params))
		{
			params = params.join('&');
		}
		else
		{
			params = Craft.trim(params, '&?');
		}

		// Were there already any query string params in the path?
		var qpos = path.indexOf('?');
		if (qpos != -1)
		{
			params = path.substr(qpos+1)+(params ? '&'+params : '');
			path = path.substr(0, qpos);
		}

		// Put it all together
		if (baseUrl)
		{
			var url = baseUrl;

			if (path)
			{
				// Does baseUrl already contain a path?
				var pathMatch = url.match(/[&\?]p=[^&]+/);
				if (pathMatch)
				{
					url = url.replace(pathMatch[0], pathMatch[0]+'/'+path);
					path = '';
				}
			}
		}
		else
		{
			var url = Craft.baseUrl;
		}

		// Does the base URL already have a query string?
		var qpos = url.indexOf('?');
		if (qpos != '-1')
		{
			params = url.substr(qpos+1)+(params ? '&'+params : '');
			url = url.substr(0, qpos);
		}

		if (!Craft.omitScriptNameInUrls && path)
		{
			if (Craft.usePathInfo)
			{
				// Make sure that the script name is in the URL
				if (url.search(Craft.scriptName) == -1)
				{
					url = Craft.rtrim(url, '/') + '/' + Craft.scriptName;
				}
			}
			else
			{
				// Move the path into the query string params

				// Is the p= param already set?
				if (params && params.substr(0, 2) == 'p=')
				{
					var endPath = params.indexOf('&');
					if (endPath != -1)
					{
						var basePath = params.substring(2, endPath);
						params = params.substr(endPath+1);
					}
					else
					{
						var basePath = params.substr(2);
						params = null;
					}

					// Just in case
					basePath = Craft.rtrim(basePath);

					path = basePath + (path ? '/'+path : '');
				}

				// Now move the path into the params
				params = 'p='+path + (params ? '&'+params : '');
				path = null;
			}
		}

		if (path)
		{
			url = Craft.rtrim(url, '/') + '/' + path;
		}

		if (params)
		{
			url += '?'+params;
		}

		if (anchor)
		{
			url += '#'+anchor;
		}

		return url;
	},

	/**
	 * @return string
	 * @param path
	 * @param params
	 */
	getCpUrl: function(path, params)
	{
		return this.getUrl(path, params, Craft.baseCpUrl)
	},

	/**
	 * @return string
	 * @param path
	 * @param params
	 */
	getSiteUrl: function(path, params)
	{
		return this.getUrl(path, params, Craft.baseSiteUrl)
	},

	/**
	 * Returns a resource URL.
	 *
	 * @param string path
	 * @param array|string|null params
	 * @return string
	 */
	getResourceUrl: function(path, params)
	{
		return Craft.getUrl(path, params, Craft.resourceUrl);
	},

	/**
	 * Returns an action URL.
	 *
	 * @param string path
	 * @param array|string|null params
	 * @return string
	 */
	getActionUrl: function(path, params)
	{
		return Craft.getUrl(path, params, Craft.actionUrl);
	},

	/**
	 * Posts an action request to the server.
	 *
	 * @param string action
	 * @param object|null data
	 * @param function|null callback
	 * @param object|null options
	 */
	postActionRequest: function(action, data, callback, options)
	{
		// Make 'data' optional
		if (typeof data == 'function')
		{
			options = callback;
			callback = data;
			data = undefined;
		}

		return $.ajax($.extend({
			url:      Craft.getActionUrl(action),
			type:     'POST',
			data:     data,
			success:  callback,
			error:    function(jqXHR, textStatus, errorThrown) {
				callback(null, textStatus, jqXHR);
			},
			complete: function(jqXHR, textStatus) {
				if (textStatus != 'success')
				{
					if (typeof Craft.cp != 'undefined')
					{
						Craft.cp.displayError();
					}
					else
					{
						alert(Craft.t('An unknown error occurred.'));
					}
				}
			}
		}, options));
	},

	/**
	 * Converts a comma-delimited string into an array.
	 *
	 * @param string str
	 * @return array
	 */
	stringToArray: function(str)
	{
		if (typeof str != 'string')
			return str;

		var arr = str.split(',');
		for (var i = 0; i < arr.length; i++)
		{
			arr[i] = $.trim(arr[i]);
		}
		return arr;
	},

	/**
	 * Expands an array of POST array-style strings into an actual array.
	 *
	 * @param array arr
	 * @return array
	 */
	expandPostArray: function(arr)
	{
		var expanded = {};

		for (var key in arr)
		{
			var value = arr[key],
				m = key.match(/^(\w+)(\[.*)?/);

			if (m[2])
			{
				// Get all of the nested keys
				var keys = m[2].match(/\[[^\[\]]*\]/g);

				// Chop off the brackets
				for (var i = 0; i < keys.length; i++)
				{
					keys[i] = keys[i].substring(1, keys[i].length-1);
				}
			}
			else
			{
				var keys = [];
			}

			keys.unshift(m[1]);

			var parentElem = expanded;

			for (var i = 0; i < keys.length; i++)
			{
				if (i < keys.length-1)
				{
					if (typeof parentElem[keys[i]] != 'object')
					{
						// Figure out what this will be by looking at the next key
						if (!keys[i+1] || parseInt(keys[i+1]) == keys[i+1])
						{
							parentElem[keys[i]] = [];
						}
						else
						{
							parentElem[keys[i]] = {};
						}
					}

					parentElem = parentElem[keys[i]];
				}
				else
				{
					// Last one. Set the value
					if (!keys[i])
					{
						keys[i] = parentElem.length;
					}

					parentElem[keys[i]] = value;
				}
			}
		}

		return expanded;
	},

	/**
	 * Compares two variables and returns whether they are equal in value.
	 * Recursively compares array and object values.
	 *
	 * @param mixed obj1
	 * @param mixed obj2
	 * @return bool
	 */
	compare: function(obj1, obj2)
	{
		// Compare the types
		if (typeof obj1 != typeof obj2)
		{
			return false;
		}

		if (typeof obj1 == 'object')
		{
			// Compare the lengths
			if (obj1.length != obj2.length)
			{
				return false;
			}

			// Is one of them an array but the other is not?
			if ((obj1 instanceof Array) != (obj2 instanceof Array))
			{
				return false;
			}

			// If they're actual objects (not arrays), compare the keys
			if (!(obj1 instanceof Array))
			{
				if (!Craft.compare(Craft.getObjectKeys(obj1), Craft.getObjectKeys(obj2)))
				{
					return false;
				}
			}

			// Compare each value
			for (var i in obj1)
			{
				if (!Craft.compare(obj1[i], obj2[i]))
				{
					return false;
				}
			}

			// All clear
			return true;
		}
		else
		{
			return (obj1 === obj2);
		}
	},

	/**
	 * Returns an array of an object's keys.
	 *
	 * @param object obj
	 * @return string
	 */
	getObjectKeys: function(obj)
	{
		var keys = [];

		for (var key in obj)
		{
			keys.push(key);
		}

		return keys;
	},

	/**
	 * Takes an array or string of chars, and places a backslash before each one, returning the combined string.
	 *
	 * Userd by ltrim() and rtrim()
	 *
	 * @param string|array chars
	 * @return string
	 */
	escapeChars: function(chars)
	{
		if (!Garnish.isArray(chars))
		{
			chars = chars.split();
		}

		var escaped = '';

		for (var i = 0; i < chars.length; i++)
		{
			escaped += "\\"+chars[i];
		}

		return escaped;
	},

	/**
	 * Trim characters off of the beginning of a string.
	 *
	 * @param string str
	 * @param string|array|null The characters to trim off. Defaults to a space if left blank.
	 * @return string
	 */
	ltrim: function(str, chars)
	{
		if (!str) return str;
		if (chars === undefined) chars = ' ';
		var re = new RegExp('^['+Craft.escapeChars(chars)+']+');
		return str.replace(re, '');
	},

	/**
	 * Trim characters off of the end of a string.
	 *
	 * @param string str
	 * @param string|array|null The characters to trim off. Defaults to a space if left blank.
	 * @return string
	 */
	rtrim: function(str, chars)
	{
		if (!str) return str;
		if (chars === undefined) chars = ' ';
		var re = new RegExp('['+Craft.escapeChars(chars)+']+$');
		return str.replace(re, '');
	},

	/**
	 * Trim characters off of the beginning and end of a string.
	 *
	 * @param string str
	 * @param string|array|null The characters to trim off. Defaults to a space if left blank.
	 * @return string
	 */
	trim: function(str, chars)
	{
		str = Craft.ltrim(str, chars);
		str = Craft.rtrim(str, chars);
		return str;
	},

	/**
	 * Filters an array.
	 *
	 * @param array    arr
	 * @param function callback A user-defined callback function. If null, we'll just remove any elements that equate to false.
	 * @return array
	 */
	filterArray: function(arr, callback)
	{
		var filtered = [];

		for (var i = 0; i < arr.length; i++)
		{
			if (typeof callback == 'function')
			{
				var include = callback(arr[i], i);
			}
			else
			{
				var include = arr[i];
			}

			if (include)
			{
				filtered.push(arr[i]);
			}
		}

		return filtered;
	},

	/**
	 * Returns whether an element is in an array (unlike jQuery.inArray(), which returns the element's index, or -1).
	 *
	 * @param mixed elem
	 * @param mixed arr
	 * @return bool
	 */
	inArray: function(elem, arr)
	{
		return ($.inArray(elem, arr) != -1);
	},

	/**
	 * Removes an element from an array.
	 *
	 * @param mixed elem
	 * @param array arr
	 * @return bool Whether the element could be found or not.
	 */
	removeFromArray: function(elem, arr)
	{
		var index = $.inArray(elem, arr);
		if (index != -1)
		{
			arr.splice(index, 1);
			return true;
		}
		else
		{
			return false;
		}
	},

	/**
	 * Returns the last element in an array.
	 *
	 * @param array
	 * @return mixed
	 */
	getLast: function(arr)
	{
		if (!arr.length)
			return null;
		else
			return arr[arr.length-1];
	},

	/**
	 * Makes the first character of a string uppercase.
	 *
	 * @param string str
	 * @return string
	 */
	uppercaseFirst: function(str)
	{
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	/**
	 * Makes the first character of a string lowercase.
	 *
	 * @param string str
	 * @return string
	 */
	lowercaseFirst: function(str)
	{
		return str.charAt(0).toLowerCase() + str.slice(1);
	},

	/**
	 * Converts extended ASCII characters to ASCII.
	 *
	 * @param string str
	 * @return string
	 */
	asciiString: function(str)
	{
		var asciiStr = '';

		for (var c = 0; c < str.length; c++)
		{
			var ascii = str.charCodeAt(c);

			if (ascii >= 32 && ascii < 128)
			{
				asciiStr += str.charAt(c);
			}
			else if (typeof Craft.asciiCharMap[ascii] != 'undefined')
			{
				asciiStr += Craft.asciiCharMap[ascii];
			}
		}

		return asciiStr;
	},

	/**
	 * Prevents the outline when an element is focused by the mouse.
	 *
	 * @param mixed elem Either an actual element or a jQuery collection.
	 */
	preventOutlineOnMouseFocus: function(elem)
	{
		var $elem = $(elem),
			namespace = '.preventOutlineOnMouseFocus';

		$elem.on('mousedown'+namespace, function() {
			$elem.addClass('no-outline');
			$elem.focus();
		})
		.on('keydown'+namespace+' blur'+namespace, function(event) {
			if (event.keyCode != Garnish.SHIFT_KEY && event.keyCode != Garnish.CTRL_KEY && event.keyCode != Garnish.CMD_KEY)
				$elem.removeClass('no-outline');
		});
	},

	/**
	 * Creates a validation error list.
	 *
	 * @param array errors
	 * @return jQuery
	 */
	createErrorList: function(errors)
	{
		var $ul = $(document.createElement('ul')).addClass('errors');

		for (var i = 0; i < errors.length; i++)
		{
			var $li = $(document.createElement('li'));
			$li.appendTo($ul);
			$li.html(errors[i]);
		}

		return $ul;
	},

	/**
	 * Initializes any common UI elements in a given container.
	 *
	 * @param jQuery $container
	 */
	initUiElements: function($container)
	{
		$('.checkbox-select', $container).checkboxselect();
		$('.fieldtoggle', $container).fieldtoggle();
		$('.lightswitch', $container).lightswitch();
		$('.nicetext', $container).nicetext();
		$('.pill', $container).pill();
		$('.menubtn', $container).menubtn();
	},

	_elementIndexClasses: {},
	_elementSelectorModalClasses: {},

	/**
	 * Registers an element index class for a given element type.
	 *
	 * @param string elementType
	 * @param function func
	 */
	registerElementIndexClass: function(elementType, func)
	{
		if (typeof this._elementIndexClasses[elementType] != 'undefined')
		{
			throw 'An element index class has already been registered for the element type “'+elementType+'”.';
		}

		this._elementIndexClasses[elementType] = func;
	},


	/**
	 * Registers an element selector modal class for a given element type.
	 *
	 * @param string elementType
	 * @param function func
	 */
	registerElementSelectorModalClass: function(elementType, func)
	{
		if (typeof this._elementSelectorModalClasses[elementType] != 'undefined')
		{
			throw 'An element selector modal class has already been registered for the element type “'+elementType+'”.';
		}

		this._elementSelectorModalClasses[elementType] = func;
	},

	/**
	 * Creates a new element index for a given element type.
	 *
	 * @param string elementType
	 * @param mixed  $container
	 * @param object settings
	 * @return BaseElementIndex
	 */
	createElementIndex: function(elementType, $container, settings)
	{
		if (typeof this._elementIndexClasses[elementType] != 'undefined')
		{
			var func = this._elementIndexClasses[elementType];
		}
		else
		{
			var func = Craft.BaseElementIndex;
		}

		return new func(elementType, $container, settings);
	},

	/**
	 * Creates a new element selector modal for a given element type.
	 *
	 * @param string elementType
	 * @param object settings
	 */
	createElementSelectorModal: function(elementType, settings)
	{
		if (typeof this._elementSelectorModalClasses[elementType] != 'undefined')
		{
			var func = this._elementSelectorModalClasses[elementType];
		}
		else
		{
			var func = Craft.BaseElementSelectorModal;
		}

		return new func(elementType, settings);
	}
});


// -------------------------------------------
//  Custom jQuery plugins
// -------------------------------------------

$.extend($.fn, {

	/**
	 * Disables elements by adding a .disabled class and preventing them from receiving focus.
	 */
	disable: function()
	{
		return this.each(function()
		{
			var $elem = $(this);
			$elem.addClass('disabled');

			if ($elem.data('activatable'))
			{
				$elem.removeAttr('tabindex');
			}
		});
	},

	/**
	 * Enables elements by removing their .disabled class and allowing them to receive focus.
	 */
	enable: function()
	{
		return this.each(function()
		{
			var $elem = $(this);
			$elem.removeClass('disabled');

			if ($elem.data('activatable'))
			{
				$elem.attr('tabindex', '0');
			}
		});
	},

	/**
	 * Sets the element as a container for a checkbox select.
	 */
	checkboxselect: function()
	{
		return this.each(function()
		{
			if (!$.data(this, 'checkboxselect'))
			{
				new Garnish.CheckboxSelect(this);
			}
		});
	},

	/**
	 * Sets the element as a field toggle trigger.
	 */
	fieldtoggle: function()
	{
		return this.each(function()
		{
			if (!$.data(this, 'fieldtoggle'))
			{
				new Craft.FieldToggle(this);
			}
		});
	},

	lightswitch: function(settings, settingName, settingValue)
	{
		// param mapping
		if (settings == 'settings')
		{
			if (typeof settingName == 'string')
			{
				settings = {};
				settings[settingName] = settingValue;
			}
			else
			{
				settings = settingName;
			}

			return this.each(function()
			{
				var obj = $.data(this, 'lightswitch');
				if (obj)
				{
					obj.setSettings(settings);
				}
			});
		}

		return this.each(function()
		{
			if (!$.data(this, 'lightswitch'))
			{
				new Craft.LightSwitch(this, settings);
			}
		});
	},

	nicetext: function()
	{
		return this.each(function()
		{
			if (!$.data(this, 'text'))
			{
				new Garnish.NiceText(this);
			}
		});
	},

	pill: function()
	{
		return this.each(function()
		{
			if (!$.data(this, 'pill'))
			{
				new Garnish.Pill(this);
			}
		});
	},

	menubtn: function()
	{
		return this.each(function()
		{
			if (!$.data(this, 'menubtn'))
			{
				new Garnish.MenuBtn(this);
			}
		});
	}
});


Garnish.$doc.ready(function()
{
	Craft.initUiElements();
});


/**
 * Element index class
 */
Craft.BaseElementIndex = Garnish.Base.extend({

	elementType: null,

	instanceState: null,
	instanceStateStorageId: null,
	sourceStates: null,
	sourceStatesStorageId: null,

	searchTimeout: null,
	elementSelect: null,
	sourceSelect: null,

	$container: null,
	$main: null,
	$scroller: null,
	$toolbar: null,
	$search: null,
	$viewModeBtnTd: null,
	$viewModeBtnContainer: null,
	viewModeBtns: null,
	viewMode: null,
	$mainSpinner: null,
	$loadingMoreSpinner: null,
	$sidebar: null,
	$sources: null,
	sourceKey: null,
	$source: null,
	$sourceToggles: null,
	$elements: null,
	$table: null,
	$elementContainer: null,

	init: function(elementType, $container, settings)
	{
		this.elementType = elementType;
		this.$container = $container;
		this.setSettings(settings, Craft.BaseElementIndex.defaults);

		// Set the state objects
		this.instanceState = {
			selectedSource: null
		};

		this.sourceStates = {};

		if (typeof Storage !== 'undefined')
		{
			// Instance states (selected source) are stored by a custom storage key defined in the settings
			if (this.settings.storageKey)
			{
				this.instanceStateStorageId = 'Craft-'+Craft.siteUid+'.'+this.settings.storageKey;

				if (typeof localStorage[this.instanceStateStorageId] != 'undefined')
				{
					$.extend(this.instanceState, JSON.parse(localStorage[this.instanceStateStorageId]));
				}
			}

			// Source states (view mode, etc.) are stored by the element type and context
			this.sourceStatesStorageId = 'Craft-'+Craft.siteUid+'.BaseElementIndex.'+this.elementType+'.'+this.settings.context;

			if (typeof localStorage[this.sourceStatesStorageId] != 'undefined')
			{
				$.extend(this.sourceStates, JSON.parse(localStorage[this.sourceStatesStorageId]));
			}
		}

		// Find the DOM elements
		this.$main = this.$container.find('.main');
		this.$toolbar = this.$container.find('.toolbar:first');
		this.$search = this.$toolbar.find('.search:first input:first');
		this.$mainSpinner = this.$toolbar.find('.spinner:first');
		this.$loadingMoreSpinner = this.$container.find('.spinner.loadingmore')
		this.$sidebar = this.$container.find('.sidebar:first');
		this.$sources = this.$sidebar.find('nav a');
		this.$sourceToggles = this.$sidebar.find('.toggle');
		this.$elements = this.$container.find('.elements:first');

		// View Mode buttons
		this.viewModeBtns = {};
		this.$viewModeBtnTd = this.$toolbar.find('.viewbtns:first');
		this.$viewModeBtnContainer = $('<div class="btngroup"/>').appendTo(this.$viewModeBtnTd);

		var viewModes = [
			{ mode: 'table',     title: Craft.t('Display in a table'),     icon: 'list' },
			{ mode: 'structure', title: Craft.t('Display hierarchically'), icon: 'structure' },
			{ mode: 'thumbs',    title: Craft.t('Display as thumbnails'),  icon: 'grid' }
		];

		for (var i = 0; i < viewModes.length; i++)
		{
			var viewMode = viewModes[i],
				$viewModeBtn = $('<div class="btn" title="'+viewMode.title+'" data-icon="'+viewMode.icon+'" data-view="'+viewMode.mode+'" role="button"/>')

			this.viewModeBtns[viewMode.mode] = $viewModeBtn;

			this.addListener($viewModeBtn, 'click', { mode: viewMode.mode }, function(ev) {
				this.selectViewMode(ev.data.mode);
				this.updateElements();
			});
		}

		this.viewModeBtns.table.appendTo(this.$viewModeBtnContainer);

		// No source, no party.
		if (this.$sources.length == 0)
		{
			return;
		}

		this.onAfterHtmlInit();

		if (this.settings.context == 'index')
		{
			this.$scroller = Garnish.$win;
		}
		else
		{
			this.$scroller = this.$main;
		}

		// Select the initial source
		var source = this.instanceState.selectedSource;

		if (source)
		{
			var $source = this.getSourceByKey(source);

			if ($source)
			{
				// Expand any parent sources
				var $parentSources = $source.parentsUntil('.sidebar', 'li');
				$parentSources.not(':first').addClass('expanded');
			}
		}

		if (!source || !$source)
		{
			// Select the first source by default
			var $source = this.$sources.first();
		}

		this.selectSource($source);

		// Load up the elements!
		this.updateElements();

		// Add some listeners
		this.addListener(this.$sourceToggles, 'click', function(ev)
		{
			$(ev.currentTarget).parent().toggleClass('expanded');
			ev.stopPropagation();
		});

		// The source selector
		this.sourceSelect = new Garnish.Select(this.$sidebar.find('nav'), this.$sources, {
			selectedClass:     'sel',
			multi:             false,
			vertical:          true,
			onSelectionChange: $.proxy(this, 'onSourceSelectionChange')
		});

		this.addListener(this.$search, 'textchange', $.proxy(function()
		{
			if (this.searchTimeout)
			{
				clearTimeout(this.searchTimeout);
			}

			this.searchTimeout = setTimeout($.proxy(this, 'updateElements'), 500);
		}, this));

		// Auto-focus the Search box
		if (!Garnish.isMobileBrowser(true))
		{
			this.$search.focus();
		}
	},

	onSourceSelectionChange: function()
	{
		var sourceElement = this.$sources.filter('.sel');
		if (sourceElement.length == 0)
		{
			sourceElement = this.$sources.filter(':first');
		}

		this.selectSource(sourceElement);
		this.updateElements();
	},

	setInstanceState: function(key, value)
	{
		if (typeof key == 'object')
		{
			$.extend(this.instanceState, key);
		}
		else
		{
			this.instanceState[key] = value;
		}

		// Store it in localStorage too?
		if (this.instanceStateStorageId)
		{
			localStorage[this.instanceStateStorageId] = JSON.stringify(this.instanceState);
		}
	},

	getSourceState: function(source, key, defaultValue)
	{
		if (typeof this.sourceStates[source] == 'undefined')
		{
			// Set it now so any modifications to it by whoever's calling this will be stored.
			this.sourceStates[source] = {};
		}

		if (typeof key == 'undefined')
		{
			return this.sourceStates[source];
		}
		else if (typeof this.sourceStates[source][key] != 'undefined')
		{
			return this.sourceStates[source][key];
		}
		else
		{
			return (typeof defaultValue != 'undefined' ? defaultValue : null);
		}
	},

	getSelectedSourceState: function(key, defaultValue)
	{
		return this.getSourceState(this.instanceState.selectedSource, key, defaultValue);
	},

	setSelecetedSourceState: function(key, value)
	{
		var viewState = this.getSelectedSourceState();

		if (typeof key == 'object')
		{
			$.extend(viewState, key);
		}
		else
		{
			viewState[key] = value;
		}

		this.sourceStates[this.instanceState.selectedSource] = viewState;

		// Store it in localStorage too?
		if (this.sourceStatesStorageId)
		{
			localStorage[this.sourceStatesStorageId] = JSON.stringify(this.sourceStates);
		}
	},

	getControllerData: function()
	{
		return {
			context:            this.settings.context,
			elementType:        this.elementType,
			criteria:           this.settings.criteria,
			disabledElementIds: this.settings.disabledElementIds,
			source:             this.instanceState.selectedSource,
			viewState:          this.getSelectedSourceState(),
			search:             (this.$search ? this.$search.val() : null)
		};
	},

	updateElements: function()
	{
		this.$mainSpinner.removeClass('hidden');
		this.removeListener(this.$scroller, 'scroll');

		if (this.getSelectedSourceState('mode') == 'table' && this.$table)
		{
			Craft.cp.$collapsibleTables = Craft.cp.$collapsibleTables.not(this.$table);
		}

		// Can't use structure view for search results
		if (this.getSelectedSourceState('mode') == 'structure' && this.$search && this.$search.val())
		{
			this.selectViewMode('table');
		}

		var data = this.getControllerData();

		Craft.postActionRequest('elements/getElements', data, $.proxy(function(response, textStatus) {

			this.$mainSpinner.addClass('hidden');

			if (textStatus == 'success')
			{
				this.setNewElementDataHtml(response, false);
			}

		}, this));
	},

	setNewElementDataHtml: function(response, append)
	{
		if (!append)
		{
			this.$elements.html(response.html);

			if (this.getSelectedSourceState('mode') == 'table')
			{
				var $headers = this.$elements.find('thead:first th');
				this.addListener($headers, 'click', 'onSortChange');

				this.$table = this.$elements.find('table:first');
				this.$elementContainer = this.$table.find('tbody:first');

				Craft.cp.$collapsibleTables = Craft.cp.$collapsibleTables.add(this.$table);
			}
			else
			{
				this.$elementContainer = this.$elements.children('ul');
			}
		}
		else
		{
			this.$elementContainer.append(response.html);
		}

		$('head').append(response.headHtml);

		Craft.cp.setMaxSidebarHeight();

		// More?
		if (response.more)
		{
			this.totalVisible = response.totalVisible;

			this.addListener(this.$scroller, 'scroll', function()
			{
				if (
					(this.$scroller[0] == Garnish.$win[0] && ( Garnish.$win.innerHeight() + Garnish.$bod.scrollTop() >= Garnish.$bod.height() )) ||
					(this.$scroller.prop('scrollHeight') - this.$scroller.scrollTop() == this.$scroller.outerHeight())
				)
				{
					this.$loadingMoreSpinner.removeClass('hidden');
					this.removeListener(this.$scroller, 'scroll');

					var data = this.getControllerData();
					data.offset = this.totalVisible;

					Craft.postActionRequest('elements/getElements', data, $.proxy(function(response, textStatus) {

						this.$loadingMoreSpinner.addClass('hidden');

						if (textStatus == 'success')
						{
							this.setNewElementDataHtml(response, true);
						}

					}, this));
				}
			});
		}

		switch (this.getSelectedSourceState('mode'))
		{
			case 'table':
			{
				Craft.cp.updateResponsiveTables();
				break;
			}
			case 'structure':
			{
				var $parents = this.$elementContainer.find('ul').prev('.row'),
					collapsedElementIds = this.getSelectedSourceState('collapsedElementIds', []);

				for (var i = 0; i < $parents.length; i++)
				{
					var $row = $($parents[i]),
						$li = $row.parent(),
						$toggle = $('<div class="toggle" title="'+Craft.t('Show/hide children')+'"/>').prependTo($row);

					if ($.inArray($row.data('id'), collapsedElementIds) != -1)
					{
						$li.addClass('collapsed');
					}

					this.initToggle($toggle);
				}

				if (this.settings.context == 'index')
				{
					if (this.$source.data('sortable'))
					{
						this.$elementContainer.find('.add').click($.proxy(function(ev) {

							var $btn = $(ev.currentTarget);

							if (!$btn.data('menubtn'))
							{
								var elementId = $btn.parent().data('id'),
									newChildUrl = Craft.getUrl(this.$source.data('new-child-url'), 'parentId='+elementId),
									$menu = $('<div class="menu"><ul><li><a href="'+newChildUrl+'">'+Craft.t('New child')+'</a></li></ul></div>').insertAfter($btn);

								var menuBtn = new Garnish.MenuBtn($btn);
								menuBtn.showMenu();
							}

						}, this))

						this.structureDrag = new Craft.StructureDrag(this,
							this.$source.data('move-action'),
							this.$source.data('max-depth')
						);
					}
				}
			}
		}

		this.onUpdateElements(append);
	},

	initToggle: function($toggle)
	{
		$toggle.click($.proxy(function(ev) {

			var $li = $(ev.currentTarget).closest('li'),
				elementId = $li.children('.row').data('id'),
				collapsedElementIds = this.getSelectedSourceState('collapsedElementIds', []),
				viewStateKey = $.inArray(elementId, collapsedElementIds);

			if ($li.hasClass('collapsed'))
			{
				$li.removeClass('collapsed');

				if (viewStateKey != -1)
				{
					collapsedElementIds.splice(viewStateKey, 1);
				}
			}
			else
			{
				$li.addClass('collapsed');

				if (viewStateKey == -1)
				{
					collapsedElementIds.push(elementId);
				}
			}

			this.setSelecetedSourceState('collapsedElementIds', collapsedElementIds);

		}, this));
	},

	onUpdateElements: function(append)
	{
		this.settings.onUpdateElements(append);
	},

	onSortChange: function(ev)
	{
		var $th = $(ev.currentTarget),
			attribute = $th.attr('data-attribute');

		if (this.getSelectedSourceState('order') == attribute)
		{
			if (this.getSelectedSourceState('sort') == 'asc')
			{
				this.setSelecetedSourceState('sort', 'desc');
			}
			else
			{
				this.setSelecetedSourceState('sort', 'asc');
			}
		}
		else
		{
			this.setSelecetedSourceState({
				order: attribute,
				sort: 'asc'
			});
		}

		this.updateElements();
	},

	getSourceByKey: function(key)
	{
		for (var i = 0; i < this.$sources.length; i++)
		{
			var $source = $(this.$sources[i]);

			if ($source.data('key') == key)
			{
				return $source;
			}
		}
	},

	selectSource: function($source)
	{
		if (this.$source == $source)
		{
			return;
		}

		if (this.$source)
		{
			this.$source.removeClass('sel');
		}

		this.sourceKey = $source.data('key');
		this.$source = $source.addClass('sel');
		this.setInstanceState('selectedSource', this.sourceKey);

		if (this.$search)
		{
			// Clear the search value without triggering the textchange event
			this.$search.data('textchangeValue', '');
			this.$search.val('');
		}

		this.setViewModeForNewSource();
		this.onSelectSource();
	},

	setViewModeForNewSource: function()
	{
		// Have they already visited this source?
		var viewMode = this.getSelectedSourceState('mode');

		if (!viewMode || !this.doesSourceHaveViewMode(viewMode))
		{
			// Default to structure view if the source has it
			if (this.doesSourceHaveViewMode('structure'))
			{
				viewMode = 'structure';
			}
			// Otherwise try to keep using the current view mode
			else if (this.viewMode && this.doesSourceHaveViewMode(this.viewMode))
			{
				viewMode = this.viewMode;
			}
			// Fine, use table view
			else
			{
				viewMode = 'table';
			}
		}

		this.selectViewMode(viewMode);

		// Should we be showing the buttons?
		var showViewModeBtns = false;

		for (var viewMode in this.viewModeBtns)
		{
			if (viewMode == 'table')
			{
				continue;
			}

			if (this.doesSourceHaveViewMode(viewMode))
			{
				this.viewModeBtns[viewMode].appendTo(this.$viewModeBtnContainer);
				showViewModeBtns = true;
			}
			else
			{
				this.viewModeBtns[viewMode].detach();
			}
		}

		if (showViewModeBtns)
		{
			this.$viewModeBtnTd.removeClass('hidden');
		}
		else
		{
			this.$viewModeBtnTd.addClass('hidden');
		}
	},

	onSelectSource: function()
	{
		this.settings.onSelectSource(this.sourceKey);
	},

	onAfterHtmlInit: function()
	{
		this.settings.onAfterHtmlInit()
	},

	doesSourceHaveViewMode: function(viewMode)
	{
		return (viewMode == 'table' || this.$source.data('has-'+viewMode));
	},

	selectViewMode: function(viewMode)
	{
		// Make sure that the current source supports it
		if (!this.doesSourceHaveViewMode(viewMode))
		{
			viewMode = 'table';
		}

		if (this.viewMode)
		{
			this.viewModeBtns[this.viewMode].removeClass('active');
		}

		this.viewMode = viewMode;
		this.viewModeBtns[this.viewMode].addClass('active');
		this.setSelecetedSourceState('mode', this.viewMode);
	},

	rememberDisabledElementId: function(elementId)
	{
		var index = $.inArray(elementId, this.settings.disabledElementIds);

		if (index == -1)
		{
			this.settings.disabledElementIds.push(elementId);
		}
	},

	forgetDisabledElementId: function(elementId)
	{
		var index = $.inArray(elementId, this.settings.disabledElementIds);

		if (index != -1)
		{
			this.settings.disabledElementIds.splice(index, 1);
		}
	},

	enableElements: function($elements)
	{
		$elements.removeClass('disabled');

		for (var i = 0; i < $elements.length; i++)
		{
			var elementId = $($elements[i]).data('id');
			this.forgetDisabledElementId(elementId);
		}

		this.settings.onEnableElements($elements);
	},

	disableElements: function($elements)
	{
		$elements.removeClass('sel').addClass('disabled');

		for (var i = 0; i < $elements.length; i++)
		{
			var elementId = $($elements[i]).data('id');
			this.rememberDisabledElementId(elementId);
		}

		this.settings.onDisableElements($elements);
	},

	getElementById: function(elementId)
	{
		return this.$elementContainer.find('[data-id='+elementId+']:first');
	},

	enableElementsById: function(elementIds)
	{
		elementIds = $.makeArray(elementIds);

		for (var i = 0; i < elementIds.length; i++)
		{
			var elementId = elementIds[i],
				$element = this.getElementById(elementId);

			if ($element.length)
			{
				this.enableElements($element);
			}
			else
			{
				this.forgetDisabledElementId(elementId);
			}
		}
	},

	disableElementsById: function(elementIds)
	{
		elementIds = $.makeArray(elementIds);

		for (var i = 0; i < elementIds.length; i++)
		{
			var elementId = elementIds[i],
				$element = this.getElementById(elementId);

			if ($element.length)
			{
				this.disableElements($element);
			}
			else
			{
				this.rememberDisabledElementId(elementId);
			}
		}
	},

	setElementSelect: function(obj)
	{
		this.elementSelect = obj;
	},

	addCallback: function(currentCallback, newCallback)
	{
		return $.proxy(function() {
			if (typeof currentCallback == 'function')
			{
				currentCallback.apply(this, arguments);
			}
			newCallback.apply(this, arguments);
		}, this);
	},

	setIndexBusy: function() {
		this.$mainSpinner.removeClass('hidden');
		this.isIndexBusy = true;
	},

	setIndexAvailable: function() {
		this.$mainSpinner.addClass('hidden');
		this.isIndexBusy = false;
	}
},
{
	defaults: {
		context: 'index',
		storageKey: null,
		criteria: null,
		disabledElementIds: [],
		onUpdateElements: $.noop,
		onEnableElements: $.noop,
		onDisableElements: $.noop,
		onSelectSource: $.noop,
		onAfterHtmlInit: $.noop
	}
});


/**
 * Element Select input
 */
Craft.BaseElementSelectInput = Garnish.Base.extend({

	id: null,
	name: null,
	elementType: null,
	sources: null,
	criteria: null,
	limit: null,
	storageKey: null,

	totalElements: 0,
	elementSelect: null,
	elementSort: null,
	modal: null,

	$container: null,
	$elementsContainer: null,
	$elements: null,
	$addElementBtn: null,

	init: function(id, name, elementType, sources, criteria, limit, storageKey)
	{
		this.id = id;
		this.name = name;
		this.elementType = elementType;
		this.sources = sources;
		this.criteria = criteria;
		this.limit = limit;
		this.storageKey = storageKey;

		this.$container = $('#'+this.id);
		this.$elementsContainer = this.$container.children('.elements');
		this.$elements = this.$elementsContainer.children();
		this.$addElementBtn = this.$container.children('.btn.add');

		this.totalElements = this.$elements.length;

		if (this.limit && this.totalElements >= this.limit)
		{
			this.$addElementBtn.addClass('disabled');
		}

		this.elementSelect = new Garnish.Select(this.$elements, {
			multi: true,
			filter: ':not(.delete)'
		});

		this.elementSort = new Garnish.DragSort({
			container: this.$elementsContainer,
			filter: $.proxy(function() {
				return this.elementSelect.getSelectedItems();
			}, this),
			caboose: $('<div class="caboose"/>'),
			onSortChange: $.proxy(function() {
				this.elementSelect.resetItemOrder();
			}, this)
		});

		this.initElements(this.$elements);

		this.addListener(this.$addElementBtn, 'activate', 'showModal');
	},

	initElements: function($elements)
	{
		this.elementSelect.addItems($elements);
		this.elementSort.addItems($elements);

		$elements.find('.delete').on('click', $.proxy(function(ev)
		{
			var $element = $(ev.currentTarget).closest('.element');

			this.$elements = this.$elements.not($element);
			this.elementSelect.removeItems($element);

			if (this.modal)
			{
				this.modal.elementIndex.enableElementsById($element.data('id'));
			}

			this.totalElements--;

			if (this.$addElementBtn)
			{
				this.$addElementBtn.removeClass('disabled');
			}

			$element.css('z-index', 0);

			$element.animate({
				marginLeft: -($element.outerWidth() + parseInt($element.css('margin-right'))),
				opacity: -1 // double speed!
			}, 'fast', function() {
				$element.remove();
			});

		}, this));
	},

	showModal: function()
	{
		// Make sure we haven't reached the limit
		if (this.limit && this.totalElements == this.limit)
		{
			return;
		}

		if (!this.modal)
		{
			var selectedElementIds = [];

			for (var i = 0; i < this.$elements.length; i++)
			{
				var $element = $(this.$elements[i]);
				selectedElementIds.push($element.data('id'));
			}

			this.modal = Craft.createElementSelectorModal(this.elementType, {
				storageKey: (this.storageKey ? 'BaseElementSelectInput.'+this.storageKey : null),
				sources: this.sources,
				criteria: this.criteria,
				multiSelect: true,
				disableOnSelect: true,
				disabledElementIds: selectedElementIds,
				onSelect: $.proxy(this, 'selectElements')
			});
		}
		else
		{
			this.modal.show();
		}
	},

	selectElements: function(elements)
	{
		this.elementSelect.deselectAll();

		if (this.limit)
		{
			var slotsLeft = this.limit - this.totalElements,
				max = Math.min(elements.length, slotsLeft);
		}
		else
		{
			var max = elements.length;
		}

		for (var i = 0; i < max; i++)
		{
			var element = elements[i],
				$newElement = element.$element.clone();

			// Make a couple tweaks
			$newElement.addClass('removable');
			$newElement.prepend('<input type="hidden" name="'+this.name+'[]" value="'+element.id+'">' +
				'<a class="delete icon" title="'+Craft.t('Remove')+'"></a>');

			$newElement.appendTo(this.$elementsContainer);

			// Animate it into place
			var origOffset = element.$element.offset(),
				destOffset = $newElement.offset();

			$newElement.css({
				left:   origOffset.left - destOffset.left,
				top:    origOffset.top - destOffset.top,
				zIndex: 10000
			});

			$newElement.animate({
				left: 0,
				top: 0
			}, function() {
				$(this).css('z-index', 1);
			});

			this.$elements = this.$elements.add($newElement);
			this.initElements($newElement);
		}

		this.totalElements += max;

		if (this.limit && this.totalElements == this.limit)
		{
			this.$addElementBtn.addClass('disabled');
		}
	}
});


/**
 * Element selector modal class
 */
Craft.BaseElementSelectorModal = Garnish.Modal.extend({

	elementType: null,
	elementIndex: null,
	elementSelect: null,

	$body: null,
	$selectBtn: null,
	$sidebar: null,
	$sources: null,
	$sourceToggles: null,
	$main: null,
	$search: null,
	$elements: null,
	$tbody: null,

	init: function(elementType, settings)
	{
		this.elementType = elementType;
		this.setSettings(settings, Craft.BaseElementSelectorModal.defaults);

		// Build the modal
		var $container = $('<div class="modal elementselectormodal"></div>').appendTo(Garnish.$bod),
			$body = $('<div class="body"><div class="spinner big"></div></div>').appendTo($container),
			$footer = $('<div class="footer"/>').appendTo($container),
			$buttons = $('<div class="buttons rightalign"/>').appendTo($footer),
			$cancelBtn = $('<div class="btn">'+Craft.t('Cancel')+'</div>').appendTo($buttons),
			$selectBtn = $('<div class="btn disabled submit">'+Craft.t('Select')+'</div>').appendTo($buttons);

		this.base($container, settings);

		this.$body = $body;
		this.$selectBtn = $selectBtn;

		this.addListener($cancelBtn, 'activate', 'cancel');
		this.addListener(this.$selectBtn, 'activate', 'selectElements');
	},

	onFadeIn: function()
	{
		if (!this.elementIndex)
		{
			// Get the modal body HTML based on the settings
			var data = {
				context:     'modal',
				elementType: this.elementType,
				sources:     this.settings.sources
			};

			Craft.postActionRequest('elements/getModalBody', data, $.proxy(function(response, textStatus) {

				if (textStatus == 'success')
				{
					this.$body.html(response);

					// Initialize the element index
					this.elementIndex = Craft.createElementIndex(this.elementType, this.$body, {
						context:            'modal',
						storageKey:         this.settings.storageKey,
						criteria:           this.settings.criteria,
						disabledElementIds: this.settings.disabledElementIds,
						onUpdateElements:   $.proxy(this, 'onUpdateElements'),
						onEnableElements:   $.proxy(this, 'onEnableElements'),
						onDisableElements:  $.proxy(this, 'onDisableElements')
					});
				}

			}, this));
		}
		else
		{
			// Auto-focus the Search box
			if (!Garnish.isMobileBrowser(true))
			{
				this.elementIndex.$search.focus();
			}
		}

		this.base();
	},

	onUpdateElements: function(appended)
	{
		if (!appended)
		{
			this.addListener(this.elementIndex.$elementContainer, 'dblclick', 'selectElements');
		}

		// Reset the element select
		if (this.elementSelect)
		{
			this.elementSelect.destroy();
			delete this.elementSelect;
		}

		if (this.elementIndex.getSelectedSourceState('mode') == 'structure')
		{
			var $items = this.elementIndex.$elementContainer.find('.row:not(.disabled)');
		}
		else
		{
			var $items = this.elementIndex.$elementContainer.children(':not(.disabled)');
		}

		this.elementSelect = new Garnish.Select(this.elementIndex.$elementContainer, $items, {
			multi: this.settings.multiSelect,
			vertical: (this.elementIndex.getSelectedSourceState('mode') != 'thumbs'),
			onSelectionChange: $.proxy(this, 'onSelectionChange')
		});

        this.elementIndex.setElementSelect(this.elementSelect);
    },

	onSelectionChange: function()
	{
		if (this.elementSelect.totalSelected)
		{
			this.$selectBtn.removeClass('disabled');
		}
		else
		{
			this.$selectBtn.addClass('disabled');
		}
	},

	onEnableElements: function($elements)
	{
		this.elementSelect.addItems($elements);
	},

	onDisableElements: function($elements)
	{
		this.elementSelect.removeItems($elements);
	},

	cancel: function()
	{
		this.hide();
		this.settings.onCancel();
	},

	selectElements: function()
	{
		if (this.elementIndex && this.elementSelect && this.elementSelect.totalSelected)
		{
			this.elementSelect.clearMouseUpTimeout();

			var $selectedItems = this.elementSelect.getSelectedItems(),
				elements = [];

			for (var i = 0; i < $selectedItems.length; i++)
			{
				var $item = $($selectedItems[i]),
					$element = $item.find('.element:first');

				elements.push({
					id:       $item.data('id'),
					label:    $item.data('label'),
					status:   $item.data('status'),
					url:      $element.data('url'),
					hasThumb: $element.hasClass('hasthumb'),
					$element: $element
				});
			}

			this.hide();
			this.settings.onSelect(elements);

			if (this.settings.disableOnSelect)
			{
				this.elementIndex.disableElements($selectedItems);
			}
		}
	}
},
{
	defaults: {
		storageKey: null,
		sources: null,
		criteria: null,
		multiSelect: false,
		disabledElementIds: [],
		disableOnSelect: false,
		onCancel: $.noop,
		onSelect: $.noop
	}
});


/**
 * Input Generator
 */
Craft.BaseInputGenerator = Garnish.Base.extend({

	$source: null,
	$target: null,
	settings: null,

	listening: null,
	timeout: null,

	init: function(source, target, settings)
	{
		this.$source = $(source);
		this.$target = $(target);
		this.setSettings(settings);

		this.startListening();
	},

	setNewSource: function(source)
	{
		var listening = this.listening;
		this.stopListening();

		this.$source = $(source);

		if (listening)
		{
			this.startListening();
		}
	},

	startListening: function()
	{
		if (this.listening)
		{
			return;
		}

		this.listening = true;

		this.addListener(this.$source, 'textchange', 'onTextChange');

		this.addListener(this.$target, 'focus', function() {
			this.addListener(this.$target, 'textchange', 'stopListening');
			this.addListener(this.$target, 'blur', function() {
				this.removeListener(this.$target, 'textchange,blur');
			});
		});
	},

	stopListening: function()
	{
		if (!this.listening)
		{
			return;
		}

		this.listening = false;

		this.removeAllListeners(this.$source);
		this.removeAllListeners(this.$target);
	},

	onTextChange: function()
	{
		if (this.timeout)
		{
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout($.proxy(this, 'updateTarget'), 250);
	},

	updateTarget: function()
	{
		var sourceVal = this.$source.val(),
			targetVal = this.generateTargetValue(sourceVal);

		this.$target.val(targetVal);
	},

	generateTargetValue: function(sourceVal)
	{
		return sourceVal;
	}
});


/**
 * Admin table class
 */
Craft.AdminTable = Garnish.Base.extend({

	settings: null,
	totalObjects: null,
	sorter: null,

	$noObjects: null,
	$table: null,
	$tbody: null,
	$deleteBtns: null,

	init: function(settings)
	{
		this.setSettings(settings, Craft.AdminTable.defaults);

		if (!this.settings.allowDeleteAll)
		{
			this.settings.minObjects = 1;
		}

		this.$noObjects = $(this.settings.noObjectsSelector);
		this.$table = $(this.settings.tableSelector);
		this.$tbody  = this.$table.children('tbody');
		this.totalObjects = this.$tbody.children().length;

		if (this.settings.sortable)
		{
			this.sorter = new Craft.DataTableSorter(this.$table, {
				onSortChange: $.proxy(this, 'reorderObjects')
			});
		}

		this.$deleteBtns = this.$table.find('.delete');
		this.addListener(this.$deleteBtns, 'click', 'deleteObject');

		this.updateUI();
	},

	addRow: function(row)
	{
		if (this.settings.maxObjects && this.totalObjects >= this.settings.maxObjects)
		{
			// Sorry pal.
			return;
		}

		var $row = $(row).appendTo(this.$tbody),
			$deleteBtn = $row.find('.delete');

		if (this.settings.sortable)
		{
			this.sorter.addItems($row);
		}

		this.$deleteBtns = this.$deleteBtns.add($deleteBtn);

		this.addListener($deleteBtn, 'click', 'deleteObject');
		this.totalObjects++;

		this.updateUI();
	},

	reorderObjects: function()
	{
		if (!this.settings.sortable)
		{
			return false;
		}

		// Get the new field order
		var ids = [];

		for (var i = 0; i < this.sorter.$items.length; i++)
		{
			var id = $(this.sorter.$items[i]).attr(this.settings.idAttribute);
			ids.push(id);
		}

		// Send it to the server
		var data = {
			ids: JSON.stringify(ids)
		};

		Craft.postActionRequest(this.settings.reorderAction, data, $.proxy(function(response, textStatus) {

			if (textStatus == 'success')
			{
				if (response.success)
				{
					Craft.cp.displayNotice(Craft.t(this.settings.reorderSuccessMessage));
				}
				else
				{
					Craft.cp.displayError(Craft.t(this.settings.reorderFailMessage));
				}
			}

		}, this));
	},

	deleteObject: function(event)
	{
		if (this.settings.minObjects && this.totalObjects <= this.settings.minObjects)
		{
			// Sorry pal.
			return;
		}

		var $row = $(event.target).closest('tr'),
			id = $row.attr(this.settings.idAttribute),
			name = $row.attr(this.settings.nameAttribute);

		if (this.confirmDeleteObject($row))
		{
			Craft.postActionRequest(this.settings.deleteAction, { id: id }, $.proxy(function(response, textStatus) {

				if (textStatus == 'success')
				{
					if (response.success)
					{
						$row.remove();
						this.totalObjects--;
						this.updateUI();
						this.onDeleteObject(id);

						Craft.cp.displayNotice(Craft.t(this.settings.deleteSuccessMessage, { name: name }));
					}
					else
					{
						Craft.cp.displayError(Craft.t(this.settings.deleteFailMessage, { name: name }));
					}
				}

			}, this));
		}
	},

	confirmDeleteObject: function($row)
	{
		var name = $row.attr(this.settings.nameAttribute);
		return confirm(Craft.t(this.settings.confirmDeleteMessage, { name: name }));
	},

	onDeleteObject: function(id)
	{
		this.settings.onDeleteObject(id);
	},

	updateUI: function()
	{
		// Show the "No Whatever Exists" message if there aren't any
		if (this.totalObjects == 0)
		{
			this.$table.hide();
			this.$noObjects.removeClass('hidden');
		}
		else
		{
			this.$table.show();
			this.$noObjects.addClass('hidden');
		}

		// Disable the sort buttons if there's only one row
		if (this.settings.sortable)
		{
			var $moveButtons = this.$table.find('.move');

			if (this.totalObjects == 1)
			{
				$moveButtons.addClass('disabled');
			}
			else
			{
				$moveButtons.removeClass('disabled');
			}
		}

		// Disable the delete buttons if we've reached the minimum objects
		if (this.settings.minObjects && this.totalObjects <= this.settings.minObjects)
		{
			this.$deleteBtns.addClass('disabled');
		}
		else
		{
			this.$deleteBtns.removeClass('disabled');
		}

		// Hide the New Whatever button if we've reached the maximum objects
		if (this.settings.newObjectBtnSelector)
		{
			if (this.settings.maxObjects && this.totalObjects >= this.settings.maxObjects)
			{
				$(this.settings.newObjectBtnSelector).addClass('hidden');
			}
			else
			{
				$(this.settings.newObjectBtnSelector).removeClass('hidden');
			}
		}
	}
},
{
	defaults: {
		tableSelector: null,
		noObjectsSelector: null,
		newObjectBtnSelector: null,
		idAttribute: 'data-id',
		nameAttribute: 'data-name',
		sortable: false,
		allowDeleteAll: true,
		minObjects: 0,
		maxObjects: null,
		reorderAction: null,
		deleteAction: null,
		reorderSuccessMessage: Craft.t('New order saved.'),
		reorderFailMessage:    Craft.t('Couldn’t save new order.'),
		confirmDeleteMessage:  Craft.t('Are you sure you want to delete “{name}”?'),
		deleteSuccessMessage:  Craft.t('“{name}” deleted.'),
		deleteFailMessage:     Craft.t('Couldn’t delete “{name}”.'),
		onDeleteObject: $.noop
	}
});


/**
 * Asset index class
 */
Craft.AssetIndex = Craft.BaseElementIndex.extend({

	$buttons: null,
	$uploadButton: null,
	$progressBar: null,
	$folders: null,
	$previouslySelectedFolder: null,

	uploader: null,
	promptHandler: null,
	progressBar: null,

	initialSourceKey: null,
	isIndexBusy: false,
	_uploadTotalFiles: 0,
	_uploadFileProgress: {},
	_uploadedFileIds: [],
	_selectedFileIds: [],

	_singleFileMenu: null,
	_multiFileMenu: null,

	_fileDrag: null,
	_folderDrag: null,
	_expandDropTargetFolderTimeout: null,
	_tempExpandedFolders: [],

	init: function(elementType, $container, settings)
	{
		this.base(elementType, $container, settings);

		if (this.settings.context == 'index')
		{
			this.initIndexMode();
		}
	},

	/**
	 * Full blown Assets.
	 */
	initIndexMode: function ()
	{
		// Context menus for the folders
		var assetIndex = this;

		// ---------------------------------------
		// File dragging
		// ---------------------------------------
		this._fileDrag = new Garnish.DragDrop({
			activeDropTargetClass: 'sel assets-fm-dragtarget',
			helperOpacity: 0.5,

			filter: $.proxy(function()
			{
				return this.elementSelect.getSelectedItems();
			}, this),

			helper: $.proxy(function($file)
			{
				return this._getDragHelper($file);
			}, this),

			dropTargets: $.proxy(function()
			{
				var targets = [];

				this.$sources.each(function ()
				{
					targets.push($(this));
				});

				return targets;
			}, this),

			onDragStart: $.proxy(function()
			{
				this._tempExpandedFolders = [];

				this.$previouslySelectedFolder = this.$source.removeClass('sel');

			}, this),

			onDropTargetChange: $.proxy(this, '_onDropTargetChange'),

			onDragStop: $.proxy(this, '_onFileDragStop')
		});

		// ---------------------------------------
		// Folder dragging
		// ---------------------------------------
		this._folderDrag = new Garnish.DragDrop({
			activeDropTargetClass: 'sel assets-fm-dragtarget',
			helperOpacity: 0.5,

			filter: $.proxy(function()
			{
				// return each of the selected <a>'s parent <li>s, except for top level drag attampts.
				var $selected = this.sourceSelect.getSelectedItems(),
					draggees = [];
				for (var i = 0; i < $selected.length; i++)
				{

					var $source = $($selected[i]).parent();
					if ($source.parents('ul').length > 1)
					{
						draggees.push($source[0]);
					}
				}

				return $(draggees);
			}, this),

			helper: $.proxy(function($folder)
			{
				var $helper = $('<ul class="assets-fm-folderdrag" />').append($folder);

				// collapse this folder
				$folder.removeClass('expanded');

				// set the helper width to the folders container width
				$helper.width(this.$sidebar[0].scrollWidth);

				return $helper;
			}, this),

			dropTargets: $.proxy(function()
			{
				var targets = [];

				this.$sources.each(function ()
				{
				   if (!$(this).is(assetIndex._folderDrag.$draggee))
				   {
					   targets.push($(this));
				   }
				});

				return targets;
			}, this),

			onDragStart: $.proxy(function()
			{
				this._tempExpandedFolders = [];

				// hide the expanded draggees' subfolders
				this._folderDrag.$draggee.filter('.expanded').removeClass('expanded').addClass('expanded-tmp')
			}, this),

			onDropTargetChange: $.proxy(this, '_onDropTargetChange'),

			onDragStop: $.proxy(this, '_onFolderDragStop')
		});

		this.$sources.each(function () {
			assetIndex._createFolderContextMenu.apply(assetIndex, $(this));
			if ($(this).parents('ul').length > 1)
			{
				assetIndex._folderDrag.addItems($(this).parent());
			}
		});
	},

	_onFileDragStop: function ()
	{
		if (this._fileDrag.$activeDropTarget)
		{
			// keep it selected
			this._fileDrag.$activeDropTarget.addClass('sel');

			var targetFolderId = this._getFolderIdFromSourceKey(this._fileDrag.$activeDropTarget.data('key'));
			var originalFileIds = [],
				newFileNames = [];


			// For each file, prepare array data.
			for (var i = 0; i < this._fileDrag.$draggee.length; i++)
			{
				var originalFileId = this._fileDrag.$draggee[i].getAttribute('data-id'),
					fileName = $(this._fileDrag.$draggee[i]).find('[data-url]').attr('data-url').split('/').pop();

				originalFileIds.push(originalFileId);
				newFileNames.push(fileName);
			}

			// are any files actually getting moved?
			if (originalFileIds.length)
			{
				this.setIndexBusy();
				this.progressBar.resetProgressBar();
				this.progressBar.setItemCount(originalFileIds.length);
				this.progressBar.showProgressBar();


				// for each file to move a separate request
				var parameterArray = [];
				for (i = 0; i < originalFileIds.length; i++)
				{
					parameterArray.push({
						fileId: originalFileIds[i],
						folderId: targetFolderId,
						fileName: newFileNames[i]
					});
				}

				// define the callback for when all file moves are complete
				var onMoveFinish = $.proxy(function(responseArray)
				{
					this.promptHandler.resetPrompts();

					// loop trough all the responses
					for (var i = 0; i < responseArray.length; i++)
					{
						var data = responseArray[i];

						// push prompt into prompt array
						if (data.prompt)
						{
							this.promptHandler.addPrompt(data);
						}

						if (data.error)
						{
							alert(data.error);
						}
					}

					this.setIndexAvailable();
					this.progressBar.hideProgressBar();

					if (this.promptHandler.getPromptCount())
					{
						// define callback for completing all prompts
						var promptCallback = $.proxy(function(returnData)
						{
							var newParameterArray = [];

							// loop trough all returned data and prepare a new request array
							for (var i = 0; i < returnData.length; i++)
							{
								if (returnData[i].choice == 'cancel')
								{
									continue;
								}

								// find the matching request parameters for this file and modify them slightly
								for (var ii = 0; ii < parameterArray.length; ii++)
								{
									if (parameterArray[ii].fileName == returnData[i].fileName)
									{
										parameterArray[ii].action = returnData[i].choice;
										newParameterArray.push(parameterArray[ii]);
									}
								}
							}

							// nothing to do, carry on
							if (newParameterArray.length == 0)
							{
								this._selectSourceByFolderId(targetFolderId);
							}
							else
							{
								// start working
								this.setIndexBusy();
								this.progressBar.resetProgressBar();
								this.progressBar.setItemCount(this.promptHandler.getPromptCount());
								this.progressBar.showProgressBar();

								// move conflicting files again with resolutions now
								this._moveFile(newParameterArray, 0, onMoveFinish);
							}
						}, this);

						this._fileDrag.fadeOutHelpers();
						this.promptHandler.showBatchPrompts(promptCallback);
					}
					else
					{
						this._fileDrag.fadeOutHelpers();
						this._selectSourceByFolderId(targetFolderId);
					}
				}, this);

				// initiate the file move with the built array, index of 0 and callback to use when done
				this._moveFile(parameterArray, 0, onMoveFinish);

				// skip returning dragees
				return;
			}
		}
		else
		{
			this._collapseExtraExpandedFolders();
		}

		// re-select the previously selected folders
		this.$previouslySelectedFolder.addClass('sel');

		this._fileDrag.returnHelpersToDraggees();
	},

	_onFolderDragStop: function ()
	{
		// show the expanded draggees' subfolders
		this._folderDrag.$draggee.filter('.expanded-tmp').removeClass('expanded-tmp').addClass('expanded');

		// Only move if we have a valid target and we're not trying to move into our direct parent
		if (
			this._folderDrag.$activeDropTarget
				&& this._folderDrag.$activeDropTarget.siblings('ul').find('>li').filter(this._folderDrag.$draggee).length == 0)
		{

			var targetFolderId = this._getFolderIdFromSourceKey(this._folderDrag.$activeDropTarget.data('key'));

			this._collapseExtraExpandedFolders(targetFolderId);

			// get the old folder IDs, and sort them so that we're moving the most-nested folders first
			var folderIds = [];

			for (var i = 0; i < this._folderDrag.$draggee.length; i++)
			{
				var $a = $('> a', this._folderDrag.$draggee[i]),
					folderId = this._getFolderIdFromSourceKey($a.data('key')),
					$source = this._getSourceByFolderId(folderId);

				// make sure it's not already in the target folder
				if (this._getFolderIdFromSourceKey(this._getParentSource($source).data('key')) != targetFolderId)
				{
					folderIds.push(folderId);
				}
			}

			if (folderIds.length)
			{
				folderIds.sort();
				folderIds.reverse();

				this.setIndexBusy();
				this.progressBar.resetProgressBar();
				this.progressBar.setItemCount(folderIds.length);
				this.progressBar.showProgressBar();

				var responseArray = [];
				var parameterArray = [];

				for (var i = 0; i < folderIds.length; i++)
				{
					parameterArray.push({
						folderId: folderIds[i],
						parentId: targetFolderId
					});
				}

				// increment, so to avoid displaying folder files that are being moved
				this.requestId++;

				/*
				 Here's the rundown:
				 1) Send all the folders being moved
				 2) Get results:
				   a) For all conflicting, receive prompts and resolve them to get:
				   b) For all valid move operations: by now server has created the needed folders
					  in target destination. Server returns an array of file move operations
				   c) server also returns a list of all the folder id changes
				   d) and the data-id of node to be removed, in case of conflict
				   e) and a list of folders to delete after the move
				 3) From data in 2) build a large file move operation array
				 4) Create a request loop based on this, so we can display progress bar
				 5) when done, delete all the folders and perform other maintenance
				 6) Champagne
				 */

				// this will hold the final list of files to move
				var fileMoveList = [];

				// these folders have to be deleted at the end
				var folderDeleteList = [];

				// this one tracks the changed folder ids
				var changedFolderIds = {};

				var removeFromTree = [];

				var onMoveFinish = $.proxy(function(responseArray)
				{
					this.promptHandler.resetPrompts();

					// loop trough all the responses
					for (var i = 0; i < responseArray.length; i++)
					{
						var data = responseArray[i];

						// if succesful and have data, then update
						if (data.success)
						{
							if (data.transferList && data.deleteList && data.changedFolderIds)
							{
								for (var ii = 0; ii < data.transferList.length; ii++)
								{
									fileMoveList.push(data.transferList[ii]);
								}
								for (var ii = 0; ii < data.deleteList.length; ii++)
								{
									folderDeleteList.push(data.deleteList[ii]);
								}
								for (var oldFolderId in data.changedFolderIds)
								{
									changedFolderIds[oldFolderId] = data.changedFolderIds[oldFolderId];
								}
								removeFromTree.push(data.removeFromTree);
							}
						}

						// push prompt into prompt array
						if (data.prompt)
						{
							this.promptHandler.addPrompt(data);
						}

						if (data.error)
						{
							alert(data.error);
						}
					}

					if (this.promptHandler.getPromptCount())
					{
						// define callback for completing all prompts
						var promptCallback = $.proxy(function(returnData)
						{
							this.promptHandler.resetPrompts();
							this.setNewElementDataHtml('');

							var newParameterArray = [];

							// loop trough all returned data and prepare a new request array
							for (var i = 0; i < returnData.length; i++)
							{
								if (returnData[i].choice == 'cancel')
								{
									continue;
								}

								parameterArray[0].action = returnData[i].choice;
								newParameterArray.push(parameterArray[0]);

							}

							// start working on them lists, baby
							if (newParameterArray.length == 0)
							{
								$.proxy(this, '_performActualFolderMove', fileMoveList, folderDeleteList, changedFolderIds, removeFromTree)();
							}
							else
							{
								// start working
								this.setIndexBusy();
								this.progressBar.resetProgressBar();
								this.progressBar.setItemCount(this.promptHandler.getPromptCount());
								this.progressBar.showProgressBar();

								// move conflicting files again with resolutions now
								moveFolder(newParameterArray, 0, onMoveFinish);
							}
						}, this);

						this.promptHandler.showBatchPrompts(promptCallback);

						this.setIndexAvailable();
						this.progressBar.hideProgressBar();
					}
					else
					{
						$.proxy(this, '_performActualFolderMove', fileMoveList, folderDeleteList, changedFolderIds, removeFromTree, targetFolderId)();
					}

				}, this);

				var moveFolder = $.proxy(function(parameterArray, parameterIndex, callback)
				{
					if (parameterIndex == 0)
					{
						responseArray = [];
					}

					Craft.postActionRequest('assets/moveFolder', parameterArray[parameterIndex], $.proxy(function(data, textStatus) {

						parameterIndex++;
						this.progressBar.incrementProcessedItemCount(1);
						this.progressBar.updateProgressBar();

						if (textStatus == 'success')
						{
							responseArray.push(data);
						}

						if (parameterIndex >= parameterArray.length)
						{
							callback(responseArray);
						}
						else
						{
							moveFolder(parameterArray, parameterIndex, callback);
						}

					}, this));
				}, this);

				// initiate the folder move with the built array, index of 0 and callback to use when done
				moveFolder(parameterArray, 0, onMoveFinish);

				// skip returning dragees until we get the Ajax response
				return;
			}
		}
		else
		{
			this._collapseExtraExpandedFolders();
		}

		this._folderDrag.returnHelpersToDraggees();
	},

	/**
	 * Really move the folder. Like really. For real.
	 */
	_performActualFolderMove: function (fileMoveList, folderDeleteList, changedFolderIds, removeFromTree, targetFolderId)
	{
		this.setIndexBusy();
		this.progressBar.resetProgressBar();
		this.progressBar.setItemCount(1);
		this.progressBar.showProgressBar();


		var moveCallback = $.proxy(function(folderDeleteList, changedFolderIds, removeFromTree)
		{
			//Move the folders around in the tree
			var topFolderLi = $();
			var folderToMove = $();
			var topMovedFolderId = 0;

			// Change the folder ids
			for (var previousFolderId in changedFolderIds)
			{
				folderToMove = this._getSourceByFolderId(previousFolderId);

				// Change the id and select the containing element as the folder element.
				folderToMove = folderToMove
									.attr('data-key', 'folder:' + changedFolderIds[previousFolderId].newId)
									.data('key', 'folder:' + changedFolderIds[previousFolderId].newId).parent();

				if (topFolderLi.length == 0 || topFolderLi.parents().filter(folderToMove).length > 0)
				{
					topFolderLi = folderToMove;
					topFolderMovedId = changedFolderIds[previousFolderId].newId;
				}
			}

			if (topFolderLi.length == 0)
			{
				this.setIndexAvailable();
				this.progressBar.hideProgressBar();
				this._folderDrag.returnHelpersToDraggees();

				return;
			}

			var topFolder = topFolderLi.find('>a');

			// Now move the uppermost node.
			var siblings = topFolderLi.siblings('ul, .toggle');
			var parentSource = this._getParentSource(topFolder);

			var newParent = this._getSourceByFolderId(targetFolderId);
			this._prepareParentForChildren(newParent);
			this._addSubfolder(newParent, topFolderLi);

			topFolder.after(siblings);

			this._cleanUpTree(parentSource);
			this.$sidebar.find('ul>ul, ul>.toggle').remove();

			// delete the old folders
			for (var i = 0; i < folderDeleteList.length; i++)
			{
				Craft.postActionRequest('assets/deleteFolder', {folderId: folderDeleteList[i]});
			}

			this.setIndexAvailable();
			this.progressBar.hideProgressBar();
			this._folderDrag.returnHelpersToDraggees();
			this._selectSourceByFolderId(topFolderMovedId);

		}, this);

		if (fileMoveList.length > 0)
		{
			this._moveFile(fileMoveList, 0, $.proxy(function()
			{
				moveCallback(folderDeleteList, changedFolderIds, removeFromTree);
			}, this));
		}
		else
		{
			moveCallback(folderDeleteList, changedFolderIds, removeFromTree);
		}
	},

	/**
	 * Get parent source for a source.
	 * @param $source
	 * @returns {*}
	 * @private
	 */
	_getParentSource: function ($source)
	{
		if ($source.parents('ul').length == 1)
		{
			return null;
		}
		return $source.parent().parent().siblings('a');
	},

	/**
	 * Move a file using data from a parameter array.
	 *
	 * @param parameterArray
	 * @param parameterIndex
	 * @param callback
	 * @private
	 */
	_moveFile: function (parameterArray, parameterIndex, callback)
	{
		if (parameterIndex == 0)
		{
			this.responseArray = [];
		}

		Craft.postActionRequest('assets/moveFile', parameterArray[parameterIndex], $.proxy(function(data, textStatus) {

			this.progressBar.incrementProcessedItemCount(1);
			this.progressBar.updateProgressBar();

			if (textStatus == 'success')
			{
				this.responseArray.push(data);
			}

			parameterIndex++;

			if (parameterIndex >= parameterArray.length)
			{
				callback(this.responseArray);
			}
			else
			{
				this._moveFile(parameterArray, parameterIndex, callback);
			}

		}, this));
	},

	_selectSourceByFolderId: function (targetFolderId)
	{
		var targetSource = this._getSourceByFolderId(targetFolderId);

		// Make sure that all the parent sources are expanded and this source is visible.
		var parentSources = targetSource.parent().parents('li');
		parentSources.each(function () {
			if (!$(this).hasClass('expanded'))
			{
				$(this).find('> .toggle').click();
			}
		});

		this.selectSource(targetSource);
		this.updateElements();
	},

	/**
	 * Initialize the uploader.
	 *
	 * @private
	 */
	onAfterHtmlInit: function ()
	{
		if (!this.$buttons)
		{
			this.$buttons = $('<div class="buttons"></div>').prependTo(this.$sidebar);
		}

		if (!this.$uploadButton)
		{
			this.$uploadButton = $('<div class="assets-upload"></div>').prependTo(this.$buttons);
		}

		if (!this.$progressBar)
		{
			this.$progressBar = $('<div class="assets-uploadprogress hidden"><div class="assets-progressbar"><div class="assets-pb-bar"></div></div></div>').appendTo(this.$main);
		}

		this.promptHandler = new Craft.PromptHandler();
		this.progressBar = new Craft.ProgressBar(this.$progressBar);

		var uploaderCallbacks = {
			onSubmit:     $.proxy(this, '_onUploadSubmit'),
			onProgress:   $.proxy(this, '_onUploadProgress'),
			onComplete:   $.proxy(this, '_onUploadComplete')
		};

		this.uploader = new Craft.Uploader (this.$uploadButton, uploaderCallbacks);

		this.base();
	},

	onSelectSource: function()
	{
		this.uploader.setParams({folderId: this._getFolderIdFromSourceKey(this.sourceKey)});

		this.base();
	},

	_getFolderIdFromSourceKey: function (sourceKey)
	{
		return sourceKey.split(':')[1];
	},

	/**
	 * React on upload submit.
	 *
	 * @param id
	 * @private
	 */
	_onUploadSubmit: function(id) {
		// prepare an upload batch
		if (! this.uploader.getInProgress()) {

			this.setIndexBusy();

			// Initial values
			this.progressBar.resetProgressBar();
			this.progressBar.showProgressBar();
			this._uploadFileProgress = {};
			this._uploadedFileIds = [];
			this._uploadTotalFiles = 1;
		}
		else
		{
			this._uploadTotalFiles++;
		}

		// Prepare tracking
		this._uploadFileProgress[id] = 0;

	},

	/**
	 * Update uploaded byte count.
	 */
	_onUploadProgress: function(id, fileName, loaded, total) {
		this._uploadFileProgress[id] = loaded / total;
		this._updateUploadProgress();
	},

	/**
	 * Update Progress Bar.
	 */
	_updateUploadProgress: function() {
		var totalPercent = 0;

		for (var id in this._uploadFileProgress) {
			totalPercent += this._uploadFileProgress[id];
		}

		var width = Math.round(100 * totalPercent / this._uploadTotalFiles) + '%';
		this.progressBar.setProgressPercentage(width);
	},

	/**
	 * On Upload Complete.
	 */
	_onUploadComplete: function(id, fileName, response) {
		this._uploadFileProgress[id] = 1;
		this._updateUploadProgress();
		var doReload = true;

		if (response.success || response.prompt) {

			// TODO respect the select settings regarding limits
			// Add the uploaded file to the selected ones, if appropriate
			this._uploadedFileIds.push(response.fileId);

			// If there is a prompt, add it to the queue
			if (response.prompt)
			{
				this.promptHandler.addPrompt(response);
			}
		}
		else
		{
			alert(Craft.t('Upload failed for {filename}', { filename: fileName }));
			doReload = false;
		}

		// for the last file, display prompts, if any. If not - just update the element view.
		if (! this.uploader.getInProgress()) {

			this.setIndexAvailable();
			this.progressBar.hideProgressBar();

			if (this.promptHandler.getPromptCount())
			{
				this.promptHandler.showBatchPrompts($.proxy(this, '_uploadFollowup'));
			}
			else
			{
				if (doReload)
				{
					this.updateElements();
				}

			}
		}
	},

	/**
	 * Follow up to an upload that triggered at least one conflict resolution prompt.
	 *
	 * @param returnData
	 * @private
	 */
	_uploadFollowup: function(returnData)
	{
		this.setIndexBusy();
		this.progressBar.resetProgressBar();

		this.promptHandler.resetPrompts();

		var finalCallback = $.proxy(function()
		{
			this.setIndexBusy();
			this.progressBar.hideProgressBar();
			this.updateElements();
		}, this);

		this.progressBar.setItemCount(returnData.length);

		var doFollowup = $.proxy(function(parameterArray, parameterIndex, callback)
		{
			var postData = {
				additionalInfo: parameterArray[parameterIndex].additionalInfo,
				fileName:       parameterArray[parameterIndex].fileName,
				userResponse:   parameterArray[parameterIndex].choice
			};

			Craft.postActionRequest('assets/uploadFile', postData, $.proxy(function(data, textStatus) {

				if (textStatus == 'success' && data.fileId)
				{
					this._uploadedFileIds.push(data.fileId);
				}
				parameterIndex++;
				this.progressBar.incrementProcessedItemCount(1);
				this.progressBar.updateProgressBar();

				if (parameterIndex == parameterArray.length)
				{
					callback();
				}
				else
				{
					doFollowup(parameterArray, parameterIndex, callback);
				}
			}, this));

		}, this);

		doFollowup(returnData, 0, finalCallback);
	},

	/**
	 * Perform actions after updating elements
	 * @private
	 */
	onUpdateElements: function (append)
	{
		this.base(append)

		if (this.settings.context == 'index')
		{
			$elements = this.$elementContainer.children(':not(.disabled)');
			this._initElementSelect($elements);
			this._attachElementEvents($elements);
			this._initElementDragger($elements);
		}

		// See if we have freshly uploaded files to add to selection
		if (this._uploadedFileIds.length)
		{
			var item = null;
			for (var i = 0; i < this._uploadedFileIds.length; i++)
			{
				item = this.$main.find('[data-id=' + this._uploadedFileIds[i] + ']:first');
				this.elementSelect.selectItem(item);
			}

			// Reset the list.
			this._uploadedFileIds = [];
		}
	},

	_initElementSelect: function ($children)
	{

		if (typeof this.elementSelect == "object" && this.elementSelect != null)
		{
			this.elementSelect.destroy();
			delete this.elementSelect;
		}

		var elementSelect = new Garnish.Select(this.$elementContainer, $children, {
			multi: true,
			vertical: (this.getSelectedSourceState('mode') == 'table'),
			onSelectionChange: $.proxy(this, '_onElementSelectionChange')
		});

		this.setElementSelect(elementSelect);
	},

	_onElementSelectionChange: function ()
	{
		this._enableElementContextMenu();
		var selected = this.elementSelect.getSelectedItems();
		this._selectedFileIds = [];
		for (var i = 0; i < selected.length; i++)
		{
			this._selectedFileIds[i] = $(selected[i]).attr('data-id');
		}
	},

	_attachElementEvents: function ($elements)
	{
		// Doubleclick opens the HUD for editing
		this.removeListener($elements, 'dlbclick');
		this.addListener($elements, 'dblclick', $.proxy(this, '_editProperties'));

		// Context menus
		this._destroyElementContextMenus();
		this._createElementContextMenus($elements);
	},

	_initElementDragger: function ($elements)
	{
		this._fileDrag.removeAllItems();
		this._fileDrag.addItems($elements);
	},

	_editProperties: function (event)
	{
		var $target = $(event.currentTarget);
        if (this.getSelectedSourceState('mode') == 'table')
        {
            $target = $target.find('.element');
        }

		if (!$target.data('ElementEditor'))
		{
			var settings = {
				elementId: $target.attr('data-id'),
				$trigger: $target,
				loadContentAction: 'assets/editFileContent',
				saveContentAction: 'assets/saveFileContent'
			};
			$target.data('ElementEditor', new Craft.ElementEditor(settings));
		}

		$target.data('ElementEditor').show();
	},

	_createElementContextMenus: function ($elements)
	{
		var settings = {menuClass: 'menu assets-contextmenu'};

		var menuOptions = [{ label: Craft.t('View file'), onClick: $.proxy(this, '_viewFile') }];
		menuOptions.push({ label: Craft.t('Edit properties'), onClick: $.proxy(this, '_showProperties') });
		menuOptions.push({ label: Craft.t('Rename file'), onClick: $.proxy(this, '_renameFile') });
		menuOptions.push({ label: Craft.t('Copy reference tag'), onClick: $.proxy(this, '_copyRefTag') });
		menuOptions.push('-');
		menuOptions.push({ label: Craft.t('Delete file'), onClick: $.proxy(this, '_deleteFile') });
		this._singleFileMenu = new Garnish.ContextMenu($elements, menuOptions, settings);

		menuOptions = [{ label: Craft.t('Delete'), onClick: $.proxy(this, '_deleteFiles') }];
		this._multiFileMenu = new Garnish.ContextMenu($elements, menuOptions, settings);

		this._enableElementContextMenu();
	},

	_destroyElementContextMenus: function ()
	{
		if (this._singleFileMenu !== null)
		{
			this._singleFileMenu.destroy();
		}
		if (this._multiFileMenu !== null)
		{
			this._singleFileMenu.destroy();
		}
	},

	_enableElementContextMenu: function ()
	{
		this._multiFileMenu.disable();
		this._singleFileMenu.disable();

		if (this.elementSelect.getTotalSelected() == 1)
		{
			this._singleFileMenu.enable();
		}
		else if (this.elementSelect.getTotalSelected() > 1)
		{
			this._multiFileMenu.enable();
		}
	},

	_showProperties: function (event)
	{
		$(event.currentTarget).dblclick();
	},

	_viewFile: function (event)
	{
		window.open($(event.currentTarget).find('[data-url]').attr('data-url'));
	},

	/**
	 * Rename File
	 */
	_renameFile: function(event)
	{
		var $target = $(event.currentTarget);
		var fileId = $target.attr('data-id'),
			oldName = $target.find('[data-url]').attr('data-url').split('/').pop(),
			newName = prompt(Craft.t("Rename file"), oldName);

		if (newName && newName != oldName)
		{
			this.setIndexBusy();

			var postData = {
				fileId:   fileId,
				folderId: this._getFolderIdFromSourceKey(this.$source.data('key')),
				fileName: newName
			};

			var handleRename = function(data, textStatus)
			{
				this.setIndexAvailable();

				this.promptHandler.resetPrompts();
				if (textStatus == 'success')
				{
					if (data.prompt)
					{
						this.promptHandler.addPrompt(data);

						var callback = $.proxy(function (choice) {
							choice = choice[0].choice;
							if (choice != 'cancel')
							{
								postData.action = choice;
								Craft.postActionRequest('assets/moveFile', postData, $.proxy(handleRename, this));
							}
						}, this);

						this.promptHandler.showBatchPrompts(callback);
					}

					if (data.success)
					{
						this.updateElements();
					}

					if (data.error)
					{
						alert(data.error);
					}
				}
			};

			Craft.postActionRequest('assets/moveFile', postData, $.proxy(handleRename, this));
		}
	},

	_copyRefTag: function(event)
	{
		var message = Craft.t('{ctrl}C to copy.', {
			ctrl: (navigator.appVersion.indexOf('Mac') ? '⌘' : 'Ctrl-')
		});

		prompt(message, '{asset:'+$(event.currentTarget).data('id')+'}');
	},

	/**
	 * Delete a file
	 */
	_deleteFile: function (event) {

		var $target = $(event.currentTarget);
		var fileId = $target.attr('data-id');

		var fileName = $target.attr('data-label');

		if (confirm(Craft.t('Are you sure you want to delete “{name}”?', { name: fileName })))
		{
			if ($target.data('AssetEditor'))
			{
				$target.data('AssetEditor').removeHud();
			}

			this.setIndexBusy();

			Craft.postActionRequest('assets/deleteFile', {fileId: fileId}, $.proxy(function(data, textStatus) {

				this.setIndexAvailable();

				if (textStatus == 'success')
				{
					if (data.error)
					{
						alert(data.error);
					}

					this.updateElements();

				}

			}, this));
		}
	},

	/**
	 * Delete multiple files.
	 */
	_deleteFiles: function () {

		if (confirm(Craft.t("Are you sure you want to delete these {number} files?", {number: this.elementSelect.getTotalSelected()})))
		{
			this.setIndexBusy();

			var postData = {};

			for (var i = 0; i < this._selectedFileIds.length; i++)
			{
				postData['fileId['+i+']'] = this._selectedFileIds[i];
			}

			Craft.postActionRequest('assets/deleteFile', postData, $.proxy(function(data, textStatus) {

				this.setIndexAvailable();

				if (textStatus == 'success')
				{
					if (data.error)
					{
						alert(data.error);
					}

					this.updateElements();
				}

			}, this));
		}
	},

	_getDragHelper: function ($element)
	{
		var currentView = this.getSelectedSourceState('mode');
		switch (currentView)
		{
			case 'table':
			{
				var $container = $('<div class="assets-listview assets-lv-drag" />'),
					$table = $('<table cellpadding="0" cellspacing="0" border="0" />').appendTo($container),
					$tbody = $('<tbody />').appendTo($table);

				$table.width(this.$table.width());
				$tbody.append($element);

				return $container;
			}
			case 'thumbs':
			{
				return $('<ul class="thumbsview assets-tv-drag" />').append($element.removeClass('sel'));
			}
		}

		return $();
	},

	/**
	 * On Drop Target Change
	 */
	_onDropTargetChange: function($dropTarget)
	{
		clearTimeout(this._expandDropTargetFolderTimeout);

		if ($dropTarget)
		{
			var folderId = this._getFolderIdFromSourceKey($dropTarget.data('key'));

			if (folderId)
			{
				this.dropTargetFolder = this._getSourceByFolderId(folderId);

				if (this._hasSubfolders(this.dropTargetFolder) && ! this._isExpanded(this.dropTargetFolder))
				{
					this._expandDropTargetFolderTimeout = setTimeout($.proxy(this, '_expandFolder'), 500);
				}
			}
			else
			{
				this.dropTargetFolder = null;
			}
		}
	},

	/**
	 * Collapse Extra Expanded Folders
	 */
	_collapseExtraExpandedFolders: function(dropTargetFolderId)
	{

		clearTimeout(this._expandDropTargetFolderTimeout);

		// If a source id is passed in, exclude it's parents
		if (dropTargetFolderId)
		{
			var excluded = this._getSourceByFolderId(dropTargetFolderId).parents('li').find('>a');
		}

		for (var i = this._tempExpandedFolders.length-1; i >= 0; i--)
		{
			var source = this._tempExpandedFolders[i];

			// check the parent list, if a source id is passed in
			if (! dropTargetFolderId || excluded.filter('[data-key="' + source.data('key') + '"]').length == 0)
			{
				this._collapseFolder(source);
				this._tempExpandedFolders.splice(i, 1);
			}
		}
	},

	_getSourceByFolderId: function (folderId)
	{
		return this.$sources.filter('[data-key="folder:' + folderId + '"]');
	},

	_hasSubfolders: function (source)
	{
		return source.siblings('ul').find('li').length;
	},

	_isExpanded: function (source)
	{
		return source.parent('li').hasClass('expanded');
	},

	_expandFolder: function ()
	{
		// collapse any temp-expanded drop targets that aren't parents of this one
		this._collapseExtraExpandedFolders(this._getFolderIdFromSourceKey(this.dropTargetFolder.data('key')));

		this.dropTargetFolder.parent().find('> .toggle').click();

		// keep a record of that
		this._tempExpandedFolders.push(this.dropTargetFolder);

	},

	_collapseFolder: function (source)
	{
		var li = source.parent();
		if (li.hasClass('expanded'))
		{
			li.find('> .toggle').click();
		}
	},

	_createFolderContextMenu: function (element)
	{
		element = $(element);
		var menuOptions = [{ label: Craft.t('New subfolder'), onClick: $.proxy(this, '_createSubfolder', element) }];

		// For all folders that are not top folders
		if (element.parents('ul').length > 1)
		{
			menuOptions.push({ label: Craft.t('Rename folder'), onClick: $.proxy(this, '_renameFolder', element) });
			menuOptions.push({ label: Craft.t('Delete folder'), onClick: $.proxy(this, '_deleteFolder', element) });
		}
		new Garnish.ContextMenu(element, menuOptions, {menuClass: 'menu assets-contextmenu'});

	},

	_createSubfolder: function (parentFolder)
	{
		var subfolderName = prompt(Craft.t('Enter the name of the folder'));

		if (subfolderName)
		{
			var params = {
				parentId:  this._getFolderIdFromSourceKey(parentFolder.data('key')),
				folderName: subfolderName
			};

			this.setIndexBusy();

			Craft.postActionRequest('assets/createFolder', params, $.proxy(function(data, textStatus) {

				this.setIndexAvailable();

				if (textStatus == 'success' && data.success)
				{
					this._prepareParentForChildren(parentFolder);

					var subFolder = $('<li><a data-key="folder:' + data.folderId + '" data-has-thumbs="' + parentFolder.data('has-thumbs') + '">' + data.folderName + '</a></li>');

					var $a = subFolder.find('a');
					this._addSubfolder(parentFolder, subFolder);
					this._createFolderContextMenu($a);
					this.sourceSelect.addItems($a);
					this._folderDrag.addItems($a.parent());
					this.$sources = this.$sources.add($a);
				}

				if (textStatus == 'success' && data.error)
				{
					alert(data.error);
				}

			}, this));
		}
	},

	_deleteFolder: function (targetFolder)
	{
		if (confirm(Craft.t('Really delete folder “{folder}”?', {folder: $.trim(targetFolder.text())})))
		{
			var params = {
				folderId: this._getFolderIdFromSourceKey(targetFolder.data('key'))
			}

			this.setIndexBusy();

			Craft.postActionRequest('assets/deleteFolder', params, $.proxy(function(data, textStatus) {

				this.setIndexAvailable();

				if (textStatus == 'success' && data.success)
				{
					var parentFolder = this._getParentSource(targetFolder);

					// remove folder and any trace from it's parent, if needed.
					this.$sources = this.$sources.not(targetFolder);
					this.sourceSelect.removeItems(targetFolder);

					targetFolder.parent().remove();
					this._cleanUpTree(parentFolder);

				}

				if (textStatus == 'success' && data.error)
				{
					alert(data.error);
				}

			}, this));
		}
	},

	/**
	 * Rename
	 */
	_renameFolder: function(targetFolder)
	{
		var oldName = $.trim(targetFolder.text()),
			newName = prompt(Craft.t('Rename folder'), oldName);

		if (newName && newName != oldName)
		{
			var params = {
				folderId: this._getFolderIdFromSourceKey(targetFolder.data('key')),
				newName: newName
			};

			this.setIndexBusy();

			Craft.postActionRequest('assets/renameFolder', params, $.proxy(function(data, textStatus) {

				this.setIndexAvailable();

				if (textStatus == 'success' && data.success)
				{
					targetFolder.text(data.newName);
				}

				if (textStatus == 'success' && data.error)
				{
					alert(data.error);
				}

			}, this), 'json');
		}
	},

	/**
	 * Prepare a source folder for children folder.
	 *
	 * @param parentFolder
	 * @private
	 */
	_prepareParentForChildren: function (parentFolder)
	{
		if (!this._hasSubfolders(parentFolder))
		{
			parentFolder.parent().addClass('expanded').append('<div class="toggle"></div><ul></ul>');
			this.addListener(parentFolder.siblings('.toggle'), 'click', function(ev)
			{
				$(ev.currentTarget).parent().toggleClass('expanded');
			});

		}
	},

	/**
	 * Add a subfolder to the parent folder at the correct spot.
	 *
	 * @param parentFolder
	 * @param subFolder
	 * @private
	 */

	_addSubfolder: function (parentFolder, subFolder)
	{
		var existingChildren = parentFolder.siblings('ul').find('li');
		var folderInserted = false;
		existingChildren.each(function () {
			if (!folderInserted && $.trim($(this).text()) > $.trim(subFolder.text()))
			{
				$(this).before(subFolder);
				folderInserted = true;
			}
		});
		if (!folderInserted)
		{
			parentFolder.siblings('ul').append(subFolder);
		}
	},

	_cleanUpTree: function (parentFolder)
	{
		if (parentFolder !== null && parentFolder.siblings('ul').find('li').length == 0)
		{
			parentFolder.siblings('ul').remove();
			parentFolder.siblings('.toggle').remove();
			parentFolder.parent().removeClass('expanded');
		}
	}
});

// Register it!
Craft.registerElementIndexClass('Asset', Craft.AssetIndex);


/**
 * Element Select input
 */
Craft.AssetSelectInput = Craft.BaseElementSelectInput.extend({

    requestId: 0,
    hud: null,

	init: function(id, name, elementType, sources, criteria, limit, storageKey)
	{
		this.base(id, name, elementType, sources, criteria, limit, storageKey);
        this._attachHUDEvents();
	},

    selectElements: function (elements)
    {
        this.base(elements);
        this._attachHUDEvents();
    },

    _attachHUDEvents: function ()
    {
        this.removeListener(this.$elements, 'dlbclick');
        this.addListener(this.$elements, 'dblclick', $.proxy(this, '_editProperties'));
    },

    _editProperties: function (event)
    {
        var $target = $(event.currentTarget);
        if (!$target.data('ElementEditor'))
        {
            var settings = {
                elementId: $target.attr('data-id'),
                $trigger: $target,
                loadContentAction: 'assets/editFileContent',
                saveContentAction: 'assets/saveFileContent'
            };
            $target.data('ElementEditor', new Craft.ElementEditor(settings));
        }

        $target.data('ElementEditor').show();
    }
});


/**
 * Asset selector modal class
 */
Craft.AssetSelectorModal = Craft.BaseElementSelectorModal.extend({

	init: function(elementType, settings)
	{
		this.base(elementType, settings);
	}

});

// Register it!
Craft.registerElementSelectorModalClass('Asset', Craft.AssetSelectorModal);


/**
 * DataTableSorter
 */
Craft.DataTableSorter = Garnish.DragSort.extend({

	$table: null,

	init: function(table, settings)
	{
		this.$table = $(table);
		var $rows = this.$table.children('tbody').children(':not(.filler)');

		settings = $.extend({}, Craft.DataTableSorter.defaults, settings);

		settings.container = this.$table.children('tbody');
		settings.helper = $.proxy(this, 'getHelper');
		settings.caboose = '<tr/>';
		settings.axis = Garnish.Y_AXIS;

		this.base($rows, settings);
	},

	getHelper: function($helperRow)
	{
		var $helper = $('<div class="'+this.settings.helperClass+'"/>').appendTo(Garnish.$bod),
			$table = $('<table/>').appendTo($helper),
			$tbody = $('<tbody/>').appendTo($table);

		$helperRow.appendTo($tbody);

		// Copy the table width and classes
		$table.width(this.$table.width());
		$table.prop('className', this.$table.prop('className'));

		// Copy the column widths
		var $firstRow = this.$table.find('tr:first'),
			$cells = $firstRow.children(),
			$helperCells = $helperRow.children();

		for (var i = 0; i < $helperCells.length; i++)
		{
			$($helperCells[i]).width($($cells[i]).width());
		}

		return $helper;
	}

},
{
	defaults: {
		handle: '.move',
		helperClass: 'datatablesorthelper'
	}
});


/**
 * Editable table class
 */
Craft.EditableTable = Garnish.Base.extend({

	id: null,
	baseName: null,
	columns: null,
	sorter: null,
	biggestId: -1,

	$table: null,
	$tbody: null,
	$addRowBtn: null,

	init: function(id, baseName, columns, settings)
	{
		this.id = id;
		this.baseName = baseName;
		this.columns = columns;
		this.setSettings(settings, Craft.EditableTable.defaults);

		this.$table = $('#'+id);
		this.$tbody = this.$table.children('tbody');

		this.sorter = new Craft.DataTableSorter(this.$table, {
			helperClass: 'editabletablesorthelper'
		});

		var $rows = this.$tbody.children();

		for (var i = 0; i < $rows.length; i++)
		{
			new Craft.EditableTable.Row(this, $rows[i]);
		}

		this.$addRowBtn = this.$table.next('.add');
		this.addListener(this.$addRowBtn, 'activate', 'addRow');
	},

	addRow: function()
	{
		var rowId = this.settings.rowIdPrefix+(this.biggestId+1),
			rowHtml = Craft.EditableTable.getRowHtml(rowId, this.columns, this.baseName, {}),
			$tr = $(rowHtml).appendTo(this.$tbody);

		new Craft.EditableTable.Row(this, $tr);
		this.sorter.addItems($tr);

		// Focus the first input in the row
		$tr.find('input,textarea,select').first().focus();

		// onAddRow callback
		this.settings.onAddRow($tr);
	}
},
{
	textualColTypes: ['singleline', 'multiline', 'number'],
	defaults: {
		rowIdPrefix: '',
		onAddRow: $.noop,
		onDeleteRow: $.noop
	},

	getRowHtml: function(rowId, columns, baseName, values)
	{
		var rowHtml = '<tr data-id="'+rowId+'">';

		for (var colId in columns)
		{
			var col = columns[colId],
				name = baseName+'['+rowId+']['+colId+']',
				value = (typeof values[colId] != 'undefined' ? values[colId] : ''),
				textual = Craft.inArray(col.type, Craft.EditableTable.textualColTypes);

			rowHtml += '<td class="'+(textual ? 'textual' : '')+' '+(typeof col['class'] != 'undefined' ? col['class'] : '')+'"' +
			              (typeof col['width'] != 'undefined' ? ' width="'+col['width']+'"' : '') +
			              '>';

			switch (col.type)
			{
				case 'select':
				{
					rowHtml += '<div class="select small"><select name="'+name+'">';

					var hasOptgroups = false;

					for (var key in col.options)
					{
						var option = col.options[key];

						if (typeof option.optgroup != 'undefined')
						{
							if (hasOptgroups)
							{
								rowHtml += '</optgroup>';
							}
							else
							{
								hasOptgroups = true;
							}

							rowHtml += '<optgroup label="'+option.optgroup+'">';
						}
						else
						{
							var optionLabel = (typeof option.label != 'undefined' ? option.label : option),
								optionValue = (typeof option.value != 'undefined' ? option.value : key),
								optionDisabled = (typeof option.disabled != 'undefined' ? option.disabled : false);

							rowHtml += '<option value="'+optionValue+'"'+(optionValue == value ? ' selected' : '')+(optionDisabled ? ' disabled' : '')+'>'+optionLabel+'</option>';
						}
					}

					if (hasOptgroups)
					{
						rowHtml += '</optgroup>';
					}

					rowHtml += '</select></div>';

					break;
				}

				case 'checkbox':
				{
					rowHtml += '<input type="hidden" name="'+name+'">' +
					           '<input type="checkbox" name="'+name+'" value="1"'+(value ? ' checked' : '')+'>';

					break;
				}

				default:
				{
					rowHtml += '<textarea name="'+name+'" rows="1">'+value+'</textarea>';
				}
			}

			rowHtml += '</td>';
		}

		rowHtml += '<td class="thin action"><a class="move icon" title="'+Craft.t('Reorder')+'"></a></td>' +
				'<td class="thin action"><a class="delete icon" title="'+Craft.t('Delete')+'"></a></td>' +
			'</tr>';

		return rowHtml;
	}
});

/**
 * Editable table row class
 */
Craft.EditableTable.Row = Garnish.Base.extend({

	table: null,
	id: null,
	niceTexts: null,

	$tr: null,
	$tds: null,
	$textareas: null,
	$deleteBtn: null,

	init: function(table, tr)
	{
		this.table = table;
		this.$tr = $(tr);
		this.$tds = this.$tr.children();

		// Get the row ID, sans prefix
		var id = parseInt(this.$tr.attr('data-id').substr(this.table.settings.rowIdPrefix.length));

		if (id > this.table.biggestId)
		{
			this.table.biggestId = id;
		}

		this.$textareas = $();
		this.niceTexts = [];
		var textareasByColId = {};

		var i = 0;

		for (var colId in this.table.columns)
		{
			var col = this.table.columns[colId];

			if (Craft.inArray(col.type, Craft.EditableTable.textualColTypes))
			{
				$textarea = $('textarea', this.$tds[i]);
				this.$textareas = this.$textareas.add($textarea);

				this.addListener($textarea, 'focus', 'onTextareaFocus');
				this.addListener($textarea, 'mousedown', 'ignoreNextTextareaFocus');

				this.niceTexts.push(new Garnish.NiceText($textarea, {
					onHeightChange: $.proxy(this, 'onTextareaHeightChange')
				}));

				if (col.type == 'singleline' || col.type == 'number')
				{
					this.addListener($textarea, 'keypress', { type: col.type }, 'validateKeypress');
				}

				textareasByColId[colId] = $textarea;
			}

			i++;
		}

		// Now that all of the text cells have been nice-ified, let's normalize the heights
		this.onTextareaHeightChange();

		// Now look for any autopopulate columns
		for (var colId in this.table.columns)
		{
			var col = this.table.columns[colId];

			if (col.autopopulate && typeof textareasByColId[col.autopopulate] != 'undefined' && !textareasByColId[colId].val())
			{
				if (col.autopopulate == 'handle')
				{
					new Craft.HandleGenerator(textareasByColId[colId], textareasByColId[col.autopopulate]);
				}
				else
				{
					new Craft.BaseInputGenerator(textareasByColId[colId], textareasByColId[col.autopopulate]);
				}
			}
		}

		var $deleteBtn = this.$tr.children().last().find('.delete');
		this.addListener($deleteBtn, 'click', 'deleteRow');
	},

	onTextareaFocus: function(ev)
	{
		var $textarea = $(ev.currentTarget);

		if ($textarea.data('ignoreNextFocus'))
		{
			$textarea.data('ignoreNextFocus', false);
			return;
		}

		setTimeout(function()
		{
			var val = $textarea.val();

			// Does the browser support setSelectionRange()?
			if (typeof $textarea[0].setSelectionRange != 'undefined')
			{
				// Select the whole value
				var length = val.length * 2;
				$textarea[0].setSelectionRange(0, length);
			}
			else
			{
				// Refresh the value to get the cursor positioned at the end
				$textarea.val(val);
			}
		}, 0);
	},

	ignoreNextTextareaFocus: function(ev)
	{
		$.data(ev.currentTarget, 'ignoreNextFocus', true);
	},

	validateKeypress: function(ev)
	{
		var keyCode = ev.keyCode ? ev.keyCode : ev.charCode;

		if (!ev.metaKey && !ev.ctrlKey && (
			(keyCode == Garnish.RETURN_KEY) ||
			(ev.data.type == 'number' && !Craft.inArray(keyCode, Craft.EditableTable.Row.numericKeyCodes))
		))
		{
			ev.preventDefault();
		}
	},

	onTextareaHeightChange: function()
	{
		// Keep all the textareas' heights in sync
		var tallestTextareaHeight = -1;

		for (var i = 0; i < this.niceTexts.length; i++)
		{
			if (this.niceTexts[i].height > tallestTextareaHeight)
			{
				tallestTextareaHeight = this.niceTexts[i].height;
			}
		}

		this.$textareas.css('min-height', tallestTextareaHeight);
	},

	deleteRow: function()
	{
		this.table.sorter.removeItems(this.$tr);
		this.$tr.remove();

		// onDeleteRow callback
		this.table.settings.onDeleteRow(this.$tr);
	}
},
{
	numericKeyCodes: [9 /* (tab) */ , 8 /* (delete) */ , 37,38,39,40 /* (arrows) */ , 45,91 /* (minus) */ , 46,190 /* period */ , 48,49,50,51,52,53,54,55,56,57 /* (0-9) */ ]
});


/**
 * Element editor
 */
var x;
Craft.ElementEditor = Garnish.Base.extend({

		hud: null,
		elementId: 0,
		requestId: 0,
		$trigger: null,
		$spinner: null,

		init: function(settings)
		{
			this.setSettings(settings, Craft.ElementEditor.defaults);

			this.elementId = this.settings.elementId;
			this.$trigger = this.settings.$trigger;
		},

		show: function ()
		{
			var params = {
				requestId: ++this.requestId,
				elementId: this.elementId
			};

			this._showSpinner();

			// Create a new HUD
			Craft.postActionRequest(this.settings.loadContentAction, params, $.proxy(function(data, textStatus) {

				this._hideSpinner();

				if (textStatus != 'success' || data.requestId != this.requestId) {
					return;
				}

				$hudHtml = $('<div/>').html((data.headHtml ? data.headHtml : '') + (data.bodyHtml ? data.bodyHtml : '') + (data.footHtml ? data.footHtml : ''));

				this.hud = new Garnish.HUD(this.$trigger, $hudHtml, {
					hudClass: 'hud contenthud',
					triggerSpacing: 10,
					tipWidth: 30,
					closeOtherHUDs: false
				});

				Craft.initUiElements($hudHtml);
				this.addListener($hudHtml.find('form'), 'submit', $.proxy(this, '_saveElementDetails'));
				this.addListener($hudHtml.find('.btn.cancel'), 'click', $.proxy(this, 'removeHud'));


			}, this));
		},

		_saveElementDetails: function (event)
		{
			event.preventDefault();

			this.hud.$body.find('.spinner').removeClass('hidden');

			$form = $(event.currentTarget);
			var params = $form.serialize();

			Craft.postActionRequest(this.settings.saveContentAction, params, $.proxy(function(response, textStatus)
			{
				this.hud.$body.find('.spinner').addClass('hidden');

				if (textStatus == 'success')
				{
					if (textStatus == 'success' && response.success)
					{
						// Update the title
						this.$trigger.find('.label').text(response.title);
						this.removeHud();
					}
					else
					{
						Garnish.shake(this.hud.$hud);
					}
				}
			}, this));
		},

		_showSpinner: function ()
		{
			this.removeHud();

            this.$trigger.find('.delete').addClass('hidden');

            // If the removable class is present, then treat this as an Input Field.
            if (this.$trigger.hasClass('removable'))
            {
                this.$trigger.removeClass('removable').data('elementInputField', true);
            }

			this.$trigger.find('.label').css('padding-right', '20px');
			this.$trigger.find('.label').after('<div class="spinner element-spinner" style="position: absolute; right: 2px; bottom: -1px;"></div>');
		},

		_hideSpinner: function ()
		{
            this.$trigger.find('.delete').removeClass('hidden');
			this.$trigger.find('.label').removeClass('spinner element-spinner inline').html(this.$trigger.find('.label nobr').html());

            if (this.$trigger.data('elementInputField'))
            {
                this.$trigger.addClass('removable');
            }

			this.$trigger.find('.label').css('padding-right', '0');
			this.$trigger.find('.label').siblings('.spinner').remove();

		},

		removeHud: function ()
		{
			if (this.hud !== null)
			{
				this.hud.hide();
				delete this.hud;
			}
		}

	},
	{
		defaults: {
			elementId: null,
			$trigger: null,
			loadContentAction: null,
			saveContentAction: null
		}
	}
);


/**
 * Handle Generator
 */
Craft.EntryUrlFormatGenerator = Craft.BaseInputGenerator.extend({

	generateTargetValue: function(sourceVal)
	{
		// Remove HTML tags
		sourceVal = sourceVal.replace("/<(.*?)>/g", '');

		// Make it lowercase
		sourceVal = sourceVal.toLowerCase();

		// Convert extended ASCII characters to basic ASCII
		sourceVal = Craft.asciiString(sourceVal);

		// Handle must start with a letter and end with a letter/number
		sourceVal = sourceVal.replace(/^[^a-z]+/, '');
		sourceVal = sourceVal.replace(/[^a-z0-9]+$/, '');

		// Get the "words"
		var words = Craft.filterArray(sourceVal.split(/[^a-z0-9]+/));

		var urlFormat = words.join('-');

		if (urlFormat && this.settings.suffix)
		{
			urlFormat += this.settings.suffix;
		}

		return urlFormat;
	}
});


Craft.FieldLayoutDesigner = Garnish.Base.extend({

	$container: null,
	$tabContainer: null,
	$unusedFieldContainer: null,
	$newTabBtn: null,
	$allFields: null,

	tabGrid: null,
	unusedFieldGrid: null,

	tabDrag: null,
	fieldDrag: null,

	init: function(container, settings)
	{
		this.$container = $(container);
		this.setSettings(settings, Craft.FieldLayoutDesigner.defaults);

		this.$tabContainer = this.$container.children('.fld-tabs');
		this.$unusedFieldContainer = this.$container.children('.unusedfields');
		this.$newTabBtn = $('#newtabbtn');
		this.$allFields = this.$unusedFieldContainer.find('.fld-field');

		// Set up the layout grids
		this.tabGrid = new Craft.Grid(this.$tabContainer, Craft.FieldLayoutDesigner.gridSettings);
		this.unusedFieldGrid = new Craft.Grid(this.$unusedFieldContainer, Craft.FieldLayoutDesigner.gridSettings);

		var $tabs = this.$tabContainer.children();
		for (var i = 0; i < $tabs.length; i++)
		{
			this.initTab($($tabs[i]));
		}

		this.fieldDrag = new Craft.FieldLayoutDesigner.FieldDrag(this);

		if (this.settings.customizableTabs)
		{
			this.tabDrag = new Craft.FieldLayoutDesigner.TabDrag(this);

			this.addListener(this.$newTabBtn, 'activate', 'addTab');
		}
	},

	initTab: function($tab)
	{
		if (this.settings.customizableTabs)
		{
			var $editBtn = $tab.find('.tabs .settings'),
				$menu = $('<div class="menu" data-align="center"/>').insertAfter($editBtn),
				$ul = $('<ul/>').appendTo($menu);

			$('<li><a data-action="rename">'+Craft.t('Rename')+'</a></li>').appendTo($ul);
			$('<li><a data-action="delete">'+Craft.t('Delete')+'</a></li>').appendTo($ul);

			new Garnish.MenuBtn($editBtn, {
				onOptionSelect: $.proxy(this, 'onTabOptionSelect')
			});
		}

		// Don't forget the fields!
		var $fields = $tab.children('.fld-tabcontent').children();

		for (var i = 0; i < $fields.length; i++)
		{
			this.initField($($fields[i]));
		}
	},

	initField: function($field)
	{
		var $editBtn = $field.find('.settings'),
			$menu = $('<div class="menu" data-align="center"/>').insertAfter($editBtn),
			$ul = $('<ul/>').appendTo($menu);

		if ($field.hasClass('fld-required'))
		{
			$('<li><a data-action="toggle-required">'+Craft.t('Make not required')+'</a></li>').appendTo($ul);
		}
		else
		{
			$('<li><a data-action="toggle-required">'+Craft.t('Make required')+'</a></li>').appendTo($ul);
		}

		$('<li><a data-action="remove">'+Craft.t('Remove')+'</a></li>').appendTo($ul);

		new Garnish.MenuBtn($editBtn, {
			onOptionSelect: $.proxy(this, 'onFieldOptionSelect')
		});
	},

	onTabOptionSelect: function(option)
	{
		if (!this.settings.customizableTabs)
		{
			return;
		}

		var $option = $(option),
			$tab = $option.data('menu').$trigger.parent().parent().parent(),
			action = $option.data('action');

		switch (action)
		{
			case 'rename':
			{
				this.renameTab($tab);
				break;
			}
			case 'delete':
			{
				this.deleteTab($tab);
				break;
			}
		}
	},

	onFieldOptionSelect: function(option)
	{
		var $option = $(option),
			$field = $option.data('menu').$trigger.parent(),
			action = $option.data('action');

		switch (action)
		{
			case 'toggle-required':
			{
				this.toggleRequiredField($field, $option);
				break;
			}
			case 'remove':
			{
				this.removeField($field);
				break;
			}
		}
	},

	renameTab: function($tab)
	{
		if (!this.settings.customizableTabs)
		{
			return;
		}

		var $labelSpan = $tab.find('.tabs .tab span'),
			oldName = $labelSpan.text(),
			newName = prompt(Craft.t('Give your tab a name.'), oldName);

		if (newName && newName != oldName)
		{
			$labelSpan.text(newName);
			$tab.find('.id-input').attr('name', 'fieldLayout['+encodeURIComponent(newName)+'][]');
		}
	},

	deleteTab: function($tab)
	{
		if (!this.settings.customizableTabs)
		{
			return;
		}

		// Find all the fields in this tab
		var $fields = $tab.find('.fld-field');

		for (var i = 0; i < $fields.length; i++)
		{
			var fieldId = $($fields[i]).attr('data-id');
			this.removeFieldById(fieldId);
		}

		this.tabGrid.removeItems($tab);
		this.tabDrag.removeItems($tab);

		$tab.remove();
	},

	toggleRequiredField: function($field, $option)
	{
		if ($field.hasClass('fld-required'))
		{
			$field.removeClass('fld-required');
			$field.find('.required-input').remove();

			setTimeout(function() {
				$option.text(Craft.t('Make required'));
			}, 500);
		}
		else
		{
			$field.addClass('fld-required');
			$('<input class="required-input" type="hidden" name="requiredFields[]" value="'+$field.data('id')+'">').appendTo($field);

			setTimeout(function() {
				$option.text(Craft.t('Make not required'));
			}, 500);
		}
	},

	removeField: function($field)
	{
		var fieldId = $field.attr('data-id');

		$field.remove();

		this.removeFieldById(fieldId);
		this.tabGrid.refreshCols();
	},

	removeFieldById: function(fieldId)
	{
		var $field = this.$allFields.filter('[data-id='+fieldId+']:first'),
			$group = $field.closest('.fld-tab');

		$field.removeClass('hidden');

		if ($group.hasClass('hidden'))
		{
			$group.removeClass('hidden');
			this.unusedFieldGrid.addItems($group);

			if (this.settings.customizableTabs)
			{
				this.tabDrag.addItems($group);
			}
		}
		else
		{
			this.unusedFieldGrid.refreshCols();
		}
	},

	addTab: function()
	{
		if (!this.settings.customizableTabs)
		{
			return;
		}

		var $tab = $('<div class="fld-tab">' +
						'<div class="tabs">' +
							'<div class="tab sel draggable">' +
								'<span>Tab '+(this.tabGrid.$items.length+1)+'</span>' +
								'<a class="settings icon" title="'+Craft.t('Rename')+'"></a>' +
							'</div>' +
						'</div>' +
						'<div class="fld-tabcontent"></div>' +
					'</div>').appendTo(this.$tabContainer);

		this.tabGrid.addItems($tab);
		this.tabDrag.addItems($tab);

		this.initTab($tab);
	}
},
{
	gridSettings: {
		minColWidth: 240,
		percentageWidths: false,
		fillMode: 'grid',
		snapToGrid: 30
	},
	defaults: {
		customizableTabs: true
	}
});


Craft.FieldLayoutDesigner.BaseDrag = Garnish.Drag.extend({

	designer: null,
	$insertion: null,
	showingInsertion: false,
	$caboose: null,
	draggingUnusedItem: false,
	addToTabGrid: false,

	/**
	 * Constructor
	 */
	init: function(designer, settings)
	{
		this.designer = designer;

		// Find all the items from both containers
		var $items = this.designer.$tabContainer.find(this.itemSelector)
			.add(this.designer.$unusedFieldContainer.find(this.itemSelector));

		this.base($items, settings);
	},

	/**
	 * On Drag Start
	 */
	onDragStart: function()
	{
		this.base();

		// Are we dragging an unused item?
		this.draggingUnusedItem = this.$draggee.hasClass('unused');

		// Create the insertion
		this.$insertion = this.getInsertion();

		// Add the caboose
		this.addCaboose();
		this.$items = $().add(this.$items.add(this.$caboose));

		if (this.addToTabGrid)
		{
			this.designer.tabGrid.addItems(this.$caboose);
		}

		// Swap the draggee with the insertion if dragging a selected item
		if (this.draggingUnusedItem)
		{
			this.showingInsertion = false;
		}
		else
		{
			// Actually replace the draggee with the insertion
			this.$insertion.insertBefore(this.$draggee);
			this.$draggee.detach();
			this.$items = $().add(this.$items.not(this.$draggee).add(this.$insertion));
			this.showingInsertion = true;

			if (this.addToTabGrid)
			{
				this.designer.tabGrid.removeItems(this.$draggee);
				this.designer.tabGrid.addItems(this.$insertion);
			}
		}

		this.setMidpoints();
	},

	/**
	 * Append the caboose
	 */
	addCaboose: $.noop,

	/**
	 * Returns the item's container
	 */
	getItemContainer: $.noop,

	/**
	 * Tests if an item is within the tab container.
	 */
	isItemInTabContainer: function($item)
	{
		return (this.getItemContainer($item)[0] == this.designer.$tabContainer[0]);
	},

	/**
	 * Sets the item midpoints up front so we don't have to keep checking on every mouse move
	 */
	setMidpoints: function()
	{
		for (var i = 0; i < this.$items.length; i++)
		{
			var $item = $(this.$items[i]);

			// Skip the unused tabs
			if (!this.isItemInTabContainer($item))
			{
				continue;
			}

			var offset = $item.offset();

			$item.data('midpoint', {
				left: offset.left + $item.outerWidth() / 2,
				top:  offset.top + $item.outerHeight() / 2
			});
		}
	},

	/**
	 * On Drag
	 */
	onDrag: function()
	{
		// Are we hovering over the tab container?
		if (this.draggingUnusedItem && !Garnish.hitTest(this.mouseX, this.mouseY, this.designer.$tabContainer))
		{
			if (this.showingInsertion)
			{
				this.$insertion.remove();
				this.$items = $().add(this.$items.not(this.$insertion));
				this.showingInsertion = false;

				if (this.addToTabGrid)
				{
					this.designer.tabGrid.removeItems(this.$insertion);
				}
				else
				{
					this.designer.tabGrid.refreshCols();
				}

				this.setMidpoints();
			}
		}
		else
		{
			// Is there a new closest item?
			this.onDrag._closestItem = this.getClosestItem();

			if (this.onDrag._closestItem != this.$insertion[0])
			{
				if (this.showingInsertion &&
					($.inArray(this.$insertion[0], this.$items) < $.inArray(this.onDrag._closestItem, this.$items)) &&
					($.inArray(this.onDrag._closestItem, this.$caboose) == -1)
				)
				{
					this.$insertion.insertAfter(this.onDrag._closestItem);
				}
				else
				{
					this.$insertion.insertBefore(this.onDrag._closestItem);
				}

				this.$items = $().add(this.$items.add(this.$insertion));
				this.showingInsertion = true;

				if (this.addToTabGrid)
				{
					this.designer.tabGrid.addItems(this.$insertion);
				}
				else
				{
					this.designer.tabGrid.refreshCols();
				}

				this.setMidpoints();
			}
		}

		this.base();
	},

	/**
	 * Returns the closest item to the cursor.
	 */
	getClosestItem: function()
	{
		this.getClosestItem._closestItem = null;
		this.getClosestItem._closestItemMouseDiff = null;

		for (this.getClosestItem._i = 0; this.getClosestItem._i < this.$items.length; this.getClosestItem._i++)
		{
			this.getClosestItem._$item = $(this.$items[this.getClosestItem._i]);

			// Skip the unused tabs
			if (!this.isItemInTabContainer(this.getClosestItem._$item))
			{
				continue;
			}

			this.getClosestItem._midpoint = this.getClosestItem._$item.data('midpoint');
			this.getClosestItem._mouseDiff = Garnish.getDist(this.getClosestItem._midpoint.left, this.getClosestItem._midpoint.top, this.mouseX, this.mouseY);

			if (this.getClosestItem._closestItem === null || this.getClosestItem._mouseDiff < this.getClosestItem._closestItemMouseDiff)
			{
				this.getClosestItem._closestItem = this.getClosestItem._$item[0];
				this.getClosestItem._closestItemMouseDiff = this.getClosestItem._mouseDiff;
			}
		}

		return this.getClosestItem._closestItem;
	},

	/**
	 * On Drag Stop
	 */
	onDragStop: function()
	{
		if (this.showingInsertion)
		{
			this.$insertion.replaceWith(this.$draggee);
			this.$items = $().add(this.$items.not(this.$insertion).add(this.$draggee));

			if (this.addToTabGrid)
			{
				this.designer.tabGrid.removeItems(this.$insertion);
				this.designer.tabGrid.addItems(this.$draggee);
			}
		}

		// Drop the caboose
		this.$items = this.$items.not(this.$caboose);
		this.$caboose.remove();

		if (this.addToTabGrid)
		{
			this.designer.tabGrid.removeItems(this.$caboose);
		}

		// "show" the drag items, but make them invisible
		this.$draggee.css({
			display:    this.draggeeDisplay,
			visibility: 'hidden'
		});

		this.designer.tabGrid.refreshCols();
		this.designer.unusedFieldGrid.refreshCols();

		// return the helpers to the draggees
		this.returnHelpersToDraggees();

		this.base();
	}
});


Craft.FieldLayoutDesigner.TabDrag = Craft.FieldLayoutDesigner.BaseDrag.extend({

	itemSelector: '> div.fld-tab',
	addToTabGrid: true,

	/**
	 * Constructor
	 */
	init: function(designer)
	{
		var settings = {
			handle: '.tab'
		};

		this.base(designer, settings);
	},

	/**
	 * Append the caboose
	 */
	addCaboose: function()
	{
		this.$caboose = $('<div class="fld-tab fld-tab-caboose"/>').appendTo(this.designer.$tabContainer);
	},

	/**
	 * Returns the insertion
	 */
	getInsertion: function()
	{
		var $tab = this.$draggee.find('.tab');

		return $('<div class="fld-tab fld-insertion" style="height: '+this.$draggee.height()+'px;">' +
					'<div class="tabs"><div class="tab sel draggable" style="width: '+$tab.width()+'px; height: '+$tab.height()+'px;"></div></div>' +
					'<div class="fld-tabcontent" style="height: '+this.$draggee.find('.fld-tabcontent').height()+'px;"></div>' +
				'</div>');
	},

	/**
	 * Returns the item's container
	 */
	getItemContainer: function($item)
	{
		return $item.parent();
	},

	/**
	 * On Drag Stop
	 */
	onDragStop: function()
	{
		if (this.draggingUnusedItem && this.showingInsertion)
		{
			// Create a new tab based on that field group
			var $tab = this.$draggee.clone().removeClass('unused'),
				tabName = $tab.find('.tab span').text();

			$tab.find('.fld-field').removeClass('unused');

			// Add the edit button
			$tab.find('.tabs .tab').append('<a class="settings icon" title="'+Craft.t('Edit')+'"></a>');

			// Remove any hidden fields
			var $fields = $tab.find('.fld-field'),
				$hiddenFields = $fields.filter('.hidden').remove();

			$fields = $fields.not($hiddenFields);
			$fields.prepend('<a class="settings icon" title="'+Craft.t('Edit')+'"></a>');

			for (var i = 0; i < $fields.length; i++)
			{
				var $field = $($fields[i]);
				$field.append('<input class="id-input" type="hidden" name="fieldLayout['+encodeURIComponent(tabName)+'][]" value="'+$field.data('id')+'">');
			}

			this.designer.fieldDrag.addItems($fields);

			this.designer.initTab($tab);

			// Set the unused field group and its fields to hidden
			this.$draggee.css({ visibility: 'inherit', display: 'field' }).addClass('hidden');
			this.$draggee.find('.fld-field').addClass('hidden');

			// Set this.$draggee to the clone, as if we were dragging that all along
			this.$draggee = $tab;

			// Remember it for later
			this.addItems($tab);

			// Update the grids
			this.designer.tabGrid.addItems($tab);
			this.designer.unusedFieldGrid.removeItems(this.$draggee);
		}

		this.base();
	}
});


Craft.FieldLayoutDesigner.FieldDrag = Craft.FieldLayoutDesigner.BaseDrag.extend({

	itemSelector: '> div.fld-tab .fld-field',

	/**
	 * Append the caboose
	 */
	addCaboose: function()
	{
		this.$caboose = $();

		var $fieldContainers = this.designer.$tabContainer.children().children('.fld-tabcontent');

		for (var i = 0; i < $fieldContainers.length; i++)
		{
			var $caboose = $('<div class="fld-tab fld-tab-caboose"/>').appendTo($fieldContainers[i]);
			this.$caboose = this.$caboose.add($caboose);
		}
	},

	/**
	 * Returns the insertion
	 */
	getInsertion: function()
	{
		return $('<div class="fld-field fld-insertion" style="height: '+this.$draggee.height()+'px;"/>');
	},

	/**
	 * Returns the item's container
	 */
	getItemContainer: function($item)
	{
		return $item.parent().parent().parent();
	},

	/**
	 * On Drag Stop
	 */
	onDragStop: function()
	{
		if (this.draggingUnusedItem && this.showingInsertion)
		{
			// Create a new field based on that one
			var $field = this.$draggee.clone().removeClass('unused');
			$field.prepend('<a class="settings icon" title="'+Craft.t('Edit')+'"></a>');
			this.designer.initField($field);

			// Hide the unused field
			this.$draggee.css({ visibility: 'inherit', display: 'field' }).addClass('hidden');

			// Hide the group too?
			if (this.$draggee.siblings(':not(.hidden)').length == 0)
			{
				var $group = this.$draggee.parent().parent();
				$group.addClass('hidden');
				this.designer.unusedFieldGrid.removeItems($group);
			}

			// Set this.$draggee to the clone, as if we were dragging that all along
			this.$draggee = $field;

			// Remember it for later
			this.addItems($field);
		}

		if (this.showingInsertion)
		{
			// Find the field's new tab name
			var tabName = this.$insertion.parent().parent().find('.tab span').text(),
				inputName = 'fieldLayout['+encodeURIComponent(tabName)+'][]';

			if (this.draggingUnusedItem)
			{
				this.$draggee.append('<input class="id-input" type="hidden" name="'+inputName+'" value="'+this.$draggee.data('id')+'">');
			}
			else
			{
				this.$draggee.find('.id-input').attr('name', inputName);
			}
		}

		this.base();
	}
});


/**
 * FieldToggle
 */
Craft.FieldToggle = Garnish.Base.extend({

	$toggle: null,
	reverse: null,
	targetPrefix: null,

	_$target: null,
	type: null,

	init: function(toggle)
	{
		this.$toggle = $(toggle);

		// Is this already a field toggle?
		if (this.$toggle.data('fieldtoggle'))
		{
			Garnish.log('Double-instantiating a field toggle on an element');
			this.$toggle.data('fieldtoggle').destroy();
		}

		this.$toggle.data('fieldtoggle', this);

		this.type = this.getType();
		this.reverse = !!this.$toggle.attr('data-reverse-toggle');

		if (this.type == 'select')
		{
			this.targetPrefix = (this.$toggle.attr('data-target-prefix') || '');
			this.findTarget();
		}

		if (this.type == 'link')
		{
			this.addListener(this.$toggle, 'click', 'onToggleChange');
		}
		else
		{
			this.addListener(this.$toggle, 'change', 'onToggleChange');
		}
	},

	getType: function()
	{
		if (this.$toggle.prop('nodeName') == 'INPUT' && this.$toggle.attr('type').toLowerCase() == 'checkbox')
		{
			return 'checkbox';
		}
		else if (this.$toggle.prop('nodeName') == 'SELECT')
		{
			return 'select';
		}
		else if (this.$toggle.prop('nodeName') == 'A')
		{
			return 'link';
		}
	},

	getTarget: function()
	{
		if (!this._$target)
		{
			this.findTarget();
		}

		return this._$target;
	},

	findTarget: function()
	{
		if (this.type == 'select')
		{
			this._$target = $('#'+this.targetPrefix+this.getToggleVal());
		}
		else
		{
			var targetSelector = this.$toggle.data('target');

			if (!targetSelector.match(/^[#\.]/))
			{
				targetSelector = '#'+targetSelector;
			}

			this._$target = $(targetSelector);
		}
	},

	getToggleVal: function()
	{
		return Garnish.getInputPostVal(this.$toggle);
	},

	onToggleChange: function()
	{
		if (this.type == 'select')
		{
			this.hideTarget();
			this.findTarget();
			this.showTarget();
		}
		else
		{
			if (this.type == 'link')
			{
				var show = this.$toggle.hasClass('collapsed');
			}
			else
			{
				var show = !!this.getToggleVal();
			}

			if (this.reverse)
			{
				show = !show;
			}

			if (show)
			{
				this.showTarget();
			}
			else
			{
				this.hideTarget();
			}
		}
	},

	showTarget: function()
	{
		if (this.getTarget().length)
		{
			this.getTarget().removeClass('hidden');

			if (this.type != 'select')
			{
				if (this.type == 'link')
				{
					this.$toggle.removeClass('collapsed');
					this.$toggle.addClass('expanded');
				}

				var $target = this.getTarget();
				$target.height('auto');
				var height = $target.height();
				$target.height(0);
				$target.stop().animate({height: height}, 'fast', $.proxy(function() {
					$target.height('auto');
				}, this));
			}
		}
	},

	hideTarget: function()
	{
		if (this.getTarget().length)
		{
			if (this.type == 'select')
			{
				this.getTarget().addClass('hidden');
			}
			else
			{
				if (this.type == 'link')
				{
					this.$toggle.removeClass('expanded');
					this.$toggle.addClass('collapsed');
				}

				this.getTarget().stop().animate({height: 0}, 'fast', $.proxy(function() {
					this.getTarget().addClass('hidden');
				}, this));
			}
		}
	}
});


Craft.Grid = Garnish.Base.extend({

	$container: null,

	$items: null,
	items: null,
	totalCols: null,
	cols: null,
	colWidth: null,

	init: function(container, settings)
	{
		this.$container = $(container);

		this.setSettings(settings, Craft.Grid.defaults);

		this.$items = this.$container.children(this.settings.itemSelector);

		this.setCols();

		// Adjust them when the window resizes
		this.addListener(Garnish.$win, 'resize', 'setCols');
	},

	addItems: function(items)
	{
		this.$items = $().add(this.$items.add(items));
		this.refreshCols();
	},

	removeItems: function(items)
	{
		this.$items = $().add(this.$items.not(items));
		this.refreshCols();
	},

	setCols: function()
	{
		var totalCols = Math.floor(this.$container.width() / this.settings.minColWidth);

		if (totalCols == 0)
		{
			totalCols = 1;
		}

		if (totalCols !== this.totalCols)
		{
			this.totalCols = totalCols;
			this.refreshCols();
			return true;
		}

		return false;
	},

	refreshCols: function()
	{
		if (this.settings.fillMode == 'grid')
		{
			var itemIndex = 0;

			while (itemIndex < this.$items.length)
			{
				// Append the next X items and figure out which one is the tallest
				var tallestItemHeight = -1,
					colIndex = 0;

				for (var i = itemIndex; (i < itemIndex + this.totalCols && i < this.$items.length); i++)
				{
					var itemHeight = $(this.$items[i]).height('auto').height();
					if (itemHeight > tallestItemHeight)
					{
						tallestItemHeight = itemHeight;
					}

					colIndex++;
				}

				if (this.settings.snapToGrid)
				{
					var remainder = tallestItemHeight % this.settings.snapToGrid;

					if (remainder)
					{
						tallestItemHeight += this.settings.snapToGrid - remainder;
					}
				}

				// Now set their heights to the tallest one
				for (var i = itemIndex; (i < itemIndex + this.totalCols && i < this.$items.length); i++)
				{
					$(this.$items[i]).height(tallestItemHeight);
				}

				// set the itemIndex pointer to the next one up
				itemIndex += this.totalCols;
			}
		}
		else
		{
			// Detach the items before we remove the columns so they keep their events
			for (var i = 0; i < this.$items.length; i++)
			{
				$(this.$items[i]).detach();
			}

			// Delete the old columns
			if (this.cols)
			{
				for (var i = 0; i < this.cols.length; i++)
				{
					this.cols[i].remove();
				}
			}

			// Create the new columns
			this.cols = [];

			if (this.settings.percentageWidths)
			{
				this.colWidth = Math.floor(100 / this.totalCols) + '%';
			}
			else
			{
				this.colWidth = this.settings.minColWidth + 'px';
			}

			var actualTotalCols = Math.min(this.totalCols, this.$items.length);
			for (var i = 0; i < actualTotalCols; i++)
			{
				this.cols[i] = new Craft.Grid.Col(this, i);
			}

			// Place the items
			if (this.cols.length == 1)
			{
				for (var i = 0; i < this.$items.length; i++)
				{
					this.cols[0].append(this.$items[i]);

					if (this.settings.snapToGrid)
					{
						var height = $(this.$items[i]).height('auto').height(),
							remainder = height % this.settings.snapToGrid;

						if (remainder)
						{
							$(this.$items[i]).height(height + this.settings.snapToGrid - remainder);
						}
					}
				}
			}
			else
			{
				switch (this.settings.fillMode)
				{
					case 'top':
					{
						// Add each item one at a time to the shortest column
						for (var i = 0; i < this.$items.length; i++)
						{
							this.getShortestCol().append(this.$items[i]);
						}

						break;
					}
					case 'ltr':
					{
						// First get the total height of the items
						this.itemHeights = [];
						this.ltrScenarios = [];
						this.totalItemHeight = 0;

						for (var i = 0; i < this.$items.length; i++)
						{
							this.cols[0].append(this.$items[i]);
							this.itemHeights[i] = $(this.$items[i]).height();
							this.totalItemHeight += this.itemHeights[i];
							$(this.$items[i]).detach();
						}

						this.avgColHeight = this.totalItemHeight / this.cols.length;

						// Get all the possible scenarios
						this.ltrScenarios.push(
							new Craft.Grid.LtrScenario(this, 0, 0, [[]], 0)
						);

						// Find the scenario with the shortest tallest column
						var shortestScenario = this.ltrScenarios[0];

						for (var i = 1; i < this.ltrScenarios.length; i++)
						{
							if (this.ltrScenarios[i].tallestColHeight < shortestScenario.tallestColHeight)
							{
								shortestScenario = this.ltrScenarios[i];
							}
						}

						// Lay out the items
						for (var i = 0; i < shortestScenario.placements.length; i++)
						{
							for (var j = 0; j < shortestScenario.placements[i].length; j++)
							{
								this.cols[i].append(this.$items[shortestScenario.placements[i][j]]);
							}
						}

						break;
					}
				}
			}
		}
	},

	getShortestCol: function()
	{
		var shortestCol, shortestColHeight;

		for (var i = 0; i < this.cols.length; i++)
		{
			var col = this.cols[i],
				colHeight = this.cols[i].height();

			if (typeof shortestCol == 'undefined' || colHeight < shortestColHeight)
			{
				shortestCol = col;
				shortestColHeight = colHeight;
			}
		}

		return shortestCol;
	},

	getTallestCol: function()
	{
		var tallestCol, tallestColHeight;

		for (var i = 0; i < this.cols.length; i++)
		{
			var col = this.cols[i],
				colHeight = this.cols[i].height();

			if (typeof tallestCol == 'undefined' || colHeight > tallestColHeight)
			{
				tallestCol = col;
				tallestColHeight = colHeight;
			}
		}

		return tallestCol;
	}

},
{
	defaults: {
		itemSelector: ':visible',
		minColWidth: 325,
		percentageWidths: true,
		fillMode: 'grid',
		snapToGrid: null
	}
});


Craft.Grid.Col = Garnish.Base.extend({

	grid: null,
	index: null,

	$outerContainer: null,
	$innerContainer: null,

	init: function(grid, index)
	{
		this.grid = grid;
		this.index = index;

		this.$outerContainer = $('<div class="col" style="width: '+this.grid.colWidth+'"/>').appendTo(this.grid.$container);
		this.$innerContainer = $('<div class="col-inner">').appendTo(this.$outerContainer);
	},

	height: function(height)
	{
		if (typeof height != 'undefined')
		{
			this.$innerContainer.height(height);
		}
		else
		{
			this.$innerContainer.height('auto');
			return this.$outerContainer.height();
		}
	},

	append: function(item)
	{
		this.$innerContainer.append(item);
	},

	remove: function()
	{
		this.$outerContainer.remove();
	}

});


Craft.Grid.LtrScenario = Garnish.Base.extend({

	placements: null,
	tallestColHeight: null,

	init: function(grid, itemIndex, colIndex, placements, tallestColHeight)
	{
		this.placements = placements;
		this.tallestColHeight = tallestColHeight;

		var runningColHeight = 0;

		for (itemIndex; itemIndex < grid.$items.length; itemIndex++)
		{
			var hypotheticalColHeight = runningColHeight + grid.itemHeights[itemIndex];

			// If there's enough room for this item, add it and move on
			if (hypotheticalColHeight <= grid.avgColHeight || colIndex == grid.cols.length-1)
			{
				this.placements[colIndex].push(itemIndex);
				runningColHeight += grid.itemHeights[itemIndex];
				this.checkColHeight(hypotheticalColHeight);
			}
			else
			{
				this.placements[colIndex+1] = [];

				// Create an alternate scenario where the item stays in this column
				var altPlacements = $.extend(true, [], this.placements);
				altPlacements[colIndex].push(itemIndex);
				var altTallestColHeight = Math.max(this.tallestColHeight, hypotheticalColHeight);
				grid.ltrScenarios.push(
					new Craft.Grid.LtrScenario(grid, itemIndex+1, colIndex+1, altPlacements, altTallestColHeight)
				);

				// As for this scenario, move it to the next column
				colIndex++;
				this.placements[colIndex].push(itemIndex);
				this.checkColHeight(grid.itemHeights[itemIndex]);
				runningColHeight = grid.itemHeights[itemIndex];
			}
		}
	},

	checkColHeight: function(colHeight)
	{
		if (colHeight > this.tallestColHeight)
		{
			this.tallestColHeight = colHeight;
		}
	}

});


/**
 * Handle Generator
 */
Craft.HandleGenerator = Craft.BaseInputGenerator.extend({

	generateTargetValue: function(sourceVal)
	{
		// Remove HTML tags
		var handle = sourceVal.replace("/<(.*?)>/g", '');

		// Make it lowercase
		handle = handle.toLowerCase();

		// Convert extended ASCII characters to basic ASCII
		handle = Craft.asciiString(handle);

		// Handle must start with a letter
		handle = handle.replace(/^[^a-z]+/, '');

		// Get the "words"
		var words = Craft.filterArray(handle.split(/[^a-z0-9]+/)),
			handle = '';

		// Make it camelCase
		for (var i = 0; i < words.length; i++)
		{
			if (i == 0)
			{
				handle += words[i];
			}
			else
			{
				handle += words[i].charAt(0).toUpperCase()+words[i].substr(1);
			}
		}

		return handle;
	}
});


/**
 * postParameters    - an object of POST data to pass along with each Ajax request
 * modalClass        - class to add to the modal window to allow customization
 * uploadButton      - jQuery object of the element that should open the file chooser
 * uploadAction      - upload to this location (in form of "controller/action")
 * deleteButton      - jQuery object of the element that starts the image deletion process
 * deleteMessage     - confirmation message presented to the user for image deletion
 * deleteAction      - delete image at this location (in form of "controller/action")
 * cropAction        - crop image at this (in form of "controller/action")
 * areaToolOptions   - object with some options for the area tool selector
 *   aspectRatio     - aspect ration to enforce in form of "width:height". If empty, then select area is freeform
 *   intialRectangle - object with options for the initial rectangle
 *     mode          - if set to auto, then the part selected will be the maximum size in the middle of image
 *     x1            - top left x coordinate of th rectangle, if the mode is not set to auto
 *     x2            - bottom right x coordinate of th rectangle, if the mode is not set to auto
 *     y1            - top left y coordinate of th rectangle, if the mode is not set to auto
 *     y2            - bottom right y coordinate of th rectangle, if the mode is not set to auto
 *
 * onImageDelete     - callback to call when image is deleted. First parameter will containt respone data.
 * onImageSave       - callback to call when an cropped image is saved. First parameter will contain response data.
 */


/**
 * Image Upload tool.
 */
Craft.ImageUpload = Garnish.Base.extend({

	_imageHandler: null,

	init: function(settings)
	{
		this.setSettings(settings, Craft.ImageUpload.defaults);
		this._imageHandler = new Craft.ImageHandler(settings);
	}
},
{
	$modalContainerDiv: null,

	defaults: {
		postParameters: {},

		modalClass: "",
		uploadButton: {},
		uploadAction: "",

		deleteButton: {},
		deleteMessage: "",
		deleteAction: "",

		cropAction:"",

		areaToolOptions:
		{
			aspectRatio: "1:1",
			initialRectangle: {
				mode: "auto",
				x1: 0,
				x2: 0,
				y1: 0,
				y2: 0
			}
		},

		onImageDelete: function(response)
		{
			location.reload();
		},
		onImageSave: function(response)
		{
			location.reload();
		}
	}
});


Craft.ImageHandler = Garnish.Base.extend({

	modal: null,

	init: function(settings)
	{
		this.setSettings(settings);

		var _this = this;

		var element = settings.uploadButton;
		var options = {
			element:    this.settings.uploadButton[0],
			action:     Craft.actionUrl + '/' + this.settings.uploadAction,
			params:     this.settings.postParameters,
			multiple:   false,
			onComplete: function(fileId, fileName, response)
			{

				if (Craft.ImageUpload.$modalContainerDiv == null)
				{
					Craft.ImageUpload.$modalContainerDiv = $('<div class="modal"></div>').addClass(settings.modalClass).appendTo(Garnish.$bod);
				}

				if (response.html)
				{
					Craft.ImageUpload.$modalContainerDiv.empty().append(response.html);

					if (!this.modal)
					{
						this.modal = new Craft.ImageModal(Craft.ImageUpload.$modalContainerDiv, {
							postParameters: settings.postParameters,
							cropAction:     settings.cropAction
						});

						this.modal.imageHandler = _this;
					}
					else
					{
						this.modal.show();
					}

					this.modal.bindButtons();
					this.modal.addListener(this.modal.$saveBtn, 'click', 'saveImage');
					this.modal.addListener(this.modal.$cancelBtn, 'click', 'cancel');

					this.modal.removeListener(Garnish.Modal.$shade, 'click');

					setTimeout($.proxy(function()
					{
						Craft.ImageUpload.$modalContainerDiv.find('img').load($.proxy(function()
						{
							var profileTool = new Craft.ImageAreaTool(settings.areaToolOptions);
							profileTool.showArea(this.modal);
						}, this));
					}, this), 1);
				}
			},
			allowedExtensions: ['jpg', 'jpeg', 'gif', 'png'],
			template: '<div class="QqUploader-uploader"><div class="QqUploader-upload-drop-area" style="display: none; "><span></span></div><div class="QqUploader-upload-button" style="position: relative; overflow: hidden; direction: ltr; ">' +
				element.text() +
				'<input type="file" name="file" style="position: absolute; right: 0px; top: 0px; font-family: Arial; font-size: 118px; margin: 0px; padding: 0px; cursor: pointer; opacity: 0; "></div><ul class="QqUploader-upload-list"></ul></div>'

		};

		options.sizeLimit = Craft.maxUploadSize;

		this.uploader = new qqUploader.FileUploader(options);

		$(settings.deleteButton).click(function()
		{
			if (confirm(settings.deleteMessage))
			{
				$(this).parent().append('<div class="blocking-modal"></div>');
				Craft.postActionRequest(settings.deleteAction, settings.postParameters, $.proxy(function(response, textStatus) {

					if (textStatus == 'success')
					{
						_this.onImageDelete.apply(_this, [response]);
					}

				}, this));

			}
		});
	},

	onImageSave: function(data)
	{
		this.settings.onImageSave.apply(this, [data]);
	},

	onImageDelete: function(data)
	{
		this.settings.onImageDelete.apply(this, [data]);
	}
});


Craft.ImageModal = Garnish.Modal.extend({

	$container: null,
	$saveBtn: null,
	$cancelBtn: null,

	areaSelect: null,
	factor: null,
	source: null,
	_postParameters: null,
	_cropAction: "",
	imageHandler: null,


	init: function($container, settings)
	{
		this.base($container, settings);
		this._postParameters = settings.postParameters;
		this._cropAction = settings.cropAction;
	},

	bindButtons: function()
	{
		this.$saveBtn = this.$container.find('.submit:first');
		this.$cancelBtn = this.$container.find('.cancel:first');
	},

	cancel: function()
	{
		this.hide();
		this.areaSelect.setOptions({remove: true, hide: true, disable: true});
		this.$container.empty();
	},

	saveImage: function()
	{

		var selection = this.areaSelect.getSelection();
		var params = {
			x1: Math.round(selection.x1 / this.factor),
			x2: Math.round(selection.x2 / this.factor),
			y1: Math.round(selection.y1 / this.factor),
			y2: Math.round(selection.y2 / this.factor),
			source: this.source
		};

		params = $.extend(this._postParameters, params);

		Craft.postActionRequest(this._cropAction, params, $.proxy(function(response, textStatus) {

			if (textStatus == 'success')
			{
				if (response.error)
				{
					Craft.cp.displayError(response.error);
				}
				else
				{
					this.imageHandler.onImageSave.apply(this.imageHandler, [response]);
				}
			}

			this.hide();
			this.$container.empty();
			this.areaSelect.setOptions({remove: true, hide: true, disable: true});


		}, this));

		this.areaSelect.setOptions({disable: true});
		this.removeListener(this.$saveBtn, 'click');
		this.removeListener(this.$cancelBtn, 'click');

		this.$container.find('.crop-image').fadeTo(50, 0.5);
	}

});


Craft.ImageAreaTool = Garnish.Base.extend({

	$container: null,

	init: function(settings)
	{
		this.$container = Craft.ImageUpload.$modalContainerDiv;
		this.setSettings(settings);
	},

	showArea: function(referenceObject)
	{
		var $target = this.$container.find('img');


		var areaOptions = {
			aspectRatio: this.settings.aspectRatio,
			maxWidth: $target.width(),
			maxHeight: $target.height(),
			instance: true,
			resizable: true,
			show: true,
			persistent: true,
			handles: true,
			parent: $target.parent()
		};

		var areaSelect = $target.imgAreaSelect(areaOptions);

		var x1 = this.settings.initialRectangle.x1;
		var x2 = this.settings.initialRectangle.x2;
		var y1 = this.settings.initialRectangle.y1;
		var y2 = this.settings.initialRectangle.y2;

		if (this.settings.initialRectangle.mode == "auto")
		{
			var proportions = this.settings.aspectRatio.split(":");
			var rectangleWidth = 0;
			var rectangleHeight = 0;


			// [0] - width proportion, [1] - height proportion
			if (proportions[0] > proportions[1])
			{
				rectangleWidth = $target.width();
				rectangleHeight = rectangleWidth * proportions[1] / proportions[0];
			} else if (proportions[0] > proportions[1])
			{
				rectangleHeight = $target.height();
				rectangleWidth = rectangleHeight * proportions[0] / proportions[1];
			} else {
				rectangleHeight = rectangleWidth = Math.min($target.width(), $target.height());
			}
			x1 = Math.round(($target.width() - rectangleWidth) / 2);
			y1 = Math.round(($target.height() - rectangleHeight) / 2);
			x2 = x1 + rectangleWidth;
			y2 = y1 + rectangleHeight;

		}
		areaSelect.setSelection(x1, y1, x2, y2);
		areaSelect.update();

		referenceObject.areaSelect = areaSelect;
		referenceObject.factor = $target.attr('data-factor');
		referenceObject.source = $target.attr('src').split('/').pop();
	}
});


/**
 * Light Switch
 */
Craft.LightSwitch = Garnish.Base.extend({

	settings: null,
	$outerContainer: null,
	$innerContainer: null,
	$input: null,
	$toggleTarget: null,
	on: null,
	dragger: null,

	dragStartMargin: null,

	init: function(outerContainer, settings)
	{
		this.$outerContainer = $(outerContainer);

		// Is this already a switch?
		if (this.$outerContainer.data('lightswitch'))
		{
			Garnish.log('Double-instantiating a switch on an element');
			this.$outerContainer.data('lightswitch').destroy();
		}

		this.$outerContainer.data('lightswitch', this);

		this.setSettings(settings, Craft.LightSwitch.defaults);

		this.$innerContainer = this.$outerContainer.find('.container:first');
		this.$input = this.$outerContainer.find('input:first');
		this.$toggleTarget = $(this.$outerContainer.attr('data-toggle'));

		this.on = this.$outerContainer.hasClass('on');

		this.addListener(this.$outerContainer, 'mousedown', '_onMouseDown');
		this.addListener(this.$outerContainer, 'keydown', '_onKeyDown');

		this.dragger = new Garnish.BaseDrag(this.$outerContainer, {
			axis:          Garnish.X_AXIS,
			ignoreButtons: false,
			onDragStart:   $.proxy(this, '_onDragStart'),
			onDrag:        $.proxy(this, '_onDrag'),
			onDragStop:    $.proxy(this, '_onDragStop')
		});
	},

	turnOn: function()
	{
		this.$innerContainer.stop().animate({marginLeft: 0}, 'fast');
		this.$input.val('y');
		this.on = true;
		this.settings.onChange();

		this.$toggleTarget.show();
		this.$toggleTarget.height('auto');
		var height = this.$toggleTarget.height();
		this.$toggleTarget.height(0);
		this.$toggleTarget.stop().animate({height: height}, 'fast', $.proxy(function() {
			this.$toggleTarget.height('auto');
		}, this));
	},

	turnOff: function()
	{
		this.$innerContainer.stop().animate({marginLeft: Craft.LightSwitch.offMargin}, 'fast');
		this.$input.val('');
		this.on = false;
		this.settings.onChange();

		this.$toggleTarget.stop().animate({height: 0}, 'fast');
	},

	toggle: function(event)
	{
		if (!this.on)
			this.turnOn();
		else
			this.turnOff();
	},

	_onMouseDown: function()
	{
		this.addListener(Garnish.$doc, 'mouseup', '_onMouseUp')
	},

	_onMouseUp: function()
	{
		this.removeListener(Garnish.$doc, 'mouseup');

		// Was this a click?
		if (!this.dragger.dragging)
			this.toggle();
	},

	_onKeyDown: function(event)
	{
		switch (event.keyCode)
		{
			case Garnish.SPACE_KEY:
				this.toggle();
				event.preventDefault();
				break;
			case Garnish.RIGHT_KEY:
				this.turnOn();
				event.preventDefault();
				break;
			case Garnish.LEFT_KEY:
				this.turnOff();
				event.preventDefault();
				break;
		}
	},

	_getMargin: function()
	{
		return parseInt(this.$innerContainer.css('marginLeft'))
	},

	_onDragStart: function()
	{
		this.dragStartMargin = this._getMargin();
	},

	_onDrag: function()
	{
		var margin = this.dragStartMargin + this.dragger.mouseDistX;

		if (margin < Craft.LightSwitch.offMargin)
			margin = Craft.LightSwitch.offMargin;
		else if (margin > 0)
			margin = 0;

		this.$innerContainer.css('marginLeft', margin);
	},

	_onDragStop: function()
	{
		var margin = this._getMargin();

		if (margin > -16)
			this.turnOn();
		else
			this.turnOff();
	},

	destroy: function()
	{
		this.base();
		this.dragger.destroy();
	}

}, {
	offMargin: -50,
	defaults: {
		onChange: function(){}
	}
});


/**
 * File Manager.
 */
Craft.ProgressBar = Garnish.Base.extend({

    $uploadProgress: null,
    $uploadProgressBar: null,

    _itemCount: 0,
    _processedItemCount: 0,


    init: function($element)
    {
        this.$uploadProgress = $element;
        this.$uploadProgressBar = $('.assets-pb-bar', this.$uploadProgress);

        this.resetProgressBar();
    },

    /**
     * Reset the progress bar
     */
    resetProgressBar: function ()
    {
        // Set it to 1 so that 0 is not 100%
        this.setItemCount(1);
        this.setProcessedItemCount(0);
        this.updateProgressBar();

    },

    /**
     * Fade to invisible, hide it using a class and reset opacity to visible
     */
    hideProgressBar: function ()
    {
        this.$uploadProgress.fadeTo('fast', 0.01, $.proxy(function() {
            this.$uploadProgress.addClass('hidden').fadeTo(1, 1, function () {});
        }, this));
    },

    showProgressBar: function ()
    {
        this.$uploadProgress.removeClass('hidden');
    },

    setItemCount: function (count)
    {
        this._itemCount = count;
    },

    incrementItemCount: function (count)
    {
        this._itemCount += count;
    },

    setProcessedItemCount: function (count)
    {
        this._processedItemCount = count;
    },

    incrementProcessedItemCount: function (count)
    {
        this._processedItemCount += count;
    },

    updateProgressBar: function ()
    {
        // Only fools would allow accidental division by zero.
        this._itemCount = Math.max(this._itemCount, 1);

        var width = Math.min(100, Math.round(100 * this._processedItemCount / this._itemCount));

        this.setProgressPercentage(width);
    },

    setProgressPercentage: function (percentage)
    {
        this.$uploadProgressBar.width(percentage + '%');
    }
});

/**
 * File Manager.
 */
Craft.PromptHandler = Garnish.Base.extend({

    $modalContainerDiv: null,
    $prompt: null,
    $promptApplyToRemainingContainer: null,
    $promptApplyToRemainingCheckbox: null,
    $promptApplyToRemainingLabel: null,
    $promptButtons: null,


    _prompts: [],
    _promptBatchCallback: $.noop,
    _promptBatchReturnData: [],
    _promptBatchNum: 0,

    init: function()
    {

    },

    resetPrompts: function ()
    {
        this._prompts = [];
        this._promptBatchCallback = $.noop;
        this._promptBatchReturnData = [];
        this._promptBatchNum = 0;
    },

    addPrompt: function (prompt)
    {
        this._prompts.push(prompt);
    },

    getPromptCount: function ()
    {
        return this._prompts.length;
    },

    showBatchPrompts: function (callback)
    {
        this._promptBatchCallback = callback;
        this._promptBatchReturnData = [];
        this._promptBatchNum = 0;

        this._showNextPromptInBatch();
    },

    _showNextPromptInBatch: function()
    {
        var prompt = this._prompts[this._promptBatchNum].prompt,
            remainingInBatch = this._prompts.length - (this._promptBatchNum + 1);

        this._showPrompt(prompt.message, prompt.choices, $.proxy(this, '_handleBatchPromptSelection'), remainingInBatch);
    },

    /**
     * Handles a prompt choice selection.
     *
     * @param choice
     * @param applyToRemaining
     * @private
     */
    _handleBatchPromptSelection: function(choice, applyToRemaining)
    {
        var prompt = this._prompts[this._promptBatchNum],
            remainingInBatch = this._prompts.length - (this._promptBatchNum + 1);

        // Record this choice
        var choiceData = $.extend(prompt, {choice: choice});
        this._promptBatchReturnData.push(choiceData);

        // Are there any remaining items in the batch?
        if (remainingInBatch)
        {
            // Get ready to deal with the next prompt
            this._promptBatchNum++;

            // Apply the same choice to the remaining items?
            if (applyToRemaining)
            {
                this._handleBatchPromptSelection(choice, true);
            }
            else
            {
                // Show the next prompt
                this._showNextPromptInBatch();
            }
        }
        else
        {
            // All done! Call the callback
            if (typeof this._promptBatchCallback == 'function')
            {
                this._promptBatchCallback(this._promptBatchReturnData);
            }
        }
    },

    /**
     * Show the user prompt with a given message and choices, plus an optional "Apply to remaining" checkbox.
     *
     * @param string message
     * @param array choices
     * @param function callback
     * @param int itemsToGo
     */
    _showPrompt: function(message, choices, callback, itemsToGo)
    {
        this._promptCallback = callback;

        if (this.modal == null) {
            this.modal = new Garnish.Modal({closeOtherModals: false});
        }

        if (this.$modalContainerDiv == null) {
            this.$modalContainerDiv = $('<div class="modal prompt-modal"></div>').addClass().appendTo(Garnish.$bod);
        }

        this.$prompt = $('<div class="body"></div>').appendTo(this.$modalContainerDiv.empty());

        this.$promptMessage = $('<p class="prompt-msg"/>').appendTo(this.$prompt);

        $('<p>').html(Craft.t('What do you want to do?')).appendTo(this.$prompt);

        this.$promptApplyToRemainingContainer = $('<label class="assets-applytoremaining"/>').appendTo(this.$prompt).hide();
        this.$promptApplyToRemainingCheckbox = $('<input type="checkbox"/>').appendTo(this.$promptApplyToRemainingContainer);
        this.$promptApplyToRemainingLabel = $('<span/>').appendTo(this.$promptApplyToRemainingContainer);
        this.$promptButtons = $('<div class="buttons"/>').appendTo(this.$prompt);


        this.modal.setContainer(this.$modalContainerDiv);

        this.$promptMessage.html(message);

        for (var i = 0; i < choices.length; i++)
        {
            var $btn = $('<div class="btn" data-choice="'+choices[i].value+'">' + choices[i].title + '</div>');

            this.addListener($btn, 'activate', function(ev)
            {
                var choice = ev.currentTarget.getAttribute('data-choice'),
                    applyToRemaining = this.$promptApplyToRemainingCheckbox.prop('checked');

                this._selectPromptChoice(choice, applyToRemaining);
            });

            this.$promptButtons.append($btn).append('<br />');
        }

        if (itemsToGo)
        {
            this.$promptApplyToRemainingContainer.show();
            this.$promptApplyToRemainingLabel.html(' ' + Craft.t('Apply this to the {number} remaining conflicts?', {number: itemsToGo}));
        }

        this.modal.show();
        this.modal.removeListener(Garnish.Modal.$shade, 'click');
        this.addListener(Garnish.Modal.$shade, 'click', '_cancelPrompt');

    },

    /**
     * Handles when a user selects one of the prompt choices.
     *
     * @param choice
     * @param applyToRemaining
     * @private
     */
    _selectPromptChoice: function(choice, applyToRemaining)
    {
        this.$prompt.fadeOut('fast', $.proxy(function() {
            this.modal.hide();
            this._promptCallback(choice, applyToRemaining);
        }, this));
    },

    /**
     * Cancels the prompt.
     */
    _cancelPrompt: function()
    {
        this._selectPromptChoice('cancel', true);
    }
});

/*

 http://github.com/valums/file-uploader

 Multiple file upload component with progress-bar, drag-and-drop.

 Copyright (C) 2011 by Andris Valums

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

(function(){

//
// Helper functions
//

    var QqUploader = QqUploader || {};

    /**
     * Adds all missing properties from second obj to first obj
     */

    QqUploader.extend = function(first, second){
        for (var prop in second){
            first[prop] = second[prop];
        }
    };

    /**
     * Searches for a given element in the array, returns -1 if it is not present.
     * @param {Number} [from] The index at which to begin the search
     */
    QqUploader.indexOf = function(arr, elt, from){
        if (arr.indexOf) return arr.indexOf(elt, from);

        from = from || 0;
        var len = arr.length;

        if (from < 0) from += len;

        for (; from < len; from++){

            if (from in arr && arr[from] === elt){

                return from;
            }
        }

        return -1;

    };

    QqUploader.getUniqueId = (function(){
        var id = 0;
        return function(){ return id++; };
    })();

//
// Events

    QqUploader.attach = function(element, type, fn){
        if (element.addEventListener){
            element.addEventListener(type, fn, false);
        } else if (element.attachEvent){
            element.attachEvent('on' + type, fn);
        }
    };
    QqUploader.detach = function(element, type, fn){
        if (element.removeEventListener){
            element.removeEventListener(type, fn, false);
        } else if (element.attachEvent){
            element.detachEvent('on' + type, fn);
        }
    };

    QqUploader.preventDefault = function(e){
        if (e.preventDefault){
            e.preventDefault();
        } else{
            e.returnValue = false;
        }
    };

//
// Node manipulations

    /**
     * Insert node a before node b.
     */
    QqUploader.insertBefore = function(a, b){
        b.parentNode.insertBefore(a, b);
    };
    QqUploader.remove = function(element){
        element.parentNode.removeChild(element);
    };

    QqUploader.contains = function(parent, descendant){

        // compareposition returns false in this case
        if (parent == descendant) return true;

        if (parent.contains){
            return parent.contains(descendant);
        } else {
            return !!(descendant.compareDocumentPosition(parent) & 8);
        }
    };

    /**
     * Creates and returns element from html string
     * Uses innerHTML to create an element
     */
    QqUploader.toElement = (function(){
        var div = document.createElement('div');
        return function(html){
            div.innerHTML = html;
            var element = div.firstChild;
            div.removeChild(element);
            return element;
        };
    })();

//
// Node properties and attributes

    /**
     * Sets styles for an element.
     * Fixes opacity in IE6-8.
     */
    QqUploader.css = function(element, styles){
        if (styles.opacity != null){
            if (typeof element.style.opacity != 'string' && typeof(element.filters) != 'undefined'){
                styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
            }
        }
        QqUploader.extend(element.style, styles);
    };
    QqUploader.hasClass = function(element, name){
        var re = new RegExp('(^| )' + name + '( |$)');
        return re.test(element.className);
    };
    QqUploader.addClass = function(element, name){
        if (!QqUploader.hasClass(element, name)){
            element.className += ' ' + name;
        }
    };
    QqUploader.removeClass = function(element, name){
        var re = new RegExp('(^| )' + name + '( |$)');
        element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
    };
    QqUploader.setText = function(element, text){
        element.innerText = text;
        element.textContent = text;
    };

//
// Selecting elements

    QqUploader.children = function(element){
        var children = [],
            child = element.firstChild;

        while (child){
            if (child.nodeType == 1){
                children.push(child);
            }
            child = child.nextSibling;
        }

        return children;
    };

    QqUploader.getByClass = function(element, className){
        if (element.querySelectorAll){
            return element.querySelectorAll('.' + className);
        }

        var result = [];
        var candidates = element.getElementsByTagName("*");
        var len = candidates.length;

        for (var i = 0; i < len; i++){
            if (QqUploader.hasClass(candidates[i], className)){
                result.push(candidates[i]);
            }
        }
        return result;
    };

    /**
     * obj2url() takes a json-object as argument and generates
     * a querystring. pretty much like jQuery.param()
     *

     * how to use:
     *
     *    `QqUploader.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
     *
     * will result in:
     *
     *    `http://any.url/upload?otherParam=value&a=b&c=d`
     *
     * @param  Object JSON-Object
     * @param  String current querystring-part
     * @return String encoded querystring
     */
    QqUploader.obj2url = function(obj, temp, prefixDone){
        var uristrings = [],
            prefix = '&',
            add = function(nextObj, i){
                var nextTemp = temp

                    ? (/\[\]$/.test(temp)) // prevent double-encoding
                    ? temp
                    : temp+'['+i+']'
                    : i;
                if ((nextTemp != 'undefined') && (i != 'undefined')) {

                    uristrings.push(
                        (typeof nextObj === 'object')

                            ? QqUploader.obj2url(nextObj, nextTemp, true)
                            : (Object.prototype.toString.call(nextObj) === '[object Function]')
                            ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                            : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)

                    );
                }
            };

        if (!prefixDone && temp) {
            prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
            uristrings.push(temp);
            uristrings.push(QqUploader.obj2url(obj));
        } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj != 'undefined') ) {
            // we wont use a for-in-loop on an array (performance)
            for (var i = 0, len = obj.length; i < len; ++i){
                add(obj[i], i);
            }
        } else if ((typeof obj != 'undefined') && (obj !== null) && (typeof obj === "object")){
            // for anything else but a scalar, we will use for-in-loop
            for (var i in obj){
                add(obj[i], i);
            }
        } else {
            uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
        }

        return uristrings.join(prefix)
            .replace(/^&/, '')
            .replace(/%20/g, '+');

    };

//
//
// Uploader Classes
//
//

    var QqUploader = QqUploader || {};

    /**
     * Creates upload button, validates upload, but doesn't create file list or dd.

     */
    QqUploader.FileUploaderBasic = function(o){
        this._options = {
            // set to true to see the server response
            debug: false,
            action: '/server/upload',
            params: {},
            button: null,
            multiple: true,
            maxConnections: 3,
            // validation

            allowedExtensions: [],

            sizeLimit: 0,

            minSizeLimit: 0,

            // events
            // return false to cancel submit
            onSubmit: function(id, fileName){},
            onProgress: function(id, fileName, loaded, total){},
            onComplete: function(id, fileName, responseJSON){},
            onCancel: function(id, fileName){},
            // messages

            messages: {
                typeError: "{file} has invalid extension. Only {extensions} are allowed.",
                sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
                minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
                emptyError: "{file} is empty, please select files again without it.",
                onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."

            },
            showMessage: function(message){
                alert(message);
            }

        };
        QqUploader.extend(this._options, o);

        // number of files being uploaded
        this._filesInProgress = 0;
        this._handler = this._createUploadHandler();

        if (this._options.button){

            this._button = this._createUploadButton(this._options.button);
        }

        this._preventLeaveInProgress();

    };

    QqUploader.FileUploaderBasic.prototype = {
        setParams: function(params){
            this._options.params = params;
        },
        getInProgress: function(){
            return this._filesInProgress;

        },
        _createUploadButton: function(element){
            var self = this;

            return new QqUploader.UploadButton({
                element: element,
                multiple: this._options.multiple && QqUploader.UploadHandlerXhr.isSupported(),
                onChange: function(input){
                    self._onInputChange(input);
                }

            });

        },

        _createUploadHandler: function(){
            var self = this,
                handlerClass;

            if(QqUploader.UploadHandlerXhr.isSupported()){

                handlerClass = 'UploadHandlerXhr';

            } else {
                handlerClass = 'UploadHandlerForm';
            }

            var handler = new QqUploader[handlerClass]({
                debug: this._options.debug,
                action: this._options.action,

                maxConnections: this._options.maxConnections,

                onProgress: function(id, fileName, loaded, total){

                    self._onProgress(id, fileName, loaded, total);
                    self._options.onProgress(id, fileName, loaded, total);

                },

                onComplete: function(id, fileName, result){
                    self._onComplete(id, fileName, result);
                    self._options.onComplete(id, fileName, result);
                },
                onCancel: function(id, fileName){
                    self._onCancel(id, fileName);
                    self._options.onCancel(id, fileName);
                }
            });

            return handler;
        },

        _preventLeaveInProgress: function(){
            var self = this;

            QqUploader.attach(window, 'beforeunload', function(e){
                if (!self._filesInProgress){return;}

                var e = e || window.event;
                // for ie, ff
                e.returnValue = self._options.messages.onLeave;
                // for webkit
                return self._options.messages.onLeave;

            });

        },

        _onSubmit: function(id, fileName){
            this._filesInProgress++;

        },
        _onProgress: function(id, fileName, loaded, total){

        },
        _onComplete: function(id, fileName, result){
            this._filesInProgress--;

            if (result.error){
                this._options.showMessage(result.error);
            }

        },
        _onCancel: function(id, fileName){
            this._filesInProgress--;

        },
        _onInputChange: function(input){
            if (this._handler instanceof QqUploader.UploadHandlerXhr){

                this._uploadFileList(input.files);

            } else {

                if (this._validateFile(input)){

                    this._uploadFile(input);

                }

            }

            this._button.reset();

        },

        _uploadFileList: function(files){
            for (var i=0; i<files.length; i++){
                if ( !this._validateFile(files[i])){
                    return;
                }

            }

            for (var i=0; i<files.length; i++){
                this._uploadFile(files[i]);

            }

        },

        _uploadFile: function(fileContainer){

            var id = this._handler.add(fileContainer);
            var fileName = this._handler.getName(id);

            if (this._options.onSubmit(id, fileName) !== false){
                this._onSubmit(id, fileName);
                this._handler.upload(id, this._options.params);
            }
        },

        _validateFile: function(file){
            var name, size;

            if (file.value){
                // it is a file input

                // get input value and remove path to normalize
                name = file.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari
                name = file.fileName != null ? file.fileName : file.name;
                size = file.fileSize != null ? file.fileSize : file.size;
            }

            if (! this._isAllowedExtension(name)){

                this._error('typeError', name);
                return false;

            } else if (size === 0){

                this._error('emptyError', name);
                return false;

            } else if (size && this._options.sizeLimit && size > this._options.sizeLimit){

                this._error('sizeError', name);
                return false;

            } else if (size && size < this._options.minSizeLimit){
                this._error('minSizeError', name);
                return false;

            }

            return true;

        },
        _error: function(code, fileName){
            var message = this._options.messages[code];

            function r(name, replacement){ message = message.replace(name, replacement); }

            r('{file}', this._formatFileName(fileName));

            r('{extensions}', this._options.allowedExtensions.join(', '));
            r('{sizeLimit}', this._formatSize(this._options.sizeLimit));
            r('{minSizeLimit}', this._formatSize(this._options.minSizeLimit));

            this._options.showMessage(message);

        },
        _formatFileName: function(name){
            if (name.length > 33){
                name = name.slice(0, 19) + '...' + name.slice(-13);

            }
            return name;
        },
        _isAllowedExtension: function(fileName){
            var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
            var allowed = this._options.allowedExtensions;

            if (!allowed.length){return true;}

            for (var i=0; i<allowed.length; i++){
                if (allowed[i].toLowerCase() == ext){ return true;}

            }

            return false;
        },

        _formatSize: function(bytes){
            var i = -1;

            do {
                bytes = bytes / 1024;
                i++;

            } while (bytes > 99);

            return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];

        }
    };

    /**
     * Class that creates upload widget with drag-and-drop and file list
     * @inherits QqUploader.FileUploaderBasic
     */
    QqUploader.FileUploader = function(o){
        // call parent constructor
        QqUploader.FileUploaderBasic.apply(this, arguments);

        // additional options

        QqUploader.extend(this._options, {
            element: null,
            // if set, will be used instead of QqUploader-upload-list in template
            listElement: null,

            template: '<div class="QqUploader-uploader">' +

                '<div class="QqUploader-upload-drop-area"><span>Drop files here to upload</span></div>' +
                '<div class="QqUploader-upload-button">Upload a file</div>' +
                '<ul class="QqUploader-upload-list"></ul>' +

                '</div>',

            // template for one item in file list
            fileTemplate: '<li>' +
                '<span class="QqUploader-upload-file"></span>' +
                '<span class="QqUploader-upload-spinner"></span>' +
                '<span class="QqUploader-upload-size"></span>' +
                '<a class="QqUploader-upload-cancel" href="#">Cancel</a>' +
                '<span class="QqUploader-upload-failed-text">Failed</span>' +
                '</li>',

            classes: {
                // used to get elements from templates
                button: 'QqUploader-upload-button',
                drop: 'QqUploader-upload-drop-area',
                dropActive: 'QqUploader-upload-drop-area-active',
                list: 'QqUploader-upload-list',

                file: 'QqUploader-upload-file',
                spinner: 'QqUploader-upload-spinner',
                size: 'QqUploader-upload-size',
                cancel: 'QqUploader-upload-cancel',

                // added to list item when upload completes
                // used in css to hide progress spinner
                success: 'QqUploader-upload-success',
                fail: 'QqUploader-upload-fail'
            }
        });
        // overwrite options with user supplied

        QqUploader.extend(this._options, o);

        this._element = this._options.element;
        this._element.innerHTML = this._options.template;

        this._listElement = this._options.listElement || this._find(this._element, 'list');

        this._classes = this._options.classes;

        this._button = this._createUploadButton(this._find(this._element, 'button'));

        this._bindCancelEvent();
        this._setupDragDrop();
    };

// inherit from Basic Uploader
    QqUploader.extend(QqUploader.FileUploader.prototype, QqUploader.FileUploaderBasic.prototype);

    QqUploader.extend(QqUploader.FileUploader.prototype, {
        /**
         * Gets one of the elements listed in this._options.classes
         **/
        _find: function(parent, type){

            var element = QqUploader.getByClass(parent, this._options.classes[type])[0];

            if (!element){
                throw new Error('element not found: ' + type);
            }

            return element;
        },
        _setupDragDrop: function(){
            var self = this,
                dropArea = this._find(this._element, 'drop');

            var dz = new QqUploader.UploadDropZone({
                element: dropArea,
                onEnter: function(e){
                    QqUploader.addClass(dropArea, self._classes.dropActive);
                    e.stopPropagation();
                },
                onLeave: function(e){
                    e.stopPropagation();
                },
                onLeaveNotDescendants: function(e){
                    QqUploader.removeClass(dropArea, self._classes.dropActive);

                },
                onDrop: function(e){
                    dropArea.style.display = 'none';
                    QqUploader.removeClass(dropArea, self._classes.dropActive);
                    self._uploadFileList(e.dataTransfer.files);

                }
            });

            dropArea.style.display = 'none';

            QqUploader.attach(document, 'dragenter', function(e){

                if (!dz._isValidFileDrag(e)) return;

                dropArea.style.display = 'block';

            });

            QqUploader.attach(document, 'dragleave', function(e){
                if (!dz._isValidFileDrag(e)) return;

                var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
                // only fire when leaving document out
                if ( ! relatedTarget || relatedTarget.nodeName == "HTML"){

                    dropArea.style.display = 'none';

                }
            });

        },
        _onSubmit: function(id, fileName){
            QqUploader.FileUploaderBasic.prototype._onSubmit.apply(this, arguments);
            this._addToList(id, fileName);

        },
        _onProgress: function(id, fileName, loaded, total){
            QqUploader.FileUploaderBasic.prototype._onProgress.apply(this, arguments);

            var item = this._getItemByFileId(id);
            var size = this._find(item, 'size');
            size.style.display = 'inline';

            var text;

            if (loaded != total){
                text = Math.round(loaded / total * 100) + '% from ' + this._formatSize(total);
            } else {

                text = this._formatSize(total);
            }

            QqUploader.setText(size, text);

        },
        _onComplete: function(id, fileName, result){
            QqUploader.FileUploaderBasic.prototype._onComplete.apply(this, arguments);

            // mark completed
            var item = this._getItemByFileId(id);

            QqUploader.remove(this._find(item, 'cancel'));
            QqUploader.remove(this._find(item, 'spinner'));

            if (result.success){
                QqUploader.addClass(item, this._classes.success);

            } else {
                QqUploader.addClass(item, this._classes.fail);
            }

        },
        _addToList: function(id, fileName){
            var item = QqUploader.toElement(this._options.fileTemplate);

            item.qqfileId = id;

            var fileElement = this._find(item, 'file');

            QqUploader.setText(fileElement, this._formatFileName(fileName));
            this._find(item, 'size').style.display = 'none';

            this._listElement.appendChild(item);
        },
        _getItemByFileId: function(id){
            var item = this._listElement.firstChild;

            // there can't be txt nodes in dynamically created list
            // and we can  use nextSibling
            while (item){

                if (item.qqfileId == id) return item;

                item = item.nextSibling;
            }

        },
        /**
         * delegate click event for cancel link

         **/
        _bindCancelEvent: function(){
            var self = this,
                list = this._listElement;

            QqUploader.attach(list, 'click', function(e){

                e = e || window.event;
                var target = e.target || e.srcElement;

                if (QqUploader.hasClass(target, self._classes.cancel)){

                    QqUploader.preventDefault(e);

                    var item = target.parentNode;
                    self._handler.cancel(item.qqfileId);
                    QqUploader.remove(item);
                }
            });
        }

    });

    QqUploader.UploadDropZone = function(o){
        this._options = {
            element: null,

            onEnter: function(e){},
            onLeave: function(e){},

            // is not fired when leaving element by hovering descendants

            onLeaveNotDescendants: function(e){},

            onDrop: function(e){}

        };
        QqUploader.extend(this._options, o);

        this._element = this._options.element;

        this._disableDropOutside();
        this._attachEvents();

    };

    QqUploader.UploadDropZone.prototype = {
        _disableDropOutside: function(e){
            // run only once for all instances
            if (!QqUploader.UploadDropZone.dropOutsideDisabled ){

                QqUploader.attach(document, 'dragover', function(e){
                    if (e.dataTransfer){
                        e.dataTransfer.dropEffect = 'none';
                        e.preventDefault();

                    }

                });

                QqUploader.UploadDropZone.dropOutsideDisabled = true;

            }

        },
        _attachEvents: function(){
            var self = this;

            QqUploader.attach(self._element, 'dragover', function(e){
                if (!self._isValidFileDrag(e)) return;

                var effect = e.dataTransfer.effectAllowed;
                if (effect == 'move' || effect == 'linkMove'){
                    e.dataTransfer.dropEffect = 'move'; // for FF (only move allowed)

                } else {

                    e.dataTransfer.dropEffect = 'copy'; // for Chrome
                }

                e.stopPropagation();
                e.preventDefault();

            });

            QqUploader.attach(self._element, 'dragenter', function(e){
                if (!self._isValidFileDrag(e)) return;

                self._options.onEnter(e);
            });

            QqUploader.attach(self._element, 'dragleave', function(e){
                if (!self._isValidFileDrag(e)) return;

                self._options.onLeave(e);

                var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);

                // do not fire when moving a mouse over a descendant
                if (QqUploader.contains(this, relatedTarget)) return;

                self._options.onLeaveNotDescendants(e);

            });

            QqUploader.attach(self._element, 'drop', function(e){
                if (!self._isValidFileDrag(e)) return;

                e.preventDefault();
                self._options.onDrop(e);
            });

        },
        _isValidFileDrag: function(e){
            var dt = e.dataTransfer,
            // do not check dt.types.contains in webkit, because it crashes safari 4

                isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;

            // dt.effectAllowed is none in Safari 5
            // dt.types.contains check is for firefox

            return dt && dt.effectAllowed != 'none' &&

                (dt.files || (!isWebkit && dt.types.contains && dt.types.contains('Files')));

        }

    };

    QqUploader.UploadButton = function(o){
        this._options = {
            element: null,

            // if set to true adds multiple attribute to file input

            multiple: false,
            // name attribute of file input
            name: 'file',
            onChange: function(input){},
            hoverClass: 'QqUploader-upload-button-hover',
            focusClass: 'QqUploader-upload-button-focus'

        };

        QqUploader.extend(this._options, o);

        this._element = this._options.element;

        // make button suitable container for input
        QqUploader.css(this._element, {
            position: 'relative',
            overflow: 'hidden',
            // Make sure browse button is in the right side
            // in Internet Explorer
            direction: 'ltr'
        });

        this._input = this._createInput();
    };

    QqUploader.UploadButton.prototype = {
        /* returns file input element */

        getInput: function(){
            return this._input;
        },
        /* cleans/recreates the file input */
        reset: function(){
            if (this._input.parentNode){
                QqUploader.remove(this._input);

            }

            QqUploader.removeClass(this._element, this._options.focusClass);
            this._input = this._createInput();
        },

        _createInput: function(){

            var input = document.createElement("input");

            if (this._options.multiple){
                input.setAttribute("multiple", "multiple");
            }

            input.setAttribute("type", "file");
            input.setAttribute("name", this._options.name);

            QqUploader.css(input, {
                position: 'absolute',
                // in Opera only 'browse' button
                // is clickable and it is located at
                // the right side of the input
                right: 0,
                top: 0,
                fontFamily: 'Arial',
                // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
                fontSize: '118px',
                margin: 0,
                padding: 0,
                cursor: 'pointer',
                opacity: 0
            });

            this._element.appendChild(input);

            var self = this;
            QqUploader.attach(input, 'change', function(){
                self._options.onChange(input);
            });

            QqUploader.attach(input, 'mouseover', function(){
                QqUploader.addClass(self._element, self._options.hoverClass);
            });
            QqUploader.attach(input, 'mouseout', function(){
                QqUploader.removeClass(self._element, self._options.hoverClass);
            });
            QqUploader.attach(input, 'focus', function(){
                QqUploader.addClass(self._element, self._options.focusClass);
            });
            QqUploader.attach(input, 'blur', function(){
                QqUploader.removeClass(self._element, self._options.focusClass);
            });

            // IE and Opera, unfortunately have 2 tab stops on file input
            // which is unacceptable in our case, disable keyboard access
            if (window.attachEvent){
                // it is IE or Opera
                input.setAttribute('tabIndex', "-1");
            }

            return input;

        }

    };

    /**
     * Class for uploading files, uploading itself is handled by child classes
     */
    QqUploader.UploadHandlerAbstract = function(o){
        this._options = {
            debug: false,
            action: '/upload.php',
            // maximum number of concurrent uploads

            maxConnections: 999,
            onProgress: function(id, fileName, loaded, total){},
            onComplete: function(id, fileName, response){},
            onCancel: function(id, fileName){}
        };
        QqUploader.extend(this._options, o);

        this._queue = [];
        // params for files in queue
        this._params = [];
    };
    QqUploader.UploadHandlerAbstract.prototype = {
        log: function(str){
            if (this._options.debug && window.console) console.log('[uploader] ' + str);

        },
        /**
         * Adds file or file input to the queue
         * @returns id
         **/

        add: function(file){},
        /**
         * Sends the file identified by id and additional query params to the server
         */
        upload: function(id, params){
            var len = this._queue.push(id);

            var copy = {};

            QqUploader.extend(copy, params);
            this._params[id] = copy;

            // if too many active uploads, wait...
            if (len <= this._options.maxConnections){

                this._upload(id, this._params[id]);
            }
        },
        /**
         * Cancels file upload by id
         */
        cancel: function(id){
            this._cancel(id);
            this._dequeue(id);
        },
        /**
         * Cancells all uploads
         */
        cancelAll: function(){
            for (var i=0; i<this._queue.length; i++){
                this._cancel(this._queue[i]);
            }
            this._queue = [];
        },
        /**
         * Returns name of the file identified by id
         */
        getName: function(id){},
        /**
         * Returns size of the file identified by id
         */

        getSize: function(id){},
        /**
         * Returns id of files being uploaded or
         * waiting for their turn
         */
        getQueue: function(){
            return this._queue;
        },
        /**
         * Actual upload method
         */
        _upload: function(id){},
        /**
         * Actual cancel method
         */
        _cancel: function(id){},

        /**
         * Removes element from queue, starts upload of next
         */
        _dequeue: function(id){
            var i = QqUploader.indexOf(this._queue, id);
            this._queue.splice(i, 1);

            var max = this._options.maxConnections;

            if (this._queue.length >= max && i < max){
                var nextId = this._queue[max-1];
                this._upload(nextId, this._params[nextId]);
            }
        }

    };

    /**
     * Class for uploading files using form and iframe
     * @inherits QqUploader.UploadHandlerAbstract
     */
    QqUploader.UploadHandlerForm = function(o){
        QqUploader.UploadHandlerAbstract.apply(this, arguments);

        this._inputs = {};
    };
// @inherits QqUploader.UploadHandlerAbstract
    QqUploader.extend(QqUploader.UploadHandlerForm.prototype, QqUploader.UploadHandlerAbstract.prototype);

    QqUploader.extend(QqUploader.UploadHandlerForm.prototype, {
        add: function(fileInput){
            fileInput.setAttribute('name', 'qqfile');
            var id = 'QqUploader-upload-handler-iframe' + QqUploader.getUniqueId();

            this._inputs[id] = fileInput;

            // remove file input from DOM
            if (fileInput.parentNode){
                QqUploader.remove(fileInput);
            }

            return id;
        },
        getName: function(id){
            // get input value and remove path to normalize
            return this._inputs[id].value.replace(/.*(\/|\\)/, "");
        },

        _cancel: function(id){
            this._options.onCancel(id, this.getName(id));

            delete this._inputs[id];

            var iframe = document.getElementById(id);
            if (iframe){
                // to cancel request set src to something else
                // we use src="javascript:false;" because it doesn't
                // trigger ie6 prompt on https
                iframe.setAttribute('src', 'javascript:false;');

                QqUploader.remove(iframe);
            }
        },

        _upload: function(id, params){

            var input = this._inputs[id];

            if (!input){
                throw new Error('file with passed id was not added, or already uploaded or cancelled');
            }

            var fileName = this.getName(id);

            var iframe = this._createIframe(id);
            var form = this._createForm(iframe, params);
            form.appendChild(input);

            var self = this;
            this._attachLoadEvent(iframe, function(){

                self.log('iframe loaded');

                var response = self._getIframeContentJSON(iframe);

                self._options.onComplete(id, fileName, response);
                self._dequeue(id);

                delete self._inputs[id];
                // timeout added to fix busy state in FF3.6
                setTimeout(function(){
                    QqUploader.remove(iframe);
                }, 1);
            });

            form.submit();

            QqUploader.remove(form);

            return id;
        },

        _attachLoadEvent: function(iframe, callback){
            QqUploader.attach(iframe, 'load', function(){
                // when we remove iframe from dom
                // the request stops, but in IE load
                // event fires
                if (!iframe.parentNode){
                    return;
                }

                // fixing Opera 10.53
                if (iframe.contentDocument &&
                    iframe.contentDocument.body &&
                    iframe.contentDocument.body.innerHTML == "false"){
                    // In Opera event is fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    // when we upload file with iframe
                    return;
                }

                callback();
            });
        },
        /**
         * Returns json object received by iframe from server.
         */
        _getIframeContentJSON: function(iframe){
            // iframe.contentWindow.document - for IE<7
            var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
                response;

            this.log("converting iframe's innerHTML to JSON");
            this.log("innerHTML = " + doc.body.innerHTML);

            try {
                response = eval("(" + doc.body.innerHTML + ")");
            } catch(err){
                response = {};
            }

            return response;
        },
        /**
         * Creates iframe with unique name
         */
        _createIframe: function(id){
            // We can't use following code as the name attribute
            // won't be properly registered in IE6, and new window
            // on form submit will open
            // var iframe = document.createElement('iframe');
            // iframe.setAttribute('name', id);

            var iframe = QqUploader.toElement('<iframe src="javascript:false;" name="' + id + '" />');
            // src="javascript:false;" removes ie6 prompt on https

            iframe.setAttribute('id', id);

            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            return iframe;
        },
        /**
         * Creates form, that will be submitted to iframe
         */
        _createForm: function(iframe, params){
            // We can't use the following code in IE6
            // var form = document.createElement('form');
            // form.setAttribute('method', 'post');
            // form.setAttribute('enctype', 'multipart/form-data');
            // Because in this case file won't be attached to request
            var form = QqUploader.toElement('<form method="post" enctype="multipart/form-data"></form>');

            var queryString = QqUploader.obj2url(params, this._options.action);

            form.setAttribute('action', queryString);
            form.setAttribute('target', iframe.name);
            form.style.display = 'none';
            document.body.appendChild(form);

            return form;
        }
    });

    /**
     * Class for uploading files using xhr
     * @inherits QqUploader.UploadHandlerAbstract
     */
    QqUploader.UploadHandlerXhr = function(o){
        QqUploader.UploadHandlerAbstract.apply(this, arguments);

        this._files = [];
        this._xhrs = [];

        // current loaded size in bytes for each file

        this._loaded = [];
    };

// static method
    QqUploader.UploadHandlerXhr.isSupported = function(){
        var input = document.createElement('input');
        input.type = 'file';

        return (
            'multiple' in input &&
                typeof File != "undefined" &&
                typeof (new XMLHttpRequest()).upload != "undefined" );

    };

// @inherits QqUploader.UploadHandlerAbstract
    QqUploader.extend(QqUploader.UploadHandlerXhr.prototype, QqUploader.UploadHandlerAbstract.prototype)

    QqUploader.extend(QqUploader.UploadHandlerXhr.prototype, {
        /**
         * Adds file to the queue
         * Returns id to use with upload, cancel
         **/

        add: function(file){
            if (!(file instanceof File)){
                throw new Error('Passed obj in not a File (in QqUploader.UploadHandlerXhr)');
            }

            return this._files.push(file) - 1;

        },
        getName: function(id){

            var file = this._files[id];
            // fix missing name in Safari 4
            return file.fileName != null ? file.fileName : file.name;

        },
        getSize: function(id){
            var file = this._files[id];
            return file.fileSize != null ? file.fileSize : file.size;
        },

        /**
         * Returns uploaded bytes for file identified by id

         */

        getLoaded: function(id){
            return this._loaded[id] || 0;

        },

        /**
         * Sends the file identified by id and additional query params to the server
         *
         * @param id int
         * @param params object of name-value string pairs
         * @private
         */
        _upload: function(id, params){
            var file = this._files[id],
                name = this.getName(id),
                size = this.getSize(id);

            this._loaded[id] = 0;

            var xhr = this._xhrs[id] = new XMLHttpRequest();
            var self = this;

            xhr.upload.onprogress = function(e){
                if (e.lengthComputable){
                    self._loaded[id] = e.loaded;
                    self._options.onProgress(id, name, e.loaded, e.total);
                }
            };

            xhr.onreadystatechange = function(){

                if (xhr.readyState == 4){
                    self._onComplete(id, xhr);

                }
            };

            // build query string
            params = params || {};
            params['qqfile'] = name;
            var queryString = QqUploader.obj2url(params, this._options.action);

            xhr.open("POST", queryString, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(name));
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.send(file);
        },
        _onComplete: function(id, xhr){
            // the request was aborted/cancelled
            if (!this._files[id]) return;

            var name = this.getName(id);
            var size = this.getSize(id);

            this._options.onProgress(id, name, size, size);

            if (xhr.status == 200){
                this.log("xhr - server response received");
                this.log("responseText = " + xhr.responseText);

                var response;

                try {
                    response = eval("(" + xhr.responseText + ")");
                } catch(err){
                    response = {};
                }

                this._options.onComplete(id, name, response);

            } else {

                this._options.onComplete(id, name, {});
            }

            this._files[id] = null;
            this._xhrs[id] = null;

            this._dequeue(id);

        },
        _cancel: function(id){
            this._options.onCancel(id, this.getName(id));

            this._files[id] = null;

            if (this._xhrs[id]){
                this._xhrs[id].abort();
                this._xhrs[id] = null;

            }
        }
    });

    window.qqUploader = QqUploader;
})();


/**
 * Slug Generator
 */
Craft.SlugGenerator = Craft.BaseInputGenerator.extend({

	generateTargetValue: function(sourceVal)
	{
		// Remove HTML tags
		sourceVal = sourceVal.replace(/<(.*?)>/g, '');

		// Remove inner-word punctuation
		sourceVal = sourceVal.replace(/['"‘’“”]/g, '');

		// Make it lowercase
		sourceVal = sourceVal.toLowerCase();

		// Get the "words".  Split on anything that is not a unicode letter or number.
		// Preiods are OK, too.
		var words = Craft.filterArray(XRegExp.matchChain(sourceVal, [XRegExp('[\\p{L}\\p{N}\\.]+')]));

		if (words.length)
		{
			return words.join('-');
		}
		else
		{
			return '';
		}
	}
});


/**
 * Structure drag class
 */
Craft.StructureDrag = Garnish.Drag.extend({

	elementIndex: null,
	moveAction: null,
	maxDepth: null,
	draggeeDepth: null,

	$helperLi: null,
	$targets: null,
	_: null,
	draggeeHeight: null,

	init: function(elementIndex, moveAction, maxDepth)
	{
		this.elementIndex = elementIndex;
		this.moveAction = moveAction;
		this.maxDepth = maxDepth;

		this.$insertion = $('<li class="draginsertion"/>');
		this._ = {};

		var $items = this.elementIndex.$elementContainer.find('li');

		this.base($items, {
			handle: '.element:first, .move:first',
			helper: $.proxy(this, 'getHelper')
		});
	},

	getHelper: function($helper)
	{
		this.$helperLi = $helper;
		var $ul = $('<ul class="structureview draghelper"/>').append($helper);
		$helper.css('padding-left', this.$draggee.css('padding-left'));
		$helper.find('.move').removeAttr('title');
		return $ul;
	},

	onDragStart: function()
	{
		this.$targets = $();

		// Recursively find each of the targets, in the order they appear to be in
		this.findTargets(this.elementIndex.$elementContainer);

		// How deep does the rabbit hole go?
		this.draggeeDepth = 0;
		var $level = this.$draggee;
		do {
			this.draggeeDepth++;
			$level = $level.find('> ul > li');
		} while($level.length);

		// Collapse the draggee
		this.draggeeHeight = this.$draggee.height();
		this.$draggee.animate({
			height: 0
		}, 'fast', $.proxy(function() {
			this.$draggee.addClass('hidden');
		}, this));
		this.base();

		this.addListener(Garnish.$doc, 'keydown', function(ev) {
			if (ev.keyCode == Garnish.ESC_KEY)
			{
				this.cancelDrag();
			}
		});
	},

	findTargets: function($ul)
	{
		var $lis = $ul.children().not(this.$draggee);

		for (var i = 0; i < $lis.length; i++)
		{
			var $li = $($lis[i]);
			this.$targets = this.$targets.add($li.children('.row'));

			if (!$li.hasClass('collapsed'))
			{
				this.findTargets($li.children('ul'));
			}
		}
	},

	onDrag: function()
	{
		if (this._.$closestTarget)
		{
			this._.$closestTarget.removeClass('draghover');
			this.$insertion.remove();
		}

		// First let's find the closest target
		this._.$closestTarget = null;
		this._.closestTargetPos = null;
		this._.closestTargetYDiff = null;
		this._.closestTargetOffset = null;
		this._.closestTargetHeight = null;

		for (this._.i = 0; this._.i < this.$targets.length; this._.i++)
		{
			this._.$target = $(this.$targets[this._.i]);
			this._.targetOffset = this._.$target.offset();
			this._.targetHeight = this._.$target.outerHeight();
			this._.targetYMidpoint = this._.targetOffset.top + (this._.targetHeight / 2);
			this._.targetYDiff = Math.abs(this.mouseY - this._.targetYMidpoint);

			if (this._.i == 0 || (this.mouseY >= this._.targetOffset.top + 5 && this._.targetYDiff < this._.closestTargetYDiff))
			{
				this._.$closestTarget = this._.$target;
				this._.closestTargetPos = this._.i;
				this._.closestTargetYDiff = this._.targetYDiff;
				this._.closestTargetOffset = this._.targetOffset;
				this._.closestTargetHeight = this._.targetHeight;
			}
			else
			{
				// Getting colder
				break;
			}
		}

		if (!this._.$closestTarget)
		{
			return;
		}

		// Are we hovering above the first row?
		if (this._.closestTargetPos == 0 && this.mouseY < this._.closestTargetOffset.top + 5)
		{
			this.$insertion.prependTo(this.elementIndex.$elementContainer);
		}
		else
		{
			this._.$closestTargetLi = this._.$closestTarget.parent();
			this._.closestTargetDepth = this._.$closestTargetLi.data('depth');

			// Is there a next row?
			if (this._.closestTargetPos < this.$targets.length - 1)
			{
				this._.$nextTargetLi = $(this.$targets[this._.closestTargetPos+1]).parent();
				this._.nextTargetDepth = this._.$nextTargetLi.data('depth');
			}
			else
			{
				this._.$nextTargetLi = null;
				this._.nextTargetDepth = null;
			}

			// Are we hovering between this row and the next one?
			this._.hoveringBetweenRows = (this.mouseY >= this._.closestTargetOffset.top + this._.closestTargetHeight - 5);

			/**
			 * Scenario 1: Both rows have the same depth.
			 *
			 *     * Row 1
			 *     ----------------------
			 *     * Row 2
			 */

			if (this._.$nextTargetLi && this._.nextTargetDepth == this._.closestTargetDepth)
			{
				if (this._.hoveringBetweenRows)
				{
					if (!this.maxDepth || this.maxDepth >= (this._.closestTargetDepth + this.draggeeDepth - 1))
					{
						// Position the insertion after the closest target
						this.$insertion.insertAfter(this._.$closestTargetLi);
					}

				}
				else
				{
					if (!this.maxDepth || this.maxDepth >= (this._.closestTargetDepth + this.draggeeDepth))
					{
						this._.$closestTarget.addClass('draghover');
					}
				}
			}

			/**
			 * Scenario 2: Next row is a child of this one.
			 *
			 *     * Row 1
			 *     ----------------------
			 *         * Row 2
			 */

			else if (this._.$nextTargetLi && this._.nextTargetDepth > this._.closestTargetDepth)
			{
				if (!this.maxDepth || this.maxDepth >= (this._.nextTargetDepth + this.draggeeDepth - 1))
				{
					if (this._.hoveringBetweenRows)
					{
						// Position the insertion as the first child of the closest target
						this.$insertion.insertBefore(this._.$nextTargetLi);
					}
					else
					{
						this._.$closestTarget.addClass('draghover');
						this.$insertion.appendTo(this._.$closestTargetLi.children('ul'));
					}
				}
			}

			/**
			 * Scenario 3: Next row is a child of a parent node, or there is no next row.
			 *
			 *         * Row 1
			 *     ----------------------
			 *     * Row 2
			 */

			else
			{
				if (this._.hoveringBetweenRows)
				{
					// Determine which <li> to position the insertion after
					this._.draggeeX = this.mouseX - this.targetItemMouseDiffX;
					this._.$parentLis = this._.$closestTarget.parentsUntil(this.elementIndex.$elementContainer, 'li');
					this._.$closestParentLi = null;
					this._.closestParentLiXDiff = null;
					this._.closestParentDepth = null;

					for (this._.i = 0; this._.i < this._.$parentLis.length; this._.i++)
					{
						this._.$parentLi = $(this._.$parentLis[this._.i]);
						this._.parentLiXDiff = Math.abs(this._.$parentLi.offset().left - this._.draggeeX);
						this._.parentDepth = this._.$parentLi.data('depth');

						if ((!this.maxDepth || this.maxDepth >= (this._.parentDepth + this.draggeeDepth - 1)) && (
							!this._.$closestParentLi || (
								this._.parentLiXDiff < this._.closestParentLiXDiff &&
								(!this._.$nextTargetLi || this._.parentDepth >= this._.nextTargetDepth)
							)
						))
						{
							this._.$closestParentLi = this._.$parentLi;
							this._.closestParentLiXDiff = this._.parentLiXDiff;
							this._.closestParentDepth = this._.parentDepth;
						}
					}

					if (this._.$closestParentLi)
					{
						this.$insertion.insertAfter(this._.$closestParentLi);
					}
				}
				else
				{
					if (!this.maxDepth || this.maxDepth >= (this._.closestTargetDepth + this.draggeeDepth))
					{
						this._.$closestTarget.addClass('draghover');
					}
				}
			}
		}
	},

	cancelDrag: function()
	{
		this.$insertion.remove();

		if (this._.$closestTarget)
		{
			this._.$closestTarget.removeClass('draghover');
		}

		this.onMouseUp();
	},

	onDragStop: function()
	{
		// Are we repositioning the draggee?
		if (this._.$closestTarget && (this.$insertion.parent().length || this._.$closestTarget.hasClass('draghover')))
		{
			// Are we about to leave the draggee's original parent childless?
			if (!this.$draggee.siblings().length)
			{
				var $draggeeParent = this.$draggee.parent();
			}
			else
			{
				var $draggeeParent = null;
			}

			if (this.$insertion.parent().length)
			{
				// Make sure the insertion isn't right next to the draggee
				var $closestSiblings = this.$insertion.next().add(this.$insertion.prev());

				if ($.inArray(this.$draggee[0], $closestSiblings) == -1)
				{
					this.$insertion.replaceWith(this.$draggee);
					var moved = true;
				}
				else
				{
					this.$insertion.remove();
					var moved = false;
				}
			}
			else
			{
				var $ul = this._.$closestTargetLi.children('ul');

				// Make sure this is a different parent than the draggee's
				if (!$draggeeParent || !$ul.length || $ul[0] != $draggeeParent[0])
				{
					if (!$ul.length)
					{
						var $toggle = $('<div class="toggle" title="'+Craft.t('Show/hide children')+'"/>').prependTo(this._.$closestTarget);
						this.elementIndex.initToggle($toggle);

						$ul = $('<ul>').appendTo(this._.$closestTargetLi);
					}
					else if (this._.$closestTargetLi.hasClass('collapsed'))
					{
						this._.$closestTarget.children('.toggle').trigger('click');
					}

					this.$draggee.appendTo($ul);
					var moved = true;
				}
				else
				{
					var moved = false;
				}
			}

			// Remove the class either way
			this._.$closestTarget.removeClass('draghover');

			if (moved)
			{
				// Now deal with the now-childless parent
				if ($draggeeParent)
				{
					$draggeeParent.siblings('.row').children('.toggle').remove();
					$draggeeParent.remove();
				}

				// Has the depth changed?
				var newDepth = this.$draggee.parentsUntil(this.elementIndex.$elementContainer, 'li').length + 1;

				if (newDepth != this.$draggee.data('depth'))
				{
					// Correct the helper's padding if moving to/from depth 1
					if (this.$draggee.data('depth') == 1)
					{
						this.$helperLi.animate({
							'padding-left': 38
						}, 'fast');
					}
					else if (newDepth == 1)
					{
						this.$helperLi.animate({
							'padding-left': 8
						}, 'fast');
					}

					this.setDepth(this.$draggee, newDepth);
				}

				// Make it real
				var data = {
					id:       this.$draggee.children('.row').data('id'),
					prevId:   this.$draggee.prev().children('.row').data('id'),
					parentId: this.$draggee.parent('ul').parent('li').children('.row').data('id')
				};

				Craft.postActionRequest(this.moveAction, data, function(response, textStatus) {

					if (textStatus == 'success')
					{
						Craft.cp.displayNotice(Craft.t('New order saved.'));
					}

				});
			}
		}

		// Animate things back into place
		this.$draggee.removeClass('hidden').animate({
			height: this.draggeeHeight
		}, 'fast', $.proxy(function() {
			this.$draggee.css('height', 'auto');
		}, this));

		this.returnHelpersToDraggees();

		this.base();
	},

	setDepth: function($li, depth)
	{
		$li.data('depth', depth);

		var indent = 8 + (depth - 1) * 35;
		this.$draggee.children('.row').css({
			'margin-left':  '-'+indent+'px',
			'padding-left': indent+'px'
		});

		var $childLis = $li.children('ul').children();

		for (var i = 0; i < $childLis.length; i++)
		{
			this.setDepth($($childLis[i]), depth+1);
		}
	}

});


/**
 * Tag select input
 */
Craft.TagSelectInput = Craft.BaseElementSelectInput.extend({

	id: null,
	name: null,
	tagSetId: null,
	elementId: null,
	elementSort: null,
	searchTimeout: null,
	menu: null,

	$container: null,
	$elementsContainer: null,
	$elements: null,
	$addTagInput: null,
	$spinner: null,

	init: function(id, name, tagSetId, elementId, hasFields)
	{
		this.id = id;
		this.name = name;
		this.tagSetId = tagSetId;
		this.elementId = elementId;

		this.$container = $('#'+this.id);
		this.$elementsContainer = this.$container.children('.elements');
		this.$elements = this.$elementsContainer.children();
		this.$addTagInput = this.$container.children('.add').children('.text');
		this.$spinner = this.$addTagInput.next();

		this.totalElements = this.$elements.length;

		this.elementSelect = new Garnish.Select(this.$elements, {
			multi: true,
			filter: ':not(.delete)'
		});

		this.elementSort = new Garnish.DragSort({
			container: this.$elementsContainer,
			filter: $.proxy(function() {
				return this.elementSelect.getSelectedItems();
			}, this),
			caboose: $('<div class="caboose"/>'),
			onSortChange: $.proxy(function() {
				this.elementSelect.resetItemOrder();
			}, this)
		});

		this.initElements(this.$elements);

		this.addListener(this.$addTagInput, 'textchange', $.proxy(function()
		{
			if (this.searchTimeout)
			{
				clearTimeout(this.searchTimeout);
			}

			this.searchTimeout = setTimeout($.proxy(this, 'searchForTags'), 500);
		}, this));

		this.addListener(this.$addTagInput, 'keypress', function(ev)
		{
			if (ev.keyCode == Garnish.RETURN_KEY)
			{
				ev.preventDefault();

				if (this.searchMenu)
				{
					this.selectTag(this.searchMenu.$options[0]);
				}
			}
		});

		this.addListener(this.$addTagInput, 'focus', function()
		{
			if (this.searchMenu)
			{
				this.searchMenu.show();
			}
		});

		this.addListener(this.$addTagInput, 'blur', function()
		{
			setTimeout($.proxy(function()
			{
				if (this.searchMenu)
				{
					this.searchMenu.hide();
				}
			}, this), 1);
		});

		if (hasFields)
		{
			this._attachHUDEvents();
		}
	},

	searchForTags: function()
	{
		if (this.searchMenu)
		{
			this.killSearchMenu();
		}

		var val = this.$addTagInput.val();

		if (val)
		{
			this.$spinner.removeClass('hidden');

			var excludeIds = [];

			for (var i = 0; i < this.$elements.length; i++)
			{
				var id = $(this.$elements[i]).data('id');

				if (id)
				{
					excludeIds.push(id);
				}
			}

			if (this.elementId)
			{
				excludeIds.push(this.elementId);
			}

			var data = {
				search:     this.$addTagInput.val(),
				tagSetId:   this.tagSetId,
				excludeIds: excludeIds
			};

			Craft.postActionRequest('tags/searchForTags', data, $.proxy(function(response, textStatus) {

				this.$spinner.addClass('hidden');

				if (textStatus == 'success')
				{
					var $menu = $('<div class="menu tagmenu"/>').appendTo(Garnish.$bod),
						$ul = $('<ul/>').appendTo($menu);

					if (!response.exactMatch)
					{
						var $li = $('<li/>').appendTo($ul);
						$('<a class="hover"/>').appendTo($li).text(data.search);
					}

					for (var i = 0; i < response.tags.length; i++)
					{
						var $li = $('<li/>').appendTo($ul),
							$a = $('<a/>').appendTo($li).text(response.tags[i].name).data('id', response.tags[i].id);

						if (response.exactMatch && i == 0)
						{
							$a.addClass('hover');
						}
					}

					this.searchMenu = new Garnish.Menu($menu, {
						attachToElement: this.$addTagInput,
						onOptionSelect: $.proxy(this, 'selectTag')
					});

					this.searchMenu.show();
				}

			}, this));
		}
		else
		{
			this.$spinner.addClass('hidden');
		}
	},

	selectTag: function(option)
	{
		var $option = $(option);

		var $element = $('<div class="element removable"/>').appendTo(this.$elementsContainer),
			$input = $('<input type="hidden" name="'+this.name+'[]"/>').appendTo($element)

		if ($option.data('id'))
		{
			$element.data('id', $option.data('id'));
			$input.val($option.data('id'));
		}
		else
		{
			$input.val('new:'+$option.text());
		}

		$('<a class="delete icon" title="'+Craft.t('Remove')+'"></a>').appendTo($element);
		$('<span class="label">'+$option.text()+'</span>').appendTo($element);

		var margin = -($element.outerWidth()+10);
		this.$addTagInput.css('margin-left', margin+'px');
		this.$addTagInput.animate({
			marginLeft: 0
		}, 'fast');

		this.$elements = this.$elements.add($element);
		this.totalElements++;

		this.initElements($element);

		this.killSearchMenu();
		this.$addTagInput.val('');
		this.$addTagInput.focus();
	},

	killSearchMenu: function()
	{
		this.searchMenu.hide();
		this.searchMenu.destroy();
		this.searchMenu = null;
	},

	_attachHUDEvents: function ()
	{
		this.removeListener(this.$elements, 'dlbclick');
		this.addListener(this.$elements, 'dblclick', $.proxy(this, '_editProperties'));
	},

	_editProperties: function (event)
	{
		var $target = $(event.currentTarget);
		if (!$target.data('ElementEditor'))
		{
			var settings = {
				elementId: $target.attr('data-id'),
				$trigger: $target,
				loadContentAction: 'tags/editTagContent',
				saveContentAction: 'tags/saveTagContent'
			};
			$target.data('ElementEditor', new Craft.ElementEditor(settings));
		}

		$target.data('ElementEditor').show();
	}

});


/**
 * File Manager.
 */
Craft.Uploader = Garnish.Base.extend({

    uploader: null,

    init: function($element, settings)
    {

        settings = $.extend(this.defaultSettings, settings);
        settings.element = $element[0];
        this.uploader = new qqUploader.FileUploader(settings);
    },

    /**
     * Set uploader parameters
     * @param paramObject
     */
    setParams: function (paramObject)
    {
        this.uploader.setParams(paramObject);
    },

    /**
     * Get the number of uploads in progress
     * @returns {*}
     */
    getInProgress: function ()
    {
        return this.uploader.getInProgress();
    },

    defaultSettings: {
        action:       Craft.actionUrl + '/assets/uploadFile',
        template:     '<div class="assets-qq-uploader">'
            +   '<div class="assets-qq-upload-drop-area"></div>'
            +   '<a href="javascript:;" class="btn submit assets-qq-upload-button" data-icon="↑" style="position: relative; overflow: hidden; direction: ltr; " role="button">' + Craft.t('Upload files') + '</a>'
            +   '<ul class="assets-qq-upload-list hidden"></ul>'
            + '</div>',

        fileTemplate: '<li>'
            +   '<span class="assets-qq-upload-file"></span>'
            +   '<span class="assets-qq-upload-spinner"></span>'
            +   '<span class="assets-qq-upload-size"></span>'
            +   '<a class="assets-qq-upload-cancel" href="#">Cancel</a>'
            +   '<span class="assets-qq-upload-failed-text">Failed</span>'
            + '</li>',

        classes:      {
            button:     'assets-qq-upload-button',
            drop:       'assets-qq-upload-drop-area',
            dropActive: 'assets-qq-upload-drop-area-active',
            list:       'assets-qq-upload-list',

            file:       'assets-qq-upload-file',
            spinner:    'assets-qq-upload-spinner',
            size:       'assets-qq-upload-size',
            cancel:     'assets-qq-upload-cancel',

            success:    'assets-qq-upload-success',
            fail:       'assets-qq-upload-fail'
        },

        onSubmit:     $.noop,
        onProgress:   $.noop,
        onComplete:   $.noop
    }
});

})(jQuery);
