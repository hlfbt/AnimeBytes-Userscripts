// ==UserScript==
// @name        AnimeBytes Hide Hentai Images
// @author      pillows
// @description Hide hentai covert art in torrents
// @include     *https://animebytes.tv*
// @version     1.0
// @icon        http://animebytes.tv/favicon.ico
// @require 	http://code.jquery.com/jquery-2.2.4.min.js
// @grant 		GM_setValue
// @grant 		GM_getValue
// ==/UserScript==

$(document).ready(function(){
    var currentURL = window.location.href;
	
	$(".ue_list").append("<li>\r\n        \
	<span class=\"ue_left strong\">Toggle Hentai Cover Art<\/span>\r\n     \
	<span class=\"ue_right\">\r\n        \
	<input type=\"checkbox\" id=\"togglehart\">\r\n       \
	<label for=\"togglehart\">Disable hentai cover art.<\/label>\r\n    \
    <\/span>\r\n   \
	<\/li>");
	
	
	$("#togglehart").prop("checked",GM_getValue("toggle"));
	
	$("#togglehart").on("change",function(){
		GM_setValue("toggle",this.checked);
    });
	
	if(currentURL.indexOf("torrents.php") > -1)
	{
		if(GM_getValue("toggle") == true)
		{
			if(currentURL.indexOf("id=") > -1)
			{
				if($(".group_torrent:contains('hentai')"))
					$(".scaledImg").hide();
			}
			else if(currentURL.indexOf("searchstr="))
			{
				$(".group_cont").each(function(index){
					if($(this).html().indexOf('hentai (18+)') != -1)
					{
						$(this).find("span.mainimg").hide();
					}
				});
				
			}
		}
	}
});