(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Nicolás Perdomo Rodríguez",
    short: "Nicolás Perdomo",
    roles: ["Desarrollador", "Fundador", "Operador"],
    tagline: "3 plataformas en producción, una sola persona detrás.",
    location: "Neiva, Huila · Colombia",
    studio: "Code Repair Tech",
    site: "coderepairtech.site",

    contact: {
      whatsapp: "573219429385",
      waText: "Hola Nicolás, vi tu portafolio y quiero contarte lo que necesito.",
      email: "coderepairtech@gmail.com",
      correos: [
        { id: "proyectos", titulo: "Un proyecto",
          desc: "Necesitas que construya algo: una plataforma, una app, una integración.",
          email: "coderepairtech@gmail.com" },
        { id: "negocios", titulo: "Negocios y alianzas",
          desc: "Propuestas de trabajo, sociedades o construir algo juntos.",
          email: "coderepairtech@gmail.com" },
        { id: "hola", titulo: "Todo lo demás",
          desc: "Preguntas, prensa, o simplemente saludar.",
          email: "coderepairtech@gmail.com" }
      ]
    },

    stats: [
      { valor: 15,   sufijo: "",  label: "negocios conectados en GigantYa", tono: "orange" },
      { valor: 4713, sufijo: "",  label: "mensajes en una sola campaña",    tono: "green"  },
      { valor: 166,  sufijo: "",  label: "conversaciones respondidas",      tono: "gold"   },
      { valor: 3,    sufijo: "",  label: "plataformas en producción",       tono: "blue"   }
    ],

    pilares: [
      { n: "01", titulo: "Constructor de producto",
        texto: "Levanto plataformas completas: modelo de datos, backend, interfaz, marca y despliegue. No entrego un prototipo, entrego algo que la gente usa." },
      { n: "02", titulo: "Operador de infraestructura",
        texto: "VPS propios con Ubuntu, nginx, dominios, certificados y automatizaciones con cron. Los servidores donde corre todo esto los administro yo." },
      { n: "03", titulo: "Prestador de servicio",
        texto: "Campañas de WhatsApp y prospección de clientes para negocios, empresas y campañas electorales, usando la plataforma que ya construí." }
    ],

    casos: [
      {
        id: "gigantya",
        nombre: "GigantYa",
        tono: "orange",
        estado: "Producto propio · en operación",
        icono: "assets/img/gigantya-icon.webp",
        problema: "Ninguna app de domicilios llega a un municipio del tamaño de Gigante. Los restaurantes recibían pedidos por WhatsApp, los anotaban en papel y perdían la mitad entre el ruido de la cocina.",
        decision: "Suscripción fija en vez de comisión por pedido. Las apps grandes cobran entre 15% y 25% al restaurante y eso termina en el precio del cliente. Con suscripción, lo que ves en la app vale lo mismo que en el local. Eso fue lo que convenció a los primeros negocios de entrar.",
        resultado: "15 negocios conectados",
        resultadoDetalle: "Restaurantes, licores y mercado · pedidos entregados en producción",
        stack: ["Node.js", "MySQL", "PWA", "VPS Ubuntu", "nginx", "MercadoPago"],
        enlace: "https://gigantya.com",
        enlaceTexto: "gigantya.com",
        shots: [
          { src: "assets/img/gigantya-web.webp", alt: "Listado de negocios en GigantYa", tipo: "wide" },
          { src: "assets/img/gigantya-menu.webp", alt: "Menú de un restaurante en el celular", tipo: "phone" }
        ]
      },
      {
        id: "daemon",
        nombre: "Daemon Leads",
        tono: "green",
        estado: "Producto propio · servicio activo",
        icono: null,
        problema: "Contactar clientes en la región significa escribir por WhatsApp uno por uno. Un negocio que quiere llegar a 500 prospectos necesita dos días completos de una persona, y casi siempre abandona a la mitad.",
        decision: "Usar la API oficial de WhatsApp Business en vez de automatizar el WhatsApp normal. Es más difícil de montar y exige plantillas aprobadas por Meta, pero es la única forma de que la cuenta no termine bloqueada. Los envíos salen por lotes para respetar los límites diarios de conversaciones.",
        resultado: "4.713 mensajes en una campaña",
        resultadoDetalle: "166 conversaciones con respuesta · 111 leads encontrados vía Google Places",
        stack: ["Python", "Supabase", "WhatsApp Cloud API", "Google Places", "Webhooks"],
        enlace: null,
        shots: [
          { src: "assets/img/daemonleads-panel.webp", alt: "Panel de contactos y campañas de Daemon Leads", tipo: "wide" }
        ]
      },
      {
        id: "agrovalor",
        nombre: "AgroValor",
        tono: "gold",
        estado: "Producto propio · en operación",
        icono: "assets/img/agrovalor-icon.webp",
        problema: "El caficultor vende su carga sin saber si el precio que le ofrecen es justo. El precio interno lo publica la FNC, el internacional se mueve en ICE Futures, y nadie cruza los dos en un lugar que se entienda.",
        decision: "Mostrar primero lo único que importa: cuánto le pagan hoy por carga de 125 kg. El mercado internacional, la paridad de exportación y la proyección quedan debajo, para quien quiera profundizar. La proyección se marca explícitamente como estimación y no como garantía de compra.",
        resultado: "Precio en vivo, todos los días",
        resultadoDetalle: "Precio interno FNC + ICE Futures · calculadora, alertas y registro de ventas",
        stack: ["Python", "Supabase", "Series temporales", "Web app"],
        enlace: null,
        shots: [
          { src: "assets/img/agrovalor-panel.webp", alt: "Panel de precios del café en AgroValor", tipo: "wide" }
        ]
      }
    ],

    hitos: [
      { cuando: "Primer hito", titulo: "Primera plataforma en producción",
        texto: "Salir del entorno local y montar todo en un servidor propio: Ubuntu, nginx, dominio y certificado. La primera vez que algo que escribí quedó accesible desde cualquier celular del país." },
      { cuando: "GigantYa", titulo: "Negocios pagando suscripción",
        texto: "El paso de proyecto a operación: 15 comercios de Gigante conectados, con menús cargados, pedidos entrando y pagos por Nequi, DaviPlata, Bre-B y contraentrega." },
      { cuando: "Daemon Leads", titulo: "Primera campaña masiva",
        texto: "Más de 4.000 mensajes entregados en un solo envío por la API oficial de Meta, con 166 conversaciones que respondieron. Ahí Daemon Leads dejó de ser herramienta interna y pasó a ser servicio." },
      { cuando: "AgroValor", titulo: "El café, en tiempo real",
        texto: "Conectar el precio interno de la FNC con el mercado internacional de ICE Futures y ponerlo en una pantalla que un caficultor entienda en tres segundos." }
    ],

    aliados: [
      "Ceiba Coffee", "Amapola Hamburguesería", "Café del Pará", "Pare Tantico",
      "Mandarín Gourmet", "FlyingPig Burrito", "BiProtein", "Las Delicias del Gordo",
      "Supermercado Kairos", "Estanco de Licores Lalo", "Distri Gigante's"
    ],

    servicios: [
      { titulo: "Software a la medida",
        texto: "Plataformas web, PWA, paneles de administración e integraciones. Desde el modelo de datos hasta el servidor funcionando y el dominio apuntando.",
        precio: "Cotización por proyecto" },
      { titulo: "Campañas de WhatsApp",
        texto: "Tú das la lista y el mensaje, yo hago el envío con Daemon Leads desde la API oficial de Meta. Para negocios, empresas y campañas electorales.",
        precio: "$50 por texto · $100 con imagen o video" },
      { titulo: "Prospección de clientes",
        texto: "Búsqueda de negocios por rubro y ciudad, con teléfono verificado y enlace de WhatsApp listo. Te entrego la base para que la trabajes.",
        precio: "Según volumen y zona" },
      { titulo: "Infraestructura y despliegue",
        texto: "Montaje de VPS, nginx, dominios, certificados SSL y automatizaciones con cron. También rescato proyectos que quedaron a medias.",
        precio: "Por hora o por proyecto" }
    ]
  };
})();
