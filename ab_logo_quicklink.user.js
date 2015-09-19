// ==UserScript==
// @name        Quick-Link
// @author      hexstral
// @namespace   quicklink.hexstral.animebytes
// @description Replaces homepage link in logo with custom link
// @include     *animebytes.tv*
// @version     1
// @grant       none
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

// change "torrents.php" to desired link
document.querySelector("#logo > a:nth-child(1)").setAttribute("href", "torrents.php");