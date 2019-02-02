(function(w) {

    var LMS = {
        init: function() {
            this.browser();
            this.nav();
            this.gotoedit();
        },

        run: function(path, callback) {
            seajs.use(path, callback);
        },

        browser: function() {
            //ie6
            if(!-[1,]) {
                this.isIe = true;
                if (!window.XMLHttpRequest) {
                    $('html').addClass('ie6');
                    this.isIe6 = true;
                }
            }
            $('body').children().eq(0).before('<table align="center" width="100%" cellpadding="0" bgcolor="#FFFFCC" style="margin:0 auto;"><tbody><tr><td style="margin:0 auto;color:#ff3b6d;font-size:14px!important;text-align:center;height:50px;background: rgba(255, 59, 109,0.1);">尊敬的用户：您好！春节期间(2月3日至2月10日)如您在访问“先之学院”过程中需咨询相关事宜，可致电王经理（13906524399）。先之学院恭祝您新春愉快，猪年大吉！</td></tr></tbody></table>')
        },

        nav: function() {
            $('.student-mainnav')[0] && (function() {
                $('.student-mainnav li,.subnav-item').on('mouseenter', function() {
                    $('.subnav-item').addClass('hide');
                    $('.nav-' + $(this).attr('key')).find('a').addClass('hover');
                    $('.subnav-' + $(this).attr('key')).removeClass('hide');
                }).on('mouseleave', function() {
                    $('.nav-' + $(this).attr('key')).children().removeClass('hover');
                    $('.subnav-item').addClass('hide');
                    $('.subnav ul.current').removeClass('hide');
                });
            })()
        },

        gotoedit: function() {
            var $wrap = $('.logo-wrap').first(),
                $show = $wrap.find('.show-wrap'),
                $edit = $wrap.find('.edit-wrap'),
                $name = $wrap.find('.title-show'),
                $input = $edit.find('input');

            $wrap.find('.goto-edit').on('click', function() {
                $show.addClass('hide').siblings().removeClass('hide');
                $input.val($name.html()).trigger('focus');
            });
            $input.on('input',function () {
                var $this = $(this);
                $this.val($this.val().replace(/[^a-zA-Z0-9\u4E00-\u9FA5\(\)（）]/g,''));
            });

            $input.on('blur', function() {
                var ori = $name.html(),
                    $this = $(this),
                    val = $.trim($this.val()),
                    name = $this.attr('name');

                if (val == '' || val == ori) {
                    $edit.addClass('hide').siblings().removeClass('hide');
                } else {
                    var param = {};
                    param[name] = val;
                    L.ajax({
                        url: $this.attr('action'),
                        data: param,
                        type: 'post',
                        success: function() {
                            $name.text(val);
                            $edit.addClass('hide').siblings().removeClass('hide');
                        }
                    });
                }
            });
        },

        createUrl: function(path, params) {
            path = path || '';
            var url = ((path.indexOf('http') === 0) || (path.indexOf('https') === 0)) ? path : window.location.protocol+'//' + window.location.host + (path.indexOf('/') === 0 ? '' : '/') + path;

            if (params) {
                var get = $.extend(L.getParams(url), params), str = $.param(L.objectFilter(get));
                url = url.substring(url, url.indexOf('?') === -1 ? undefined : url.indexOf('?'));
                str && (url += '?' + str);
            }

            return url;
        },

        getParams: function(path) {
            var params = {}, paramStr = path.substring(path.indexOf('?') + 1);
            paramStr && (function() {
                $.each(paramStr.split('&'), function(k, v) {
                    var item = v.split('=');
                    item[1] && (params[item[0]] = item[1]);
                })
            }());
            return params;
        },

        allowReplaceState: !!w.history.replaceState,

        replaceState: function(url, title) {
            if ( ! this.allowReplaceState) return false;
            title = title || document.title;
            w.history.replaceState && w.history.replaceState({}, title, url);
            return true;
        },

        goBack: function(url) {
            window.location.href = document.referrer || url;
        },

        ajax: function(opts) {
            var me = this;
            var o = $.extend({}, {
                url: '',
                type: 'get',
                data: {},
                dataType: 'json',
                cache: false,
                success: function() {},
                fail: function(response) {
                    typeof(this.onFail) == 'function' && this.onFail(response);
                    me.alert(response.errMsg);
                }
            }, opts);

            $.ajax({
                url: o.url,
                type: o.type,
                data: o.data,
                dataType: o.dataType,
                cache: o.cache,
                success: function(response) {
                    if (response.status === 1) {
                        o.success(response.data);
                    } else {
                        if (response.errCode === 8001) {
                            me.alert('登录超时', function() {
                                window.location.href = window.location.href;
                            });
                            return;
                        }
                        o.fail(response);
                    }
                }
            });
        },

        popup: function(o) {
            var opts = {
                beforeConfirm: function() {return true;},
                close: function() {
                    if (this.undoClose) return true;
                    (typeof (o.beforeClose) == 'function') && o.beforeClose();
                },
                cancelBtn: true,
                lock: true,
                ok: null
            };

            $.extend(opts, o);

            if (opts.btns) {
                if (opts.cancelBtn) opts.btns += '<a class="btn-d btn-d-gray ml20 btn-cancel">取 消</a>';
                opts.content += '<div class="popup-btn">' + opts.btns + '</div>';
                delete opts.btns;
            }

            opts.content = '<div class="lms-popup">' + opts.content + '</div>';

            seajs.use(['artdialog', 'artdialog-skin'], function() {
                var art = artDialog(opts),
                    $wrap = art.DOM.content;

                typeof(opts.completeCallback) == 'function' && opts.completeCallback($wrap.find('.lms-popup'), art);
                $wrap.find('a.btn-sure').on('click', function() {
                    if (art.disabled) return;
                    art.undoClose = true;
                    if (opts.beforeConfirm($wrap, art)) {
                        art.close();
                        (typeof(opts.callback) == 'function') && opts.callback($wrap, art);
                    }
                });

                $wrap.find('a.btn-cancel').on('click', function() {
                    art.close();
                });
            });
        },

        alert: function() {
            var o = {title: '系统提示', message: '', okValue: '确&nbsp;定', beforeClose: null, width: 430};

            if (typeof(arguments[0]) == 'object') $.extend(o, arguments[0]);
            else {
                o.message = arguments[0];
                o.beforeClose = arguments[1];
            }
            o.buttons = '<a class="btn-d btn-d-blue btn-sure">'+o.okValue+'</a>';

            var opts = {
                title: o.title,
                content: '<div class="popup-con popup-alert">'+o.message+'</div>',
                btns: o.buttons,
                width: o.width,
                cancelBtn: false,
                beforeClose: o.beforeClose,
                beforeConfirm: function($wrap, art) {
                    art.undoClose = false;
                    return true;
                }
            };

            this.popup(opts);
        },

        confirm: function() {
            var o = {title: '系统提示', message: '', okValue: '确&nbsp;定', cancelValue: '取&nbsp;消', callback: null, cancelCallback: null, width: 430};

            if (typeof(arguments[0]) == 'object') $.extend(o, arguments[0]);
            else o.message = arguments[0];

            (typeof(arguments[1]) == 'function') && (o.callback = arguments[1]);
            o.buttons || (o.buttons = '<a class="btn-d btn-d-blue btn-sure">'+o.okValue+'</a><a class="btn-d btn-d-gray ml20 btn-cancel">'+o.cancelValue+'</a>');

            this.popup({
                title: o.title,
                content: '<div class="popup-con popup-confirm">'+o.message+'</div>',
                btns: o.buttons,
                width: o.width,
                cancelBtn: false,
                callback: o.callback,
                beforeClose: o.cancelCallback
            });
        },

        template: function(callback) {
            var me = this;
            seajs.use('art-template', function(template) {
                template.helper('substring', function() {return me.escape(me.substring.apply(me, arguments))});
                template.helper('createUrl', function(){return me.createUrl.apply(me, arguments)});
                template.helper('charCode', me.charCode);

                var dateMap = {'Y': [0, 4], 'y': [2, 2], 'm': [5, 2], 'd': [8, 2], 'H': [11, 2], 'i': [14, 2], 's': [17, 2]};
                template.helper('date', function(str, format) {
                    if (typeof str !== 'string' || !str) return '';
                    format = format || 'Y-m-d';
                    return format.replace(/[a-zA-Z]+/g, function(key) {
                        return String.prototype.substr.apply(str, dateMap[key]);
                    });
                });

                template.helper('strtotime', function(str) {
                    return Math.round(Date.parse(str) / 1000);
                });
                (typeof(callback) == 'function') && callback(template);
            });
        },

        escape: function (content) {
            return typeof content === 'string'
            ? content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                return {
                    "<": "&#60;",
                    ">": "&#62;",
                    '"': "&#34;",
                    "'": "&#39;",
                    "&": "&#38;"
                }[s];
            })
            : content;
        },

        charCode: function(index) {
            return String.fromCharCode(65 + parseInt(index));
        },

        substring: function (str, len, flow) {
            if ( ! str) return '';
            str = str.toString();
            var newStr = "",
                strLength = str.replace(/[^\x00-\xff]/g, "**").length,
                flow = typeof(flow) == 'undefined' ? '...' : flow;

            if (strLength <= len + (strLength % 2 == 0 ? 2 : 1)) return str;

            for (var i = 0, newLength = 0, singleChar; i < strLength; i++) {
                singleChar = str.charAt(i).toString();
                if (singleChar.match(/[^\x00-\xff]/g) != null) newLength += 2;
                else newLength++;

                if (newLength > len) break;
                newStr += singleChar;
            }

            if (strLength > len) newStr = $.trim(newStr) + flow;
            return newStr;
        },

        selectAll: function($warp) {
            var $selectAll = $warp.find('.select-all');
            $selectAll.on('click', function() {
                $warp.find('.list-checkbox').prop("checked", this.checked);
                $selectAll.prop("checked", this.checked);
            });

            $warp.on('click', '.list-checkbox', function() {
                $selectAll.prop('checked', $warp.find('.list-checkbox:checked').length == $warp.find('.list-checkbox').length);
            });
        },

        getSeleted: function($checkbox) {
            var selected = [];
            $checkbox.filter(':checked').each(function() {
                selected.push($(this).val());
            });

            return selected;
        },

        getSeletedCustom: function($checkbox) {
            var selected = [];
            $checkbox.filter(':checked').each(function() {
                selected.push($(this).attr('custom'));
            });

            return selected;
        },

        serializeObject: function($form) {
            var arr = $form.serializeArray(),
                obj = {};

            $.each(arr, function(index, param){
                if (obj[param.name] !== undefined && param.value) {
                    var name = param.name;
                    name = name.replace(/^(.*)\[\]$/, function(s, s1) {
                        var i = 1, key;
                        do {
                            key = s1+'['+i+']';
                            i++;
                        } while(obj[key] !== undefined);
                        return key;
                    });

                    obj[name] = param.value;
                } else {
                    obj[param.name] = param.value || '';
                }
            });
            return obj;
        },

        objectDiff: function(obj1, obj2) {
            var diff = {}, isDiff = false;
            for (var k in obj1) if (obj2[k] && obj2[k] != obj1[k] && (isDiff= true)) diff[k] = obj2[k];

            return isDiff ? diff : null;
        },

        objectDiff2: function(o1, o2) {
            var r = {}, diff = 0;
            for(var k in o1) {

                if(!o2[k]) //如果被删除了
                    r[k] = 0, diff = 1;
                else if(o1[k] !== o2[k])
                    r[k] = o2[k], diff = 3, delete o2[k];
                else
                    r[k] = o2[k], delete o2[k];
            }

            //如果增加了
            for(var k in o2)
                r[k] = o2[k], diff = 2;

            return diff ? r : null;
        },

        arrayDiff: function(arr1, arr2) {
            var res = [];
            $.each(arr1, function(k, v) {
                if ($.inArray(v, arr2) === -1) res.push(v);
            });

            return res;
        },

        isRepeatArr:function (arr) {
          var hash = {};
          for(var i in arr) {
            if(hash[arr[i]])
            {
              return true;
            }
            hash[arr[i]] = true;
          }
          return false;
        },

        arraySwap:function (arr,index1,index2) {
          var temp;
          temp = arr[index2];
          arr[index2] = arr[index1];
          arr[index1] = temp;
          return arr;
        },

        arrayFilter: function(arr, func) {
            var res = [];
            func = func || function(v) {return v;}
            $.each(arr, function(k, v) {
                if (func(v)) res.push(v);
            });
            return res;
        },

        objectFilter: function(obj, func) {
            var res = {};
            func = func || function(v) {return v;}
            $.each(obj, function(k, v) {
                if (func(v)) res[k] = v;
            });
            return res;
        },

        getCols: function(data, key) {
            var ids = [];
            $.each(data, function(k, v) {
                ids.push(v[key]);
            });
            return ids;
        },

        objectFlip: function(data, value) {
            var map = {};
            $.each(data, function(k, v) {
                map[v] = value || k;
            });
            return map;
        },

        cloneObject: function(obj) {
            var func = arguments.callee;
            if (typeof obj === "object" && obj !== null) {
                $.each((obj = $.extend((obj instanceof Array) ? [] : {}, obj)), function(k, v) {
                    obj[k] = func(v);
                });
            }

            return obj;
        },

        getPager: function(data, cur, per) {
            var cur = parseInt(cur) || 1,
                per = parseInt(per) || 10,
                res = {},
                total = data.length,
                allPages = (total % per) ? (Math.floor(total / per) + 1) : (total / per),
                cur = cur >= allPages ? allPages : parseInt(cur),
                start = (cur - 1) * per;

            res.pager = {total: data.length, allPages: allPages, cur: cur, per: per};
            res.list = data.slice(start, (start + per));

            return res;
        },

        getTreeDrop: function(data, opts) {
            var res = [],
                o = $.extend({keyName: 'id', valueName: 'name', childName: 'childrens', spaceNum: 1, prefix: '⊿'}, opts || {});

            var getSub = function(d, l) {
                l = l || 0;
                $.each(d, function(key, value) {
                    var prefix = new Array(l*o.spaceNum + 1).join('　') + o.prefix;

                    res.push([value[o.keyName], prefix + value[o.valueName]]);
                    var childrens = value[o.childName];
                    if (childrens && childrens.length > 0) {
                        getSub(childrens, l + 1);
                    }
                });
            }
            getSub(data);
            return res;
        },

        textareaLimit: function($textarea, $show, limit) {
            limit = limit || parseInt($show.text());

            var limitEvent = function(event) {
                var val = $(this).val(), count = val.length;
                if (count > limit) {
                    $(this).val(val.substring(0, limit));
                    $show.text(0);
                } else $show.text(limit-count);
            };

            $textarea.on(this.isIe ? 'propertychange' : 'input', limitEvent);
            if (this.isIe && navigator.userAgent.match(/msie (\d)/i)[1] > 8) $textarea.on('keydown', function(event) {if (event.which == 8 || event.which == 46) limitEvent.apply(this, arguments);});
            limitEvent.apply($textarea[0]);
        },

        numberic: function($input) {
            $input.on('keypress', function(event) {
                var code = event.which;
                return (code >= 48 && code <= 57) || (code == 46 || code == 8 || code == 0);
            }).on('blur', function() {
                var val = $.trim($(this).val()),
                    max = $(this).attr('max'),
                    min = $(this).attr('min') || 0;

                if (val == '') {
                    var ori = $(this).attr('defaults');
                    if (ori !== undefined) return $(this).val(ori);
                }

                val = parseInt(val);
                val = isNaN(val) ? 0 : val;

                (max !== undefined) && (val = Math.min(max, val));
                (min !== undefined) && (val = Math.max(min, val));
                $(this).val(+val);
            });
        },

        inputEnter: function($input, func) {
            $input.off('keydown.enter').on('keydown.enter', function(event) {
                if (event.which == 13) {
                    return func.apply(this, arguments);
                }
            });
        },

        tip: {
            passed: function($input) {
                var $passed = this.element($input, 'passed');
                $input.addClass('passed-input');
                $passed.removeClass('hide').siblings().addClass('hide');
            },
            error: function($input, message) {
                var $error = this.element($input, 'error');
                this.format($input);
                $error.html('<em></em>'+message);
                $input.addClass('error-input');
                $error.removeClass('hide').siblings().addClass('hide');
            },
            prompt: function($input) {
                this.format($input);
                var $tip = this.element($input);
                $tip.children().addClass('hide');
                $tip.find('.prompt').removeClass('hide');
            },
            format: function($input) {
                $input.removeClass('passed-input').removeClass('error-input');
            },
            hide: function($input) {
                this.element($input).children().addClass('hide');
            },
            element: function($input, className) {
                var $tip = $input.parent().find('.tip');
                if ( ! $tip[0]) $tip = $('<p class="tip"></p>').appendTo($input.parent());

                if (className) {
                    var $e = $tip.find('.' + className);
                    return $e[0] ? $e : $('<b class="'+className+'"><em></em></b>').appendTo($tip);
                } else return $tip;
            }
        },

        swap: function(array, index) {
            return array.splice(index, 2, array[index+1], array[index]);
        },

        typePicker: function($wrap, event) {
            var $input = $wrap.find('input'),
                $a = $wrap.find('a');

            $a.on('click', function() {
                if ( ! $(this).hasClass('current')) {
                    var value = $(this).attr('data-item');
                    if (value == undefined) return;
                    $wrap.find('.current').removeClass('current');
                    $(this).addClass('current');
                    $input.val(value);
                    event && event(value, $(this));
                }
            }).filter('[data-item='+$input.val()+']').addClass('current');
        },

        toggleClass: function($elem, _class, _switch) {
            $elem.toggleClass(_class, _switch);
            _class = $elem.attr('class').split(' ')[0] + '-' + _class;
            $elem.toggleClass(_class, _switch);
            return $elem.hasClass(_class);
        },

        hover: function($wrap, selector) {
            if (this.isIe6) {
                $wrap.on('mouseenter mouseleave', selector, function(target) {
                    $(this).toggleClass('hover', target.type == 'mouseenter');
                });
            }
        },

        tabShow: function($nav, $content, mode, callback) {
            mode = mode || 'click';
            $nav.on(mode, function() {
                if( ! $(this).hasClass('current')) {
                    var index = $(this).index();
                    $(this).addClass('current').siblings().removeClass('current');
                    $content.eq(index).removeClass('hide').siblings().addClass('hide');
                    callback && callback(index);
                }
            });
        },

        placeholder: function($input, $parent) {
            var placeholder = 'placeholder' in document.createElement('input');

            !placeholder && $input.each(function() {
                var $this =  $(this),
                    $p = $parent || $this.offsetParent(),
                    tip = $this.attr('placeholder'),
                    $placeholder,
                    toggleHide = $p.hasClass('hide');

                if (tip) {
                    $placeholder = $.data(this, 'placeholder');
                    if ( ! $placeholder) {
                        $placeholder = $('<s class="placeholder"></s>').appendTo($p);
                        $placeholder.html(tip);
                        $.data(this, 'placeholder', $placeholder);
                    }

                    if (toggleHide) $p.removeClass('hide');
                    $placeholder.css('left', $this.offset().left - $p.offset().left + parseInt($this.css('padding-left')));
                    $placeholder.css('top', $this.offset().top - $p.offset().top);
                    if (toggleHide) $p.addClass('hide');
                    if (this.tagName == 'INPUT') $placeholder.css('line-height', $this.height() + 'px');

                    $placeholder.toggleClass('hide', $this.val() !== '');
                    $placeholder.on('click', function() {$this.focus()});

                    $this.on('focus', function() {
                        $placeholder.toggleClass('hide', true);
                    }).on('blur', function() {
                        $placeholder.toggleClass('hide', $this.val() !== '');
                    });
                }
            });
        },

        _cache: {},

        cache: function(key, value) {
            if (typeof(value) == 'undefined') return this._cache[key] || null;
            else this._cache[key] = value;
        },

        log: function(errMsg) {
            window.console && window.console.log(errMsg);
        },

        isSpeed:false,
        getGoodnews:function(){
            this.goodnewPost();
            var __this = this;
            var int = setInterval(function(){
                __this.goodnewPost();
            }, 1000*60*1);

            $('body').on('click', '.close', function() {
                $('.goodnewsbox').stop(true);
                $('.likething').hide();
                $('.close').hide();
                window.clearInterval(int);
            });
        },
        goodnewPost:function(){
            if(this.isSpeed){
                return;
            }
            this.isSpeed = true;
            var _this = this;
            var url = L.createUrl('/api/goodnews/list');
            $.post(url,{},function(data){
                var res = JSON.parse(data);
                if(res.status == 0){
                    return;
                }else if(res.status == 1){
                    if(res.data.length == 0){
                        return;
                    }else{
                        var arr = _this.createHtml(res.data);
                        var width = _this.setPostion(arr);
                        _this.setAnimate(width);
                    }
                }
            });
        },
        createHtml:function(data){
            var arr = [];
            for(var i=0;i<data.length;i++){
                var html = '<li style="float:left;margin:0 20px; 0 20px;list-style-type:none;">';
                html += '<img style="display:block;float:left;height:30px;margin:5px 10px 0 0;" src="'+data[i].avatar+'" alt="">';
                html += '<div style="float:left;color:#fff;font-size:15px;margin-top:10px;">恭喜'+data[i].username+'通过《'+data[i].title+'》！！！</div>';
                html += '</li>';
                arr.push(html);
            }
            return arr;
        },
        setPostion:function(arr){
            var html = arr.join('');
            var len = arr.length * 2000;
            var width = this.getWidth(html, len);

            var left = $(document.body).width()-100;
            $('.goodnewsbox').css(this.getGoodnewsParam(width, left));
            $('.goodnewsbox').html(html);
            $('.close').css(this.getCloseParam(left));
            $('.likething').show();

            return width;
        },
        getWidth:function(html, len){
            var ele=$("<span id='temp'></span>").html(html).css({position: "fixed",left: -len+'px',top: "0"});
            $("body").append(ele);
            var width = ele.width()+10;
            $('#temp').remove();
            return width;
        },
        getGoodnewsParam:function(width, left){
            return {
                'width': width+'px',
                'position':'absolute',
                'top':0,
                'left':left+'px'
            };
        },
        getCloseParam:function(left){
            return {
                'position':'absolute',
                'left':left/2+500+'px',
                'top':0,
                'width':'30px',
                'height':'30px',
                'text-align':'center',
                'line-height':'30px',
                'background-color':'#ff9000',
                'display':'block',
                'color':'#eee',
                'font-size':'15px',
                'cursor':'pointer'
            };
        },
        setAnimate:function(width){
            var _this = this;
            $('.goodnewsbox').animate({left: -width+'px'},width*30,function(){
                $('.close').hide();
                $('.likething').hide();
                _this.isSpeed = false;
            })
        }
    };

    LMS.init();

    w.L = LMS;

}(window));
