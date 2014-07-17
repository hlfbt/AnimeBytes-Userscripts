// ==UserScript==
// @name AnimeBytes Screenshot WoMD
// @author potatoe
// @version 0.4
// @description Add weapons of mass destruction against screenshots to AnimeBytes!
// @include *animebytes.tv/screenshots.php*
// @include *animebyt.es/screenshots.php*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

function injectScript (content, id) {
	var script = document.createElement('script');
	if (id) script.setAttribute('id', id);
	script.textContent = content.toString();
	document.body.appendChild(script);
	return script;
}

function cancelScreenshotDeletion() {
	clearInterval(progress);
	$.fancybox('<div style="background-color: rgba(255, 255, 255, 0.8); padding: 10px;"><strong>Cancelled!</strong></div>');
	setTimeout(function(){$.fancybox.close();}, 1e3);
}

function reallyDeleteAllSelectedScreenshots() {
	$.fancybox('<div id="prompt" style="padding:10px;padding-left:30px;padding-right:30px;background-color:rgba(255,255,255,0.8);text-align:center"><div id="promptstatus" style="display:inline">Deleting <span id="promptcurrent">1</span> of '+screenies.length+' screenshots</div><div id="promptprogress" style="display:inline-block;width:10px;text-align:left;">.</div><br><br><a href="javascript:cancelScreenshotDeletion()"><strong>[Cancel]</strong></a></div>', {hideOnOverlayClick: false});
	$('#prompt').css({'padding-left':'10px','padding-right':'10px'});
	progress = setInterval(function(){$('#promptprogress').text($('#promptprogress').text().replace(/\.+/,function(r){return (r==='..')?'...':((r==='.')?'..':'.')}))},1e3);
	$.ajax({
		url: $('.screenshotcheckbox').filter(function(){return this.checked;})[0].parentNode.parentNode.getElementsByTagName('a')[0].getAttribute('href').replace(/&spoilers=0|spoilers=0&/,'')+'&action=delete',
		success: function(d,s,xhr) {
			var error = '', d = $.parseHTML(d);
			if ($(d).filter('title').text() === 'Screenshot Deleted :: AnimeBytes') {
				$('.screenshotcheckbox').filter(function(){return this.checked;})[0].parentNode.parentNode.setAttribute('style', 'text-align:center;color:#aa1111');
				$('.screenshotcheckbox').filter(function(){return this.checked;})[0].parentNode.parentNode.innerHTML = '<strong>Screenshot<br>Deleted</strong>';
			} else {
				if (d != null) error = $(d).filter('title').text() + '\n\n' + $(d).find('.thin').text().replace(/[\s\n]+$/,'');
				$($('.screenshotcheckbox').filter(function(){return this.checked;})[0]).replaceWith('<span style="color:#aa1111" title="'+error+'">error</span>');
			}
		},
		error: function(xhr,s,e) {
			var error = '', d = $.parseHTML(xhr.responseText);
			if (d != null) error = $(d).filter('title').text() + '\n\n' + $(d).find('.thin').text().replace(/[\s\n]+$/,'');
			$($('.screenshotcheckbox').filter(function(){return this.checked;})[0]).replaceWith('<span style="color:#aa1111" title="'+error+'">error</span>');
		},
		complete: function() {
			if ($('.screenshotcheckbox').filter(function(){return this.checked;}).length>0) {
				if ($('#prompt').length>0) {
					$('#promptcurrent').text(+$('#promptcurrent').text()+1);
					this.url = $('.screenshotcheckbox').filter(function(){return this.checked;})[0].parentNode.parentNode.getElementsByTagName('a')[0].getAttribute('href').replace(/&spoilers=0|spoilers=0&/,'')+'&action=delete';
					$.ajax(this);
				}
			} else {
				clearInterval(progress);
				$('#managescreenshots').slideUp();
				$('#prompt').html($('#promptcurrent').text()+' screenshots deleted!<br><br><a href="javascript:$.fancybox.close()"><strong>[Close]</strong></a>');
				setTimeout(function(){$.fancybox.close()},1e4);
			}
		}
	});
}

function fetchNextPage(ele) {
	if (typeof cur !== 'number') {
		cur = window.location.search.match(/page=([0-9]+)/);
		cur = (cur)?+cur[1]:1;
	}
	cur++;
	var site = window.location.toString();
	site = (site.match(/page=[0-9]+/))?site.replace(/page=[0-9]+/, 'page='+cur):site+((site.indexOf('?')>0)?'&':'?')+'page='+cur;
	xhr = new XMLHttpRequest();
	xhr.open('GET', site);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var doc = document.implementation.createHTMLDocument();
			doc.documentElement.innerHTML = this.responseText;
			var tab = doc.getElementsByTagName('table')[1];
			ele = ele.tBodies[0];
			for (var i=1, cell=null; row=tab.rows[i]; i++) ele.innerHTML += row.outerHTML;
			$("a.page-link:contains("+cur+")").filter(function(){return this.innerText==cur}).addClass('nolink');
			for (var i,j=0; i=document.getElementsByClassName('information')[j]; j++) if (i.parentElement.getElementsByClassName('screenshotcheckbox').length==0) i.insertAdjacentHTML('beforeEnd','&nbsp;<input class="screenshotcheckbox" type="checkbox">');
			reClick();
		}
	}
	xhr.send();
}

function reClick() {
	$('#screenshot_table > tbody > tr > td > .thumbnail > a').off('click');
	$('#screenshot_table > tbody > tr > td > .thumbnail > a').click(function(e){
		var cb = e.target.parentNode.parentNode.parentNode.getElementsByClassName('screenshotcheckbox')[0];
		if (e.shiftKey) {
			var all = $('#screenshot_table').find('.screenshotcheckbox'), ci = all.index(cb), li = all.index(lastchecked);
			ci = (ci===-1)?all.length:ci+1, li = (li===-1)?all.length:li+1;
			if (li < ci) { for (var a,i=0; a=all.slice(li,ci-1)[i]; i++) $(a).trigger('click'); }
			else if (ci < li){ for (var a,i=0; a=all.slice(ci,li-1)[i]; i++) $(a).trigger('click'); }
		}
		if (e.ctrlKey || e.shiftKey) {
			$(cb).trigger('click');
			return false;
		}
	});
	$('.screenshotcheckbox').off('click');
	$('.screenshotcheckbox').click(function(e){
		lastchecked = e.target;
		if ($('.screenshotcheckbox').filter(function(){return this.checked;}).length > 0) { $('#managescreenshots').slideDown(); }
		else { $('#managescreenshots').slideUp(); }
	});
}

function main() {
	for (var i,j=0; i=document.getElementsByClassName('information')[j]; j++) i.insertAdjacentHTML('beforeEnd','&nbsp;<input class="screenshotcheckbox" type="checkbox">');
	document.getElementById('screenshot_table').insertAdjacentHTML('beforeBegin', '<div class="pages" style="display: none;" id="managescreenshots"><input type="button" value="Delete" id="deletescreenshots"></div>');
	$('.next-prev').not('.last').after('<a class="next-prev append" onclick="return false" href="#">Append ⇝</a>');
	$('.next-prev.append').click(function(e) { fetchNextPage(document.getElementsByTagName('table')[1]); });
	var progress = null, cur = null, lastchecked = $('.screenshotcheckbox')[0], screenies = $('.screenshotcheckbox').filter(function(){return this.checked;});
	reClick();
	$('#deletescreenshots').click(function() {
		screenies = $('.screenshotcheckbox').filter(function(){return this.checked;});
		$.fancybox('<div id="prompt" style="padding:10px; background-color: rgba(255,255,255,0.8); text-align: center;">Really delete '+screenies.length+' screenshots?<br><br><strong><a id="promptyes" href="javascript:reallyDeleteAllSelectedScreenshots()">[Yes]</a>&nbsp;&nbsp;&nbsp;<a id="promptno" href="javascript:$.fancybox.close()">[No]</a></div>', {hideOnOverlayClick: false});
	});
}

var functionString = cancelScreenshotDeletion.toString()
                   + reallyDeleteAllSelectedScreenshots.toString()
                   + fetchNextPage.toString()
                   + reClick.toString()
                   + main.toString().replace(/^[^{]+{/,'').replace(/}[^}]*$/,'');
if (document.getElementById('screenshot_table') != null) injectScript(functionString, 'screenshotpurger');