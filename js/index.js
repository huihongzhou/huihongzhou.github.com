(function(){
    var rollGame = {
        config:{
//            颜色 rgba(125,88,134,0.9) rgba(190,215,66,0.9) rgba(69,185,124,0.9) rgba(243,113,92,0.9)
            color:{
                "color-1":"rgba(125,88,134,0.9)",
                "color-2":"rgba(190,215,66,0.9)",
                "color-3":"rgba(69,185,124,0.9)",
                "color-4":"rgba(243,113,92,0.9)",
                "color-end":"rgba(255,255,255,0)",
            },
            jqobj:{rollobj:$("#roll")},
            rollspeed:5,
            runtimer:null,
            changeAngletimer:null,
            changeAngleText:10,
            angle:null,
            speedbool:false,
            totaltime:0,
        },
        init:function(){
//            判断操作环境
            if(this.ismoblie()){
                $(".startbutton a").click(function(event){
                $(".profile").css("display","none");
                $(".profile").css("z-index","-1");
                $(".content").css("z-index","100");
                this.initgame();
                }.bind(this));
            }else{
                $(".profile .url").css("display","block");
            }
        },
        initgame : function(){
//           初始小球           
            this.config.rollspeed = 5;
            this.config.jqobj.rollobj.css({
                "left":"225px",
                "top":"225px",
                "background":this.config.color["color-end"],
            });
            this.config.jqobj.rollobj.data("color","color-end");
//            初始运动快颜色
            this.initcolor();
//            初始倒计时功能
            $("header ol li").eq(1).text(this.config.changeAngleText);
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
//            小球运动
            this.sphererun();
//            倒计时功能：每十秒改变速度方向
            this.changeAngle();
//            小球速度改变
            $(".foot a").eq(0).click(function(event){             
                if(this.config.rollspeed == 10) return;
                this.config.rollspeed++;
                this.speed(false);
            }.bind(this));
            $(".foot a").eq(1).click(function(event){ 
                if(this.config.rollspeed == 1) return;
                this.config.rollspeed--;
                this.speed(false);
            }.bind(this));
//            暂停功能
            $(".foot .pausebutton").click(function(event){
                $("#gamepause").css("display","block");
                clearInterval(this.config.runtimer);
                clearInterval(this.config.changeAngletimer);
            }.bind(this));
//            恢复功能
            $("#gamepause a").click(function(event){
                $("#gamepause").css("display","none");
                this.changeAngle();
                this.sphererun();
            }.bind(this));
//            开始新游戏功能          
            $("#gameend a").click(function(event){
                $(event.target).off();
                $(".foot a").off();
                $("#gamepause a").off();
                $("#gameend").css("display","none");
                clearInterval(this.config.runtimer);
                clearInterval(this.config.changeAngletimer);
                this.config.rollspeed = 5;
                this.config.totaltime = 0;
                this.config.speedbool = false;
                this.initgame();
            }.bind(this));    
            
        },
        speed:function(opt){
            var angle;            
            if(opt){
                if(this.config.speedbool) return;
                angle = (Math.round(Math.random()*720 - 360)/180)*Math.PI;
                this.config.angle = angle;
                this.config.jqobj.rollobj.data("speedx",this.config.rollspeed * Math.cos(angle));
                this.config.jqobj.rollobj.data("speedy",this.config.rollspeed * Math.sin(angle));
            }else{
                this.config.speedbool = true;
                angle = this.config.angle;
                if(this.config.jqobj.rollobj.data("speedx")*this.config.rollspeed * Math.cos(angle) >0 ){
                    this.config.jqobj.rollobj.data("speedx",this.config.rollspeed * Math.cos(angle));
                }else{
                    this.config.jqobj.rollobj.data("speedx",-this.config.rollspeed * Math.cos(angle));
                }
                if(this.config.jqobj.rollobj.data("speedy")*this.config.rollspeed * Math.sin(angle) >0 ){
                    this.config.jqobj.rollobj.data("speedy",this.config.rollspeed * Math.sin(angle));
                }else{
                    this.config.jqobj.rollobj.data("speedy",-this.config.rollspeed * Math.sin(angle));
                }
            }               
        },
        changeAngle:function(){
            //var text = this.config.changeAngleText;
            var obj = $("header ol li").eq(1);
            var text = obj.text();
            var timeobj = $("header ol li").eq(0);
            //obj.text(text);
            this.config.changeAngletimer = setInterval(function(){
                timeobj.text(++this.config.totaltime);
                text--;
                if(text == 0) {
                    this.speed(true);
                    text = this.config.changeAngleText;
                }
               obj.text(text);        
            }.bind(this),1000);
        },
        sphererun:function(){
            this.speed(true);
            var roll = this.config.jqobj.rollobj;
            var obj = null;
            var objcolor = null;
            var rollcolor = null;
            var left = parseFloat(roll.css("left"));
            var top = parseFloat(roll.css("top"));
            var speedx =  0;
            var speedy =  0;
            this.config.runtimer  = setInterval(function(){   
                speedx = roll.data("speedx");
                speedy = roll.data("speedy");               
                rollcolor = roll.data("color");
//            碰撞上边
                if((top+speedy) < 80){ 
                    top = 80; roll.data("speedy",-speedy);
                    obj = $(".c"+(Math.floor((left+20)/80)+1));
                    objcolor = obj.data("color");
                    
                    if( rollcolor !== "color-end"){
                        if(objcolor == "color-end"){
                            objcolor = rollcolor;
                        }else if( objcolor == rollcolor ){
                            objcolor = "color-end";
                            rollcolor = "color-end";
                        }
                        obj.data("color",rollcolor);
                        obj.css("background",this.config.color[rollcolor]);
                    }
                    
                    roll.data("color",objcolor);
                    roll.css("background",this.config.color[objcolor]);      
                }else{ top = top + speedy}
//            碰撞下边
                if((top+speedy) > 280){ 
                    top = 280; roll.data("speedy",-speedy);
                    obj = $(".c"+(13 - Math.floor((left+20)/80)));   
                    objcolor = obj.data("color");
                    if(roll.data("color") !== "color-end"){
                        if(objcolor == "color-end"){
                            objcolor = rollcolor;
                        }else if( objcolor == rollcolor ){
                            objcolor = "color-end";
                            rollcolor = "color-end";
                        }
                        obj.data("color",rollcolor);
                        obj.css("background",this.config.color[rollcolor]);  
                    }
                    roll.data("color",objcolor);
                    roll.css("background",this.config.color[objcolor]);    
                }else{ top = top + speedy}
//            碰撞左边
                if((left+speedx) < 80){ 
                    left = 80; roll.data("speedx",-speedx);
                    obj = $(".c"+(17 - Math.floor((top+20)/80)));
                    objcolor = obj.data("color");
                    if(roll.data("color") !== "color-end"){
                        if(objcolor == "color-end"){
                            objcolor = rollcolor;
                        }else if( objcolor == rollcolor ){
                            objcolor = "color-end";
                            rollcolor = "color-end";
                        }
                        obj.data("color",rollcolor);
                        obj.css("background",this.config.color[rollcolor]);  
                    }
                    roll.data("color",objcolor);
                    roll.css("background",this.config.color[objcolor]);   
                }else{ left = left + speedx}
//            碰撞右边
                if((left+speedx) > 280){ 
                    left = 280; roll.data("speedx",-speedx);
                    obj = $(".c"+(5 + Math.floor((top+20)/80)));
                    objcolor = obj.data("color");
                    if(roll.data("color") !== "color-end"){
                        if(objcolor == "color-end"){
                            objcolor = rollcolor;
                        }else if( objcolor == rollcolor ){
                            objcolor = "color-end";
                            rollcolor = "color-end";
                        }
                        obj.data("color",rollcolor);
                        obj.css("background",this.config.color[rollcolor]);  
                    }
                    roll.data("color",objcolor);
                    roll.css("background",this.config.color[objcolor]);   
                }else{ left = left + speedx}               
                roll.css({"left":left+"px","top":top+"px"});
                this.config.speedbool = false;
                //游戏结束
                this.gameend();
            }.bind(this),30);
        },
        gameend:function(){
            var bool = false;
            $(".main ul li").each(function(i,item){
                if($(item).data("color") !== "color-end") bool = true;
            });
            if(!bool){
                localStorage.setItem("thisitem",$("header ol li").eq(0).text());
                if(!localStorage.getItem("maxitem") || parseInt(localStorage.getItem("maxitem")) < parseInt(localStorage.getItem("thisitem"))){
                    localStorage.setItem("maxitem",$("header ol li").eq(0).text());
                }
                clearInterval(this.config.runtimer);
                clearInterval(this.config.changeAngletimer);
                $("#gameend").css("display","block");
//              再来一局，提示信息
                $("#gameend dd").eq(0).text(localStorage.getItem("maxitem")+" 秒");
                $("#gameend dd").eq(1).text(localStorage.getItem("thisitem")+" 秒");
                
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
//            模拟数据
//            $(".main ul li").each(function(i,item){
//               
//                var colorString = "color-end";
//                $(item).css("background",that.config.color[colorString]);
//                $(item).data("color",colorString);
//            });
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
        ismoblie:function(){
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsMidp = sUserAgent.match(/midp/i) == "midp";
            var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                return true;
            } else {
                return false;
            }
        },
    }
    rollGame.init();
})();