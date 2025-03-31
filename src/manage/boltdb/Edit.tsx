import AceEditor from "react-ace";
import { Ace,Range,config } from "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";

import {StatusBar} from 'ace-builds/src-noconflict/ext-statusbar';
import { useEffect, useRef, useState } from "react";
import { Alerts, Button, CKModal, Common, GroupStyle, InputGroup, Modal, Switch, Theme } from "@clake/react-bootstrap4";
import '../../assets/css/editor.less'
import workerUrl from "ace-builds/src-noconflict/worker-json?url";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import { use } from "i18next";

config.setModuleUrl("ace/mode/json_worker", workerUrl);
interface Props {
    text?: string
    read?: boolean
    table: string
    id: number
}

export default function(props:Props) {
    const [read,setRead] = useState(props.read??true);
    const [full,setFull] = useState(false);
    const [content,setContent] = useState(props.text??'');
    const [wrap,setWrap] = useState(false)
    const editor = useRef<Ace.Editor>();
    const editLines =  useRef<number[]>([]);
    const main = useRef<HTMLDivElement>(null);
    // const content = useRef("");
    const modal = useRef<CKModal>(null)
    const alt = useRef<Alerts>(null)

    useEffect(()=>{
        setContent(props.text??'');
    },[props.text])

    function changeHandler(val:string,event:any) {
        const row = event.start.row as number;
        const session = editor.current?.session

        if (!editLines.current?.includes(row)) {
            session?.addGutterDecoration(row,"ed-gu-icon")
            // edit?.session.addFold("asdfasd")
            session?.addMarker(new Range(row, 0, row, 2000), "ed-mk-change-line", "fullLine", true);
            editLines.current?.push(row)
        }
        setContent(val)
    }

    function getHeight() {
        const h = document.documentElement.clientHeight
        return (h*.8) + "px"
    }

    function editorLoad(e:Ace.Editor) {
        editor.current = e;
        let statusbar = new StatusBar(e,document.getElementById("status_bar"))
    }

    function save() {
        let obj:any
        try {
            obj = JSON.parse(content)
        } catch(e) {
            modal.current?.alert("错误的JSON数据结构: "+e)
            return
        }
        if (obj.id !== props.id) {
            modal.current?.alert("请务修改数据ID")
            return
        }
        modal.current?.loading('保存数据中...')
        Fetch('/serv/bolt/save',{
            id:props.id,
            table: props.table,
            data: JSON.stringify(obj)
        },(res:Response)=>{
            modal.current?.close()
            if (res.status) {
                let list = editor.current?.session.getMarkers(true)
                console.log(list);
                Common.map(list,(item:Ace.MarkerLike,key:number)=>{
                    if (item.type === "fullLine") {
                        let row = item.range?.start.row as number
                        let session = editor.current?.session
                        session?.removeGutterDecoration(row,"ed-gu-icon")
                        session?.removeMarker(key)
                        editLines.current?.splice(editLines.current?.indexOf(row),1)
                    }
                })
                setContent(JSON.stringify(obj,null,2))
                alt.current?.show("保存成功")
            } else {
                modal.current?.alert('修改出错：'+res.msg)
            }
        })
    }

    function fullScreen() {
        setFull(!full)
        main.current?.classList.toggle("ace-full-screen")
    }

    return <div className="d-flex flex-column" ref={main}>
        <div className="d-flex border-bottom mb-2">
            <div>
                <Button size="sm" icon="save" theme={Theme.success} disabled={read} onClick={()=>{
                    save()
                }}>保存</Button>
            </div>
            <div className="ms-auto comm-form">
                <Button size="sm" icon={full?"compress":"expand"} onClick={fullScreen} outline>全屏</Button>
                <GroupStyle left='可编辑' size="sm">
                    <GroupStyle.Content>
                        <Switch size="sm" onChange={(val:boolean) => setRead(!val)} checked={!read} />
                    </GroupStyle.Content>
                </GroupStyle>
                <GroupStyle left='换行' size="sm">
                    <GroupStyle.Content>
                        <Switch size="sm" onChange={(val:boolean) => setWrap(val)} checked={wrap} />
                    </GroupStyle.Content>
                </GroupStyle>
            </div>
        </div>
        <AceEditor className="flex-grow-1" mode="json" theme="github_dark" name="bolt_edit" wrapEnabled={wrap} enableLiveAutocompletion enableBasicAutocompletion readOnly={read} value={content} width="100%" height={full?"100%":""} maxLines={full?0:30} onChange={changeHandler} 
            onLoad={editorLoad}
            editorProps={{$blockScrolling:true}}
            setOptions={{
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
                fontSize: 14,
                showPrintMargin: false,
            }}
        />
        <div className="ace-status-bar d-flex border-top">
            <div>
                {read?'只读':'可写'}
            </div>
            <div id="status_bar" className="ms-auto">

            </div>
        </div>
        <Modal ref={modal}/>
        <Alerts ref={alt} theme={Theme.light}/>
    </div>
}