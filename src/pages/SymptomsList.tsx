import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Alert, Button, Card, Container, Form, Spinner} from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import {Breadcrumbs} from '../components/Breadcrumbs';
import {getSymptoms} from '../api/symptoms';
import {AppDispatch, RootState} from '../store/store';
import {setSearchQuery} from '../store/filtersSlice';
import {addSymptomToDraft, clearError, getCartInfo} from '../store/assessmentsSlice';
import {setError, setLoading, setSymptoms} from '../store/symptomsSlice';
import './SymptomsList.css';

export function SymptomsList() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {searchQuery} = useSelector((state: RootState) => state.filters);
    const {isAuthenticated} = useSelector((state: RootState) => state.auth);
    const {
        loading: addingSymptom,
        error: addError,
        currentDraft
    } = useSelector((state: RootState) => state.assessments);
    const {symptoms, loading} = useSelector((state: RootState) => state.symptoms);
    const [addingSymptomId, setAddingSymptomId] = useState<number | null>(null);

    // Используем currentDraft для получения информации о черновике
    const draft = currentDraft;
    const draftSymptomsCount = draft && 'assessment_symptoms' in draft
        ? (draft as any).assessment_symptoms?.length || 0
        : 0;

    // Синхронизируем локальный input с Redux
    const [searchInput, setSearchInput] = useState(searchQuery);

    // Загружаем информацию о корзине (черновике) при авторизации
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCartInfo());
        }
    }, [dispatch, isAuthenticated]);

    // Обновляем input при изменении Redux state
    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);

    // Загружаем симптомы при монтировании и при изменении searchQuery
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            dispatch(setLoading(true));
            try {
                const data = await getSymptoms(searchQuery || undefined);
                if (isMounted) {
                    dispatch(setSymptoms(data));
                }
            } catch (error) {
                dispatch(setError('Ошибка загрузки симптомов'));
                console.error('Ошибка загрузки симптомов:', error);
            } finally {
                if (isMounted) {
                    dispatch(setLoading(false));
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Сохраняем поисковую строку в Redux
        dispatch(setSearchQuery(searchInput));
    };

    const getPointsLabel = (points: number): string => {
        const lastDigit = points % 10;
        const lastTwoDigits = points % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'баллов';
        }
        if (lastDigit === 1) {
            return 'балл';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'балла';
        }
        return 'баллов';
    };

    const handleAddToDraft = async (symptomId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setAddingSymptomId(symptomId);
            await dispatch(addSymptomToDraft(symptomId)).unwrap();
            // После добавления симптома обновляем информацию о корзине
            await dispatch(getCartInfo());
            // Можно показать уведомление об успехе
        } catch (error) {
            console.error('Ошибка добавления симптома:', error);
        } finally {
            setAddingSymptomId(null);
        }
    };

    const handleDraftClick = () => {
        if (draft) {
            navigate(`/deep-vein-thrombosis/${draft.id}`);
        }
    };

    return (
        <>
            <Breadcrumbs items={[
                {label: 'Главная', path: '/'},
                {label: 'Симптомы'}
            ]}/>
            <Container className="symptoms-container">

                {isAuthenticated && (
                    <div className="draft-bar">
                        <div className="draft-bar-spacer" />
                        <div className="draft-bar-action">
                            <Button
                                variant={draftSymptomsCount > 0 ? 'primary' : 'secondary'}
                                className="draft-button-round rounded-circle"
                                onClick={draftSymptomsCount > 0 ? handleDraftClick : undefined}
                                disabled={draftSymptomsCount === 0}
                                title="Черновик оценки"
                            >
                                <span className="draft-button-icon">🩺</span>

                                {draftSymptomsCount > 0 && (
                                    <span className="draft-button-badge">
            {draftSymptomsCount}
          </span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}



                {/* Блок поиска */}
                <div className="search-section">
                    <Form onSubmit={handleSearch}>
                        <Form.Group className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Поиск симптомов DVT или факторов риска..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="search-input"
                            />
                            <Button type="submit" variant="primary" className="search-btn">
                                Искать симптомы
                            </Button>
                        </Form.Group>
                    </Form>
                </div>

                {addError && (
                    <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                        {addError}
                    </Alert>
                )}

                {/* Список симптомов */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div className="symptoms-grid">
                        {symptoms.map((symptom) => (
                            <Card key={symptom.id} className="symptom-card">
                                <Link to={`/symptoms/${symptom.id}`} className="card-link">
                                    <Card.Img
                                        variant="top"
                                        src={symptom.image_url}
                                        alt={symptom.name}
                                        className="symptom-image"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Генерируем SVG placeholder
                                            const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#E8F0F5"/><text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#005BBB" text-anchor="middle" dominant-baseline="middle">🩺</text><text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle" dominant-baseline="middle">Wells Method</text></svg>`;
                                            target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
                                        }}
                                    />
                                    <Card.Body className="symptom-info">
                                        <Card.Title className="symptom-title">{symptom.name}</Card.Title>
                                        {symptom.category && (
                                            <Card.Text className="category">{symptom.category}</Card.Text>
                                        )}
                                        <div className="points">
                                            <span className="points-value">{symptom.points}</span>
                                            <span className="points-label">{getPointsLabel(symptom.points)}</span>
                                        </div>
                                    </Card.Body>
                                </Link>
                                {isAuthenticated && (
                                    <div className="symptom-card-actions">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={(e) => handleAddToDraft(symptom.id, e)}
                                            disabled={addingSymptom && addingSymptomId === symptom.id}
                                        >
                                            {addingSymptom && addingSymptomId === symptom.id ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-1"
                                                    />
                                                    Добавление...
                                                </>
                                            ) : (
                                                'Добавить'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && symptoms.length === 0 && (
                    <div className="text-center py-5">
                        <p>Симптомы не найдены</p>
                    </div>
                )}
            </Container>
        </>
    );
}