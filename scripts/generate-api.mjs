import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateApi } from 'swagger-typescript-api';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к YAML файлу в корне проекта
const yamlPath = resolve(process.cwd(), './Wells API.yaml');

// Проверяем существование YAML файла
if (!fs.existsSync(yamlPath)) {
  console.error(`YAML файл не найден: ${yamlPath}`);
  console.log('Используем URL из vite.config.ts');
  // Используем URL из прокси
  generateApi({
    name: 'Api.ts',
    output: resolve(process.cwd(), './src/api'),
    url: 'https://localhost:8443/swagger/?format=openapi',
    httpClientType: 'axios',
    defaultResponseAsSuccess: false,
    generateClient: true,
    generateRouteTypes: false,
    generateResponses: true,
    toJS: false,
    extractRequestParams: true,
    extractRequestBody: true,
    extractEnums: true,
    unwrapResponseData: false,
    singleHttpClient: true,
    cleanOutput: false,
    enumNamesAsValues: false,
    moduleNameFirstTag: false,
    generateUnionEnums: false,
    extraTemplates: [],
    hooks: {
      onFormatRouteName: (routeInfo, templateRouteName) => {
        return templateRouteName;
      },
    },
  }).then(({ files, configuration }) => {
    console.log('API сгенерирован успешно!');
  }).catch((e) => {
    console.error('Ошибка генерации API:', e);
    process.exit(1);
  });
} else {
  // Используем локальный YAML файл
  generateApi({
    name: 'Api.ts',
    output: resolve(process.cwd(), './src/api'),
    input: yamlPath,
    httpClientType: 'axios',
    defaultResponseAsSuccess: false,
    generateClient: true,
    generateRouteTypes: false,
    generateResponses: true,
    toJS: false,
    extractRequestParams: true,
    extractRequestBody: true,
    extractEnums: true,
    unwrapResponseData: false,
    singleHttpClient: true,
    cleanOutput: false,
    enumNamesAsValues: false,
    moduleNameFirstTag: false,
    generateUnionEnums: false,
    extraTemplates: [],
    hooks: {
      onFormatRouteName: (routeInfo, templateRouteName) => {
        return templateRouteName;
      },
    },
  }).then(({ files, configuration }) => {
    console.log('API сгенерирован успешно из YAML файла!');
  }).catch((e) => {
    console.error('Ошибка генерации API:', e);
    process.exit(1);
  });
}

