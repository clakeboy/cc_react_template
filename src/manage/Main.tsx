import React from 'react';
import classNames from 'classnames';
import { Card } from '@clake/react-bootstrap4';

interface Props extends React.HTMLProps<any>{
    
}

interface State {
    val: string
}

export class Main extends React.Component<Props, State> {

    public static defaultProps:any = {
        
    };

    constructor(props?: any) {
        super(props);

        this.state = {
            val: 'default',
        }
    }

    getClasses() : string {
        let base = 'main'
        return classNames(base, this.props.className);
    }

    render(): any {
        return (
            <div className={this.getClasses()}>
                <Card header="这是主页">
                    
                </Card>
            </div>
        );
    }
}

export default Main;