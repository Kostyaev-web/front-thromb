import { Symptom, SymptomsResponse } from '../types';
import { getApiBaseUrl, isTauri, normalizeImageUrl } from '../config/api';

// Mock данные для случая, когда бэкенд недоступен
const mockSymptoms: Symptom[] = [
  {
    id: 1,
    name: 'Клинические симптомы ТГВ',
    slug: 'clinical-dvt-symptoms',
    description: 'Боль и отек в области нижних конечностей, особенно односторонние, могут указывать на тромбоз глубоких вен.',
    points: 3,
    risk_factor: 'Наличие клинических симптомов тромбоза глубоких вен (боль, отек)',
    is_active: true,
    image_url: '',
    category: 'Клинические симптомы',
  },
  {
    id: 2,
    name: 'Альтернативный диагноз менее вероятен, чем ТГВ',
    slug: 'alternative-diagnosis',
    description: 'Когда другие диагнозы менее вероятны, чем тромбоз глубоких вен.',
    points: 3,
    risk_factor: 'Отсутствие альтернативного диагноза, который объясняет симптомы',
    is_active: true,
    image_url: '',
    category: 'Диагностика',
  },
  {
    id: 3,
    name: 'Иммобилизация или операция в течение последних 4 недель',
    slug: 'immobilization-surgery',
    description: 'Длительная иммобилизация или недавняя операция значительно увеличивают риск тромбоза.',
    points: 1.5,
    risk_factor: 'Иммобилизация более 3 дней или операция в течение последних 4 недель',
    is_active: true,
    image_url: '',
    category: 'Факторы риска',
  },
  {
    id: 4,
    name: 'Ранее диагностированный ТГВ или ТЭЛА',
    slug: 'previous-dvt-pe',
    description: 'Наличие в анамнезе тромбоза глубоких вен или тромбоэмболии легочной артерии.',
    points: 1.5,
    risk_factor: 'Предыдущие эпизоды тромбоэмболических осложнений',
    is_active: true,
    image_url: '',
    category: 'Анамнез',
  },
  {
    id: 5,
    name: 'Кровохарканье',
    slug: 'hemoptysis',
    description: 'Кровохарканье может быть признаком тромбоэмболии легочной артерии.',
    points: 1,
    risk_factor: 'Наличие крови в мокроте',
    is_active: true,
    image_url: '',
    category: 'Клинические симптомы',
  },
  {
    id: 6,
    name: 'Тахикардия',
    slug: 'tachycardia',
    description: 'Учащенное сердцебиение (более 100 ударов в минуту) может указывать на ТЭЛА.',
    points: 1.5,
    risk_factor: 'Частота сердечных сокращений более 100 ударов в минуту',
    is_active: true,
    image_url: '',
    category: 'Клинические симптомы',
  },
  {
    id: 7,
    name: 'Злокачественное новообразование',
    slug: 'malignancy',
    description: 'Онкологические заболевания значительно повышают риск тромбоэмболических осложнений.',
    points: 1,
    risk_factor: 'Активное злокачественное новообразование или лечение в течение последних 6 месяцев',
    is_active: true,
    image_url: '',
    category: 'Факторы риска',
  },
];

// Генерируем SVG placeholder как data URI
const generatePlaceholderImage = (width = 400, height = 300): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#E8F0F5"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#005BBB" text-anchor="middle" dominant-baseline="middle">🩺</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle" dominant-baseline="middle">Wells Method</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

const defaultImageUrl = generatePlaceholderImage();

/**
 * Получить список симптомов с фильтрацией
 */
export async function getSymptoms(search?: string, page?: number): Promise<SymptomsResponse> {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    if (page) {
      params.append('page', page.toString());
    }

    // Получаем базовый URL для API запросов
    // - Dev режим: пустая строка (прокси через Vite)
    // - GitHub Pages: пустая строка (относительный путь на тот же домен)
    // - Tauri production: прямой URL к ZeroTier бэкенду
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/symptoms/${params.toString() ? `?${params.toString()}` : ''}`;
    
    // Логирование для отладки
    console.log('🔍 API Debug:', {
      isTauri,
      isGitHubPages: window.location.hostname.includes('github.io'),
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      href: window.location.href,
      baseUrl,
      fullUrl: url,
    });
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch symptoms');
    }

    const data: SymptomsResponse = await response.json();
    // Нормализуем URL изображений и добавляем изображение по умолчанию, если поле пустое
    data.results = data.results.map(symptom => ({
      ...symptom,
      image_url: symptom.image_url ? normalizeImageUrl(symptom.image_url) : defaultImageUrl,
    }));
    return data;
  } catch (error) {
    console.error('❌ Backend недоступен, используем mock данные:', error);
    console.error('🔍 Детали ошибки:', {
      message: error instanceof Error ? error.message : String(error),
      isTauri,
      isGitHubPages: window.location.hostname.includes('github.io'),
      baseUrl: getApiBaseUrl(),
      attemptedUrl: `${getApiBaseUrl()}/api/symptoms/`,
    });
    // Используем mock данные
    let filteredSymptoms = [...mockSymptoms];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSymptoms = mockSymptoms.filter(
        symptom =>
          symptom.name.toLowerCase().includes(searchLower) ||
          symptom.description.toLowerCase().includes(searchLower) ||
          symptom.risk_factor.toLowerCase().includes(searchLower) ||
          symptom.category?.toLowerCase().includes(searchLower)
      );
    }

    return {
      count: filteredSymptoms.length,
      next: null,
      previous: null,
      results: filteredSymptoms.map(symptom => ({
        ...symptom,
        image_url: symptom.image_url ? normalizeImageUrl(symptom.image_url) : defaultImageUrl,
      })),
    };
  }
}

/**
 * Получить детали симптома по ID
 */
export async function getSymptomById(id: number): Promise<Symptom> {
  try {
    // Получаем базовый URL для API запросов (аналогично getSymptoms)
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/symptoms/${id}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch symptom');
    }

    const data: Symptom = await response.json();
    return {
      ...data,
      image_url: data.image_url ? normalizeImageUrl(data.image_url) : defaultImageUrl,
    };
  } catch (error) {
    console.error('❌ Backend недоступен, используем mock данные:', error);
    console.error('🔍 Детали ошибки:', {
      message: error instanceof Error ? error.message : String(error),
      isTauri,
      isGitHubPages: window.location.hostname.includes('github.io'),
      baseUrl: getApiBaseUrl(),
      attemptedUrl: `${getApiBaseUrl()}/api/symptoms/${id}/`,
    });

    const symptom = mockSymptoms.find(s => s.id === id);
    if (!symptom) {
      throw new Error('Symptom not found');
    }
    return {
      ...symptom,
      image_url: symptom.image_url ? normalizeImageUrl(symptom.image_url) : defaultImageUrl,
    };
  }
}

