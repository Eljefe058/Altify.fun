import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

interface BondingCurveChartProps {
  currentAmount: number;
  targetAmount: number;
  onHover?: (price: number | null) => void;
}

export default function BondingCurveChart({ currentAmount, targetAmount, onHover }: BondingCurveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#2a2a2a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#404040' },
        horzLines: { color: '#404040' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Generate bonding curve data points
    const data = [];
    const points = 100;
    const maxX = targetAmount * 1.2; // Show a bit more than target
    
    for (let i = 0; i <= points; i++) {
      const x = (maxX * i) / points;
      // Exponential bonding curve: y = x^2 / (2 * targetAmount)
      const y = (x * x) / (2 * targetAmount);
      data.push({ time: x, value: y });
    }

    // Add area series
    const areaSeries = chart.addAreaSeries({
      lineColor: '#7a5cff',
      topColor: '#7a5cff20',
      bottomColor: '#7a5cff05',
      lineWidth: 2,
    });

    areaSeries.setData(data);

    // Add current progress marker
    const markerSeries = chart.addLineSeries({
      color: '#7a5cff',
      lineWidth: 2,
      lineStyle: 2,
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
    });

    targetSeries.setData([
      { time: 0, value: 0 },
      { time: targetAmount, value: targetY },
    ]);

    // Set visible range
    chart.timeScale().setVisibleRange({
      from: 0,
      to: maxX,
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
  }, [currentAmount, targetAmount]);

  return (
    <div className="w-full" ref={chartContainerRef} />
  );
}