// ==UserScript==
// @name          Animebytes forum improvements
// @author        Eruonen feat. kleineprinz (include updates)
// @description   This userscript adds various improvements to the Animebytes forums in an attempt to make it more user-friendly.
// @version       1.5.420.YOLO.SWAG.69
// @include       https://animebytes.tv/*
// @include       https://*.animebytes.tv/*
// @exclude       https://animebytes.tv/imageupload.php*
// @match         https://animebytes.tv/*
// @match         https://*.animebytes.tv/*
// @icon          https://animebytes.tv/favicon.ico

// ==/UserScript==
function add(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}
// just stuff
function main() {
  var cfImages = {
    giveYenBlack: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAPFBMVEUAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASdxdd5mNzr3YQho7iAAAAEHRSTlMAABEiM0RVZneImaq7zN3uf6QJ9gAAAGlJREFUGFdlzUESgzAMQ1EJSgOUNt/O/e/aTUpgquUbyZbtDWZpqrxsy/YMq1Rg6aCDKr356AcFng9YT1Dl2GEasEFl14AZYDmh0LPeoUXrYHuBEhnXRovIiDYgMjMzxuTa+LvRc/sy8gWftAb/Cv2HPwAAAABJRU5ErkJggg==',
    giveYenGrey: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAQlBMVEVmZmb///9mZmZmZmZmZmZmZmZmZmZmZmZmZmZzr3ZmZmZmZmZmZmZmZmZvmHFmZmZmZmZmZmYSdxdd5mNmZmZsim7mE1EaAAAAEnRSTlMAABEiM0RVZnd/iJmqu7vM3e50NhBwAAAAa0lEQVQYV2XMwRaCMBBD0Qy1toConXn8/6+6sFI4ZnlPEpnZAkmaGg8zk5klqFKB3EEbTXrx1g8K3G9QD1BjW2EasEBj1YAEkA8o9NQr7P48JspQPPzc2N3DfR7gERHhY3Ju/H30zD5f4ZsPJ54Hw+4gtMUAAAAASUVORK5CYII=',
    arrow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAk0lEQVR42u2TIQ4CQQxF3xBCguUeuCrkojgHghPsJTgDR8BjQfdzAxQJahUnKGbEZjOziLXbpKLNf02btikimGILJtpcAJb9QNIZaP8wL2BnZh1AGq5R0gU4VuBPht9jI5yAayHfAfs+XOwgd7ECbkCTU98MP4faVLtESWvgDmyBg5k9isKIqLq7b9y9GdOk+Rf4Af9YWLjhruJEAAAAAElFTkSuQmCC'
  };
  // add some custom css
  var css = document.createElement("style");
  css.type = "text/css";
  if($("link[title='coalbytes']").length > 0)
    cfImages.giveYen = cfImages.giveYenGrey;
  else
    cfImages.giveYen = cfImages.giveYenBlack;
  css.innerHTML = "#smileys{float:right;width:250px;height:158px;margin-top:39px;margin-right:32px}#smileys span{min-width:20px;display:inline-block}#quickreplybuttons,#quickreplytext,#bbcode{width:570px;padding-left:30px;float:left}#quickreplypreview,#quickpost{width:570px;min-height:158px;float:left}#quickpost{max-width:864px}#quickreplypreview{margin:0;margin-left:30px;padding:0!important}#quickreplybuttons{text-align:right;padding-top:5px}#smileytitle{background:#721010;color:white;padding-top:8px;padding-bottom:8px;width:250px;cursor:pointer}#smileybox{background:#1d1d1d;display:none;height:121px;padding-top:5px}#smileybox img{cursor:pointer;max-width:20px}#user_comments #smileys{width:602px;margin-top:5px;float:left;margin-left:30px;height:auto}#user_comments #smileytitle{width:602px}#user_comments #smileybox{height:80px}#extended_btn{display:none}#user_comments textarea{margin-top:5px}#user_comments .commentbody textarea{width:99%}.post_block ul.user_fields:last-child span.uf_left{width:auto}.dropdown dd,.dropdown dt,.dropdown ul{margin:0;padding:0}.dropdown dd{position:relative}.dropdown dt a{background:white url("+cfImages.arrow+") no-repeat scroll right center;display:block;padding-right:20px;border:1px solid #cbcbcb;width:119px;height:28px;padding-top:5px;border-radius:5px}.dropdown dt a span{cursor:pointer;display:block;padding:5px}.dropdown dd ul{background:white none repeat scroll 0 0;display:none;list-style:none;padding:5px 0;position:absolute;left:0;top:0;width:auto;width:139px;border:1px solid #cbcbcb;border-top:0;border-bottom-right-radius:5px;border-bottom-left-radius:5px}.dropdown span.value{display:none}.dropdown dd ul li a{padding:5px;display:block}.dropdown dd ul li:hover{background-color:#e9e9e9}#inbox #quickpostform>div{float:left;margin-bottom:20px;text-align:left}#inbox #quickpostform h3,#inbox #quickpostform input{margin-left:30px}#inbox #quickpostform input{width:568px}#inbox #quickpostform #quickreplybuttons input{width:auto;margin-left:0}#smileytitle,#bbcode{text-align:center}#forums .post_body textarea{max-width:720px}";
  document.body.appendChild(css);
  // coalbytes css fix
  if($("link[title='coalbytes']").length > 0)
    css.innerHTML += "#smileybox{background-color:#2C2C2C}.dropdown dt a, .dropdown dd ul li a{color:#777}";
  
  $(document).ready(function() {
    function prefixSelectionLines( targetTextArea, prefix ) {
      targetTextArea.setAttribute('tabIndex',0);
      var scrollTop = targetTextArea.scrollTop;
      var selectionStart = targetTextArea.selectionStart;
      var selectionEnd = targetTextArea.selectionEnd;
      var selectedText = targetTextArea.value.substring( selectionStart, selectionEnd );
      var lines = selectedText.split( '\n' );
      var newValue = '';
      var i;
      for(i = 0 ; i < lines.length; i++ ) {
        newValue += prefix + lines[i];
        if ( ( i + 1 ) !== lines.length ) {newValue += '\n';}
      }
      targetTextArea.value = 
      targetTextArea.value.substring( 0, selectionStart ) + newValue + targetTextArea.value.substring( selectionEnd );
      targetTextArea.scrollTop = scrollTop;
    }
    
    function dropDownShit(selector) {
      // make neat looking dropdown menu shit
      $(selector + " dt a").click(function() {
        $(selector + " dd ul").toggle();
        if($(selector + " dd ul").css('display') === 'none') {
          $(selector + ' dt a').css({
            'border-bottom-right-radius': '5px',
            'border-bottom-left-radius': '5px'
          });
        } else {
          $(selector + ' dt a').css({
            'border-bottom-right-radius': '0px',
            'border-bottom-left-radius': '0px'
          });
        }
        return false;
      });
      $(selector + " dd ul li a").click(function() {
        var size = $(this).attr('class');
        insert_text('[size='+size+']', '[/size]');
        $('#quickpost').focus();
        $(selector + " dd ul").hide();
        $(selector + ' dt a').css({
          'border-bottom-right-radius': '5px',
          'border-bottom-left-radius': '5px'
        });
        return false;
      });
      $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (! $clicked.parents().is($(selector)))
          if($(selector + " dd ul").css('display') !== 'none') {
            $(selector + ' dt a').css({
              'border-bottom-right-radius': '5px',
              'border-bottom-left-radius': '5px'
            });
          }
          $(selector + " dd ul").hide();
      });
    }
    function changeSubmitArea() {
      // add options
      $('#bbcode').prepend('<div style="display:inline-table;"><dl id="textsize" class="dropdown"><dt><a href="javascript:;"><span>Text size</span></a></dt><dd><ul><li><a style="font-size:0.75em" class="1" href="javascript:;">Size 1</a></li><li><a style="font-size:1em" class="2" href="javascript:;">Size 2</a></li><li><a style="font-size:1.25em" class="3" href="javascript:;">Size 3</a></li><li><a style="font-size:1.5em" class="4" href="javascript:;">Size 4</a></li><li><a style="font-size:1.75em" class="5" href="javascript:;">Size 5</a></li><li><a style="font-size:2em" class="6" href="javascript:;">Size 6</a></li><li><a style="font-size:2.25em" class="7" href="javascript:;">Size 7</a></li></ul></dd></dl></div>');
      dropDownShit('#textsize');
      // move the preview
      $('#quickreplypreview').insertAfter('#quickreplytext');
      // some elements are a bitch to grab with just css since they have no unique class combos or ids, so I just use javascript. it's super fast anyway
      $('#quickpostform').parent().css('float', 'left');
      // replace the emoticon list. using static html since generating it may be noticably slower on slower computers
      $('#smileys').html('<div id="smileytitle">Show emoticons</div><div id="smileybox"><span><img src="static/common/smileys/Smile.png" title=":)" alt="Smile" onclick="insert_text(\':)\', \'\')"></span><span><img src="static/common/smileys/Frown.png" title=":(" alt="Frown" onclick="insert_text(\':(\', \'\')"></span><span><img src="static/common/smileys/Eh.png" title=":|" alt="Eh" onclick="insert_text(\':|\', \'\')"></span><span><img src="static/common/smileys/Sarcastic.png" title="o_O" alt="Sarcastic" onclick="insert_text(\'o_O\', \'\')"></span><span><img src="static/common/smileys/Sealed.png" title=":x" alt="Sealeed" onclick="insert_text(\':x\', \'\')"></span><span><img src="static/common/smileys/Tongue.png" title=":P" alt="Tongue" onclick="insert_text(\':P\', \'\')"></span><span><img src="static/common/smileys/Undecided.png" title=":undecided:" alt="Undecided" onclick="insert_text(\':undecided:\', \'\')"></span><span><img src="static/common/smileys/ohnoes.png" title="x(" alt="OhNoes" onclick="insert_text(\'x(\', \'\')"></span><span><img src="static/common/smileys/Confused.png" title=":S" alt="Confused" onclick="insert_text(\':S\', \'\')"></span><span><img src="static/common/smileys/Gasp.png" title=":o" alt="Gasp" onclick="insert_text(\':o\', \'\')"></span><span><img src="static/common/smileys/LargeGasp.png" title=":O" alt="Large Gasp" onclick="insert_text(\':O\', \'\')"></span><span><img src="static/common/smileys/Crying.png" title=":cry:" alt="Crying" onclick="insert_text(\':cry:\', \'\')"></span><span><img src="static/common/smileys/Grin.png" title=":D" alt="Grin" onclick="insert_text(\':D\', \'\')"></span><span><img src="static/common/smileys/Thumbs_Up.png" title=":thumbup:" alt="Thumb Up" onclick="insert_text(\':thumbup:\', \'\')"></span><span><img src="static/common/smileys/Thumbs_Down.png" title=":thumbdown:" alt="Thumb Down" onclick="insert_text(\':thumbdown:\', \'\')"></span><span><img src="static/common/smileys/Wink.png" title=";)" alt="Wink" onclick="insert_text(\';)\', \'\')"></span><span><img src="static/common/smileys/VeryAngry.png" title=":@" alt="Gasp" onclick="insert_text(\':@\', \'\')"></span><span><img src="static/common/smileys/Sick.png" title=":sick:" alt="Sick" onclick="insert_text(\':sick:\', \'\')"></span><span><img src="static/common/smileys/Angry_Face.png" title=":angry:" alt="Angry Face" onclick="insert_text(\':angry:\', \'\')"></span><span><img src="static/common/smileys/Angel.png" title=":angel:" alt="Angel" onclick="insert_text(\':angel:\', \'\')"></span><span><img src="static/common/smileys/Blush.png" title=":blush:" alt="Blush" onclick="insert_text(\':blush:\', \'\')"></span><span><img src="static/common/smileys/Halo.png" title=":halo:" alt="Halo" onclick="insert_text(\':halo:\', \'\')"></span><span><img src="static/common/smileys/Heart.png" title=":heart:" alt="Heart" onclick="insert_text(\':heart:\', \'\')"></span><span><img src="static/common/smileys/Hot.png" title="8-)" alt="Hot" onclick="insert_text(\'8-)\', \'\')"></span><span><img src="static/common/smileys/Kiss.png" title=":kiss:" alt="Kiss" onclick="insert_text(\':kiss:\', \'\')"></span><span><img src="static/common/smileys/Money-mouth.png" title=":$" alt="Money Mouth" onclick="insert_text(\':$\', \'\')"></span><span><img src="static/common/smileys/Pirate.png" title=":pirate:" alt="Pirate" onclick="insert_text(\':pirate:\', \'\')"></span><span><img src="static/common/smileys/ninja.png" title=":ninja:" alt="Ninja" onclick="insert_text(\':ninja:\', \'\')"></span><span><img src="static/common/smileys/kamina.png" title=":kamina:" alt="Kamina" onclick="insert_text(\':kamina:\', \'\')"></span><span><img src="static/common/smileys/face_plain.png" title=":plainface:" alt="Plain Face" onclick="insert_text(\':plainface:\', \'\')"></span><span><img src="static/common/smileys/awesome.png" title=":awesomeface:" alt="Awesomeface" onclick="insert_text(\':awesomeface:\', \'\')"></span><span><img src="static/common/smileys/nosebleed.png" title=":nosebleed:" alt="Nosebleed" onclick="insert_text(\':nosebleed:\', \'\')"></span><span><img src="static/common/smileys/colonthree.png" title=":-3" alt=":3" onclick="insert_text(\':-3\', \'\')"></span><span><img src="static/common/smileys/coolcustomer.png" title=":coolcustomer:" alt="Cool Customer" onclick="insert_text(\':coolcustomer:\', \'\')"></span><span><img src="static/common/smileys/wotwot.png" title=":wotwot:" alt="Wotwot" onclick="insert_text(\':wotwot:\', \'\')"></span><span><img src="static/common/smileys/talknerdytome.png" title=":nerd:" alt="Nerd" onclick="insert_text(\':nerd:\', \'\')"></span><span><img src="static/common/smileys/o_o.png" title="o_o" alt="o_o" onclick="insert_text(\'o_o\', \'\')"></span><span><img src="static/common/smileys/XD.png" title="XD" alt="XD" onclick="insert_text(\'XD\', \'\')"></span><span><img src="static/common/smileys/headphones.png" title=":headphones:" alt="Headphones" onclick="insert_text(\':headphones:\', \'\')"></span><span><img src="static/common/smileys/doh.png" title=":doh:" alt="Doh" onclick="insert_text(\':doh:\', \'\')"></span><span><img src="static/common/smileys/disapproval.png" title=":disapproval:" alt="Disapproval" onclick="insert_text(\':disapproval:\', \'\')"></span><span><img src="static/common/smileys/soniamdisappoint.png" title=":soniamdisappoint:" alt="Son, I am disappoint" onclick="insert_text(\':soniamdisappoint:\', \'\')"></span><span><img src="static/common/smileys/whore.png" title=":whore:" alt="Whore" onclick="insert_text(\':whore:\', \'\')"></span><span><img src="static/common/smileys/facepalm.png" title=":facepalm:" alt="Facepalm" onclick="insert_text(\':facepalm:\', \'\')"></span><span><img src="static/common/smileys/~_~.png" title="~_~" alt="~_~" onclick="insert_text(\'~_~\', \'\')"></span><br /><span><img src="static/common/smileys/ban.png" style="max-width:none" title=":ban:" alt="Ban" onclick="insert_text(\':ban:\', \'\')"></span><span><img src="static/common/smileys/whiteflag.png" style="max-width:none" title=":whiteflag:" alt="I give up" onclick="insert_text(\':whiteflag:\', \'\')"></span></div>');
      // spoiler-like box for the emoticons since i do not want to look at that shit every time i post
      $('#smileytitle').click(function() {
        if($('#smileybox').css('display') === 'none') {
          $('#smileybox').slideDown();
          $('#smileytitle').text('Hide emoticons');
        } else {
          $('#smileybox').slideUp();
          $('#smileytitle').text('Show emoticons');
        }
      });
      // override onclick for the list item option with something that works much better.
      $('img[alt="List Item"]').removeAttr('onclick').click(function(event) {
        event.preventDefault();
        prefixSelectionLines(document.getElementById('quickpost'), '[*]');
        $('#quickpost').focus();
      });
      // new thread page needs some cleaning up as well
      var newThreadDiv = $('#poll_question').parent().parent().parent();
      newThreadDiv.css('width', '950px');
      newThreadDiv.find('h3').css({'text-align':'left','padding-left':'30px'});
      newThreadDiv.find('input[type=text]').css({'width':'93%'});
      $('#poll_question').parent().insertAfter('#quickreplybuttons');
      $('#poll_question').parent().css({
        'float': 'left',
        'width': '90%',
        'margin-left': '30px',
        'margin-top': '5px'
      });
      $('#quickpost').removeAttr('cols');
      $('#quickpost').removeAttr('rows');
      // move the poll options to where they belong
      $('form#addpoll').prependTo('div#addpoll');
      $('form#addpoll').css('float', 'none');
    }
    
    function changePostDisplayArea() {
      // add a "Give Yen to [user]" button to each post
      // start by looping through every post
      $('.post_block').each(function(index) {
        // get the username of the person who made this post
        var cfUser = $(this).find('.num_author a:first').text();
        // get the element that holds all the post info. getting this with plain css selectors is horrible, parent() is much more convenient
        var cfUserInfo = $(this).find('span.com-add-friend').parent().parent();
        // editing the style of just this element without potentially breaking other stuff is much easier with javascript than with plain css
        cfUserInfo.css('width', 'auto');
        // add the html
        cfUserInfo.append('&nbsp;&nbsp;<a href=konbini.php?action=send&to='+cfUser+'><img title="Give yen to '+cfUser+'" src="'+cfImages.giveYen+'" /></a>');
      });
    }
    
    $.ctrl = function(key, callback, args) {
      var isCtrl = false;
      $(document).keydown(function(e) {
        if(!args) args=[];
        if(e.ctrlKey) isCtrl = true;
        if(e.keyCode === key.charCodeAt(0) && isCtrl && $('#quickpost').is(':focus')) {
          callback.apply(this, args);
          return false;
        }
      }).keyup(function(e) {
        if(!e.ctrlKey) isCtrl = false;
      });        
    };
    
    function addKeyboardShortcuts() {
      $.ctrl('B', function() {
        insert_text('[b]', '[/b]');
      });
      $.ctrl('I', function() {
        insert_text('[i]', '[/i]');
      });
      $.ctrl('U', function() {
        insert_text('[u]', '[/u]');
      });
      $.ctrl('S', function() {
        insert_text('[s]', '[/s]');
      });
      $.ctrl('P', function() {
        insert_text('[spoiler]', '[/spoiler]');
      });
    }
    
    function openLinksInNewWindow() {
      $('#forums .post a').each(function(index) {
        var link = $(this).attr("href");
        if(link.substring(0,7) !== "#")
            $(this).attr("target", "_blank");
      });
    }
    changeSubmitArea();
    changePostDisplayArea();
    addKeyboardShortcuts();
    openLinksInNewWindow(); // idea from ahtl
  });
}
// load that shit up
add(main);