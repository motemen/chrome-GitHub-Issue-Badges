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
  github: boolean;
}

interface OptionState {
  configs: List<Config>;
  newGithub: string;
}

function statusButton(status: TokenStatus): string {
  switch (status) {
    case TokenStatus.verified:  return 'verified';
    case TokenStatus.unchecked: return 'connection test';
    case TokenStatus.failed:    return 'failed';
  }
}

class App extends React.PureComponent<OptionProps, OptionState> {
  constructor(props: OptionProps) {
    super(props);
    this.state = {
      configs: List(props.configs),
      newGithub: ''
    };

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.saveConfigs = this.saveConfigs.bind(this);
    this.onAPIRootChanged = this.onAPIRootChanged.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
  }

  addItem() {
    const newGithub = this.state.newGithub;
    const apiRoot = (newGithub === 'https://github.com') ? 'https://api.github.com' : (newGithub + '/api/v3')
    if (this.state.configs.filter(({origin}) => (origin === newGithub)).isEmpty) {
      let config: Config = { origin: newGithub, apiRoot: apiRoot, token: '', status: TokenStatus.unchecked }
      this.setState(({configs}) => ({
        configs: configs.push(config),
        newGithub: '',
      }));
    }
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
      return;
    }
    if (config.token === '') {
      updateStatus(config, TokenStatus.unchecked);
      alert('please input your access token');
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", config.apiRoot);
    xhr.setRequestHeader("Authorization", `token ${config.token}`)
    xhr.onload = function(e) {
      updateStatus(config, xhr.status === 200 ? TokenStatus.verified : TokenStatus.failed);
    }
    xhr.onerror = function(e) {
      updateStatus(config, TokenStatus.failed);
    }
    xhr.send();
  }

  saveConfigs() {
    this.props.saveConfigs(this.state.configs);
  }

  onAPIRootChanged(config: Config, i: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      const origin = event.target.value;
      const newConfig = Map(config)
        .update('apiRoot', a => event.target.value)
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
    const github = this.props.github;
    const configs = this.state.configs;
    return <div>
      <h2>Access Token</h2>
      <button className="test-button" type="button" onClick={this.saveConfigs}>Save</button>
      { !github &&
        <form>
          <input
            type="text"
            placeholder="Input GitHub URL"
            value={this.state.newGithub}
            onChange={
              (e) => {
                const newValue = e.target.value;
                this.setState(({newGithub}) => ({newGithub: newValue,}))
              }
            }
            />
          <button className="test-button" type="button" onClick={this.addItem}>Add</button>
        </form>
      }
      {
        configs.map((config, index) => {
          return <section key={config.origin}>
            <h3>{config.origin}</h3>
            <table>
              <tr>
                <td>api root</td>
                <td><input type="text" value={config.apiRoot} disabled={github} onChange={this.onAPIRootChanged(config, index)} /></td>
              </tr>
              <tr>
                <td>token</td>
                <td><input type="text" value={config.token} onChange={this.onTokenChanged(config, index)} /></td>
                <td><button className="test-button" type="button" onClick={() => {this.updateStatus(index)}}>{statusButton(config.status)}</button></td>
              </tr>
            </table>
            { !github &&
              <button type="button" onClick={() => {this.removeItem(index)}}>remove</button>
            }
          </section>;
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
const configs: Config[] = origins.filter(isConfig);
const github: boolean = ((mode?: string) => {
  if (mode) {
    return mode == 'github';
  }
  return false;
})(localStorage.getItem('mode'));

ReactDOM.render(
  <App saveConfigs={saveConfigs} configs={List(configs)} github={github} />,
  document.getElementById('app')
);
