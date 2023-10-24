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

    componentDidMount() {}

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
    
    openHandler = (e: React.MouseEvent) => {
        clearTimeout(this.subMenuId)
        e.currentTarget.classList.toggle('open');
        if (e.currentTarget.parentNode) {
            const sub = e.currentTarget.parentNode.querySelector('.sub-menu') as HTMLElement
            if (sub.classList.contains('hide-menu')) {
                sub.classList.remove('hide-menu')
                sub.style.padding = '10px 0';
                sub.style.maxHeight = '500px';
                setTimeout(() => {
                    sub.style.maxHeight = sub.clientHeight+'px'
                },300)
            } else {
                // sub.dataset.hg = sub.clientHeight+'px'
                sub.style.maxHeight = "0"
                sub.style.padding = '0';
                sub.classList.add('hide-menu')
            }
            // $(e.currentTarget.parentNode.querySelector('.sub-menu') as HTMLElement).slideToggle(200);
        }
        // e.currentTarget.parentNode.querySelector('.sub-menu').classList.toggle('show');
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
                            className += ' active'
                        }
                        return <>
                            <div key={idx} className={className} onClick={this.clickHandler(item)}>
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
