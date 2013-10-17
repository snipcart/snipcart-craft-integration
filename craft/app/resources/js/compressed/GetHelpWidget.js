/*
 Copyright (c) 2013, Pixel & Tonic, Inc.
 @license   http://buildwithcraft.com/license Craft License Agreement
 @link      http://buildwithcraft.com
*/
(function(c){Craft.GetHelpWidget=Garnish.Base.extend({$widget:null,$message:null,$fromEmail:null,$attachDebugFiles:null,$sendBtn:null,$spinner:null,$error:null,originalBodyVal:null,originalFromVal:null,originalAttachDebugFilesVal:null,loading:!1,$errorList:null,init:function(a){this.$widget=c("#widget"+a);this.$message=this.$widget.find(".message:first");this.$fromEmail=this.$widget.find(".fromEmail:first");this.$attachDebugFiles=this.$widget.find(".attachDebugFiles:nth-child(2)");this.$sendBtn=this.$widget.find(".submit:first");
this.$spinner=this.$widget.find(".buttons .spinner");this.$error=this.$widget.find(".error:first");this.$form=this.$widget.find("form:first");this.originalBodyVal=this.$message.val();this.originalFromVal=this.$fromEmail.val();this.originalAttachDebugFilesVal=this.$attachDebugFiles.val();this.addListener(this.$sendBtn,"activate","sendMessage")},sendMessage:function(){if(!this.loading){this.loading=!0;this.$sendBtn.addClass("active");this.$spinner.removeClass("hidden");var a={message:this.$message.val(),
fromEmail:this.$fromEmail.val(),attachDebugFiles:this.$attachDebugFiles.val()};Craft.postActionRequest("dashboard/sendSupportRequest",a,c.proxy(function(b,a){this.loading=!1;this.$sendBtn.removeClass("active");this.$spinner.addClass("hidden");this.$errorList&&this.$errorList.children().remove();if("success"==a)if(b.success)this.$message.val(this.originalBodyVal),this.$fromEmail.val(this.originalFromVal),this.$attachDebugFiles.val(this.originalAttachDebugFilesVal),Craft.cp.displayNotice(Craft.t("Message sent successfully."));
else if(Craft.cp.displayError(Craft.t("Couldn\u2019t send support request.")),b.errors){this.$errorList||(this.$errorList=c('<ul class="errors"/>').insertAfter(this.$form));for(var e in b.errors)for(var d=0;d<b.errors[e].length;d++)c("<li>"+b.errors[e][d]+"</li>").appendTo(this.$errorList)}},this))}}})})(jQuery);

//# sourceMappingURL=GetHelpWidget.min.map
