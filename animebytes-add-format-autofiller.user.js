// ==UserScript==
// @name        AnimeBytes Add Format Autofiller
// @namespace   animebytes.add.format.autofiller
// @description Autofills add format fields
// @include     https://animebytes.tv/torrents2.php*
// @version     2
// @grant       none
// ==/UserScript==

var add_format_button = document.getElementsByClassName("linkbox")[0];

var cd_groups = document.getElementsByClassName("edition_info");

for (var i = 0; i < cd_groups.length; i++) {
  var checkbox = create_element("INPUT");
  checkbox.type = "checkbox";
  checkbox.className = "userscript_group_selector";
  
  cd_groups[i].children[0].appendChild(checkbox);
}

function click_add_format() {
  var checkboxes = document.getElementsByClassName("userscript_group_selector");
  
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked === true) {
      var info = document.getElementsByClassName("edition_info")[i].children[0];
    }
  }
  
  if (info === undefined) {
    var info = document.getElementsByClassName("edition_info")[0].children[0];
  }
 
  var info2 = [];
  
  for (var i = 0; i < info.childNodes.length; i++) {
    if (info.childNodes[i].tagName !== "A") {
      info2.push(info.childNodes[i].textContent);
    }
  }
  
  info2 = info2.splice(1, info2.length).join(" ").split("/");
  
  for (var i = 0; i < info2.length; i++) {
    info2[i] = info2[i].trim();
  }
  
  info = info2;
  
  var edition_title = info[0];

  if (info.length === 2) {
    var edition_date = info[1];
  } else if (info.length === 3) {
    var catalog_number = info[1];
    var edition_date = info[2];
  } else if (info.length === 4) {
    var catalog_number = info[2];
    var edition_date = info[3];
  }
  
  var torrents = document.getElementsByClassName("group_torrent");
  var flac_media = "";
  
  for (var i = 0; i < torrents.length; i++) {
    var torrent_info = torrents[i].getElementsByTagName("td")[0].textContent.trim().split("/");
    
    if (/FLAC/.test(torrent_info[0])) {
      flac_media = torrent_info[2].trim();
    }
  }
  
  console.log(edition_title, edition_date, catalog_number);
  
  if (catalog_number) {
    save("userscript_cd_info", {
      "edition_title": edition_title,
      "catalog_number": catalog_number,
      "edition_date": edition_date,
      "flac_media": flac_media
    });
  } else {
    save("userscript_cd_info", {
      "edition_title": edition_title,
      "edition_date": edition_date,
      "flac_media": flac_media
    });
  }
 
}

function create_element(tag) {
  var elem = document.createElement(tag);
  
  return elem;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

add_format_button.addEventListener("click", click_add_format, true);
