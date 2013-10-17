/*
 Copyright (c) 2013, Pixel & Tonic, Inc.
 @license   http://buildwithcraft.com/license Craft License Agreement
 @link      http://buildwithcraft.com
*/
(function(b){Craft.Updater=Garnish.Base.extend({$graphic:null,$status:null,data:null,init:function(a,c){this.$graphic=b("#graphic");this.$status=b("#status");a?(this.data={handle:a,manualUpdate:c},this.postActionRequest("update/prepare")):this.showError(Craft.t("Unable to determine what to update."))},updateStatus:function(a){this.$status.html(a)},showError:function(a){this.updateStatus(a);this.$graphic.addClass("error")},postActionRequest:function(a){Craft.postActionRequest(a,{data:this.data},b.proxy(function(a,
b){if("success"==b&&a.success)this.onSuccessResponse(a);else this.onErrorResponse()},this),{complete:b.noop})},onSuccessResponse:function(a){a.data&&(this.data=a.data);a.nextStatus&&this.updateStatus(a.nextStatus);a.nextAction&&this.postActionRequest(a.nextAction);if(a.error)this.$graphic.addClass("error"),this.updateStatus(a.error);else if(a.finished)this.onFinish(a.returnUrl)},onErrorResponse:function(){this.showError(Craft.t("An unknown error occurred. Rolling back\u2026"));this.postActionRequest("update/rollback")},
onFinish:function(a){this.updateStatus(Craft.t("All done!"));this.$graphic.addClass("success");setTimeout(function(){window.location=a?Craft.getUrl(a):Craft.getUrl("dashboard")},500)}})})(jQuery);

//# sourceMappingURL=update.min.map
