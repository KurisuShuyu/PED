# PED
Palvi Executive Dashboard(PED)

Palvi Executive Dashboard

1. Decisiones técnicas: qué elegiste y por qué

Para construir este dashboard bajo la restricción de tiempo (~3 horas) y enfocado en el caso de uso del Jefe de Ventas (obtener insights en menos de 5 minutos antes de una reunión), tomé las siguientes decisiones:

Procesamiento 100% en el Cliente (Frontend): Dado el tamaño manejable del archivo metrics.json, decidí que el procesamiento de datos se haga directamente en el navegador. Esto elimina la necesidad de configurar y desplegar una API backend, optimizando el tiempo de desarrollo y simplificando las instrucciones para correr el proyecto localmente.

React + Tailwind CSS: Elegí React por la velocidad para componentizar la interfaz y Tailwind CSS para garantizar un diseño estrictamente Mobile-First. El Jefe de Ventas probablemente revisará esto en su celular, por lo que la interfaz debe ser fluida y responsiva sin tener que escribir archivos CSS separados.

Comparación de Periodos (Mes vs Mes) en lugar de Día vs Día: Decidí agrupar los datos y compararlos mensualmente en lugar de permitir seleccionar días sueltos. Comparar un martes con un domingo genera falsas alarmas ("las ventas cayeron un 80%"). Comparar el rendimiento general de dos meses da una tendencia real y accionable.

Detección Dinámica de Estructuras y Completitud: Diseñé la lógica (useMemo) para que infiera las llaves del JSON, detecte dónde están los arreglos de datos (sin importar si se llaman data o series) e identifique si un mes está incompleto (ej. el mes en que inicia o termina el dataset) resaltándolo en la UI para evitar decisiones basadas en datos parciales.

Alerta Ejecutiva (Foco del Día): Para resolver el requerimiento de "saber dónde poner el foco hoy", programé una lógica que escanea todas las métricas, calcula su cambio porcentual y destaca la métrica con el desempeño más crítico según su propiedad direction (higher_is_better o lower_is_better).

2. Segunda iteración: qué dejarías para después y por qué

Si tuviera más tiempo para una segunda iteración, priorizaría lo siguiente:

Filtros de tiempo granulares (Date Range Pickers): Aunque la comparación mensual es sólida, en una v2 implementaría la opción de seleccionar "Últimos 7 días" o "Últimos 14 días". Esto requeriría librerías adicionales como date-fns para manejar las comparaciones de periodos relativos considerando años bisiestos y diferentes husos horarios de forma segura.

Tests Unitarios y E2E: Dejé fuera la escritura de pruebas por la restricción de tiempo. En un entorno de producción B2B, es vital tener tests unitarios (con Jest/Vitest) para las funciones que calculan los porcentajes de cambio y KPIs, garantizando que nunca se le muestre información financiera incorrecta al Jefe de Ventas.

Persistencia de Estado en la URL (URL Search Params): Implementaría que los filtros (Dataset activo, Mes A, Mes B) se guarden en la URL de la página. Esto permitiría que el Jefe de Ventas copie el enlace de un escenario preocupante (ej. Dataset B con caída en soporte) y se lo envíe por Slack a su equipo para que todos vean exactamente la misma vista al abrir la app.
