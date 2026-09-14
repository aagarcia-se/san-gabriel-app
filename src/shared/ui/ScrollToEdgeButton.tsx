import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ChevronsDown, ChevronsUp } from 'lucide-react';

type Direccion = 'abajo' | 'arriba';

interface ScrollToBottomButtonProps {
  /**
   * Contenedor que hace scroll. Si no se pasa, el componente intenta
   * detectarlo solo (útil cuando el AppShell scrollea un <main> interno
   * en vez de la ventana) y, si no encuentra ninguno, cae a window.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /**
   * Elemento a partir del cual se permite mostrar el botón EN MÓVIL
   * (p. ej. el bloque de "Productos del pedido"). En desktop no aplica
   * — ahí se muestra en cuanto hay scroll disponible, como antes.
   * Si no se pasa, no hay restricción ni en móvil.
   */
  mobileActivationRef?: RefObject<HTMLElement | null>;
  /** Ancho de pantalla (px) por debajo del cual se considera "móvil". */
  mobileBreakpoint?: number;
  /** Cuánto contenido de sobra debe haber para que valga la pena mostrarlo. */
  threshold?: number;
  /** Cuánto tiempo (ms) después del último evento de scroll se considera "quieto". */
  inactividadMs?: number;
  bottomOffsetClassName?: string;
  rightOffsetClassName?: string;
  className?: string;
  /** Solo para depurar: fuerza que el botón se muestre. */
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

function buscarAncestroScrollable(nodo: HTMLElement | null): HTMLElement | null {
  let actual = nodo?.parentElement ?? null;
  while (actual && actual !== document.body && actual !== document.documentElement) {
    if (esScrolleable(actual)) return actual;
    actual = actual.parentElement;
  }
  return null;
}

/**
 * Botón flotante "inteligente":
 * - Sigue la dirección en la que estás scrolleando (si bajas, apunta y
 *   lleva hacia abajo; si subes, apunta y lleva hacia arriba).
 * - Solo aparece mientras hay actividad de scroll — se desvanece a los
 *   pocos segundos de estar quieto.
 * - Se oculta por completo al llegar al inicio o al final (ya no hace
 *   falta ahí).
 * - En móvil no aparece hasta pasar `mobileActivationRef` (p. ej. la
 *   sección de productos), y es un poco más chico.
 *
 * Se renderiza en un portal a document.body para que `position: fixed`
 * sea de verdad relativo a la ventana, sin importar si algún ancestro
 * del layout tiene `transform`.
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

  const [hayEspacioParaScroll, setHayEspacioParaScroll] = useState(false);
  const [cercaInicio, setCercaInicio] = useState(true);
  const [cercaFinal, setCercaFinal] = useState(false);
  const [direccion, setDireccion] = useState<Direccion>('abajo');
  const [estaScrolleando, setEstaScrolleando] = useState(false);
  const [esMobile, setEsMobile] = useState(false);
  const [pasoActivacion, setPasoActivacion] = useState(!mobileActivationRef);

  const ultimoScrollTop = useRef(0);
  const timeoutInactividad = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Detecta el contenedor real que scrollea.
  useEffect(() => {
    if (containerRef?.current) {
      setContenedor(containerRef.current);
      return;
    }
    setContenedor(buscarAncestroScrollable(anclaRef.current));
  }, [containerRef]);

  // Detecta si estamos en viewport móvil.
  useEffect(() => {
    function leerAncho() {
      setEsMobile(window.innerWidth < mobileBreakpoint);
    }
    leerAncho();
    window.addEventListener('resize', leerAncho);
    return () => window.removeEventListener('resize', leerAncho);
  }, [mobileBreakpoint]);

  // En móvil, espera a pasar la sección de productos antes de habilitarse.
  useEffect(() => {
    if (!mobileActivationRef?.current) {
      setPasoActivacion(true);
      return;
    }
    const el = mobileActivationRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Ya lo pasamos cuando su borde superior queda arriba del viewport.
        setPasoActivacion(entry.boundingClientRect.top <= 0);
      },
      { root: contenedor ?? null, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobileActivationRef, contenedor]);

  // Escucha el scroll: dirección, cercanía a los extremos, y actividad.
  useEffect(() => {
    const el = contenedor;
    const target: HTMLElement | Window = el ?? window;
    const margenBorde = 8;

    function leerScroll() {
      const scrollTop = el ? el.scrollTop : window.scrollY;
      const scrollHeight = el ? el.scrollHeight : document.documentElement.scrollHeight;
      const clientHeight = el ? el.clientHeight : window.innerHeight;

      setHayEspacioParaScroll(scrollHeight - clientHeight > threshold);
      setCercaInicio(scrollTop <= margenBorde);
      setCercaFinal(scrollTop + clientHeight >= scrollHeight - margenBorde);

      if (scrollTop > ultimoScrollTop.current + 2) {
        setDireccion('abajo');
      } else if (scrollTop < ultimoScrollTop.current - 2) {
        setDireccion('arriba');
      }
      ultimoScrollTop.current = scrollTop;

      setEstaScrolleando(true);
      if (timeoutInactividad.current) clearTimeout(timeoutInactividad.current);
      timeoutInactividad.current = setTimeout(() => {
        setEstaScrolleando(false);
      }, inactividadMs);
    }

    leerScroll();

    target.addEventListener('scroll', leerScroll, { passive: true });
    window.addEventListener('resize', leerScroll);

    return () => {
      target.removeEventListener('scroll', leerScroll);
      window.removeEventListener('resize', leerScroll);
      if (timeoutInactividad.current) clearTimeout(timeoutInactividad.current);
    };
  }, [contenedor, threshold, inactividadMs]);

  function irAlExtremo() {
    const el = contenedor;
    const destino = direccion === 'abajo' ? (el ? el.scrollHeight : document.documentElement.scrollHeight) : 0;

    if (el) {
      el.scrollTo({ top: destino, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: destino, behavior: 'smooth' });
    }
  }

  const gatePorSeccionMovil = !esMobile || pasoActivacion;

  const visible =
    debugForzarVisible ||
    (hayEspacioParaScroll &&
      estaScrolleando &&
      !cercaInicio &&
      !cercaFinal &&
      gatePorSeccionMovil);

  const boton = visible && (
    <button
      type="button"
      onClick={irAlExtremo}
      aria-label={direccion === 'abajo' ? 'Ir hacia abajo' : 'Ir hacia arriba'}
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
      {/* Ancla invisible en el árbol normal: solo sirve para ubicar el
          contenedor real de scroll (no se porta a document.body). */}
      <span ref={anclaRef} aria-hidden className="sr-only" />

      {montado && boton && createPortal(boton, document.body)}
    </>
  );
}