import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Navbar.css';

export function Navbar() {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="custom-navbar" sticky="top">
      <Container fluid className="nav-wrapper">
        <LinkContainer to="/">
          <BootstrapNavbar.Brand className="header-title">
            <div className="logo-section">
              <div className="logo-icon">
                <span style={{ fontSize: '24px' }}>🩺</span>
              </div>
              <div className="title-group">
                <h1>Wells Method</h1>
                <div className="subtitle">Оценка риска ТГВ/ТЭЛА</div>
              </div>
            </div>
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto nav-menu">
            <LinkContainer to="/">
              <Nav.Link>Главная</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/symptoms">
              <Nav.Link>Симптомы</Nav.Link>
            </LinkContainer>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

