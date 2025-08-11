import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Perform calculations
    const calculations = performCalculations(data);
    
    return NextResponse.json({
      success: true,
      data,
      calculations,
      message: 'File processed successfully'
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

function performCalculations(data: any[]) {
  const numericFields = ['amount', 'price', 'quantity', 'total'];
  const calculations: any = {};
  
  numericFields.forEach(field => {
    const values = data.map(row => parseFloat(row[field]) || 0).filter(v => !isNaN(v));
    if (values.length > 0) {
      calculations[field] = {
        sum: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }
  });
  
  return calculations;
}
