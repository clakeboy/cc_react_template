/**
 * Created by clakeboy on 2020/9/11.
 */

import React from 'react';
import {Card} from '@clake/react-bootstrap4';


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.props.setTitle('首页');
    }

    render() {
        return (
            <Card title='Header'>
                欢迎回来
            </Card>
        );
    }
}

export default Main;