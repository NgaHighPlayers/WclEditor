import MomentUtils from '@date-io/moment';
import { Button } from '@material-ui/core';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import icon from '../assets/icon.svg';
import { logOption, openDialog } from './render';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const Hello = () => {
  const [initStartDatetime, setStartDatetime] = React.useState(
    moment('2000-01-11T00:00:00')
  );

  const [initEndDatetime, setEndDatetime] = React.useState(moment());
  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <MuiPickersUtilsProvider
          libInstance={moment}
          utils={MomentUtils}
          locale="zh-cn"
        >
          <DateTimePicker
            variant="inline"
            ampm={false}
            label="开始时间"
            value={initStartDatetime}
            onChange={(dt: moment.Moment | null) => {
              if (dt) {
                setStartDatetime(dt);
                logOption.start = dt;
              }
            }}
            disableFuture
            format="yyyy-MM-DD HH:mm:SS"
          />
          <DateTimePicker
            variant="inline"
            ampm={false}
            label="结束时间"
            value={initEndDatetime}
            onChange={(dt: moment.Moment | null) => {
              if (dt) {
                setEndDatetime(dt);
                logOption.start = dt;
              }
            }}
            disableFuture
            format="yyyy-MM-DD HH:mm:SS"
          />
        </MuiPickersUtilsProvider>
        <br />
        <Button variant="contained" color="primary" onClick={openDialog}>
          选择log
        </Button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
