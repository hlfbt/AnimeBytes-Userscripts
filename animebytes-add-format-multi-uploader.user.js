// ==UserScript==
// @name        AnimeBytes Add Format Multi-uploader
// @namespace   animebytes.add.format.multi.uploader
// @description This is a script that lets you add several torrents to the file selector and then uploads all torrents at the same time
// @include     https://animebytes.tv/upload.php?type=music&groupid=*
// @version     2
// @grant       none
// ==/UserScript==

var file_upload_input = document.getElementById("file_input_music");

add_mult_torrent_button();
//add_go_back_button();

file_upload_input.setAttribute("multiple", "");

var clickable = document.getElementById("file_input_music_enhanced");

var xhr = function(u, c, t) {
  var r = new XMLHttpRequest();
  r.onreadystatechange = function() {
    if (r.readyState == 4 && r.status == 200) {
      c(r.response);
    }
  };
  r.open("GET", u, true);
  r.setRequestHeader("Accept", "application/json");
  if (t) {r.responseType = t;}
  r.overrideMimeType('text/plain');
  r.send();
  return r;
}

function get_torrent_data() {
  // Doesn't actually return torrent data :^)

  var input = document.getElementById("file_input_music");

  var i = -1;

  //for (var i = 0; i < input.files.length; i++) {
  function lmao() {
    setTimeout(function() {
      i++;
      var file = input.files[i];

      auto_fill_edition();
      auto_fill_mp3(i);

      var fr = new FileReader();
      fr.readAsBinaryString(file);

      fr.onload = function(evt) {
        console.log(file);
        upload(file);
      };

      if (i < input.files.length) {
        lmao();
      } else {
        console.log("done");
      }
    }, 100);
  }

  lmao();
  //}
}



function upload(file_input) {
  var xhr = new XMLHttpRequest();
  var cool_form = new FormData();

  var post_info_forms = document.getElementById("upload_form_music").getElementsByTagName("div")[0].getElementsByTagName("input");

  for (var i = 0; i < post_info_forms.length; i++) {
    var name = post_info_forms[i].name;
    var value = post_info_forms[i].value;

    cool_form.append(name, value);
  }

  var release_info_forms = document.getElementById("release_information").getElementsByTagName("input");

  var catalog_number = "";

  for (var i = 0; i < release_info_forms.length; i++) {
    var name = release_info_forms[i].name;
    var value = release_info_forms[i].value;

    cool_form.append(name, value);
  }

  var encoding = document.getElementById("encoding").value;
  var bitrate = document.getElementById("bitrate").value;
  var cdmedia = document.getElementById("cdmedia").value;
  var release_desc = document.getElementById("release_desc").value;

  cool_form.append("encoding", encoding);
  cool_form.append("bitrate", bitrate);
  cool_form.append("cdmedia", cdmedia);
  cool_form.append("release_desc", release_desc);

  var upload_url = document.documentURI;

  xhr.open("POST", upload_url, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // Handle response.
      var response = xhr.responseText;
      console.log("success");
      notify_completed_upload(file_input.name);

    } else {
      console.log("fail");
    }
  };




  //console.log(file_input)

  cool_form.append("file_input", file_input);
  cool_form.append("scene", "");


  xhr.send(cool_form);
}

function notify_completed_upload(name) {
  var span = document.createElement("SPAN");

  span.innerHTML = "<span style='color: #5fe75b;'>Completed</span>: " + name +
    "<br>";

  document.getElementById("completed_uploads").appendChild(span);
}

function add_mult_torrent_button() {
  var info = load("userscript_cd_info");

  var form = "<input id='file_input_music_enhanced' type='button' size='50' name='file_input_enhanced' value='Upload multiple torrents' multiple />" +
      "<br>" +
      "<div id='completed_uploads'></div>" +
      "<br>" +
      "<a href='" + info["prev_page"] + "'>Go back to the torrent page</a>";

  var div = document.createElement("DIV");

  div.innerHTML = form;

  document.getElementById("file_input_music").parentNode.appendChild(div);
}

function add_go_back_button() {
  var form = "";

  var div = document.createElement("DIV");

  div.innerHTML = form;

  document.getElementById("file_input_music").parentNode.appendChild(div);
}

function auto_fill_mp3(i) {
  var input = document.getElementById("file_input_music");
  var filename = input.files[i].name;
  var info = load("userscript_cd_info");

  var split = filename.split(" ");

  function check_mp3(filename_array) {
    //for (var i = 0; i < filename_array.length; i++) {
    if (/320/.test(filename_array[filename_array.length - 1])) {
      return "320";
    } else if (/V0/.test(filename_array[filename_array.length - 1])) {
      return "V0";
    } else if (/V2/.test(filename_array[filename_array.length - 1])) {
      return "V2"
    }
  }

  var res = check_mp3(split);
  //console.log(res);

  var encoding_select = document.getElementById("encoding");
  var bitrate_select = document.getElementById("bitrate");
  var media_select = document.getElementById("cdmedia");

  encoding_select[1].selected = true; // Because MP3 is always what I will be uploading.

  for (var i = 0; i < media_select.length; i++) {
    if (new RegExp(media_select[i].value).test(info["flac_media"])) {
      media_select[i].selected = true;
    }
  }



  if (res === "320") {
    bitrate_select[5].selected = true;
  } else if (res === "V0") {
    bitrate_select[4].selected = true;
  } else if (res === "V2") {
    bitrate_select[2].selected = true;
  }
}

function auto_fill_edition() {
  var info = load("userscript_cd_info");

  var dd = document.getElementsByTagName("dd")

  var catalog_number_input = dd[7].children[0];
  var edition_title_input = dd[9].children[0];
  var edition_date_input = dd[11].children[0];

  if (info["edition_title"]) {
    edition_title_input.value = info["edition_title"];
  }

  if (info["catalog_number"]) {
    catalog_number_input.value = info["catalog_number"];
  }

  if (info["edition_date"]) {
    edition_date_input.value = info["edition_date"];
  }

  /*
  if (info.length === 4) {
    edition_title_input.value = info["edition_title"];
    catalog_number_input.value = info["catalog_number"];
    edition_date_input.value = info["edition_date"];
  } else {
    edition_title_input.value = info["edition_title"];
    edition_date_input.value = info["edition_date"];
  }
  */
}

function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

clickable.addEventListener("click", get_torrent_data, true);



/*

var input = document.getElementById("file_input_music");

var file = input.files[0];
var fr = new FileReader();
fr.readAsBinaryString(file);
var penis = "";

fr.onload = function(evt) {
  penis = evt.target.result;
};


var group_id = window._.URL.split("=")[window._.URL.split("=").length - 1];

var post_info_forms = document.getElementById("upload_form_music").getElementsByTagName("div")[0].getElementsByTagName("input");
console.log(post_info_forms);

for (var i = 0; i < post_info_forms.length; i++) {
  var name = post_info_forms[i].name;
}


var rel_forms = document.getElementById("release_information").getElementsByTagName("input");

*/















































