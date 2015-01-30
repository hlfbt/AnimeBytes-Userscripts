// ==UserScript==
// @name AnimeBytes Round Avatars
// @author potatoe
// @version 1.2
// @description Makes avatars round and normal on hover!
// @include https://animebytes.tv/*
// @icon https://animebytes.tv/favicon.ico
// @grant GM_addStyle
// @run-at document-start
// ==/UserScript==


/*/
 *
 *  For best results run this script at document-start!
 *  (Check the Settings of the script in Tampermonkey/Greasemonkey for something like "Run at:")
 *  (If we added this script directly to Chrome as an extension this is not possible sadly :c )
 *
/*/


if (!this.GM_addStyle || (this.GM_addStyle.toString && this.GM_addStyle.toString().indexOf("not supported")>-1)) {
	var GM_addStyle = function (css) {
		var style = document.createElement('style');
		style.textContent = css;
		document.appendChild(style);
	}
}


/*/
 *  To give the circles an edge simply change the 'border-radius' values a bit around.
 *  border-radius values go clockwise starting at the top-left corner, so it's
 *  border-radius: TOPLEFT TOPRIGHT BOTTOMRIGHT BOTTOMLEFT
 *  So to add an edge in the top left corner, we simply change the first value to 0 for example.
 *  Some examples are already commented out to test!
/*/

GM_addStyle(
	  '.avatar {\n'
	+ '  max-height: 150px !important;\n'
	+ '  border-radius: 75px 75px 75px 75px;\n'
//	+ '  border-radius: 0 75px 75px 75px;\n'
	+ '}\n'
	+ '.avatar_c {\n'
	+ '  max-height: 100px !important;\n'
	+ '  border-radius: 50px 50px 50px 50px;\n'
//	+ '  border-radius: 5px 50px 5px 50px;\n'
	+ '}\n'
	+ '.friendslist > dt {\n'
	+ '  max-height: 70px !important;\n'
	+ '  border-radius: 35px 35px 35px 35px;\n'
//	+ '  border-radius: 5px 5px 5px 5px;\n'
	+ '  height: auto !important;\n'
	+ '  padding: 0 !important;\n'
	+ '  margin-top: 0 !important;\n'
	+ '}\n'
	+ '.friendslist img {\n'
	+ '  margin-top: 0 !important;\n'
	+ '}\n'
	+ '.center[style="text-align: left; width: 180px;"] .clear {\n'
	+ '  margin-bottom: 0 !important;\n'
	+ '}\n'
	+ '.center[style="text-align: left; width: 180px;"] {\n'
	+ '  margin-top: -5px;\n'
	+ '}\n'
	+ '.avatar, .avatar_c, .friendslist > dt {\n'
	+ '  overflow: hidden;\n'
	+ '  -webkit-transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.2s cubic-bezier(0, 1.05, 0, 1);\n'
	+ '  -moz-transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.2s cubic-bezier(0, 1.05, 0, 1);\n'
	+ '  transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.2s cubic-bezier(0, 1.05, 0, 1);\n'
//	+ '  -webkit-transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.3s cubic-bezier(1, 0, 0.7, 1.4);\n'
//	+ '  -moz-transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.3s cubic-bezier(1, 0, 0.7, 1.4);\n'
//	+ '  transition: max-height 0.5s cubic-bezier(0, 1.05, 0, 1), border-radius 0.3s cubic-bezier(1, 0, 0.7, 1.4);\n'
	+ '}\n'
/*/
 *  If you're like "man FUCK big avatars, I just want the round ones without hover >:(("
 *  Then commenting out all the following lines (except for the one with the sad winking smiley: ');')
 *  would probably be best...
/*/
	+ '.avatar:hover {\n'
	+ '  max-height: 450px;\n'
	+ '}\n'
	+ '.avatar_c:hover {\n'
	+ '  max-height: 300px;\n'
	+ '}\n'
	+ '.friendslist > dt:hover {\n'
	+ '  max-height: 210px;\n'
	+ '}\n'
	+ '.avatar:hover, .avatar_c:hover, .friendslist > dt:hover {\n'
	+ '  border-radius: 0;\n'
	+ '  -webkit-transition: max-height 0.3s, border-radius 0.2s;\n'
	+ '  -moz-transition: max-height 0.3s, border-radius 0.2s;\n'
	+ '  transition: max-height 0.3s, border-radius 0.2s;\n'
	+ '}\n'
);