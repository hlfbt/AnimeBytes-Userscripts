// ==UserScript==
// @name           AB Hoverin'
// @namespace      http://animebytes.tv
// @include        *animebytes.tv*
// ==/UserScript==

function thing(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
thing(
'.navmenu:hover .subnav {' +
' display: block !important;' +
'}' 
);
