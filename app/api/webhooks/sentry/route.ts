import { takeScreenshot } from '@/actions/screenshot';
import { testPrinter, printImage, cutPaper } from '@/actions/print';
import { encoder, printData } from '@/lib/printer';
import { writeFile } from 'fs/promises';

// Sentry webhook handler
export async function POST(request: Request) {
  const url = new URL(request.url);
  
  // Handle printing API endpoints
  if (url.pathname.includes('/api/print')) {
    return handlePrintAPI(request);
  }
  
  // Original Sentry webhook logic
  console.log(`[🔔 WEBHOOK] GET request received`);
  const body = await request.json();
  if(body)  {
    writeFile(`./requests/${Date.now()}.json`, JSON.stringify(body, null, 2));
  }

  console.log(body);
  await takeScreenshot(body.data.issue.id);
  return new Response('OK');
}

// New API handler for HTML client
async function handlePrintAPI(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Simple authentication for internal company use
  const authToken = request.headers.get('Authorization') || request.headers.get('x-company-token');
  const expectedToken = process.env.COMPANY_AUTH_TOKEN || 'thermal-internal-2024';
  
  if (authToken !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    if (pathname.includes('/api/print/text')) {
      // Print text message
      const { text, title } = body;
      const result = encoder
        .initialize()
        .text(text || 'Hello from Thermal Printer!')
        .newline()
        .newline()
        .encode();
      
      const printResult = await printData(result, { title: title || 'Text Print' });
      return new Response(JSON.stringify(printResult), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.includes('/api/print/image')) {
      // Print image (base64)
      const { image, title } = body;
      const printResult = await printImage(image);
      return new Response(JSON.stringify(printResult), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.includes('/api/print/test')) {
      // Test printer
      const printResult = await testPrinter(new FormData());
      return new Response(JSON.stringify(printResult), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.includes('/api/print/cut')) {
      // Cut paper
      const printResult = await cutPaper();
      return new Response(JSON.stringify(printResult), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown print endpoint' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[🧾 THERMAL] Print API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Print failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
