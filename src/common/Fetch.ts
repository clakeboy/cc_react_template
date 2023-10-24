// import 'es6-promise/auto';
// import 'whatwg-fetch';

import { Navigate } from "react-router";

let DebugURL = '';
// if (window.__DEBUG__) {
//     DebugURL = window.__URL__ || 'http://localhost:9900';
// }

// let history:any;

// export function SetHistory(his:any) {
//     history = his;
// }
function Fetch(url:string,data:any,fn:{(res:any):void},err?:{(err:any):void}) {
    fetch(DebugURL + url, {
        method: 'post',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // 'Auth':window.localStorage.getItem('GD_POSTAL_MESSAGE_TOKEN')
        },
        body: JSON.stringify(data)
    }).then(function (response) {
        return response.text();
    }).then(function (text) {
        let res = JSON.parse(text);
        if (res && !res.status) {
            if (doErrors(res.msg)) return
        }
        fn(res);
    }).catch(function (ex) {
        if (typeof err === 'function') {
            err(ex);
        } else {
            console.log('error: ' + ex);
        }
    });
}

function doErrors(msg:string) {
    let flag = true;
    switch (msg) {
        case 'code-0003':
            Navigate({to:'/',replace:true})
            break;
        default:
            flag = false;
    }
    return flag
}

export default Fetch;