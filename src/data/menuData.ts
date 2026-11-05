import { MenuItem } from '../types';

// High-fidelity image assets generated for dishes and combos
export const MENU_ASSETS = {
  burgerCombo: '/src/assets/images/food_burger_combo_1793890998130.jpg',
  milanesa: '/src/assets/images/food_milanesa_napolitana_1793890999522.jpg',
  pizza: '/src/assets/images/food_pizza_muzzarella_1793890999619.jpg',
  empanadasBeer: '/src/assets/images/food_empanadas_craftbeer_1793890999732.jpg',
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- COMBOS & PROMOS ---
  {
    id: 'combo-burger-doble',
    name: 'Combo Burger Smash Doble + Fritas + Gaseosa',
    price: 9200,
    category: 'Combos y Promos',
    iconName: 'burger',
    image: MENU_ASSETS.burgerCombo,
    description: 'Doble medallón 100% novillo seleccionado, queso cheddar fundido, panceta ahumada crocante, pan brioche tostado con manteca, porción de papas rústicas y gaseosa de 500ml.',
    isCombo: true,
    comboIncludes: [
      '1x Burger Doble Cheddar & Bacon',
      '1x Papas Fritas Rústicas',
      '1x Gaseosa 500ml a elección'
    ],
    badge: 'Ahorro 20%',
    popular: true,
  },
  {
    id: 'combo-pareja-pizza',
    name: 'Combo Pareja: Pizza Muzzarella + 2 Cervezas 1L',
    price: 12500,
    category: 'Combos y Promos',
    iconName: 'pizza',
    image: MENU_ASSETS.pizza,
    description: 'Pizza grande artesanal de 8 porciones a la piedra con abundante muzzarella fundida, aceitunas verdes y orégano fresco, acompañada por 2 Cervezas Quilmes de 1 Litro bien frías.',
    isCombo: true,
    comboIncludes: [
      '1x Pizza Muzzarella Especial (8 porc.)',
      '2x Cervezas Quilmes Clásicas (1 Litro)'
    ],
    badge: 'Ideal 2 Personas',
    popular: true,
  },
  {
    id: 'combo-ejecutivo-porteno',
    name: 'Menú Ejecutivo: Milanesa Napolitana + Bebida + Postre',
    price: 11400,
    category: 'Combos y Promos',
    iconName: 'utensils',
    image: MENU_ASSETS.milanesa,
    description: 'Nuestra clásica suprema o milanesa de carne empanada a mano, jamón cocido premium, salsa pomodoro casera, muzzarella gratinada al horno, papas bastón, bebida 500ml y flan con dulce de leche.',
    isCombo: true,
    comboIncludes: [
      '1x Milanesa Napolitana con Fritas',
      '1x Gaseosa o Agua 500ml',
      '1x Flan Casero con Dulce de Leche'
    ],
    badge: 'Almuerzo Completo',
    popular: true,
  },
  {
    id: 'combo-picada-amigos',
    name: 'Combo Picada Amigos: 4 Empanadas + Papas Cheddar + Cerveza 1L',
    price: 10800,
    category: 'Combos y Promos',
    iconName: 'beer',
    image: MENU_ASSETS.empanadasBeer,
    description: '4 empanadas criollas de carne suave cortada a cuchillo, fuente abundante de papas fritas con cheddar fundido y panceta crujiente, junto a una cerveza de 1 Litro.',
    isCombo: true,
    comboIncludes: [
      '4x Empanadas Criollas a Cuchillo',
      '1x Papas Fritas con Cheddar y Panceta',
      '1x Cerveza Quilmes Clásica (1 Litro)'
    ],
    badge: 'Para Compartir',
  },

  // --- COMIDAS ---
  {
    id: 'milanesa-napo',
    name: 'Milanesa Napolitana con Fritas',
    price: 7800,
    category: 'Comidas',
    iconName: 'utensils',
    image: MENU_ASSETS.milanesa,
    description: 'Corte tierno de carne vacuna rebozado con pan rallado artesanal, cubierto de jamón cocido natural, salsa de tomate y abundante muzzarella fundida con orégano.',
    popular: true,
  },
  {
    id: 'hamburguesa-completa',
    name: 'Hamburguesa Doble con Cheddar y Bacon',
    price: 6500,
    category: 'Comidas',
    iconName: 'burger',
    image: MENU_ASSETS.burgerCombo,
    description: 'Dos medallones de carne vacuna smasheados (110g c/u), doble cheddar derretido, panceta ahumada frita, cebolla morada y salsa especial de la casa en pan de papa.',
  },
  {
    id: 'pizza-muzzarella',
    name: 'Pizza Muzzarella Especial (8 porciones)',
    price: 7200,
    category: 'Comidas',
    iconName: 'pizza',
    image: MENU_ASSETS.pizza,
    description: 'Masa madre de fermentación lenta, salsa pomodoro italiana, 400g de muzzarella de primera calidad, olivas verdes seleccionadas y lluvia de orégano.',
  },
  {
    id: 'empanada-carne',
    name: 'Empanada Criolla de Carne a Cuchillo',
    price: 1400,
    category: 'Comidas',
    iconName: 'hotdog',
    image: MENU_ASSETS.empanadasBeer,
    description: 'Relleno jugoso de carne cortada a cuchillo, cebolla de verdeo, huevo duro y pimentón dulce en masa hojaldrada horneada.',
  },

  // --- ACOMPAÑAMIENTOS Y POSTRES ---
  {
    id: 'papas-cheddar',
    name: 'Papas Fritas con Cheddar y Panceta',
    price: 3900,
    category: 'Acompañamientos y Postres',
    iconName: 'salad',
    image: MENU_ASSETS.burgerCombo,
    description: 'Papas bastón extra crujientes bañadas en generosa salsa de queso cheddar y ciboulette fresco con crocante de panceta ahumada.',
  },
  {
    id: 'flan-mixto',
    name: 'Flan Casero con Dulce de Leche y Crema',
    price: 2600,
    category: 'Acompañamientos y Postres',
    iconName: 'cake',
    image: MENU_ASSETS.milanesa,
    description: 'Receta tradicional con 8 yemas y caramelo rubio, servido con generosa cucharada de dulce de leche colonial y crema chantilly fresca batida en el momento.',
  },

  // --- BEBIDAS ---
  {
    id: 'cerveza-quilmes',
    name: 'Cerveza Quilmes Clásica (1 Litro)',
    price: 3800,
    category: 'Bebidas',
    iconName: 'beer',
    image: MENU_ASSETS.empanadasBeer,
    description: 'Cerveza rubia lager argentina, servida en hielera a temperatura perfecta (0 a 2 °C).',
  },
  {
    id: 'gaseosa-coca',
    name: 'Gaseosa Coca-Cola / Sprite (500ml)',
    price: 2200,
    category: 'Bebidas',
    iconName: 'soda',
    image: MENU_ASSETS.burgerCombo,
    description: 'Botella de 500ml bien fría. Opciones disponibles: Coca-Cola original, Sin Azúcar, Sprite o Fanta.',
  },
];
