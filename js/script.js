const lpApp=angular.module('lpApp', []);
lpApp.controller('lpPriceCtrl', function($scope, $http, $timeout){
    /* 
    $timeout(function(){
    },3000)
    */
    $http.get('price.json').then(function(res){
         $scope.prices=res.data;
         $scope.calc();
         $scope.sortGet();
    }).catch(function(arr){
        $scope.reqStatus=arr.status;
        $scope.reqStatusText=arr.statusText;
    });

    $scope.sortBy='name';
    $scope.sortRev=false;
    $scope.sortSet=function(proportyName){
        if($scope.sortBy==proportyName){
            $scope.sortRev=!$scope.sortRev;
        }
        $scope.sortBy=proportyName;   
        localStorage.sortBy=$scope.sortBy;
        localStorage.sortRev=$scope.sortRev;
    };
    $scope.sortGet=function(){
        if (localStorage.sortBy&&localStorage.sortRev){
            $scope.sortBy=localStorage.sortBy;
            $scope.sortRev=(localStorage.sortRev == true);
        }else{
            $scope.sortBy='name';
            $scope.sortRev=false;    
        }
    }
    $scope.calc=function(){
        $scope.prices.forEach(function(price){
            price.price2=price.price*(1-price.discount);
        });
    }

});







(function ($){
    $(document).ready(function(){
        $('.lp-slider1').owlCarousel({
            items:1,
            nav:true,
            navText:['<i class="fa fa-arrow-left"></i>','<i class="fa fa-arrow-right"></i>']
        });
        $('.lp-slider2').owlCarousel({
            items:3,
            responsive:{
                1300:{
                    items:3
                },
                850:{
                        items:2
                    },
                180:{
                        items:1
                    }
                }
        });
        let lpNav=$('.header .section .topNav')
        /*плавный скрол к выбранному блоку */
        $('#myTopNav a').on('click', function(e){
            let trgSelector= $(this).attr('href'),
            lincTrg=$(trgSelector);
            if(lincTrg.length>0){
                e.preventDefault();
                let offset=lincTrg.offset().top-105;
                $('body, html').animate({
                    scrollTop: offset
                }, 500);
            }
        }) ;   
        
        function lpSectionActive(){
            let curItems='';
            
            $('section').each(function(){
                
                if($(window).scrollTop()>$(this).offset().top-400){
                    curItems=$(this).attr('id');
                    console.log('da');
                    
                }
                let noActiveItem=lpNav.find('a.active').length==0,
                newActiveItem=lpNav.find('a.active').attr('href')!='#'+curItems;
                if(noActiveItem||newActiveItem){
                    lpNav.find('a.active').removeClass('active');
                    lpNav.find('a[href="#'+curItems+'"]').addClass('active');
                    
                } 
            });
        }
        lpSectionActive();
        $(window).on('load scroll', lpSectionActive);



        
    $('.lp-services').lpTabs({
        duration:500,
        triggerEvent: 'click',
        startIndex:0
    });
    
    $('.services .background .section .lp-content .lp-services .services2 .cleopatre_bath').on('mousemove', function(){
        $('.services .background').addClass('active_service');
        
    });
    $('.services .background .section .lp-content .lp-services .services2 .mud_bath').on('mousemove', function(){
        $('.services .background').addClass('active_mud_bath');
    });
    $('.services .background .section .lp-content .lp-services .services2 .oils_bath').on('mousemove', function(){
        $('.services .background').addClass('active_oils_bath');
    });
    $('.bath').on('mouseleave', function(){ 
        $('.services .background' ).addClass('hideBG');

        setTimeout(() => {
            $('.services .background' ).removeClass('active_service active_mud_bath active_oils_bath hideBG');

        }, 500);
        // $('.services .background' ).removeClass('active_service active_mud_bath active_oils_bath hideBG');
    });


    //добовление карты

    $.fn.lpMapInit=function(){
        let lpMapOptions={
            center:[41.380850, 2.122586],
            zoom:16,
            controls:['fullscreenControl','zoomControl'],
            
        }
        if(window.innerWidth<768){
            lpMapOptions.behaviors=['multiTouch'];
        }else{
            lpMapOptions.behaviors=['drag']
        }
        let lpMap = new ymaps.Map('maps', lpMapOptions);
        let lpPlacemark = new ymaps.Placemark(lpMapOptions.center,{
            hintContent:'FCB',
            balloonContentHeader:'FCB',
            balloonContentBody:'больше чем клуб',
            balloonContentFooter:'Barcelona'
        });
        lpMap.geoObjects.add(lpPlacemark);
    }


    /*всплывающие окна */
    $('.lp-mfp-inline').magnificPopup({
        type:'inline'
    });


    /* */
    $('#lp-fb1').wiFeedBack({
        fbScript: 'blocks/wi-feedback.php',
        fbLink: '.lp-fb1-linc',//прописываем класс 
        fbColor:'#c97f25'
    });

    });
})(jQuery);
