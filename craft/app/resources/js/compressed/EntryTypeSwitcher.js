/*
 Copyright (c) 2013, Pixel & Tonic, Inc.
 @license   http://buildwithcraft.com/license Craft License Agreement
 @link      http://buildwithcraft.com
*/
(function(a){Craft.EntryTypeSwitcher=Garnish.Base.extend({$form:null,$typeSelect:null,$spinner:null,$fields:null,init:function(){this.$form=a("#entry-form");this.$typeSelect=a("#entryType");this.$spinner=a('<div class="spinner hidden" style="margin-left: 5px;"/>').insertAfter(this.$typeSelect.parent());this.$fields=a("#fields");this.addListener(this.$typeSelect,"change","onTypeChange")},onTypeChange:function(e){this.$spinner.removeClass("hidden");Craft.postActionRequest("entries/switchEntryType",
this.$form.serialize(),a.proxy(function(b,d){this.$spinner.addClass("hidden");if("success"==d){Craft.cp.deselectContentTab();Craft.cp.$contentTabsContainer.html(b.tabsHtml);this.$fields.html(b.fieldsHtml);Craft.cp.initContentTabs();var c="";b.headHtml&&(c+=b.headHtml);b.footHtml&&(c+=b.footHtml);c&&a(c).appendTo(Garnish.$bod);slugGenerator.setNewSource("#title")}},this))}})})(jQuery);

//# sourceMappingURL=EntryTypeSwitcher.min.map
