
export var RandomString = function(str_length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var num;
    var out_str = "";
    for (var i=0;i<str_length;i++) {
        num = Math.round(Math.random()*chars.length);
        out_str += chars.substring(num, num+1);
    }
    chars = num = null;
    return out_str;
};

export var LoadScript = {
    _loaded:{},
    load:function(srcStr,strID){
        var func = arguments[2];
        var version = arguments[3];
        if (this._loaded[strID]) {
            if (func && typeof func == "function") func();
            return;
        }
        var element;
        var ext = srcStr.split('?')[0].substr(srcStr.lastIndexOf('.')+1);
        if (ext === 'css') {
            element = document.createElement("LINK");
            if (typeof version == "string") {
                element.href = srcStr+"?"+version;
            } else if (typeof version == "boolean") {
                element.href = srcStr+"?"+RandomString(5);
            } else {
                element.href = srcStr;
            }
            element.rel = 'stylesheet';
            element.id = strID;
            element.type = 'text/css';
        } else if (ext === 'js') {
            element = document.createElement("SCRIPT");
            if (typeof version == "string") {
                element.src = srcStr+"?"+version;
            } else if (typeof version == "boolean") {
                element.src = srcStr+"?"+RandomString(5);
            } else {
                element.src = srcStr;
            }
            element.type = 'text/javascript';
            element.id = strID;
            element.language = 'javascript';
        }

        this._loaded[strID] = false;
        var self = this;
        element.onload = function(){
            this.onload = null;
            self._loaded[strID] = true;
            if (func && typeof func == "function") func();
        };
        element.onerror = function(){
            alert("Load Library Error!");
        };

        document.getElementsByTagName("head")[0].appendChild(element);
        element = null;
    }
};

export function GetElementXY(e) {
    var parent = arguments[1]?arguments[1]:undefined;
    var t = {};
    t['top'] = e.offsetTop;
    t['left'] = e.offsetLeft;
    var scrollTop = 0;
    var scrollLeft = 0;
    var topScroll = 0;
    var leftScroll = 0;
    while ((e = e.offsetParent) && e != parent) {
        t['top'] += e.offsetTop;
        t['left'] += e.offsetLeft;
        topScroll = e.scrollTop;
        scrollTop += topScroll;
        leftScroll = e.scrollLeft;
        scrollLeft += leftScroll;
    }
    t['top'] = t['top'] - (scrollTop - topScroll);
    t['left'] = t['left'] - (scrollLeft - leftScroll);

    scrollTop = topScroll = scrollLeft = leftScroll = parent = null;
    return t;
}

export function js_getDPI() {
    var arrDPI = [];
    if (window.screen.deviceXDPI) {
        arrDPI[0] = window.screen.deviceXDPI;
        arrDPI[1] = window.screen.deviceYDPI;
    }
    else {
        var tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        arrDPI[0] = parseInt(tmpNode.offsetWidth);
        arrDPI[1] = parseInt(tmpNode.offsetHeight);
        tmpNode.parentNode.removeChild(tmpNode);
    }
    return arrDPI;
}

export function in_array(needle,haystack) {
    var i;
    if(typeof needle == 'string' || typeof needle == 'number') {
        for(i in haystack) {
            if(haystack[i] == needle) {
                return true;
            }
        }
    }
    return false;
}