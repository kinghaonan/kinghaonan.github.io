/**
 * Vendor entry for @paper-design/shaders (Apache-2.0, © Lost Coast Labs / paper.design)
 * Bundles only what water-bg.js needs into an IIFE exposed as window.PaperShaders.
 *
 * Rebuild with:
 *   npx esbuild build/paper-shaders-entry.js --bundle --minify \
 *     --format=iife --outfile=source/js/paper-shaders.js
 */
import { ShaderMount } from '../node_modules/@paper-design/shaders/dist/shader-mount.js';
import { ShaderFitOptions } from '../node_modules/@paper-design/shaders/dist/shader-sizing.js';
import { waterFragmentShader } from '../node_modules/@paper-design/shaders/dist/shaders/water.js';
import { getShaderColorFromString } from '../node_modules/@paper-design/shaders/dist/get-shader-color-from-string.js';

window.PaperShaders = { ShaderMount, ShaderFitOptions, waterFragmentShader, getShaderColorFromString };
