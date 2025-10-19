import { test, expect } from '@playwright/test';

test('WebGL Check', async ({ page }) => {
  console.log('\n🔍 Checking WebGL support...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  // Check WebGL support
  const webglCheck = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    if (!gl && !gl2) {
      return { supported: false, reason: 'No WebGL context available' };
    }
    
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    
    return {
      supported: true,
      webgl1: !!gl,
      webgl2: !!gl2,
      vendor: debugInfo ? gl?.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
      version: gl?.getParameter(gl.VERSION) || 'unknown',
      shadingLanguageVersion: gl?.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'unknown'
    };
  });
  
  console.log('WebGL Support:', webglCheck);
  
  // Navigate to GIS tab
  await page.click('text=3D Satellites');
  await page.waitForTimeout(5000);
  
  // Check Cesium's canvas
  const cesiumCanvasCheck = await page.evaluate(() => {
    const canvas = document.querySelector('.cesium-widget canvas') as HTMLCanvasElement;
    if (!canvas) return { found: false };
    
    // Try to get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    return {
      found: true,
      width: canvas.width,
      height: canvas.height,
      hasWebGL: !!gl || !!gl2,
      contextType: gl2 ? 'webgl2' : gl ? 'webgl' : 'none'
    };
  });
  
  console.log('\nCesium Canvas Check:', cesiumCanvasCheck);
  
  // Check for Cesium viewer object
  const cesiumViewerCheck = await page.evaluate(() => {
    const viewer = (window as any).cesiumViewer;
    if (!viewer) return { found: false };
    
    return {
      found: true,
      hasScene: !!viewer.scene,
      hasGlobe: !!viewer.scene?.globe,
      hasCamera: !!viewer.camera,
      sceneMode: viewer.scene?.mode
    };
  });
  
  console.log('\nCesium Viewer Check:', cesiumViewerCheck);
});

