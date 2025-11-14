import net from 'node:net';

// Simple ESC/POS encoder without canvas dependency
class SimpleESCPOSEncoder {
  private buffer: number[] = [];

  // ESC/POS Command constants
  private commands = {
    ESC: 0x1B,
    GS: 0x1D,
    LF: 0x0A,
    CR: 0x0D,
    INIT: [0x1B, 0x40],
    ALIGN_CENTER: [0x1B, 0x61, 0x01],
    ALIGN_LEFT: [0x1B, 0x61, 0x00],
    BOLD_ON: [0x1B, 0x45, 0x01],
    BOLD_OFF: [0x1B, 0x45, 0x00],
    SIZE_NORMAL: [0x1B, 0x21, 0x00],
    SIZE_DOUBLE: [0x1B, 0x21, 0x30],
    CUT_FULL: [0x1D, 0x56, 0x00],
    FEED_LINES: [0x1B, 0x64]
  };

  initialize() {
    this.buffer.push(...this.commands.INIT);
    return this;
  }

  text(str: string) {
    const bytes = Buffer.from(str, 'utf8');
    this.buffer.push(...Array.from(bytes));
    return this;
  }

  newline(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(this.commands.LF);
    }
    return this;
  }

  align(alignment: 'left' | 'center' | 'right') {
    if (alignment === 'center') {
      this.buffer.push(...this.commands.ALIGN_CENTER);
    } else {
      this.buffer.push(...this.commands.ALIGN_LEFT);
    }
    return this;
  }

  bold(enable = true) {
    if (enable) {
      this.buffer.push(...this.commands.BOLD_ON);
    } else {
      this.buffer.push(...this.commands.BOLD_OFF);
    }
    return this;
  }

  size(width: number, height: number) {
    if (width === 2 || height === 2) {
      this.buffer.push(...this.commands.SIZE_DOUBLE);
    } else {
      this.buffer.push(...this.commands.SIZE_NORMAL);
    }
    return this;
  }

  feed(lines = 3) {
    this.buffer.push(...this.commands.FEED_LINES, lines);
    return this;
  }

  cut(type: 'full' | 'partial' = 'full') {
    this.buffer.push(...this.commands.CUT_FULL);
    return this;
  }

  barcode(data: string, type = 'CODE128') {
    // Simple barcode implementation
    this.align('center');
    this.text(`[BARCODE: ${data}]`);
    this.newline();
    return this;
  }

  raw(bytes: number[]) {
    this.buffer.push(...bytes);
    return this;
  }

  encode(): Buffer {
    return Buffer.from(this.buffer);
  }

  clear() {
    this.buffer = [];
    return this;
  }
}

// ESCPOS command to print "Hello, World!"
const helloWorldData = Buffer.from([
  0x1B, 0x40,        // Initialize printer
  0x1B, 0x21, 0x30,  // Select character size
  0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x2C, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A, // "Hello, World!\n"
]);

const PORT = 9100; // Most printers use port 9100
const HOST = '192.168.1.87'; // The IP address of the printer, I got this by holding the feed button on the printer while turning it on

// Cloud printing configuration
const CLOUD_MODE = process.env.NODE_ENV === 'production' || process.env.CLOUD_PRINTING === 'true';
const PRINTNODE_API_KEY = process.env.PRINTNODE_API_KEY;
const CLOUD_PRINTER_ID = process.env.CLOUD_PRINTER_ID || 'default-thermal';


const printerClientSingleton = () => {
  console.log('Creating new socket...');
  return new net.Socket();
}


// This singleton pattern is used to ensure that the client is only created once and reused across hot reloads in Next.js
export const client = globalThis.printerClientGlobal ?? printerClientSingleton();
globalThis.printerClientGlobal = client;

if (!globalThis.printerConnected) {
  console.log('[🧾 THERMAL] Connecting to printer for the first time');
  client.connect(PORT, HOST, () => {
    globalThis.printerConnected = true;
    console.log('[🧾 THERMAL] Connected to printer');
  });
}


client.on('data', (data) => {
  console.log('[🧾 THERMAL] Received:', data.toString('hex'));
});

client.on('error', (err) => {
  console.error('[🧾 THERMAL] Error connecting to printer:', err);
});

client.on('close', () => {
  console.log('[🧾 THERMAL] Disconnected from printer');
});

const socketEvents = ['close',
  'connectionAttempt',
  'connectionAttemptFailed',
  'connectionAttemptTimeout',
  'drain',
  'end',
  'lookup',
  'connect',
  'ready',
  'timeout'];

socketEvents.forEach((event) => {
  client.on(event, (data) => {
    console.log('[🧾 THERMAL] Event:', event);
  });
});


declare const globalThis: {
  printerClientGlobal: ReturnType<typeof printerClientSingleton>;
  printerConnected: boolean;
} & typeof global;


export const encoder = new SimpleESCPOSEncoder();

// Label printing helper functions
export function createLabelEncoder(options: LabelOptions) {
  const labelEncoder = new SimpleESCPOSEncoder();
  
  // Initialize printer
  labelEncoder.initialize();
  
  // Set label size if specified
  if (options.width && options.height) {
    // ESC/POS commands for label size (varies by printer model)
    labelEncoder.raw([0x1B, 0x28, 0x4C, 0x08, 0x00, 0x30, 0x30]); // Label mode
  }
  
  return labelEncoder;
}

// Create formatted label content
export function formatLabelContent(content: string, options: LabelOptions) {
  const encoder = createLabelEncoder(options);
  
  // Add content based on label type
  switch (options.labelType) {
    case 'address':
      encoder
        .align('left')
        .size(1, 1)
        .text(content)
        .newline();
      break;
      
    case 'shipping':
      encoder
        .align('center')
        .size(2, 2)
        .bold(true)
        .text(content)
        .bold(false)
        .newline();
      break;
      
    case 'barcode':
      encoder
        .align('center')
        .text(content)
        .newline()
        .barcode(content, 'CODE128', { width: 2, height: 100 })
        .newline();
      break;
      
    default: // custom
      encoder
        .align('center')
        .text(content)
        .newline();
  }
  
  // Add spacing for label
  encoder.newline().newline();
  
  return encoder.encode();
}

// Print multiple copies
export async function printLabel(content: string, options: LabelOptions) {
  const copies = options.copies || 1;
  const labelData = formatLabelContent(content, options);
  
  console.log(`[🏷️ LABEL] Printing ${copies} copies of ${options.labelType || 'custom'} label`);
  
  // For cloud printing, send once with copies option
  if (CLOUD_MODE) {
    return await printData(labelData, options);
  } else {
    // For local printing, send multiple times
    const results = [];
    for (let i = 0; i < copies; i++) {
      const result = await printData(labelData, { 
        ...options, 
        title: `${options.title || 'Label'} (${i + 1}/${copies})` 
      });
      results.push(result);
      
      // Small delay between copies for local printing
      if (i < copies - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return results;
  }
}

// Label printing configuration
export interface LabelOptions {
  width?: number;      // Label width in mm (e.g., 58, 80)
  height?: number;     // Label height in mm (e.g., 30, 50)
  copies?: number;     // Number of copies to print
  title?: string;      // Print job title
  labelType?: 'address' | 'shipping' | 'barcode' | 'custom';
}

// Cloud printing service function
export async function sendToCloudPrinter(escPosData: Buffer, options: LabelOptions = {}) {
  if (!CLOUD_MODE) {
    throw new Error('Cloud printing not enabled');
  }

  if (!PRINTNODE_API_KEY) {
    console.warn('[🧾 THERMAL] No PrintNode API key, simulating cloud print...');
    // Simulate successful cloud printing for development
    console.log('[🧾 THERMAL] Would print to cloud:', escPosData.length, 'bytes');
    return { success: true, jobId: `sim-${Date.now()}` };
  }

  try {
    const response = await fetch('https://api.printnode.com/printjobs', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(PRINTNODE_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        printerId: CLOUD_PRINTER_ID,
        title: options.title || 'Label Print Job',
        contentType: 'raw_base64',
        content: escPosData.toString('base64'),
        source: 'Label Printer App',
        options: {
          copies: options.copies || 1,
          media: options.width && options.height ? `${options.width}x${options.height}mm` : undefined,
          'fit-to-page': false,
          'paper-size': options.labelType || 'custom'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PrintNode API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[🧾 THERMAL] Cloud print successful:', result);
    return { success: true, jobId: result.id };
  } catch (error) {
    console.error('[🧾 THERMAL] Cloud printing failed:', error);
    throw error;
  }
}

// Universal printing function that works both locally and in cloud
export async function printData(data: Buffer, options: LabelOptions = {}) {
  if (CLOUD_MODE) {
    return await sendToCloudPrinter(data, options);
  } else {
    // Local printing via TCP socket
    return new Promise((resolve, reject) => {
      if (!client || !globalThis.printerConnected) {
        reject(new Error('Local printer not connected'));
        return;
      }
      
      client.write(data, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('[🧾 THERMAL] Local print successful');
          resolve({ success: true, jobId: `local-${Date.now()}` });
        }
      });
    });
  }
}
