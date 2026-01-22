import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar as BootstrapNavbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../store/authSlice';
import { clearDraft, getAssessmentsList, getAssessmentDetail } from '../store/assessmentsSlice';
import { resetFilters } from '../store/filtersSlice';
import { logout } from '../api/auth';
import { RootState, AppDispatch } from '../store/store';
import './Navbar.css';

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user, authToken } = useSelector((state: RootState) => state.auth);
  const { assessmentsList, currentDraft } = useSelector((state: RootState) => state.assessments);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Используем currentDraft если есть, иначе ищем в списке
  const draft = currentDraft || assessmentsList.find((a) => a.status === 'draft');
  const draftSymptomsCount = draft && 'assessment_symptoms' in draft 
    ? (draft as any).assessment_symptoms?.length || 0 
    : 0;

  useEffect(() => {
    // Загружаем список заявок при авторизации для поиска черновика
    // Загружаем только если нет текущего черновика и пользователь авторизован
    if (isAuthenticated && !currentDraft && assessmentsList.length === 0) {
      dispatch(getAssessmentsList({ status: 'draft' })).then((result: any) => {
        // После получения списка, если нашли черновик, загружаем его детали
        if (result.type === 'assessments/getAssessmentsList/fulfilled' && result.payload?.results?.length > 0) {
          const foundDraft = result.payload.results.find((a: any) => a.status === 'draft');
          if (foundDraft) {
            dispatch(getAssessmentDetail(foundDraft.id));
          }
        }
      }).catch(() => {
        // Игнорируем ошибки загрузки черновика
      });
    }
  }, [dispatch, isAuthenticated]); // Не добавляем currentDraft и assessmentsList, чтобы избежать циклов

  const handleClose = () => setShowMobileMenu(false);
  const handleShow = () => setShowMobileMenu(true);

  const handleLogout = async () => {
    try {
      // Используем токен из Redux state
      await logout(authToken || undefined);
      dispatch(logoutAction());
      dispatch(clearDraft());
      dispatch(resetFilters());
      navigate('/');
      handleClose();
    } catch (error) {
      console.error('Ошибка выхода:', error);
      // Всё равно очищаем состояние
      dispatch(logoutAction());
      dispatch(clearDraft());
      dispatch(resetFilters());
    }
  };

  const handleDraftClick = () => {
    if (draft) {
      navigate(`/deep-vein-thrombosis/${draft.id}`);
    }
    handleClose();
  };

  const displayName = user?.first_name 
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` 
    : user?.username || 'Пользователь';

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
            
            {isAuthenticated ? (
              <>
                <LinkContainer to="/deep-vein-thrombosis">
                  <Nav.Link>Оценки</Nav.Link>
                </LinkContainer>
                <div className="navbar-divider"></div>
                <LinkContainer to="/profile">
                  <Nav.Link className="profile-link">{displayName}</Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={handleLogout}>Выход</Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Вход</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Регистрация</Nav.Link>
                </LinkContainer>
              </>
            )}
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
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/deep-vein-thrombosis"
                  className="mobile-nav-item"
                  onClick={handleClose}
                >
                  <span className="mobile-nav-icon">📋</span>
                  <span className="mobile-nav-text">Заявки</span>
                </Link>
                <div className="mobile-nav-divider"></div>
                <Link
                  to="/profile"
                  className="mobile-nav-item profile-mobile-link"
                  onClick={handleClose}
                >
                  <span className="mobile-nav-icon">👤</span>
                  <span className="mobile-nav-text">{displayName}</span>
                </Link>
                <Button
                  variant="link"
                  className="mobile-nav-item text-danger"
                  onClick={handleLogout}
                >
                  <span className="mobile-nav-icon">🚪</span>
                  <span className="mobile-nav-text">Выход</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-nav-item"
                  onClick={handleClose}
                >
                  <span className="mobile-nav-icon">🔐</span>
                  <span className="mobile-nav-text">Вход</span>
                </Link>
                <Link
                  to="/register"
                  className="mobile-nav-item"
                  onClick={handleClose}
                >
                  <span className="mobile-nav-icon">📝</span>
                  <span className="mobile-nav-text">Регистрация</span>
                </Link>
              </>
            )}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
