$(function(){

    //公共变量
    var contentList = [],
        flag = true;

    // 0 开发环境  1 测试环境  2 staging环境  3生产环境
    var status = _DDC.status;
     status = 0;
    var ajaxUrl  = status==0?'https://tv-d.daydaycook.com.cn/':status==1?'https://tv-t.daydaycook.com.cn/':status==2?'https://tv-s.daydaycook.com.cn/':'https://tv.daydaycook.com.cn/';
    var ajaxUrl2  = status==0?'https://uc-api-d.daydaycook.com.cn/':status==1?'https://uc-api-t.daydaycook.com.cn/':status==2?'https://uc-api-s.daydaycook.com.cn/':'https://uc-api.daydaycook.com.cn/';

    //请求app数据
    //getLoginInfo();
    //var sessionId = localStorage.getItem('sessionId');
    var sessionId =_DDC.getQueryString('sessionId');
    commonAjax();

    //请求列表数据
    function commonAjax(){
        if(sessionId) {
            axios.get( ajaxUrl2 + '/scoreExchange/ExchangeCouponList?session=' + sessionId).then(function(xhr){
                var res = xhr.data;
                if( res && res.code == 1){
                    contentList = res.data;
                    var windmilllist= '';
                    var btn_content = '';
                    contentList.forEach(function(item, index){
                        var flagQty = 1;

                        //券可兑换数量为0
                        if( item.sendQty == 0) {
                            btn_content = '<a href="javascript:;" class="exchange_btn grey_btn">已兑完</a>';
                            item.flagQty = -1;
                        }else if( item.currentScore < item.score){
                            btn_content = '<a href="javascript:;" class="exchange_btn grey_btn">积分不足</a>';
                            item.flagQty = 0;
                        }else{
                            btn_content = '<a href="javascript:;" data-couponId ='+ item.couponId + ' data-actItemId =' + item.id + ' data-score ='+ item.score + ' class="exchange_btn JS_exchange_btn">立即兑换</a>';
                            item.flagQty = 1;
                        }

                    });

                    //按规则排序
                    var contentSortList = contentList.sort(compareByFlag);

                    contentSortList.forEach(function (item, index) {

                        //券可兑换数量为0
                        if( item.sendQty == 0) {
                            btn_content = '<a href="javascript:;" class="exchange_btn grey_btn">已兑完</a>';
                            item.flagQty = -1;
                        }else if( item.currentScore < item.score){
                            btn_content = '<a href="javascript:;" class="exchange_btn grey_btn">积分不足</a>';
                            item.flagQty = 0;
                        }else{
                            btn_content = '<a href="javascript:;" data-couponId ='+ item.couponId + ' data-actItemId =' + item.id + ' data-score ='+ item.score + ' class="exchange_btn JS_exchange_btn">立即兑换</a>';
                            item.flagQty = 1;
                        }

                        var _windmilllist = '<div class="gift_list_item">' +
                            '                <div class="gift_list_line"></div>' +
                            '                <i class="left_icon"></i>' +
                            '                <i class="right_icon"></i>' +
                            '                <div class="gift_list_con">' +
                            '                    <div class="product">' + btn_content +
                            '                        <h3>' + item.couponName + '</h3>' +
                            '                        <p>消耗' + item.score + '枚风车叶</p>' +
                            '                    </div>\n' +
                            '                    <div class="dashed_line"></div>' +
                            '                    <div class="surplus">剩余<em>'+ toThousands(item.sendQty) +'</em>件</div>' +
                            '                </div>' +
                            '            </div>';
                        windmilllist = windmilllist + _windmilllist;
                    });

                    $('.gift_list').html("");
                    $('.gift_list').append(windmilllist);

                }else if( res.code == '10013' || res.code == '10014' || res.code == '10027' || res.code == '10028') {
                    document.title = '该⻚页⾯面没有可⽤用于兑换的优惠券哦';
                    $('body').append('<div class="empty"><img src="https://api.daydaycook.com.cn/daydaycook/images/sign/nullac.png" width="51%"><p>正在为您准备可兑换的物品，⼩小煮先移步别处转转再来~</p></div>')
                }else{
                    _DDC.warning(res.message || '服务器错误')
                }
            }).catch(function(err) {
                _DDC.warning('服务器错误')
                console.log(err)
            });
        } else {
            document.title = '该⻚页⾯面没有可⽤用于兑换的优惠券哦';
            $('body').append('<div class="empty"><img src="https://api.daydaycook.com.cn/daydaycook/images/sign/nullac.png" width="51%"><p>正在为您准备可兑换的物品，⼩小煮先移步别处转转再来~</p></div>')
        }
    }

    //立即兑换按钮
    $('.gift_list').on('click', '.JS_exchange_btn', function(){
        var $this = $(this);
        var couponId = $this.attr('data-couponId');
        var actItemId = $this.attr('data-actItemId');
        var score = $this.attr('data-score');

        //flag = false;
        axios.get( ajaxUrl2 + '/scoreExchange/scoreExchangeCoupon?session='+ sessionId +'&couponId='+ couponId +'&actItemId='+ actItemId +'&score=' + score).then(function(xhr){
            // axios.get( ajaxUrl2 + '/scoreExchange/scoreExchangeCoupon?session='+ '0c9af38679a944b783bdda0a47ddcabb78' +'&couponId='+ 49 +'&actItemId='+ 137 +'&score=' + 7).then(function(xhr){
            var res = xhr.data;
            //flag = true;
            if( res && res.code == 1) {
                _DDC.success(res.message || '兑换成功');
                commonAjax();
            }else if( res.code == '10000'){
                _DDC.warning(res.message || '用户未登陆')
            }else if( res.code == '10017'){
                _DDC.warning(res.message || '优惠券已兑完')
            }else if( res.code == '10029'){
                _DDC.warning(res.message || '积分不足')
            }else{
                _DDC.warning(res.message || '服务器错误')
            }
        }).catch(function(err) {
            _DDC.warning('服务器错误')
            console.log(err)
        })
    });

    //js格式化数字（每三位加逗号）
    function toThousands(num) {
        var num = (num || 0).toString(), result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
        return result;
    }

    //排序-倒序
    function compareByFlag (obj1, obj2) {
        var val1 = obj1.flagQty;
        var val2 = obj2.flagQty;
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }

    //判断用户是否登录
    function getLoginInfo(){
        var number = 0;
        var timer = setInterval(function() {
            number++;
            if(number > 60){
                clearInterval(timer);
                setSystemInfo({"uid": "0c9af38679a944b783bdda0a47ddcabb78"});
                setTimeout(function() {
                    if(userInfo && userInfo.uid){// 已登录
                        localStorage.setItem('sessionId',userInfo.uid);
                    }else{//未登录
                    }
                },20)
            }else{
                if (typeof ddcApp == 'object') {
                    ddcApp.getSystemInfo();
                    //ddcApp.setTitle({title:"我的风车"})
                    setTimeout(function() {
                        if(userInfo && userInfo.uid){// 已登录
                            //ddcApp.closeLoading();
                            clearInterval(timer);
                            localStorage.setItem('sessionId',userInfo.uid);
                        }else{//未登录
                            ddcApp.toLogin();
                        }
                    },20)
                }
            }
        },50);

    }

});



