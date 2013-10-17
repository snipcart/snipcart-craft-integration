/*
 Copyright (c) 2013, Pixel & Tonic, Inc.
 @license   http://buildwithcraft.com/license Craft License Agreement
 @link      http://buildwithcraft.com
*/
(function(d){Craft.TableFieldSettings=Garnish.Base.extend({defaults:null,columnSettings:null,columnsTable:null,defaultsTable:null,init:function(a,c,b){this.defaults=c;this.columnSettings=b;this.initColumnsTable();this.initDefaultsTable(a)},initColumnsTable:function(){this.columnsTable=new Craft.EditableTable("types-Table-columns","types[Table][columns]",this.columnSettings,{rowIdPrefix:"col",onAddRow:d.proxy(this,"onAddColumn"),onDeleteRow:d.proxy(this,"reconstructDefaultsTable")});this.initColumnSettingInputs(this.columnsTable.$tbody);
this.columnsTable.sorter.settings.onSortChange=d.proxy(this,"reconstructDefaultsTable")},initDefaultsTable:function(a){this.defaultsTable=new Craft.EditableTable("types-Table-defaults","types[Table][defaults]",a,{rowIdPrefix:"row"})},onAddColumn:function(a){this.reconstructDefaultsTable();this.initColumnSettingInputs(a)},initColumnSettingInputs:function(a){var c=a.find("td:first-child textarea, td:nth-child(3) textarea");a=a.find("td:nth-child(4) select");this.addListener(c,"textchange","reconstructDefaultsTable");
this.addListener(a,"change","reconstructDefaultsTable")},reconstructDefaultsTable:function(){var a=Craft.expandPostArray(Garnish.getPostData(this.columnsTable.$tbody)),c=Craft.expandPostArray(Garnish.getPostData(this.defaultsTable.$tbody)),a=a.types.Table.columns,c=c.types.Table.defaults,b='<table id="types-Table-defaults" class="editable shadow-box"><thead><tr>',d;for(d in a)b+='<th scope="col" class="header">'+(a[d].heading?a[d].heading:"&nbsp;")+"</th>";var b=b+'<th class="header" colspan="2"></th></tr></thead><tbody>',
e;for(e in c)b+=Craft.EditableTable.getRowHtml(e,a,"types[Table][defaults]",c[e]);this.defaultsTable.$table.replaceWith(b+"</tbody></table>");this.defaultsTable.destroy();delete this.defaultsTable;this.initDefaultsTable(a)}})})(jQuery);

//# sourceMappingURL=TableFieldSettings.min.map
