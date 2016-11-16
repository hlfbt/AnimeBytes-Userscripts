// ==UserScript==
// @name         Total seeding size
// @version      1.3
// @description  Displays the total seeding size of a user
// @author       Amethyste, Potatoe
// @match        https://animebytes.tv/user.php?id=*
// @updateUrl    https://raw.github.com/tubersan/AnimeBytes-Userscripts/master/Total_seeding_size.user.js
// @grant        none
// ==/UserScript==

function バイト(大きさ,フォーマット)
{
    switch(フォーマット)							//バイトへの変換
    {
        case "KB":
            return 大きさ *1024;
        case "MB":
            return 大きさ *1024 *1024;
        case "GB":
            return 大きさ *1024 *1024 *1024;
        case "TB":
            return 大きさ *1024 *1024 *1024 *1024;
    }

}

function だれでもみな(バイト単位のサイズ)
{

    var 私 = -1;
    var ユニット = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        バイト単位のサイズ = バイト単位のサイズ / 1024;					//人間の読書変換
        私++;
    } while (バイト単位のサイズ > 1024);

    return Math.max(バイト単位のサイズ, 0.0).toFixed(1) + ユニット[私];
}

var 私 = 1;
var ページ = 1;
var url = $(".thin h2:first a").attr("href");
var uid = url.replace(/[^0-9]/g, '');
url = '&userid=*&type=seeding&order_by=time&order_way=DESC';
url = url.replace(/[\*]/g, uid);
$("#extra6").after('<div id="torrent_table" style="display:none"></div>');
$('dt:contains("Average Seedtime:")').next().after('<dt>Total seed size:</dt><dd id="seedsize">'+"Calculating..."+'</dd>');
var x = $('dt:contains("Seeding:")').next();
if (x.text()=="Hidden")
{
    $("#seedsize").html("<i>Hidden</i>");
}
getページ();

function getページ()
{
    $.get('https://animebytes.tv/alltorrents.php?page=1'+url, function(data){
        ページ = $(data).find(".page-link:last").text();
        ページ = (ページ) ? ページ : 1;
        if (ページ > 10) {
            $("#seedsize").html(ページ + " transfer history pages. <a id='seedstarter' href=''>Click here to calculate anyway</a> (<b>not</b> advised)");
            $("#seedstarter").click(function () {
                $("#seedsize").text("Calculating...");
                get一覧表();
            });
        } else {
            get一覧表();
        }
    });
}

function get一覧表(){
    $.get('https://animebytes.tv/alltorrents.php?page='+私+url, function(data){ 
        var torrents = $(data).find("#torrent_table tr:not('.colhead')");
        torrents.appendTo("#torrent_table");
        $("#seedsize").text("Calculating... (" + 私 + "/" + ページ + ")");
        if(私 == ページ || torrents.length === 0)
        {
            重要(); 							// 嫌らしい asynchronous shit
        } else {
            私++;
            //if (私 % 5 === 0) {
            //    $("#seedsize").text("Cooldown... (" + 私 + "/" + ページ + ")");
            //    window.setTimeout(get一覧表, 3e3);
            //} else {
            //    get一覧表();
            //}
            window.setTimeout(get一覧表, 1e3);
        }
    });
}

function 重要(){
    var 合計バイト = 0;
    var 一覧表 = $("#torrent_table tr");
    一覧表.children("td:nth-child(5)").each(function(){
        var データ = $(this).html();
        var フォーマット = データ.replace(/[^A-Z]/g, '');
        var 大きさ = データ.replace(/[^0-9\.]/g, '');
        合計バイト += バイト(大きさ,フォーマット);
    });
    var 返信 = だれでもみな(合計バイト);
    $("#seedsize").text(返信);
}
