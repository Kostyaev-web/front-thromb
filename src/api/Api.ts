/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * * `draft` - Черновик
 * * `formed` - Сформирован
 * * `completed` - Завершен
 * * `rejected` - Отклонен
 * * `deleted` - Удален
 */
export enum StatusEnum {
  Draft = "draft",
  Formed = "formed",
  Completed = "completed",
  Rejected = "rejected",
  Deleted = "deleted",
}
export enum StatusEnumDetail{
  Draft = "Черновик",
  Formed = "Сформирован",
  Completed = "Завершен",
  Rejected = "Отклонен",
  Deleted = "Удален",
}

/**
 * * `low` - Низкий риск
 * * `moderate` - Умеренный риск
 * * `high` - Высокий риск
 */
export enum RiskLevelEnum {
  Low = "low",
  Moderate = "moderate",
  High = "high",
}

export type NullEnum = null;

export enum BlankEnum {
  Value = "",
}

/** Сериализатор для симптомов в оценке */
export interface AssessmentSymptom {
  id: number;
  /** Симптом */
  symptom: number;
  symptom_name: string;
  /**
   * Баллы симптома
   * Баллы на момент добавления
   * @min -2147483648
   * @max 2147483647
   */
  symptom_points?: number | null;
  total_points: number;
}

/** Сериализатор для клинических симптомов */
export interface ClinicalSymptom {
  id: number;
  /**
   * Название симптома
   * @maxLength 200
   */
  name: string;
  /**
   * Слаг
   * @maxLength 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string;
  /** Описание */
  description: string;
  /**
   * Баллы по шкале Уэллса
   * @min -2147483648
   * @max 2147483647
   */
  points: number;
  /**
   * Фактор риска
   * @maxLength 200
   */
  risk_factor: string;
  /** Активен */
  is_active?: boolean;
  image_url: string;
}

/** Сериализатор для создания симптомов (без изображения) */
export interface ClinicalSymptomCreate {
  /**
   * Название симптома
   * @maxLength 200
   */
  name: string;
  /**
   * Слаг
   * @maxLength 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string;
  /** Описание */
  description: string;
  /**
   * Баллы по шкале Уэллса
   * @min -2147483648
   * @max 2147483647
   */
  points: number;
  /**
   * Фактор риска
   * @maxLength 200
   */
  risk_factor: string;
  /** Активен */
  is_active?: boolean;
}

export interface PaginatedClinicalSymptomList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: ClinicalSymptom[];
}

export interface PaginatedRiskAssessmentListList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: RiskAssessmentList[];
}

/** Сериализатор для симптомов в оценке */
export interface PatchedAssessmentSymptom {
  id?: number;
  /** Симптом */
  symptom?: number;
  symptom_name?: string;
  /**
   * Баллы симптома
   * Баллы на момент добавления
   * @min -2147483648
   * @max 2147483647
   */
  symptom_points?: number | null;
  total_points?: number;
}

/** Сериализатор для создания симптомов (без изображения) */
export interface PatchedClinicalSymptomCreate {
  /**
   * Название симптома
   * @maxLength 200
   */
  name?: string;
  /**
   * Слаг
   * @maxLength 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug?: string;
  /** Описание */
  description?: string;
  /**
   * Баллы по шкале Уэллса
   * @min -2147483648
   * @max 2147483647
   */
  points?: number;
  /**
   * Фактор риска
   * @maxLength 200
   */
  risk_factor?: string;
  /** Активен */
  is_active?: boolean;
}

/** Сериализатор для обновления полей оценки */
export interface PatchedRiskAssessmentUpdate {
  /**
   * Тема оценки
   * @maxLength 180
   */
  topic?: string | null;
  /** Комментарий */
  comment?: string | null;
}

/** Сериализатор для оценок риска с русскими названиями статуса и риска */
export interface RiskAssessment {
  id: number;
  /** Пациент */
  patient: number;
  patient_username: string;
  status: string;
  risk_level: string;
  /**
   * Тема оценки
   * @maxLength 180
   */
  topic?: string | null;
  /** Рекомендации */
  recommendation: string | null;
  /** Комментарий */
  comment?: string | null;
  /**
   * Дата формирования
   * @format date-time
   */
  formation_date: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  completion_date: string | null;
  /** Модератор */
  moderator: number | null;
  moderator_username: string;
  /** @format date-time */
  created_at: string;
  total_score: number;
  assessment_symptoms: AssessmentSymptom[];
}

/** Сериализатор для списка оценок риска */
export interface RiskAssessmentList {
  id: number;
  patient_username: string;
  /** Статус */
  status?: StatusEnum;
  /** Уровень риска */
  risk_level?: RiskLevelEnum | BlankEnum | NullEnum | null;
  /**
   * Тема оценки
   * @maxLength 180
   */
  topic?: string | null;
  /**
   * Дата формирования
   * @format date-time
   */
  formation_date?: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  completion_date?: string | null;
  moderator_username: string;
  /** @format date-time */
  created_at: string;
  total_score: number;
}

/** Сериализатор для обновления полей оценки */
export interface RiskAssessmentUpdate {
  /**
   * Тема оценки
   * @maxLength 180
   */
  topic?: string | null;
  /** Комментарий */
  comment?: string | null;
}

/** Сериализатор для пользователей */
export interface User {
  id: number;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @format date-time */
  date_joined: string;
}

/** Сериализатор для создания пользователей */
export interface UserCreate {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  password: string;
}

/** Сериализатор для авторизации */
export interface UserLogin {
  username: string;
  password: string;
}

export interface DeepVeinThrombosisListParams {
  /** Дата формирования от (YYYY-MM-DD) */
  date_from?: string;
  /** Дата формирования до (YYYY-MM-DD) */
  date_to?: string;
  /** A page number within the paginated result set. */
  page?: number;
  /** Фильтр по статусу */
  status?: string;
}

export interface DeepVeinThrombosisSymptomsUpdateParams {
  id: number;
}

export interface DeepVeinThrombosisSymptomsPartialUpdateParams {
  id: number;
}

export interface DeepVeinThrombosisSymptomsDeleteDestroyParams {
  id: number;
}

export interface DeepVeinThrombosisCompleteUpdateParams {
  assessmentId: number;
}

export interface DeepVeinThrombosisDeleteDestroyParams {
  assessmentId: number;
}

export interface DeepVeinThrombosisFormUpdateParams {
  assessmentId: number;
}

export interface DeepVeinThrombosisRetrieveParams {
  id: number;
}

export interface DeepVeinThrombosisUpdateUpdateParams {
  id: number;
}

export interface DeepVeinThrombosisUpdatePartialUpdateParams {
  id: number;
}

export interface SymptomsListParams {
  /** A page number within the paginated result set. */
  page?: number;
  /** Поиск по названию */
  search?: string;
}

export interface SymptomsRetrieveParams {
  id: number;
}

export interface SymptomsDeleteDestroyParams {
  id: number;
}

export interface SymptomsUpdateUpdateParams {
  id: number;
}

export interface SymptomsUpdatePartialUpdateParams {
  id: number;
}

export interface SymptomsAddToDraftCreateParams {
  symptomId: number;
}

export interface SymptomsUploadImageCreateParams {
  symptomId: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Wells API
 * @version 1.0.0
 *
 * REST API для системы оценки риска ТГВ/ТЭЛА
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  api = {
    /**
     * @description GET /api/cart/info/ - Информация о корзине (заявке-черновике)
     *
     * @tags Cart
     * @name CartInfoRetrieve
     * @summary Информация о корзине (черновике)
     * @request GET:/api/cart/info/
     * @secure
     * @response `200` `void` No response body
     */
    cartInfoRetrieve: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/cart/info/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description GET /api/assessments/ - Список заявок с фильтрацией
     *
     * @tags Assessments
     * @name DeepVeinThrombosisList
     * @summary Список заявок
     * @request GET:/api/deep-vein-thrombosis/
     * @secure
     * @response `200` `PaginatedRiskAssessmentListList`
     */
    deepVeinThrombosisList: (
      query: DeepVeinThrombosisListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<PaginatedRiskAssessmentListList, any>({
        path: `/api/deep-vein-thrombosis/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT /api/assessment-symptoms/{id}/ - Изменение количества/порядка/значения в оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessment Items
     * @name DeepVeinThrombosisSymptomsUpdate
     * @summary Обновить позицию заявки
     * @request PUT:/api/deep-vein-thrombosis-symptoms/{id}/
     * @secure
     * @response `200` `AssessmentSymptom`
     */
    deepVeinThrombosisSymptomsUpdate: (
      { id, ...query }: DeepVeinThrombosisSymptomsUpdateParams,
      data: AssessmentSymptom,
      params: RequestParams = {},
    ) =>
      this.http.request<AssessmentSymptom, any>({
        path: `/api/deep-vein-thrombosis-symptoms/${id}/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT /api/assessment-symptoms/{id}/ - Изменение количества/порядка/значения в оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessment Items
     * @name DeepVeinThrombosisSymptomsPartialUpdate
     * @summary Обновить позицию заявки
     * @request PATCH:/api/deep-vein-thrombosis-symptoms/{id}/
     * @secure
     * @response `200` `AssessmentSymptom`
     */
    deepVeinThrombosisSymptomsPartialUpdate: (
      { id, ...query }: DeepVeinThrombosisSymptomsPartialUpdateParams,
      data: PatchedAssessmentSymptom,
      params: RequestParams = {},
    ) =>
      this.http.request<AssessmentSymptom, any>({
        path: `/api/deep-vein-thrombosis-symptoms/${id}/`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE /api/assessment-symptoms/{id}/ - Удаление симптома из оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessment Items
     * @name DeepVeinThrombosisSymptomsDeleteDestroy
     * @summary Удалить позицию из заявки
     * @request DELETE:/api/deep-vein-thrombosis-symptoms/{id}/delete/
     * @secure
     * @response `204` `void` No response body
     */
    deepVeinThrombosisSymptomsDeleteDestroy: (
      { id, ...query }: DeepVeinThrombosisSymptomsDeleteDestroyParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/deep-vein-thrombosis-symptoms/${id}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT /api/assessments/{id}/complete/ - Завершить/отклонить оценку риска ТГВ/ТЭЛА модератором
     *
     * @tags Assessments
     * @name DeepVeinThrombosisCompleteUpdate
     * @summary Завершить/отклонить заявку (модератор)
     * @request PUT:/api/deep-vein-thrombosis/{assessment_id}/complete/
     * @secure
     * @response `200` `void` No response body
     */
    deepVeinThrombosisCompleteUpdate: (
      { assessmentId, ...query }: DeepVeinThrombosisCompleteUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/deep-vein-thrombosis/${assessmentId}/complete/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description DELETE /api/assessments/{id}/ - Удаление оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessments
     * @name DeepVeinThrombosisDeleteDestroy
     * @summary Удалить заявку (создатель)
     * @request DELETE:/api/deep-vein-thrombosis/{assessment_id}/delete/
     * @secure
     * @response `204` `void` No response body
     */
    deepVeinThrombosisDeleteDestroy: (
      { assessmentId, ...query }: DeepVeinThrombosisDeleteDestroyParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/deep-vein-thrombosis/${assessmentId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT /api/assessments/{id}/form/ - Сформировать оценку риска ТГВ/ТЭЛА создателем
     *
     * @tags Assessments
     * @name DeepVeinThrombosisFormUpdate
     * @summary Сформировать заявку (создатель)
     * @request PUT:/api/deep-vein-thrombosis/{assessment_id}/form/
     * @secure
     * @response `200` `void` No response body
     */
    deepVeinThrombosisFormUpdate: (
      { assessmentId, ...query }: DeepVeinThrombosisFormUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/deep-vein-thrombosis/${assessmentId}/form/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description GET /api/assessments/{id}/ - Одна запись оценки риска ТГВ/ТЭЛА с симптомами
     *
     * @tags Assessments
     * @name DeepVeinThrombosisRetrieve
     * @summary Детали заявки
     * @request GET:/api/deep-vein-thrombosis/{id}/
     * @secure
     * @response `200` `RiskAssessment`
     */
    deepVeinThrombosisRetrieve: (
      { id, ...query }: DeepVeinThrombosisRetrieveParams,
      params: RequestParams = {},
    ) =>
      this.http.request<RiskAssessment, any>({
        path: `/api/deep-vein-thrombosis/${id}/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT /api/assessments/{id}/ - Изменение полей оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessments
     * @name DeepVeinThrombosisUpdateUpdate
     * @summary Обновить заявку (только тема/комментарий)
     * @request PUT:/api/deep-vein-thrombosis/{id}/update/
     * @secure
     * @response `200` `RiskAssessmentUpdate`
     */
    deepVeinThrombosisUpdateUpdate: (
      { id, ...query }: DeepVeinThrombosisUpdateUpdateParams,
      data: RiskAssessmentUpdate,
      params: RequestParams = {},
    ) =>
      this.http.request<RiskAssessmentUpdate, any>({
        path: `/api/deep-vein-thrombosis/${id}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT /api/assessments/{id}/ - Изменение полей оценки риска ТГВ/ТЭЛА
     *
     * @tags Assessments
     * @name DeepVeinThrombosisUpdatePartialUpdate
     * @summary Обновить заявку (только тема/комментарий)
     * @request PATCH:/api/deep-vein-thrombosis/{id}/update/
     * @secure
     * @response `200` `RiskAssessmentUpdate`
     */
    deepVeinThrombosisUpdatePartialUpdate: (
      { id, ...query }: DeepVeinThrombosisUpdatePartialUpdateParams,
      data: PatchedRiskAssessmentUpdate,
      params: RequestParams = {},
    ) =>
      this.http.request<RiskAssessmentUpdate, any>({
        path: `/api/deep-vein-thrombosis/${id}/update/`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description GET /api/symptoms/ - Список симптомов с фильтрацией
     *
     * @tags Symptoms
     * @name SymptomsList
     * @summary Список симптомов
     * @request GET:/api/symptoms/
     * @secure
     * @response `200` `PaginatedClinicalSymptomList`
     */
    symptomsList: (query: SymptomsListParams, params: RequestParams = {}) =>
      this.http.request<PaginatedClinicalSymptomList, any>({
        path: `/api/symptoms/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description GET /api/symptoms/{id}/ - Одна запись симптома
     *
     * @tags Symptoms
     * @name SymptomsRetrieve
     * @summary Детали симптома
     * @request GET:/api/symptoms/{id}/
     * @secure
     * @response `200` `ClinicalSymptom`
     */
    symptomsRetrieve: (
      { id, ...query }: SymptomsRetrieveParams,
      params: RequestParams = {},
    ) =>
      this.http.request<ClinicalSymptom, any>({
        path: `/api/symptoms/${id}/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE /api/symptoms/{id}/ - Удаление симптома
     *
     * @tags Symptoms
     * @name SymptomsDeleteDestroy
     * @summary Удалить симптом
     * @request DELETE:/api/symptoms/{id}/delete/
     * @secure
     * @response `204` `void` No response body
     */
    symptomsDeleteDestroy: (
      { id, ...query }: SymptomsDeleteDestroyParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/symptoms/${id}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT /api/symptoms/{id}/ - Изменение симптома
     *
     * @tags Symptoms
     * @name SymptomsUpdateUpdate
     * @summary Обновить симптом
     * @request PUT:/api/symptoms/{id}/update/
     * @secure
     * @response `200` `ClinicalSymptomCreate`
     */
    symptomsUpdateUpdate: (
      { id, ...query }: SymptomsUpdateUpdateParams,
      data: ClinicalSymptomCreate,
      params: RequestParams = {},
    ) =>
      this.http.request<ClinicalSymptomCreate, any>({
        path: `/api/symptoms/${id}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT /api/symptoms/{id}/ - Изменение симптома
     *
     * @tags Symptoms
     * @name SymptomsUpdatePartialUpdate
     * @summary Обновить симптом
     * @request PATCH:/api/symptoms/{id}/update/
     * @secure
     * @response `200` `ClinicalSymptomCreate`
     */
    symptomsUpdatePartialUpdate: (
      { id, ...query }: SymptomsUpdatePartialUpdateParams,
      data: PatchedClinicalSymptomCreate,
      params: RequestParams = {},
    ) =>
      this.http.request<ClinicalSymptomCreate, any>({
        path: `/api/symptoms/${id}/update/`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description POST /api/symptoms/{id}/add-to-draft/ - Добавление симптома в оценку
     *
     * @tags Cart
     * @name SymptomsAddToDraftCreate
     * @summary Добавить симптом в черновик заявки
     * @request POST:/api/symptoms/{symptom_id}/add-to-draft/
     * @secure
     * @response `200` `void` No response body
     */
    symptomsAddToDraftCreate: (
      { symptomId, ...query }: SymptomsAddToDraftCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/symptoms/${symptomId}/add-to-draft/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description POST /api/symptoms/{id}/upload-image/ - Добавление изображения к симптому
     *
     * @tags Symptoms
     * @name SymptomsUploadImageCreate
     * @summary Загрузить изображение для симптома
     * @request POST:/api/symptoms/{symptom_id}/upload-image/
     * @secure
     * @response `200` `void` No response body
     */
    symptomsUploadImageCreate: (
      { symptomId, ...query }: SymptomsUploadImageCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/symptoms/${symptomId}/upload-image/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description POST /api/symptoms/ - Добавление симптома (без изображения)
     *
     * @tags Symptoms
     * @name SymptomsCreateCreate
     * @summary Создать симптом
     * @request POST:/api/symptoms/create/
     * @secure
     * @response `201` `ClinicalSymptomCreate`
     */
    symptomsCreateCreate: (
      data: ClinicalSymptomCreate,
      params: RequestParams = {},
    ) =>
      this.http.request<ClinicalSymptomCreate, any>({
        path: `/api/symptoms/create/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description GET /api/users/active-sessions/ - Получение списка активных пользователей с их сессиями через Lua скрипт
     *
     * @tags Auth
     * @name UsersActiveSessionsRetrieve
     * @summary Список активных пользователей с сессиями (Lua)
     * @request GET:/api/users/active-sessions/
     * @secure
     * @response `200` `void` No response body
     */
    usersActiveSessionsRetrieve: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/active-sessions/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Получение CSRF токена для использования в заголовке X-CSRFToken. Токен устанавливается в cookie csrftoken и возвращается в ответе.
     *
     * @tags Auth
     * @name UsersCsrfTokenRetrieve
     * @summary Получить CSRF токен
     * @request GET:/api/users/csrf-token/
     * @secure
     * @response `200` `void` No response body
     */
    usersCsrfTokenRetrieve: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/csrf-token/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Аутентификация пользователя с получением RSA-зашифрованного токена. Токен возвращается в заголовке X-Auth-Token. Используйте этот токен в заголовке X-Auth-Token или Authorization: Bearer <token> для последующих запросов.
     *
     * @tags Auth
     * @name UsersLoginCreate
     * @summary Вход (RSA SessionAuth)
     * @request POST:/api/users/login/
     * @secure
     * @response `200` `User` Успешный вход. Токен в заголовке X-Auth-Token
     * @response `400` `void` Неверные данные для входа
     */
    usersLoginCreate: (data: UserLogin, params: RequestParams = {}) =>
      this.http.request<User, void>({
        path: `/api/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Деавторизация пользователя. Удаляет сессию из Redis и очищает cookie. После logout RSA токен становится недействительным, так как сессия удаляется из Redis.
     *
     * @tags Auth
     * @name UsersLogoutCreate
     * @summary Выход (SessionAuth)
     * @request POST:/api/users/logout/
     * @secure
     * @response `200` `void` No response body
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description GET /api/users/profile/ - Получение профиля пользователя
     *
     * @tags Auth
     * @name UsersProfileRetrieve
     * @summary Профиль пользователя
     * @request GET:/api/users/profile/
     * @secure
     * @response `200` `void` No response body
     */
    usersProfileRetrieve: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/profile/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT /api/users/profile/ - Обновление профиля пользователя
     *
     * @tags Auth
     * @name UsersProfileUpdateUpdate
     * @summary Обновить профиль пользователя
     * @request PUT:/api/users/profile/update/
     * @secure
     * @response `200` `void` No response body
     */
    usersProfileUpdateUpdate: (data: User, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/profile/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Получение публичного RSA ключа для шифрования. Ключ используется для шифрования данных на клиенте. Сервер использует приватный ключ для расшифровки. Также устанавливает CSRF cookie для последующих запросов.
     *
     * @tags Auth
     * @name UsersPublicKeyRetrieve
     * @summary Получить публичный RSA ключ
     * @request GET:/api/users/public-key/
     * @secure
     * @response `200` `void` No response body
     */
    usersPublicKeyRetrieve: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/public-key/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description POST /api/users/register/ - Регистрация пользователя
     *
     * @tags Auth
     * @name UsersRegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users/register/
     * @secure
     * @response `200` `void` No response body
     */
    usersRegisterCreate: (data: UserCreate, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
