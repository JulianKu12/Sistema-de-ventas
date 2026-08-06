// Seed del Módulo 07 (docs/07-modulo-roles.md): crea, SI NO EXISTE YA, el
// único Usuario tipo=Administrador del sistema. Es idempotente: si ya existe
// un Administrador, no crea un segundo.
//
// Cómo correrlo:
//   cd backend
//   npm run db:seed        (o: npx prisma db seed)
//
// Credenciales de ejemplo (CAMBIARLAS DESPUÉS):
//   usuario:    admin
//   contraseña: admin123
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sembrado de datos demo (lonchería) SOLO si no hay productos registrados.
// Es idempotente: si ya existe catálogo, no crea nada. Cada ingrediente y cada
// producto de reventa directa queda con su Movimiento_Inventario de Entrada
// inicial, de modo que el stock se calcula igual que con el API real (docs/04).
async function sembrarDatosDemo() {
  const hayProductos = await prisma.producto.count()
  if (hayProductos > 0) {
    console.log('Ya hay productos registrados. No se crean datos demo.')
    return
  }

  const crearIngrediente = async (nombre, unidadMedida, stock, stockMinimoAlerta) => {
    const ing = await prisma.ingrediente.create({
      data: { nombre, unidadMedida, stockActual: stock, stockMinimoAlerta },
    })
    await prisma.movimiento_Inventario.create({
      data: { ingredienteId: ing.id, tipoMovimiento: 'Entrada', cantidad: stock },
    })
    return ing
  }

  const tortilla = await crearIngrediente('Tortilla', 'pieza', 120, 30)
  const huevo = await crearIngrediente('Huevo', 'pieza', 60, 15)
  const queso = await crearIngrediente('Queso', 'pieza', 80, 20)
  const jamon = await crearIngrediente('Jamón', 'pieza', 70, 20)
  const lechuga = await crearIngrediente('Lechuga', 'pieza', 40, 10)
  const tomate = await crearIngrediente('Tomate', 'pieza', 40, 10)
  const pan = await crearIngrediente('Pan', 'pieza', 40, 12)

  const crearProductoConReceta = async (nombre, precio, permiteMitadYMitad, receta) => {
    const producto = await prisma.producto.create({
      data: { nombre, precio, tipo: 'Con_receta', permiteMitadYMitad },
    })
    await prisma.producto_Ingrediente.createMany({
      data: receta.map((r) => ({
        productoId: producto.id,
        ingredienteId: r.ingrediente.id,
        cantidad: r.cantidad,
      })),
    })
    return producto
  }

  const crearProductoReventa = async (nombre, precio, stock) => {
    const producto = await prisma.producto.create({
      data: { nombre, precio, tipo: 'Reventa_directa', permiteMitadYMitad: false },
    })
    await prisma.movimiento_Inventario.create({
      data: { productoId: producto.id, tipoMovimiento: 'Entrada', cantidad: stock },
    })
    return producto
  }

  const crearModificador = async (nombre, tipo, ingredienteAfectado, dataExtra = {}) => {
    return prisma.modificador.create({
      data: { nombre, tipo, ingredienteAfectadoId: ingredienteAfectado.id, ...dataExtra },
    })
  }

  const crearCombo = async (nombre, precioEspecial, items) => {
    const combo = await prisma.combo.create({ data: { nombre, precioEspecial, estado: 'Activo' } })
    await prisma.combo_Producto.createMany({
      data: items.map((i) => ({ comboId: combo.id, productoId: i.producto.id, cantidad: i.cantidad })),
    })
    return combo
  }

  const tacoHuevo = await crearProductoConReceta('Taco de huevo', 12, false, [
    { ingrediente: tortilla, cantidad: 1 },
    { ingrediente: huevo, cantidad: 1 },
  ])
  const tacoQueso = await crearProductoConReceta('Taco de queso', 10, false, [
    { ingrediente: tortilla, cantidad: 1 },
    { ingrediente: queso, cantidad: 1 },
  ])
  const tacoJamon = await crearProductoConReceta('Taco de jamón', 12, false, [
    { ingrediente: tortilla, cantidad: 1 },
    { ingrediente: jamon, cantidad: 1 },
  ])
  const burrito = await crearProductoConReceta('Burrito de jamón y huevo', 25, true, [
    { ingrediente: tortilla, cantidad: 2 },
    { ingrediente: huevo, cantidad: 2 },
    { ingrediente: jamon, cantidad: 2 },
    { ingrediente: queso, cantidad: 1 },
  ])
  const quesadilla = await crearProductoConReceta('Quesadilla', 15, false, [
    { ingrediente: tortilla, cantidad: 2 },
    { ingrediente: queso, cantidad: 2 },
  ])
  const torta = await crearProductoConReceta('Torta', 20, false, [
    { ingrediente: pan, cantidad: 1 },
    { ingrediente: jamon, cantidad: 2 },
    { ingrediente: queso, cantidad: 1 },
    { ingrediente: lechuga, cantidad: 1 },
    { ingrediente: tomate, cantidad: 1 },
  ])

  const refresco = await crearProductoReventa('Refresco lata', 15, 48)
  const agua = await crearProductoReventa('Agua', 10, 36)

  const quesoExtra = await crearModificador('Agregar queso extra', 'Agregar', queso, {
    cantidadExtra: 1,
    costoAdicional: 5,
  })
  const jamonExtra = await crearModificador('Agregar jamón extra', 'Agregar', jamon, {
    cantidadExtra: 1,
    costoAdicional: 6,
  })
  const quitarQueso = await crearModificador('Quitar queso', 'Quitar', queso)
  const quitarTomate = await crearModificador('Quitar tomate', 'Quitar', tomate)

  const asociarModificador = async (producto, modificador) =>
    prisma.producto_Modificador.create({ data: { productoId: producto.id, modificadorId: modificador.id } })

  for (const p of [tacoHuevo, tacoJamon, burrito, quesadilla, torta]) await asociarModificador(p, quesoExtra)
  for (const p of [burrito, torta]) await asociarModificador(p, jamonExtra)
  for (const p of [burrito, quesadilla, torta]) await asociarModificador(p, quitarQueso)
  await asociarModificador(torta, quitarTomate)

  await crearCombo('Combo taco + refresco', 20, [
    { producto: tacoHuevo, cantidad: 1 },
    { producto: refresco, cantidad: 1 },
  ])

  console.log('Datos demo creados (ingredientes, productos, modificadores y un combo).')
}

async function main() {
  const existente = await prisma.usuario.findFirst({ where: { tipo: 'Administrador' } })
  if (existente) {
    console.log(`Ya existe un usuario Administrador ("${existente.usuario}"). No se crea otro.`)
  } else {
    const hash = await bcrypt.hash('admin123', 10)
    const admin = await prisma.usuario.create({
      data: {
        tipo: 'Administrador',
        nombre: 'Administrador',
        usuario: 'admin',
        contraseña: hash,
      },
    })
    console.log(`Usuario Administrador creado: usuario="admin", contraseña="admin123" (id=${admin.id}).`)
    console.log('IMPORTANTE: cambia la contraseña por defecto después del primer uso.')
  }

  await sembrarDatosDemo()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
