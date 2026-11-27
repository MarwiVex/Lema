# Configuración de Seguridad Zero Trust (Cloudflare Tunnels)

La aplicación **Lema** está diseñada para ser privada. En lugar de exponer el puerto 3000 al internet público o tener que gestionar reglas de firewall y certificados SSL manualmente, utilizaremos **Cloudflare Tunnels** (`cloudflared`).

Esto permite:
- Ocultar la IP real de tu servidor.
- Proveer encriptación SSL automática.
- Integrar reglas de acceso (ej. requerir autenticación de Google/GitHub antes de cargar la página).

## Prerrequisitos

1. Una cuenta de Cloudflare activa.
2. Un dominio gestionado en Cloudflare.
3. El ejecutable `cloudflared` instalado en tu servidor.
   - [Guía de Instalación de Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

## Paso 1: Autenticación

En la terminal de tu servidor, ejecuta:

```bash
cloudflared tunnel login
```

Esto abrirá una ventana en tu navegador. Selecciona tu dominio para autorizar el certificado.

## Paso 2: Crear el Túnel

```bash
cloudflared tunnel create lema-tunnel
```

Copia el `Tunnel ID` que aparece en la salida (ej. `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

## Paso 3: Archivo de Configuración

Crea un archivo llamado `config.yml` en el directorio `~/.cloudflared/`:

```yaml
tunnel: <TU_TUNNEL_ID>
credentials-file: /home/usuario/.cloudflared/<TU_TUNNEL_ID>.json

ingress:
  - hostname: lema.tudominio.com
    service: http://localhost:3000
  - service: http_status:404
```

*Nota: Asegúrate de cambiar `lema.tudominio.com` y las rutas a tu archivo JSON.*

## Paso 4: Configurar el DNS

Asocia tu dominio al túnel:

```bash
cloudflared tunnel route dns lema-tunnel lema.tudominio.com
```

## Paso 5: Ejecutar el Túnel

Arranca tu aplicación Lema normalmente:
```bash
npm run build
npm start
```

En otra terminal, inicia el túnel:
```bash
cloudflared tunnel run lema-tunnel
```

¡Listo! Tu aplicación estará sirviéndose de forma segura a través de Cloudflare. Nadie podrá acceder al puerto 3000 directamente desde fuera si tienes tu firewall local (ufw) cerrado por defecto.

## (Opcional) Autenticación Adicional
Puedes ir al panel de **Cloudflare Zero Trust** -> **Access** -> **Applications** y crear una regla para `lema.tudominio.com` que requiera un inicio de sesión con tu cuenta de correo personal. Esto añade una capa extra sobre la autenticación JWT interna de Lema.
