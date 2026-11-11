# GastroMaster Pro - Sistema de Restaurante .NET 10 & React 19

Sistema de gestión y autoservicio para restaurantes con arquitectura de alto rendimiento, desarrollado para ejecutarse en **Microsoft Visual Studio 2026** (.NET 10 / ASP.NET Core) y **React 19 + Tailwind CSS**.

## Perfil del Desarrollador
* **Autor:** Agustín Ezequiel Carabajal
* **GitHub:** [https://github.com/Agustin-Carabajal](https://github.com/Agustin-Carabajal)
* **Repositorio sugerido:** `https://github.com/Agustin-Carabajal/gastromaster-restaurant-net10`

---

## 🚀 Cómo ejecutar desde Microsoft Visual Studio 2026

1. Clona o abre la carpeta del proyecto en tu máquina local.
2. Abre la solución `backend-dotnet/GastroMaster.sln` directamente con **Microsoft Visual Studio 2026**.
3. Presiona **F5** o **Ctrl + F5** para compilar y ejecutar el backend.
4. La API iniciará en `https://localhost:7001` con la documentación interactiva Swagger en:
   - `https://localhost:7001/swagger`
5. En paralelo, para ejecutar la interfaz de React:
   ```bash
   npm install
   npm run dev
   ```
   La aplicación cliente estará lista en `http://localhost:3000`.

---

## 📦 Cómo subir este repositorio a tu perfil de GitHub

Ejecuta los siguientes comandos desde la raíz del proyecto en tu terminal o PowerShell:

```bash
# 1. Iniciar git
git init

# 2. Agregar todos los archivos
git add .

# 3. Crear el commit inicial
git commit -m "feat: GastroMaster Pro - Sistema de Restaurante .NET 10 y React 19"

# 4. Establecer la rama main
git branch -M main

# 5. Conectar con tu repositorio en GitHub
git remote add origin https://github.com/Agustin-Carabajal/gastromaster-restaurant-net10.git

# 6. Subir los cambios
git push -u origin main
```

---

## 🌟 Características Principales Implementadas

1. **Módulo Cliente / Comensal:**
   - Selección de mesa y visualización de categorías (Comidas, Bebidas, Postres, Combos y Promociones).
   - Notas culinarias y advertencia destacada de alergias e intolerancias alimentarias.
   - Agrupación por comensal (Comensal 1, Comensal 2, etc.) en cada mesa.
   - Club GastroPuntos de fidelización (perfil de cliente, canje de recompensas).

2. **Módulo de Administración & Personal (Roles Mozo vs Gerente):**
   - **Salón de Mesas:** Estados en tiempo real (Libre, Reservada, Ocupada, No disponible), cobro e impresión de Boleta Electrónica (80mm).
   - **KDS Cocina y Barra:** Pantalla en vivo con alertas visuales de alérgenos y avance de estado (En espera ➔ En preparación ➔ Listo ➔ Servido).
   - **Arqueo Diario (Modernización de VB6):** Reinvención del formulario clásico de la imagen adjunta, automatizando el conteo de platos vendidos (Hamburguesa 43, Cerveza 72, Gaseosa 28...), cálculo de IGV (S/. 121.05), totalización (S/. 672.50) y cuadre de caja con efectivo, tarjetas y billeteras digitales (Yape/Plin).
   - **Reportes Financieros Mensuales:** Facturación mensual, utilidad neta, horas pico y matriz BCG de ingeniería de menú.
   - **Inventario:** Control de materia prima con alertas de stock bajo y reabastecimiento.
   - **Gestión de Menú:** Modificación de precios, combos y alérgenos.
