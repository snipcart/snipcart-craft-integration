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

// Load the deafult configs
$generalConfig = require_once(CRAFT_APP_PATH.'etc/config/defaults/general.php');
$dbConfig = require_once(CRAFT_APP_PATH.'etc/config/defaults/db.php');

/**
 * Merges a base config array with a custom config array,
 * taking environment-specific configs into account.
 *
 * @param array &$baseConfig
 * @param array $customConfig
 */
function mergeConfigs(&$baseConfig, $customConfig)
{
	// Is this a multi-environment config?
	if (array_key_exists('*', $customConfig))
	{
		foreach ($customConfig as $env => $envConfig)
		{
			if ($env == '*' || strpos(CRAFT_ENVIRONMENT, $env) !== false)
			{
				$baseConfig = array_merge($baseConfig, $envConfig);
			}
		}
	}
	else
	{
		$baseConfig = array_merge($baseConfig, $customConfig);
	}
}

// Does craft/config/general.php exist? (It used to be called blocks.php so maybe not.)
if (file_exists(CRAFT_CONFIG_PATH.'general.php'))
{
	if (is_array($customGeneralConfig = @include(CRAFT_CONFIG_PATH.'general.php')))
	{
		mergeConfigs($generalConfig, $customGeneralConfig);
	}
}
else if (file_exists(CRAFT_CONFIG_PATH.'blocks.php'))
{
	// Originally blocks.php defined a $blocksConfig variable, and then later returned an array directly.
	if (is_array($customGeneralConfig = require_once(CRAFT_CONFIG_PATH.'blocks.php')))
	{
		mergeConfigs($generalConfig, $customGeneralConfig);
	}
	else if (isset($blocksConfig))
	{
		$generalConfig = array_merge($generalConfig, $blocksConfig);
		unset($blocksConfig);
	}
}

// Originally db.php defined a $dbConfig variable.
if (is_array($customDbConfig = require_once(CRAFT_CONFIG_PATH.'db.php')))
{
	mergeConfigs($dbConfig, $customDbConfig);
}

if ($generalConfig['devMode'] == true)
{
	error_reporting(E_ALL & ~E_STRICT);
	ini_set('display_errors', 1);
}
else
{
	error_reporting(0);
	ini_set('display_errors', 0);
}

ini_set('log_errors', 1);
ini_set('error_log', CRAFT_STORAGE_PATH.'runtime/logs/phperrors.log');

// Table prefixes cannot be longer than 5 characters
$tablePrefix = rtrim($dbConfig['tablePrefix'], '_');
if ($tablePrefix)
{
	if (strlen($tablePrefix) > 5)
	{
		$tablePrefix = substr($tablePrefix, 0, 5);
	}

	$tablePrefix .= '_';
}

$configArray = array(

	// autoloading model and component classes
	'import' => array(
		'application.framework.cli.commands.*',
		'application.framework.console.*',
		'application.framework.logging.CLogger',
	),

	'componentAliases' => array(
		'app.assetsourcetypes.BaseAssetSourceType',
		'app.assetsourcetypes.GoogleCloudAssetSourceType',
		'app.assetsourcetypes.LocalAssetSourceType',
		'app.assetsourcetypes.RackspaceAssetSourceType',
		'app.assetsourcetypes.S3AssetSourceType',
		'app.controllers.AppController',
		'app.controllers.AssetSourcesController',
		'app.controllers.AssetTransformsController',
		'app.controllers.AssetsController',
		'app.controllers.BaseController',
		'app.controllers.DashboardController',
		'app.controllers.ElementsController',
		'app.controllers.EmailMessagesController',
		'app.controllers.EntriesController',
		'app.controllers.EntryRevisionsController',
		'app.controllers.FieldsController',
		'app.controllers.GlobalsController',
		'app.controllers.InstallController',
		'app.controllers.LocalizationController',
		'app.controllers.PluginsController',
		'app.controllers.RebrandController',
		'app.controllers.RoutesController',
		'app.controllers.SectionsController',
		'app.controllers.SystemSettingsController',
		'app.controllers.TagsController',
		'app.controllers.TemplatesController',
		'app.controllers.ToolsController',
		'app.controllers.UpdateController',
		'app.controllers.UserSettingsController',
		'app.controllers.UsersController',
		'app.elementtypes.AssetElementType',
		'app.elementtypes.BaseElementType',
		'app.elementtypes.EntryElementType',
		'app.elementtypes.GlobalSetElementType',
		'app.elementtypes.IElementType',
		'app.elementtypes.TagElementType',
		'app.elementtypes.UserElementType',
		'app.enums.AttributeType',
		'app.enums.ColumnType',
		'app.enums.ComponentType',
		'app.enums.CraftPackage',
		'app.enums.ElementType',
		'app.enums.EmailerType',
		'app.enums.InstallStatus',
		'app.enums.InvalidLoginMode',
		'app.enums.LicenseKeyStatus',
		'app.enums.LogLevel',
		'app.enums.PatchManifestFileAction',
		'app.enums.PluginVersionUpdateStatus',
		'app.enums.PtAccountCredentialStatus',
		'app.enums.RequirementResult',
		'app.enums.SectionType',
		'app.enums.UserStatus',
		'app.enums.VersionUpdateStatus',
		'app.etc.behaviors.AppBehavior',
		'app.etc.behaviors.BaseBehavior',
		'app.etc.behaviors.FieldLayoutBehavior',
		'app.etc.cache.FileCache',
		'app.etc.components.BaseApplicationComponent',
		'app.etc.components.BaseComponentType',
		'app.etc.components.BaseSavableComponentType',
		'app.etc.components.IComponentType',
		'app.etc.components.ISavableComponentType',
		'app.etc.console.ConsoleCommandRunner',
		'app.etc.console.commands.MigrateCommand',
		'app.etc.console.commands.QuerygenCommand',
		'app.etc.dates.DateFormatter',
		'app.etc.dates.DateInterval',
		'app.etc.dates.DateTime',
		'app.etc.db.BaseMigration',
		'app.etc.db.DbBackup',
		'app.etc.db.DbCommand',
		'app.etc.db.DbConnection',
		'app.etc.db.schemas.MysqlSchema',
		'app.etc.errors.DbConnectException',
		'app.etc.errors.ErrorException',
		'app.etc.errors.ErrorHandler',
		'app.etc.errors.EtException',
		'app.etc.errors.Exception',
		'app.etc.errors.HttpException',
		'app.etc.errors.TemplateLoaderException',
		'app.etc.et.Et',
		'app.etc.events.Event',
		'app.etc.i18n.LocaleData',
		'app.etc.i18n.PhpMessageSource',
		'app.etc.io.BaseIO',
		'app.etc.io.File',
		'app.etc.io.Folder',
		'app.etc.io.IZip',
		'app.etc.io.Image',
		'app.etc.io.PclZip',
		'app.etc.io.Zip',
		'app.etc.io.ZipArchive',
		'app.etc.logging.FileLogRoute',
		'app.etc.logging.LogRouter',
		'app.etc.logging.Logger',
		'app.etc.logging.ProfileLogRoute',
		'app.etc.logging.WebLogRoute',
		'app.etc.plugins.BasePlugin',
		'app.etc.requirements.Requirement',
		'app.etc.requirements.RequirementsChecker',
		'app.etc.search.SearchQuery',
		'app.etc.search.SearchQueryTerm',
		'app.etc.search.SearchQueryTermGroup',
		'app.etc.state.StatePersister',
		'app.etc.templating.StringTemplate',
		'app.etc.templating.twigextensions.CraftTwigExtension',
		'app.etc.templating.twigextensions.Exit_Node',
		'app.etc.templating.twigextensions.Exit_TokenParser',
		'app.etc.templating.twigextensions.IncludeResource_Node',
		'app.etc.templating.twigextensions.IncludeResource_TokenParser',
		'app.etc.templating.twigextensions.IncludeTranslations_Node',
		'app.etc.templating.twigextensions.IncludeTranslations_TokenParser',
		'app.etc.templating.twigextensions.NavItem_Node',
		'app.etc.templating.twigextensions.Nav_Node',
		'app.etc.templating.twigextensions.Nav_TokenParser',
		'app.etc.templating.twigextensions.Paginate_Node',
		'app.etc.templating.twigextensions.Paginate_TokenParser',
		'app.etc.templating.twigextensions.Redirect_Node',
		'app.etc.templating.twigextensions.Redirect_TokenParser',
		'app.etc.templating.twigextensions.RequireLogin_Node',
		'app.etc.templating.twigextensions.RequireLogin_TokenParser',
		'app.etc.templating.twigextensions.RequirePackage_Node',
		'app.etc.templating.twigextensions.RequirePackage_TokenParser',
		'app.etc.templating.twigextensions.RequirePermission_Node',
		'app.etc.templating.twigextensions.RequirePermission_TokenParser',
		'app.etc.templating.twigextensions.TemplateLoader',
		'app.etc.updates.Updater',
		'app.etc.users.UserIdentity',
		'app.etc.web.UrlManager',
		'app.extensions.NestedSetBehavior',
		'app.fieldtypes.AssetsFieldType',
		'app.fieldtypes.BaseElementFieldType',
		'app.fieldtypes.BaseFieldType',
		'app.fieldtypes.BaseOptionsFieldType',
		'app.fieldtypes.CheckboxesFieldType',
		'app.fieldtypes.ColorFieldType',
		'app.fieldtypes.DateFieldType',
		'app.fieldtypes.DropdownFieldType',
		'app.fieldtypes.EntriesFieldType',
		'app.fieldtypes.IFieldType',
		'app.fieldtypes.MultiOptionsFieldData',
		'app.fieldtypes.MultiSelectFieldType',
		'app.fieldtypes.NumberFieldType',
		'app.fieldtypes.OptionData',
		'app.fieldtypes.PlainTextFieldType',
		'app.fieldtypes.RadioButtonsFieldType',
		'app.fieldtypes.RelationFieldData',
		'app.fieldtypes.RichTextData',
		'app.fieldtypes.RichTextFieldType',
		'app.fieldtypes.SingleOptionFieldData',
		'app.fieldtypes.TableFieldType',
		'app.fieldtypes.TagsFieldType',
		'app.fieldtypes.UsersFieldType',
		'app.helpers.AppHelper',
		'app.helpers.ArrayHelper',
		'app.helpers.AssetsHelper',
		'app.helpers.CpHelper',
		'app.helpers.DateTimeHelper',
		'app.helpers.DbHelper',
		'app.helpers.ErrorHelper',
		'app.helpers.HtmlHelper',
		'app.helpers.IOHelper',
		'app.helpers.ImageHelper',
		'app.helpers.JsonHelper',
		'app.helpers.LocalizationHelper',
		'app.helpers.LoggingHelper',
		'app.helpers.MigrationHelper',
		'app.helpers.ModelHelper',
		'app.helpers.NumberHelper',
		'app.helpers.PathHelper',
		'app.helpers.StringHelper',
		'app.helpers.TemplateHelper',
		'app.helpers.UpdateHelper',
		'app.helpers.UrlHelper',
		'app.helpers.VariableHelper',
		'app.models.AccountSettingsModel',
		'app.models.AppNewReleaseModel',
		'app.models.AppUpdateModel',
		'app.models.AssetFileModel',
		'app.models.AssetFolderModel',
		'app.models.AssetIndexDataModel',
		'app.models.AssetOperationResponseModel',
		'app.models.AssetSourceModel',
		'app.models.AssetTransformIndexModel',
		'app.models.AssetTransformModel',
		'app.models.BaseComponentModel',
		'app.models.BaseElementModel',
		'app.models.BaseModel',
		'app.models.ContentModel',
		'app.models.ElementCriteriaModel',
		'app.models.EmailModel',
		'app.models.EmailSettingsModel',
		'app.models.EntryDraftModel',
		'app.models.EntryModel',
		'app.models.EntryTypeModel',
		'app.models.EntryVersionModel',
		'app.models.EtModel',
		'app.models.FieldGroupModel',
		'app.models.FieldLayoutFieldModel',
		'app.models.FieldLayoutModel',
		'app.models.FieldLayoutTabModel',
		'app.models.FieldModel',
		'app.models.FolderCriteriaModel',
		'app.models.GetHelpModel',
		'app.models.GlobalSetModel',
		'app.models.InfoModel',
		'app.models.LocaleModel',
		'app.models.Model',
		'app.models.PackagePurchaseOrderModel',
		'app.models.PasswordModel',
		'app.models.PluginNewReleaseModel',
		'app.models.PluginUpdateModel',
		'app.models.RebrandEmailModel',
		'app.models.SectionLocaleModel',
		'app.models.SectionModel',
		'app.models.SiteSettingsModel',
		'app.models.TagModel',
		'app.models.TagSetModel',
		'app.models.TryPackageModel',
		'app.models.UpdateModel',
		'app.models.UserGroupModel',
		'app.models.UserModel',
		'app.models.UsernameModel',
		'app.models.WidgetModel',
		'app.records.AssetFileRecord',
		'app.records.AssetFolderRecord',
		'app.records.AssetIndexDataRecord',
		'app.records.AssetSourceRecord',
		'app.records.AssetTransformRecord',
		'app.records.BaseRecord',
		'app.records.ElementLocaleRecord',
		'app.records.ElementRecord',
		'app.records.EmailMessageRecord',
		'app.records.EntryDraftRecord',
		'app.records.EntryLocaleRecord',
		'app.records.EntryRecord',
		'app.records.EntryTypeRecord',
		'app.records.EntryVersionRecord',
		'app.records.FieldGroupRecord',
		'app.records.FieldLayoutFieldRecord',
		'app.records.FieldLayoutRecord',
		'app.records.FieldLayoutTabRecord',
		'app.records.FieldRecord',
		'app.records.GlobalSetRecord',
		'app.records.LocaleRecord',
		'app.records.MigrationRecord',
		'app.records.PluginRecord',
		'app.records.RouteRecord',
		'app.records.SectionLocaleRecord',
		'app.records.SectionRecord',
		'app.records.SessionRecord',
		'app.records.StructuredEntryRecord',
		'app.records.SystemSettingsRecord',
		'app.records.TagRecord',
		'app.records.TagSetRecord',
		'app.records.UserGroupRecord',
		'app.records.UserGroup_UserRecord',
		'app.records.UserPermissionRecord',
		'app.records.UserPermission_UserGroupRecord',
		'app.records.UserPermission_UserRecord',
		'app.records.UserRecord',
		'app.records.WidgetRecord',
		'app.services.AssetIndexingService',
		'app.services.AssetSourcesService',
		'app.services.AssetTransformsService',
		'app.services.AssetsService',
		'app.services.ComponentsService',
		'app.services.ConfigService',
		'app.services.ContentService',
		'app.services.DashboardService',
		'app.services.ElementsService',
		'app.services.EmailMessagesService',
		'app.services.EmailService',
		'app.services.EntriesService',
		'app.services.EntryRevisionsService',
		'app.services.EtService',
		'app.services.FeedsService',
		'app.services.FieldsService',
		'app.services.GlobalsService',
		'app.services.HttpRequestService',
		'app.services.HttpSessionService',
		'app.services.ImagesService',
		'app.services.InstallService',
		'app.services.LocalizationService',
		'app.services.MigrationsService',
		'app.services.PathService',
		'app.services.PluginsService',
		'app.services.RelationsService',
		'app.services.ResourcesService',
		'app.services.RoutesService',
		'app.services.SearchService',
		'app.services.SectionsService',
		'app.services.SecurityService',
		'app.services.SystemSettingsService',
		'app.services.TagsService',
		'app.services.TemplatesService',
		'app.services.UpdatesService',
		'app.services.UserGroupsService',
		'app.services.UserPermissionsService',
		'app.services.UserSessionService',
		'app.services.UsersService',
		'app.tests.BaseTest',
		'app.tests.TestApplication',
		'app.tests.helpers.StubHelper',
		'app.tests.unit.AppBehaviorTest',
		'app.tests.unit.ArrayHelperTest',
		'app.tests.unit.ContentServiceTest',
		'app.tests.unit.CraftClassTest',
		'app.tests.unit.CraftTableTest',
		'app.tests.unit.EntriesServiceTest',
		'app.tests.unit.EntryModelTest',
		'app.tests.unit.HttpRequestsServiceTest',
		'app.tests.unit.PluginsTest',
		'app.tests.unit.RecentEntriesWidgetTest',
		'app.tests.unit.ResourceProcessorTest',
		'app.tests.unit.SectionModelTest',
		'app.tests.unit.StringHelperTest',
		'app.tests.unit.UrlHelperTest',
		'app.tools.AssetIndexTool',
		'app.tools.BaseTool',
		'app.tools.ClearCachesTool',
		'app.tools.DbBackupTool',
		'app.tools.ITool',
		'app.tools.SearchIndexTool',
		'app.validators.CompositeUniqueValidator',
		'app.validators.DateTimeValidator',
		'app.validators.HandleValidator',
		'app.validators.LocaleNumberValidator',
		'app.validators.LocaleValidator',
		'app.validators.UriValidator',
		'app.validators.UrlValidator',
		'app.variables.AppVariable',
		'app.variables.AssetSourceTypeVariable',
		'app.variables.BaseComponentTypeVariable',
		'app.variables.ConfigVariable',
		'app.variables.CpVariable',
		'app.variables.CraftVariable',
		'app.variables.DashboardVariable',
		'app.variables.ElementTypeVariable',
		'app.variables.ElementsVariable',
		'app.variables.EmailMessagesVariable',
		'app.variables.EntryRevisionsVariable',
		'app.variables.FeedsVariable',
		'app.variables.FieldTypeVariable',
		'app.variables.FieldsVariable',
		'app.variables.GlobalsVariable',
		'app.variables.HttpRequestVariable',
		'app.variables.ImageVariable',
		'app.variables.LocalizationVariable',
		'app.variables.LogoVariable',
		'app.variables.PaginateVariable',
		'app.variables.PluginVariable',
		'app.variables.PluginsVariable',
		'app.variables.RebrandVariable',
		'app.variables.RoutesVariable',
		'app.variables.SectionsVariable',
		'app.variables.SystemSettingsVariable',
		'app.variables.ToolVariable',
		'app.variables.UpdatesVariable',
		'app.variables.UserGroupsVariable',
		'app.variables.UserPermissionsVariable',
		'app.variables.UserSessionVariable',
		'app.variables.WidgetTypeVariable',
		'app.widgets.BaseWidget',
		'app.widgets.FeedWidget',
		'app.widgets.GetHelpWidget',
		'app.widgets.IWidget',
		'app.widgets.QuickPostWidget',
		'app.widgets.RecentEntriesWidget',
		'app.widgets.UpdatesWidget',
	),

	'components' => array(

		'db' => array(
			'connectionString'  => strtolower('mysql:host='.$dbConfig['server'].';dbname=').$dbConfig['database'].strtolower(';port='.$dbConfig['port'].';'),
			'emulatePrepare'    => true,
			'username'          => $dbConfig['user'],
			'password'          => $dbConfig['password'],
			'charset'           => $dbConfig['charset'],
			'tablePrefix'       => $tablePrefix,
			'driverMap'         => array('mysql' => 'Craft\MysqlSchema'),
			'class'             => 'Craft\DbConnection',
		),

		'config' => array(
			'class'         => 'Craft\ConfigService',
			'generalConfig' => $generalConfig,
			'dbConfig'      => $dbConfig,
		),

		'i18n' => array(
			'class' => 'Craft\LocalizationService',
		),

		'formatter' => array(
			'class' => 'CFormatter'
		),
	),

	'params' => array(
		'adminEmail'            => 'admin@website.com',
	)
);

// -------------------------------------------
//  CP routes
// -------------------------------------------

$cpRoutes['dashboard/settings/new']               = 'dashboard/settings/_widgetsettings';
$cpRoutes['dashboard/settings/(?P<widgetId>\d+)'] = 'dashboard/settings/_widgetsettings';

$cpRoutes['entries/(?P<sectionHandle>{handle})/new']              = array('action' => 'entries/editEntry');
$cpRoutes['entries/(?P<sectionHandle>{handle})/(?P<entryId>\d+)'] = array('action' => 'entries/editEntry');

$cpRoutes['globals/(?P<globalSetHandle>{handle})'] = 'globals';

$cpRoutes['updates/go/(?P<handle>[^/]*)'] = 'updates/_go';

$cpRoutes['settings']                                                             = array('action' => 'systemSettings/settingsIndex');
$cpRoutes['settings/assets']                                                      = array('action' => 'assetSources/sourceIndex');
$cpRoutes['settings/assets/sources/new']                                          = array('action' => 'assetSources/editSource');
$cpRoutes['settings/assets/sources/(?P<sourceId>\d+)']                            = array('action' => 'assetSources/editSource');
$cpRoutes['settings/assets/transforms']                                           = array('action' => 'assetTransforms/transformIndex');
$cpRoutes['settings/assets/transforms/new']                                       = array('action' => 'assetTransforms/editTransform');
$cpRoutes['settings/assets/transforms/(?P<handle>{handle})']                      = array('action' => 'assetTransforms/editTransform');
$cpRoutes['settings/fields/(?P<groupId>\d+)']                                     = 'settings/fields';
$cpRoutes['settings/fields/new']                                                  = 'settings/fields/_edit';
$cpRoutes['settings/fields/edit/(?P<fieldId>\d+)']                                = 'settings/fields/_edit';
$cpRoutes['settings/general']                                                     = array('action' => 'systemSettings/generalSettings');
$cpRoutes['settings/globals/new']                                                 = array('action' => 'systemSettings/editGlobalSet');
$cpRoutes['settings/globals/(?P<globalSetId>\d+)']                                = array('action' => 'systemSettings/editGlobalSet');
$cpRoutes['settings/plugins/(?P<pluginClass>{handle})']                           = 'settings/plugins/_settings';
$cpRoutes['settings/sections']                                                    = array('action' => 'sections/index');
$cpRoutes['settings/sections/new']                                                = array('action' => 'sections/editSection');
$cpRoutes['settings/sections/(?P<sectionId>\d+)']                                 = array('action' => 'sections/editSection');
$cpRoutes['settings/sections/(?P<sectionId>\d+)/entrytypes']                      = array('action' => 'sections/entryTypesIndex');
$cpRoutes['settings/sections/(?P<sectionId>\d+)/entrytypes/new']                  = array('action' => 'sections/editEntryType');
$cpRoutes['settings/sections/(?P<sectionId>\d+)/entrytypes/(?P<entryTypeId>\d+)'] = array('action' => 'sections/editEntryType');
$cpRoutes['settings/tags']                                                        = array('action' => 'tags/index');
$cpRoutes['settings/tags/new']                                                    = array('action' => 'tags/editTagSet');
$cpRoutes['settings/tags/(?P<tagSetId>\d+)']                                      = array('action' => 'tags/editTagSet');

$cpRoutes['settings/packages'] = array(
	'params' => array(
		'variables' => array(
			'stripeApiKey' => 'pk_J2nJpozDxit0V6wYuT8xSvCKArONs'
		)
	)
);

$cpRoutes['settings/routes'] = array(
	'params' => array(
		'variables' => array(
			'tokens' => array(
				'year'   => '\d{4}',
				'month'  => '(?:0[1-9]|1[012])',
				'day'    => '(?:0[1-9]|[12][0-9]|3[01])',
				'number' => '\d+',
				'page'   => '\d+',
				'tag'    => '[^\/]+',
				'*'      => '[^\/]+',
			)
		)
	)
);

$cpRoutes['myaccount'] = 'users/_edit/account';

// Lanugage package routes
$cpRoutes['pkgRoutes']['Localize']['entries/(?P<sectionHandle>{handle})/(?P<entryId>\d+)/(?P<localeId>\w+)'] = array('action' => 'entries/editEntry');
$cpRoutes['pkgRoutes']['Localize']['entries/(?P<sectionHandle>{handle})/new/(?P<localeId>\w+)']              = array('action' => 'entries/editEntry');
$cpRoutes['pkgRoutes']['Localize']['globals/(?P<localeId>\w+)/(?P<globalSetHandle>{handle})']                = 'globals';

// Publish Pro package routes
$cpRoutes['pkgRoutes']['PublishPro']['entries/(?P<sectionHandle>{handle})/(?P<entryId>\d+)/drafts/(?P<draftId>\d+)']     = array('action' => 'entries/editEntry');
$cpRoutes['pkgRoutes']['PublishPro']['entries/(?P<sectionHandle>{handle})/(?P<entryId>\d+)/versions/(?P<versionId>\d+)'] = array('action' => 'entries/editEntry');

// Users package routes
$cpRoutes['pkgRoutes']['Users']['myaccount/profile']             = 'users/_edit/profile';
$cpRoutes['pkgRoutes']['Users']['myaccount/info']                = 'users/_edit/info';
$cpRoutes['pkgRoutes']['Users']['myaccount/admin']               = 'users/_edit/admin';

$cpRoutes['pkgRoutes']['Users']['users/new']                     = 'users/_edit/account';
$cpRoutes['pkgRoutes']['Users']['users/(?P<userId>\d+)']         = 'users/_edit/account';
$cpRoutes['pkgRoutes']['Users']['users/(?P<userId>\d+)/profile'] = 'users/_edit/profile';
$cpRoutes['pkgRoutes']['Users']['users/(?P<userId>\d+)/admin']   = 'users/_edit/admin';
$cpRoutes['pkgRoutes']['Users']['users/(?P<userId>\d+)/info']    = 'users/_edit/info';

$cpRoutes['pkgRoutes']['Users']['settings/users']                         = 'settings/users/groups';
$cpRoutes['pkgRoutes']['Users']['settings/users/groups/new']              = 'settings/users/groups/_settings';
$cpRoutes['pkgRoutes']['Users']['settings/users/groups/(?P<groupId>\d+)'] = 'settings/users/groups/_settings';

// -------------------------------------------
//  Component config
// -------------------------------------------

$components['users']['class']                = 'Craft\UsersService';
$components['assets']['class']               = 'Craft\AssetsService';
$components['assetTransforms']['class']      = 'Craft\AssetTransformsService';
$components['assetIndexing']['class']        = 'Craft\AssetIndexingService';
$components['assetSources']['class']         = 'Craft\AssetSourcesService';
$components['content']['class']              = 'Craft\ContentService';
$components['dashboard']['class']            = 'Craft\DashboardService';
$components['email']['class']                = 'Craft\EmailService';
$components['elements']['class']             = 'Craft\ElementsService';
$components['entries']['class']              = 'Craft\EntriesService';
$components['et']['class']                   = 'Craft\EtService';
$components['feeds']['class']                = 'Craft\FeedsService';
$components['fields']['class']               = 'Craft\FieldsService';
$components['fieldTypes']['class']           = 'Craft\FieldTypesService';
$components['globals']['class']              = 'Craft\GlobalsService';
$components['install']['class']              = 'Craft\InstallService';
$components['images']['class']               = 'Craft\ImagesService';
$components['migrations']['class']           = 'Craft\MigrationsService';
$components['path']['class']                 = 'Craft\PathService';
$components['relations']['class']            = 'Craft\RelationsService';

$components['sections'] = array(
	'class' => 'Craft\SectionsService',
	'typeLimits' => array(
		'single'    => 5,
		'channel'   => 1,
		'structure' => 0
	)
);

$components['resources']['class']            = 'Craft\ResourcesService';
$components['resources']['dateParam']        = 'd';

$components['routes']['class']               = 'Craft\RoutesService';
$components['search']['class']               = 'Craft\SearchService';
$components['security']['class']             = 'Craft\SecurityService';
$components['systemSettings']['class']       = 'Craft\SystemSettingsService';
$components['tags']['class']                 = 'Craft\TagsService';
$components['templates']['class']            = 'Craft\TemplatesService';
$components['updates']['class']              = 'Craft\UpdatesService';

$components['components'] = array(
	'class' => 'Craft\ComponentsService',
	'types' => array(
		'assetSource' => array('subfolder' => 'assetsourcetypes', 'suffix' => 'AssetSourceType', 'instanceof' => 'BaseAssetSourceType'),
		'element'     => array('subfolder' => 'elementtypes',     'suffix' => 'ElementType',     'instanceof' => 'IElementType'),
		'field'       => array('subfolder' => 'fieldtypes',       'suffix' => 'FieldType',       'instanceof' => 'IFieldType'),
		'tool'        => array('subfolder' => 'tools',            'suffix' => 'Tool',            'instanceof' => 'ITool'),
		'widget'      => array('subfolder' => 'widgets',          'suffix' => 'Widget',          'instanceof' => 'IWidget'),
	)
);

$components['plugins'] = array(
	'class' => 'Craft\PluginsService',
	'componentTypes' => array(
		'controller'  => array('subfolder' => 'controllers',      'suffix' => 'Controller',      'instanceof' => 'BaseController'),
		'field'       => array('subfolder' => 'fieldtypes',       'suffix' => 'FieldType',       'instanceof' => 'IFieldType'),
		'helper'      => array('subfolder' => 'helpers',          'suffix' => 'Helper'),
		'model'       => array('subfolder' => 'models',           'suffix' => 'Model',           'instanceof' => 'BaseModel'),
		'record'      => array('subfolder' => 'records',          'suffix' => 'Record',          'instanceof' => 'BaseRecord'),
		'service'     => array('subfolder' => 'services',         'suffix' => 'Service',         'instanceof' => 'BaseApplicationComponent'),
		'variable'    => array('subfolder' => 'variables',        'suffix' => 'Variable'),
		'validator'   => array('subfolder' => 'validators',       'suffix' => 'Validator'),
		'widget'      => array('subfolder' => 'widgets',          'suffix' => 'Widget',          'instanceof' => 'IWidget'),
	)
);

// Plugins: This is for experimental use only.
// The Element Type API is likely to change before this config setting is removed.
if (!empty($generalConfig['enablePluginElementTypes']))
{
	$components['plugins']['componentTypes']['element'] = array('subfolder' => 'elementtypes', 'suffix' => 'ElementType', 'instanceof' => 'IElementType');
}

// Publish Pro package components
$components['pkgComponents']['PublishPro']['entryRevisions']['class'] = 'Craft\EntryRevisionsService';


// Users package components
$components['pkgComponents']['Users']['userGroups']['class']      = 'Craft\UserGroupsService';
$components['pkgComponents']['Users']['userPermissions']['class'] = 'Craft\UserPermissionsService';

// Rebrand package components
$components['pkgComponents']['Rebrand']['emailMessages']['class'] = 'Craft\EmailMessagesService';

$components['file']['class'] = 'Craft\File';
$components['messages']['class'] = 'Craft\PhpMessageSource';
$components['request']['class'] = 'Craft\HttpRequestService';
$components['request']['enableCookieValidation'] = true;
$components['viewRenderer']['class'] = 'Craft\TemplateProcessor';
$components['statePersister']['class'] = 'Craft\StatePersister';

$components['urlManager']['class'] = 'Craft\UrlManager';
$components['urlManager']['cpRoutes'] = $cpRoutes;
$components['urlManager']['pathParam'] = 'p';

$components['errorHandler'] = array(
	'class' => 'Craft\ErrorHandler',
	'errorAction' => 'templates/renderError'
);

$components['fileCache']['class'] = 'Craft\FileCache';

$components['log']['class'] = 'Craft\LogRouter';
$components['log']['routes'] = array(
	array(
		'class'  => 'Craft\FileLogRoute',
	),
	array(
		'class'         => 'Craft\WebLogRoute',
		'filter'        => 'CLogFilter',
		'showInFireBug' => true,
	),
	array(
		'class'         => 'Craft\ProfileLogRoute',
		'showInFireBug' => true,
	),
);

$components['httpSession']['autoStart']   = true;
$components['httpSession']['cookieMode']  = 'only';
$components['httpSession']['class']       = 'Craft\HttpSessionService';
$components['httpSession']['sessionName'] = 'CraftSessionId';

$components['userSession']['class'] = 'Craft\UserSessionService';
$components['userSession']['allowAutoLogin']  = true;
$components['userSession']['autoRenewCookie'] = true;

$configArray['components'] = array_merge($configArray['components'], $components);

return $configArray;
