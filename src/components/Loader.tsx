import { Common, Load } from "@clake/react-bootstrap4"
import { Component, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import {t} from 'i18next';
function useLoadState() {
    const [Instance, setInstance] = useState(undefined)
    const [noFound, setNoFound] = useState(false)
    const [error, setError] = useState('')
    
}

interface LoaderProps {
    loadPath: string
    import: {(path: string): Promise<unknown>}
    [propName: string]: any
}

function explainUrl(path: string) {
    let arr = path.split('/');
    arr.shift();
    let module = arr.pop();
    if (!module) {
        module = 'shipment/Main';
    }
    module = Common.under2hump(module)
    let ext_path = arr.length > 0 ? '/' : '';
    return ext_path + arr.join('/') + "/" + module;
    // return module
}

export default function Loader(props: LoaderProps) {
    const [Instance, setInstance] = useState(undefined)
    const [loadPath, setLoadPath] = useState(props.loadPath)
    const [noFound, setNoFound] = useState(false)
    const [error, setError] = useState('')
    const location = useLocation()
    
    useEffect(() => {
        let filePath = explainUrl(props.loadPath);
        props.import(filePath).then((component: any) => {
            if (typeof component === "string") {
                setNoFound(true)
                setError(component)
                setInstance(undefined)
            } else {
                setInstance(() => component)
            }
            setLoadPath(props.loadPath)
        })
    }, [props.loadPath])
    
    if (Instance !== undefined && loadPath === props.loadPath) {
        let Elem: typeof Component = Instance
        return <Elem {...props}/>
    } else {
        return (
            <div className='text-center mt-5 mb-5'>
                {noFound ? <div className="text-danger">{error}</div> : <Load>{t('loading')}</Load>}
            </div>
        )
    }
}