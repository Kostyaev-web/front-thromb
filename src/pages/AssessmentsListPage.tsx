import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Form, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getAssessmentsList, setFilters, completeAssessment } from '../store/assessmentsSlice';
import { RootState, AppDispatch } from '../store/store';
import { StatusEnum, RiskLevelEnum } from '../api/Api';
import './AssessmentsListPage.css';

export function AssessmentsListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { assessmentsList, loading, error, filters, count, hasNext, hasPrevious } = useSelector(
    (state: RootState) => state.assessments
  );
  const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  
  // Ждем загрузки пользователя перед проверкой прав модератора
  const isReady = !authLoading;
  // isModerator вычисляется только после загрузки пользователя
  const isModerator = isReady && user?.is_staff === true;
  
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: number; action: 'complete' | 'reject' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Загрузка заявок
  const fetchAssessments = useCallback(() => {
    dispatch(getAssessmentsList(filters));
  }, [dispatch, filters]);

  // Загружаем заявки при изменении фильтров (только после загрузки пользователя)
  useEffect(() => {
    if (isReady) {
      fetchAssessments();
    }
  }, [fetchAssessments, isReady]);

  // Short polling каждые 5 секунд (только после загрузки пользователя)
  useEffect(() => {
    if (!isReady) return;
    
    const intervalId = setInterval(() => {
      fetchAssessments();
    }, 5000); // 5 секунд

    return () => clearInterval(intervalId);
  }, [fetchAssessments, isReady]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value || undefined;
    dispatch(setFilters({ ...filters, status, page: 1 }));
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date_from = e.target.value || undefined;
    dispatch(setFilters({ ...filters, date_from, page: 1 }));
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date_to = e.target.value || undefined;
    dispatch(setFilters({ ...filters, date_to, page: 1 }));
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ ...filters, page }));
  };

  // Фронтенд фильтрация по создателю (пациенту)
  const filteredAssessments = assessmentsList.filter((assessment) => {
    if (!patientSearch) return true;
    return assessment.patient_username.toLowerCase().includes(patientSearch.toLowerCase());
  });

  const handleComplete = (assessmentId: number) => {
    setSelectedAssessment({ id: assessmentId, action: 'complete' });
    setShowConfirmModal(true);
  };

  const handleReject = (assessmentId: number) => {
    setSelectedAssessment({ id: assessmentId, action: 'reject' });
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedAssessment) return;
    try {
      await dispatch(completeAssessment({
        assessmentId: selectedAssessment.id,
        action: selectedAssessment.action
      })).unwrap();
      setShowConfirmModal(false);
      setSelectedAssessment(null);
      // Обновляем список после действия
      fetchAssessments();
    } catch (error) {
      console.error('Ошибка выполнения действия:', error);
    }
  };

  const getStatusBadge = (status?: StatusEnum) => {
    switch (status) {
      case StatusEnum.Draft:
        return <Badge bg="secondary">Черновик</Badge>;
      case StatusEnum.Formed:
        return <Badge bg="info">Сформирован</Badge>;
      case StatusEnum.Completed:
        return <Badge bg="success">Завершен</Badge>;
      case StatusEnum.Rejected:
        return <Badge bg="danger">Отклонен</Badge>;
      case StatusEnum.Deleted:
        return <Badge bg="dark">Удален</Badge>;
      default:
        return <Badge bg="secondary">Неизвестно</Badge>;
    }
  };

  const getRiskLevelBadge = (riskLevel?: RiskLevelEnum | string | null) => {
    if (!riskLevel) return null;
    switch (riskLevel) {
      case RiskLevelEnum.Low:
      case 'low':
        return <Badge bg="success" className="ms-2">Низкий</Badge>;
      case RiskLevelEnum.Moderate:
      case 'moderate':
        return <Badge bg="warning" className="ms-2">Умеренный</Badge>;
      case RiskLevelEnum.High:
      case 'high':
        return <Badge bg="danger" className="ms-2">Высокий</Badge>;
      default:
        return null;
    }
  };

  // Форматирование даты (только дата, без времени)
  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const currentPage = filters.page || 1;

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Оценки' }
      ]} />
      <Container className="assessments-list-container">
        <div className="assessments-header">
          <h1>{isModerator ? 'Управление оценками' : 'Мои оценки'}</h1>
          <p className="text-muted">{isModerator ? 'Интерфейс модератора для управления оценками риска ТГВ/ТЭЛА' : 'Список всех оценок риска ТГВ/ТЭЛА'}</p>
        </div>

        {error && (
          <Alert variant="danger" dismissible>
            {error}
          </Alert>
        )}

        <div className="filters-section">
          <Form.Group className="mb-3">
            <Form.Label>Фильтр по статусу</Form.Label>
            <Form.Select
              value={filters.status || ''}
              onChange={handleStatusFilterChange}
            >
              <option value="">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="formed">Сформирован</option>
              <option value="completed">Завершен</option>
              <option value="rejected">Отклонен</option>
            </Form.Select>
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-4">
              <Form.Label>Дата формирования от</Form.Label>
              <Form.Control
                type="date"
                value={filters.date_from || ''}
                onChange={handleDateFromChange}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-4">
              <Form.Label>Дата формирования до</Form.Label>
              <Form.Control
                type="date"
                value={filters.date_to || ''}
                onChange={handleDateToChange}
              />
            </Form.Group>

            {isModerator && (
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Поиск по создателю</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                />
              </Form.Group>
            )}
          </div>
        </div>

        {(loading || !isReady) ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {filteredAssessments.length === 0 ? (
              <Alert variant="info">
                Заявки не найдены
              </Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover className="assessments-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        {isModerator && <th>Создатель</th>}
                        <th>Тема</th>
                        <th>Статус</th>
                        {isModerator && <th>Уровень риска</th>}
                        <th>Баллы</th>
                        <th>Дата формирования</th>
                        {isModerator && <th>Дата завершения</th>}
                        {isModerator && <th>Модератор</th>}
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td>{assessment.id}</td>
                          {isModerator && <td>{assessment.patient_username}</td>}
                          <td>{assessment.topic || '-'}</td>
                          <td>{getStatusBadge(assessment.status)}</td>
                          {isModerator && <td>{getRiskLevelBadge(assessment.risk_level) || '-'}</td>}
                          <td>{assessment.total_score}</td>
                          <td>{formatDateOnly(assessment.formation_date)}</td>
                          {isModerator && <td>{formatDateOnly(assessment.completion_date)}</td>}
                          {isModerator && <td>{assessment.moderator_username || '-'}</td>}
                          <td>
                            <div className="action-buttons">
                              {isModerator && assessment.status === StatusEnum.Formed ? (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleComplete(assessment.id)}
                                  >
                                    Завершить
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReject(assessment.id)}
                                  >
                                    Отклонить
                                  </Button>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/deep-vein-thrombosis/${assessment.id}`)}
                                  >
                                    Открыть
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/deep-vein-thrombosis/${assessment.id}`)}
                                >
                                  Открыть
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {count > 0 && (
                  <div className="pagination-section">
                    <div className="pagination-info">
                      Показано {filteredAssessments.length} из {count} заявок
                    </div>
                    <div className="pagination-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={!hasPrevious || loading}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Предыдущая
                      </Button>
                      <span className="page-number">Страница {currentPage}</span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={!hasNext || loading}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Следующая
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Container>

      {/* Модальное окно подтверждения (только для модераторов) */}
      {isModerator && (
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Подтверждение действия</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы уверены, что хотите {selectedAssessment?.action === 'complete' ? 'завершить' : 'отклонить'} эту заявку?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Отмена
            </Button>
            <Button
              variant={selectedAssessment?.action === 'complete' ? 'success' : 'danger'}
              onClick={confirmAction}
            >
              {selectedAssessment?.action === 'complete' ? 'Завершить' : 'Отклонить'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

