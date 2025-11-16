# TP1 — Backend Monolítico para Comercio de Ropa

**Materia:** Programación  
**Tecnologías:** Node.js, Express, MySQL  
**Alumno:** José Ignacio Díaz Romero

---

# 📌 Descripción General

Este trabajo práctico consiste en el desarrollo de un **backend monolítico** para un comercio de venta de ropa.  
El sistema tiene como objetivo administrar:

- Clientes
- Productos con stock
- Ventas
- Detalle de ventas
- Actualización automática de stock
- Listados de toda la información relevante

El proyecto se realizó utilizando **Node.js + Express** para el servidor y **MySQL** para la base de datos.  
**No se utiliza middleware, JSON Web Token, ni hashing**, cumpliendo estrictamente los requisitos del enunciado.

---

# 📁 Estructura del Proyecto

tp1_comercio_ropa_back/
│── node_modules/
│── db.js
│── index.js
│── package.json
│── package-lock.json
│── README.md
│── .gitignore

yaml
Copiar código

---

# ⚙️ Tecnologías Utilizadas

- **Node.js** (JavaScript runtime)
- **Express.js** (framework para crear el servidor)
- **MySQL** (base de datos relacional)
- **mysql2** (driver para conectar Node ↔ MySQL)
- **Nodemon** (solo para desarrollo)

---

# 🗄️ Modelo de Base de Datos (DER)

El sistema utiliza 4 tablas:

### **1) clientes**

| Campo    | Tipo         | Descripción               |
| -------- | ------------ | ------------------------- |
| id       | INT PK AI    | Identificador del cliente |
| nombre   | VARCHAR(100) | Nombre del cliente        |
| telefono | VARCHAR(20)  | Teléfono                  |
| mail     | VARCHAR(100) | Correo                    |

### **2) productos**

| Campo  | Tipo          | Descripción |
| ------ | ------------- | ----------- |
| id     | INT PK AI     |
| nombre | VARCHAR(100)  |
| talle  | VARCHAR(10)   |
| color  | VARCHAR(50)   |
| precio | DECIMAL(10,2) |
| stock  | INT           |

### **3) ventas**

| Campo      | Tipo                 | Descripción |
| ---------- | -------------------- | ----------- |
| id         | INT PK AI            |
| cliente_id | INT FK → clientes.id |
| fecha      | DATETIME             |
| total      | DECIMAL(10,2)        |

### **4) detalle_ventas**

Cada venta puede tener varios productos:

| Campo           | Tipo                  | Descripción |
| --------------- | --------------------- | ----------- |
| id              | INT PK AI             |
| venta_id        | INT FK → ventas.id    |
| producto_id     | INT FK → productos.id |
| cantidad        | INT                   |
| precio_unitario | DECIMAL(10,2)         |

> Relación:  
> **Cliente 1---N Ventas**,  
> **Venta 1---N Detalles**,  
> **Producto 1---N Detalles**.

---

# 🛠 Instalación y Configuración

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/N4cH0Dev/tp1_comercio_ropa_back.git
cd tp1_comercio_ropa_back
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Crear la base de datos en MySQL
Ejecutar este SQL completo:

sql
Copiar código
CREATE DATABASE comercio_ropa;
USE comercio_ropa;

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  mail VARCHAR(100)
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  talle VARCHAR(10),
  color VARCHAR(50),
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);

CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
▶️ Ejecución del Servidor
🔹 Modo desarrollo (con nodemon)
bash
Copiar código
npm run dev
🔹 Modo producción
bash
Copiar código
npm start
El servidor corre en:

arduino
Copiar código
http://localhost:3000
📚 Endpoints del Sistema
👤 Clientes
➕ Crear cliente
POST /clientes

Body:

json
Copiar código
{
  "nombre": "Juan Perez",
  "telefono": "381555555",
  "mail": "juan@mail.com"
}
📄 Listar clientes
GET /clientes

👕 Productos
➕ Crear producto
POST /productos

Body:

json
Copiar código
{
  "nombre": "Remera Negra",
  "talle": "M",
  "color": "Negro",
  "precio": 15000,
  "stock": 10
}
📄 Listar productos
GET /productos

🧾 Ventas
➕ Registrar venta (con descuento de stock)
POST /ventas

json
Copiar código
{
  "cliente_id": 1,
  "items": [
    { "producto_id": 1, "cantidad": 2 }
  ]
}
Respuesta:

json
Copiar código
{
  "mensaje": "Venta registrada correctamente",
  "venta_id": 1,
  "total": 30000
}
📄 Listar ventas
GET /ventas

📄 Detalle de una venta
GET /ventas/:id/detalle

🧠 Lógica del Sistema
Se pueden registrar clientes y productos.

Las ventas se asocian a un cliente existente.

Cada venta tiene uno o varios ítems (detalle_ventas).

El sistema descuenta automáticamente el stock del producto.

Si el stock es insuficiente → la venta se cancela.

MySQL maneja la integridad mediante transacciones y claves foráneas.

El backend es totalmente monolítico, simple y sin autenticación.

📌 Conclusiones
El sistema desarrollado permite administrar correctamente un comercio de ropa:

✔ Registro de clientes
✔ Manejo de productos con stock
✔ Registro de ventas
✔ Detalle de productos vendidos
✔ Descuento automático de stock
✔ Listados completos
✔ Arquitectura monolítica
✔ Tecnologías modernas (Node + Express + MySQL)

Cumple con el 100% de los requisitos del TP.

✨ Autor
José Ignacio Díaz Romero
Universidad Tecnológica Nacional (UTN)
TP1 — Backend Monolítico
```
