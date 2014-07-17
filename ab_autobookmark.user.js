// ==UserScript==
// @name AnimeBytes autobookmark
// @author potatoe
// @version 0.5
// @description Automatically bookmark threads created or posted to.
// @include *animebytes.tv/forums.php*
// @include *animebyt.es/forums.php*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

function injectScript (content, id) {
	var script = document.createElement('script');
	if (id) script.setAttribute('id', id);
	script.textContent = content.toString();
	document.body.appendChild(script);
	return script;
}
function autoBookmark() {
	var bookmarkNode = document.getElementById('bookmark');
	if (bookmarkNode.textContent === '[Bookmark]') {
		var bookmarkLink = bookmarkNode.getAttribute('href') + '&ajax=1';
		var bookmarkXmlhttp = new XMLHttpRequest();
		bookmarkXmlhttp.open('GET', bookmarkLink, false);
		bookmarkXmlhttp.send();
	}
}

var quickpostformNode = document.getElementById('quickpostform'), bookmarkNode = document.getElementById('bookmark'), post_wrapNodes = document.getElementsByClassName('post_wrap');

if (bookmarkNode && post_wrapNodes && post_wrapNodes.length === 1 && document.referrer.match(/.*[?&]action=new.*/) && document.location.search.match(/.*[?&]action=viewthread.*/)) autoBookmark();

if (bookmarkNode && quickpostformNode) {
	injectScript(autoBookmark, 'autobookmark');
	quickpostformNode.setAttribute('onsubmit', 'autoBookmark();' + quickpostformNode.getAttribute('onsubmit'));
}
