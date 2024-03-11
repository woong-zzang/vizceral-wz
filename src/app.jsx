import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import WebFont from 'webfontloader';

import './app.css';
import TrafficFlow from './components/trafficFlow';

// trafficFlow.jsx 에 넘겨줄 값 정의
const updateURL = String('http://localhost:3000/nginx');
const interval = Number('10000');
const maxReplayOffset = Number('42000');

function fontsActive () {
  ReactDOM.render(
    <TrafficFlow src={updateURL} interval={interval} maxReplayOffset={maxReplayOffset} />,
    document.getElementById('traffic')
  );
}

// Only load the app once we have the webfonts.
// This is necessary since we use the fonts for drawing on Canvas'...

// imports are loaded and elements have been registered

WebFont.load({
  custom: {
    families: ['Source Sans Pro:n3,n4,n6,n7'],
    urls: ['/fonts/source-sans-pro.css']
  },
  active: fontsActive
});
