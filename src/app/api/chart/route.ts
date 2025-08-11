import { NextRequest, NextResponse } from 'next/server';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });

export async function POST(request: NextRequest) {
  try {
    const { data, chartType = 'bar', labels, values, title } = await request.json();
    
    const configuration: ChartConfiguration = {
      type: chartType as any,
      data: {
        labels: labels || data.map((item: any) => item.name || item.category || 'Item'),
        datasets: [{
          label: title || 'Values',
          data: values || data.map((item: any) => parseFloat(item.amount || item.value || item.total) || 0),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title || 'Chart'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    const image = await chartCanvas.renderToBuffer(configuration);
    
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="chart.png"'
      }
    });
  } catch (error) {
    console.error('Error generating chart:', error);
    return NextResponse.json({ error: 'Failed to generate chart' }, { status: 500 });
  }
}
