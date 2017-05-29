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

const TokenStatusButton: React.StatelessComponent<{status: TokenStatus} & React.HTMLProps<HTMLButtonElement>> = (props) => {
  const {status, ...otherProps} = props;
  const text = ((status) => {
    switch (status) {
      case TokenStatus.verified:  return 'verified';
      case TokenStatus.unchecked: return 'connection test';
      case TokenStatus.failed:    return 'failed';
    }
  })(status);
  return <button {...otherProps}>{text}</button>;
}

class App extends React.PureComponent<OptionProps, OptionState> {
  constructor(props: OptionProps) {
    super(props);
    this.state = {
      configs: List(props.configs),
      newGithub: ''
    };
  }

  addItem = () => {
    const newGithub = this.state.newGithub;
    if (newGithub !== '' && this.state.configs.filter(({origin}) => (origin === newGithub)).isEmpty) {
      const apiRoot = (newGithub === 'https://github.com') ? 'https://api.github.com' : (newGithub + '/api/v3')
      const config: Config = { origin: newGithub, apiRoot: apiRoot, token: '', status: TokenStatus.unchecked }
      this.setState(({configs}) => ({
        configs: configs.push(config),
        newGithub: '',
      }));
    }
  }

  removeItem = (i: number) => {
    this.setState(({configs}) => ({
      configs: configs.delete(i)
    }));
  }

  updateTokenStatus = (i: number) => {
    const updateTokenStatus = (config: Config, status: TokenStatus) => {
      const newConfig = Map(config)
        .update('status', s => status)
        .toJS();
      this.setState(({configs}) => ({
        configs: configs.set(i, newConfig),
      }));
    };

    const config = this.state.configs.get(i);
    if (config === undefined || config.apiRoot === undefined) {
      updateTokenStatus(config, TokenStatus.unchecked);
      return;
    }
    if (config.token === '') {
      updateTokenStatus(config, TokenStatus.unchecked);
      alert('please input your access token');
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", config.apiRoot);
    xhr.setRequestHeader("Authorization", `token ${config.token}`)
    xhr.onload = function(e) {
      updateTokenStatus(config, xhr.status === 200 ? TokenStatus.verified : TokenStatus.failed);
    }
    xhr.onerror = function(e) {
      updateTokenStatus(config, TokenStatus.failed);
    }
    xhr.send();
  }

  saveConfigs = () => {
    this.props.saveConfigs(this.state.configs);
  }

  onConfigChanged = (i: number, key: string): (event: React.ChangeEvent<HTMLInputElement>) => void => {
     return (event) => {
       const value = event.target.value;
       this.setState(({configs}) => ({
         configs: configs.update(i, (config) => Map(config).update(key, a => value).toJS()),
       }));
     };
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
              <tbody>
                <tr>
                  <td>api root</td>
                  <td><input type="text" value={config.apiRoot} disabled={github} onChange={this.onConfigChanged(index, 'apiRoot')} /></td>
                </tr>
                <tr>
                  <td>token</td>
                  <td><input type="text" value={config.token} onChange={this.onConfigChanged(index, 'token')} /></td>
                  <td><TokenStatusButton className="test-button" type="button" onClick={() => {this.updateTokenStatus(index)}} status={config.status} /></td>
                </tr>
              </tbody>
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
const github: boolean = localStorage.getItem('mode') === 'github';

ReactDOM.render(
  <App saveConfigs={saveConfigs} configs={List(configs)} github={github} />,
  document.getElementById('app')
);
