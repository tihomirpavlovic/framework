﻿/* 
*   Gallery jQuery Plugin
*   Tirien.com
*   $Rev$
*/

(function($){
    $.tGallery = function(element, options) {
        var defaults = {
            speed : 900,
            duration : 5000,
            goToImage : '.goto-image',
            nextImage : '.next-image',
            prevImage : '.prev-image',
            caption : '.image-caption',
            startImage: 0,
            imageSelector: 'img',
            imageWrapper: null,
            autoPlay : true,
            lockSize: true,
            transition: 'crossfade',
            beforeChange: function(images, i){},
            afterChange: function(images, i){},
            beforeAnimation: function(images, i){},
            onInit: function(images, i){}
        }

        var plugin = this;

        plugin.settings = {}

        var $element = $(element),
             element = element;

        var imageWrapper,
            images,
            firstImage;
        var activeImage;
        var i;
        var timer;
        var captionField;

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            findElements();      //vraca sve potrebne elemente
            applyInitSettings(); //postavlja pocetne stilove
            bindEvents();        //binduje eventove za goto next i prev image
            activeImage.show();

            if (plugin.settings.autoPlay){
                run();
            }

            plugin.settings.onInit(images, i);
        }

        plugin.startPlaying = function() {
            clearTimeout(timer);
            plugin.settings.autoPlay = true;
            run();
        }

        plugin.stopPlaying = function() {
            clearTimeout(timer);
            plugin.settings.autoPlay = false;
        }

        plugin.refresh = function(){

            if(plugin.settings.transition == 'slide'){
                options.startImage = activeImage.index();
            }

            clearTimeout(timer);
            plugin.init();

        }

        plugin.next = function(){
            nextImage();
        }

        plugin.prev = function(){
            prevImage();
        }

        var findElements = function() {
            images = $element.find(plugin.settings.imageSelector);
            i = plugin.settings.startImage;
            activeImage = firstImage = $(images[i]);

            if (plugin.settings.imageWrapper === null)
            {
                imageWrapper = firstImage.parent();
            }
            else{
                imageWrapper = $element.find(plugin.settings.imageWrapper);
            }
            captionField = $(plugin.settings.caption);
        }

        var applyInitSettings = function() {

            images.css({
                position : 'absolute',
                left : 0,
                top : 0,
                display : 'none'
            });

            $(plugin.settings.goToImage).filter('[data-n='+plugin.settings.startImage+']').addClass('current');

            if( plugin.settings.transition == 'slide' ){
                $(plugin.settings.imageSelector).eq(plugin.settings.startImage).css({position:"absolute",'margin-left':-$element.outerWidth()/2,left:'50%'});
                $(plugin.settings.imageSelector).css({overflow: "hidden"});
            }

            var pos = imageWrapper.css('position');

            if (pos=='static'){
                if (plugin.settings.lockSize){
                    imageWrapper.css({width: imageWrapper.width(), height: imageWrapper.height()});
                    images.first().css({position: 'absolute'});
                }
                imageWrapper.css({position : 'relative'});
            }

            if (captionField){
                captionField.html(activeImage.find('[data-caption]').data('caption'));
            }

        }

        var run = function() {            
            timer = plugin.settings.autoPlay ? setTimeout(nextImage, plugin.settings.duration) : null;
        }

        var bindEvents = function() {
            $(plugin.settings.goToImage).off('click.tgallery').on('click.tgallery', function(e){
                e.preventDefault();
                goTo($(this).data('n'));
            });
            $(plugin.settings.nextImage).off('click.tgallery').on('click.tgallery', function(e) {
                e.preventDefault();
                nextImage();
            });
            $(plugin.settings.prevImage).off('click.tgallery').on('click.tgallery', function(e) {
                e.preventDefault();
                prevImage();
            });
        }

        var goTo = function(imageNumber) {
            var next = $(images[imageNumber]);
            var direction = 'prev';

            if(next.length) {
                clearTimeout(timer);
                timer = plugin.settings.autoPlay ? setTimeout(nextImage, plugin.settings.duration) : null;
                i = imageNumber;
                if( imageNumber > $(plugin.settings.goToImage +'.active').data('n') ){
                    direction = 'next'
                }
                showImage(activeImage, next, direction);
            }
        }

        var nextImage = function() {
            clearTimeout(timer);
            timer = plugin.settings.autoPlay ? setTimeout(nextImage, plugin.settings.duration) : null;
            var next = $(images[++i]);
            if(!next.length) {
                i = 0
                next = $(images[i]);
            }
            showImage(activeImage, next, 'next');
        }

        var prevImage = function() {
            clearTimeout(timer);
            timer = plugin.settings.autoPlay ? setTimeout(prevImage, plugin.settings.duration) : null;
            var prev = $(images[--i]);
            if(!prev.length) {
                i = images.length - 1;
                prev = $(images[i]);
            }
            showImage(activeImage, prev, 'prev');
        }

        var showImage = function(prev, next, direction) {
            if($(prev)[0] !== $(next)[0]) {
                if (plugin.settings.beforeChange(images, i)!==false){

                    if (captionField){
                        captionField.fadeOut(function(){
                            $(this).html('').html( next.find('[data-caption]').data('caption') ).fadeIn();
                        })
                    }

                    $(plugin.settings.goToImage).removeClass('current').filter('[data-n=' + next.index() + ']').addClass('current');
                    plugin.settings.beforeAnimation(images, i);

                    if( plugin.settings.transition == 'crossfade' ){
                        transitionCrossFade(prev,next,direction);
                    }
                    else if( plugin.settings.transition == 'fade' ){
                        transitionFade(prev,next,direction);
                    }
                    else if( plugin.settings.transition == 'slide' ){
                        transitionSlide(prev,next,direction);
                    }

                    activeImage = next;
                }
            }
        }

        var transitionCrossFade = function(prev,next,direction){
            prev.fadeOut(plugin.settings.speed);
            next.fadeIn( plugin.settings.speed, plugin.settings.afterChange(images, i) );
        }

        var transitionFade = function(prev,next,direction){
            prev.fadeOut( plugin.settings.speed, function(){
                next.fadeIn( plugin.settings.speed, plugin.settings.afterChange(images, i) );
            });
        }

        var transitionSlide = function(prev,next,direction){
            var left = direction === 'next';
            prev.css({zIndex: 5}).animate( {left: left ? "-50%" : "150%"}, plugin.settings.speed, function(){$(this).hide()} );
            next.css({zIndex:10, left: left ? "150%" : "-50%", marginLeft:-next.width()/2}).show();
            next.animate( {left:"50%"}, plugin.settings.speed, plugin.settings.afterChange(images, i) );
        }

        plugin.nextImage = function() {
            nextImage();
        }

        plugin.prevImage = function() {
            prevImage();
        }

        plugin.showImage = function(next) {
            if (typeof next !== 'undefined')
            {
                showImage(activeImage, next);

            }
        }

        plugin.goTo = function(index) {
            if (typeof index !== 'undefined')
            {
                goTo(index);
            }
        }

        plugin.init();

    }

    $.fn.tGallery = function(options) {

        return this.each(function() {
            if (undefined == $(this).data('tGallery')) {
                var plugin = new $.tGallery(this, options);
                $(this).data('tGallery', plugin);
            }
        });

    }

})(jQuery);