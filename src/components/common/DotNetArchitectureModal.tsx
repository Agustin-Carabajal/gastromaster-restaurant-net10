import React, { useState } from 'react';
import {
  Code2,
  Github,
  Server,
  Layers,
  CheckCircle,
  Copy,
  Terminal,
  ExternalLink,
  Cpu,
  Database,
  Radio,
} from 'lucide-react';

export const DotNetArchitectureModal: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const gitCommands = `# 1. Inicializar repositorio Git en el proyecto local
git init

# 2. Agregar todos los archivos (Frontend React 19 + Backend .NET 10)
git add .

# 3. Crear el primer commit con la arquitectura completa
git commit -m "feat: GastroMaster Pro - Sistema de Restaurante Integral en .NET 10 y React 19"

# 4. Establecer la rama principal
git branch -M main

# 5. Vincular a tu perfil de GitHub (Agustin-Carabajal)
git remote add origin https://github.com/Agustin-Carabajal/gastromaster-restaurant-net10.git

# 6. Subir el código a tu repositorio remoto
git push -u origin main`;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Arquitectura Enterprise .NET 10 & React 19</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Configuración para Microsoft Visual Studio 2026 y GitHub
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
              Diseñado con arquitectura limpia (Clean Architecture / Vertical Slices) en C# 14 / ASP.NET Core 10, Entity Framework Core 10, WebSockets / SignalR para cocina en tiempo real y frontend React 19 de alto rendimiento.
            </p>
          </div>

          <a
            href="https://github.com/Agustin-Carabajal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white text-neutral-900 font-bold text-xs flex items-center gap-2 hover:bg-neutral-100 transition-colors shadow-sm"
          >
            <Github className="w-4 h-4" />
            <span>Perfil: github.com/Agustin-Carabajal</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* GitHub Repository Push Guide */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Comandos de Git para Publicar en tu Perfil de GitHub
            </h2>
          </div>

          <button
            onClick={() => copyToClipboard(gitCommands, 'git')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            {copiedSection === 'git' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar comandos</span>
              </>
            )}
          </button>
        </div>

        <div className="relative bg-neutral-950 text-neutral-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <pre>{gitCommands}</pre>
        </div>

        <p className="text-xs text-neutral-500">
          Nota: Si aún no has creado el repositorio en GitHub, visita{' '}
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 font-semibold underline"
          >
            github.com/new
          </a>
          , nómbralo <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">gastromaster-restaurant-net10</code> y luego ejecuta los comandos anteriores en la terminal.
        </p>
      </div>

      {/* Visual Studio 2026 Run Instructions & Backend Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VS 2026 Setup */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Ejecución desde Microsoft Visual Studio 2026
            </h3>
          </div>

          <ol className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 list-decimal list-inside">
            <li className="leading-relaxed">
              <strong className="text-neutral-900 dark:text-neutral-100">Abre la solución:</strong> Haz doble clic sobre el archivo <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">backend-dotnet/GastroMaster.sln</code> provisto en este repositorio con Visual Studio 2026.
            </li>
            <li className="leading-relaxed">
              <strong className="text-neutral-900 dark:text-neutral-100">Restauración de paquetes NuGet:</strong> Visual Studio 2026 restaurará automáticamente <code className="font-mono">Microsoft.EntityFrameworkCore</code>, <code className="font-mono">Microsoft.AspNetCore.SignalR</code>, y <code className="font-mono">Swashbuckle.AspNetCore</code>.
            </li>
            <li className="leading-relaxed">
              <strong className="text-neutral-900 dark:text-neutral-100">Iniciar con F5 / Ctrl+F5:</strong> La API de ASP.NET Core 10 arrancará en <code className="font-mono">https://localhost:7001</code> con Swagger OpenAPI interactivo en <code className="font-mono">/swagger</code>.
            </li>
            <li className="leading-relaxed">
              <strong className="text-neutral-900 dark:text-neutral-100">Frontend React 19 integrado:</strong> En el mismo directorio raíz ejecuta <code className="font-mono">npm install && npm run dev</code> para servir la interfaz web en puerto 3000 con conexión directa al backend.
            </li>
          </ol>
        </div>

        {/* Clean Architecture Stack */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Capas y Tecnologías Seleccionadas
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 flex items-start gap-3">
              <Radio className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">SignalR Hubs (Tiempo Real KDS)</span>
                <p className="text-[11px] text-neutral-500">
                  Notifica instantáneamente a la pantalla de cocina y barra cuando un comensal o mozo envía una orden.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 flex items-start gap-3">
              <Database className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Entity Framework Core 10</span>
                <p className="text-[11px] text-neutral-500">
                  Mapeo relacional para Mesas, Comensales, Pedidos, Inventario y Arqueos Diarios con migraciones automáticas.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 flex items-start gap-3">
              <Code2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Controllers RESTful y DTOs Tipados</span>
                <p className="text-[11px] text-neutral-500">
                  Endpoints limpios para /api/orders, /api/tables, /api/daily-closing, /api/inventory y /api/loyalty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
