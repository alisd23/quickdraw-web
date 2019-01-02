import * as React from 'react';
import { StatelessComponent } from 'react';
import { Container } from 'semantic-ui-react';

import './Navbar.scss';

export const Navbar: StatelessComponent = () => (
  <div className="navbar">
    <Container className="navbar-container">
      <div className="navbar-content">
        <h1 className="navbar-title">Quickdraw</h1>
      </div>
    </Container>
  </div>
);
