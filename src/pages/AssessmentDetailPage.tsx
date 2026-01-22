import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
  Table,
  Modal,
} from 'react-bootstrap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  getAssessmentDetail,
  updateAssessment,
  formAssessment,
  deleteAssessment,
  deleteAssessmentSymptom,
  updateAssessmentSymptom,
  getCartInfo,
  clearError,
} from '../store/assessmentsSlice';
import { RootState, AppDispatch } from '../store/store';
import {StatusEnum, StatusEnumDetail} from '../api/Api';
import './AssessmentDetailPage.css';

export function AssessmentDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentAssessment, loading, error } = useSelector(
    (state: RootState) => state.assessments
  );

  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState('');
  const [comment, setComment] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSymptomId, setEditingSymptomId] = useState<number | null>(null);
  const [symptomTotalPoints, setSymptomTotalPoints] = useState<Record<number, number>>({});

  // Проверяем статус - может быть как enum, так и строка
  const statusStr = currentAssessment?.status?.toString().toLowerCase() || '';
  const isDraft = statusStr === 'черновик' || statusStr === StatusEnum.Draft.toLowerCase();

  useEffect(() => {
    if (id) {
      dispatch(getAssessmentDetail(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAssessment) {
      setTopic(currentAssessment.topic || '');
      setComment(currentAssessment.comment || '');
      
      // Инициализируем значения total_points для симптомов
      if (currentAssessment.assessment_symptoms) {
        const initialPoints: Record<number, number> = {};
        currentAssessment.assessment_symptoms.forEach((symptom) => {
          initialPoints[symptom.id] = symptom.total_points || 0;
        });
        setSymptomTotalPoints(initialPoints);
      }
    }
  }, [currentAssessment]);

  const handleSave = async () => {
    if (!id) return;
    try {
      // Отправляем только непустые поля
      const updateData: { topic?: string; comment?: string } = {};
      if (topic.trim()) {
        updateData.topic = topic.trim();
      }
      if (comment.trim()) {
        updateData.comment = comment.trim();
      }
      
      await dispatch(updateAssessment({ id: Number(id), data: updateData })).unwrap();
      // Обновляем детали заявки после сохранения
      await dispatch(getAssessmentDetail(Number(id)));
      setIsEditing(false);
    } catch (err: any) {
      console.error('Ошибка сохранения:', err);
      alert(err?.message || 'Ошибка при сохранении заявки. Попробуйте еще раз.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentAssessment) {
      setTopic(currentAssessment.topic || '');
      setComment(currentAssessment.comment || '');
    }
  };

  const handleForm = async () => {
    if (!id) return;
    
    // Проверяем, что есть хотя бы один симптом
    if (!currentAssessment?.assessment_symptoms || currentAssessment.assessment_symptoms.length === 0) {
      alert('Для формирования заявки необходимо добавить хотя бы один симптом.');
      return;
    }
    
    try {
      await dispatch(formAssessment(Number(id))).unwrap();
      // Обновляем детали заявки после формирования
      await dispatch(getAssessmentDetail(Number(id)));
      // Показываем сообщение об успехе или просто остаемся на странице
      alert('Заявка успешно сформирована!');
    } catch (err: any) {
      console.error('Ошибка формирования заявки:', err);
      alert(err?.message || 'Ошибка при формировании заявки. Попробуйте еще раз.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await dispatch(deleteAssessment(Number(id))).unwrap();
      navigate('/deep-vein-thrombosis');
    } catch (err) {
      console.error('Ошибка удаления заявки:', err);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteSymptom = async (symptomId: number) => {
    try {
      await dispatch(deleteAssessmentSymptom(symptomId)).unwrap();
      if (id) {
        await dispatch(getAssessmentDetail(Number(id)));
        // Обновляем информацию о корзине после удаления симптома
        await dispatch(getCartInfo());
      }
    } catch (err) {
      console.error('Ошибка удаления симптома:', err);
    }
  };

  const handleEditSymptomPoints = (symptomId: number) => {
    setEditingSymptomId(symptomId);
  };

  const handleSaveSymptomPoints = async (symptomId: number) => {
    try {
      const newTotalPoints = symptomTotalPoints[symptomId];
      if (newTotalPoints === undefined || newTotalPoints < 0) {
        alert('Введите корректное значение баллов (не менее 0)');
        return;
      }
      
      await dispatch(updateAssessmentSymptom({
        id: symptomId,
        data: { symptom_points: newTotalPoints }
      })).unwrap();
      
      setEditingSymptomId(null);
      if (id) {
        await dispatch(getAssessmentDetail(Number(id)));
      }
    } catch (err: any) {
      console.error('Ошибка обновления баллов симптома:', err);
      alert(err?.message || 'Ошибка при сохранении баллов симптома');
    }
  };

  const handleCancelEditSymptom = (symptomId: number) => {
    // Восстанавливаем исходное значение
    const symptom = currentAssessment?.assessment_symptoms.find(s => s.id === symptomId);
    if (symptom) {
      setSymptomTotalPoints(prev => ({
        ...prev,
        [symptomId]: symptom.total_points || 0
      }));
    }
    setEditingSymptomId(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case StatusEnumDetail.Draft:
        return <Badge bg="secondary">Черновик</Badge>;
      case StatusEnumDetail.Formed:
        return <Badge bg="info">Сформирован</Badge>;
      case StatusEnumDetail.Completed:
        return <Badge bg="success">Завершен</Badge>;
      case StatusEnumDetail.Rejected:
        return <Badge bg="danger">Отклонен</Badge>;
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

  if (loading && !currentAssessment) {
    return (
      <Container className="assessment-detail-container">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!currentAssessment) {
    return (
      <Container className="assessment-detail-container">
        <Alert variant="warning">Оценка не найдена</Alert>
      </Container>
    );
  }

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Оценки', path: '/deep-vein-thrombosis' },
        { label: `Оценка №${currentAssessment.id}` }
      ]} />
      <Container className="assessment-detail-container">
        <div className="assessment-header">
          <div>
            <h1>Оценка №{currentAssessment.id}</h1>
          </div>
          {isDraft && (
            <div className="assessment-actions d-flex gap-2 flex-wrap">
              {!isEditing ? (
                <>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    ✏️ Редактировать
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Сохранение...
                      </>
                    ) : (
                      '💾 Сохранить'
                    )}
                  </Button>
                  <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                    Отмена
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        <Card className="assessment-info-card">
          <Card.Body>
            <h5>Информация об оценке</h5>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Пациент:</strong> {currentAssessment.patient_username}</p>
                <p><strong>Статус:</strong> {getStatusBadge(currentAssessment.status)}</p>
                <p><strong>Уровень риска:</strong> {currentAssessment.risk_level || '-'}</p>
                <p><strong>Общий балл:</strong> {currentAssessment.total_score}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Дата создания:</strong> {formatDate(currentAssessment.created_at)}</p>
                <p><strong>Дата формирования:</strong> {formatDate(currentAssessment.formation_date)}</p>
                <p><strong>Дата завершения:</strong> {formatDate(currentAssessment.completion_date)}</p>
                {currentAssessment.moderator_username && (
                  <p><strong>Модератор:</strong> {currentAssessment.moderator_username}</p>
                )}
              </div>
            </div>

            <hr />

            {isEditing ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Тема оценки</Form.Label>
                  <Form.Control
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength={180}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Комментарий</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Form.Group>

                <div className="edit-actions">
                  <Button variant="primary" onClick={handleSave}>
                    Сохранить
                  </Button>
                  <Button variant="secondary" onClick={handleCancel} className="ms-2">
                    Отмена
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Тема оценки:</strong> {currentAssessment.topic || '-'}</p>
                <p><strong>Комментарий:</strong> {currentAssessment.comment || '-'}</p>
                {currentAssessment.recommendation && (
                  <p><strong>Рекомендации:</strong> {currentAssessment.recommendation}</p>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        <Card className="assessment-symptoms-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Симптомы в оценке</h5>
              {isDraft && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/symptoms')}
                >
                  ➕ Добавить симптомы
                </Button>
              )}
            </div>
            {!currentAssessment.assessment_symptoms || currentAssessment.assessment_symptoms.length === 0 ? (
              <Alert variant="info">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Симптомы не добавлены. Добавьте симптомы для формирования оценки.</span>
                </div>
              </Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Название симптома</th>
                    <th>
                      Баллы симптома
                      {isDraft && <span className="text-muted" style={{fontSize: '0.85em', fontWeight: 'normal'}}> (можно изменить)</span>}
                    </th>
                    {isDraft && <th className="text-center">Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentAssessment.assessment_symptoms.map((symptom, index) => (
                    <tr key={symptom.id}>
                      <td>{index + 1}</td>
                      <td>{symptom.symptom_name || '-'}</td>
                      <td>
                        {isDraft && editingSymptomId === symptom.id ? (
                          <div className="d-flex align-items-center gap-2">
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.1"
                              value={symptomTotalPoints[symptom.id] ?? symptom.total_points ?? 0}
                              onChange={(e) => setSymptomTotalPoints(prev => ({
                                ...prev,
                                [symptom.id]: parseFloat(e.target.value) || 0
                              }))}
                              style={{ width: '100px' }}
                              autoFocus
                            />
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleSaveSymptomPoints(symptom.id)}
                              disabled={loading}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCancelEditSymptom(symptom.id)}
                              disabled={loading}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <strong>{symptom.total_points ?? 0}</strong>
                            {isDraft && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditSymptomPoints(symptom.id)}
                                disabled={loading}
                              >
                                ✏️
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      {isDraft && (
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteSymptom(symptom.id)}
                            disabled={loading || editingSymptomId === symptom.id}
                          >
                            🗑️ Удалить
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
        {isDraft && (
        <div className="d-flex justify-content-end gap-3">
          <Button
              variant="success"
              onClick={handleForm}
              disabled={loading}
          >
            ✅ Сформировать заявку
          </Button>

          <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Удалить
          </Button>
        </div>
            )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Подтверждение удаления</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы уверены, что хотите удалить эту оценку? Это действие нельзя отменить.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Удалить
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

