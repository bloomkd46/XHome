import axios, { AxiosError } from 'axios';
import { EventEmitter } from 'events';
import Camera, { CameraDevice } from './devices/Camera';
import DryContact, { DryContactDevice, DryContactEvent } from './devices/DryContact';
import Keyfob, { KeyfobDevice } from './devices/Keyfob';
import Keypad, { KeypadDevice } from './devices/Keypad';
import Light, { LightDevice } from './devices/Light';
import Motion, { MotionDevice, MotionEvent } from './devices/Motion';
import Panel, { PanelDevice, PanelEvent } from './devices/Panel';
import { DeltaEvent, Device, Event, loginResponse, Profile } from './GlobalInterfaces';

export {
  Camera, CameraDevice, DryContact, DryContactDevice, DryContactEvent, Keyfob, KeyfobDevice, Keypad, KeypadDevice,
  Light, LightDevice, Motion, MotionDevice, MotionEvent, Panel, PanelDevice, PanelEvent, Device, Event, loginResponse,
};
export default class XHome {
  public events = new EventEmitter();
  public devices: Device[] = [];
  public history: Event[] = [];

  public UnsuportedDevices: Device[] = [];
  public Panel: Panel[] = [];
  public Lights: Light[] = [];
  public DryContactSensors: DryContact[] = [];
  public MotionSensors: Motion[] = [];
  public Cameras: Camera[] = [];
  public Keypads: Keypad[] = [];
  public Keyfobs: Keyfob[] = [];

  public refreshToken = '';
  protected refreshTokens: string[] = [];
  public accessToken = '';
  protected accessTokens: string[] = [];
  public xhAuth = '';
  public tokenType = '';
  //public spsId = '';

  public Profile!: Profile;

  public activityCallback?: (event: DeltaEvent) => void;
  public eventCallback?: (event: Event) => void;

  protected constructor();
  /**
   * Connects to Xfinity Home using a Refresh Token
   * @param refreshToken your Xfinity Home Refresh Token
   */
  protected constructor(refreshToken: string);
  /**
   * NOTE: currently unsuported
   * Uses your Xfinity Hom Credentials to fetch a Refresh Token
   * @param email your Xfinity Home email
   * @param password your Xfinity Home password
   */
  protected constructor(email: string, password: string);
  protected constructor(refreshToken?: string, email?: string, password?: string) {
    this.events.on('authenticated', (data: loginResponse) => {
      if (!this.refreshTokens.includes(data.refresh_token)) {
        this.refreshTokens.push(data.refresh_token);
      }
      if (!this.accessTokens.includes(data.access_token)) {
        this.accessTokens.push(data.access_token);
      }
      setTimeout(() => {
        this.login(data.refresh_token).then(data => {
          this.events.emit('authenticated', data);
        }).catch(err => this.events.emit('error', err));
      }, (data.expires_in - 1) * 1000);
    });
    this.events.on('event', (event: Event) => {
      this.history.unshift(event);
      if (this.eventCallback) {
        this.eventCallback(event);
      }
    });
    this.events.on('activity', (event: DeltaEvent) => {
      if (this.activityCallback) {
        this.activityCallback(event);
      }
    });
    //this.events.on('initialized', () => this.watchForEvents(500, 5000, 5000));

    //return (async (): Promise<XHome> => {
    if (refreshToken) {
      this.login(refreshToken).then(data => {
        this.watchForEvents();
        this.events.emit('authenticated', data);
        this.setupDevices().then(() => this.events.emit('initialized')).catch(err => this.events.emit('error', err));
      }).catch(err => this.events.emit('error', err));
    } else if (email && password) {
      //throw new Error('Not Yet Implemented');
      this.login(email, password).then(data => {
        this.refreshToken = data.refresh_token;
        this.accessToken = data.access_token;
        this.xhAuth = data.XhAuth;
        this.tokenType = data.token_type;
        this.events.emit('authenticated', data);
        this.setupDevices().then(() => this.events.emit('initialized')).catch(err => this.events.emit('error', err));
      }).catch(err => this.events.emit('error', err));
    }
  }

  /**
   * Connects to Xfinity Home using a Refresh Token
   * @param refreshToken your Xfinity Home Refresh Token
   */
  public static init(refreshToken: string): Promise<XHome>;
  /**
  * @deprecated NOTE: currently unsuported.
  * Uses your Xfinity Home Credentials to fetch a Refresh Token
  * @param email your Xfinity Home email
  * @param password your Xfinity Home password
  */
  public static init(email: string, password: string): Promise<XHome>;
  public static init(refreshToken?: string, email?: string, password?: string): Promise<XHome> {
    return new Promise((resolve, reject) => {
      let xhome: XHome;
      try {
        if (refreshToken) {
          xhome = new XHome(refreshToken);
        } else if (email && password) {
          xhome = new XHome(email, password);
        } else {
          reject(new Error('No Refresh Token provided'));
          return;
        }
        xhome.events.on('error', err => reject(err));
        xhome.events.on('initialized', () => resolve(xhome));
      } catch (err) {
        reject(err);
      }
    });
  }

  protected setupDevices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDevices().then(devices => {
        this.getHistory().then(history => {
          for (const device of devices) {
            switch (device.deviceType) {

              case 'panel':
                this.Panel.push(new Panel(this, device as PanelDevice));
                break;
              case 'lightSwitch':
                this.Lights.push(new Light(this, device as LightDevice));
                break;
              case 'sensor':
                if (device.properties.sensorType === 'dryContact') {
                  this.DryContactSensors.push(new DryContact(this, device as DryContactDevice));
                  break;
                } else if (device.properties.sensorType === 'motion') {
                  this.MotionSensors.push(new Motion(this, device as MotionDevice));
                  break;
                } else {
                  continue;
                }
              case 'camera':
                this.Cameras.push(new Camera(this, device as CameraDevice));
                break;
              case 'peripheral':
                if (device.properties.type === 'keypad') {
                  this.Keypads.push(new Keypad(this, device as KeypadDevice));
                  break;
                } else if (device.properties.type === 'keyfob') {
                  this.Keyfobs.push(new Keyfob(this, device as KeyfobDevice));
                  break;
                } else {
                  continue;
                }
              default:
                this.UnsuportedDevices.push(device);
                break;
            }
          }
          for (const event of history.reverse()) {
            this.history.unshift(event);
            this.events.emit('event', event);
          }
          this.DryContactSensors = this.DryContactSensors.sort((a, b) => {
            return a.device.properties.displayOrder - b.device.properties.displayOrder;
          });
          this.MotionSensors = this.MotionSensors.sort((a, b) => {
            return a.device.properties.displayOrder - b.device.properties.displayOrder;
          });
          resolve();
        }).catch(err => reject(this.parseError(err)));
      }).catch(err => reject(this.parseError(err)));
    });
  }

  /**
   * NOTE: currently unsuported
   * @param email your Xfinity Home email
   * @param password your Xfinity Home password
   * @returns a Refresh Token
   */
  protected login(email: string, password: string): Promise<loginResponse>;
  /**
   * Logs into Xfinity Home using a Refresh Token
   * @param refreshToken a Refresh Token
   * @returns login credentials
   */
  protected login(refreshToken: string): Promise<loginResponse>;

  protected login(refreshToken?: string, email?: string, password?: string): Promise<loginResponse> {
    if (refreshToken) {
      return new Promise((resolve, reject) => {
        const body = `redirect_uri=xfinityhome://auth&refresh_token=${refreshToken}&grant_type=refresh_token`;
        axios({
          method: 'post',
          url: 'https://oauth.xfinity.com/oauth/token',
          data: body,
          headers: {
            'Host': 'oauth.xfinity.com',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Connection': 'keep-alive',
            'Accept-Language': 'en-us',
            'Content-Length': body.length,
            'Authorization': 'Basic WGZpbml0eS1Ib21lLWlPUy1BcHA6NzdiMzY2ZjlhMTM1YzdhYjM5MTA0NDIzNGEyNmIxZDZiMWUwOGY2Ng==',
          },
          validateStatus: (status) => {
            return status === 200;
          },
          timeout: 3000,
          timeoutErrorMessage: 'Request Timed Out',
        }).then(response => {
          const data: loginResponse = response.data;
          this.accessToken = data.access_token;
          this.refreshToken = data.refresh_token;
          this.tokenType = data.token_type;
          this.getProfile().then(profile => {
            data.XhAuth = profile.sessionInfo.sessionHeaderValue;
            this.xhAuth = profile.sessionInfo.sessionHeaderValue;
            //this.getSpsId().then(spsId => {
            //data.spsId = spsId;
            //this.spsId = spsId;
            resolve(data);
            //}).catch(err => reject(this.parseError(err)));
          }).catch(err => reject(this.parseError(err)));
        }).catch(err => reject(this.parseError(err)));
      });
    } else if (email && password) {
      throw new Error('Not Yet Implemented');
    } else {
      throw new Error('No Refresh Token Or Acount Credentials Provided.');
    }
  }

  public logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      //const body = `{ accessTokens: [${this.accessTokens.toString()}], refreshTokens: [${this.refreshTokens.toString()}] }`;
      const body = JSON.stringify({ accessTokens: this.accessTokens, refreshTokens: this.refreshTokens });
      axios({
        method: 'post',
        url: 'https://oauth.xfinity.com/oauth/discard',
        data: body,
        headers: {
          'Host': 'oauth.xfinity.com',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Connection': 'keep-alive',
          'Accept-Language': 'en-us',
          'Content-Length': body.length,
          'Authorization': 'Basic WGZpbml0eS1Ib21lLWlPUy1BcHA6NzdiMzY2ZjlhMTM1YzdhYjM5MTA0NDIzNGEyNmIxZDZiMWUwOGY2Ng==',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(() => resolve()).catch(err => reject(this.parseError(err)));
    });
  }

  protected getProfile(): Promise<Profile> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client',
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Accept': 'application/json',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(data => {
        this.Profile = data.data; resolve(data.data);
      }).catch(err => reject(this.parseError(err)));
    });
  }

  /*protected getSpsId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({ platform: 'ios', deviceId: '', token: '' });
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/v1/subscribe',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(data => resolve(data.headers['x-vcap-request-id'])).catch(err => reject(this.parseError(err)));
    });
  }*/

  /**
 * Fetches all the devices on your acount
 * @returns an Array of devices from your acount
 */
  protected getDevices(): Promise<Device[]> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/devices',
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data.devices)).catch(err => reject(this.parseError(err)));
    });
  }

  /**
   * get all the events for a specific day returning the most recent first
   * @param day What day to get the history for
   * @returns the events of the specified day
   */
  protected getHistory(day?: 0 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9 | -10 | -11 | -12 | -13 | -14 | -15 |
    -16 | -17 | -18 | -19 | -20 | -21 | -22 | -23 | -24 | -25 | -26 | -27 | -28 | -29): Promise<Event[]> {
    return new Promise((resolve, reject) => {

      if (day) {
        axios({
          method: 'get',
          url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/history/day?day=' + day,
          headers: {
            'Host': 'xhomeapi-lb-prod.codebig2.net',
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
            'Xh-Auth': this.xhAuth,
            'Accept': 'application/json',
            'Authorization': `${this.tokenType} ${this.accessToken}`,
            'Accept-Language': 'en-us',
            'Accept-Encoding': 'gzip, deflate, br',

          },
          validateStatus: (status) => {
            return status === 200;
          },
          timeout: 3000,
          timeoutErrorMessage: 'Request Timed Out',
        }).then(response => resolve(response.data.events)).catch(err => reject(this.parseError(err)));

      } else {
        const promises: Promise<Event[]>[] = [];
        for (let i = 0; i > -30; i--) {
          //promises.push(this.getHistory(i as 0));
          promises.push(new Promise<Event[]>((resolve, reject) => {
            axios({
              method: 'get',
              url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/history/day?day=' + i,
              headers: {
                'Host': 'xhomeapi-lb-prod.codebig2.net',
                'Content-Type': 'application/json',
                'Connection': 'keep-alive',
                'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
                'Xh-Auth': this.xhAuth,
                'Accept': 'application/json',
                'Authorization': `${this.tokenType} ${this.accessToken}`,
                'Accept-Language': 'en-us',
                'Accept-Encoding': 'gzip, deflate, br',

              },
              validateStatus: (status) => {
                return status === 200;
              },
              timeout: 3000,
              timeoutErrorMessage: 'Request Timed Out',
            }).then(response => resolve(response.data.events)).catch(err => reject(this.parseError(err)));
          }));
        }
        Promise.all(promises).then(responses => {
          let events: Event[] = [];
          for (const response of responses) {
            events = events.concat(response);
          }
          resolve(events);
        }).catch(err => reject(this.parseError(err)));
      }
    });

  }

  protected waitForEvent(): Promise<DeltaEvent[]> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: 'https://xhomeapi-lb-prod.apps.cloud.comcast.net/client/icontrol/delta', //?spsId=' + this.spsId,
        headers: {
          'Host': 'xhomeapi-lb-prod.apps.cloud.comcast.net',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',

        },
        validateStatus: (status) => {
          return status === 200;
        },
      }).then(response => resolve(response.data)).catch(err => reject(this.parseError(err)));
    });
  }

  protected watchForEvents() {
    const loop = () => {
      this.waitForEvent().then((events) => {
        if (events && events.length > 0) {
          for (const event of events) {
            this.events.emit('activity', event);
          }
          this.getHistory(0).then((history) => {
            for (const event of history) {
              if (!this.history.find(x => x.timestamp === event.timestamp)) {
                this.events.emit('event', event);
              }
            }
          }).catch(() => {
            //do nothing
          });
        }
        loop();
      }).catch(err => {
        setTimeout(() => loop(), 1000);
      });
    };
    loop();
  }

  public parseError(error: AxiosError): string {
    const object: string[] = [];
    if (error.message) {
      // Something happened in setting up the request that triggered an Error
      object.push('Message: ' + error.message);
    } else {
      object.push(error as unknown as string);
    }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      object.push('Status: ' + error.response.status.toString());
      object.push('Headers: ' + JSON.stringify(error.response.headers, null, 2));
      object.push('Data: ' + JSON.stringify(error.response.data, null, 2));
    }
    //object.push(error.config);
    return object.join('\n');
  }
}
