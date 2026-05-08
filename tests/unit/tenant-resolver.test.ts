import { describe, expect, it } from 'vitest';

import { resolveTenant } from '@/lib/tenant/resolver';

describe('resolveTenant', () => {
  describe('apex y www → public', () => {
    it('rehai.app /', () => {
      expect(resolveTenant({ host: 'rehai.app', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });

    it('www.rehai.app /', () => {
      expect(resolveTenant({ host: 'www.rehai.app', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });

    it('rehai.app /precios', () => {
      expect(resolveTenant({ host: 'rehai.app', pathname: '/precios' })).toEqual({
        type: 'public',
        pathname: '/precios',
      });
    });

    it('rehai.app con port se trata igual', () => {
      expect(resolveTenant({ host: 'rehai.app:443', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });
  });

  describe('subdomain bajo rehai.app → tenant', () => {
    it('movewell.rehai.app /dashboard', () => {
      expect(resolveTenant({ host: 'movewell.rehai.app', pathname: '/dashboard' })).toEqual({
        type: 'tenant',
        tenantSlug: 'movewell',
        source: 'subdomain',
        pathname: '/dashboard',
      });
    });

    it('host en mayúsculas se normaliza a lowercase', () => {
      expect(resolveTenant({ host: 'MOVEWELL.REHAI.APP', pathname: '/' })).toEqual({
        type: 'tenant',
        tenantSlug: 'movewell',
        source: 'subdomain',
        pathname: '/',
      });
    });

    it('slug con guion (demo-rehab.rehai.app)', () => {
      expect(resolveTenant({ host: 'demo-rehab.rehai.app', pathname: '/agenda' })).toEqual({
        type: 'tenant',
        tenantSlug: 'demo-rehab',
        source: 'subdomain',
        pathname: '/agenda',
      });
    });
  });

  describe('subdomains reservados', () => {
    it('admin.rehai.app', () => {
      expect(resolveTenant({ host: 'admin.rehai.app', pathname: '/' })).toEqual({
        type: 'reserved',
        subdomain: 'admin',
        pathname: '/',
      });
    });

    it('api.rehai.app', () => {
      expect(resolveTenant({ host: 'api.rehai.app', pathname: '/health' })).toEqual({
        type: 'reserved',
        subdomain: 'api',
        pathname: '/health',
      });
    });

    it('cdn.rehai.app', () => {
      expect(resolveTenant({ host: 'cdn.rehai.app', pathname: '/foo.svg' })).toEqual({
        type: 'reserved',
        subdomain: 'cdn',
        pathname: '/foo.svg',
      });
    });

    it('subdomain multi-nivel (foo.bar.rehai.app) bloqueado', () => {
      expect(resolveTenant({ host: 'foo.bar.rehai.app', pathname: '/' })).toEqual({
        type: 'reserved',
        subdomain: 'foo.bar',
        pathname: '/',
      });
    });

    it('subdomain con caracteres inválidos (foo_bar.rehai.app)', () => {
      expect(resolveTenant({ host: 'foo_bar.rehai.app', pathname: '/' })).toEqual({
        type: 'reserved',
        subdomain: 'foo_bar',
        pathname: '/',
      });
    });
  });

  describe('hosts de desarrollo → public sin path prefix', () => {
    it('localhost:3000 /', () => {
      expect(resolveTenant({ host: 'localhost:3000', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });

    it('127.0.0.1 /', () => {
      expect(resolveTenant({ host: '127.0.0.1', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });

    it('0.0.0.0 /', () => {
      expect(resolveTenant({ host: '0.0.0.0', pathname: '/' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });
  });

  describe('path prefix /t/[slug]', () => {
    it('localhost con /t/movewell/dashboard', () => {
      expect(resolveTenant({ host: 'localhost:3000', pathname: '/t/movewell/dashboard' })).toEqual({
        type: 'tenant',
        tenantSlug: 'movewell',
        source: 'path',
        pathname: '/dashboard',
      });
    });

    it('path prefix sin sub-path (/t/movewell)', () => {
      expect(resolveTenant({ host: 'localhost:3000', pathname: '/t/movewell' })).toEqual({
        type: 'tenant',
        tenantSlug: 'movewell',
        source: 'path',
        pathname: '/',
      });
    });

    it('path prefix tiene precedencia sobre subdomain', () => {
      // host=movewell.rehai.app sería tenant=movewell, pero /t/demo override
      expect(resolveTenant({ host: 'movewell.rehai.app', pathname: '/t/demo/x' })).toEqual({
        type: 'tenant',
        tenantSlug: 'demo',
        source: 'path',
        pathname: '/x',
      });
    });

    it('slug inválido en /t/[slug] cae a public si host es localhost', () => {
      expect(resolveTenant({ host: 'localhost:3000', pathname: '/t/_INVALID/x' })).toEqual({
        type: 'public',
        pathname: '/t/_INVALID/x',
      });
    });
  });

  describe('custom domain', () => {
    it('app.movewell.mx → custom-domain', () => {
      expect(resolveTenant({ host: 'app.movewell.mx', pathname: '/' })).toEqual({
        type: 'custom-domain',
        host: 'app.movewell.mx',
        pathname: '/',
      });
    });

    it('clinic.example.com /portal', () => {
      expect(resolveTenant({ host: 'clinic.example.com', pathname: '/portal' })).toEqual({
        type: 'custom-domain',
        host: 'clinic.example.com',
        pathname: '/portal',
      });
    });
  });

  describe('edge cases', () => {
    it('pathname vacío se trata como /', () => {
      expect(resolveTenant({ host: 'rehai.app', pathname: '' })).toEqual({
        type: 'public',
        pathname: '/',
      });
    });

    it('host vacío cae a custom-domain (caller decide)', () => {
      // En la práctica el middleware de Next siempre tiene host, pero por robustez
      const result = resolveTenant({ host: '', pathname: '/' });
      expect(result.type).toBe('custom-domain');
    });
  });
});
