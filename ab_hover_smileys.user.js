// ==UserScript==
// @name AB Hover Smileys
// @author potatoe
// @version 0.4.1
// @description Hides smileys behind one button that shows them all on hover.
// @include *animebytes.tv/*
// @include *animebyt.es/*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

HTMLCollection.prototype.each = function (f) { for (var i=0, e=null; e=this[i]; i++) f.call(e, e); return this; };
HTMLElement.prototype.clone = function (o) { var n = this.cloneNode(); n.innerHTML = this.innerHTML; if (o!==undefined) for (var e in o) n[e] = o[e]; return n; };

if (document.getElementById('smileys')) {
	var smileys = document.getElementById('smileys'), r = '';
	smileys.getElementsByTagName('*').each(function (n) {
		var c = n.getAttribute('onclick');
		n.removeAttribute('onclick');
		n.setAttribute('style',((n.width>33)?'margin-left:'+(33-n.width)/2+'px;':'')+'margin-top:'+(33-n.height)/2+'px;');
		r += '<div class="smileyscell" onclick="'+c+'">'+n.outerHTML+'</div>';
	});
	smileys.innerHTML = r;
	smileys.setAttribute('style', 'display: none; width: 350px; position: absolute; top: 0; left: 0;');
	smileys.setAttribute('id', 'hoversmileys');
	document.getElementById('bbcode').innerHTML += '<div style="display: inline-block" id="smileysholdster"><style>.smileyscell{display:inline-block;overflow:hidden;width:33px;max-width:33px;height:33px;background-color:#e9e9e9;border:1px solid #cbcbcb;float:left}</style></div>'
	var smileysholdster = document.getElementById('smileysholdster'), smileysbutton = smileys.firstElementChild.clone({'id':'smileysbutton'});
	smileysholdster.appendChild(smileysbutton);
	smileysholdster.appendChild(smileys);
	smileys.style.top = smileysbutton.offsetTop + 'px';
	smileys.style.left = smileysbutton.offsetLeft + 'px';
	smileysholdster.addEventListener('mouseenter', function(){ var hs = document.getElementById('hoversmileys'), sb = document.getElementById('smileysbutton'); hs.style.top = sb.offsetTop+'px'; hs.style.left = sb.offsetLeft+'px'; hs.style.display = 'block'; });
	smileysholdster.addEventListener('mouseleave', function(){ document.getElementById('hoversmileys').style.display = 'none'; });
}