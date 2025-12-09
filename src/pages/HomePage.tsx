import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <>
      <div className="home-hero">
        <Container>
          <div className="hero-content">
            <div className="hero-icon">🩺</div>
            <h1 className="hero-title">Оценка риска тромбоэмболических осложнений</h1>
            <p className="hero-subtitle">Шкала Уэллса для диагностики ТГВ и ТЭЛА</p>
            <Link to="/symptoms" className="hero-button">
              Начать оценку
            </Link>
          </div>
        </Container>
      </div>

      <Container className="home-container">
        <div className="features-section">
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card">
                <div className="feature-icon">📊</div>
                <Card.Body>
                  <Card.Title>Клиническая оценка</Card.Title>
                  <Card.Text>
                    Систематический подход к оценке риска тромбоза глубоких вен 
                    и тромбоэмболии легочной артерии на основе клинических симптомов.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <div className="feature-icon">⚡</div>
                <Card.Body>
                  <Card.Title>Быстрая диагностика</Card.Title>
                  <Card.Text>
                    Мгновенный расчет баллов риска для принятия обоснованных 
                    решений о необходимости дополнительных исследований.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <div className="feature-icon">🎯</div>
                <Card.Body>
                  <Card.Title>Точные результаты</Card.Title>
                  <Card.Text>
                    Проверенная временем методика, широко используемая 
                    в клинической практике по всему миру.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="description-section">
          <Row>
            <Col lg={6}>
              <div className="info-block">
                <div className="info-icon">🔬</div>
                <h2>О методе</h2>
                <p>
                  Шкала Уэллса (Wells Score) — это клинический инструмент для оценки вероятности 
                  тромбоза глубоких вен (ТГВ) или тромбоэмболии легочной артерии (ТЭЛА). 
                  Метод основан на анализе клинических симптомов и факторов риска пациента.
                </p>
              </div>
            </Col>
            <Col lg={6}>
              <div className="info-block">
                <div className="info-icon">📋</div>
                <h2>Клинические симптомы</h2>
                <p>
                  Система оценки включает следующие категории симптомов и факторов риска:
                </p>
                <ul className="styled-list">
                  <li><strong>Клинические симптомы ТГВ</strong> — боль и отек в области нижних конечностей</li>
                  <li><strong>Клинические симптомы ТЭЛА</strong> — кровохарканье, тахикардия, одышка</li>
                  <li><strong>Факторы риска</strong> — иммобилизация, операция, онкология</li>
                  <li><strong>Диагностические критерии</strong> — вероятность альтернативного диагноза</li>
                </ul>
              </div>
            </Col>
          </Row>
        </div>

        <div className="risk-levels-section">
          <h2 className="section-title">Интерпретация результатов</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="risk-card risk-low">
                <div className="risk-icon">✅</div>
                <h3>Низкий риск</h3>
                <div className="risk-value">менее 5%</div>
                <p>Вероятность ТГВ/ТЭЛА минимальна</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="risk-card risk-moderate">
                <div className="risk-icon">⚠️</div>
                <h3>Умеренный риск</h3>
                <div className="risk-value">5-20%</div>
                <p>Требуется дополнительное обследование</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="risk-card risk-high">
                <div className="risk-icon">🚨</div>
                <h3>Высокий риск</h3>
                <div className="risk-value">более 20%</div>
                <p>Необходимы срочные диагностические исследования</p>
              </div>
            </Col>
          </Row>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Готовы начать?</h2>
            <p>Ознакомьтесь со всеми доступными симптомами и факторами риска</p>
            <Link to="/symptoms" className="cta-button">
              Перейти к симптомам →
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
