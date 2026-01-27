import * as fs from 'fs';
import * as path from 'path';

// Paths
const TOKEN_SOURCE = path.join(__dirname, '../../design/tokens/dinein.tokens.json');
const FLUTTER_OUTPUT = path.join(__dirname, '../../apps/flutter_customer/lib/core/design/tokens/generated_tokens.dart');
const PWA_OUTPUT = path.join(__dirname, '../../packages/ui-landing/src/tokens/generated.ts');

// Load Tokens
const tokens = JSON.parse(fs.readFileSync(TOKEN_SOURCE, 'utf-8'));

// --- Flutter Generator ---
function generateFlutter(tokens: any): string {
  const lines: string[] = [];
  lines.push('// GENERATED CODE - DO NOT MODIFY BY HAND');
  lines.push('// Source: dinein.tokens.json');
  lines.push('');
  lines.push('import \'dart:ui\';');
  lines.push('');
  lines.push('class DineInTokens {');
  lines.push('  DineInTokens._();');
  lines.push('');

  // Colors
  lines.push('  // Brand Colors');
  lines.push(`  static const Color brandPrimary = Color(0xFF${tokens.brand.primary.replace('#', '')});`);
  lines.push(`  static const Color brandOnPrimary = Color(0xFF${tokens.brand.onPrimary.replace('#', '')});`);
  lines.push(`  static const Color brandAccent = Color(0xFF${tokens.brand.accent.replace('#', '')});`);
  lines.push('');

  lines.push('  // Surfaces');
  lines.push(`  static const Color surfaceBackground = Color(0xFF${tokens.surface.background.replace('#', '')});`);
  lines.push(`  static const Color surfaceCard = Color(0xFF${tokens.surface.card.replace('#', '')});`);
  lines.push('');

  lines.push('  // Status');
  lines.push(`  static const Color statusSuccess = Color(0xFF${tokens.status.success.replace('#', '')});`);
  lines.push(`  static const Color statusError = Color(0xFF${tokens.status.error.replace('#', '')});`);
  lines.push('');
  
  // Spacing (as doubles)
  lines.push('  // Spacing');
  for (const [key, value] of Object.entries(tokens.spacing)) {
    const pixels = parseFloat((value as string).replace('px', ''));
    lines.push(`  static const double spacing${capitalize(key)} = ${pixels}.0;`);
  }
  lines.push('');

  // Radii
  lines.push('  // Radii');
  for (const [key, value] of Object.entries(tokens.radii)) {
      const pixels = parseFloat((value as string).replace('px', ''));
      lines.push(`  static const double radius${capitalize(key)} = ${pixels}.0;`);
  }

  lines.push('}');
  return lines.join('\n');
}

// --- PWA (TypeScript) Generator ---
function generatePWA(tokens: any): string {
    const lines: string[] = [];
    lines.push('// GENERATED CODE - DO NOT MODIFY BY HAND');
    lines.push('// Source: dinein.tokens.json');
    lines.push('');
    lines.push('export const DineInTokens = {');
    
    // Brand
    lines.push('  brand: {');
    lines.push(`    primary: '${tokens.brand.primary}',`);
    lines.push(`    onPrimary: '${tokens.brand.onPrimary}',`);
    lines.push(`    accent: '${tokens.brand.accent}',`);
    lines.push('  },');

    // Spacing
    lines.push('  spacing: {');
    for (const [key, value] of Object.entries(tokens.spacing)) {
        lines.push(`    ${key}: '${value}',`);
    }
    lines.push('  },');

    // Radii
    lines.push('  radii: {');
    for (const [key, value] of Object.entries(tokens.radii)) {
        lines.push(`    ${key}: '${value}',`);
    }
    lines.push('  },');
    
    lines.push('} as const;');
    return lines.join('\n');
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Execute
console.log('Generating Flutter tokens...');
fs.writeFileSync(FLUTTER_OUTPUT, generateFlutter(tokens));
console.log(`Wrote: ${FLUTTER_OUTPUT}`);

console.log('Generating PWA tokens...');
fs.writeFileSync(PWA_OUTPUT, generatePWA(tokens));
console.log(`Wrote: ${PWA_OUTPUT}`);
