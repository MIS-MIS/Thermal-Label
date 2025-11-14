"use server";
import { printData, encoder, printLabel, LabelOptions } from '../lib/printer';

// Label printing action
export async function printLabelAction(
  content: string, 
  labelOptions: LabelOptions = {}
) {
  console.log('[🏷️ LABEL] Printing label with options:', labelOptions);
  
  try {
    const result = await printLabel(content, labelOptions);
    console.log('[🏷️ LABEL] Label print result:', result);
    return result;
  } catch (error) {
    console.error('[🏷️ LABEL] Label print failed:', error);
    throw error;
  }
}

export async function testPrinter(formData: FormData) {
  console.log('[🧾 THERMAL] Testing printer');

  let result = encoder
    .initialize()
    .text(`Testing ${new Date()}`)
    .newline()
    .encode();

  try {
    const printResult = await printData(result, { title: 'Test Print' });
    console.log('[🧾 THERMAL] Test print result:', printResult);
    return printResult;
  } catch (error) {
    console.error('[🧾 THERMAL] Test print failed:', error);
    throw error;
  }
}


export async function printImage(base64String: string) {
  console.log('[🧾 THERMAL] Image printing temporarily disabled due to canvas dependency');
  
  // Temporary placeholder for label printing focus
  return {
    success: false,
    error: 'Image printing disabled for label printing deployment',
    message: 'Use label printing instead for production deployment'
  };
  
  /* 
  // Original image printing code (disabled due to canvas build issues)
  try {
    const image = await loadImage(base64String);
    let result = encoder
      .initialize()
      .image(image, image.width, image.height, 'floydsteinberg')
      .encode();
    
    const printResult = await printData(result, { title: 'Photo Print' });
    console.log('[🧾 THERMAL] Image print result:', printResult);
    return printResult;
  } catch (error) {
    console.error('[🧾 THERMAL] Image print failed:', error);
    throw error;
  }
  */
}

export async function cutPaper() {
  console.log('[🧾 THERMAL] Cutting paper');
  
  try {
    let result = encoder
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('full')
      .encode();
    
    const printResult = await printData(result, { title: 'Cut Paper' });
    console.log('[🧾 THERMAL] Cut paper result:', printResult);
    return printResult;
  } catch (error) {
    console.error('[🧾 THERMAL] Cut paper failed:', error);
    throw error;
  }
}
