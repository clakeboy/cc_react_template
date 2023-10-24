let manage = import.meta.glob('../manage/**/*.tsx',{import: 'default'})
let app = import.meta.glob('../app/**/*.tsx',{import: 'default'})
import {t} from 'i18next';
export function GetModules(path_str:string) {
    // if (!manage) {
    //     manage = import.meta.glob('../manage/**/*.jsx',{import: 'default'})
    //     for (const path in manage) {
    //         manage[path]().then((mod) => {
    //             console.log(path, mod)
    //         })
    //     }
    // }
    let path = '../manage'+path_str+'.tsx'
    if (manage[path]) {
        return manage[path]()
    }
    return new Promise((resolv,reject)=>{
        resolv(t('nofund module')+':'+path_str)
    })
}

export function GetApp(path_str:string) {
    let path = '../app'+path_str+'.tsx'
    if (app[path]) {
        return app[path]()
    }
    return new Promise((resolv,reject)=>{
        resolv(t('nofund module')+':'+path_str)
    })
}

export function GetQuery(str:string) {
    let query:{[propName: string]: string;} = {};
    if (!str) {
        return query;
    }
    let search = str.substring(1);
    let arr = search.split('&');
    arr.forEach(function(item){
        let itemVal = item.split("=");
        query[itemVal[0]] = itemVal[1];
    });

    return query;
}

export function GetLang() :string {
    let lng = localStorage.getItem('lang')
    if (lng) {
        return lng;
    }
    let str = navigator.language
    return str.split('-')[0]
}