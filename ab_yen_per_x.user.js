// ==UserScript==
// @name AnimeBytes yen per x
// @author Lemma
// @version 3.12.1 for workgroups
// @description adds yen per hour/week/month/year and colored raw upload/download values to your AB profile page
// @include *animebyt.es/user.php?id=*
// @include *animebytes.tv/user.php?id=*
// @icon http://animebytes.tv/favicon.ico
// ==/UserScript==

function formatInteger(intStr) {
	intStr += '';
	fmtStr = '';
	for (i= intStr.length - 1; i >= 0; i--) {
		if ((i - intStr.length) % 3 == 0)
			fmtStr = ' ' + intStr[i] + fmtStr;
		else
			fmtStr = intStr[i] + fmtStr;
	}
	return fmtStr.trim();
}

function addDefinitionAfter(after, definition, value, cclass) {
	dt = document.createElement('dt');
	dt.appendChild(document.createTextNode(definition));
	dd = document.createElement('dd');
	if (color !== undefined) dd.className += cclass;
	dd.appendChild(document.createTextNode(value));
	after.parentNode.insertBefore(dd, after.nextSibling);
	after.parentNode.insertBefore(dt, after.nextSibling);
	return dt;
}

function addDefinitionBefore(before, definition, value, cclass) {
	dt = document.createElement('dt');
	dt.appendChild(document.createTextNode(definition));
	dd = document.createElement('dd');
	if (color !== undefined) dd.className += cclass;
	dd.appendChild(document.createTextNode(value));
	before.parentNode.insertBefore(dt, before.previousSibling.previousSibling);
	before.parentNode.insertBefore(dd, before.previousSibling.previousSibling);
	return dt;
}

function bytecount(num, hum) {
	switch(hum) {
		case "B": return num;
		case "KB": return num * 1024;
		case "MB": return num * 1048576;
		case "GB": return num * 1073741824;
		case "TB": return num * 1099511627776;
		case "PB": return num * 1125899906842624;
		case "EB": return num * 1152921504606846976;
	}
}

function humancount(num) {
	var i = 0, p = 1;
	if (num < 0) num = num * (p = -1);
	while (num >= 1024) {
		num = num / 1024;
		i++;
	}
	num = num * p;
	switch(i) {
		case 0: return num + ' B';
		case 1: return num + ' KB';
		case 2: return num + ' MB';
		case 3: return num + ' GB';
		case 4: return num + ' TB';
		case 5: return num + ' PB';
		case 6: return num + ' EB';
		default: return num + ' * 1024^'+i+' B';
	}
}

function addRealStats() {
	//find commented stats
	var hidden = "//ul[@style='word-wrap: break-word;']/comment()";
	var hiddenNode = document.evaluate(hidden, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	//get the stats, matches[1] is download amount [2] is KB/MB/GB/TB [3] is per day
	var ulMatcher = /.*Uploaded:\s+([\d,.]+)\s+([A-Z]+)\s\((.*)\)\.*/i;
	var ulMatches = ulMatcher.exec(hiddenNode.textContent);

	var dlMatcher = /.*Downloaded:\s+([\d,.]+)\s+([A-Z]+)\s\((.*)\)\.*/i;
	var dlMatches = dlMatcher.exec(hiddenNode.textContent);

	//get the ratio stats node
	var ratioPath = "//div[@class='userstatsright']/dl/dd[3]";
	var ratioNode = document.evaluate(ratioPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	var fakeMatcher = /([\d,.]+)\s+([A-Z]+)\s\((.*)\)\.*/i;

	var ulPath = "//div[@class='userstatsright']/dl/dd[1]";
	var ulNode = document.evaluate(ulPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	var ulFake = fakeMatcher.exec(ulNode.textContent);

	var dlPath = "//div[@class='userstatsright']/dl/dd[2]";
	var dlNode = document.evaluate(dlPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	var dlFake = fakeMatcher.exec(dlNode.textContent);

	var fakeBuff = humancount(bytecount(ulFake[1].replace(',', ''), ulFake[2]) - bytecount(dlFake[1].replace(',', ''), dlFake[2])).split(' ');
	var realBuff = humancount(bytecount(ulMatches[1].replace(',', ''), ulMatches[2]) - bytecount(dlMatches[1].replace(',', ''), dlMatches[2])).split(' ');
	fakeBuff = parseFloat(fakeBuff[0]).toFixed(2) +' '+ fakeBuff[1];
	realBuff = parseFloat(realBuff[0]).toFixed(2) +' '+ realBuff[1];

	var rawRatio = (bytecount(ulMatches[1].replace(',', ''), ulMatches[2]) / bytecount(dlMatches[1].replace(',', ''), dlMatches[2])).toFixed(2);

	//Color the ratio
	//>switch >2012 http://stackoverflow.com/a/12259830
	if (rawRatio == 0) {color = "r00"} else
	if (rawRatio < 0.1) {color = "r01"} else
	if (rawRatio < 0.2) {color = "r02"} else
	if (rawRatio < 0.3) {color = "r03"} else
	if (rawRatio < 0.4) {color = "r04"} else
	if (rawRatio < 0.5) {color = "r05"} else
	if (rawRatio < 0.6) {color = "r06"} else
	if (rawRatio < 0.7) {color = "r07"} else
	if (rawRatio < 0.8) {color = "r08"} else
	if (rawRatio < 0.9) {color = "r09"} else
	if (rawRatio < 1.0) {color = "r10"} else
	if (rawRatio < 5.0) {color = "r20"} else
	if (rawRatio < 99.0) {color = "r50"}
	else {color = "r99"}

	//add the definitions to the user stats
	var rawNode = addDefinitionAfter(ratioNode, "Raw Ratio:", rawRatio, color);
	addDefinitionBefore(ratioNode, "Raw Uploaded:", ulMatches[1] + " " + ulMatches[2] + " (" + ulMatches[3] + ") ");
	addDefinitionBefore(ratioNode, "Raw Downloaded:", dlMatches[1] + " " + dlMatches[2] + " (" + dlMatches[3] + ") ");

	ratioNode.setAttribute('title', 'Buffer: '+fakeBuff);
	rawNode.nextSibling.setAttribute('title', 'Raw Buffer: '+realBuff);
}

var href = window.location.href;
var urlMatcher = /.*animebytes\.tv\/user.php\?id=\d+$/i;
if (urlMatcher.test(href)) {
	//do this first or added stats will change its position...
	var ypdPath = "//div[@class='userstatsright']/dl/dd[10]";
	var ypdNode = document.evaluate(ypdPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	addRealStats();

	//addDefinitionAfter(ypdNode, 'Yen per megaannum:', '~' + formatInteger(ypdNode.textContent * 365 * 10000));
	//addDefinitionAfter(ypdNode, 'Yen per millennia:', '~' + formatInteger(ypdNode.textContent * 365 * 1000));
	//addDefinitionAfter(ypdNode, 'Yen per century:', '~' + formatInteger(ypdNode.textContent * 365 * 100));
	//addDefinitionAfter(ypdNode, 'Yen per decade:', '~' + formatInteger(ypdNode.textContent * 365 * 10));
	addDefinitionAfter(ypdNode, 'Yen per year:', '~' + formatInteger(ypdNode.textContent * 365));
	//addDefinitionAfter(ypdNode, 'Yen per quarter:', '~' + formatInteger(ypdNode.textContent * 91));
	addDefinitionAfter(ypdNode, 'Yen per month:', '~' + formatInteger(ypdNode.textContent * 30));
	//addDefinitionAfter(ypdNode, 'Yen per fortnight:', formatInteger(ypdNode.textContent * 14));
	addDefinitionAfter(ypdNode, 'Yen per week:', formatInteger(ypdNode.textContent * 7));
	addDefinitionBefore(ypdNode, 'Yen per hour:', formatInteger(Math.round(ypdNode.textContent / 24)));
	
	//do this last
	ypdNode.textContent = formatInteger(ypdNode.textContent);
}