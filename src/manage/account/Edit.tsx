import { Button, CDropdown, CDropdownValue, CKModal, Dropdown, Form, Input, InputStyle, Modal, Switch } from "@clake/react-bootstrap4";
import { useEffect, useRef, useState } from "react";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import dayjs from "dayjs";

interface Data {
    id?:number
    name?: string
    passwd?: string
    group_id?: number
    group_name?: string
    phone?: string
    manage?:number
    created_date?:number
    modified_date?:number
}

interface Props {
    id?:number
    callback?:()=>void
    parent?: CKModal
    random?:string
}

export default function Edit({id,callback,parent,random}:Props):any {
    const [data,setData] = useState<Data>({})
    const [edit,setEdit] = useState(false)
    const [groupList,setGroupList] = useState<any[]>([])
    let modal = useRef<CKModal>(null);
    let form = useRef<Form>(null);
    useEffect(()=>{
        if (id !== undefined) {
            modal.current?.loading("加载中...")
            Fetch('/serv/acc/find',{id:id},(res:Response)=>{
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
    },[id,random])

    useEffect(()=>{
        Fetch("/serv/group/query",{number:100,page:1},(resp:Response)=>{
            if (resp.status) {
                setGroupList(resp.data.list)
            } else {
                modal.current?.alert('加载分组出错：'+resp.msg)
            }
        })
    },[])

    function changeHandler(field:any,val:any,row:any) {
        if (field === 'group_id') {
            setData({...data,'group_id':row,'group_name':val})
            return    
        }
        setData({...data,[field]:val})
    }

    function saveData() {
        if (!form.current?.check()) {
            modal.current?.alert('请完成必要的数据填写')
            return
        }
        modal.current?.loading('保存数据中...')
        Fetch('/serv/acc/save',{data:data},(res:Response)=>{
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
                <div className="row g-1">
                    <div className="col-8">
                        <Input label="用户名" field="name" disabled={edit} validate={{rule:/.+/,text:"请填写用户名，不能为空"}} data={data.name}/>
                    </div>
                    <div className="col">
                        <CDropdown label="分组" field="group_id" text={data.group_name} value={data.group_id} validate={{rule:/.+/,text:"选择分组"}}>
                            {groupList.map((item)=>{
                                return <CDropdownValue text={item.name} value={item.id} key={item.id} active={item.id === data.group_id}/>
                            })}
                        </CDropdown>
                    </div>
                </div>
                <Input label="密码" validate={!edit?{rule:/.+/,text:"请填写密码，不能为空"}:undefined} placeholder={edit?"为空就不修改密码":'请填写登录密码'} field="passwd" type="password" data={data.passwd}/>
                <Input label="手机号" placeholder="填写联系人手机号" field="passwd" data={data.phone}/>
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