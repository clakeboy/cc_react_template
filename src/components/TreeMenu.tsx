/**
 * Created by clakeboy on 2018/6/28.
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import '../assets/css/TreeMenu.less';
import { Icon, Scroll, Common } from '@clake/react-bootstrap4';

export interface Menu {
    name?: string
    icon?: string
    text: string
    link?: string
    step?: boolean
    children?: Menu[]
}

interface Props {
    data: any;
    className?: string;
    onClick?: (item: any) => void;
}

interface State {
    data: any;
    current?: any;
    child?: any;
}

class TreeMenu extends React.PureComponent<Props, State> {
    domId: string;
    main_dom: HTMLElement;
    subMenuId: any;
    constructor(props: any) {
        super(props);
        this.state = {
            data: this.props.data,
        };

        this.domId = 'tree-menu-' + Common.RandomString(16);
    }

    componentDidMount() {
        let list = document.querySelectorAll('.ck-tree-menu>.children')
        list.forEach((elm)=>{
            let height = this.getHeight(elm as HTMLElement);
            (elm as HTMLElement).dataset['height'] = height
        })
    }

    UNSAFE_componentWillReceiveProps(nextProp: Props) {
        if (this.state.data !== nextProp.data) {
            this.setState({
                data: nextProp.data,
            });
        }
    }

    getClasses() {
        let base = 'ck-tree-menu';

        return classNames(base, this.props.className);
    }

    getHeight(dom:HTMLElement):string {
        dom.style.height = "unset"
        let height = getComputedStyle(dom).height
        dom.style.height = "0"
        return height
    }
    
    openHandler = (e: React.MouseEvent) => {
        if (e.currentTarget.nextElementSibling) {
            const dom = e.currentTarget
            const children = e.currentTarget.nextElementSibling as HTMLElement
            let status = children.dataset['status']
            let height = children.dataset['height']
            if (!height) {
                height = this.getHeight(children)
                children.dataset['height'] = height
            }
            if (status && status === 'open') {
                children.style.height = '0'
                children.dataset['status'] = 'close'
                dom.classList.remove('children-open')
            } else {
                children.style.height = height
                children.dataset['status'] = 'open'
                dom.classList.add('children-open')
            }
        }
        // e.currentTarget.nextElementSibling?.classList.toggle('children-open')
    };

    clickHandler(item:Menu,child?:Menu) {
        return (e: React.MouseEvent) => {
            this.setState({
                current:item,
                child:child
            },()=>{
                if (typeof this.props.onClick === 'function') {
                    this.props.onClick(child || item);
                }
            })
        };
    }

    render() {
        if (this.state.data === undefined || this.state.data === null || this.state.data.length < 1) {
            return '';
        }
        return (
            <>
                <div id={this.domId} className={this.getClasses()}>
                    {this.state.data.map((item:Menu,idx:number)=>{
                        if (item.step) {
                            return <div key={idx} className='divider'>{item.text}</div>
                        }

                        let className = 'menu-item d-flex align-items-center justify-content-center'
                        if (item.children) {
                            className += ' parent'
                        }

                        if (this.state.current === item) {
                            className += ' active children-open'
                        }
                        return <>
                            <div key={idx} className={className} onClick={item.children?this.openHandler:this.clickHandler(item)}>
                                <div className='icon'><Icon icon={item.icon}/></div>
                                <div className='text flex-grow-1'>{item.text} <span/></div>
                            </div>
                            {item.children&&<div className='children'>
                                {item.children?.map((child:Menu,childIdx)=>{
                                    let active = this.state.child === child?' active':''
                                    return <div className={'text'+active} key={childIdx} onClick={this.clickHandler(item,child)}>{child.text}</div>
                                })}
                            </div>}
                        </>
                    })}
                </div>
                <Scroll selector={`#${this.domId}`} />
            </>
        );
    }
}

export default TreeMenu;
