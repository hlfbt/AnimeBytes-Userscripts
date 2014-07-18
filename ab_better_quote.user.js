// ==UserScript==
// @name AnimeBytes Better Quote
// @author potatoe
// @version 1.4
// @description makes the quoting feature on AnimeBytes better (includes link back to post and posted date).
// @include *animebyt.es/*
// @include *animebytes.tv/*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

function injectScript (content, id) {
	var script = document.createElement('script');
	if (id) script.setAttribute('id', id);
	script.textContent = content.toString();
	document.body.appendChild(script);
	return script;
}

function Quote(postid, username, surround) {
	$j.ajax({
		url: window.location.pathname,
		data: {
			action: 'get_post',
			post: postid
		},
		success: function (response) {
			// Black Magic happens here (minified because fuck understanding that anyway)
			function replaceImg(text){if(text.match(/^([^]*)(\[img\][^\[]+\[\/img\])([^]*)$/mi)!=null){return text.replace(/^([^]*)(\[img\][^\[]+\[\/img\])([^]*)$/mi,function(full,$1,$2,$3){var tmp="BQTMPBQ"+new Date().getTime()+"BQTMPBQ",ssm=$1.match(/\[hide(=[^\]]*)?\]/mgi),sem=$1.match(/\[\/hide\]/mgi),esm=$3.match(/\[hide(=[^\]]*)?\]/mgi),eem=$3.match(/\[\/hide\]/mgi),ssm=(ssm!=null)?ssm.length:0,sem=(sem!=null)?sem.length:0,esm=(esm!=null)?esm.length:0,eem=(eem!=null)?eem.length:0,hsm=ssm-sem,hem=esm-eem,tmptxt=replaceImg($1+tmp+$3);$1=tmptxt.substring(0,tmptxt.search(tmp));$3=tmptxt.substring(tmptxt.search(tmp)+tmp.length,tmptxt.length);if(hsm>=hem&&hsm>0)return $1+$2+$3;return $1+'[hide=Image]'+$2+'[/hide]'+$3})}return text}
			function replaceYouTube(text){if(text.match(/^([^]*)(\[youtube\][^\[]+\[\/youtube\])([^]*)$/mi)!=null){return text.replace(/^([^]*)(\[youtube\][^\[]+\[\/youtube\])([^]*)$/mi,function(full,$1,$2,$3){var tmp="BQTMPBQ"+new Date().getTime()+"BQTMPBQ",ssm=$1.match(/\[hide(=[^\]]*)?\]/mgi),sem=$1.match(/\[\/hide\]/mgi),esm=$3.match(/\[hide(=[^\]]*)?\]/mgi),eem=$3.match(/\[\/hide\]/mgi),ssm=(ssm!=null)?ssm.length:0,sem=(sem!=null)?sem.length:0,esm=(esm!=null)?esm.length:0,eem=(eem!=null)?eem.length:0,hsm=ssm-sem,hem=esm-eem,tmptxt=replaceYouTube($1+tmp+$3);$1=tmptxt.substring(0,tmptxt.search(tmp));$3=tmptxt.substring(tmptxt.search(tmp)+tmp.length,tmptxt.length);if(hsm>=hem&&hsm>0)return $1+$2+$3;return $1+'[hide=YouTube Video]'+$2+'[/hide]'+$3})}return text}
			response = replaceYouTube(replaceImg(response));
			var date = document.evaluate("//div[@id='post"+postid+"']/div/div/p[@class='posted_info']/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (date) {
				date = new Date(date.title.replace(/-/g,'/')).toUTCString().substring(5, 25).split(' ');
				date = date[1]+" "+date[0]+" "+date[2]+", "+date[3].substring(0,5);
			} else { date = ""; }
			var userid = document.evaluate("//span/a[text()='"+username+"' and starts-with(@href, '/user.php?id=')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.href;
			var quoteText = '[b][user=' + userid + ']' + username + '[/user][/b] [url=' + window.location.pathname + window.location.search + '#post' + postid + ']wrote' + ((date)?' on '+date:'') + '[/url]:\n[quote]' + response + '[/quote]\n';
			if (surround && surround.length > 0) quoteText = '[' + surround + ']' + quoteText + '[/' + surround + ']';
			insert_text(quoteText, '');
		},
		error: function () {
			insert_text("error retrieving post", '');
		},
		dataType: 'html'
	});
}

injectScript(Quote, 'BetterQuote');