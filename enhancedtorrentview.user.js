// ==UserScript==
// @name        Enhanced Torrent View
// @namespace   Megure@AnimeBytes.tv
// @description Shows how much yen you would receive if you seeded torrents; shows required seeding time
// @include     http*://animebytes.tv*
// @version     0.84
// @grant       GM_getValue
// @grant       GM_setValue
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

(function() {
    var showYen = GM_getValue('ABTorrentsShowYen', 'true'), // true / false: activate / deactivate display of yen production per hour
        reqTime = GM_getValue('ABTorrentsReqTime', 'true'), // true / false: activate / deactivate display of required seeding time
        timeFrame = parseInt(GM_getValue('ABTorrentsYenTimeFrame', '1'), 10),
        fa = 1;

    function unitPrefix (prefix) {
        switch (prefix.toUpperCase()) {
            case '':  return 1 / 1073741824;
            case 'K': return 1 / 1048576;
            case 'M': return 1 / 1024;
            case 'G': return 1;
            case 'T': return 1024;
            case 'P': return 1048576;
            case 'E': return 1073741824;
            default:  return 0;
        }
    }

    function countCols (row) {
        var cells = row.cells, cols = 0, _i = 0, _len = cells.length;
        for (; _i < _len; _i++) {
            cols += cells[_i].colSpan;
        }
        return cols;
    }

    function dur2string (duration) {
        var durationString = '',
            tempH = Math.floor(duration),
            tempM = Math.ceil((duration * 60) % 60);
        if (tempM === 60) {
            tempH += 1;
            tempM = 0;
        }
        durationString += tempH + ' hours';
        if (tempM > 0)
            durationString += ' and ' + tempM + ' minutes';
        durationString += ' (~' + (Math.round(10 * duration / 24) / 10) + ' days)';
        return durationString;
    }

    function yen2string (yen, perSize) {
        if (perSize === true) {
            if (timeFrame >= 100) return yen.toFixed(1);
            else if (timeFrame >= 10) return yen.toFixed(2);
            else return yen.toFixed(3);
        }
        if (timeFrame >= 100) return Math.round(yen);
        else if (timeFrame >= 10) return yen.toFixed(1);
        else return yen.toFixed(2);
    }

    function fu (myDuration) {
        return Math.pow(2, myDuration / (24 * 365.25));
    }

    function fs (mySize) {
        return Math.max(0.1, Math.sqrt(mySize)) / 4;
    }

    function ft (mySeeders) {
        return Math.min(1.0, 3 / Math.sqrt(mySeeders + 4));
    }

    function f (mySize, mySeeders, myDuration) {
        return fs(mySize) * fu(myDuration) * ft(mySeeders) * fa * timeFrame;
    }

    function createTitle (start, end, mySize, myDuration) {
        start = Math.max(start, 5);
        end   = Math.min(start + 4, Math.max(end, 5));
        var res = '';
        for (var j = start; j <= end; j++) {
            res += '¥' + f(mySize, j, myDuration).toPrecision(6) + '\t';
            if (j === 5)
                res += '≤';
            res += j + '\n';
        }
        return res;
    }

    if (showYen.toString() === 'true' || reqTime.toString() === 'true') {
        var torrents, cells, seeders, leechers, size, sizeIndex, sizeRe, andRe, durationRe, torrentId, newCell, header, newHeader, lastHeaderCell, sum = 0, seedingTime, duration, durMatch, yenCells, yenPerGb;

        function processTorrentTable(torrent_table, deselected, oldBox) {
            var torrents = torrent_table.querySelectorAll('.group_torrent');
            if (torrents.length <= 1) return;
            var values = [];
            for (var i = 0; i < torrents.length; i++) {
                var torrent = torrents[i];
                var text = torrent.children[0].children[1].textContent.replace(/^»\s*/i, '');
                if (text.indexOf('|') >= 0)
                    text = text.split('|');
                else
                    text = text.split('/');
                for (var j = 0; j < text.length; j++) {
                    var val = text[j].trim();
                    if (val !== '') {
                        if (values[j] === undefined)
                            values[j] = {};
                        if (values[j][val] === undefined)
                            values[j][val] = 0;
                        if (torrent.style.visibility !== 'collapse')
                            values[j][val] = 1;
                    }
                }
            }
            if (values.length > 0 || Object.keys(deselected).length > 0) {
                var box = document.createElement('div'), head = document.createElement('div'), body = document.createElement('div'), form = document.createElement('form'), myValues = {};
                for (j = 0; j < values.length; j++) {
                    for (var value in values[j]) {
                        if (myValues[value] === 1) continue;
                        else myValues[value] = 1;
                        if (values[j][value] === 1 || deselected[value] === 1) {
                            var label = document.createElement('label');
                            label.innerHTML += ' <input type="checkbox" ' + (deselected[value] === 1 ? '' : 'checked="checked"') + '> ' + value + ' ';
                            label.querySelector('input').value = value;
                            form.appendChild(label);
                        }
                    }
                    if (j < values.length - 1)
                        form.innerHTML += ' <br/> ';
                }
                form.addEventListener('change', function(e) {
                    var illegal = {};
                    var cbs = form.querySelectorAll('input[type="checkbox"]');
                    for (var j = 0; j < cbs.length; j++) {
                        var cb = cbs[j];
                        if (cb.checked != true)
                            illegal[cb.value] = 1;
                    }
                    for (var j = 0; j < torrents.length; j++) {
                        var torrent = torrents[j];
                        var text = torrent.children[0].children[1].textContent;
                        var ill = false;
                        for (var subText in illegal) {
                            if (text.indexOf(subText) >= 0) {
                                ill = true
                                break;
                            }
                        }
                        if (ill == true)
                            torrent.style.visibility = 'collapse';
                        else
                            torrent.style.visibility = 'visible';
                    }
                    processTorrentTable(torrent_table, illegal, box);
                });
                box.className = 'box';
                head.className = 'head colhead strong';
                body.className = 'body pad';
                body.style.display = 'none';
                body.appendChild(form);
                head.innerHTML = '<a href="#"><span class="triangle-right-md"><span class="stext">+/-</span></span> Filter </a>';
                var headClickEvent = function(e) {
                    if (e !== undefined) e.preventDefault();
                    if(body.style.display !== 'none') {
                        body.style.display = 'none';
                        head.querySelector('span').className = 'triangle-right-md';
                    } else {
                        body.style.display = 'block';
                        head.querySelector('span').className = 'triangle-down-md';
                    }
                }
                head.addEventListener('click', headClickEvent );
                box.appendChild(head);
                box.appendChild(body);
                if (oldBox !== null) {
                    torrent_table.parentNode.replaceChild(box, oldBox);
                    headClickEvent();
                }
                else
                    torrent_table.parentNode.insertBefore(box, torrent_table);
            }
        }

        if (GM_getValue('ABTorrentsFilter', 'false') === 'true' && document.getElementById('collage') == null) {
            var torrent_tables = document.querySelectorAll('.torrent_table');
            for (var i = 0; i < torrent_tables.length; i++) {
                var torrent_table = torrent_tables[i];
                processTorrentTable(torrent_table, {}, null);
            }
        }

        torrents = document.querySelectorAll('tr.torrent,tr.group_torrent');
        sizeRe = /^([\d\.,]+)\s([A-Z]?)B$/i;
        andRe = /(and|\s|,)/ig;
        durationRe = /^(?:(\d+)years?)?(?:(\d+)months?)?(?:(\d+)weeks?)?(?:(\d+)days?)?(?:(\d+)hours?)?(?:(\d+)minutes?)?(?:(\d+)seconds?)?$/i;

        fa = 2 - 1 / (1 + Math.exp(5 - ((new Date()).getTime() - parseInt(GM_getValue('creation', '0'), 10)) / 1728000000)); // milliseconds per 20 days
        if (isNaN(fa))
            fa = 1;

        yenCells = [];

        for (var i = 0; i < torrents.length; i++) {
            cells = torrents[i].cells;
            size = null;
            if (cells.length === 5) {
                seeders = parseInt(cells[3].textContent, 10);
                leechers = parseInt(cells[4].textContent, 10);
                size = cells[1].textContent.match(sizeRe);
                sizeIndex = 1;
            }
            else if (cells.length === 9) {
                seeders = parseInt(cells[6].textContent, 10);
                leechers = parseInt(cells[7].textContent, 10);
                size = cells[4].textContent.match(sizeRe);
                sizeIndex = 4
            }
            if (size === null || isNaN(seeders) || isNaN(leechers))
                continue;

            if (reqTime.toString() === 'true') {
                size = parseFloat(size[1].replace(/,/g, '')) * unitPrefix(size[2]);
                seedingTime = Math.max(0, size - 10) * 5 + 72;
                cells[sizeIndex].title = 'You need to seed this torrent for at least\n' + dur2string(seedingTime) + '\nor it will become a hit and run!';

                torrentId = torrents[i].querySelector('a[title="Download"]');
                if (torrentId != null) {
                    torrentId = torrentId.href.match(/id=(\d+)/i);
                    if (torrentId != null) {
                        torrentId = document.getElementById('torrent_' + torrentId[1]);
                        if (torrentId != null) {
                            torrentId = torrentId.querySelector('blockquote');
                            if (torrentId != null) {
                                torrentId.appendChild(document.createElement('br'));
                                torrentId.innerHTML += 'You need to seed this torrent for at least <span class="r01">' + dur2string(seedingTime) + '</span> or it will become a hit and run!';
                            }
                        }
                    }
                }
            }

            if (showYen.toString() === 'true') {
                var timeFrameStr = "hour";
                if (timeFrame === 24) timeFrameStr = "day";
                else if (timeFrame === 168) timeFrameStr = "week";
                duration = 0;
                if (document.URL.indexOf('type=seeding') >= 0) {
                    durMatch = cells[3].textContent.replace(andRe, '').match(durationRe);
                    if (durMatch != null) {
                        durMatch = (function() {
                            var _i, _len, _results, _num;
                            _results = [];
                            for (_i = 1, _len = durMatch.length; _i < _len; _i++) {
                                _num = durMatch[_i];
                                if (_num != null) {
                                    if (isNaN(parseInt(_num, 10)))
                                        _results.push(0);
                                    else
                                        _results.push(parseInt(_num, 10));
                                } else {
                                    _results.push(0);
                                }
                            }
                            return _results;
                        })();
                        duration = 24 * (durMatch[0] * 365.25 + durMatch[1] * 30.4375 + durMatch[2] * 7 + durMatch[3]) + durMatch[4] + durMatch[5] / 60 + durMatch[6] / 3600;
                    }
                }
                sum += f(size, seeders, duration);

                newCell = document.createElement('td');
                newCell.textContent = '¥' + yen2string(f(size, seeders, duration));
                newCell.title = '¥' + (timeFrame * fs(size)).toPrecision(6)                      + '  \tbase for size';
                if ((100 * (fa           - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n+' + (100 * (fa           - 1)).toFixed(1) + '% \tfor your account\'s age';
                if ((100 * (fu(duration) - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n+' + (100 * (fu(duration) - 1)).toFixed(1) + '% \tfor seeding time';
                if ((100 * (ft(seeders)  - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n'  + (100 * (ft(seeders)  - 1)).toFixed(1) + '% \tfor number of seeders';
                newCell.title += '\n\n¥ per ' + timeFrameStr + ' \t#seeders\n' + createTitle(seeders - 1, seeders + leechers + 1, size, duration);
                torrents[i].appendChild(newCell);
                header = torrents[i].parentNode.firstChild;
                if (countCols(header) + 1 === countCols(torrents[i])) {
                    newHeader = header.children[1].cloneNode(true);
                    newHeader.title = '¥ per ' + timeFrameStr;
                    if (newHeader.textContent !== '') {
                        if (newHeader.children.length > 0)
                            newHeader.children[0].textContent = '¥/' + timeFrameStr.charAt(0);
                        else
                            newHeader.textContent = '¥/' + timeFrameStr.charAt(0);
                    }
                    header.appendChild(newHeader);
                }
                yenCells.push([newCell, yen2string(f(size, seeders, duration)), yen2string(f(size, seeders, duration) / size, true)]);
            }
        }

        yenPerGb = 0;

        function toggleYenPerGb() {
            yenPerGb = 1 - yenPerGb;
            for (var i = 0; i < yenCells.length; i++) {
                var elem = yenCells[i];
                elem[0].textContent = '¥' + elem[yenPerGb + 1];
            }
        }

        for (var i = 0; i < yenCells.length; i++) {
            var elem = yenCells[i];
            elem[0].addEventListener('click', toggleYenPerGb);
        }

        if (showYen.toString() === 'true') {
            console.log('Sum of Yen per ' + timeFrameStr + ' for all torrents on this site:', sum);

            torrents = document.querySelectorAll('tr.edition_info,tr.pad,tr[id^="group_"]');
            for (var i = 0; i < torrents.length; i++) {
                lastHeaderCell = torrents[i].cells[torrents[i].cells.length - 1];
                lastHeaderCell.colSpan += 1;
            }
        }

        if (document.URL.indexOf('user.php') >= 0 && document.URL.indexOf('preview=true') >= 0) {
            var _temp = null;
            try {
                _temp = document.getElementById('first_wrapper_outer').getElementsByClassName('userstatsleft')[0].getElementsByTagName('span')[0].title;
            } catch (e) {}
            if (_temp != null)
                GM_setValue('creation', Date.parse(_temp));
        }
    }

}).call(this);
