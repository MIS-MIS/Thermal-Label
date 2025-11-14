import { testPrinter, printImage, cutPaper, printLabelAction } from '../../../actions/print';
import { encoder, printData, LabelOptions } from '../../../lib/printer';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Simple authentication for internal company use
  const authToken = request.headers.get('Authorization') || request.headers.get('x-company-token');
  const expectedToken = process.env.COMPANY_AUTH_TOKEN || 'thermal-internal-2024';
  
  if (authToken !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-company-token, Authorization'
      }
    });
  }

  try {
    const body = await request.json();
    const action = searchParams.get('action') || 'text';

    if (action === 'text') {
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
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (action === 'label') {
      // Print label with custom options
      const { 
        content, 
        width, 
        height, 
        copies, 
        labelType, 
        title 
      } = body;

      const labelOptions: LabelOptions = {
        width: width || 58,
        height: height || 30,
        copies: copies || 1,
        labelType: labelType || 'custom',
        title: title || 'Custom Label'
      };

      const printResult = await printLabelAction(
        content || 'Sample Label', 
        labelOptions
      );

      return new Response(JSON.stringify({
        success: true,
        result: printResult,
        labelOptions: labelOptions
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (action === 'image') {
      // Print image (base64)
      const { image, title } = body;
      const printResult = await printImage(image);
      return new Response(JSON.stringify(printResult), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (action === 'test') {
      // Test printer
      const printResult = await testPrinter(new FormData());
      return new Response(JSON.stringify(printResult), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (action === 'cut') {
      // Cut paper
      const printResult = await cutPaper();
      return new Response(JSON.stringify(printResult), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use ?action=text|image|test|cut|label' }), { 
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[🧾 THERMAL] Print API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Print failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-company-token, Authorization',
    },
  });
}