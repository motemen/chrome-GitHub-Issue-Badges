import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List, Map, is } from 'immutable';

interface Config {
  origin: string;
  apiRoot: string;
  token: string;
  status: TokenStatus;
}

enum TokenStatus {
  unchecked, verified, failed
}

interface OptionProps {
  saveConfigs: (configs: List<Config>) => void;
  configs: List<Config>;
}

interface OptionState {
  configs: List<Config>;
}

class App extends React.PureComponent<OptionProps, OptionState> {
  constructor(props: OptionProps) {
    super(props);
    this.state = {
      configs: List(props.configs)
    };

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.saveConfigs = this.saveConfigs.bind(this);
    this.onOriginChanged = this.onOriginChanged.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
  }

  addItem() {
    let config: Config = { origin: '', apiRoot: '', token: '', status: TokenStatus.unchecked }
    this.setState(({configs}) => ({
      configs: configs.push(config)
    }));
  }

  removeItem(i: number) {
    this.setState(({configs}) => ({
      configs: configs.delete(i)
    }));
  }

  updateStatus(i: number) {
    const updateStatus = (config: Config, status: TokenStatus) => {
      const newConfig = Map(config)
        .update('status', s => status)
        .toJS();
      this.setState(({configs}) => ({
        configs: configs.set(i, newConfig),
      }));
    };

    const config = this.state.configs.get(i);
    if (config === undefined && config.apiRoot === undefined) {
      updateStatus(config, TokenStatus.unchecked);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", config.apiRoot);
    xhr.setRequestHeader("Authorization", `token ${config.token}`)
    xhr.onload  = function(e) {
      updateStatus(config, TokenStatus.verified);
    }
    xhr.onerror = function(e) {
      updateStatus(config, TokenStatus.failed);
    }
    xhr.send();
  }

  saveConfigs() {
    this.props.saveConfigs(this.state.configs);
  }

  onOriginChanged(config: Config, i: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      const origin = event.target.value;
      const newConfig = Map(config)
        .update('origin', o => origin)
        .update('apiRoot', a => (origin === 'https://github.com') ? 'https://api.github.com' : (origin + '/api/v3'))
        .toJS();
      this.setState(({configs}) => ({
        configs: configs.set(i, newConfig),
      }));
    }
  }

  onTokenChanged(config: Config, i: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      const config = this.state.configs.get(i);
      const newConfig = Map(config)
        .update('token', t => event.target.value)
        .toJS();
      this.setState(({configs}) => ({
        configs: configs.set(i, newConfig),
      }));
    }
  }

  render() {
    const configs = this.state.configs;
    return <div>
      <h3>GitHub Enterprise</h3>
      <button type="button" onClick={this.addItem}>Add</button>
      <button type="button" onClick={this.saveConfigs}>Save</button>
      {
        configs.map((config, index) => {
          return <div key={index}>
            <button type="button" onClick={() => {this.removeItem(index)}}>remove</button>
            <ul>
              <li>origin  <input type="text" value={config.origin} onChange={this.onOriginChanged(config, index)} /></li>
              <li>api root<input type="text" value={config.apiRoot} disabled /></li>
              <li>token   <input type="text" value={config.token} onChange={this.onTokenChanged(config, index)} />
              <button type="button" onClick={() => {this.updateStatus(index)}}>connection test</button></li>
            </ul>
          </div>;
        })
      }
    </div>;
  }
}

function saveConfigs(configs: List<Config>) {
  localStorage.setItem('origins', JSON.stringify(configs));
}

function isConfig(config: any): config is Config {
  return config.origin !== undefined && config.apiRoot !== undefined && config.token !== undefined;
}

const origins: any[] = JSON.parse(localStorage.getItem('origins') || '[]');
const configs: Config[] = origins.reduce((acc: Config[], v: any) => {
  if (isConfig(v)) {
    acc.push(v);
  }
  return acc;
}, []);

ReactDOM.render(
  <App saveConfigs={saveConfigs} configs={List(configs)} />,
  document.getElementById('app')
);
