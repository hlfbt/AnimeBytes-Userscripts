// ==UserScript==
// @name AnimeBytes forums title inverter
// @author potatoe
// @version 0.1
// @description Inverts the forums titles.
// @include *animebyt.es/forums.php?*
// @include *animebytes.tv/forums.php?*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

var otitle=document.title.split(" :: ")[0].split(" > ");
var ntitle="";
for (var i=otitle.length-1; i>=0; i--) {
	ntitle+=otitle[i]+" < ";
}
document.title=ntitle.substring(0, ntitle.length-2)+":: AnimeBytes";