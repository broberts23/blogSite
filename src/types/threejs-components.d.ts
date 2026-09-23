declare module 'threejs-components/build/cursors/tubes1.min.js' {
  type TubesCursorOptions = {
    bloom?: false | { threshold?: number; strength?: number; radius?: number };
    sleepRadiusX?: number;
    sleepRadiusY?: number;
    sleepTimeScale1?: number;
    sleepTimeScale2?: number;
    tubes?: {
      colors?: string[];
      lights?: {
        intensity?: number;
        colors?: string[];
      };
    };
  };

  type TubesCursorApp = {
    three?: {
      scene?: { background: unknown };
      resize?: () => void;
      renderer?: {
        setClearColor?: (color: number, alpha?: number) => void;
        setClearAlpha?: (alpha: number) => void;
      };
    };
    tubes?: {
      setColors?: (colors: string[]) => void;
      setLightsColors?: (colors: string[]) => void;
    };
    dispose?: () => void;
  };

  export default function TubesCursor(
    canvas: HTMLCanvasElement,
    options?: TubesCursorOptions,
  ): TubesCursorApp;
}
