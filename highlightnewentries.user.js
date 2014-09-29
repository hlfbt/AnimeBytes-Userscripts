// ==UserScript==
// @name              new torrents
// @namespace   animebytes.tv
// @version           1
// @include           https://*animebytes.tv/torrents.php*
// @grant               GM_getValue
// @grant               GM_setValue
// @require           http://code.jquery.com/jquery-2.1.0.min.js
// ==/UserScript==


(function($){

    var time = $.now();

    function mark_as_seen(gid){
        
        $("#"+gid).find(".torrent").each(function(i){
            var tid = $(this).attr("id");
            GM_setValue("torrent."+tid+".seen", true);
        });
        $("#"+gid).find(".new").hide();    
    }

    function mark_as_new(gid, tid){
        if (!$("#"+gid).find(".new").length)
        {
            var span = $("<span>").text("NEW")
                                                     .attr("class", "cat new")
                                                     .css({
                                                         "color": "red",
                                                          "background-color": "#f6f6f6",
                                                          "border-style": "solid",
                                                          "border-width": "1px",
                                                          "border-color": "#0F0F0F",
                                                          "margin-top": "12px",
                                                      })
                                                      .click(function(event){
                                                          mark_as_seen(gid);
                                                      })
                                                      .appendTo("#"+gid+" .group_img");
        }
    }

    function main(){
        $(".group_cont" ).each(function(i) {
            var gid = $(this).attr("id");
            $( "#" + gid).find(".torrent").each(function(i){
                    var tid = $(this).attr("id");
                    var seen = GM_getValue("torrent."+tid+".seen", "");
                    if (!seen)    mark_as_new(gid, tid);
            });
        });

        $("<div>").attr("id", "clear_cont").css({
                                        "margin-top":"25px",
                                        "margin-bottom":"10px",
                                        "text-align":"center",
                                    }).appendTo("#browse_nav_bottom");
        $("<span>").css({
                                        "background-color": "#f6f6f6",
                                        "border-style": "solid",
                                        "border-width": "1px",
                                        "border-color": "#0F0F0F",
                                        "padding": "3px 8px",
                                        "font-size": "11pt",
                                        })
                    .text("Clear NEW tag")
            .click(function(event){
                $(".group_cont" ).each(function(i) {
                    var gid = $(this).attr("id");
                    mark_as_seen(gid);
                });
            }).appendTo("#clear_cont");
    }

    $(document).ready(main);
})(jQuery);
