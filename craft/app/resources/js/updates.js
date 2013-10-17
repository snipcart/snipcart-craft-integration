/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2013, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

(function($) {



Craft.postActionRequest('update/getAvailableUpdates', function(response, textStatus) {

	var $loading = $('#loading');

	$loading.fadeOut('fast', function()
	{
		$loading.remove();

		if (textStatus != 'success')
		{
			return;
		}

		if (response.error || response.errors)
		{
			if (response.errors && response.errors.length)
			{
				var error = response.errors[0];
			}
			else if (response.error)
			{
				var error = response.error;
			}

			$('<div/>').appendTo(Craft.cp.$content).html(error);

			return;
		}

		var showReleases = function(releases, product)
		{
			for (var i = 0; i < releases.length; i++)
			{
				$('<hr/>').appendTo(Craft.cp.$content);

				var release = releases[i],
					heading = product+' '+release.version;

				if (release.build)
				{
					heading += ' <span class="light">' +
						Craft.t('build {build}', { build: release.build }) +
						'</span>';
				}

				if (release.critical)
				{
					heading += ' <span class="critical">'+Craft.t('Critical')+'</span>'
				}

				$('<h2>'+heading+'</h2>').appendTo(Craft.cp.$content);
				$('<div class="notes"/>').appendTo(Craft.cp.$content).html(release.notes);
			}
		}

		if (response.app && response.app.releases && response.app.releases.length)
		{
			var downloadThat = function() {
				var src = response.app.manualDownloadEndpoint;
				$('<iframe/>', { src: src }).appendTo(Garnish.$bod).hide();
			};

			var autoUpdateThat = function() {
				window.location.href = Craft.getUrl('updates/go/craft');
			};

			var $heading = $('<h2 class="heading">'+Craft.t('You’ve got updates!')+'</h2>').appendTo(Craft.cp.$content),
				$buttonContainer = $('<div class="buttons"/>').appendTo(Craft.cp.$content);

			$('<div class="clear"/>').appendTo(Craft.cp.$content);

			// Is a manual update required?
			if (response.app.manualUpdateRequired)
			{
				var $downloadBtn = $('<div class="btn submit">'+Craft.t('Download')+'</div>').appendTo($buttonContainer);
			}
			else
			{
				var $btnGroup = $('<div class="btngroup"/>').appendTo($buttonContainer),
					$updateBtn = $('<div class="btn submit">'+Craft.t('Update')+'</div>').appendTo($btnGroup),
					$menuBtn = $('<div class="btn submit menubtn"/>').appendTo($btnGroup),
					$menu = $('<div class="menu" data-align="right"/>').appendTo($btnGroup),
					$menuUl = $('<ul/>').appendTo($menu),
					$downloadLi = $('<li/>').appendTo($menuUl),
					$downloadBtn = $('<a>'+Craft.t('Download')+'</a>').appendTo($downloadLi);

				new Garnish.MenuBtn($menuBtn);
			}

			// Has the license been updated?
			if (response.app.licenseUpdated)
			{
				var hud, $form, $submitBtn, $label, $checkbox, doThat;
				var showLicenseForm = function(originalEvent)
				{
					originalEvent.stopPropagation();

					if (!hud)
					{
						$form = $('<form><p>'+Craft.t('Craft’s <a href="http://buildwithcraft.com/license" target="_blank">Terms and Conditions</a> have changed.')+'</p></form>');
						$label = $('<label> '+Craft.t('I agree.')+' &nbsp;</label>').appendTo($form);
						$checkbox = $('<input type="checkbox"/>').prependTo($label);
						$submitBtn = $('<input class="btn submit" type="submit"/>').appendTo($form);

						hud = new Garnish.HUD(originalEvent.currentTarget, $form, {
							hudClass: 'hud',
							triggerSpacing: 20,
							tipWidth: 30
						});

						$form.on('submit', function(ev) {
							ev.preventDefault();

							if ($checkbox.prop('checked'))
							{
								doThat();
								hud.hide();
								$checkbox.prop('checked', false);
							}
							else
							{
								Garnish.shake(hud.$hud);
							}
						});
					}
					else
					{
						hud.$trigger = $(originalEvent.currentTarget);
						hud.show();
					}

					if (originalEvent.currentTarget == $downloadBtn[0])
					{
						$submitBtn.attr('value', Craft.t('Seriously, download.'));
						doThat = downloadThat;
					}
					else
					{
						$submitBtn.attr('value', Craft.t('Seriously, update.'));
						doThat = autoUpdateThat;
					}
				};

				$downloadBtn.on('click', showLicenseForm);

				if (typeof $updateBtn != 'undefined')
				{
					$updateBtn.on('click', showLicenseForm);
				}
			}
			else
			{
				$downloadBtn.on('click', downloadThat);

				if (typeof $updateBtn != 'undefined')
				{
					$updateBtn.on('click', autoUpdateThat);
				}
			}

			/*var $tr = $('<tr/>').appendTo($tbody),
				$th = $('<th/>').appendTo($tr),
				$td = $('<td class="thin rightalign"/>').appendTo($tr);

			$th.html('Craft '+response.app.releases[0].version +
				' <span class="light">' +
				Craft.t('build {build}', { build: response.app.releases[0].build }) +
				'</span>' +
				(response.app.criticalUpdateAvailable ? '<span class="critical">'+Craft.t('Critical')+'</span>' : '')
			);

			var $tr = $('<tr/>').appendTo($tbody),
				$td = $('<td class="notes" colspan="2"/>').appendTo($tr);*/

			showReleases(response.app.releases, 'Craft');
		}
		else
		{
			$('<p id="no-system-updates">'+Craft.t('No system updates are available.')+'</p>').appendTo(Craft.cp.$content);
		}


		$('#updates').fadeIn('fast');

	});

});


})(jQuery);
