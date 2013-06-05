/*!
 * cuSel -- stylized replacement for standard select
 * 
 * https://github.com/fetis/cusel
 *   
 * @version 3.0 alpha
 *
 * @requires jQuery 1.7+     
 * @requires jScrollPane.js
 * @requires jquery.mousewheel.js
 * 
 * Originally based on cuSel 2.5 by Evgeniy Ryzhkov, Alexey Choporov & Roman Omelkovitch
 *  
 */   



/***
 * Replace selects
 * 
 * @param {Object} params Replacement params:
 *  {String} changedEl  Selector which specify replaced selects
 *  {Number} visRows Amount of visible rows 
 *  {Boolean} scrollArrows  Flag for arrows in scroll box 
 *  {String} refreshEl Comma-separated list of refreshed selects. Useby by cuSelRefresh only 
 */ 
function cuSel(params) {
              
  jQuery(params.changedEl).each(function(num) {
  var chEl = jQuery(this),
    chElWid = chEl.outerWidth(), // ширина селекта
    chElClass = chEl.prop("class"), // класс селекта
    chElId = this.id ? this.id : 'cuSel-' + num, // id
    chElName = chEl.prop("name"), // имя
    defaultVal = chEl.val(), // начальное значение
    activeOpt = chEl.find("option[value='"+defaultVal+"']").eq(0),
    defaultText = activeOpt.text(), // начальный текст
    disabledSel = chEl.prop("disabled"), // заблокирован ли селект
    scrollArrows = params.scrollArrows,
    chElOnChange = chEl.prop("onchange"),
    chElTab = chEl.prop("tabindex"),
    chElMultiple = chEl.prop("multiple");
    
    if(!chElId || chElMultiple) return false; // не стилизируем селект если не задан id
    
    if(!disabledSel)
    {
      classDisCuselText = "", // для отслеживания клика по задизайбленному селекту
      classDisCusel=""; // для оформления задизейбленного селекта
    }
    else
    {
      classDisCuselText = "classDisCuselLabel";
      classDisCusel="classDisCusel";
    }
    
    if(scrollArrows)
    {
      classDisCusel+=" cuselScrollArrows";
    }
      
    activeOpt.addClass("cuselActive");  // активному оптиону сразу добавляем класс для подсветки
  
  var optionStr = chEl.html(), // список оптионов

    
  /* 
    делаем замену тегов option на span, полностью сохраняя начальную конструкцию
  */
  
  spanStr = optionStr.replace(/option/ig,"span").replace(/value=/ig,"val="); // value меняем на val, т.к. jquery отказывается воспринимать value у span
  
  /* 
    для IE проставляем кавычки для значений, т.к. html() возращает код без кавычек
    что произошла корректная обработка value должно быть последний атрибутом option,
    например <option class="country" id="ukraine" value="/ukrane/">Украина</option>
  */
  if($.browser.msie && parseInt($.browser.version) < 9)
  {
    var pattern = /(val=)(.*?)(>)/g;
    spanStr = spanStr.replace(pattern, "$1'$2'$3");
  }

  
  /* каркас стильного селекта */
  var cuselFrame = '<div class="cusel '+chElClass+' '+classDisCusel+'"'+
          ' id=cuselFrame-'+chElId+
          ' style="width:'+chElWid+'px"'+
          ' tabindex="'+chElTab+'"'+
          '>'+
          '<div class="cuselFrameRight"></div>'+
          '<div class="cuselText">'+defaultText+'</div>'+
          '<div class="cusel-scroll-wrap"><div class="cusel-scroll-pane" id="cusel-scroll-'+chElId+'">'+ 
          spanStr+
          '</div></div>'+
          '<input type="hidden" id="'+chElId+'" name="'+chElName+'" value="'+defaultVal+'" />'+
          '</div>';
          
          
  /* удаляем обычный селект, на его место вставляем стильный */
  chEl.replaceWith(cuselFrame);
  
  /* если был поцеплен onchange - цепляем его полю */
  if(chElOnChange) jQuery("#"+chElId).bind('change',chElOnChange);

  
  /*
    устаналиваем высоту выпадающих списков основываясь на числе видимых позиций и высоты одной позиции
    при чем только тем, у которых число оптионов больше числа заданного числа видимых
  */
  var newSel = jQuery("#cuselFrame-"+chElId),
    arrSpan = newSel.find("span"),
    defaultHeight;
    
    if(!arrSpan.eq(0).text())
    {
      defaultHeight = arrSpan.eq(1).innerHeight();
      arrSpan.eq(0).css("height", arrSpan.eq(1).height());
    } 
    else
    {
      defaultHeight = arrSpan.eq(0).innerHeight();
    }
    
  
  if(arrSpan.length>params.visRows)
  {
    newSel.find(".cusel-scroll-wrap").eq(0)
      .css({height: defaultHeight*params.visRows+"px", display : "none", visibility: "visible" })
      .children(".cusel-scroll-pane").css("height",defaultHeight*params.visRows+"px");
  }
  else
  {
    newSel.find(".cusel-scroll-wrap").eq(0)
      .css({display : "none", visibility: "visible" });
  }
  
  /* вставляем в оптионы дополнительные теги */
  
  var arrAddTags = jQuery("#cusel-scroll-"+chElId).find("span[addTags]"),
    lenAddTags = arrAddTags.length;
    
    for(i=0;i<lenAddTags;i++) arrAddTags.eq(i)
                    .append(arrAddTags.eq(i).attr("addTags"))
                    .removeAttr("addTags");
                    
  cuselEvents();
  
  });

/* ---------------------------------------
  привязка событий селектам
------------------------------------------
*/
function cuselEvents() {
  var cb = cuselGetBox();

  $("html").off("click.cusel");
  
  $("html").on("click.cusel", function(e) {
  
      var clicked = jQuery(e.target),
        clickedId = clicked.attr("id"),
        clickedClass = clicked.prop("class");
        
      /* если кликнули по самому селекту (текст) */
      
      // TODO: клик по другому селекту вызывает закрытие, но не снимает класс cuselOpen
      
      if( (clicked.hasClass("cuselText") || clicked.hasClass("cuselFrameRight")) && 
          !clicked.parent().hasClass("classDisCusel") ) {
        var cuselWrap = clicked.parent().find(".cusel-scroll-wrap").eq(0);
        
        /* если выпадающее меню скрыто - показываем */
        cuselShowList(cuselWrap);
      }
      /* если кликнули по самому селекту (контейнер) */
      else if(clicked.hasClass("cusel") && !clicked.hasClass("classDisCusel") && clicked.is("div"))
      {
    
        var cuselWrap = clicked.find(".cusel-scroll-wrap").eq(0);
        
        /* если выпадающее меню скрыто - показываем */
        cuselShowList(cuselWrap);
    
      }
      
      /* если выбрали позицию в списке */
      else if(clicked.is(".cusel-scroll-wrap span") && !clicked.hasClass("cuselActive")) {
        var clickedVal = clicked.attr("val") || clicked.text(),
          select = $(cb.data("cusel-select")),
          i = clicked.index();

        if (!select.length)
          return;
        
        select
          .removeClass("cuselOpen")
          .find(".cuselActive").removeClass("cuselActive").end()
          .find(".cusel-scroll-wrap span").eq(i).addClass("cuselActive");
        select
          .find(".cuselText").text( clicked.text() ).end()
          .find("input").val(clickedVal).change();
          
        cb.hide();
        // return focus to control
        select.focus();
      }
      
      else if(clicked.parents(".cusel-scroll-wrap").is("div")) {
        return;
      }
      
      /*
        скрываем раскрытые списки, если кликнули вне списка
      */
      else {
        if (cb.is(":visible")) {
          cb.hide();
          $(".cuselOpen").removeClass("cuselOpen");
        }
      }
  });
    
  $(".cusel").off("keydown.cusel"); /* чтобы не было двойного срабатывания события */
  $(".cusel").on("keydown.cusel", function(event) {
    /*
      если селект задизайблин, с не го работает только таб
    */
    var key, keyChar;
      
    if(window.event) key=window.event.keyCode;
    else if (event) key=event.which;
    
    if(key==null || key==0 || key==9) return true;
    
    if(jQuery(this).prop("class").indexOf("classDisCusel")!=-1) return false;
      
    /*
      если нажали стрелку вниз
    */
    if(key==40)
    {
      var cuselOptHover = jQuery(this).find(".cuselOptHover").eq(0);
      if(!cuselOptHover.is("span")) var cuselActive = jQuery(this).find(".cuselActive").eq(0);
      else var cuselActive = cuselOptHover;
      var cuselActiveNext = cuselActive.next();
        
      if(cuselActiveNext.is("span"))
      {
        jQuery(this)
          .find(".cuselText").eq(0).text(cuselActiveNext.text());
        cuselActive.removeClass("cuselOptHover");
        cuselActiveNext.addClass("cuselOptHover");
        
        $(this).find("input").eq(0).val(cuselActiveNext.attr("val"));
            
        /* прокручиваем к текущему оптиону */
        cuselScrollToCurent($(this).find(".cusel-scroll-wrap").eq(0));
        
        return false;
      }
      else return false;
    }
    
    /*
      если нажали стрелку вверх
    */
    if(key==38)
    {
      var cuselOptHover = $(this).find(".cuselOptHover").eq(0);
      if(!cuselOptHover.is("span")) var cuselActive = $(this).find(".cuselActive").eq(0);
      else var cuselActive = cuselOptHover;
      cuselActivePrev = cuselActive.prev();
        
      if(cuselActivePrev.is("span"))
      {
        $(this)
          .find(".cuselText").eq(0).text(cuselActivePrev.text());
        cuselActive.removeClass("cuselOptHover");
        cuselActivePrev.addClass("cuselOptHover");
        
        $(this).find("input").eq(0).val(cuselActivePrev.attr("val"));
        
        /* прокручиваем к текущему оптиону */
        cuselScrollToCurent($(this).find(".cusel-scroll-wrap").eq(0));
        
        return false;
      }
      else return false;
    }
    
    /*
      если нажали esc
    */
    if(key==27)
    {
      var cuselActiveText = $(this).find(".cuselActive").eq(0).text();
      $(this)
        .removeClass("cuselOpen")
        .find(".cusel-scroll-wrap").eq(0).css("display","none")
        .end().find(".cuselOptHover").eq(0).removeClass("cuselOptHover");
      $(this).find(".cuselText").eq(0).text(cuselActiveText);
  
    }
    
    /*
      если нажали enter
    */
    if(key==13)
    {
      
      var cuselHover = $(this).find(".cuselOptHover").eq(0);
      if(cuselHover.is("span"))
      {
        $(this).find(".cuselActive").removeClass("cuselActive");
        cuselHover.addClass("cuselActive");
      }
      else var cuselHoverVal = $(this).find(".cuselActive").attr("val");
      
      $(this)
        .removeClass("cuselOpen")
        .find(".cusel-scroll-wrap").eq(0).css("display","none")
        .end().find(".cuselOptHover").eq(0).removeClass("cuselOptHover");
      $(this).find("input").eq(0).change();
    }
    
    /*
      если нажали пробел и это опера - раскрывем список
    */
    if(key==32 && $.browser.opera)
    {
      var cuselWrap = $(this).find(".cusel-scroll-wrap").eq(0);
      
      /* ракрываем список */
      cuselShowList(cuselWrap);
    }
      
    if($.browser.opera) return false; /* специально для опера, чтоб при нажатиии на клавиши не прокручивалось окно браузера */
  
  });
  
  /*
    функция отбора по нажатым символам (от Alexey Choporov)
    отбор идет пока пауза между нажатиями сиволов не будет больше 0.5 сек
    keypress нужен для отлова символа нажатой клавиш
  */
  var arr = [];
  jQuery(".cusel").keypress(function(event)
  {
    var key, keyChar;
      
    if(window.event) key=window.event.keyCode;
    else if (event) key=event.which;
    
    if(key==null || key==0 || key==9) return true;
    
    if(jQuery(this).prop("class").indexOf("classDisCusel")!=-1) return false;
    
    var o = this;
    arr.push(event);
    clearTimeout(jQuery.data(this, 'timer'));
    var wait = setTimeout(function() { handlingEvent() }, 500);
    jQuery(this).data('timer', wait);
    function handlingEvent()
    {
      var charKey = [];
      for (var iK in arr)
      {
        if(window.event)charKey[iK]=arr[iK].keyCode;
        else if(arr[iK])charKey[iK]=arr[iK].which;
        charKey[iK]=String.fromCharCode(charKey[iK]).toUpperCase();
      }
      var arrOption=jQuery(o).find("span"),colArrOption=arrOption.length,i,letter;
      for(i=0;i<colArrOption;i++)
      {
        var match = true;
        for (var iter in arr)
        {
          letter=arrOption.eq(i).text().charAt(iter).toUpperCase();
          if (letter!=charKey[iter])
          {
            match=false;
          }
        }
        if(match)
        {
          jQuery(o).find(".cuselOptHover").removeClass("cuselOptHover").end().find("span").eq(i).addClass("cuselOptHover").end().end().find(".cuselText").eq(0).text(arrOption.eq(i).text());
        
        /* прокручиваем к текущему оптиону */
        cuselScrollToCurent($(o).find(".cusel-scroll-wrap").eq(0));
        arr = arr.splice;
        arr = [];
        break;
        return true;
        }
      }
      arr = arr.splice;
      arr = [];
    }
    if(jQuery.browser.opera && window.event.keyCode!=9) return false;
  });
                  
}
  
  /***
   * Toggle dropdown list visibility
   */ 
  function cuselShowList(cuselWrap) {
    var cuselMain = cuselWrap.parent(".cusel"),
      cb = cuselGetBox();
  
    /* если выпадающее меню скрыто - показываем */
    if(cb.is(":hidden")) {
      cb.empty();
      cuselWrap.clone(true)
        .appendTo(cb)
        .show();
        
      cb.show()
        // store node on data for future usage
        .data("cusel-select", cuselMain[0]);
      
      if (jQuery.ui) {
        // using more intelligent position method from $.ui here
        cb.position({
          my: "left top",
          at: "left bottom",
          of: cuselMain,
        });
      } else {
        var pos = cuselMain.offset();
        cb.offset({
          left: pos.left,
          top: pos.top + cuselMain.outerHeight()
        });
      }
      cb.css("min-width", cuselMain.outerWidth() + "px");

      cuselMain.addClass("cuselOpen");
  
      var cuselArrows = cuselMain.hasClass("cuselScrollArrows");
      cb.find(".cusel-scroll-pane")
        .jScrollPaneCusel({showArrows: cuselArrows});
          
      /* прокручиваем к текущему оптиону */
      cuselScrollToCurent(cb.find(".cusel-scroll-wrap"));
    } else {
      cb.hide()
        .removeData("cusel-select");
      
      cuselMain.removeClass("cuselOpen");
    }
  }
  
  /***
   * Scroll down list to the current element
   */
  function cuselScrollToCurent(cuselWrap) {
    var cuselScrollEl = cuselWrap.find(".cuselOptHover:first");
    
    if (!cuselScrollEl.length) {
      cuselScrollEl = cuselWrap.find(".cuselActive:first");
    }
  
    if(cuselWrap.find(".jScrollPaneTrack:first").length && cuselScrollEl.length) {
      var posCurrentOpt = cuselScrollEl.position(),
        idScrollWrap = cuselWrap.find(".cusel-scroll-pane:first")[0].id;
  
      cuselWrap.find(".cusel-scroll-pane")[0].scrollTo(posCurrentOpt.top);  
    } 
  }
  
  /***
   * Return or create box for dropdown list
   */ 
  function cuselGetBox() {
    var b = $("#cuselBox");
    if (!b.length) {
      b = $('<div id="cuselBox">').hide().appendTo("body");
    }
    return b;
  }
  
}


/***
 * Refresh stylized selects
 *  
 * @param {Object} params Refresh params, see cuSel function for details 
 * @description If you changed number of elements in list or show hidden select, you need to call this function to refresh
 */  
function cuSelRefresh(params) {
  /*
    устаналиваем высоту выпадающих списков основываясь на числе видимых позиций и высоты одной позиции
    при чем только тем, у которых число опций больше числа заданного числа видимых
  */

  var arrRefreshEl = params.refreshEl.split(","),
    lenArr = arrRefreshEl.length,
    i;
  
  for(i=0;i<lenArr;i++)
  {
    var refreshScroll = jQuery(arrRefreshEl[i]).parents(".cusel").find(".cusel-scroll-wrap").eq(0);
    refreshScroll.find(".cusel-scroll-pane").jScrollPaneRemoveCusel();
    refreshScroll.css({visibility: "hidden", display : "block"});
  
    var arrSpan = refreshScroll.find("span"),
      defaultHeight = arrSpan.eq(0).outerHeight();
    
  
    if(arrSpan.length>params.visRows)
    {
      refreshScroll
        .css({height: defaultHeight*params.visRows+"px", display : "none", visibility: "visible" })
        .children(".cusel-scroll-pane").css("height",defaultHeight*params.visRows+"px");
    }
    else
    {
      refreshScroll
        .css({display : "none", visibility: "visible" });
    }
  }
}

