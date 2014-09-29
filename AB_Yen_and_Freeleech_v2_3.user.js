// ==UserScript==
// @name        AB Yen Per X + Freeleech Pool
// @author      NSC
// @namespace   https://animebytes.tv/*
// @description Calculates Yen per x & displays Freeleech Pool data in top navbar
// @include     https://animebytes.tv/*
// @version     2.3
// @grant       none
// @icon https://i.imgur.com/vzoAL4W.png
// ==/UserScript==

//Freeleech Pool
/*Execute this jizz first 'cause trying to do the yen per x
when not on the profile page will make the script think
'lol wtf are you doing, I'm not even on that page' and crash.*/
$.get("https://animebytes.tv/konbini.php?action=pool", function(flp_page) { 
    flp_str = flp_page;
    var flp = flp_str.substring(flp_str.lastIndexOf("have ")+5,flp_str.lastIndexOf(" yen in our"));
  
    //console.log(flp)
    
    var sep_flp = flp.indexOf(" ");
    var cur_flp = flp.substr(0, sep_flp);
    var need_flp = flp.substr(sep_flp + 3);
    
    //console.log(cur_flp);
    //console.log(need_flp);
    
    str_c_flp = cur_flp;
    str_n_flp = need_flp;
  
    cur_flp = parseFloat(cur_flp.replace(/,/g, ''));
    need_flp = parseFloat(need_flp.replace(/,/g, ''));
    
    //console.log(((cur_flp / need_flp).toFixed(4)*100) + "%")
    flp_perc = ((cur_flp / need_flp)*100);
    flp_perc = flp_perc.toFixed(2) + "%";
    
    nav = document.getElementsByClassName('userinfonav')[0].children[4];
    //console.log(nav)
    
    var don = flp_str.substring(flp_str.lastIndexOf("donated ")+8,flp_str.lastIndexOf(" yen to"));
    //console.log(don);
    don_int = parseFloat(don.replace(/,/g, ''));
    //console.log(don_int);

    //removed - I believe this is total, across multiple pools.
    //don_perc = ((don_int / cur_flp)*100);
    //console.log(don_perc);
    //don_perc = don_perc.toFixed(2) + "%";

    //##    COMMENT/UNCOMMENT BELOW
    //##    IF YOU PREFER % OR      
    //##    FULL NOTATION

    //Percentage
    nav.insertAdjacentHTML('afterend', '<li><a title="' + str_c_flp + ' / ' + str_n_flp +'" href="https://animebytes.tv/konbini.php?action=pool">FL: ' + flp_perc + '</a></li>');
    
    //Full notation "x,xxx,xxx / xx,xxx,xxx"
    //nav.insertAdjacentHTML('afterend', '<li><a title="Freeleech Pool" href="https://animebytes.tv/konbini.php?action=pool"FL: >' + str_c_flp + "/" + str_n_flp + '</a></li>');

    //this shits out how much you've personally donated, and how much that is as a % of total donations
    leftdiv.insertAdjacentHTML( 'afterend', "<dt>You've Donated:</dt><dd>" + don + '</dd>');

    //this shits out the freeleech data string to your user page as well
    leftdiv.insertAdjacentHTML( 'afterend', '<dt>Freeleech Pool:</dt><dd>' + str_c_flp + ' (' + flp_perc + ')</dd>');
});

//Yen Per X
ypd = document.getElementsByClassName('wrappper_outer')[0].children[1].children[1].children[19].textContent;

ypdpos = document.getElementsByClassName('wrappper_outer')[0].children[1].children[1].children[19]

ypdpos.insertAdjacentHTML( 'afterend', '<dt>Yearly:</dt><dd>' + (ypd * 365).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
ypdpos.insertAdjacentHTML( 'afterend', '<dt>6 Months:</dt><dd>' + (ypd * 182).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
ypdpos.insertAdjacentHTML( 'afterend', '<dt>30 Days:</dt><dd>' + (ypd * 30).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
ypdpos.insertAdjacentHTML( 'afterend', '<dt>5 Days:</dt><dd>' + (ypd * 5).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );

ypdpos_top = document.getElementsByClassName('wrappper_outer')[0].children[1].children[1].children[18]
hourly_yen = ypd / 24
ypdpos_top.insertAdjacentHTML( 'beforebegin', '<dt>Yen per hour:</dt><dd>' + hourly_yen.toFixed(2) + '</dd>' );

cy = document.getElementsByClassName('userinfonav')[0].children[4].textContent

while(cy.charAt(0) === '¥'){
    cy = cy.substr(1);
}

leftdiv = document.getElementsByClassName('userprofile_list clearcont')[0].children[17]

cy = cy.replace (/,/g, "");
cy = parseInt(cy)

t_leftdiv = document.getElementsByClassName('userprofile_list clearcont')[0].children[17]

leftdiv.insertAdjacentHTML( 'afterend', '<dt>Yen Next Year:</dt><dd>' + (cy + (ypd * 365)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
leftdiv.insertAdjacentHTML( 'afterend', '<dt>Yen Next Month:</dt><dd>' + (cy + (ypd * 30)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
leftdiv.insertAdjacentHTML( 'afterend', '<dt>Yen Next Week:</dt><dd>' + (cy + (ypd * 5)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );
leftdiv.insertAdjacentHTML( 'afterend', '<dt>Current Yen:</dt><dd>' + (cy).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</dd>' );

//t_leftdiv.insertAdjacentHTML( 'afterend', '<div class="center strong"><h3>Projections</h3></div>' );