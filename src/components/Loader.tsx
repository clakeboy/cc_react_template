import { Common, Load } from "@clake/react-bootstrap4"
import { Component, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

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
        module = 'Main';
    }
    module = Common.under2hump(module)
    let ext_path = arr.length > 0 ? '/' : '';
    return ext_path + arr.join('/') + "/" + module;
    // return module
}

export default function Loader(props: LoaderProps) {
    const [Instance, setInstance] = useState(undefined)
    const [noFound, setNoFound] = useState(false)
    const [error, setError] = useState('')
    const location = useLocation()
    let filePath = explainUrl(props.loadPath);

    useEffect(() => {
        props.import(filePath).then((component: any) => {
            if (typeof component === "string") {
                setNoFound(true)
                setError(component)
                setInstance(undefined)
            } else {
                setInstance(() => component)
            }
        })
        
    }, [location])

    if (Instance !== undefined) {
        let Elem: typeof Component = Instance
        return <Elem {...props}/>
    } else {
        return (
            <div className='text-center mt-5 mb-5'>
                {noFound ? <div className="text-danger">没有找到模块<br />{error}</div> : <Load>模块加载中</Load>}
            </div>
        )
    }
}