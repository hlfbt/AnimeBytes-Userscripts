// ==UserScript==
// @name         AnimeBytes Random Torrent
// @namespace    https://animebytes.tv/user.php?id=33613
// @version      0.2
// @description  Selects a random torrent from the current search
// @author       igroc
// @match        https://animebytes.tv/torrents.php*
// @updateURL    https://gist.github.com/remai/3a76c66bf1f79d3c85a2/raw/animebytes_random_torrent.user.js
// @downloadURL  https://gist.github.com/remai/3a76c66bf1f79d3c85a2/raw/animebytes_random_torrent.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function addRandomButton() {
    var submitDiv = document.querySelector("div.submit");
    var input = document.createElement("input");
    input.setAttribute("type", "button");
    input.setAttribute("value", "Go To Random");
    input.onclick = gotoRandomTorrent;
    submitDiv.appendChild(input);
}

function gotoRandomTorrent() {
    var pageLinks = document.querySelectorAll(".page-link");
    
    // Only a single page, go to a series on this page
    if (!pageLinks || pageLinks.length == 0) {
        var groups = document.querySelectorAll(".group_title");
        var selected_group = groups[Math.floor(Math.random() * groups.length)];
        var success = false;
        if (selected_group) {
            var series_link = selected_group.getElementsByTagName("a");
            if (series_link && series_link.length > 0) {
                window.location = series_link[0].getAttribute("href");
                success = true;
            }
        }
        if (!success) {
            alert("Couldn't find any series with these search filters");
        }
        return;
    }
    
    // Pick a random search page number, up to the max page
    var maxPageNum = parseInt(pageLinks[pageLinks.length - 1].innerText);
    var randomPageNum = 1 + Math.floor(Math.random() * maxPageNum);
    var currentQuery = window.location.href.match(/torrents.php\?(.*)$/);
    if (currentQuery && currentQuery.length == 2) {
        url = "/torrents.php?" + currentQuery[1] + "&page=" + randomPageNum;
    } else {
        url = "/torrents.php?page=" + randomPageNum;
    }
    
    // Get the page contents
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(res) {
            if (res.status == 200) {
                // Pick a random series from the page and go to it
                var matches = res.responseText.match(/href="\/series\.php\?id=\d+"/g);
                if (matches && matches.length > 0) {
                    var i = Math.floor(Math.random() * matches.length);
                    var series_id = parseInt(matches[i].match(/.*?(\d+)/)[1]);
                    window.location = "/series.php?id=" + series_id;
                }
            }
        }
    });
}

addRandomButton();