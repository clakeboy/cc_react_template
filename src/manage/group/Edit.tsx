import { Button, CKModal, Form, Input, InputStyle, Modal } from "@clake/react-bootstrap4";
import { useEffect, useRef, useState } from "react";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import dayjs from "dayjs";
import Loader from "../../components/Loader";
import { GetModules } from "../../common/Funcs";

interface Data {
    id?:number
    name?: string
    menu_list?: number[]
    created_date?:number
    modified_date?:number
}

interface Props {
    id?:number
    callback?:()=>void
    parent?: CKModal
}

export default function Edit({id,callback,parent}:Props):any {
    const [data,setData] = useState<Data>({})
    const [edit,setEdit] = useState(false)
    let modal = useRef<CKModal>(null);
    let form = useRef<Form>(null);
    useEffect(()=>{
        if (id !== undefined) {
            modal.current?.loading("加载中...")
            Fetch('/serv/group/find',{id:id},(res:Response)=>{
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
        }
    },[id])

    function changeHandler(field:any,val:any,row:any) {
        setData({...data,[field]:val})
    }

    function saveData() {
        if (!form.current?.check()) {
            modal.current?.alert('请完成必要的数据填写')
            return
        }
        modal.current?.loading('保存数据中...')
        Fetch('/serv/group/save',{data:data},(res:Response)=>{
            modal.current?.close();
            if (res.status) {
                modal.current?.alert('保存数据成功！',()=>{
                    parent?.close()
                })
            } else {
                modal.current?.alert('保存数据出错：'+res.msg)
            }
        });
    }

    function openMenuList() {
        modal.current?.view({
            title:"选择菜单",
            header:true,
            content: <Loader loadPath="/group/MenuList" import={GetModules} selectedList={data.menu_list} callback={(list:number[])=>{
                setData({...data,menu_list:list})
                modal.current?.close()
            }}/>,
            width:'600px',
        })
    }

    function renderDate() {
        return (
            <div>
                <Input label="创建时间" data={data.created_date?dayjs.unix(data.created_date).format('YYYY-MM-DD HH:mm:ss'):''} disabled/>
                <Input label="修改时间" data={data.modified_date?dayjs.unix(data.modified_date).format('YYYY-MM-DD HH:mm:ss'):''} disabled/>
            </div>
        )
    }

    return (
        <div>
            <Form onChange={changeHandler} ref={form}>
                <Input label="分组名" field="name" disabled={edit} validate={{rule:/.+/,text:"请填写分组名，不能为空"}} data={data.name}/>
                <InputStyle label='分组菜单选择'>
                <div className="row g-1">
                    <div className="col-8">
                        <Input field="menu_list" disabled validate={{rule:/.+/,text:"请填写分组名，不能为空"}} data={data.menu_list?.join(",")}/>
                    </div>
                    <div className="col text-end">
                        <Button outline block onClick={()=>{
                            openMenuList()
                        }}>选择菜单</Button>
                    </div>
                </div>
                </InputStyle>
                
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