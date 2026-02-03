const React = require('react');

module.exports = new Proxy({}, {
    get: (target, prop) => {
        return (props) => React.createElement('div', { ...props, 'data-testid': `icon-${String(prop)}` });
    },
});
