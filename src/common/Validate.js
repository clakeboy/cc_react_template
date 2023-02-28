/**
 * 数据验证类
 */
var _validate;
class Validate {
    constructor(cfg) {
        this._cfg = cfg;

        //正则规则
        this._regs = {
            "match":/^(.+?)(\d+)-(\d+)$/,
            //任意字符
            "*":/[\w\W]+/,
            //数字
            "n":/^\d+$/,
            //浮点数
            "f":/^\d+(\.?)\d{0,3}$/,
            //字符串,中文,空格,点
            "s":/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s\d]+$/,
            //区号
            "p":/^[0-9]{6}$/,
            //手机
            "m":/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|17[0-9]{9}$/,
            //email
            "e":/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            //URL地址
            "url":/^(\w+:\/\/)?\w+(\.\w+)+.*$/,
            //日期
            "d":/^\d{4}-\d{1,2}-\d{1,2}$/,
            //日期时间
            "dt":/^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:?\d{0,2}$/
        };
    }

    /**
     * 检查数据是否和规则相同
     * @param role
     * @param value
     * @returns {*|boolean|{command}|{src, dest}}
     */
    check(role,value) {
        var reg = this._explainDataType(role);
        return reg.test(value);
    }
    
    checkData(data,roles) {
        var key;
        for (key in roles) {
            if (roles[key].option) {
                if (data[key]) {
                    if (data[key]===null||!this.check(roles[key].role,data[key])) {
                        throw roles[key].errmsg
                    }
                }
            } else {
                if (data[key]===null||!this.check(roles[key].role,data[key])) {
                    throw roles[key].errmsg
                }
            }
        }
    }

    /**
     * 解释规则为正则表达式
     * @param data
     * @returns {*}
     * @private
     */
    _explainDataType(data) {
        if (!data) return null;
        var reg = this._regs[data] || null;
        if (reg) {
            return reg;
        } else {
            var match = data.match(this._regs.match);
            if (match) {
                if (match[1] == 'n') {
                    reg = new RegExp("^\\d{"+match[2]+","+match[3]+"}$");
                } else if (match[1] == 's') {
                    reg = new RegExp('^[\\u4E00-\\u9FA5\\uf900-\\ufa2d\\w\\.\\s\\d]{'+match[2]+','+match[3]+'}$');
                } else if (match[1] == '*') {
                    reg = new RegExp("^[\\w\\W]{"+match[2]+","+match[3]+"}$");
                }
            }
            return reg;
        }
    }
}

Validate.inst = function(cfg){
    if (_validate) {
        return _validate;
    } else {
        _validate = new Validate(cfg);
        return _validate;
    }
};

export default Validate;