// ==UserScript==
// @name AnimeBytes Notifications
// @author potatoe
// @version 2.5
// @description shows toasty notifications for various things!.
// @include *animebyt.es/*
// @include *animebytes.tv/*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==


/*
 * Check wether the Browser supports Notifications and if they are granted for AnimeBytes
 */

if (!("Notification" in window)) alert("Notifications are not supported by your browser!");

if (Notification.permission !== "granted") document.getElementById('alerts').innerHTML += "<div id='notificationsalert' class='alertbar message' style='background: #FFB2B2; border: 1px solid #D45A5A;'><a href='javascript:Notification.requestPermission(function () {document.getElementById(\"notificationsalert\").parentNode.removeChild(document.getElementById(\"notificationsalert\"));});' style='color: #E40000;'>Enable Notifications</a></div>"
if (Notification.permission === "denied") alert("Notifications are denied for AnimeBytes, please reenable them in your browsers settings or disable/remove this userscript (AnimeBytes Notifications).")


/*
 * Define some basic needed Functions and Objects
 */

// Native script support for Chrome
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
	this.GM_getValue=function (key,def) { return localStorage[key] || def; };
	this.GM_setValue=function (key,value) { return localStorage[key]=value; };
	this.GM_deleteValue=function (key) { return delete localStorage[key]; };
}

// Simple custom NetworkError that gets thrown in case a XMLHttpRequest fails
NetworkError = function (message) {
	this.name = "NetworkError";
	this.message = (message || "");
};
NetworkError.prototype = Error.prototype;

// Custom UserscriptEvent that can be fired for various custom Events. Most notably error Events!
// UserscriptEvent not yet fully supported (dispatchEvent() doesn't seem to accept any other than the standard Events).
/*UserscriptEvent = function (type, source, obj) {
	if (typeof type === "undefined") throw new TypeError("Failed to construct 'UserscriptEvent': An event name must be provided.");
	if (typeof obj !== "undefined" && typeof obj !== "object") throw new TypeError("Failed to construct 'UserscriptEvent': Argument is not an object.");
	var evt = new Event(type);
	for (var k in evt) this[k] = evt[k];
	for (var k in obj) this[k] = obj[k];
	this.source = (source || "AnimeBytes Notifications");
};*/
UserscriptEvent = function (type, source, obj) {
	if (typeof type === "undefined") throw new TypeError("Failed to construct 'UserscriptEvent': An event name must be provided.");
	if (typeof obj !== "undefined" && typeof obj !== "object") throw new TypeError("Failed to construct 'UserscriptEvent': Argument is not an object.");
	var evt = new CustomEvent(type);
	for (var k in obj) evt[k] = obj[k];
	evt.name = "UserscriptEvent";
	evt.source = (source || "AnimeBytes Notifications");
	return evt;
}
UserscriptEvent.prototype = CustomEvent.prototype;

// Don't you hate it to build a new XMLHttpRequest every single time you want to fetch a site?!
// Yea, I do too...
// Depends on NetworkError
function XHRWrapper(location, callback, method, sync, data) {
	if (this.constructor != XHRWrapper) throw new TypeError("Constructor XHRWrapper requires 'new'");
	this.name = "XHRWrapper";
	this.typeOf = function () { return this.name; };
	this.toString = function () { return '[object ' + this.name + ']'; };
	this.valueOf = function () { return this; };
	var xhr = new XMLHttpRequest();
	Object.defineProperty(this, 'xmlHttpRequest', {
		get: function () { return xhr; },
		set: function () { return xhr; }
	});
	xhr.onerror = function(e) {
		var netErr = new Error("A Network Error occured while loading the resource");

		// Custom error code handling if client error occurs
		var xhr = e.target;
		if (xhr.status == 331) netErr.message += "\nSystem went to sleep/was suspended";

		netErr.xmlHttpRequestProgressEvent = e;
		netErr.xmlHttpRequest = xhr;
		if (typeof error !== "undefined") { error = netErr; }
		else { throw netErr; }
	};
	xhr.onreadystatechange = function(xhrpe) {
		var xhr = xhrpe.target;
		if (xhr.readyState == 4 && xhr.status == 200) {
			var doc = document.implementation.createHTMLDocument();
			doc.documentElement.innerHTML = xhr.responseText;
			xhr.__callback(doc);
		}
		else if (xhr.readyState == 4 && xhr.status != 200) {
			var netErr = new NetworkError();

			// Custom error code handling if server error occurs
			console.log("Error Code " + xhr.status + " (" + xhr.statusText + ")");
			if (xhr.status == 331) netErr.message = "System went to sleep/was suspended";

			throw netErr
		}
	};
	this.location = xhr.__location = location;
	this.callback = xhr.__callback = callback;
	xhr.open(method || 'GET', location, (typeof sync==="undefined")?true:sync);
	xhr.send(data);
	return this;
}
// Make it completely seemless. For this we 'cheat' a bit by simply copying all property names in a new XHR and assigning them getters/setters to our private XHR Object.
// This does have the drawback that the 'on...' handlers will be the same for both the Wrapper and XHR, but that's not a problem for this usecase.
for (var key in new XMLHttpRequest()) {
	if (!(key in ['addEventListener', 'removeEventListener', 'dispatchEvent']) && key !== key.toUpperCase()) { // Those should be seperate thought! Same with constants.
		Object.defineProperty(XHRWrapper.prototype, key, {
			get: new Function("return this.xmlHttpRequest."+key+";"),
			set: new Function('val', "return this.xmlHttpRequest."+key+" = val;")
		});
	}
}

// Make some noise!
function CustomAudio (src) {
	this.audio = document.createElement('audio');
	if (arguments[0]) this.audio.src = arguments[0];
	if (Object.defineProperty) { // The proper way
		Object.defineProperty(this, 'src', {
			get: function(){ return this.audio.src; },
			set: function(src){ if (!arguments[0]) { this.audio.removeAttribute('src'); } else { this.audio.src = arguments[0]; } return arguments[0]; }
		});
	} else { // The deprecated way
		this.__defineGetter__('src', function(){ return this.audio.src; });
		this.__defineSetter__('src', function(src){ if (!arguments[0]) { this.audio.removeAttribute('src'); } else { this.audio.src = arguments[0]; } return arguments[0]; });
	}
	this.play = function() { this.audio.play(); };
	return this;
}

// This helps initializing all the GM variables
// Sets 'def' to 'gm' or returns 'gm's value if already set
// 'json' controlls wether the variable is/should be encoded as JSON String
// 'overwrite' controlls wether to overwrite 'gm' if it is not the same type as 'def'
function initGM(gm, def, json, overwrite) {
	if (typeof def === "undefined") throw "shit";
	if (typeof overwrite !== "boolean") overwrite = true;
	if (typeof json !== "boolean") json = true;
	var that = GM_getValue(gm);
	if (that != null) {
		var err = null;
		try { that = ((json)?JSON.parse(that):that); }
		catch (e) { if (e.message.match(/Unexpected token .*/)) err = e; }
		if (!err && Object.prototype.toString.call(that) === Object.prototype.toString.call(def)) { return that; }
		else if (overwrite) {
			GM_setValue(gm, ((json)?JSON.stringify(def):def));
			return def;
		} else { if (err) { throw err; } else { return that; } }
	} else {
		GM_setValue(gm, ((json)?JSON.stringify(def):def));
		return def;
	}
}


/*
 * Initialize all needed GM or global variables
 */

// Initialize all the GM variables
var notifyInterval = initGM('notifyinterval', 300);
var notifyTimeout = initGM('notifytimeout', 15);
var oldPMs = initGM('oldpms', {});
var oldPosts = initGM('oldposts', {});
var oldRecentThreads = initGM('oldrecentthreads', {});
var gm_aotf = initGM('aotf', '', false);
var gm_aotw = initGM('aotw', '', false);
var gm_icon = initGM('notifyicon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAmUSURBVHja7JtJbxzHFcd/vcw+FHdyuIqrdsuUFUlwHBhB4kMOueQDBMg3yGfJOcdcggABcgpySmwdEki2TG2UrIUUaW4ih+RwFg45S3fnwNdUTU8PZ4ZDGgnMAgpDVFdX1b/ee//36nVRcxyHH1PR+ZGVc8DngM8B/38XE+D3kVunNZ4mVVeq23bS4ijVlur+3XD5w/7sB8CnpCk6EACCQEhqQObQTwDaUX4tqSWgKLUk1VI2oTEJnwJYEwgDcaBd6gUgKsCNE5iPKlVLQB4AeSCn1H1pL0s/5ywBazJGVED2A0PAoPzdKc/MFgBbAuYA2APSwA6wBSSBbWBXwBdE6vZZAdZFhS8IyEvANeAKMC6gL4hqu2rdTGinSjcPZAToe2AFWJK6CmwI8D1F1U8dsAnEgF5gCvgJ8FPgkzpa0WgxpAbFXPpkHoB14DtgDngJvAGWZfxcLWIzT1G6V4B7dcCeZhmQOiYbHpPNUdm85NWoVgAbQAToAkZEle+4D68kRpnoGSRfPGiRJDRKVplcYZ9sIc9KaotCuah2GQc6hBwdsXeVwa3TAKyJXbpqNg5cP3qoafz6xqfEQpFTF2vZsni+tsBXb5+wm8+5zZ3A50JsKnuXvC7LbEG6YdnZAWACmHYf3hqZPhOwAKZhMDMyzczINP+Ye8CDxZfuoy7RMJe5M0J0FQSmt0hW3cCwQiQAfDQ48YMY8a+u3+Pu2FW1aVI07aKsLeYVqn5C6YbE7yaENC65D4c7exnrTvxgsfHPp2cIGBWYrgrgXgWw1opKGxJMdEmQMSHqDcC9i1ehwSzKVi7Nym6SsBmsEXk42I5DX1sHvfEO3z6RQJAr/aM8W1tQ2XsY6BGOCYo9OycB7LqiNiGrUdV22yMxbiTGwK4EbNk2hl6tTHNri3z59nFDE98cnOA3N3/m+2y8K8FGNsVmNuU29YoGRltVadcVdYrvnRDgAFzvF7BKTe1lebG+WNWO7aA1EXQ9XVvg6cq87zixQIhYIKR2j4rWBbwHl2YAq66oV3xvBVndHb5UtZj55CoL2+u+C6XJ/GF6f6/lccwm1TkkrighvnfySOUS47QHImBVRnOP1+aJB6vbDyPl5hBHjIDvOJl8juxBXm1y/XDR64ebkbDXFU1WSHdgGiynou4d7LOa2aYtEK56huU0TG5uudw55DvO2+11tvIZtWtSDhKuH25awq50L8gJ6KKqzolYB0OxTrArd392fR6AkGFWPTuk4cYBfzH2MW2BUNU46cIer7ZX1KYVOURsiaRLJ4m0TMUVuWQVdx/e6Z863G0v0WwuKTkLx//w10D5fPganw1c9h3jq6U5b9MbD+Bys4B1T9w8qko3aoaY6R6tsq3FTJJkPv3BVq3mJGxoOhPtffxy+CP6o+2+73+5+oLZzXcVAgcW5bycEjsuN6vSuuKKBoSsBt2HNzqH0a1qcX2zMV9JTmUfwD4Su9s7yeWOAcbiPeiaUIznXQeHv777mrnUivd1N45OK/bb1PGwvivqHq/a/d1ivnIxTuMS/rRnko5gVPav+p37G6/41/uXtdZreTKbTbslXRx4u+KKjuLmqxcG6TZjVZJ6vL1UnZ3ytWHHX+qWUzPUHI/20DN6h9nU97zNbni7dAvPuFFWUHFNDQF2yUp1RUdRy+2Oatu1HYdHO4uVC7Xtxm24Vl+ZeCTUASG4FkvwJL3C39Zm1S49ismtiGs6UO3YbNIVHcXN3cEYk+HuqsVtFbJ0B2KMR3vAcdgt7zMQvNBw4HE/+Zo2I0TJsQnpJuPRbkYjXb4L/Dg+SHBQ5y9rj9TmK5LrWhKbzqlSNutIN6KciiYF/KErarvoS0R9RozfDdzzSVU0Bng2vVzJxNvQbkb47cAdugOxqv5Xw31cjw0wt7fuNrknuO/EPW0LgdnHRVquK2rzc0VhPcDt2OCh1FqpDQYe6fI+f1z9N/ulgu84t2JDTEV61FdGhGTbREv1eqGl7knhjMvOHaZwYoOYtu4fLjZTm/g6VLDLPEwv+Y7Ta0TpM+Nq915Ze0wEd2wCoK4ruhlO+IeKzZYmY+nNUtZ33ggGcS2gNsWVzzwVXz3MY8hKTeEckdV0qJuEHq9yHXm7SM4uYmi6x8vYxPUQUT3QMuCSbfm6LAMNw9G8/KPj8xHPbPBUZBwFGqEhX8b9c/opy6W070I/i4zyRWyy5eNhGNN37qJTpmBVRJBqTto5LpY+NkHXY0SZMruqFrpl5WuCPQo8/MA1mQAYMzt8x8lbRXJ2QW3KCjMXjjs8aIp0exRmbnc7zAQTvhM+Olirb6s+7zVzZepWMMEnAf/5t8p7JMt7FU18+LBWM9Ly2u64OHEAgprBbbN6wpJj8W1xvf6KfRY6ZXRih2yiWqBGYOwQQGfK7KRTj9Q0gbniJu/Ku2rTqoDOipR9ARueMHJaTdDNBPoJY1QRzevyNkXHqi9hH2kO6XGGgvGWGH3H3udpaVNteg+84/DzaUYk7JviCSjqPKIyM3CoTj7lm0ake4bl74V5b9NzYF6AZ2qptKZIuFNUeuSILIx2+vXqsG7NyrJoVZBVEfhegpbhswb7p/wzFqwKVX4JPBMJb4kN10wAGCLlsAAHoEuP8IvQmO+EX5fW/XZ3TUK6LnWc0yoO8LC4xj+Li15TWgceAi/kpJTy2m8tP2yruxLTAqTsA9JOgbJjix1o6JrGfDmlvvdWdjgpYV0vh9+M2bTzLFi7ZCpdR8OljE3eKZGyD3hn7ZKuHuc9cB/4VnJaG0oCryZgW1QyJ+qwDgwsWxmWrUy9NWWAx3JC2RWz6HC/O70p7/CmvHNWmv0aeAA8EumuSoqngM89D1PRlLI46y2xgacSk7bVO8wA/wGeyOQ5PnyR7wI+FVM57bIuAJ/L7xtR5R1J3tW91FKWxb6XhYdEcpeEwLo8prQtBPWKw4slc7K7B2I/tpDhrjD+cAObd5zp7slYSZlnSQSzJOfeTU/y3a4H2JLO20JgJRnklbiqNkVSRdmMpJDUsiwiJe9l5bcgG/hC/Htc+cDVSHDp3tMqidRyMseWrG1TiapySijZ0D0tS17IKOCTwIKADSv9y7KArEyWEtV2Vcn9rpOXRc0LWHcMrUGpqjfxCjLunsybEZB5TngTz1GAuL8pWaR7rjSUzXHvPR5ILSqBunuLJi82FZYMojuG1gBYlUxdz+Hesyzw4b5lmRbuWjrKThVlNw2fs6V6F8r2yQVbilTUMTQav13reCTtHDNfw0U7/yePc8DngM8BnwM+B/y/U/47APgkYRik+rGGAAAAAElFTkSuQmCC', false);
var gm_sound = initGM('notifysound', 'data:audio/ogg;base64,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', false);

// Initialize all other global variables
var userID = document.getElementById('username_menu').firstChild.getAttribute('href').replace(/.*id=([0-9]+).*/, '$1');
var error = null;


/*
 * All the actual "work" Functions
 */

// Creates a Userscript Settings Page or adds configuration options if it already exists
function createSettingsPage() {
	function injectScript(content, id) {
		var script = document.createElement('script');
		if (id) script.setAttribute('id', id);
		script.textContent = content.toString();
		document.body.appendChild(script);
		return script;
	}
	function addCheckbox(title, description, varName, onValue, offValue) {
		if (typeof onValue !== "string" || typeof offValue !== "string" || onValue === offValue) onValue='true', offValue='false';
		var newLi = document.createElement('li');
		this[varName] = initGM(varName, onValue, false);
		newLi.innerHTML = "<span class='ue_left strong'>"+title+"</span>\n<span class='ue_right'><input type='checkbox' onvalue='"+onValue+"' offvalue='"+offValue+"' name='"+varName+"' id='"+varName+"'"+((this[varName]===onValue)?" checked='checked'":" ")+">\n<label for='"+varName+"'>"+description+"</label></span>";
		newLi.addEventListener('click', function(e){var t=e.target;if(typeof t.checked==="boolean"){if(t.checked){GM_setValue(t.id,t.getAttribute('onvalue'));}else{GM_setValue(t.id,t.getAttribute('offvalue'));}}});
		var poselistNode = document.getElementById('pose_list');
		poselistNode.appendChild(newLi);
		return newLi;
	}
	function addNumberInput(title, description, varName, defValue) {
		if (typeof defValue !== "integer") defValue = (JSON.parse(GM_getValue(varName)) || 0);
		var newLi = document.createElement('li');
		this[varName] = initGM(varName, defValue);
		newLi.innerHTML = "<span class='ue_left strong'>"+title+"</span>\n<span class='ue_right'><input type='number' size='50' name='"+varName+"' id='"+varName+"' value='"+this[varName]+"'> <span>"+description+"</span></span>";
		newLi.addEventListener('keypress', function(e){var t=(e.which?e.which:e.keyCode),n=+e.target.value.replace(/(.)-/g,'$1');if(t===13&&!isNaN(n))GM_setValue(e.target.id,JSON.stringify(n));if(t===13||(t>31&&t!==45&&(t<48||t>57)))e.preventDefault();});
		newLi.addEventListener('blur', function(e){var n=+e.target.value.replace(/(.)-/g,'$1');if(!isNaN(n))GM_setValue(e.target.id,JSON.stringify(n));}, true);
		var poselistNode = document.getElementById('pose_list');
		poselistNode.appendChild(newLi);
		return newLi;
	}
	function addTextInput(title, description, varName, defValue) {
		if (typeof defValue !== "string") defValue = (GM_getValue(varName) || "");
		var newLi = document.createElement('li');
		this[varName] = initGM(varName, defValue, false);
		newLi.innerHTML = "<span class='ue_left strong'>"+title+"</span>\n<span class='ue_right'><input type='text' style='margin: 0;' size='50' name='"+varName+"' id='"+varName+"' value='"+this[varName]+"'> <span>"+description+"</span></span>";
		newLi.addEventListener('keypress', function(e){var t=e.which?e.which:e.keyCode;if(t===13){GM_setValue_setValue(e.target.id,e.target.value);e.preventDefault();}});
		newLi.addEventListener('blur', function(e){GM_setValue(e.target.id,e.target.value);}, true);
		var poselistNode = document.getElementById('pose_list');
		poselistNode.appendChild(newLi);
		return newLi;
	}
	function addCustom(title, description) {
		var newLi = document.createElement('li');
		newLi.innerHTML = "<span class='ue_left strong'>"+title+"</span>\n<span class='ue_right'>"+description+"</span>";
		var poselistNode = document.getElementById('pose_list');
		poselistNode.appendChild(newLi);
		return newLi;
	}
	function relink(){$j(function(){var stuff=$j('#tabs > div');$j('ul.ue_tabs a').click(function(){stuff.hide().filter(this.hash).show();$j('ul.ue_tabs a').removeClass('selected');$j(this).addClass('selected');return false;}).filter(':first,a[href="'+window.location.hash+'"]').slice(-1)[0].click();});}
	var pose = document.createElement('div');
	pose.id = "potatoes_settings";
	pose.innerHTML = '<div class="head colhead_dark strong">User Script Settings</div><ul id="pose_list" class="nobullet ue_list"></ul>';
	var poseanc = document.createElement('li');
	poseanc.innerHTML = '&bull;<a href="#potatoes_settings">User Script Settings</a>';
	var tabsNode = document.getElementById('tabs');
	var linksNode = document.getElementsByClassName('ue_tabs')[0];
	if (document.getElementById('potatoes_settings') == null) { tabsNode.insertBefore(pose, tabsNode.childNodes[tabsNode.childNodes.length-2]); linksNode.appendChild(poseanc); document.body.removeChild(injectScript('('+relink.toString()+')();', 'settings_relink')); }
	addCheckbox("PM Notifications", "Notify about new private messages.", 'pmnotify');
	addCheckbox("Bookmarks Notifications", "Notify if someone posted in a bookmarked thread.", 'bookmarknotify');
	addCheckbox("AotF/AotW Notifications", "Notify if a new AotF or AotW have been chosen.", 'aotxnotify');
	addCheckbox("Recent Threads Notifications", "Notify about a new post in a thread I recently posted in.", 'recentthreadnotify');
	addNumberInput("Notification Check Interval", "(in seconds)", 'notifyinterval');
	addNumberInput("Notification Timeout", "(in seconds) when the notifications should close automatically again.<br />0 for same as check interval, negative for indefinitely.", 'notifytimeout');
	addTextInput("Notification Icon", "(url or base64)", 'notifyicon');
	addTextInput("Notification Sound", "(url or base64)", 'notifysound');
	addCustom("Test Notifications", "<a href='#' onclick='return false;' id='notifytest'>Click me!</a>");
	addCustom("Reset Notifications", "Warning: this will reset all old, saved notifications. You might get spammed. <a href='#' onclick='return false;' id='notifyreset'>Reset</a>.");
	document.getElementById('notifytest').addEventListener('click', function(){var testNotification=new Notification("Test Notification",{icon:GM_getValue('notifyicon'),body:"Hello World!"});testNotification.onclick=function(){this.close();};var notifyTimeout=JSON.parse(GM_getValue('notifytimeout'));if(notifyTimeout>=0)window.setTimeout(function(){testNotification.close();},((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);new CustomAudio(GM_getValue('notifysound')).play();});
	document.getElementById('notifyreset').addEventListener('click', function(){if(confirm("Really?")){GM_deleteValue('oldpms');GM_deleteValue('oldposts');GM_deleteValue('oldrecentthreads');GM_deleteValue('aotf');GM_deleteValue('aotw');initGM('oldpms', {});initGM('oldposts', {});initGM('oldrecentthreads', {});initGM('aotf', '', false);initGM('aotw', '', false);var resetNotification=new Notification("Notifications reset!",{icon:GM_getValue('notifyicon'),body:"All old, saved Notifications have been reset."});resetNotification.onclick=function(){this.close();};window.setTimeout(function(){resetNotification.close();},15e3);}});
}

// Checks 'doc' for new PMs ('doc' should be a document element of the '/inbox.php' page)
function checkPMs(doc) {
	var unreadpms = new Array();
	var newpmnode = doc.evaluate("//tr[@class='unreadpm'][1]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	for (var i=2; newpmnode!=null; i++) {
		unreadpms.push(newpmnode);
		newpmnode = doc.evaluate("//tr[@class='unreadpm']["+i+"]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
	for (var i=0; i<unreadpms.length; i++) {
		var senderTd = null, sender = null, subject = null, id = null, epoch = null;
		senderTd = unreadpms[i].getElementsByTagName('td')[2];
		sender = (senderTd.getElementsByTagName('a').length > 0) ? senderTd.getElementsByTagName('a')[0].innerHTML : senderTd.innerHTML;
		subject = unreadpms[i].getElementsByTagName('a')[0].innerHTML;
		id = unreadpms[i].getElementsByTagName('input')[0].value;
		epoch = new Date(unreadpms[i].getElementsByTagName('span')[0].getAttribute('title')).getTime() / 1000;
		oldPMs = JSON.parse(GM_getValue('oldpms'));
		if (oldPMs[id] !== epoch) {
			eval("window.pmnotif"+id+" = new Notification('New PM from "+sender+"', {icon:'"+GM_getValue('notifyicon')+"', body:'"+subject+"', tag:'pm"+id+"'})");
			eval("window.pmnotif"+id+".onclick = function () { window.open('/inbox.php?action=viewconv&id="+id+"#latest'); this.close(); }");
			var notifyTimeout = JSON.parse(GM_getValue('notifytimeout'));
			if (notifyTimeout >= 0) window.setTimeout(eval('(function(){window.pmnotif'+id+'.close();})'), ((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);
			oldPMs[id] = epoch;
			GM_setValue('oldpms', JSON.stringify(oldPMs));
			new CustomAudio(GM_getValue('notifysound')).play();
		}
	}
}

// Checks 'doc' for new AotW and AotF ('doc' should be a document element of the '/index.php' page)
function checkAotx(doc) {
	var aotf = null, aotftitle = null, aotfnode = doc.getElementById('aotf'), aotw = null, aotwtitle = null, aotwnode = doc.getElementById('aotw');
	aotf = aotfnode.getElementsByTagName('a')[0].getAttribute('href');
	aotw = aotwnode.getElementsByTagName('a')[0].getAttribute('href');
	aotftitle = aotfnode.getElementsByTagName('img')[0].getAttribute('title');
	aotwtitle = aotwnode.getElementsByTagName('img')[0].getAttribute('title');
	gm_aotf = initGM('aotf', aotf, false);
	gm_aotw = initGM('aotw', aotw, false);
	if (aotf !== gm_aotf && aotf !== "") {
		var aotfNotification = new Notification("New Anime of the Fortnight!", {icon:GM_getValue('notifyicon'), body:aotftitle})
		aotfNotification.onclick = new Function("window.open('"+aotf+"')");
		var notifyTimeout = JSON.parse(GM_getValue('notifytimeout'));
		if (notifyTimeout >= 0) window.setTimeout(function(){aotfNotification.close();}, ((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);
		gm_aotf = aotf;
		GM_setValue('aotf', gm_aotf);
		new CustomAudio(GM_getValue('notifysound')).play();
	}
	if (aotw !== gm_aotw && aotw !== "") {
		var aotwNotification = new Notification("New Album of the Week!", {icon:GM_getValue('notifyicon'), body:aotwtitle})
		aotwNotification.onclick = new Function("window.open('"+aotw+"'); this.close();");
		var notifyTimeout = JSON.parse(GM_getValue('notifytimeout'));
		if (notifyTimeout >= 0) window.setTimeout(function(){aotwNotification.close();}, ((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);
		gm_aotw = aotw;
		GM_setValue('aotw', gm_aotw);
		new CustomAudio(GM_getValue('notifysound')).play();
	}
}

// Checks 'doc' for new Posts in bookmarked Threads ('doc' should be a document element of the '/bookmarks.php?type=3' page)
function checkBookmarks(doc) {
	var bookmarksTable = doc.evaluate("//div[@id='content']/div[@class='thin']/table[@width='100%']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	for (var i=bookmarksTable.rows.length-1; row=(i>0)?bookmarksTable.rows[i]:null; i--) {
		if (row.cells[0].getElementsByTagName('img')[0].getAttribute('class') === 'unread') {
			var link = null, title = null, id = null, poster = null, date = null, epoch = null;
			link = row.cells[1].getElementsByClassName('go-last-read')[0].parentNode.getAttribute('href');
			title = row.cells[1].getElementsByTagName('strong')[0].innerText.trim();
			id = row.cells[1].getElementsByTagName('strong')[0].getElementsByTagName('a')[0].getAttribute('href').match(/.*threadid=([0-9]+).*/)[1];
			poster = row.cells[4].innerText.match(/By (.*)\n.*/)[1];
			date = row.cells[4].getElementsByTagName('span')[0].getAttribute('title');
			epoch = new Date(date).getTime() / 1000;
			oldPosts = JSON.parse(GM_getValue('oldposts'));
			if (oldPosts[id] !== epoch) {
				eval("window.bmnotif"+id+" = new Notification('New Post in "+title+"', {icon:'"+GM_getValue('notifyicon')+"', body:'By "+poster+" on "+date+"', tag:'post"+id+"'})");
				eval("window.bmnotif"+id+".onclick = function () { window.open('"+link+"'); this.close(); }");
				var notifyTimeout = JSON.parse(GM_getValue('notifytimeout'));
				if (notifyTimeout >= 0) window.setTimeout(eval('(function(){window.bmnotif'+id+'.close();})'), ((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);
				oldPosts[id] = epoch;
				GM_setValue('oldposts', JSON.stringify(oldPosts));
				new CustomAudio(GM_getValue('notifysound')).play();
			}
		}
	}
}

// Checks 'doc' for new Posts in recent Threads ('doc' should be a document element of the '/userhistory.php?action=posts&userid=USERID' page where USERID is the Users ID)
function checkRecentThreads(doc) {
	var unreadrecentthreads = new Array();
	var newrecentthreadnode = doc.evaluate("//table[contains(@class,'forum_post')]/tbody/tr/td/span[.='(New!)'][1]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	for (var i=2; newrecentthreadnode!=null; i++) {
		unreadrecentthreads.push(newrecentthreadnode.parentNode);
		newrecentthreadnode = doc.evaluate("//table[contains(@class,'forum_post')]/tbody/tr/td/span[.='(New!)']["+i+"]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
	for (var i=0; i<unreadrecentthreads.length; i++) {
		var title = null, link = null, id = null, epoch = null;
		title = unreadrecentthreads[i].getElementsByTagName('a')[0].innerText;
		link = unreadrecentthreads[i].getElementsByTagName('a')[1].getAttribute('href');
		id = unreadrecentthreads[i].parentNode.parentNode.parentNode.id.replace('post', '');
		epoch = new Date(unreadrecentthreads[i].getElementsByTagName('span')[0].innerText).getTime() / 1000;
		oldRecentThreads = JSON.parse(GM_getValue('oldrecentthreads'));
		oldPosts = JSON.parse(GM_getValue('oldposts'));
		if (oldRecentThreads[id] !== epoch && (oldPosts[id] == null || oldPosts[id] < epoch)) {
			eval("window.rtnotif"+id+" = new Notification('New Post in a recent Thread!', {icon:'"+GM_getValue('notifyicon')+"', body:'"+title+"', tag:'post"+id+"'})");
			eval("window.rtnotif"+id+".onclick = function () { window.open('"+link+"'); this.close(); }");
			var notifyTimeout = JSON.parse(GM_getValue('notifytimeout'));
			if (notifyTimeout >= 0) window.setTimeout(eval('(function(){window.rtnotif'+id+'.close();})'), ((notifyTimeout==0)?notifyInterval:notifyTimeout)*1000);
			oldRecentThreads[id] = epoch;
			GM_setValue('oldrecentthreads', JSON.stringify(oldRecentThreads));
			new CustomAudio(GM_getValue('notifysound')).play();
		}
	}
}


/*
 * Now put all that together and do stuff!
 */

if (window.location.pathname === '/user.php' && window.location.search.indexOf('action=edit') > -1) createSettingsPage();

window.setInterval(function () {
	error = null;
	var checks = [
		{
			condition: GM_getValue('pmnotify') === 'true',
			location: '/inbox.php',
			callback: checkPMs
		},
		{
			condition: GM_getValue('bookmarknotify') === 'true',
			location: '/bookmarks.php?type=3',
			callback: checkBookmarks
		},
		{
			condition: GM_getValue('aotxnotify') === 'true',
			location: '/index.php',
			callback: checkAotx
		},
		{
			condition: GM_getValue('recentthreadnotify') === 'true' && userID != null,
			location: '/userhistory.php?action=posts&userid='+userID,
			callback: checkRecentThreads
		}
	]
	function work(checks) {
		if (typeof checks === "undefined") throw new Error("No checks to work");
		var c = checks.shift();
		if (typeof c !== "undefined" && c.condition) window.setTimeout(function () {
			try {
				if (typeof error === "undefined" || !error) {
					new XHRWrapper(c.location, c.callback, c.method, c.sync, c.data);
					work(checks);
				}
				else {
					throw error;
				}
			}
			catch (e) {
				document.dispatchEvent(new UserscriptEvent("error", null, e));
				console.log("Error fetching new notifications: " + e.toString());
				console.log(e);
			}
		}, 1e3);
	}
	work(checks);
}, notifyInterval * 1e3);