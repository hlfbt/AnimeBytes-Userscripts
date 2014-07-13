// ==UserScript==
// @name        Enhanced Torrent View
// @namespace   Megure@AnimeBytes.tv
// @description Shows how much yen you would receive if you seeded torrents; shows required seeding time
// @include     http*://animebytes.tv*
// @version     0.8
// @grant       GM_getValue
// @grant       GM_setValue
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

(function() {
    var showYen = GM_getValue('ABTorrentsShowYen', 'true'), // true / false: activate / deactivate display of yen production per hour
        reqTime = GM_getValue('ABTorrentsReqTime', 'true'), // true / false: activate / deactivate display of required seeding time
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

    function fu (myDuration) {
        return Math.pow(2, duration / (24 * 365.25));
    }

    function fs (mySize) {
        return Math.max(0.1, Math.sqrt(mySize)) / 4;
    }

    function ft (mySeeders) {
        return Math.min(1.0, 3 / Math.sqrt(mySeeders + 4));
    }

    function f (mySize, mySeeders, myDuration) {
        return fs(mySize) * fu(myDuration) * ft(mySeeders) * fa;
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
        var torrents, cells, seeders, leechers, size, sizeIndex, sizeRe, andRe, durationRe, torrentId, newCell, header, newHeader, lastHeaderCell, sum = 0, seedingTime, duration;
        
        torrents = document.querySelectorAll('tr.torrent,tr.group_torrent');
        sizeRe = /^([\d\.,]+)\s([A-Z]?)B$/i;
        andRe = /(and|\s|,)/ig;
        durationRe = /^(?:(\d+)years?)?(?:(\d+)months?)?(?:(\d+)weeks?)?(?:(\d+)days?)?(?:(\d+)hours?)?(?:(\d+)minutes?)?(?:(\d+)seconds?)?$/i;
        
        fa = 2 - 1 / (1 + Math.exp(5 - ((new Date()).getTime() - GM_getValue('creation', 0)) / 1728000000)); // milliseconds per 20 days

        for (var i = 0; i < torrents.length; i++) {
            cells = torrents[i].getElementsByTagName('td');
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
                duration = 0;
                if (document.URL.indexOf('type=seeding') >= 0) {
                    duration = cells[3].textContent.replace(andRe, '').match(durationRe);
                    if (duration != null) {
                        duration = (function() {
                            var _i, _len, _results, _num;
                            _results = [];
                            for (_i = 1, _len = duration.length; _i < _len; _i++) {
                                _num = duration[_i];
                                if (_num != null) {
                                    _results.push(parseInt(_num, 10));
                                } else {
                                    _results.push(0);
                                }
                            }
                            return _results;
                        })();
                        duration = 24 * (duration[0] * 365.25 + duration[1] * 30.4375 + duration[2] * 7 + duration[3]) + duration[4] + duration[5] / 60 + duration[6] / 3600;
                    }
                }
                sum += f(size, seeders, duration);

                newCell = document.createElement('td');
                newCell.textContent = '¥' + f(size, seeders, duration).toFixed(2);
                newCell.title = '¥' + fs(size).toPrecision(6)                      + '  \tbase for size';
                if ((100 * (fa           - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n+' + (100 * (fa           - 1)).toFixed(1) + '% \tfor your account\'s age';
                if ((100 * (fu(duration) - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n+' + (100 * (fu(duration) - 1)).toFixed(1) + '% \tfor seeding time';
                if ((100 * (ft(seeders)  - 1)).toFixed(1) !== '0.0')
                    newCell.title += '\n'  + (100 * (ft(seeders)  - 1)).toFixed(1) + '% \tfor number of seeders';
                newCell.title += '\n\n¥ per hour \t#seeders\n' + createTitle(seeders - 1, seeders + leechers + 1, size, duration);
                torrents[i].appendChild(newCell);
                header = torrents[i].parentNode.firstChild;
                if (countCols(header) + 1 === countCols(torrents[i])) {
                    newHeader = header.children[1].cloneNode(true);
                    newHeader.title = '¥ per hour';
                    if (newHeader.textContent !== '') {
                        if (newHeader.children.length > 0)
                            newHeader.children[0].textContent = '¥/h';
                        else
                            newHeader.textContent = '¥/h';
                    }
                    header.appendChild(newHeader);
                }
            }
        }

        if (showYen.toString() === 'true') {
            var myColSpan;
            console.log("Sum of Yen for all torrents on this site:", sum);

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
