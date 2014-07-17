// ==UserScript==
// @name AnimeBytes Unread Index
// @author potatoe
// @version 1.10
// @description adds the top new unread forum posts to AnimeBytes index page.
// @include *animebyt.es/
// @include *animebyt.es/index.php
// @include *animebyt.es/user.php*
// @include *animebytes.tv/
// @include *animebytes.tv/index.php
// @include *animebytes.tv/user.php*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
	this.GM_getValue=function (key,def) { return localStorage[key] || def; };
	this.GM_setValue=function (key,value) { return localStorage[key]=value; };
	this.GM_deleteValue=function (key) { return delete localStorage[key]; };
}
var showforumgames = GM_getValue('showforumgames');
if (showforumgames == null) { GM_setValue('showforumgames', 'true'); showforumgames = 'true'; }
if (window.location.pathname === '/user.php' && window.location.search.indexOf('action=edit') !== -1) {
	function injectScript(c,id){var s=document.createElement('script');if(id)s.setAttribute('id',id);s.textContent=c.toString();document.body.appendChild(s);return s;}
	function relink(){$j(function(){var stuff=$j('#tabs > div');$j('ul.ue_tabs a').click(function(){stuff.hide().filter(this.hash).show();$j('ul.ue_tabs a').removeClass('selected');$j(this).addClass('selected');return false;}).filter(':first,a[href="'+window.location.hash+'"]').slice(-1)[0].click();});}
	var pose = document.createElement('div');
	pose.id = "potatoes_settings";
	pose.innerHTML = '<div class="head colhead_dark strong">User Script Settings</div><ul id="pose_list" class="nobullet ue_list"></ul>';
	var poseanc = document.createElement('li');
	poseanc.innerHTML = '&bull;<a href="#potatoes_settings">User Script Settings</a>';
	var tabsNode = document.getElementById('tabs');
	var linksNode = document.getElementsByClassName('ue_tabs')[0];
	if (document.getElementById('potatoes_settings') == null) { tabsNode.insertBefore(pose, tabsNode.childNodes[tabsNode.childNodes.length-2]); linksNode.appendChild(poseanc); document.body.removeChild(injectScript('('+relink.toString()+')();', 'settings_relink')); }
	var newLi = document.createElement('li');
	newLi.innerHTML = "<span class='ue_left strong'>Unread Index Userscript</span>\n<span class='ue_right'><input onvalue='true' offvalue='false' type='checkbox' name='showforumgames' id='showforumgames'"+((showforumgames==='true')?" checked='checked'":" ")+">\n<label for='showforumgames'>Show or hide posts from the Forum Games subforum on the index.</label></span>";
	newLi.addEventListener('click', function(e){var t=e.target;if(typeof t.checked==="boolean"){if(t.checked){GM_setValue(t.id,t.getAttribute('onvalue'));}else{GM_setValue(t.id,t.getAttribute('offvalue'));}}});
	document.getElementById('pose_list').appendChild(newLi);
}
else {
	var unread_tablenode;
	var dividernode = document.createElement('div');
	dividernode.className = 'divider';
	var newsnode = document.getElementById('news');
	var unread_doc = document.implementation.createHTMLDocument('');
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			unread_doc.documentElement.innerHTML = xmlhttp.responseText;
			unread_tablenode = unread_doc.evaluate("//div[@id='content']/div[@class='thin']/table[@width='100%']", unread_doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			var unread_posts = 0;
			for (j=0; j<2; j++) unread_tablenode.rows[0].cells[j].style.padding = '8px';
			unread_tablenode.rows[0].cells[0].style.width = '30%';
			unread_tablenode.rows[0].cells[1].style.width = '70%';
			unread_tablenode.rows[0].deleteCell(2);
			for (var i=1; row=unread_tablenode.rows[i]; i++) {
				if (row == null) break;
				if ((showforumgames === 'false' && row.cells[0].getElementsByTagName('a')[0].textContent.trim() === "Forum Games") || (unread_posts === 5)) { unread_tablenode.deleteRow(i); i--; }
				else if (unread_posts < 5) {
					for (j=0; j<2; j++) row.cells[j].style.padding = '0px';
					//row.cells[0].getElementsByTagName('p')[0].innerHTML += "<div style='font-size: 8px;'>&nbsp;</div>";
					row.cells[1].getElementsByTagName('p')[0].innerHTML += "<div style='font-size: 8px;'>" + row.cells[2].getElementsByTagName('p')[0].innerHTML + '</div>';
					row.deleteCell(2);
					unread_posts++;
				}
			}
			unread_tablenode.style.marginBottom = '20px';
			newsnode.parentNode.insertBefore(unread_tablenode, newsnode);
			newsnode.parentNode.insertBefore(dividernode, newsnode);
		}
	};
	xmlhttp.open('GET', '/forums.php?action=viewunread', true);
	xmlhttp.send();
}