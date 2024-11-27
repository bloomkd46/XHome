import axios, { AxiosError } from 'axios';

import { Camera, CameraDevice } from './devices/Camera';
import { DryContact, DryContactDevice } from './devices/DryContact';
import { Keyfob, KeyfobDevice } from './devices/Keyfob';
import { Keypad, KeypadDevice } from './devices/Keypad';
import { LegacyDryContact, LegacyDryContactDevice } from './devices/LegacyDryContact';
import { LegacyMotion, LegacyMotionDevice } from './devices/LegacyMotion';
import { Light, LightDevice } from './devices/Light';
import { Motion, MotionDevice } from './devices/Motion';
import { Panel, PanelDevice } from './devices/Panel';
import { Router, RouterDevice } from './devices/Router';
import { Smoke, SmokeDevice } from './devices/Smoke';
import { Unknown } from './devices/Unknown';
import { Water, WaterDevice } from './devices/Water';
import { Device, LoginResponse, Profile, RawDevice, SensorDeltaEvent, XHomeError } from './GlobalInterfaces';


export * from './devices/Camera';
export * from './devices/DryContact';
export * from './devices/LegacyDryContact';
export * from './devices/Keyfob';
export * from './devices/Keypad';
export * from './devices/Light';
export * from './devices/Smoke';
export * from './devices/Water';
export * from './devices/Motion';
export * from './devices/LegacyMotion';
export * from './devices/Panel';
export * from './devices/Unknown';
export * from './GlobalInterfaces';

export default class XHome {
  protected devices: Device[] = [];
  protected server = axios.create({
    baseURL: 'https://xhomeapi-lb-prod.codebig2.net/',
    headers: {
      'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
    },
    timeout: 8000, //Hap-NodeJS has a timeout of 9 seconds, so we should be fine with 8 seconds
  });

  public accessToken?: string;
  public xhAuth?: string;


  protected loggingIn = false;
  protected gettingProfile = false;

  constructor(public refreshToken: string, protected watchdog?: { enabled?: boolean; autoFetch?: boolean; errorHandler?: (err) => void; }) {
    this.server.interceptors.request.use(async (config) => {
      if (this.accessToken === undefined) {
        if (this.loggingIn) {
          await (new Promise(resolve => {
            const interval = setInterval(() => {
              if (!this.loggingIn) {
                clearInterval(interval);
                resolve(this.accessToken);
              }
            });
          }));
        } else {
          this.loggingIn = true;
          try {
            await this.login();
          } finally {
            this.loggingIn = false;
          }
        }
      }
      if (this.xhAuth === undefined) {
        if (this.gettingProfile) {
          await (new Promise(resolve => {
            const interval = setInterval(() => {
              if (!this.gettingProfile) {
                clearInterval(interval);
                resolve(this.xhAuth);
              }
            });
          }));
        } else {
          this.gettingProfile = true;
          await this.getProfile();
          this.gettingProfile = false;
        }
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
        this.accessToken = undefined;
        //await this.login();
        this.xhAuth = undefined;
        if (err.request !== undefined && !(err.request._header?.split('\r\n') as string[] | undefined)?.includes('Attempt: 2')) {
          if (err.request.method === 'POST') {
            return this.server.post(err.request.path, err.request.data, {
              headers: {
                'Attempt': 2,
              },
            });
          } else if (err.request.method === 'GET') {
            return this.server.get(err.request.path, {
              headers: {
                'Attempt': 2,
              },
            });
          }
        }
      }
      return Promise.reject(err);
    });
    if (this.watchdog?.enabled !== false) {
      this.watchForActivity();
    }
  }

  protected async login(): Promise<LoginResponse> {
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

  public async getProfile(): Promise<Profile> {
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

  public async getDevices(): Promise<Device[]> {
    const rawDevices: RawDevice[] = (await this.server.get('/client/icontrol/devices')).data.devices;
    const devices: Device[] = [];
    for (const rawDevice of rawDevices) {
      if (this.devices.find(device => device.device.id === rawDevice.id) === undefined) {
        switch (rawDevice.deviceType) {
          case 'lightDimmer':
          case 'lightSwitch':
            devices.push(new Light(this.server, rawDevice as LightDevice));
            break;
          case 'panel':
            devices.push(new Panel(this.server, rawDevice as PanelDevice));
            break;
          case 'camera':
            devices.push(new Camera(this.server, rawDevice as CameraDevice, this.watchdog?.enabled ?? true));
            break;
          case 'sensor':
            switch (rawDevice.properties.sensorType) {
              case 'dryContact':
                devices.push(new DryContact(this.server, rawDevice as DryContactDevice));
                break;
              case 'motion':
                devices.push(new Motion(this.server, rawDevice as MotionDevice));
                break;
              case 'smoke':
                devices.push(new Smoke(this.server, rawDevice as SmokeDevice));
                break;
              case 'water':
                devices.push(new Water(this.server, rawDevice as WaterDevice));
                break;
              case 'sensor':
                if (['door', 'window'].includes(rawDevice.properties.type)) {
                  devices.push(new LegacyDryContact(this.server, rawDevice as LegacyDryContactDevice));
                  break;
                } else if (rawDevice.properties.type === 'motion') {
                  devices.push(new LegacyMotion(this.server, rawDevice as LegacyMotionDevice));
                  break;
                }
                continue;
              default:
                devices.push(new Unknown(this.server, rawDevice));
                break;
            }
            break;
          case 'peripheral':
            switch (rawDevice.properties.type) {
              case 'keyfob':
                devices.push(new Keyfob(this.server, rawDevice as KeyfobDevice));
                break;
              case 'keypad':
              case 'takeoverKeypad':
                devices.push(new Keypad(this.server, rawDevice as KeypadDevice));
                break;
              case 'router':
              case 'gateway':
                devices.push(new Router(this.server, rawDevice as RouterDevice));
                break;
              default:
                devices.push(new Unknown(this.server, rawDevice));
                break;
            }
            break;
          default:
            devices.push(new Unknown(this.server, rawDevice));
            break;
        }
      }
    }
    this.devices.push(...devices);
    return this.devices;
  }


  public async getRawDevices(): Promise<RawDevice[]> {
    return (await this.server.get('/client/icontrol/devices')).data.devices;
  }

  public readonly days = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15,
    -16, -17, -18, -19, -20, -21, -22, -23, -24, -25, -26, -27, -28, -29] as const;

  public async getHistory(day?: this['days'][number]): Promise<Record<string, any>[]> {
    if (day !== undefined) {
      return (await this.server.get(`/client/icontrol/history/day?day=${day}`)).data.events;

    } else {
      return (await Promise.all(this.days.map(day => this.getHistory(day)))).reduce((value1, value2) => value1.concat(value2));
    }
  }

  protected async waitForActivity(): Promise<SensorDeltaEvent> {
    const events = (await this.server.get('/client/icontrol/delta', { timeout: 0 })).data;
    for (const event of events) {
      for (const device of this.devices) {
        if (device.device.id === event.deviceId || (device instanceof Panel && event.deviceId === null)) {
          if (event.mediaType === 'event/cameraAccess' && device instanceof Camera) {
            device.streamingInfo = event.metadata;
          }
          if ('onevent' in device && device.onevent !== undefined) {
            device.onevent(event);
          }
          if ('onchange' in device && device.onchange !== undefined && this.watchdog?.autoFetch !== false) {
            await device.get();
          }
        }
      }
    }
    return events;
  }

  async getNextgenThumbnails(): Promise<unknown[]> {
    return (await this.server.get('/client/nextgenThumbnails')).data;
  }

  async getNextgenStreams(): Promise<unknown[]> {
    return (await this.server.get('/client/nextgenStreams'));
  }

  protected watchForActivity() {
    const watchForActivity = async () => {
      process.nextTick(() => this.waitForActivity().then(() => watchForActivity()).catch((err: AxiosError) => {
        if (err.code === 'ECONNRESET') {
          //This just means that the request times out, this is normal if no activity happened
          watchForActivity();
        } else {
          if (this.watchdog?.errorHandler) {
            this.watchdog.errorHandler(err);
          }
          setTimeout(() => watchForActivity(), 5000);
        }
      }));
    };
    watchForActivity();
  }
}
export const parseError = (axiosError: AxiosError) => {
  const Error: XHomeError = {
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
};