// ==UserScript==
// @name          AnimeBytes Ignore
// @description   Hide posts made by ignored users on AnimeBytes
// @author        rakiru
// @include       https://animebytes.tv/forums.php?*
// @version       1.1
// @updateURL     https://raw.github.com/rakiru/AnimeBytes-Userscripts/master/animebytes-ignore.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js
// @icon          https://animebytes.tv/favicon.ico
// ==/UserScript==

///////////////////////////////
// CONSTANTS AND GLOBAL VARS //
///////////////////////////////

const USER_ID_REGEX = /user_(\d+)/;
const SLIDE_SPEED = 300;
const IGNORE_BUTTON_CLASS = "ignore-user-derpherpuniqueclass";
const TOGGLE_BUTTON_CLASS = "toggle-post-derpherpuniqueclass";

//////////////////////
// GLOBAL FUNCTIONS //
//////////////////////

function isIgnored(userID) {
    return GM_getValue(userID) === true;
}

function ignore(userID) {
    GM_setValue(userID, true);
}

function unignore(userID) {
    GM_deleteValue(userID);
}

function addButton(node) {
    //Add button to toggle post contents
    var button = $('<a href="#" class="'+TOGGLE_BUTTON_CLASS+'" style="float:right;margin-right:5px;" title="Toggle post">Toggle post</a>').insertAfter(node.find(".post_id"));
    button.click(function(event) {
        togglePost(node);
        event.preventDefault();
    });
}

function hidePost(node, show) {
    show = (typeof show !== 'undefined' ? show : false);
    node.find(".author_info, .post_body").toggle(show);
    //Pretty much every style on this thing is !important, so hide does fuck all (unless you can force !important on that)
    node.find(".post_controls").css("display", (show ? "" : "none !important"));
}

function togglePost(node, show) {
    var postControls = node.find(".post_controls");
    if (show === undefined) {
        node.find(".author_info, .post_body").slideToggle(SLIDE_SPEED);
        //Set show to the right thing so we can use it later
        show = postControls.css("display") == "none";
    } else if (show) {
        node.find(".author_info, .post_body").slideDown(SLIDE_SPEED);
    } else {
        node.find(".author_info, .post_body").slideUp(SLIDE_SPEED);
    }
    //Pretty much every style on this thing is !important, so slideToggle does fuck all (unless you can force !important on that)
    if (show) {
        postControls.css("display", "");
    } else {
        postControls.css("display", "none !important");
    }
}

function addIgnoreButton(userID, username, ignored, node) {
    //Find add friend button so we can add our button next to it (thanks to Eruonen's forum improvements script for this)
    var userInfo = $(node).find('span.com-pm').parent().parent();
    userInfo.find("." + IGNORE_BUTTON_CLASS).remove();
    //I'm lazy, so I'm using an existing icon for this (the delete one)
    var button;
    if (ignored) {
        button = $('<a href="#" class="'+IGNORE_BUTTON_CLASS+'"><span class="com-delete" title="Unignore '+username+'"/><span class="stext">Unignore</span></a>').appendTo(userInfo);
    } else {
        button = $('<a href="#" class="'+IGNORE_BUTTON_CLASS+'"><span class="com-delete" title="Ignore '+username+'"/><span class="stext">Ignore</span></a>').appendTo(userInfo);
    }
    button.click(function(event) {
        if (ignored) {
            unignore(userID);
            //Show posts, remove toggle button, change unignore buttons to ignore
            $(".post_block").each(function() {
                if (USER_ID_REGEX.exec(this.className)[1] == userID) {
                    var post = $(this);
                    togglePost(post, true);
                    post.find("." + TOGGLE_BUTTON_CLASS).remove();
                    addIgnoreButton(userID, username, !ignored, this);
                }
            });
        } else {
            ignore(userID);
            //Hide posts by this user, add toggle button, change ignore buttons to unignore
            $(".post_block").each(function() {
                if (USER_ID_REGEX.exec(this.className)[1] == userID) {
                    var post = $(this);
                    togglePost(post, false);
                    addButton(post);
                    addIgnoreButton(userID, username, !ignored, this);
                }
            });
        }
        event.preventDefault();
    });
}

/////////////////
// MAIN SCRIPT //
/////////////////

//Loop through every post
$(".post_block").each(function() {
    //Grab user info
    var userID = USER_ID_REGEX.exec(this.className)[1];
    var username = $(this).find('.num_author a:first').text();
    var ignored = isIgnored(userID);

    //Hide post if by ignored user
    if (ignored) {
        var post = $(this);
        hidePost(post);
        addButton(post);
    }

    //Add (un)ignore button
    addIgnoreButton(userID, username, ignored, this);
});