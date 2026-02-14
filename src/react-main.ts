import * as React from 'react';
import * as ReactDOM from 'react-dom';

const ReactRoot = (): React.ReactElement => {
    return React.createElement('div', null, React.createElement('p', null, 'Hello from React'));
};

const reactRootElement = document.getElementById('react-root');
if (reactRootElement) {
    ReactDOM.render(React.createElement(ReactRoot), reactRootElement);
}
