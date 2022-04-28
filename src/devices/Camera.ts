import axios from 'axios';
import XHome from '..';
import { CommandResponse } from '../GlobalInterfaces';

export default class Camera {
  constructor(
    public xhome: XHome, public device: CameraDevice,
  ) { }

  get(): Promise<CameraDevice> {
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
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.device = response.data;
        resolve(response.data);
      }).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  label(value: string): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links.label.href}&value=${value}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/update/device',
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
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }
}
export interface CameraDevice {
  webrtcCapable: boolean;
  xboOnly: boolean;
  firmwareVersion: string;
  hardwareId: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  status: 'online' | string;
  technology: 'wifi' | 'zigbee';
  _links: {
    self: {
      href: string;
    };
    label: {
      method: 'POST';
      href: string;
    };
  };
  cvr: {
    capable: boolean;
    enabled: boolean;
    cvrToken: {
      token: string;
      expires_in: number;
    };
    incapableReason: 'MODEL_NOT_CAPABLE' | string;
  };
  model: string;
  deletable: boolean;
  deviceType: 'camera';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: string;
  properties: {
    videoFormat: 'MJPEG,FLV,RTSP' | string;
    aspectRatio: '4:3' | string;
    label: string;
    motionCapable: boolean;
    resolution: '640:480' | string;
    isVideoRecordable: boolean;
    videoCodec: 'H264,MPEG4' | string;
  };
  icontrolModel: string;
}