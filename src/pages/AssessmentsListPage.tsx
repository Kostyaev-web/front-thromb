import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getAssessmentsList, setFilters } from '../store/assessmentsSlice';
import { RootState, AppDispatch } from '../store/store';
import { StatusEnum } from '../api/Api';
import './AssessmentsListPage.css';

export function AssessmentsListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { assessmentsList, loading, error, filters, count, hasNext, hasPrevious } = useSelector(
    (state: RootState) => state.assessments
  );

  useEffect(() => {
    dispatch(getAssessmentsList(filters));
  }, [dispatch, filters]);

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

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ ...filters, page }));
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
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
          <h1>Мои оценки</h1>
          <p className="text-muted">Список всех оценок риска ТГВ/ТЭЛА</p>
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
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Дата формирования от</Form.Label>
              <Form.Control
                type="date"
                value={filters.date_from || ''}
                onChange={handleDateFromChange}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Дата формирования до</Form.Label>
              <Form.Control
                type="date"
                value={filters.date_to || ''}
                onChange={handleDateToChange}
              />
            </Form.Group>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {assessmentsList.length === 0 ? (
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
                        <th>Тема</th>
                        <th>Статус</th>
                        <th>Баллы</th>
                        <th>Дата создания</th>
                        <th>Дата формирования</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentsList.map((assessment) => (
                        <tr key={assessment.id}>
                          <td>{assessment.id}</td>
                          <td>{assessment.topic || '-'}</td>
                          <td>{getStatusBadge(assessment.status)}</td>
                          <td>{assessment.total_score}</td>
                          <td>{formatDate(assessment.created_at)}</td>
                          <td>{formatDate(assessment.formation_date)}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/deep-vein-thrombosis/${assessment.id}`)}
                            >
                              Открыть
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {count > 0 && (
                  <div className="pagination-section">
                    <div className="pagination-info">
                      Показано {assessmentsList.length} из {count} заявок
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
    </>
  );
}

