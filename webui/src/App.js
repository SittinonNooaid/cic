import React, { Component } from 'react';
import T from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, LocaleProvider, Spin } from 'antd';

import _ from 'lodash';

import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';

import enUS from 'antd/lib/locale-provider/en_US';

import 'antd/dist/antd.css';
import './App.css';

import * as Actions from './actions/application';

import AppHeader from './containers/AppHeader';
import HomeContainer from './containers/Home';
import WelcomeContainer from './containers/Welcome';
import SpaceContainer from './containers/Space';

import { getUserOrganizationsWithSpaces } from './selectors';

import AuthService from './modules/auth/AuthService';

import CICJS from './modules/cic';

const { Content } = Layout;

const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;
const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN;
const auth = new AuthService(AUTH0_CLIENT_ID, AUTH0_DOMAIN);


const accessToken = localStorage.getItem('access_token');
export const cic = new CICJS();
cic.createClient({
  secure: false,
  host: 'localhost:4000/v1',
  accessToken,
});
// cic.getSpace('59253f8b2e3e702664a7306c');

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  return (
    <Route
      {...rest}
      render={
        props => (
        auth.loggedIn() ? (
          <RouteComponent {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: _.get(props, 'location') } }} />
        )
      )}
    />
  );
};

PrivateRoute.propTypes = {
  component: T.node,
};

PrivateRoute.defaultProps = {
  component: Spin,
};

const mapStateToProps = (state) => {
  const userOrganizations = getUserOrganizationsWithSpaces(state);
  return {
    userOrganizations,
  };
};

const appActions = {
  initWithUser: Actions.initWithUser,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(appActions, dispatch),
});

class App extends Component {

  static propTypes = {
    userOrganizations: T.array,
    actions: T.shape({
      initWithUser: T.func.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    userOrganizations: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      userProfile: auth.getProfile(),
    };

    // On Login Success
    auth.on('login_success', (authResult) => {
      console.log('Login success', authResult);
    });

    // On Receive Profile
    auth.on('profile_updated', (newProfile) => {
      this.setState({ userProfile: newProfile });

      const { actions } = this.props;
      actions.initWithUser(newProfile.sub);
    });

    // On Logout Success
    auth.on('logout_success', () => {
      this.setState({ userProfile: undefined });
    });
  }

  componentDidMount() {
    const { actions } = this.props;
    if (!_.isEmpty(_.get(this.state, 'userProfile.sub'))) {
      actions.initWithUser(this.state.userProfile.sub, auth);
    }
  }

  handleLogin = () => {
    auth.login();
  }

  handleLogout = () => {
    auth.logout();
  }

  render() {
    const { userOrganizations } = this.props;
    const { userProfile } = this.state;
    return (
      <LocaleProvider locale={enUS}>
        <Router>
          <Layout>
            <AppHeader
              userProfile={userProfile}
              userOrganizations={userOrganizations}
              onLogin={this.handleLogin}
              onLogout={this.handleLogout}
            />
            <Content>
              <Route key="home" path="/" exact render={routeProps => <HomeContainer {...routeProps} auth={auth} />} />
              <PrivateRoute key="welcome" path="/welcome" exact component={WelcomeContainer} />
              <PrivateRoute
                key="space"
                path="/spaces/:spaceId"
                component={SpaceContainer}
              />
            </Content>
          </Layout>
        </Router>
      </LocaleProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
