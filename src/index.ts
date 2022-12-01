import axios, { AxiosError } from 'axios';



export default class XHome {
  protected server = axios.create({
    baseURL: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol',
    headers: {
      'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
    },
  });

  public accessToken?: string;
  public xhAuth?: string;


  constructor(public refreshToken: string) {
    this.server.interceptors.request.use(async (config) => {
      if (this.accessToken === undefined) {
        await this.login();
      }
      if (this.xhAuth === undefined) {
        await this.getProfile();
      }
      if (config.headers === undefined) {
        config.headers = {};
      }
      config.headers['Authorization'] = this.accessToken!;
      config.headers['Xh-Auth'] = this.xhAuth!;
      return config;
    });
    this.server.interceptors.response.use(undefined, async (err: AxiosError) => {
      if (err.response?.status === 401) {
        this.accessToken === undefined;
        await this.login();
        if (err.request !== undefined && !(err.request._header?.split('\r\n') as string[] | undefined)?.includes('Attempt: 2')) {
          return this.server[(err.request.method as string).toLowerCase()]((err.request.path as string).replace('/api/services/', '/'), {
            headers: {
              'Attempt': 2,
            },
          });
        }
      }
      return Promise.reject(err);
    });
  }

  public async login() {
    const server = axios.create();
    server.interceptors.response.use((response) => {
      this.refreshToken = response.data.refresh_token;
      this.accessToken = `${response.data.token_type} ${response.data.access_token}`;
      //setTimeout(() => this.accessToken = undefined, (response.data.expires_in - 1) * 1000);
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    });
    return (await server.post('https://oauth.xfinity.com/oauth/token',
      `redirect_uri=xfinityhome://auth&refresh_token=${this.refreshToken}&grant_type=refresh_token`,
      {
        headers: {
          'Authorization': 'Basic WGZpbml0eS1Ib21lLWlPUy1BcHA6NzdiMzY2ZjlhMTM1YzdhYjM5MTA0NDIzNGEyNmIxZDZiMWUwOGY2Ng==',
        },
      })).data;
  }

  public async getProfile() {
    const server = axios.create();
    server.interceptors.request.use(async (config) => {
      if (this.accessToken === undefined) {
        await this.login();
      }
      if (config.headers === undefined) {
        config.headers = {};
      }
      config.headers['Authorization'] = this.accessToken!;
      return config;
    });
    server.interceptors.response.use((response) => {
      this.xhAuth = response.data.sessionInfo.sessionHeaderValue;
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    });
    return (await server.get('https://xhomeapi-lb-prod.codebig2.net/client', {
      headers: {
        'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
      },
    })).data;
  }

  public async getDevices() {
    return (await this.server.get('/devices')).data;
  }

  public readonly days = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15,
    -16, -17, -18, -19, -20, -21, -22, -23, -24, -25, -26, -27, -28, -29] as const;

  public async getHistory(day?: this['days'][number]) {
    return day !== undefined ?
      (await this.server.get(`/history/day?day=${day}`)).data :
      (await Promise.all(this.days.map(day1 => this.server.get(`/history/day?day=${day1}`))));
  }

  static parseError(axiosError: AxiosError) {
    const Error: any = {
      name: axiosError.name,
      message: axiosError.message,
    };
    if (axiosError.request) {
      Error.request = {
        method: axiosError.request.method,
        protocol: axiosError.request.protocol,
        host: axiosError.request.host,
        path: axiosError.request.path,
        headers: (axiosError.request._header?.split('\r\n') as string[] | undefined)?.filter(x => x) || [],
      };
    }
    if (axiosError.response) {
      Error.response = {
        statusCode: axiosError.response.status,
        statusMessage: axiosError.response.statusText,
        headers: axiosError.response.headers,
        data: axiosError.response.data,
      };
    }
    return Error;
  }
}