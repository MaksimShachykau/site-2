(function($){

    $.fn.lpTabs = function(userParams){

        let defaultParams = {
            duration:1000,
            startIndex:0,
            triggerEvent:'click'
        }

        let params = $.extend(defaultParams, userParams);
       
        return $(this).each(function(){

            let tabs=$(this),
                tabsNames=[];
            tabs.addClass('lp-tabs');

            tabs.children().each(function(){
                tabsNames.push($(this).attr('title'));
                
            }).addClass('lp-tab');

        
            tabs.wrapInner('<div class="lp-tabs-content"></div>');
            tabs.prepend('<div class="lp-tabs-titles"><ul></ul></div>');

            let tabsTitles=tabs.find('.lp-tabs-titles'),
                tabsContent=tabs.find('.lp-tabs-content'),
                tabsContentTabs=tabsContent.find('.lp-tab');

            tabsNames.forEach(function(value){
                tabsTitles.find('ul').append('<li>'+value+'</li>');
            });

            let tabsTitlesItems = tabsTitles.find('ul li');
            tabsTitlesItems.eq(0).addClass('active');
            tabsContentTabs.eq(0).addClass('active').show();

            let h=tabsContent.find('.active').outerHeight();
            tabsContent.height(h);
            tabsTitlesItems.on('click', function(){
                if(!tabs.hasClass('changing')){
                    tabs.addClass('changing');
                    tabsTitlesItems.removeClass('active');
                    $(this).addClass('active');
                    let curTab=tabsContent.find('.active'),
                        nexTab=tabsContentTabs.eq($(this).index());
                    let curHeight=curTab.outerHeight();

                    nexTab.show();
                    let nextHeight=nexTab.outerHeight();
                    nexTab.hide();

                    if(curHeight<nextHeight){
                        tabsContent.animate({
                            height: nextHeight
                        },500);
                    }
                    curTab.fadeOut(500, function(){
                        if(curHeight>nextHeight){
                            tabsContent.animate({
                                height: nextHeight
                            },500);
                        }
                        nexTab.fadeIn(500,function(){
                            curTab.removeClass('active');
                            nexTab.addClass('active');
                            tabs.removeClass('changing');
                            
                        });
                    });
                }
            });
            $(window).on('load resize', function(){
                tabsContent.height(tabsContent.find('.active').outerHeight());
            });

        });

    }


})(jQuery);