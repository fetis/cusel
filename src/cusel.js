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
  var initTimeout = 250,  // timeout per init attempt
    initMaxAttempts = 20; // max attempts count
    
	$(params.changedEl).each(function(num) {
    var chEl = $(this);
    
    // check on initialized element
    if (!chEl.is("select") || chEl.prop("multiple"))
     return;
     
    _init(chEl, num, 1)
  });
  
  /***
   * Init select function
   * @param {jQuery} chEl Initialized select element
   * @param {Integer} num Index in array of elements, used for ID generation   
   * @param {Integer} attempt Attempt counts      
   */
   function _init(chEl, num, attempt) {
     var chElWid = chEl.outerWidth(); // ширина селекта
     
     if (chElWid <= 0) {
      if (attempt <= initMaxAttempts) {
        // delay init, until width  will be calculated
        window.setTimeout(function(){ _init(chEl, num, attempt+1); }, initTimeout);
        return;
      } else {
        // we don't have more attempts, set default width and continue
        chElWid = 200;
      }
     }
      
     var chElClass = chEl.prop("class"), // класс селекта
      chElId = chEl[0].id ? chEl[0].id : 'cuSel-' + Date.now() + '-'+num, // id
      chElName = chEl.prop("name"), // имя
      defaultVal = chEl.val(), // начальное значение
      activeOpt = chEl.find("option[value='"+defaultVal+"']").eq(0),    	
    	defaultAddTags = activeOpt.attr("addTags") ? activeOpt.attr("addTags") : '', // добавляем тег для стандартного значения
    	defaultSetClass = activeOpt.data('setclass') ? activeOpt.data('setclass') : '', // добавляем класс от активного опциона по дефаулта, для кастомного оформления
    	defaultText = activeOpt.text(), // начальный текст
      disabledSel = chEl.prop("disabled"), // заблокирован ли селект
      scrollArrows = params.scrollArrows,
      chElOnChange = chEl.prop("onchange"),
      chElTab = chEl.prop("tabindex");
      
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
       
  	chEl.find('option').addClass('cuselItem'); // добавляем каждому опциону класс item, чтобы далее обращаться к этому классу, а не к span
      activeOpt.addClass("cuselActive");  // активному оптиону сразу добавляем класс для подсветки
    
    var optionStr = chEl.html(), // список оптионов
  
      
    /* 
      делаем замену тегов option на span, полностью сохраняя начальную конструкцию.
      value меняем на val, т.к. jquery отказывается воспринимать value у span
    */
    itemStr = optionStr.replace(/option/ig,"span").replace(/value=/ig,"val=");
    
    /* 
      для IE проставляем кавычки для значений, т.к. html() возращает код без кавычек
      что произошла корректная обработка value должно быть последний атрибутом option,
      например <option class="country" id="ukraine" value="/ukrane/">Украина</option>
    */
    if($.browser.msie && parseInt($.browser.version) < 9)
    {
      var pattern = /(val=)(.*?)(>)/g;
      itemStr = itemStr.replace(pattern, "$1'$2'$3");
    }
    
    /* каркас стильного селекта */
    var cuselFrame = '<div class="cusel '+chElClass+' '+classDisCusel+'"'+
            ' id=cuselFrame-'+chElId+
            ' style="width:'+chElWid+'px"'+
            ' tabindex="'+chElTab+'"'+
            '>'+
            '<div class="cuselFrameRight"></div>'+
            '<div data-class="'+defaultSetClass+'" class="cuselText '+defaultSetClass+'">'+defaultAddTags + '<label>'+activeOpt.text()+'</label></div>'+
            '<div class="cusel-scroll-wrap"><div class="cusel-scroll-pane" id="cusel-scroll-'+chElId+'">'+ 
            itemStr+
            '</div></div>'+
            '<input type="hidden" id="'+chElId+'" name="'+chElName+'" value="'+defaultVal+'" />'+
            '</div>';
            
            
    /* удаляем обычный селект, на его место вставляем стильный */
    chEl.replaceWith(cuselFrame);
    
    /* если был поцеплен onchange - цепляем его полю */
    if(chElOnChange) $("#"+chElId).bind('change',chElOnChange);
    
    
    var newSel = $("#cuselFrame-"+chElId),
      arrItems = newSel.find("span.cuselItem"),
      defaultHeight;
  	
  	/* оборачиваем текст оптионов в label, чтобы отделить от addTags */
  	arrItems.wrapInner('<label/>');
  	
    /*
      устаналиваем высоту выпадающих списков основываясь на числе видимых позиций и высоты одной позиции
      при чем только тем, у которых число оптионов больше числа заданного числа видимых
    */  
      
      if(!arrItems.eq(0).find('label').text())
      {
        defaultHeight = arrItems.eq(1).innerHeight();
        arrItems.eq(0).css("height", arrItems.eq(1).height());
      } 
      else
      {
        defaultHeight = arrItems.eq(0).innerHeight();
      }
      
    
    if(arrItems.length>params.visRows)
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
    
    var arrAddTags = $("#cusel-scroll-"+chElId).find("span[addTags]"),
      lenAddTags = arrAddTags.length;
      
      for(i=0;i<lenAddTags;i++) arrAddTags.eq(i)					
                      .prepend(arrAddTags.eq(i).attr("addTags"))
                      .removeAttr("addTags");
                      
    cuselEvents();
   
   }     

/* ---------------------------------------
  привязка событий селектам
------------------------------------------
*/
function cuselEvents() {
  var cb = cuselGetBox();

  $("html").off("click.cusel");
  
  $("html").on("click.cusel", function(e) {		
  
      var clicked = $(e.target),
        clickedId = clicked.attr("id"),
        clickedClass = clicked.prop("class");
		
		
        
      /* если кликнули по самому селекту (текст) */
      if( (clicked.hasClass("cuselText") || clicked.hasClass("cuselFrameRight") || clicked.parents(".cuselText:first").length ) && 
          !clicked.parents('.cusel:first').hasClass("classDisCusel") ) {
        var cuselWrap = clicked.parents('.cusel:first').find(".cusel-scroll-wrap").eq(0);
        
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
      else if( ( clicked.parents('.cuselItem:first').length && !clicked.parents('.cuselItem:first').hasClass("cuselActive") ) || ( clicked.is('.cuselItem') && !clicked.hasClass("cuselActive") ) ) {
	  
		var setItem = clicked.is('.cuselItem') ? clicked : clicked.parents('.cuselItem:first'),			
			select = clicked.parents('.cusel:first').length ? clicked.parents('.cusel:first') : $(cb.data("cusel-select")),
			i = setItem.index();       

        if (!select.length)
          return;
		  
		  
        
        select
          .removeClass("cuselOpen")
          .find(".cuselActive").removeClass("cuselActive").end()
          .find(".cuselItem").eq(i).addClass("cuselActive");		  
		  
		cuselChange(select,setItem);
          
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
	var select = $(this),
		open = select.is('.cuselOpen') ? true : false,
		cb = $('#cuselBox');
    /*
      если селект задизайблин, с него работает только таб
    */
    var key, keyChar;
      
    if(window.event) key=window.event.keyCode;
    else if (event) key=event.which;
    
    if(key==null || key==0 || key==9) return true;
    
    if(select.prop("class").indexOf("classDisCusel")!=-1) return false;
	
	switch (key) {
		case 32: { // если нажали пробел
			if (!open)
				select.trigger('click');
			return false;
			break;
		}
		case 40: // если нажали стрелку вправо или вниз
		case 39: {
			if (open) {
				var cuselActive = cb.find(".cuselOptHover").eq(0).length ? cb.find(".cuselOptHover").eq(0) : cb.find(".cuselActive").eq(0),
					cuselActiveNext = cuselActive.next();
				
				if(cuselActiveNext.is(".cuselItem")) {				  
					cuselActive.removeClass("cuselOptHover");
					cuselActiveNext.addClass("cuselOptHover");
					
					/* прокручиваем к текущему оптиону */
					cuselScrollToCurent(cb.find(".cusel-scroll-wrap").eq(0));
				}
			} else {
				var cuselActive = select.find(".cuselOptHover").eq(0).length ? select.find(".cuselOptHover").eq(0) : select.find(".cuselActive").eq(0),
					cuselActiveNext = cuselActive.next();				
				
				if(cuselActiveNext.is(".cuselItem"))				
					cuselActiveNext.trigger('click');				
			}
			return false;
			break;
		}
		case 37: // если нажали стрелку влево или вверх
		case 38: {
			if (open) {
				var cuselActive = cb.find(".cuselOptHover").eq(0).length ? cb.find(".cuselOptHover").eq(0) : cb.find(".cuselActive").eq(0),
					cuselActivePrev = cuselActive.prev();
				
				if(cuselActivePrev.is(".cuselItem")) {				  
					cuselActive.removeClass("cuselOptHover");
					cuselActivePrev.addClass("cuselOptHover");
				
					/* прокручиваем к текущему оптиону */
					cuselScrollToCurent(cb.find(".cusel-scroll-wrap").eq(0));				
				}
			} else {
				var cuselActive = select.find(".cuselOptHover").eq(0).length ? select.find(".cuselOptHover").eq(0) : select.find(".cuselActive").eq(0),
					cuselActivePrev = cuselActive.prev();
				
				if(cuselActivePrev.is(".cuselItem"))
					cuselActivePrev.trigger('click');				
			}
			return false;
			break;
		}
		case 27: { // если нажали esc
			if (open) {
				select
				.removeClass("cuselOpen");
				cb.hide();
			} else
				select.blur();			
			break;
		}
		case 13: { // если нажали enter
			if (open) 
				cb.find(".cuselOptHover").eq(0).trigger('click').removeClass("cuselOptHover");
      return false;
			break;
		}
	}

  });
  
  /*
    функция отбора по нажатым символам (от Alexey Choporov)
    отбор идет пока пауза между нажатиями сиволов не будет больше 0.5 сек
    keypress нужен для отлова символа нажатой клавиш
  */
	var arr = [];
	$(".cusel").keypress(function(event) {
		var select = $(this),
			open = select.is('.cuselOpen') ? true : false;
			
		if (open) {
			var key,
				keyChar,
				cb = $('#cuselBox')
			if (window.event)
				key=window.event.keyCode;
			else if (event)
				key=event.which;
			
			if (key==null || key==0 || key==9)
				return true;
			
			if ($(this).prop("class").indexOf("classDisCusel")!=-1)
				return false;
	 
			arr.push(event);
			clearTimeout($.data(this, 'timer'));
			var wait = setTimeout(function() { handlingEvent() }, 500);
			select.data('timer', wait);
			function handlingEvent() {
				var charKey = [];
				for (var iK in arr) {
					if (window.event)
						charKey[iK]=arr[iK].keyCode;
					else if (arr[iK])
						charKey[iK]=arr[iK].which;
					charKey[iK]=String.fromCharCode(charKey[iK]).toUpperCase();
				}
				var arrOption=cb.find(".cuselItem label"),
					colArrOption=arrOption.length,
					i,
					letter;
				for (i=0;i<colArrOption;i++) {
					var match = true;
					for (var iter in arr) {
						letter=arrOption.eq(i).text().charAt(iter).toUpperCase();
						if (letter!=charKey[iter])
							match=false;
				  
					}
					if (match) {
						cb.find(".cuselOptHover").removeClass("cuselOptHover").end().find(".cuselItem").eq(i).addClass("cuselOptHover");
				
						/* прокручиваем к текущему оптиону */
						cuselScrollToCurent(cb.find(".cusel-scroll-wrap").eq(0));
						arr = arr.splice;
						arr = [];
						break;
						return true;
					}	
				}
				arr = arr.splice;
				arr = [];
			}
			if ($.browser.opera && window.event.keyCode!=9)
				return false;
		}
	});
  
}

/***
* Event change
*/ 

function cuselChange(select,setItem) {
	var addClass = setItem.data('setclass') ? setItem.data('setclass') : '',
		prevClass = select.find('.cuselText').data('class') ? select.find('.cuselText').data('class') : '',
		setItemVal = setItem.attr("val");
		
	 // preserve empty value here, otherwise return text itself according standard behavior
    if (typeof setItemVal == "undefined")
        setItemVal = setItem.find('label').text();
		
	select
		.find(".cuselText").removeClass(prevClass).data('class',addClass).addClass(addClass).html( setItem.html() ).end()
		.find("input").val(setItemVal).change();
}
  
  /***
   * Toggle dropdown list visibility
   */ 
  function cuselShowList(cuselWrap) {
    var cuselMain = cuselWrap.parent(".cusel"),
      cb = cuselGetBox();

    // remove from all selects  
    $(".cuselOpen").removeClass("cuselOpen");
    
    /* если выпадающее меню скрыто - показываем */
    if(cb.is(":hidden")) {
      cb.empty();
      cuselWrap.clone(true)
        .appendTo(cb)
        .show();
        
      cb.show()
        // store node on data for future usage
        .data("cusel-select", cuselMain[0]);
      
      if ($.ui) {
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
      // otherwise hide menu
      cb.hide()
        .removeData("cusel-select");
    }
  }
  
/***
* Scroll down list to the current element
*/
	function cuselScrollToCurent(cuselWrap) {
		var cuselScrollEl = cuselWrap.find(".cuselOptHover:first").length ? cuselWrap.find(".cuselOptHover:first") : cuselWrap.find(".cuselActive:first");
  
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
    var refreshScroll = $(arrRefreshEl[i]).parents(".cusel").find(".cusel-scroll-wrap").eq(0);
    refreshScroll.find(".cusel-scroll-pane").jScrollPaneRemoveCusel();
    refreshScroll.css({visibility: "hidden", display : "block"});
  
    var arrItems = refreshScroll.find(".cuselItem"),
      defaultHeight = arrItems.eq(0).outerHeight();
    
  
    if(arrItems.length>params.visRows)
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

/***
 * Set select value
 * @param {Selector} select
 * @param value New value  
 */
function cuselSetValue(select, value) {
  var $elem = $(select).closest(".cusel"),
    $item = $elem.find(".cuselItem[val="+value+"]").first();
  
  if (!$item.length)
    return false;

  // invoke value change  
  $item.click();    
}  

