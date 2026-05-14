import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'TraceFarm',
    logoUrl: './assets/images/logo/logo-light.png',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44364/',
    redirectUri: baseUrl,
    clientId: 'TraceFarm_App',
    responseType: 'code',
    scope: 'offline_access TraceFarm',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44364',
      rootNamespace: 'TraceVerified.TraceFarm',
    },
    process: {
      url: 'https://unidouatapi.traceverified.com',
    },
    recordV2: {
      url: 'https://tv2api.traceverified.com'
    }
  },
} as Environment;
