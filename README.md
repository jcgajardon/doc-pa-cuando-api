
# 🧠 DocPaCuándo - Notificador de Horas en Clínica Dávila

Un pequeño script en Node.js que consulta la disponibilidad de horas médicas en [Clínica Dávila](https://agendaweb.davila.cl) y te envía un correo si hay cupos disponibles. Ideal para pacientes ansiosos 🫣 o padres preocupados por encontrar hora para sus hijos.

---

## 🚀 ¿Cómo funciona?

Este script envía una solicitud HTTP simulando la búsqueda de una hora médica específica (doctor, especialidad y consulta). Si encuentra disponibilidad, te avisa por correo electrónico. Si no hay, también te notifica para que sepas que sigue todo igual.

El script puede verificar la disponibilidad de múltiples doctores, enviando notificaciones de forma independiente para cada uno.

---

## 📦 Requisitos

- Node.js (v14+ recomendado)
- Una cuenta de Gmail (para enviar los correos)
- Tener activado el acceso a apps menos seguras o una contraseña de aplicación en Gmail
- Un archivo `doctors.json` en la carpeta `config` con la configuración de los doctores (nombre, ID de especialidad, ID de doctor, ID de oficina)

---

## 🔧 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/docpacuando.git
cd docpacuando
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
GMAIL_USER=tu_correo@gmail.com
GMAIL_PASS=tu_contraseña_o_app_password
EMAIL_TO=destinatario1@gmail.com
SECOND_EMAIL=destinatario2@gmail.com
PATIENT_RUT=12345678-9
```

4. Crea un archivo `config/doctors.json` con la información de los doctores que quieres monitorear. Ejemplo:

```json
[
  {
    "name": "Dra. John Doe - Medicina General",
    "spec_id": "30101022",
    "doc_id": "23771",
    "office_id": "TODOS"
  }
]
```

> Puedes obtener los valores de `spec_id`, `doc_id` y `office_id` inspeccionando las llamadas de red en la página de agendamiento de Dávila.

---

## ▶️ Uso

Ejecuta el script manualmente con:

```bash
npm start
```

Esto hará **una sola verificación** por cada doctor configurado en el archivo `doctors.json` y enviará un correo con el resultado de la disponibilidad.

---

## 📬 Resultado del correo

Si **hay hora disponible**, recibirás un correo con el asunto:

> ¡Hay una cita disponible en Clínica Dávila!

Y el mensaje con un link directo al portal de agendamiento.

Si **no hay hora disponible**, también recibirás un correo notificando que no hay disponibilidad.

---

## 📅 Automatización (Opcional)

Puedes usar un servicio como [Render Cron Jobs](https://render.com/docs/cron-jobs) o programarlo en un `cron` local para ejecutar este script automáticamente cada cierto tiempo. Esto te permitirá tener notificaciones continuas sin intervención manual.

---

## 📢 Terminación del proceso

El script está diseñado para **terminar el proceso de manera limpia** después de realizar todas las verificaciones de disponibilidad, utilizando `process.exit(0)` para indicar que todo se ejecutó correctamente.

---

## 📄 Licencia

MIT © 2025 - Juan Gajardo

---

## ❤️ Agradecimientos

Gracias a la ansiedad, a la burocracia del sistema de salud y a la fuerza imparable de los padres buscando hora para sus hijos 👶🧠💪.
