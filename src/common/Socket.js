import {CKSocket} from '@clake/ckio';

let _socket = {};

let eventList = {};

let evt_types = {
    PTY: 'pty',
};

function _init(id,url,opt) {
    console.log("init websocket",id,url,opt);
    if (_socket[id]) {
        return
    }
    let so = new CKSocket(url||window.__URL__||location.origin,opt||{});
    so.open();
    _socket[id] = so;
}

function _emit(evt_type, args, cb) {
    let evt_list = eventList[evt_type];
    if (evt_list instanceof Array) {
        evt_list.forEach((item)=>{
            item(evt_type, args, cb);
        })
    }
}

function _on(id,evt_type, fn) {
    if (!_socket[id]) return
    if (!(eventList[evt_type] instanceof Array)) {
        eventList[evt_type] = [];
    }
    eventList[evt_type].push(fn);

    if (eventList[evt_type].length === 1) {
        _socket[id].on(evt_type,_on_socket(evt_type));
    }
}

function _off(id,evt_type, fn) {
    if (!_socket[id]) return
    if (!(eventList[evt_type] instanceof Array)) {
        return
    }

    let evt_list = eventList[evt_type];
    let idx = evt_list.indexOf(fn);

    if (idx !== -1) {
        evt_list.splice(idx,1);
    }

    if (evt_list.length <= 0) {
        _socket[id].off(evt_type);
    }
}
//生成一个socket监听方法
function _on_socket(evt_type) {
    return (data) => {
        _emit(evt_type,data)
    }
}

function _close(id) {
    if (_socket[id]) {
        _socket[id].close()
    }
}

const Socket = {
    init:_init,
    on:_on,
    off:_off,
    close:_close,
    emit:(id,evt_name,data,cb)=>{
        if (!_socket[id]) return
        _socket[id].emit(evt_name,JSON.stringify(data),cb);
    },
    evtTypes:evt_types,
};

export default Socket;