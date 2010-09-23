var checkSubscriptionCookie;
$(document).ready(function(){
    var SHOW_ITEM = '<li><a href="#toggle-{1}" class="label-minus">{0}</a></li>';
    var SUBSCRIPTION_MADE = '<section id="subscription-note" style="display:none" class="step">Note: You created a subscription recently. <a href="/{0}/">Go there now!</a></section>';

    var filter_list = function(e){
      var query = $("#search").val().toLowerCase();
      if (query == ""){
        $("#clear-search").hide();
        // Show all shows that have are not checked (i.e. are in the other box)
        $("#allshows-list li input:not(:checked)").parent().parent().show();
        return;
      }
      if (!$.browser.safari){
          //Safar has its own clear button in html5
        $("#clear-search").show();    
      }
      // Check all list items that are not checked
      $("#allshows-list li input:not(:checked)").each(function(i, el){
        if ($(el).parent().text().toLowerCase().indexOf(query) == -1){
          $(el).parent().parent().hide();
        } else {
          $(el).parent().parent().show();
        }
      });
    };

    var clear_search = function(e){
      if(e){e.preventDefault();}
      $("#search").val("");
      filter_list(e);
    };

    var toggle_show = function(e){
      var show_id;
      if(e){e.preventDefault();}
      var li = $(this);
      var list_id = li.parent().attr("id");
      if (list_id == "chosenshows-list"){
        // Deselect clicked show
        // Show ID is temp-stored in href-attribute after a -
        show_id = li.find("a").attr("href").split("-")[1];
        var real_li = $("#id_shows_"+show_id).attr("checked", "").parent().parent().show();
        li.remove();
        // No more shows selected:
        if ($("#chosenshows-list li").length == 0){
          $("#chosenshows-label").text("You haven't chosen any shows yet.");
          // If last error was "no shows", remind user
          if($(".select-shows .errorlist").text().indexOf("least") != -1){
              $(".select-shows .errorlist").show();
          }
        }
        // Hide too many shows error, when user complies
        if ($("#chosenshows-list li").length <= 90){
            if($(".select-shows .errorlist").text().indexOf("maximum") != -1){
                $(".select-shows .errorlist").hide();
            }        
        }
      } else {
        // Select clicked show
        var label = li.find("label").text();
        show_id = li.find("label").attr("for").split("_")[2];
        $("#chosenshows-list").append(SHOW_ITEM.replace(/\{0\}/,label).replace(/\{1\}/, show_id));
        li.hide();
        li.find("input").attr("checked", "checked");
        // Hide "no shows" error, if it was last error
        if($(".select-shows .errorlist").text().indexOf("least") != -1){
            $(".select-shows .errorlist").hide("fast");
        }
        // Remind user of his current too many shows error
        if ($("#chosenshows-list li").length > 90){
            if($(".select-shows .errorlist").text().indexOf("maximum") != -1){
                $(".select-shows .errorlist").show();
            }
        }
        $("#chosenshows-label").text("You have chosen these shows:");
        // Clear search if there are no shows visible and the search box is not empty
        if ($("#allshows-list li:visible").length == 0 && $("#search").val() != ""){
            clear_search();
        }
      }
    };

    checkSubscriptionCookie = function(){
      var subkey = readCookie("subkey");
      if (subkey != null){
          $("#content").prepend(SUBSCRIPTION_MADE.replace(/\{0\}/, subkey));
          $("#subscription-note").slideDown();
          $("#subscription-note").css("background-color", "#ffd");
          window.setTimeout(function(){
              $("#subscription-note").css("background-color", "#fff");
          },1000);
      }
    };

    var readCookie = function (name){
        /* Too lazy to use a jquery plugin for this */
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    };
    $("#chosenshows").show();
    $("#search-fields").show();
    $(".show-list li input").hide();
    // i can haz placeholder attribute?
    var i = document.createElement('input');
    if (!('placeholder' in i)){
    // No? Emulating...
        $(".default-value").focus(function(e){
          if($(this).val() == $(this).attr("placeholder")){
            $(this).removeClass("greyish");
            $(this).val("");
          }
        });
        $(".default-value").blur(function(e){
          if($(this).val() == ""){
            $(this).addClass("greyish");
            $(this).val($(this).attr("placeholder"));
          }    
        });
        $(".default-value").each(function(i, el){
            $(this).val($(this).attr("placeholder")).addClass("greyish");
        });
    }
    // Simple Div-Toggling with no-smart text replace
    // Show is missing? becomes Hide is missing? -> Interface Easter Egg
    $(".toggle").click(function(e){
    e.preventDefault();
    // Magic here: #some-anchor becomes id css-selector
    var label = $(this);
    var div = $(label.attr("href"));
    if (div.css("display") == "none"){
      label.text(label.text().replace(/Show/, "Hide"));
      div.show();
    } else {
      label.text(label.text().replace(/Hide/, "Show"));
      div.hide();
    }
    });
    $("#search").keyup(filter_list);
    $("#search").click(filter_list); // For mac clear search
    $("#search").change(filter_list);
    $("#search").keydown(function(e){
        // Hitting Return should not submit, but search
        if (e.keyCode == 13){e.preventDefault();}
        if (e.keyCode == 27){$("#search").val("");}
        filter_list(e);
    });
    $("#clear-search").click(clear_search);
    $(".show-list li").live("click",toggle_show);
    // Put checked shows in chosen-shows box
    $("#allshows-list li input:checked").each(function(i, el){
      toggle_show.apply($(el).parent().parent(),[]);
    });
    if(document.location.hash !== "" && document.location.hash.indexOf("shows=") != -1){
        var shows = document.location.hash;
        shows = shows.replace(/#?shows=/,'');
        shows = shows.split(',');
        $('#allshows-list input').each(function(){
            if($.inArray($(this).val(), shows) != -1){
                toggle_show.apply($(this).parent().parent(),[]);
            }
        });
    }
    if($("#twitter").length == 1 && document.location.protocol != "https:"){
      // This is a packed function from twitter for displaying relative time
      function relative_time(C){var A=Date.parse(C);var D=(arguments.length>1)?arguments[1]:new Date();var E=parseInt((D.getTime()-A)/1000,10);E=E+(D.getTimezoneOffset()*60);if(E<60){return"less than a minute ago";}else{if(E<120){return"about a minute ago";}else{if(E<(60*60)){return(parseInt(E/60,10)).toString()+" minutes ago";}else{if(E<(120*60)){return"about an hour ago";}else{if(E<(24*60*60)){return"about "+(parseInt(E/3600,10)).toString()+" hours ago";}else{if(E<(48*60*60)){return"1 day ago";}else{return(parseInt(E/86400,10)).toString()+" days ago";}}}}}}}
      $.getJSON("http://twitter.com/statuses/user_timeline/seriesly.json?callback=?", {}, function(data){
          $("#twitter").html('<p id="tweets" style="display:none"></p>');
          $(data.slice(0,1)).each(function(i, el){
              var d = relative_time(el.created_at);
             $("#tweets").append('<a href="http://twitter.com/seriesly">@seriesly</a>: '+el.text+' - <a rel="external me" href="http://twitter.com/seriesly/status/'+el.id+'">'+d+'</a>');
          });
          $("#tweets").fadeIn("slow");
         });
     }
});