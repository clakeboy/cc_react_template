/**
 * Created by clakeboy on 2017/12/3.
 */
import '@babel/polyfill';
import {render} from 'react-dom';

import routers from './routers';

render(routers,document.getElementById('react-main'));
if (module.hot) {
    module.hot.accept();
}