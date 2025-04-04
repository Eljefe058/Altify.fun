import React, { useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, Info } from 'lucide-react';

interface TradingViewChartProps {
  data: any[];
  onHover?: (price: number | null) => void;
  isLoading?: boolean;
  error?: string | null;
  symbol?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingViewChart({ 
  data, 
  onHover,
  isLoading,
  error,
  symbol = 'SOL/USDT'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || isLoading || error) return;

    let isMounted = true;

    const initializeWidget = () => {
      if (!containerRef.current || !isMounted) return;

      try {
        // Format symbol for TradingView
        const formattedSymbol = symbol.replace('/', '');

        // Create new widget
        widgetRef.current = new window.TradingView.widget({
          container_id: containerRef.current.id,
          autosize: true,
          symbol: `RAYDIUM:${formattedSymbol}`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#2a2a2a',
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: false,
          withdateranges: true,
          hide_volume: false,
          height: 400,
          studies: [
            'Volume@tv-basicstudies',
            'MASimple@tv-basicstudies',
          ],
          disabled_features: [
            'header_symbol_search',
            'header_settings',
            'header_compare',
            'header_screenshot',
            'use_localstorage_for_settings',
            'symbol_search_hot_key',
            'timeframes_toolbar',
          ],
          enabled_features: [
            'create_volume_indicator_by_default',
            'hide_last_na_study_output',
            'side_toolbar_in_fullscreen_mode',
          ],
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': '#22c55e',
            'mainSeriesProperties.candleStyle.downColor': '#ef4444',
            'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
            'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
            'paneProperties.background': '#2a2a2a',
            'paneProperties.vertGridProperties.color': '#404040',
            'paneProperties.horzGridProperties.color': '#404040',
            'scalesProperties.textColor': '#d1d5db',
          },
          loading_screen: {
            backgroundColor: '#2a2a2a',
            foregroundColor: '#7a5cff',
          },
          library_path: 'https://charting-library.tradingview.com/charting_library/',
          charts_storage_url: 'https://saveload.tradingview.com',
          charts_storage_api_version: '1.1',
          client_id: 'tradingview.com',
          user_id: 'public_user',
          fullscreen: false,
          debug: false
        });

        // Handle price updates
        if (onHover && widgetRef.current) {
          widgetRef.current.onChartReady(() => {
            widgetRef.current.chart().crossHairMoved(({ price }: { price: number }) => {
              if (isMounted) {
                onHover(price || null);
              }
            });
          });
        }
      } catch (err) {
        console.error('Failed to initialize TradingView widget:', err);
      }
    };

    // Generate unique ID for container
    if (!containerRef.current.id) {
      containerRef.current.id = `tv_chart_${Math.random().toString(36).substring(7)}`;
    }

    // Load required scripts in order
    const loadScripts = async () => {
      if (window.TradingView) {
        initializeWidget();
        return;
      }

      try {
        // Load TradingView library first
        const libraryScript = document.createElement('script');
        libraryScript.type = 'text/javascript';
        libraryScript.src = 'https://s3.tradingview.com/tv.js';
        libraryScript.async = true;

        // Create a promise to wait for script load
        const loadPromise = new Promise((resolve, reject) => {
          libraryScript.onload = resolve;
          libraryScript.onerror = reject;
        });

        scriptRef.current = libraryScript;
        document.head.appendChild(libraryScript);

        // Wait for script to load
        await loadPromise;

        if (isMounted) {
          initializeWidget();
        }
      } catch (err) {
        console.error('Failed to load TradingView scripts:', err);
      }
    };

    loadScripts();

    // Cleanup function
    return () => {
      isMounted = false;

      // Clean up widget
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
          widgetRef.current = null;
        } catch (err) {
          console.warn('Error removing TradingView widget:', err);
        }
      }

      // Remove script only if we added it and no other charts are using it
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        const otherCharts = document.querySelectorAll('[id^="tv_chart_"]');
        if (otherCharts.length <= 1) {
          document.head.removeChild(scriptRef.current);
          scriptRef.current = null;
        }
      }
    };
  }, [symbol, isLoading, error, onHover]);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#7a5cff] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Failed to load chart data</span>
        </div>
      </div>
    );
  }

  // Show message if symbol doesn't exist
  if (!symbol) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center p-6">
        <Info className="w-8 h-8 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Chart will be available once trading starts
        </h3>
        <p className="text-gray-400 max-w-md">
          This token hasn't had any trading activity yet. 
          The price chart will appear automatically once trading begins.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-[#2a2a2a] rounded-lg overflow-hidden" ref={containerRef} />
  );
}