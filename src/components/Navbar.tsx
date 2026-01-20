import { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { isTauri } from '../config/api';
import './Navbar.css';

export function Navbar() {
  const isGuestMode = isTauri;
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const handleClose = () => setShowMenu(false);
  const handleShow = () => setShowMenu(true);

  const menuItems = [
    { path: '/', label: 'Главная' },
    { path: '/symptoms', label: 'Симптомы' },
  ];

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
          <BootstrapNavbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
            <Nav className="ms-auto nav-menu">
              {menuItems.map((item) => (
                <LinkContainer key={item.path} to={item.path}>
                  <Nav.Link className={location.pathname === item.path ? 'active' : ''}>
                    {item.label}
                  </Nav.Link>
                </LinkContainer>
              ))}
              {/* В Tauri режиме скрываем элементы авторизации/редактирования */}
              {!isGuestMode && (
                <>
                  {/* Здесь могут быть элементы авторизации/редактирования в будущем */}
                </>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>

          {/* Кнопка бургер-меню для мобильных */}
          <BootstrapNavbar.Toggle 
            aria-controls="mobile-navbar-menu" 
            onClick={handleShow}
            className="d-lg-none"
          />
        </Container>
      </BootstrapNavbar>

      {/* Мобильное меню (Offcanvas) */}
      <Offcanvas 
        show={showMenu} 
        onHide={handleClose} 
        placement="end"
        className="mobile-menu-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Меню</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mobile-nav-menu">
            {menuItems.map((item) => (
              <LinkContainer 
                key={item.path} 
                to={item.path}
                onClick={handleClose}
              >
                <Nav.Link 
                  className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Nav.Link>
              </LinkContainer>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

