import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ChevronsDown, ChevronsUp } from 'lucide-react';

type Direccion = 'abajo' | 'arriba';

interface ScrollToBottomButtonProps {
  /**
   * Contenedor que hace scroll.
   * Si no se pasa, el componente intenta detectarlo automáticamente.
   */
  containerRef?: RefObject<HTMLElement | null>;

  /**
   * Elemento a partir del cual se permite mostrar el botón EN MÓVIL.
   * Por ejemplo, el bloque de "Productos del pedido".
   *
   * En desktop esta restricción no aplica.
   */
  mobileActivationRef?: RefObject<HTMLElement | null>;

  /** Ancho de pantalla por debajo del cual se considera móvil. */
  mobileBreakpoint?: number;

  /** Cantidad mínima de contenido adicional para mostrar el botón. */
  threshold?: number;

  /** Tiempo sin scroll después del cual se oculta el botón. */
  inactividadMs?: number;

  bottomOffsetClassName?: string;
  rightOffsetClassName?: string;
  className?: string;

  /** Solo para depuración: fuerza que el botón se muestre. */
  debugForzarVisible?: boolean;
}

function esScrolleable(el: HTMLElement): boolean {
  const estilo = window.getComputedStyle(el);
  const overflowY = estilo.overflowY;

  return (
    (overflowY === 'auto' || overflowY === 'scroll') &&
    el.scrollHeight > el.clientHeight + 1
  );
}

function buscarAncestroScrollable(
  nodo: HTMLElement | null,
): HTMLElement | null {
  let actual = nodo?.parentElement ?? null;

  while (
    actual &&
    actual !== document.body &&
    actual !== document.documentElement
  ) {
    if (esScrolleable(actual)) {
      return actual;
    }

    actual = actual.parentElement;
  }

  return null;
}

/**
 * Botón flotante inteligente:
 *
 * - Si bajas, muestra flechas hacia abajo.
 * - Si subes, muestra flechas hacia arriba.
 * - Solo aparece mientras existe actividad de scroll.
 * - Se oculta después de unos milisegundos sin movimiento.
 * - No aparece al inicio ni al final.
 * - En móvil puede esperar a que se pase una sección determinada.
 * - Se renderiza mediante portal en document.body.
 */
export function ScrollToBottomButton({
  containerRef,
  mobileActivationRef,
  mobileBreakpoint = 768,
  threshold = 240,
  inactividadMs = 1200,
  bottomOffsetClassName = 'bottom-24',
  rightOffsetClassName = 'right-6 sm:right-10',
  className = '',
  debugForzarVisible = false,
}: ScrollToBottomButtonProps) {
  const anclaRef = useRef<HTMLSpanElement>(null);

  const [contenedor, setContenedor] = useState<HTMLElement | null>(null);
  const [montado, setMontado] = useState(false);

  const [hayEspacioParaScroll, setHayEspacioParaScroll] =
    useState(false);

  const [cercaInicio, setCercaInicio] = useState(true);

  const [cercaFinal, setCercaFinal] = useState(false);

  const [direccion, setDireccion] =
    useState<Direccion>('abajo');

  const [estaScrolleando, setEstaScrolleando] =
    useState(false);

  const [esMobile, setEsMobile] = useState(false);

  const [pasoActivacion, setPasoActivacion] =
    useState(!mobileActivationRef);

  const ultimoScrollTop = useRef(0);

  const timeoutInactividad =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Indica que el componente ya está montado.
   */
  useEffect(() => {
    setMontado(true);
  }, []);

  /**
   * Detecta cuál es el elemento que realmente hace scroll.
   *
   * Si se proporciona containerRef, usamos ese directamente.
   *
   * Si no, buscamos un ancestro con overflow-y auto/scroll.
   */
  useEffect(() => {
    if (containerRef?.current) {
      setContenedor(containerRef.current);
      return;
    }

    const detectarContenedor = () => {
      const encontrado = buscarAncestroScrollable(
        anclaRef.current,
      );

      if (encontrado) {
        setContenedor(encontrado);
      }
    };

    // Primer intento.
    detectarContenedor();

    // Segundo intento por si el layout todavía no terminó
    // de aplicar sus estilos de overflow.
    const frame = requestAnimationFrame(() => {
      detectarContenedor();
    });

    const timer = setTimeout(() => {
      detectarContenedor();
    }, 100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [containerRef]);

  /**
   * Detecta si estamos en móvil.
   */
  useEffect(() => {
    function leerAncho() {
      setEsMobile(
        window.innerWidth < mobileBreakpoint,
      );
    }

    leerAncho();

    window.addEventListener(
      'resize',
      leerAncho,
    );

    return () => {
      window.removeEventListener(
        'resize',
        leerAncho,
      );
    };
  }, [mobileBreakpoint]);

  /**
   * En móvil:
   *
   * El botón se habilita cuando la parte superior
   * de mobileActivationRef ya pasó el borde superior
   * del contenedor que hace scroll.
   *
   * Esto evita el problema de comparar contra el viewport
   * cuando realmente el scroll pertenece a un <main>.
   */
  useEffect(() => {
    if (!mobileActivationRef?.current) {
      setPasoActivacion(true);
      return;
    }

    const activationEl =
      mobileActivationRef.current;

    function comprobarActivacion() {
      const rect =
        activationEl.getBoundingClientRect();

      if (contenedor) {
        const containerRect =
          contenedor.getBoundingClientRect();

        /**
         * Se considera activado cuando la sección
         * ya pasó el borde superior del contenedor.
         */
        setPasoActivacion(
          rect.top <= containerRect.top,
        );
      } else {
        /**
         * Si el scroll es el de window,
         * comparamos contra el viewport.
         */
        setPasoActivacion(
          rect.top <= 0,
        );
      }
    }

    comprobarActivacion();

    const target: HTMLElement | Window =
      contenedor ?? window;

    target.addEventListener(
      'scroll',
      comprobarActivacion,
      {
        passive: true,
      },
    );

    window.addEventListener(
      'resize',
      comprobarActivacion,
    );

    return () => {
      target.removeEventListener(
        'scroll',
        comprobarActivacion,
      );

      window.removeEventListener(
        'resize',
        comprobarActivacion,
      );
    };
  }, [
    mobileActivationRef,
    contenedor,
  ]);

  /**
   * Escucha el scroll:
   *
   * - determina dirección
   * - determina si hay suficiente contenido
   * - determina si estamos cerca del inicio
   * - determina si estamos cerca del final
   * - controla el estado de actividad
   */
  useEffect(() => {
    const el = contenedor;

    const target: HTMLElement | Window =
      el ?? window;

    const margenBorde = 8;

    function leerScroll() {
      const scrollTop = el
        ? el.scrollTop
        : window.scrollY;

      const scrollHeight = el
        ? el.scrollHeight
        : document.documentElement.scrollHeight;

      const clientHeight = el
        ? el.clientHeight
        : window.innerHeight;

      /**
       * ¿Existe suficiente contenido adicional
       * como para que tenga sentido mostrar el botón?
       */
      setHayEspacioParaScroll(
        scrollHeight - clientHeight > threshold,
      );

      /**
       * ¿Estamos cerca del inicio?
       */
      setCercaInicio(
        scrollTop <= margenBorde,
      );

      /**
       * ¿Estamos cerca del final?
       */
      setCercaFinal(
        scrollTop + clientHeight >=
          scrollHeight - margenBorde,
      );

      /**
       * Determina dirección del scroll.
       */
      if (
        scrollTop >
        ultimoScrollTop.current + 2
      ) {
        setDireccion('abajo');
      } else if (
        scrollTop <
        ultimoScrollTop.current - 2
      ) {
        setDireccion('arriba');
      }

      ultimoScrollTop.current =
        scrollTop;

      /**
       * Se considera que hay actividad.
       */
      setEstaScrolleando(true);

      /**
       * Reinicia el temporizador.
       */
      if (timeoutInactividad.current) {
        clearTimeout(
          timeoutInactividad.current,
        );
      }

      timeoutInactividad.current =
        setTimeout(() => {
          setEstaScrolleando(false);
        }, inactividadMs);
    }

    /**
     * Ejecutamos inmediatamente para establecer
     * correctamente el estado inicial.
     */
    leerScroll();

    target.addEventListener(
      'scroll',
      leerScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      'resize',
      leerScroll,
    );

    return () => {
      target.removeEventListener(
        'scroll',
        leerScroll,
      );

      window.removeEventListener(
        'resize',
        leerScroll,
      );

      if (timeoutInactividad.current) {
        clearTimeout(
          timeoutInactividad.current,
        );
      }
    };
  }, [
    contenedor,
    threshold,
    inactividadMs,
  ]);

  /**
   * Lleva el scroll al extremo correspondiente.
   */
  function irAlExtremo() {
    const el = contenedor;

    const destino =
      direccion === 'abajo'
        ? el
          ? el.scrollHeight
          : document.documentElement.scrollHeight
        : 0;

    if (el) {
      el.scrollTo({
        top: destino,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: destino,
        behavior: 'smooth',
      });
    }
  }

  /**
   * En desktop no hay restricción por sección.
   *
   * En móvil:
   * solamente se permite después de pasar
   * mobileActivationRef.
   */
  const gatePorSeccionMovil =
    !esMobile || pasoActivacion;

  /**
   * Determina si el botón debe mostrarse.
   */
  const visible =
    debugForzarVisible ||
    (
      hayEspacioParaScroll &&
      estaScrolleando &&
      !cercaInicio &&
      !cercaFinal &&
      gatePorSeccionMovil
    );

  /**
   * Botón.
   */
  const boton =
    visible && (
      <button
        type="button"
        onClick={irAlExtremo}
        aria-label={
          direccion === 'abajo'
            ? 'Ir hacia abajo'
            : 'Ir hacia arriba'
        }
        className={`
          fixed
          ${rightOffsetClassName}
          ${bottomOffsetClassName}
          z-[100]
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-brand-500
          text-white
          shadow-lg
          shadow-brand-500/30
          transition-all
          duration-200
          hover:bg-brand-600
          active:scale-95
          md:h-12
          md:w-12
          ${className}
        `}
      >
        {direccion === 'abajo' ? (
          <ChevronsDown className="h-4 w-4 md:h-5 md:w-5" />
        ) : (
          <ChevronsUp className="h-4 w-4 md:h-5 md:w-5" />
        )}
      </button>
    );

  return (
    <>
      {/*
        Ancla invisible utilizada para detectar
        el contenedor real de scroll.
      */}
      <span
        ref={anclaRef}
        aria-hidden
        className="sr-only"
      />

      {/*
        Portal para que position: fixed sea relativo
        al viewport/document.body.
      */}
      {montado &&
        boton &&
        createPortal(
          boton,
          document.body,
        )}
    </>
  );
}