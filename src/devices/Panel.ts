import axios from 'axios';
import XHome from '..';
import { CommandResponse, DeltaEvent, Event } from '../GlobalInterfaces';

export default class Panel {
  public history: PanelEvent[] = [];
  public eventCallback?: (event: PanelEvent) => void;
  public activityCallback?: (event: PanelDeltaEvent) => void;

  constructor(
    public xhome: XHome, public device: PanelDevice,
  ) {
    xhome.events.on('event', (data: Event) => {
      if (data.instanceId === undefined) {
        this.history.unshift(data as PanelEvent);
        if (this.eventCallback) {
          this.eventCallback(data as PanelEvent);
        }
      }
    });
    xhome.events.on('activity', (data: DeltaEvent) => {
      if (data.deviceId === null) {
        if (this.activityCallback) {
          this.activityCallback(data as PanelDeltaEvent);
        }
      }
    });
  }

  /**
   * Arm Your Xfinity Home System
   * @param code your Keypad Code
   * @param mode What arm mode to use
   * @returns a command id
   */
  arm(code: string | number, mode: 'stay' | 'night' | 'away'): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `code=${code}&path=${this.device._links['panel/arm'].href}&armType=${mode}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/panel/arm',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  disarm(code: string | number): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links['panel/disarm'].href}&code=${code}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/panel/disarm',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  get(): Promise<PanelDevice> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://xhomeapi-lb-prod.codebig2.net${this.device._links.self.href}`,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 3000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.device = response.data;
        resolve(response.data);
      }).catch(err => reject(this.xhome.parseError(err)));
    });
  }
}


export interface PanelDeltaEvent {
  commandId: null;
  deviceId: null;
  mediaType: 'event/securityStateChange';
  timestamp: number;
  name: null;
  value: null | string;
  channel: null;
  metadata: {
    eventTime: string;
    trouble: 'false' | 'true';
    armType: null | string;
    status: 'notReady' | string;
  };
}
export interface PanelEvent {
  channel: 'B' | string;
  eventId: string;
  mediaType: 'event/armDisarm';
  timestamp: number;
  value: 'disarmed' | 'armedNight' | 'armedAway' | 'armedStay' | 'exitDelay';
  properties: {
    armLocation: 'Server' | 'CpeKeypad' | string;
    eventTime: string;
    user: 'Master' | string;
    exitDelay?: 120 | number;
  };
  eventType: 'armDisarm';
  eventSubType: 'disarmed' | 'arming' | 'armedStay' | 'armedAway' | 'armedNight';
  recordingInfo: unknown[];
}
export interface PanelDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  technology: 'zigbee';
  _links: {
    'panel/arm': {
      method: 'POST';
      href: string;
    };
    self: {
      href: string;
    };
    'panel/disarm': {
      method: 'POST';
      href: string;
    };
  };
  model: string;
  deletable: boolean;
  deviceType: 'panel';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: string | '';
  properties: {
    macAddress: string;
    cellularConnected: boolean;
    zigBeeId: string;
    inTestMode: boolean;
    armType: 'away' | 'night' | 'stay' | '';
    bbConnected: boolean;
    status: 'ready' | 'arming' | 'readyArmed' | 'notReady';
  };
  icontrolModel: string;
}