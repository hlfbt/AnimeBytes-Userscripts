// ==UserScript==
// @name        Freepool-AB
// @namespace   VampiricWulf
// @description puts the freeleech donation amount as a progress bar under donation bar.
// @include     http*://animebytes.tv/*
// @version     0.2.1
// @grant       none
// ==/UserScript==
(function() {
  var css, d, freeBar, freeBox, freeInnerBar, freeSpan, freepool;

  d = document;

  freeBox = freeBar = freeInnerBar = freeSpan = null;

  css = d.createElement('style');

  css.type = 'text/css';

  css.innerHTML = '#freeBar{\n    display:block;\n    background:#055;\n    height:25px;\n    width:193px;\n    border:1px solid #044;\n    position:relative;\n    right:-2px;\n}\n#freeInnerBar{\n    display:block;\n    background:#077;\n    height:25px;\n    width:0%;\n    float:left;\n    font-size:14px;\n    font-weight:bold;\n    line-height:25px;\n    color:#0BB;\n}';

  d.body.appendChild(css);

  (freepool = function() {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://animebytes.tv/konbini.php?action=pool', true);
    xhr.onload = function() {
      var data, donBox, donChild, donatedYen, neededYen, percentYen, _ref;
      if (!(data = (_ref = this.response.match(/([\d,])+\s\/\s([\d,])+/)) != null ? _ref[0] : void 0)) {
        return;
      }
      if (!freeSpan) {
        donBox = d.getElementById('donation_column');
        donChild = d.getElementsByTagName('center')[0];
        freeBox = d.createElement('a');
        freeSpan = d.createElement('span');
        freeBar = d.createElement('span');
        freeInnerBar = d.createElement('span');
        freeBox.href = 'https://animebytes.tv/konbini.php?action=pool';
        freeBar.id = 'freeBar';
        freeInnerBar.id = 'freeInnerBar';
        freeBar.appendChild(freeInnerBar);
        freeBox.appendChild(freeBar);
        donBox.insertBefore(freeSpan, donChild.nextSibling);
        donBox.insertBefore(freeBox, freeSpan.nextSibling);
      }
      donatedYen = parseFloat(data.match(/([\d,])+\s/)[0].replace(/[^0-9.-]+/g, ''));
      neededYen = parseFloat(data.match(/\s([\d,])+/)[0].replace(/[^0-9.-]+/g, ''));
      percentYen = Math.round(donatedYen / neededYen * 1000) / 10;
      freeSpan.textContent = "\u00A5" + (data.match(/([\d,])+\s\/\s/)[0]) + "\u00A5" + (data.match(/\s([\d,])+/)[0].replace(/[\s]+/g, ''));
      freeInnerBar.textContent = "" + percentYen + "%";
      freeInnerBar.style.width = "" + percentYen + "%";
      return setTimeout(freepool, 30000);
    };
    xhr.send(null);
  })();

}).call(this);
