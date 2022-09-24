type Config = {
  BASE_URL?: string,
  defaultHeaders?: Headers | {
    [header: string]: string
  }
}
const defaultConfig: Config = {
  BASE_URL: '/',
  defaultHeaders: {}
}
interface IApiFabricParams {
  config?: Config
}

type createApiParams = {
  url: string,
  params?: { [param: string]: string },
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  headers?: Headers | { [header: string]: string },
  data?: object,
  cache?: boolean
}
type createApiType = (params: createApiParams) => Promise<Response>

export default function apiFabric({ config }: IApiFabricParams): createApiType {
  const { BASE_URL, defaultHeaders } = config ? {...defaultConfig, ...config} : defaultConfig

  return function ({
    url = '',
    params,
    method = 'GET',
    headers = {},
    data = {},
    cache = true
  }) { 
    return fetch(
      `${BASE_URL}${url}${params ? '?' + new URLSearchParams(params) : ''}`, {
        method,
        headers: {
          ...defaultHeaders,
          ...headers
        },
        body: method === 'GET' ? undefined : JSON.stringify(data),
        cache: cache ? 'default' : 'no-cache'
      }
    )
  }
}