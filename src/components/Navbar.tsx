import { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleClose = () => setShowMobileMenu(false);
  const handleShow = () => setShowMobileMenu(true);

  return (
    <>
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
          
          {/* Десктопное меню */}
          <Nav className="ms-auto nav-menu d-none d-lg-flex">
            <LinkContainer to="/">
              <Nav.Link>Главная</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/symptoms">
              <Nav.Link>Симптомы</Nav.Link>
            </LinkContainer>
          </Nav>

          {/* Кнопка бургера для мобильных/планшетов */}
          <button
            className="mobile-menu-toggle d-lg-none"
            onClick={handleShow}
            aria-label="Открыть меню"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
        </Container>
      </BootstrapNavbar>

      {/* Мобильное меню (Offcanvas) */}
      <Offcanvas show={showMobileMenu} onHide={handleClose} placement="end" className="mobile-menu-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Меню</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="mobile-menu-body">
          <nav className="mobile-nav">
            <Link
              to="/"
              className="mobile-nav-item"
              onClick={handleClose}
            >
              <span className="mobile-nav-icon">🏠</span>
              <span className="mobile-nav-text">Главная</span>
            </Link>
            <Link
              to="/symptoms"
              className="mobile-nav-item"
              onClick={handleClose}
            >
              <span className="mobile-nav-icon">🩺</span>
              <span className="mobile-nav-text">Симптомы</span>
            </Link>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

