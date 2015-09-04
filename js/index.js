(function(){
    var rollGame = {
        config:{
//            颜色 rgba(125,88,134,0.9) rgba(190,215,66,0.9) rgba(69,185,124,0.9) rgba(243,113,92,0.9)
            color:{
                "color-1":"rgba(125,88,134,0.9)",
                "color-2":"rgba(190,215,66,0.9)",
                "color-3":"rgba(69,185,124,0.9)",
                "color-4":"rgba(243,113,92,0.9)",
            }
        },
        init : function(){
            var that = this;
//           初始小球位置
            $("#roll").css({
                "left":"225px",
                "top":"225px"
            });
//            初始运动快颜色
            this.initcolor();
//            Touch swipe 事件            
            var element = document.getElementsByTagName("ul")[0].getElementsByTagName("li");
            for(var i = 0 ; i < element.length ;i++){
                element[i].eventTarget = true;
                touch.on(element[i],"touchstart",function(ev){ev.preventDefault();});             
                touch.on(element[i],"swiperight",this.swiperight.bind(this));
                touch.on(element[i],"swipedown",this.swipedown.bind(this));
                touch.on(element[i],"swipeleft",this.swipeleft.bind(this));
                touch.on(element[i],"swipeup",this.swipeup.bind(this));
            }            
        },
        initcolor:function(){
            var that = this;
            $(".main ul li").each(function(i,item){
                var index = Math.floor(Math.random()*4)+1;
                var colorString = "color-"+index;
                $(item).css("background",that.config.color[colorString]);
                $(item).data("color",colorString);
            });
        },
        rolling:function(opt){
            var opt = opt || "right";            
            $(".main ul li").each(function(i,item){
                var index = $(item).data("index");
                if(opt == "right" ){
                    index++;
                    index = index == 17? 1: index;                    
                    $(item).removeClass();
                    $(item).addClass("c"+index);
                    $(item).data("index",index);
                }else{
                    index--;
                    index = index == 0? 16: index;                    
                    $(item).removeClass();
                    $(item).addClass("c"+index);
                    $(item).data("index",index);
                }
            });
        },
        swipeleft:function(ev){
            if(!ev.target.eventTarget) return ;
            ev.target.eventTarget = false;
            var index = $(ev.target).data("index");
            if((index >=1 && index<=8) || (index >= 14 && index <= 16)){
                this.rolling("left");
            }else{
                this.rolling("right");
            }
            ev.target.eventTarget = true;
        },
        swiperight:function(ev){
            if(!ev.target.eventTarget) return ;
            ev.target.eventTarget = false;
            var index = $(ev.target).data("index");   
            if((index >=1 && index<=8) || (index >= 14 && index <= 16)){
                this.rolling("right");
            }else{
                this.rolling("left");
            }
            ev.target.eventTarget = true;
        },
        swipedown:function(ev){
            if(!ev.target.eventTarget) return ;
            ev.target.eventTarget = false;
            var index = $(ev.target).data("index");
            if((index >= 2 && index <= 12)){
                this.rolling("right");
            }else{
                this.rolling("left");
            }
            ev.target.eventTarget = true;
        },
        swipeup:function(ev){
            if(!ev.target.eventTarget) return ;
            ev.target.eventTarget = false;
            var index = $(ev.target).data("index");
            if((index >= 1 && index <= 4) || (index >= 10 && index <= 16)){
                this.rolling("right");
            }else{
                this.rolling("left");
            }
            ev.target.eventTarget = true; 
        },
    }
    rollGame.init();
})();