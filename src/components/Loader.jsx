/**
 * 动态加载组件
 */
import React from 'react';
import PropTypes from "prop-types";
import {Load} from '@clake/react-bootstrap4';

export default class Loader extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            instance:null,
            noFound:false
        };
    }

    componentDidMount() {
        this.loadComponent(this.props.loadPath);
    }

    componentWillReceiveProps(nextProp) {
        if (this.props.loadPath !== nextProp.loadPath) {
            this.setState({
                instance:null,
                noFound:false,
                load_error:''
            },()=>{
                this.loadComponent(nextProp.loadPath);
            });
        }
    }

    loadComponent(loadPath) {
        let filePath = this.explainUrl(loadPath);
        this.props.import(filePath).then(component=>{
            if (typeof component === "string") {
                console.log(component);
                this.setState({
                    noFound:true,
                    load_error:component
                });
            } else {
                this.setState({
                    instance:component
                });
            }
        });
    }

    ucFirst(str) {
        let first = str[0].toUpperCase();
        return first+str.substr(1);
    }

    under2hump(str) {
        let arr = str.split('_');
        let hump = arr.map((item)=>{
            return this.ucFirst(item);
        });
        return hump.join('');
    }

    explainUrl(path) {
        let arr = path.split('/');
        arr.shift();
        let module = arr.pop();
        if (module === "") {
            module = 'Main';
        } else {
            module = this.under2hump(module)
        }
        let ext_path = arr.length > 0 ? '/' : '';
        return ext_path + arr.join('/') + "/" + module;
    }

    render() {
        if (this.state.instance) {
            return this.renderComponent()
        } else {
            return (
                <div className='text-center text-danger mt-5 mb-5'>
                    {this.state.noFound?<div>没有找到模块<br/>{this.state.load_error}</div>:<Load>模块加载中</Load>}
                </div>
            );
        }
    }

    renderComponent() {
        let Instance = this.state.instance;
        return <Instance {...this.props}/>;
    }
}

Loader.propTypes = {
    loadPath: PropTypes.string,
    import: PropTypes.func,
};

Loader.defaultProps = {
    loadPath:""
};