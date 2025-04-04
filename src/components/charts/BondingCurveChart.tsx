import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatUSD, formatSOL } from '../../utils/price';

interface BondingCurveChartProps {
  data: any[];
  currentAmount: number;
  targetAmount: number;
  onHover?: (price: number | null) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function BondingCurveChart({ 
  data,
  currentAmount,
  targetAmount,
  onHover,
  isLoading,
  error
}: BondingCurveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || isLoading || error || !data.length) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#2a2a2a' },
        textColor: '#d1d5db',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#404040' },
        horzLines: { color: '#404040' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    // Add area series for bonding curve
    const areaSeries = chart.addAreaSeries({
      lineColor: '#7a5cff',
      topColor: 'rgba(122, 92, 255, 0.2)',
      bottomColor: 'rgba(122, 92, 255, 0.02)',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatUSD(price),
      },
    });

    areaSeries.setData(data);

    // Add current progress marker
    const markerSeries = chart.addLineSeries({
      color: '#7a5cff',
      lineWidth: 2,
      lineStyle: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatUSD(price),
      },
    });

    const currentY = (currentAmount * currentAmount) / (2 * targetAmount);
    markerSeries.setData([
      { time: 0, value: 0 },
      { time: currentAmount, value: currentY },
    ]);

    // Add target line
    const targetY = (targetAmount * targetAmount) / (2 * targetAmount);
    const targetSeries = chart.addLineSeries({
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatUSD(price),
      },
    });

    targetSeries.setData([
      { time: 0, value: 0 },
      { time: targetAmount, value: targetY },
    ]);

    // Set visible range
    chart.timeScale().setVisibleRange({
      from: 0,
      to: targetAmount * 1.2,
    });

    // Handle hover
    if (onHover) {
      chart.subscribeCrosshairMove(param => {
        const price = param.seriesData.get(areaSeries)?.value;
        onHover(price || null);
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    chartRef.current = chart;

    // Enable touch support for mobile
    chart.applyOptions({
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, currentAmount, targetAmount, isLoading, error]);

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

  if (!data.length) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <AlertTriangle className="w-5 h-5" />
          <span>No data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-[#2a2a2a] rounded-lg overflow-hidden" ref={chartContainerRef} />
  );
}