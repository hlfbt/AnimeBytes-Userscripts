// ==UserScript==
// @name        abwai
// @author      Lemma
// @updateURL	https://raw.github.com/olemma/abwai/master/abwai.user.js
// @description	This is a serious game... about seriously figuring out who some of these posters are.
// @include     *://animebytes.tv*
// @version     2.3
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// @require		https://raw.github.com/olemma/GM_config/master/gm_config.js
// @require		https://raw.github.com/olemma/abwai/master/gmsuper.user.js
// @resource	forumcodes https://raw.github.com/olemma/abwai/master/resources/forums.json
// @resource	gamestylesheet https://raw.github.com/olemma/abwai/master/resources/gamestyle.css
// @grant		GM_getResourceText
// @grant		GM_getValue
// @grant		GM_setValue
// @grant		GM_addStyle
// ==/UserScript==

///////////////NOTES////////////////////////
// -extra points for unlocking whole thread?
// -extra points for streak?
// -different difficulties
// -levehstein distance
// -points based on #unlocked in thread
// -using name in post??
// break all links to user profile in post?

/************************** dev notes
* -im a bad program.
* -function prefixes i.e. if u call a tv_ function in a fv_ context ur in a globe of pain:
*	tv_ works when viewing thread, 
*	fv_ works when viewing a single forum
*	hv_	works when viewing all forums
*/

//setup the external stylesheet
var gameStyleSheet = GM_getResourceText("gamestylesheet");
GM_addStyle(gameStyleSheet);


//js is so dumb...
if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    };
}

///////////////////////end copypasta///////////////////////////////////////

function ABPost(postID, obj){
    if(obj === undefined){
        this.attempts = 0;
        this.postID = postID;
        this.pStatus = 'imnew';
    }else{
        this.attempts = obj.attempts;
        this.postID = obj.postID;
        this.pStatus = obj.pStatus;
    }
}

ABPost.prototype = {
    
    /* Returns if the user was successful */
    update: function(pStatus){
        if(pStatus != 'surrender')
            this.attempts++;
        this.pStatus = pStatus;
        return (pStatus == 'solve');
    },
    
    fromJson: function(jsonObj){
        //hacky thing to copy over all data
        for(var prop in obj) this[prop] = obj[prop];
    },
    
    isVisible: function(){
        return (this.pStatus != 'fail');
    }
};//end ABPost.prototype

function ABThread(threadID, obj){
    
    if(obj === undefined){
        this.threadID = threadID;
        this.postAttempts = {};
        this.firstPostID = 0;
        this.postCount = 0;
        this.solved = 0;
        this.beat = false;
    }else{
        this.threadID = obj.threadID;
        this.firstPostID = obj.firstPostID;
        this.postCount = obj.postCount;
        this.beat = obj.beat;
        this.postAttempts = {};
        this.solved = obj.solved;
        
        for(var key in obj.postAttempts){
            this.postAttempts[key] = new ABPost(key, obj.postAttempts[key]);
        }
    }
}

ABThread.prototype = {
    /* guestimate the number of posts */
    tv_countPosts: function(){
        //#posts are 25 per page, plus avg on last or #pages on first page if that is only one.
        if($("div.pagenums").length != 0){
            this.postCount = $("a.page-link:last").text() * 25  - 12;
        }else{
            this.postCount = $("div.post_block").length;
        }
    },
    
    tv_updateFirstPost: function(){
        //get firstPostID when viewing a thread page.
        this.firstPostID = $("div.post_block:first").attr("id").slice(4);
        console.log('added new thread with first post ' + this.firstPostID);
    },
    
    updatePost: function(postID, pStatus){
        if (!(postID in this.postAttempts)){
            this.postAttempts[postID] = new ABPost(postID);
        }
        var success = this.postAttempts[postID].update(pStatus);
        if(success){
            this.solved++;
        }
    },
    
    isVisible: function(postID){
        if(postID in this.postAttempts){
            return this.postAttempts[postID].isVisible();
        }
        return false;
    },
    
    getPostAttempts: function(postID){
        if(postID in this.postAttempts){
            return this.postAttempts[postID].attempts;
        }
        return 0;
    },
    
    isFirstPostVisible: function(){
        if (this.firstPostID in this.postAttempts){
            return this.postAttempts[this.firstPostID].isVisible();
        }
        return false;
    }
}; //end ABThread.prototype

var chardialog = $('<div>', {
    style: 
    {
        position: 'absolute;top: 0px;left: 0px;height: 242px;width: 206px;margin: 10px 10px 10px 10px;',
    }
});

//////////////main game object//////////////////////
function ABGame(){
    this.anonName = '[abwai]';
    this.attempted = GM_SuperValue.get("attempted_posts", {});
    this.baseScore = 10;
    /** Get forum information from a resource **/
    
    //idk... about this(this(this(this)))...
    var base = this;
    
    //setup object hierarchy for difficulty levels
    //TODO refactor this so its not just chillin here
    
    //begin DifficultyLevel
    this.DifficultyLevel.prototype = {
        fv_anonymize: function(){
            
        },
        
        //TODO get player's points, maybe post count? idk
        isUnlocked: function(score){
            return (this.enabled && score >= this.scoreThreshold);
        },
        
        hv_anonymize: function(){
            
        },
        
        /* template, overwrite for each difficulty */
        tv_anonymizePostForDifficulty: function(context){
            ;
        },
        
        /* template, overwrite for each difficulty, should be the reverse of 
    		 * tv_anonymizePostForDifficulty
    		 */
        tv_unlockPostForDifficulty: function(context){
            
        },
        
        tv_unlockPost: function(postID){
            console.log("difficulty unlocking " + postID);
            //unlock the name
            $("#post" + postID + " span.num_author").show();
            
            //unlock quote-name
            $("#post" + postID + " div.post strong a").show();
            //unlock last-edit name
            $("#post" + postID + " span.last-edited a").show();       
            
            //unlock difficulty specific
            this.tv_unlockPostForDifficulty($("#post" + postID));
            
            //hide the game interface
            $("#post_board_" + postID).hide();
            
        },
        
        /* Anonymize all posts in a thread by hiding the name... and then doing difficulty-specific stuff */
        tv_anonymize: function(){
            var my_uid = $("#username_menu > a").attr("href").split("=")[1];
            var threadID = $("input[name='thread']").attr("value");
            var me = this;
            
            $("div.post_block").each(function(){
                var uid  = $(this).attr("class").split("user_")[1];
                var postID = $(this).find("span.post_id > a:first").text().slice(1);
                
                if(uid != my_uid && !base.isVisible(threadID, postID)){
                    //trash the name
                    $(this).find("span.num_author").hide();
                    //trash quote-name
                    $("#post" + postID + " div.post strong a").hide();
                    //trash last-edit name
                    $("#post" + postID + " span.last-edited a").hide();       
                    
                    /* anonymize based on actual difficulty */
                    me.tv_anonymizePostForDifficulty(this);
                    
                }
            });
            
        },
        
        toString: function(){
            return this.name + " (" + this.simpleName + ") [" + this.multiplier + "x]";
        }
    };
    
    
    //begin BeginnerDifficulty
    this.BeginnerDifficulty.prototype = new this.DifficultyLevel();
    this.BeginnerDifficulty.prototype.constructor = this.BeginnerDifficulty;
    
    this.BeginnerDifficulty.prototype.tv_anonymizePostForDifficulty = function(context){
        $(context).find("ul.user_fields").hide();
        $(context).find("li.center").hide();
    }
    
    this.BeginnerDifficulty.prototype.tv_unlockPostForDifficulty = function(context){
        $(context).find("ul.user_fields").show();
        $(context).find("li.center").show();
    }
    
    //begin NoviceDifficulty
    this.NoviceDifficulty.prototype = new this.DifficultyLevel();
    this.NoviceDifficulty.prototype.constructor = this.NoviceDifficulty;
    
    this.NoviceDifficulty.prototype.tv_anonymizePostForDifficulty = function(context){
        //play with only their sig if they have one :)
        $(context).find("ul.user_fields").hide();
        $(context).find("li.center").hide();
        
        var sig = $(context).find("div.signature");
        if(sig.length){
            $(context).find("li.avatar").hide();
        }else{
            sig.hide();
        }
    }
    
    this.NoviceDifficulty.prototype.tv_unlockPostForDifficulty = function(context){
        $(context).find("ul.user_fields").show();
        $(context).find("li.center").show();
        $(context).find("div.signature").show();
        $(context).find("li.avatar").show();
    }
    
    //begin IntermediateDifficulty
    this.IntermediateDifficulty.prototype = new this.DifficultyLevel();
    this.IntermediateDifficulty.prototype.constructor = this.IntermediateDifficulty;
    
    this.IntermediateDifficulty.prototype.tv_anonymizePostForDifficulty = function(context){
        $(context).find("div.signature").hide();
        $(context).find("li.avatar").hide();
        
    }
    
    this.IntermediateDifficulty.prototype.tv_unlockPostForDifficulty = function(context){
        $(context).find("div.signature").show();
        $(context).find("li.avatar").show();
        
    }
    
    //begin expertdifficulty
    this.ExpertDifficulty.prototype = new this.DifficultyLevel();
    this.ExpertDifficulty.prototype.constructor = this.ExpertDifficulty;
    
    this.ExpertDifficulty.prototype.tv_anonymizePostForDifficulty = function(context){
        $(context).find("div.author_info").hide();   
        $(context).find("div.signature").hide();
    }
    
    this.ExpertDifficulty.prototype.tv_unlockPostForDifficulty = function(context){
        //unlock whole author panel
        $(context).find("div.author_info").show();//unlock the signature
        $(context).find("div.signature").show();
        
    }
    
    //begin IDCDifficulty
    this.IdcDifficulty.prototype = new this.DifficultyLevel();
    this.IdcDifficulty.prototype.constructor = this.IdcDifficulty;
    
    this.IdcDifficulty.prototype.tv_anonymizePostForDifficulty = function(context){
        ;
    }
    
    this.IdcDifficulty.prototype.tv_unlockPostForDifficulty = function(context){
        ;
    }
    
    //build the list of difficulties
    var beginnerDifficulty = new this.BeginnerDifficulty();
    var expertDifficulty = new this.ExpertDifficulty();
    var intermediateDifficulty = new this.IntermediateDifficulty();
    var idcDifficulty = new this.IdcDifficulty();
    var noviceDifficulty = new this.NoviceDifficulty();
    
    this.difficulties = {};
    this.difficulties[beginnerDifficulty.simpleName] = beginnerDifficulty;
    this.difficulties[noviceDifficulty.simpleName] = noviceDifficulty;
    this.difficulties[intermediateDifficulty.simpleName] = intermediateDifficulty;
    this.difficulties[expertDifficulty.simpleName] = expertDifficulty;
    this.difficulties[idcDifficulty.simpleName] = idcDifficulty;
    
    
    
    //code to setup the settings picker
    function fetchForumFields(){
        var fields = {};
        var rawText = GM_getResourceText("forumcodes");
        var forumcodes = JSON.parse(rawText);
        
        for(var i = 0; i < forumcodes.length; i++){
            fields["enable_forum_" + forumcodes[i]["id"]] = 
                {
                    'label' : forumcodes[i]['name'],
                    'type' : 'checkbox',
                    'default' : false 
                };
        }
        return fields;
    }
    
    function on_settings_confirm_reset(){
        if(confirm("Are you sure you want to reset your score and history of beaten posts?")){
            base.resetGame();
            location.reload();
        }
        else{
            alert("...then stop messing around...");
        }
    }
    
    //fuck.... FUCK FUCK FUCK FUUUUCKKKKKKKKKKKKKKK FUCK FUCK FUCCCCCKKKK
    function on_settings_open(doc){
        console.log(base.getDifficulties());
        $.each(base.getDifficulties(), function(idx, difficulty){
            $('#gmc_settings_field_game_difficulty', doc).append(
                $('<option>', {
                    value: difficulty.simpleName,
                    html: difficulty.toString(),
                }).prop('disabled', !difficulty.isUnlocked(base.getScore()))
                .prop('selected', (difficulty.simpleName == base.getDifficulty()))
                
            );
        });	
    }
    
    this.gmc_settings = new GM_configStruct(
        {
            'id' : 'gmc_settings',
            'title': 'Game Settings',
            'fields':  $.extend(
                {
                    'resetbutton':
                    {
                        'label' : 'Reset Game',
                        'type' : 'button',
                        'click' : function(){on_settings_confirm_reset();}
                    },
                    
                    'game_difficulty':
                    {
                        'label' : 'Choose Difficulty',
                        'type' : 'select',
                        'options' : [],
                        'default': 'beginner'
                    }
                }, 
                fetchForumFields()
            ),
            'events': {
                'open' : function(doc) { on_settings_open(doc) },
                //this is called even if the window isnt open lol 'save' : function() { base.updateScoreBoard(); },
                'close': function() { location.reload(); }
            }
        });
    
    
    //TODO callback reload settings on save? maybe just let them refresh
    
    //begin actual game code things
    //wrap supervalue.get to turn the json objects into actual objects w/methods
    function fetchThreadAttempts(){
        var threadAttempts = {};
        var rawThreadAttempts = GM_SuperValue.get("attempted_threads", {});
        for(var key in rawThreadAttempts){
            threadAttempts[key] = new ABThread(key, rawThreadAttempts[key]);
        }
        return threadAttempts;
    }
    
    this.threadAttempts = fetchThreadAttempts();
    this.enabledForums = this.getEnabledForums();
}

ABGame.prototype = {
    
    /* yea.. nested polymorphism or ... whatever */
    DifficultyLevel: function(){
        this.multiplier = 1;
        this.name = '';
        this.simpleName = '';
        this.description = 'this game is cute!!';
        this.scoreThreshold = 0;
        this.enabled = true;
    },
    
    BeginnerDifficulty: function(){
        this.multiplier = 0.5;
        this.name = 'Forum Games';
        this.simpleName = 'beginner';
        this.description = 'this game is cute!!!';
        this.scoreThreshold = Number.NEGATIVE_INFINITY;
    },
    
    
    NoviceDifficulty: function(){
        this.multiplier = 1;
        this.name = 'Mild Discussion';
        this.simpleName = 'novice';
        this.description = "wow... 'av u been practicin'?";
        this.scoreThreshold = 5;
    },
    
    IntermediateDifficulty: function(){
        this.multiplier = 2;
        this.name = 'Anime';
        this.simpleName = 'intermediate';
        this.description = 'its too tough onee-san!!!';
        this.scoreThreshold = 50;
    },
    
    ExpertDifficulty: function(){
        this.multiplier = 5;
        this.name = 'Hentai';
        this.simpleName = 'expert';
        this.description = 'haha...ok ..well try this1!!!!';
        this.scoreThreshold = 100;
    },
    
    IdcDifficulty: function(){
        this.multiplier = 10;
        this.name = 'International Department of Concerns';
        this.simpleName = 'idc';
        this.description = 'good luck...buddy... :)):):)not';
        this.scoreThreshold = 500;
        this.enabled = false;
    },
    
    /** Get forum ids of all enabled forums 
     hacky thing to list all of these in GM_config code
     **/
    getEnabledForums: function(){
        var gmcFields = this.gmc_settings.fields;
        var enabledForums = [];
        for(var key in gmcFields){
            if(key.startsWith('enable_forum_') && gmcFields[key].value == true){
                enabledForums.push(key.split('forum_')[1]);
            }
        }
        return enabledForums;
    },
    
    
    /** Return true if we are hacking this forum **/
    tv_fv_checkThread: function(){
        var forumID = $("div[id^=forum_]").attr("id").split("_")[1];
        return (this.enabledForums.indexOf(forumID) >= 0);
    },
    
    /** Check if the first post from a given thread is visible */
    isFirstPostVisible: function(threadID){
        if(threadID in this.threadAttempts){
            return this.threadAttempts[threadID].isFirstPostVisible();
        }
        return false;
    },
    
    /** Hide thread creators/last posters
     * TODO: what about defeated threads/posts??
     * TODO: make it harder to cheat by hiding links to user profiles
     */
    fv_anonymize: function(){            
        var my_uid = $("#username_menu > a").attr("href").split("=")[1];
        //check if we are playing in this forum (coincidentally we can do this with tv_fv_checkThread)
        if(this.tv_fv_checkThread()){
            var me = this;
            /* Fix rows in idc forum view */
            $("table[width='100%']:eq(1) tr[class^='row']").each(function(){
                var threadID = (/threadid=(\d+)/i).exec($(this).find("strong > a").attr("href"))[1];
                console.log($(this).find("td:nth-child(5)"));
                var opUID = $(this).find("td:nth-child(5) a").attr("href").split("=")[1];
                
                console.log(opUID);
                //show thread author
                if(!(me.isFirstPostVisible(threadID) || opUID == my_uid )){
                    $(this).find("td:nth-child(5)").text(me.anonName);
                }
                
                
                //TODO: maybe unhide last poster if thread is beat?
                $(this).find("td:nth-child(3) a").text(me.anonName);
            });
        }
    },
    
    /** Hide last posters in top level forums page for forums you are playing the game in
    	TODO: make it harder to cheat by hiding links to user profiles
    */
    hv_anonymize: function(){
        var me = this;
        $("tr[class^='row']").each(function(){
            var forumID = $(this).find("h4.min_padding > a:first").attr("id").slice(1);
            if(me.enabledForums.indexOf(forumID) >= 0){
                $(this).find("td:nth-child(3) > div > a").text(me.anonName);
            }
        });
    },
    
    
    /** TODO use edit distance or something **/
    nameMatches: function(observed, truth){
        return observed.toLowerCase() == truth.toLowerCase();
    },
    
    /** Update attempts on a post, record how many times they have tried, and if
	 * they have solved it.
	 * pStatus should be in { 'surrender', 'fail', 'solve'}

	 * TODO: validate data.
	 */
    updateAttempt: function(threadID, postID, pStatus){
        if(!(threadID in this.threadAttempts)){
            this.threadAttempts[threadID] = new ABThread(threadID);
            this.threadAttempts[threadID].tv_updateFirstPost();
        }
        this.threadAttempts[threadID].updatePost(postID, pStatus);
        this.threadAttempts[threadID].tv_countPosts();
        GM_SuperValue.set("attempted_threads", this.threadAttempts);
        
        
        if(pStatus == 'solve'){
            GM_SuperValue.set("num_posts_beat", this.countPostsBeat() + 1);
        }
        if(pStatus != 'surrender'){
            GM_SuperValue.set("num_posts_attempted", this.countPostsAttempted() + 1);
        }
        console.log('new attempt!');
    },
    
    tv_on_giveUp: function(threadID, postID, uid){
        this.tv_unlockPost(postID);
        this.updateAttempt(threadID, postID, 'surrender');
    },
    
    /** Check if we have already solved a given post */
    isVisible: function(threadID, postID){
        if(threadID in this.threadAttempts){
            return this.threadAttempts[threadID].isVisible(postID);
        }
        return false;
    },
    
    getScore: function(){
        return parseFloat(GM_SuperValue.get("player_score", 0));
    },
    
    /* Get all difficulties
    */
    getDifficulties: function(){
        var opts = [];
        for (var simpleName in this.difficulties){
            var difficulty = this.difficulties[simpleName];
            opts.push(difficulty);
            
        }
        return opts;  	
    },
    
    /* get the current difficulty object */
    getDifficulty: function(){
        return this.difficulties[this.gmc_settings.get('game_difficulty')];
    },
    
    /* DANGEROUS!!!
     * set difficulty and refresh page to become new difficulty.
     */
    setDifficulty: function(difficulty){
        this.gmc_settings.set("game_difficulty", difficulty.simpleName);
        this.gmc_settings.save();
        //reset the fields ... this is moot because we are going to reload anyway
        console.log("Setting difficulty to :" + difficulty.simpleName);
        location.reload();
    },
    
    /** Gets the hardest difficulty you can play... or the only one**/
    getHardestDifficulty: function(score){
        var hardest = null;
        
        var base = this;
        function anyDifficulty(){
            for(var simpleName in base.difficulties){
                if (base.difficulties[simpleName].isUnlocked()){
                    return simpleName;
                }
            }
        }
        
        for (var simpleName in this.difficulties){
            var difficulty = this.difficulties[simpleName];
            if(difficulty.isUnlocked(score)){
                if (hardest == null){
                    hardest = difficulty;
                }else{
                    hardest = (difficulty.scoreThreshold > hardest.scoreThreshold) ? difficulty : hardest;
                }
            }
        }
        console.log('Hardest difficulty playable is ' + hardest.simpleName);
        return (hardest == null) ? anyDifficulty() : hardest.simpleName;
    },
    
    /* Unlock a difficulty */
    unlockDifficulty: function(difficulty){
        //update the settings fields to reflect unlocked difficulty
        console.log(this.gmc_settings);
        alert('wow... ur better than i thuoght...  baka\n...well ok ill let u play on [' + difficulty.toString() + ']');
        console.log('Difficulty unlocked: ' + difficulty.simpleName);
    },
    
    setScore: function(newScore){
        var oldScore = this.getScore();
        GM_SuperValue.set("player_score", newScore);
        
        console.log("setting score from " + oldScore + " to " + newScore);
        for(var key in this.difficulties){
            var difficulty = this.difficulties[key]; 
            if( !difficulty.isUnlocked(oldScore) && difficulty.isUnlocked(newScore) ){
                this.unlockDifficulty(difficulty);
                return;
            }
        }
        
        if(!(this.getDifficulty().isUnlocked(newScore))){
            var hardest = this.getHardestDifficulty(newScore);
            alert('heh...ur p.bad... ull prolly kill urself if ur score is neg\nso ima put u back on [' + hardest +']');
            this.setDifficulty(hardest);
        }
    },
    
    /* Get the # of attempts for a given post */
    getPostAttempts: function(threadID, postID){
        if(!(threadID in this.threadAttempts)){
            return 0;
        }else{
            return parseFloat(this.threadAttempts[threadID].getPostAttempts(postID));
        }
    },
    
    /* Get the value of completing a given post */
    getPostValue: function(threadID, postID){
        var attempts = this.getPostAttempts(threadID, postID);
        var score = ((this.baseScore * this.getDifficulty().multiplier) / (this.getPostAttempts(threadID, postID) + 1));
        return score;
    },
    
    scoreUp: function(threadID, postID){
        var newScore = this.getScore() + this.getPostValue(threadID, postID);
        alert(":) alright...you got one\n...but you can never win\nscore: " + newScore);
        this.setScore(newScore);
        console.log('score++');
    },
    
    scoreDown: function(threadID, postID){
        var newScore = this.getScore() - (this.getPostValue(threadID, postID)/4.0); 
        alert(':((((((((((((((((((\n...nice try dork\nscore: ' + newScore);
        this.setScore(newScore);
        console.log('score--');
    },
    
    /** Reset the game... player's score and attempted threads/posts **/
    resetGame: function(){
        GM_SuperValue.set("player_score", 0);
        this.threadAttempts = {};
        GM_SuperValue.set("attempted_threads", {});
        GM_SuperValue.set("num_posts_beat", 0);
        GM_SuperValue.set("num_posts_attempted", 0);
    },
    
    /** Updates post stats when in a thread **/
    tv_updatePostStats: function(threadID, postID){   	
        //update post worth and attempts
        $("#post_worth_" + postID).text(this.getPostValue(threadID, postID).toFixed(1));
        $("#post_attempts_" + postID).text(this.getPostAttempts(threadID, postID));                                  
        
    },
    
    tv_on_guess: function(threadID, postID, uid, uname){
        
        console.log('Guess for ' + uid + ',' + uname);
        var guess = $('#post_guess_' + postID).val();
        
        
        var goodGuess = this.nameMatches(guess, uname);
        if(goodGuess){
            this.scoreUp(threadID, postID);
            this.tv_unlockPost(postID);
        }else{
            this.scoreDown(threadID, postID);
        }
        this.updateAttempt(threadID, postID, (goodGuess ? 'solve' : 'fail'));
        this.tv_updatePostStats(threadID, postID);
        this.updateScoreBoard();
    },
    
    /**
     * Setup the per post controls for the game, where the avatar used to be!
     */
    tv_setupGame: function(){
        var my_uid = $("#username_menu > a").attr("href").split("=")[1];
        var threadID = $("input[name='thread']").attr("value");
        var me = this; //is this a good idea?
        
        //add the stuff for the game to each block
        $("div.post_block").each(function(){
            var uid  = $(this).attr("class").split("user_")[1];
            //get postID, discarding leading #
            var postID = $(this).find("span.post_id > a:first").text().slice(1);
            
            if(uid != my_uid && !me.isVisible(threadID, postID)){
                var uname = $(this).find("span.num_author > a:first").text();
                
                var postboard = $('<span>', {
                    class: 'post_board',
                    id: 'post_board_' + postID
                });
                
                
                var wspan = $('<span>', {
                    class: 'post_iface_item',
                    title: 'if u get it right...maybe ill give u this many points'
                });
                wspan.append('W: ');
                wspan.append($('<span>',{
                    id: "post_worth_" + postID,
                }));
                postboard.append(wspan);
                
                var aspan = $('<span>',{
                    class: 'post_iface_item',
                    title: "uve already tried this many times?!?!"
                });
                
                aspan.append('A: ');
                aspan.append($('<span>',{
                    id: "post_attempts_" + postID,
                }));
                postboard.append(aspan);
                
                postboard.append($('<input>',{
                    id: 'post_guess_' + postID,
                    class: "post_iface_item",
                    type: "text",
                    placeholder: 'who...am...i??',
                    title: "...u should put who u think it is here... idc about caps"
                }));
                
                postboard.append($('<button>',{
                    text: 'Guess',
                    class: 'post_iface_item',
                    id: 'post_guess_button_' + postID,
                    title: 'press me and see if u get it right ... i doubt it!!!',
                    click: function(){me.tv_on_guess(threadID, postID, uid, uname);}
                }));
                
                postboard.append($('<button>',{
                    class: 'post_iface_item',
                    id: 'post_surrender_button_' + postID,
                    text: 'Surrender',
                    title: 'awww...welll ill show u this one for free...but thats the last time!!',
                    click: function(){me.tv_on_giveUp(threadID, postID, uid)}
                }));
                
                
                $(postboard).keypress(function (e) {
                    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                        if($(postboard).find('#post_guess_' + postID).val()){
                            $(postboard).find('#post_guess_button_' + postID).click();
                            return false;
                        }
                    } else {
                        return true;
                    }
                });
                
                $(this).find("span.num_author").before(postboard);
                
                me.tv_updatePostStats(threadID, postID);
            }
        });
    },
    
    tv_anonymize: function(){
        this.getDifficulty().tv_anonymize();
    },
    
    tv_unlockPost: function(postID){
        this.getDifficulty().tv_unlockPost(postID);
    },
    
    countForumsActive: function(){
        return this.enabledForums.length;
    },
    
    countPostsBeat: function(){
        return GM_SuperValue.get("num_posts_beat", 0);
    },
    
    countPostsAttempted: function(){
        return GM_SuperValue.get("num_posts_attempted", 0);
    },
    
    /* Update the scoreboard in the top with actual values */
    updateScoreBoard: function(){
        $('#game_sb_score').text(this.getScore().toFixed(1));
        $('#game_sb_posts_attempted').text(this.countPostsAttempted());
        $('#game_sb_posts_beat').text(this.countPostsBeat());
        $('#game_sb_forums').text(this.countForumsActive());
        $('#game_sb_diff').text(this.getDifficulty().simpleName);
    },
    
    //TODO there is a stupid bug?? GM_SuperValue.get if you pass 'true' as the default value, it always returns true...
    //also its test cases dont work... smh
    amPlaying: function(){
        return GM_SuperValue.get("game_enabled");
    },
    
    setPlaying: function(newStatus){
        GM_SuperValue.set("game_enabled", newStatus);
        location.reload();
    },
    
    /* Setup the scoreboard in the user menu*/
    setupScoreBoard: function(){
        var base = this;
        
        function on_setting_click(){
            base.gmc_settings.open();
        }
        
        function updatePlaying(){
            
            //hellooo... globals... check if we COULD be playing!!!!
            if((viewforumURLMatcher.test(window.location.href) || 
                viewthreadURLMatcher.test(window.location.href)) && 
               base.tv_fv_checkThread()
              ){
                if(!base.amPlaying()){
                    $('#game_sb_toggle').attr({
                        "src": '/static/common/smileys/drool.png',
                        "title": 'pls click and play!!!!!!... i know like.. 1 guy in this thread!!!'
                    });
                }else{
                    $('#game_sb_toggle').attr({
                        "src": '/static/common/smileys/kamina.png',
                        "title": 'no...dont click this!!! keep playing... ill be nice!'
                    });
                }
            }else{
                
                if(!base.amPlaying()){
                    $('#game_sb_toggle').attr({
                        "src": '/static/common/smileys/Crying.png',
                        "title": 'do..you even know wat ur doing?? turn me on!!'
                    });
                }else{
                    $('#game_sb_toggle').attr({
                        "src": '/static/common/smileys/wotwot.png',
                        "title": 'i saw a thread we could be playing in over there!! lets go!! dont turn me off!!'
                    });
                }
            }
        }
        
        function on_playing_click(){
            base.setPlaying(!base.amPlaying());
            updatePlaying();
        }
        
        //begin dangerousstylesheetspecifichacks
        $("#userinfo").css({"height" : "60px", "overflow": "hidden"});
        
        var ul_stats = $('<ul>', {class: 'userinfonav', id: 'game_sb'});
        
        ul_stats.append($('<li>',{
            html: $('<a>',{
                html: 'D: <span id=game_sb_diff>diff</span>',
                click: function(){on_setting_click();},
                title: 'if u need this tooltip...smh'
            })}));
        
        ul_stats.append($('<li>',{
            html: $('<a>',{
                html: 'F: <span id=game_sb_forums>0</span>',
                click: function(){on_setting_click();},
                title: 'hehe...u only dare play in this many forums?!!?'
            })}));
        
        ul_stats.append($('<li>',{
            html: $('<a>',{
                html: 'PB: <span id=game_sb_posts_beat>0</span>',
                click: function(){on_setting_click();},
                title: '...ok well at least you have guessed this many right...baka!!!'
            })}));
        
        ul_stats.append($('<li>',{
            html: $('<a>',{
                html: 'PA: <span id=game_sb_posts_attempted>0</span>',
                click: function(){on_setting_click();},
                title: '...wow...uve tried this many?!?!'
            })}));
        
        ul_stats.append($('<li>',{
            html: $('<a>',{
                html: 'S: <span id=game_sb_score>0</span>',
                click: function(){on_setting_click();},
                title: '...its your score baka!!!'
            })}));
        
        ul_stats.append($('<li>',{
            html: $('<img>',{
                id: 'game_sb_toggle',
                click: function(){on_playing_click();},
            })}));
        
        $("#userinfo").append(ul_stats);
        
        //setup the actual values
        this.updateScoreBoard();
        updatePlaying();
    }
};

//hook into website!!
var abgame = new ABGame();
//do work
var viewthreadURLMatcher = /.*action=viewthread.*$/i;
var viewforumURLMatcher = /.*action=viewforum.*$/i;
var viewTopForumURLMatcher = /.*forums\.php$/i;

abgame.setupScoreBoard();

console.log(window.location.href);
if(abgame.amPlaying()){
    if(viewforumURLMatcher.test(window.location.href)){
        abgame.fv_anonymize();
    }else if(viewthreadURLMatcher.test(window.location.href)){
        if(abgame.tv_fv_checkThread()){
            console.log("Playing in a thread!");
            abgame.tv_anonymize();
            abgame.tv_setupGame();
        }
    }else if(viewTopForumURLMatcher.test(window.location.href)){
        abgame.hv_anonymize();
    }
        }else{
            console.log("Gameplay disabled");
        }
