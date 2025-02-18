import { Button, CKModal, ComboBox, Form, Icon, Input, InputStyle, Modal, Switch } from "@clake/react-bootstrap4";
import { useEffect, useRef, useState } from "react";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import dayjs from "dayjs";

interface Data {
    id?:number
    parent_id?:number
    parent_name?:string
    name?: string
    text?: string
    step?: boolean
    link?: string
    icon?: string
    sort?: number
    created_date?:number
    created_by?:string
    modified_date?:number
    modified_by?:string
}

interface Props {
    id?:number
    callback?:()=>void
    parent?: CKModal
}

export default function Edit({id,callback,parent}:Props):any {
    const [data,setData] = useState<Data>({})
    const [isTop, setIsTop] = useState(false)
    const [edit,setEdit] = useState(false)
    let modal = useRef<CKModal>(null);
    let form = useRef<Form>(null);
    useEffect(()=>{
        if (id !== undefined) {
            modal.current?.loading("加载中...")
            Fetch('/serv/menu/find',{id:id},(res:Response)=>{
                modal.current?.close();
                if (res.status) {
                    setData(res.data)
                    setEdit(true)
                } else {
                    modal.current?.alert('加载数据出错：'+res.msg,()=>{
                        parent?.close()
                    })
                }
            })
        } else {
            setData({})
            setEdit(false)
            setIsTop(false)
        }
    },[id])

    function changeHandler(field:any,val:any,row:any) {
        if (field === 'is_top') {
            setIsTop(val)
        } else if (field === "parent_id") {
            if (row) {
                setData((vals)=>{
                    return {...vals,[field]:row.id,"parent_name":row.text}
                })
            } else {
                setData({...data,"parent_name":val})
            }
        } else if (field === "sort") {
            setData({...data,[field]:parseInt(val)})
        } else {
            setData({...data,[field]:val})
        }
    }

    function saveData() {
        if (!form.current?.check()) {
            modal.current?.alert('请完成必要的数据填写')
            return
        }
        if (isTop){
            data.parent_id=0
            data.parent_name=''
        }
        modal.current?.loading('保存数据中...')
        Fetch('/serv/menu/save',{data:data},(res:Response)=>{
            modal.current?.close();
            if (res.status) {
                modal.current?.alert('保存数据成功！',()=>{
                    parent?.close()
                    if (typeof callback === 'function') {
                        callback()
                        setData({})
                        setEdit(false)
                        setIsTop(false)
                    }
                })
            } else {
                modal.current?.alert('保存数据出错：'+res.msg)
            }
        });
    }

    function renderDate() {
        return (
            <div>
                <div className="row g-3">
                    <Input label="创建人" className="col" data={data.created_by} disabled/>
                    <Input label="创建时间" className="col"  data={data.created_date?dayjs.unix(data.created_date).format('YYYY-MM-DD HH:mm:ss'):''} disabled/>
                </div>
                <div className="row g-3">
                    <Input label="修改人" className="col" data={data.modified_by} disabled/>
                    <Input label="修改时间" className="col" data={data.modified_date?dayjs.unix(data.modified_date).format('YYYY-MM-DD HH:mm:ss'):''} disabled/>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Form onChange={changeHandler} ref={form}>
                <div className="row g-3">
                <Input className="col" label="菜单ID" field="name" disabled={edit} placeholder="只能使用英文" validate={{rule:/\w+/,text:"不能为空, 只能使用英文"}} data={data.name}/>
                <Input className="col" label="菜单显示名" field="text" placeholder="最终显示在菜单栏的名称" validate={{rule:/.+/,text:"菜单显示名，不能为空"}} data={data.text}/>
                <InputStyle className="col-2" label="节点显示">
                    <Switch className="mt-1" field="step" checked={data.step}/>
                </InputStyle>
                </div>
                <div className="row g-3">
                    <InputStyle className="col-3" label="顶级菜单">
                        <Switch className="mt-1" field="is_top" checked={isTop} disabled={data.step}/>
                    </InputStyle>
                    <ComboBox className="col" disabled={isTop||data.step} value={data.parent_name} label="父菜单" width="100%" field="parent_id" searchColumn='text' header onSearch={(text,callback)=>{
                        Fetch("/serv/menu/search",{text:text},(res)=>{
                            if (res.status) {
                                callback(res.data)
                            } else {
                                callback([])
                            }
                        })
                    }}>
                        <ComboBox.Column field='text' text='菜单显示名'/>
                        <ComboBox.Column field='name' text='菜单名'/>
                        <ComboBox.Column field='step' text='提示栏' format={(val)=>{
                             return val?<Icon icon="check-square"/>:''
                        }}/>
                    </ComboBox>
                    <Input className="col-2" label="排序" field="sort" type="number" disableClear data={data.sort}/>
                </div>
                <div className="row g-3">
                <Input className="col-3" label={<span>菜单图标 - <Icon icon={data.icon}/></span>} field="icon" placeholder="图标名" disabled={data.step} data={data.icon}/>
                <Input className="col" label="菜单链接" field="link" placeholder="点击跳转的链接" disabled={data.step} data={data.link}/>
                </div>
                
                {edit?renderDate():null}
            </Form>
            <div>
                <Button className="float-end" icon="save" onClick={()=>{
                    saveData()
                }}>保存</Button>
            </div>
            <Modal ref={modal}/>
        </div>
    )
}